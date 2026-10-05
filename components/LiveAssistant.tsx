import React, { useState, useRef, useEffect } from 'react';

// Base64 encode/decode functions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

type SessionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

const LiveAssistant: React.FC = () => {
    const [status, setStatus] = useState<SessionStatus>('DISCONNECTED');
    const [transcription, setTranscription] = useState<{ user: string, model: string }[]>([]);
    const [currentTurn, setCurrentTurn] = useState({ user: '', model: '' });

    const wsRef = useRef<WebSocket | null>(null);
    const currentTurnRef = useRef<{ user: string, model: string }>({ user: '', model: '' });
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const cleanup = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        audioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        streamRef.current = null;
        scriptProcessorRef.current = null;
        audioContextRef.current = null;
        outputAudioContextRef.current = null;
    };

    const startSession = async () => {
        setStatus('CONNECTING');
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
            outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
            wsRef.current = ws;

            ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);

                if (msg.type === 'connected') {
                    setStatus('CONNECTED');
                    try {
                        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const source = audioContextRef.current!.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            if (wsRef.current?.readyState !== WebSocket.OPEN) return;
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBytes = new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer);
                            wsRef.current.send(JSON.stringify({ audio: encode(pcmBytes) }));
                        };

                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                    } catch (micErr) {
                        console.error('Microphone access error:', micErr);
                        setStatus('ERROR');
                        ws.close();
                    }
                    return;
                }

                if (msg.type === 'error') {
                    console.error('Live session error:', msg.message);
                    setStatus('ERROR');
                    cleanup();
                    return;
                }

                if (msg.type === 'serverContent') {
                    if (msg.inputTranscript) {
                        currentTurnRef.current.user += msg.inputTranscript;
                        setCurrentTurn({ ...currentTurnRef.current });
                    }
                    if (msg.outputTranscript) {
                        currentTurnRef.current.model += msg.outputTranscript;
                        setCurrentTurn({ ...currentTurnRef.current });
                    }
                    if (msg.turnComplete) {
                        const completedTurn = { ...currentTurnRef.current };
                        if (completedTurn.user || completedTurn.model) {
                            setTranscription(prev => [...prev, completedTurn]);
                        }
                        currentTurnRef.current = { user: '', model: '' };
                        setCurrentTurn({ user: '', model: '' });
                    }

                    if (msg.interrupted) {
                        sourcesRef.current.forEach(s => {
                            try { s.stop(); } catch {}
                        });
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }

                    if (msg.audio && outputAudioContextRef.current) {
                        const outputAudioContext = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(msg.audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        source.addEventListener('ended', () => sourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                }
            };

            ws.onerror = () => {
                setStatus('ERROR');
                cleanup();
            };

            ws.onclose = () => {
                setStatus(prev => (prev === 'ERROR' ? 'ERROR' : 'DISCONNECTED'));
                cleanup();
            };
        } catch (error) {
            console.error('Failed to start session:', error);
            setStatus('ERROR');
            cleanup();
        }
    };

    const stopSession = () => {
        wsRef.current?.close();
        wsRef.current = null;
        cleanup();
        setStatus('DISCONNECTED');
    };
    
    useEffect(() => {
        return () => {
            wsRef.current?.close();
            cleanup();
        };
    }, []);

    return (
        <div className="bg-surface dark:bg-dark-surface p-6 rounded-xl border border-border-color dark:border-dark-border-color h-full flex flex-col">
            <h2 className="text-2xl font-bold text-primary-text dark:text-dark-text-primary mb-2">Live AI Assistant</h2>
            <p className="text-secondary-text dark:text-dark-text-secondary mb-6">Speak directly with your AI creative partner. Brainstorm ideas, get feedback, and more.</p>

            <div className="flex items-center justify-center space-x-4 mb-6">
                <div className={`w-4 h-4 rounded-full ${status === 'CONNECTED' ? 'bg-green-500 animate-pulse' : status === 'CONNECTING' ? 'bg-yellow-500 animate-ping' : status === 'ERROR' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                <span className="text-secondary-text dark:text-dark-text-secondary font-medium uppercase">{status}</span>
            </div>

            <div className="relative flex-1 bg-background dark:bg-dark-background/50 rounded-lg p-4 mb-6 overflow-y-auto border border-border-color dark:border-dark-border-color">
                {transcription.map((turn, index) => (
                    <div key={index} className="mb-4 text-primary-text dark:text-dark-text-primary">
                        <p><strong className="text-tiktok-cyan">You:</strong> {turn.user}</p>
                        <p><strong className="text-tiktok-pink">AI:</strong> {turn.model}</p>
                    </div>
                ))}
                 {(currentTurn.user || currentTurn.model) && (
                     <div className="mb-4 opacity-70 text-primary-text dark:text-dark-text-primary">
                        {currentTurn.user && <p><strong className="text-tiktok-cyan">You:</strong> {currentTurn.user}</p>}
                        {currentTurn.model && <p><strong className="text-tiktok-pink">AI:</strong> {currentTurn.model}</p>}
                    </div>
                 )}
            </div>

            <div className="flex justify-center items-center">
                <button
                    onClick={status === 'DISCONNECTED' || status === 'ERROR' ? startSession : stopSession}
                    className="px-8 py-4 font-bold rounded-full transition-all duration-300 disabled:opacity-50
                    bg-tiktok-pink text-white hover:bg-opacity-80 shadow-[0_0_15px_rgba(254,44,85,0.4)] hover:shadow-[0_0_25px_rgba(254,44,85,0.6)]"
                    disabled={status === 'CONNECTING'}
                >
                    {status === 'CONNECTED' ? 'End Session' : 'Start Session'}
                </button>
            </div>
        </div>
    );
};

export default LiveAssistant;

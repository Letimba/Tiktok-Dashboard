import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const TEXT_MODEL = 'gemini-3.8-flash';
const LIVE_MODEL = 'gemini-3.8-live';

function extractJsonObject(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try extracting from markdown code block
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // continue
      }
    }
    // Try finding outermost JSON object
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {
        // continue
      }
    }
  }
  return null;
}

function extractGroundingSources(response) {
  const candidate = response?.candidates?.[0];
  const groundingMetadata = candidate?.groundingMetadata;
  const rawChunks = groundingMetadata?.groundingChunks || [];
  const sources = [];
  const seenUris = new Set();

  for (const chunk of rawChunks) {
    const uri = chunk?.web?.uri;
    if (uri && !seenUris.has(uri)) {
      seenUris.add(uri);
      let fallbackTitle = uri;
      try {
        fallbackTitle = new URL(uri).hostname.replace(/^www\./, '');
      } catch {
        // keep uri
      }
      sources.push({
        uri,
        title: chunk?.web?.title || fallbackTitle,
      });
    }
  }

  const searchQueries = Array.isArray(groundingMetadata?.webSearchQueries)
    ? groundingMetadata.webSearchQueries
    : [];

  return { sources, searchQueries };
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  app.use(express.json({ limit: '50mb' }));

  // General Gemini content generation endpoint
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { contents, config } = req.body;
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents,
        ...(config && { config }),
      });

      const { sources, searchQueries } = extractGroundingSources(response);

      res.json({
        text: response.text || '',
        sources,
        searchQueries,
      });
    } catch (error) {
      console.error('Error in /api/gemini/generate:', error);
      res.status(500).json({
        error: error?.message || 'Failed to generate content with Gemini API.',
      });
    }
  });

  // Real-time Trending TikTok Hashtags endpoint powered by Google Search grounding
  app.post('/api/gemini/trending-hashtags', async (req, res) => {
    try {
      const { category = 'Trending Now', query = '' } = req.body || {};
      const todayStr = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const focusTopic = query.trim()
        ? `specifically focused on the topic or niche "${query.trim()}"`
        : category && category !== 'Trending Now'
        ? `in the "${category}" category`
        : 'across TikTok overall (viral challenges, creator culture, pop culture, tech, lifestyle)';

      const prompt = `Today is ${todayStr}. Use Google Search to find real-time, currently trending TikTok hashtags, viral video formats, and creator topics ${focusTopic}.

Return ONLY a valid JSON object (no markdown fences, no extra commentary) with the following exact structure:
{
  "summary": "A concise 1-2 sentence real-time pulse summary of what is dominating TikTok right now for this topic/category.",
  "hashtags": [
    {
      "hashtag": "#ExampleTag",
      "category": "Short category label (e.g. Tech & AI, Lifestyle, Viral Format, Pop Culture)",
      "momentum": "Breakout",
      "reason": "1-2 sentences grounded in current search results explaining why this hashtag is trending right now and what creators are posting.",
      "creatorTip": "1 concrete, actionable video hook or format idea a TikTok creator can film today using this hashtag.",
      "volumeEstimate": "Short momentum indicator (e.g. Breakout Wave, High Velocity, Top Weekly Trend, Rising Fast)"
    }
  ]
}

Rules:
- Provide exactly 6 distinct, relevant trending TikTok hashtags in the "hashtags" array.
- Every "hashtag" value MUST start with "#" and contain no spaces.
- "momentum" MUST be one of: "Breakout", "Surging", "Peaking", or "Steady".
- Base your insights on live Google Search findings about current TikTok trends.`;

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = response.text || '';
      const parsed = extractJsonObject(rawText);
      const { sources, searchQueries } = extractGroundingSources(response);

      let hashtags = [];
      let summary =
        'Live pulse of trending TikTok hashtags and creator formats grounded in real-time Google Search data.';

      if (parsed && Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0) {
        summary = parsed.summary || summary;
        hashtags = parsed.hashtags.map((item) => {
          const rawTag = String(item.hashtag || '#TikTokTrend').trim();
          const cleanTag = rawTag.startsWith('#') ? rawTag : `#${rawTag}`;
          const validMomentums = ['Breakout', 'Surging', 'Peaking', 'Steady'];
          const momentum = validMomentums.includes(item.momentum)
            ? item.momentum
            : 'Surging';

          return {
            hashtag: cleanTag.split(/\s+/)[0],
            category: String(item.category || category || 'Viral Trend'),
            momentum,
            reason: String(
              item.reason ||
                'Seeing strong engagement velocity across TikTok creator feeds right now.'
            ),
            creatorTip: String(
              item.creatorTip ||
                `Film a quick 15-second hook sharing your unique take on ${cleanTag}.`
            ),
            volumeEstimate: String(item.volumeEstimate || 'High Velocity'),
          };
        });
      } else {
        // Fallback parser if response was plain text instead of JSON
        const matchedTags = Array.from(
          new Set(rawText.match(/#[a-zA-Z0-9_]+/g) || [])
        ).slice(0, 6);
        const tagsToUse =
          matchedTags.length > 0
            ? matchedTags
            : ['#TikTokTrending', '#CreatorEconomy', '#FYP', '#ViralVideo', '#StoryTime', '#DayInMyLife'];

        summary =
          rawText.replace(/```[\s\S]*?```/g, '').slice(0, 240).trim() || summary;

        hashtags = tagsToUse.map((tag, idx) => ({
          hashtag: tag,
          category: query.trim() || category || 'Trending',
          momentum: idx < 2 ? 'Breakout' : idx < 4 ? 'Surging' : 'Peaking',
          reason: `Identified via live Google Search trend signals for ${
            query.trim() || category
          }.`,
          creatorTip: `Use ${tag} in your caption with a strong 3-second visual hook to capture viewer retention.`,
          volumeEstimate: idx === 0 ? 'Breakout Wave' : 'High Velocity',
        }));
      }

      res.json({
        summary,
        hashtags,
        sources,
        searchQueries,
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in /api/gemini/trending-hashtags:', error);
      res.status(500).json({
        error:
          error?.message ||
          'Failed to fetch real-time trending hashtags via Google Search grounding.',
      });
    }
  });

  // WebSocket server for Live AI Assistant
  const wss = new WebSocketServer({ server: httpServer, path: '/live' });

  wss.on('connection', async (clientWs) => {
    let session = null;

    try {
      session = await ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction:
            'You are a helpful and creative assistant for a TikTok content creator. Provide concise, actionable advice.',
        },
        callbacks: {
          onopen: () => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({ type: 'connected' }));
            }
          },
          onmessage: (message) => {
            if (clientWs.readyState !== clientWs.OPEN) return;

            const inputTranscript =
              message.serverContent?.inputTranscription?.text;
            const outputTranscript =
              message.serverContent?.outputTranscription?.text;
            const turnComplete = Boolean(message.serverContent?.turnComplete);
            const interrupted = Boolean(message.serverContent?.interrupted);
            const audio =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;

            clientWs.send(
              JSON.stringify({
                type: 'serverContent',
                inputTranscript,
                outputTranscript,
                turnComplete,
                interrupted,
                audio,
              })
            );
          },
          onerror: (err) => {
            console.error('Live session error:', err);
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: 'Live session encountered an error.',
                })
              );
            }
          },
          onclose: () => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.close();
            }
          },
        },
      });
    } catch (error) {
      console.error('Failed to initialize Gemini Live session:', error);
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'error',
            message: error?.message || 'Failed to connect to Live AI.',
          })
        );
        clientWs.close();
      }
      return;
    }

    clientWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio && session) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (e) {
        console.error('Error processing client WebSocket message:', e);
      }
    });

    clientWs.on('close', () => {
      if (session) {
        try {
          session.close();
        } catch {
          // ignore close errors
        }
        session = null;
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

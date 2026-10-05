import React, { useState } from 'react';
import { predictViralPotential } from '../../services/geminiService';

interface ViralReport {
    viralScore: number;
    analysis: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse"></div>
    </div>
);

interface ViralPredictorProps {
    videoFile: File | null;
}

const ViralPredictor: React.FC<ViralPredictorProps> = ({ videoFile }) => {
  const [videoIdea, setVideoIdea] = useState<string>('');
  const [report, setReport] = useState<ViralReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!videoIdea.trim() && !videoFile) return;
    setIsLoading(true);
    setReport(null);
    setError(null);
    try {
      const responseText = await predictViralPotential(videoIdea, videoFile || undefined);
      const parsedReport = JSON.parse(responseText);
      setReport(parsedReport);
    } catch (e) {
      console.error("Failed to parse viral potential report:", e);
      setError("Could not analyze the idea. The AI returned an unexpected format.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-tiktok-cyan';
    if (score > 60) return 'text-green-500';
    if (score > 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-primary-text dark:text-dark-text-primary mb-4">AI Viral Predictor</h2>
      <p className="text-secondary-text dark:text-dark-text-secondary mb-6">Got a video idea or a finished draft? Let our AI analyze its potential to go viral and give you actionable feedback.</p>

      <div className="mb-4">
        <textarea
          rows={4}
          value={videoIdea}
          onChange={(e) => setVideoIdea(e.target.value)}
          placeholder="Describe your video idea (optional if uploading a video)... e.g., I'll bake a hyper-realistic cake that looks like a sneaker, with a surprise rainbow filling."
          className="w-full bg-background dark:bg-dark-background p-3 rounded-md border border-border-color dark:border-dark-border-color focus:ring-1 focus:ring-tiktok-pink focus:border-tiktok-pink outline-none transition"
        />
      </div>
      
      <button
        onClick={handleAnalyze}
        disabled={(!videoIdea.trim() && !videoFile) || isLoading}
        className="w-full md:w-1/2 lg:w-1/3 px-4 py-2 font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        bg-tiktok-pink text-white hover:bg-opacity-80 shadow-[0_0_15px_rgba(254,44,85,0.4)] hover:shadow-[0_0_25px_rgba(254,44,85,0.6)]"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Viral Potential'}
      </button>

      <div className="mt-8 flex-1">
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-500">{error}</p>}
        {report && (
          <div className="bg-background dark:bg-dark-background/50 p-6 rounded-lg border border-border-color dark:border-dark-border-color space-y-6 animate-fade-in">
            <div className="text-center">
              <p className="text-secondary-text dark:text-dark-text-secondary font-semibold">Virality Score</p>
              <p className={`text-7xl font-bold ${getScoreColor(report.viralScore)}`}>{report.viralScore}<span className="text-4xl text-secondary-text dark:text-dark-text-secondary">/100</span></p>
              <p className="text-primary-text dark:text-dark-text-primary mt-2">{report.analysis}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                    <h4 className="font-bold text-green-500">Strengths ✅</h4>
                    <ul className="list-disc list-inside text-secondary-text dark:text-dark-text-secondary space-y-1">
                        {report.strengths.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div className="space-y-2">
                    <h4 className="font-bold text-yellow-500">Weaknesses ⚠️</h4>
                    <ul className="list-disc list-inside text-secondary-text dark:text-dark-text-secondary space-y-1">
                        {report.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                 <div className="space-y-2">
                    <h4 className="font-bold text-tiktok-cyan">Suggestions 💡</h4>
                    <ul className="list-disc list-inside text-secondary-text dark:text-dark-text-secondary space-y-1">
                        {report.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViralPredictor;
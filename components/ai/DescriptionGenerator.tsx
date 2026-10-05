import React, { useState } from 'react';
import { generateVideoDescription } from '../../services/geminiService';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse"></div>
    </div>
);

interface DescriptionGeneratorProps {
  videoFile: File | null;
}

const DescriptionGenerator: React.FC<DescriptionGeneratorProps> = ({ videoFile }) => {
  const [videoTopic, setVideoTopic] = useState<string>('');
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!videoTopic.trim() && !videoFile) return;
    setIsLoading(true);
    setDescriptions([]);
    const generatedDescriptions = await generateVideoDescription(videoTopic, videoFile || undefined);
    setDescriptions(generatedDescriptions);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-primary-text dark:text-dark-text-primary mb-4">AI Video Description Generator</h2>
      <p className="text-secondary-text dark:text-dark-text-secondary mb-6">Describe your video's content or upload it directly. Our AI will craft compelling descriptions to boost engagement.</p>

      <div className="mb-4">
        <label htmlFor="videoTopic" className="block text-sm font-medium text-secondary-text dark:text-dark-text-secondary mb-2">Video Topic or Keywords (Optional)</label>
        <textarea
          id="videoTopic"
          rows={3}
          value={videoTopic}
          onChange={(e) => setVideoTopic(e.target.value)}
          placeholder="e.g., A funny compilation of my cat failing at jumps, set to epic music."
          className="w-full bg-background dark:bg-dark-background p-2 rounded-md border border-border-color dark:border-dark-border-color focus:ring-1 focus:ring-tiktok-pink focus:border-tiktok-pink outline-none transition"
        />
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={(!videoTopic.trim() && !videoFile) || isLoading}
        className="w-full md:w-1/2 lg:w-1/3 px-4 py-2 font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        bg-tiktok-pink text-white hover:bg-opacity-80 shadow-[0_0_15px_rgba(254,44,85,0.4)] hover:shadow-[0_0_25px_rgba(254,44,85,0.6)]"
        >
        {isLoading ? 'Generating...' : 'Generate Descriptions'}
      </button>

      <div className="mt-8 flex-1">
        <h3 className="text-lg font-semibold text-primary-text dark:text-dark-text-primary mb-4">Generated Descriptions</h3>
        <div className="space-y-3">
          {isLoading ? (
            <LoadingSpinner/>
          ) : descriptions.length > 0 ? (
            descriptions.map((desc, index) => (
              <div key={index} className="bg-background dark:bg-dark-background/50 p-4 rounded-md text-secondary-text dark:text-dark-text-secondary border border-border-color dark:border-dark-border-color hover:border-tiktok-pink/50 cursor-pointer transition-colors">
                <p>{desc}</p>
              </div>
            ))
          ) : (
            <p className="text-secondary-text dark:text-dark-text-secondary italic">Your AI-generated descriptions will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DescriptionGenerator;
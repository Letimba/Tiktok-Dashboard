import React, { useState } from 'react';
import { generateHashtags } from '../../services/geminiService';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse"></div>
    </div>
);

interface HashtagGeneratorProps {
  videoFile: File | null;
}

const HashtagGenerator: React.FC<HashtagGeneratorProps> = ({ videoFile }) => {
  const [videoTopic, setVideoTopic] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!videoTopic.trim() && !videoFile) return;
    setIsLoading(true);
    setHashtags([]);
    const generatedHashtags = await generateHashtags(videoTopic, videoFile || undefined);
    setHashtags(generatedHashtags);
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashtags.join(' '));
  };


  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-primary-text dark:text-dark-text-primary mb-4">AI Hashtag Generator</h2>
      <p className="text-secondary-text dark:text-dark-text-secondary mb-6">Enter your video topic or upload your video to get a list of relevant and trending hashtags to maximize your reach.</p>

      <div className="flex items-end space-x-4 mb-8">
        <div className="flex-1">
            <label htmlFor="videoTopicHashtag" className="block text-sm font-medium text-secondary-text dark:text-dark-text-secondary mb-2">Video Topic or Keywords (Optional)</label>
            <input
            id="videoTopicHashtag"
            type="text"
            value={videoTopic}
            onChange={(e) => setVideoTopic(e.target.value)}
            placeholder="e.g., DIY home decor hacks"
            className="w-full bg-background dark:bg-dark-background p-2 rounded-md border border-border-color dark:border-dark-border-color focus:ring-1 focus:ring-tiktok-pink focus:border-tiktok-pink outline-none transition"
            />
        </div>
        <button
            onClick={handleGenerate}
            disabled={(!videoTopic.trim() && !videoFile) || isLoading}
            className="px-6 py-2 h-10 font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            bg-tiktok-pink text-white hover:bg-opacity-80 shadow-[0_0_15px_rgba(254,44,85,0.4)] hover:shadow-[0_0_25px_rgba(254,44,85,0.6)]"
        >
            {isLoading ? '...' : 'Generate'}
        </button>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary-text dark:text-dark-text-primary">Generated Hashtags</h3>
            {hashtags.length > 0 && (
                <button
                    onClick={copyToClipboard}
                    className="text-sm font-semibold text-tiktok-pink hover:underline"
                >
                    Copy All
                </button>
            )}
        </div>
        <div className="bg-background dark:bg-dark-background/50 p-4 rounded-md border border-border-color dark:border-dark-border-color min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
            </div>
          ) : hashtags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <span key={index} className="bg-gray-100 dark:bg-dark-card text-tiktok-pink text-sm font-medium px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-secondary-text dark:text-dark-text-secondary italic">Your AI-generated hashtags will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HashtagGenerator;
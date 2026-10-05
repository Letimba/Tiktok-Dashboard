import React, { useState, useRef } from 'react';
import CommentResponder from './ai/CommentResponder';
import DescriptionGenerator from './ai/DescriptionGenerator';
import HashtagGenerator from './ai/HashtagGenerator';
import ViralPredictor from './ai/ViralPredictor';
import { MOCK_COMMENTS } from '../constants';

type AITool = 'comments' | 'descriptions' | 'hashtags' | 'viral-predictor';

const AITools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<AITool>('descriptions');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        setVideoFile(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
      videoInputRef.current?.click();
  };

  const handleRemoveVideo = () => {
      setVideoFile(null);
      if (videoInputRef.current) {
          videoInputRef.current.value = '';
      }
  };

  const renderTool = () => {
    switch (activeTool) {
      case 'comments':
        return <CommentResponder comments={MOCK_COMMENTS} />;
      case 'descriptions':
        return <DescriptionGenerator videoFile={videoFile} />;
      case 'hashtags':
        return <HashtagGenerator videoFile={videoFile} />;
      case 'viral-predictor':
        return <ViralPredictor videoFile={videoFile} />;
      default:
        return null;
    }
  };

  const ToolButton: React.FC<{ tool: AITool; label: string }> = ({ tool, label }) => (
    <button
      onClick={() => setActiveTool(tool)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 border-2 
        ${activeTool === tool
          ? 'bg-tiktok-pink text-white border-tiktok-pink'
          : 'bg-transparent text-secondary-text dark:text-dark-text-secondary border-border-color dark:border-dark-border-color hover:border-tiktok-pink/50 hover:text-tiktok-pink'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
       <div className="bg-surface dark:bg-dark-surface p-6 rounded-xl border border-border-color dark:border-dark-border-color">
        <h3 className="text-xl font-bold text-primary-text dark:text-dark-text-primary mb-2">Analyze Video Content</h3>
        <p className="text-secondary-text dark:text-dark-text-secondary mb-4">Upload a video to let the AI generate descriptions, hashtags, and more based on its content.</p>
        <input
            type="file"
            ref={videoInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
        />
        {!videoFile ? (
            <button
                onClick={handleUploadClick}
                className="flex items-center justify-center w-full px-4 py-3 font-semibold rounded-lg transition-all duration-300 border-2 border-dashed border-border-color dark:border-dark-border-color text-secondary-text dark:text-dark-text-secondary hover:border-tiktok-pink hover:text-tiktok-pink"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Click to upload a video
            </button>
        ) : (
            <div className="flex items-center justify-between p-3 bg-background dark:bg-dark-background/50 rounded-lg border border-border-color dark:border-dark-border-color">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tiktok-pink flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    <div className="overflow-hidden">
                        <p className="font-medium text-primary-text dark:text-dark-text-primary truncate">{videoFile.name}</p>
                        <p className="text-sm text-secondary-text dark:text-dark-text-secondary">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
                <button
                    onClick={handleRemoveVideo}
                    className="p-2 text-secondary-text dark:text-dark-text-secondary hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors flex-shrink-0 ml-2"
                    aria-label="Remove video"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        )}
    </div>
      <div className="flex flex-wrap items-center gap-4 p-4 bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border-color">
        <ToolButton tool="comments" label="AI Comment Responder" />
        <ToolButton tool="descriptions" label="AI Description Generator" />
        <ToolButton tool="hashtags" label="AI Hashtag Generator" />
        <ToolButton tool="viral-predictor" label="AI Viral Predictor" />
      </div>
      <div className="bg-surface dark:bg-dark-surface p-6 rounded-xl border border-border-color dark:border-dark-border-color min-h-[500px]">
        {renderTool()}
      </div>
    </div>
  );
};

export default AITools;
import React, { useState } from 'react';
import { generateCommentReplies } from '../../services/geminiService';
import { Comment } from '../../types';

interface CommentResponderProps {
  comments: Comment[];
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse"></div>
    </div>
);

const CommentResponder: React.FC<CommentResponderProps> = ({ comments }) => {
  const [videoContext, setVideoContext] = useState<string>('my latest dance video');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(comments[0] || null);
  const [replies, setReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateReplies = async () => {
    if (!selectedComment) return;
    setIsLoading(true);
    setReplies([]);
    const generatedReplies = await generateCommentReplies(selectedComment.text, videoContext);
    setReplies(generatedReplies);
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Left side: Comments and Context */}
      <div className="flex flex-col space-y-4">
        <div>
          <label htmlFor="videoContext" className="block text-sm font-medium text-secondary-text dark:text-dark-text-secondary mb-2">Video Context</label>
          <input
            id="videoContext"
            type="text"
            value={videoContext}
            onChange={(e) => setVideoContext(e.target.value)}
            placeholder="e.g., Unboxing a new phone"
            className="w-full bg-background dark:bg-dark-background p-2 rounded-md border border-border-color dark:border-dark-border-color focus:ring-1 focus:ring-tiktok-pink focus:border-tiktok-pink outline-none transition"
          />
        </div>
        <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-primary-text dark:text-dark-text-primary mb-2">Select a Comment</h3>
            <div className="space-y-2 overflow-y-auto pr-2">
            {comments.map((comment) => (
                <div
                key={comment.id}
                onClick={() => { setSelectedComment(comment); setReplies([])}}
                className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                    selectedComment?.id === comment.id
                    ? 'border-tiktok-pink bg-gray-100 dark:bg-dark-card/50'
                    : 'border-transparent bg-gray-50 dark:bg-dark-card/30 hover:bg-gray-100 dark:hover:bg-dark-card/70'
                }`}
                >
                <div className="flex items-start space-x-3">
                    <img src={comment.avatarUrl} alt={comment.username} className="w-8 h-8 rounded-full" />
                    <div>
                    <p className="font-semibold text-primary-text dark:text-dark-text-primary text-sm">{comment.username}</p>
                    <p className="text-secondary-text dark:text-dark-text-secondary">{comment.text}</p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>

      {/* Right side: Generation */}
      <div className="bg-background dark:bg-dark-background/50 rounded-lg p-6 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary-text dark:text-dark-text-primary mb-4">Generated Replies</h3>
          <div className="space-y-3">
            {isLoading ? (
                <LoadingSpinner/>
            ) : replies.length > 0 ? (
              replies.map((reply, index) => (
                <div key={index} className="bg-gray-100 dark:bg-dark-card/50 p-3 rounded-md text-primary-text dark:text-dark-text-primary hover:bg-tiktok-pink/10 hover:text-tiktok-pink cursor-pointer transition-colors">
                  {reply}
                </div>
              ))
            ) : (
              <p className="text-secondary-text dark:text-dark-text-secondary italic">Click "Generate Replies" to see AI suggestions.</p>
            )}
          </div>
        </div>
        <button
          onClick={handleGenerateReplies}
          disabled={!selectedComment || isLoading}
          className="w-full mt-4 px-4 py-2 font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          bg-tiktok-pink text-white hover:bg-opacity-80 shadow-[0_0_15px_rgba(254,44,85,0.4)] hover:shadow-[0_0_25px_rgba(254,44,85,0.6)]"
        >
          {isLoading ? 'Generating...' : 'Generate Replies'}
        </button>
      </div>
    </div>
  );
};

export default CommentResponder;
import React, { useState, useEffect } from 'react';
import { Post } from '../types';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSave: (post: Post) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
  const [caption, setCaption] = useState(post.caption);
  const [scheduledDate, setScheduledDate] = useState<string>('');

  useEffect(() => {
    // Format date for input type="date" which requires YYYY-MM-DD
    if (post.scheduledDate) {
      const date = new Date(post.scheduledDate);
      const year = date.getFullYear();
      const month = (`0${date.getMonth() + 1}`).slice(-2);
      const day = (`0${date.getDate()}`).slice(-2);
      setScheduledDate(`${year}-${month}-${day}`);
    }
  }, [post.scheduledDate]);


  const handleSave = () => {
    const newScheduledDate = scheduledDate ? new Date(scheduledDate + 'T00:00:00') : null; // Avoid timezone issues by setting time
    onSave({
      ...post,
      caption,
      scheduledDate: newScheduledDate,
      status: newScheduledDate ? 'scheduled' : 'draft',
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-surface dark:bg-dark-card w-full max-w-lg rounded-xl border border-border-color dark:border-dark-border-color shadow-2xl p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-primary-text dark:text-dark-text-primary mb-4">Edit Post</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-secondary-text dark:text-dark-text-secondary mb-1">Caption</label>
            <textarea
              id="caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-background dark:bg-dark-background p-2 rounded-md border border-border-color dark:border-dark-border-color focus:ring-1 focus:ring-tiktok-pink focus:border-tiktok-pink outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-secondary-text dark:text-dark-text-secondary mb-1">Schedule Date</label>
            <input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-background dark:bg-dark-background p-2 rounded-md border border-border-color dark:border-dark-border-color focus:ring-1 focus:ring-tiktok-pink focus:border-tiktok-pink outline-none transition"
            />
             <p className="text-xs text-secondary-text dark:text-dark-text-secondary mt-1">Leave blank to keep as a draft.</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-gray-200 dark:bg-dark-surface text-secondary-text dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-dark-border-color"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 font-bold rounded-lg transition-all duration-300 bg-tiktok-pink text-white hover:bg-opacity-80 shadow-[0_0_10px_rgba(254,44,85,0.3)] hover:shadow-[0_0_20px_rgba(254,44,85,0.5)]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;

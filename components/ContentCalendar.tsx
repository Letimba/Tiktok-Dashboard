import React, { useState } from 'react';
import { Post } from '../types';
import { Icon } from './Icon';
import EditPostModal from './EditPostModal';

interface ContentCalendarProps {
    posts: Post[];
    onUpdatePost: (post: Post) => void;
}

const CalendarDay: React.FC<{ 
    day: number; 
    posts: Post[];
    isDragOver: boolean;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: () => void;
    onDragLeave: () => void;
}> = ({ day, posts, isDragOver, onDrop, onDragOver, onDragEnter, onDragLeave }) => {
  const hasPosts = posts.length > 0;
  return (
    <div 
      className={`relative border border-border-color dark:border-dark-border-color bg-surface dark:bg-dark-surface min-h-[120px] p-2 flex flex-col group transition-all duration-300
        ${isDragOver ? 'border-tiktok-pink bg-tiktok-pink/10 shadow-lg' : ''}
      `}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      <span className={`font-bold ${hasPosts ? 'text-primary-text dark:text-dark-text-primary' : 'text-secondary-text dark:text-dark-text-secondary'}`}>{day}</span>
      <div className="mt-1 space-y-1.5 overflow-y-auto">
        {posts.map(post => (
           <div 
            key={post.id} 
            className={`p-1.5 rounded text-xs truncate transition-all duration-200 animate-fade-in
              ${post.status === 'posted'
                ? 'bg-gray-100 dark:bg-dark-card/60 text-secondary-text dark:text-dark-text-secondary opacity-80'
                : 'bg-tiktok-cyan/20 dark:bg-dark-card text-primary-text dark:text-dark-text-primary font-medium border-l-2 border-tiktok-cyan'
              }`
            }
          >
            {post.caption}
          </div>
        ))}
      </div>
    </div>
  );
};

const hasHighPotential = (post: Post): boolean => {
    const keywords = ['challenge', 'hack', 'tutorial', 'new trend', '#fyp', '#trending'];
    const caption = post.caption.toLowerCase();
    return keywords.some(keyword => caption.includes(keyword));
};

const DraftItem: React.FC<{ post: Post; onEdit: (post: Post) => void }> = ({ post, onEdit }) => {
    const isHighPotential = hasHighPotential(post);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('postId', post.id);
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.style.opacity = '1';
    };

    return (
        <div 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card/80 transition-colors cursor-grab"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <img src={post.thumbnailUrl} alt={post.caption} className="w-12 h-16 object-cover rounded-md flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-primary-text dark:text-dark-text-primary text-sm flex items-center">
                    {isHighPotential && <Icon name="fire" className="w-4 h-4 mr-1.5 text-yellow-500 flex-shrink-0" />}
                    {post.caption}
                </p>
                <p className="text-xs text-secondary-text dark:text-dark-text-secondary">Draft</p>
            </div>
            <button onClick={() => onEdit(post)} className="p-2 text-secondary-text dark:text-dark-text-secondary hover:text-tiktok-pink dark:hover:text-tiktok-pink rounded-full hover:bg-tiktok-pink/10 transition-colors">
                <Icon name="pencil" className="w-4 h-4" />
            </button>
        </div>
    );
};


const ContentCalendar: React.FC<ContentCalendarProps> = ({ posts, onUpdatePost }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const draftPosts = posts.filter(p => p.status === 'draft');
  const scheduledPosts = posts.filter(p => p.status !== 'draft');
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getPostsForDay = (day: number) => {
    return scheduledPosts.filter(post => {
      const postDate = post.scheduledDate;
      return postDate &&
        postDate.getDate() === day &&
        postDate.getMonth() === currentDate.getMonth() &&
        postDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSavePost = (updatedPost: Post) => {
    onUpdatePost(updatedPost);
    setEditingPost(null);
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('postId');
    const postToSchedule = posts.find(p => p.id === postId);

    if (postToSchedule) {
        const newScheduledDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        onUpdatePost({
            ...postToSchedule,
            scheduledDate: newScheduledDate,
            status: 'scheduled',
        });
    }
    setDragOverDay(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  return (
    <>
      {editingPost && (
        <EditPostModal 
            post={editingPost}
            onClose={() => setEditingPost(null)}
            onSave={handleSavePost}
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        <div className="lg:col-span-3 bg-background dark:bg-dark-background rounded-xl">
          <div className="flex justify-between items-center mb-6 px-4 pt-4">
            <h3 className="text-2xl font-bold text-primary-text dark:text-dark-text-primary">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </h3>
            <div className="space-x-2">
                <button 
                    onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
                    className="px-3 py-1 rounded bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-card text-secondary-text dark:text-dark-text-secondary border border-border-color dark:border-dark-border-color">
                    &lt;
                </button>
                <button 
                    onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} 
                    className="px-3 py-1 rounded bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-card text-secondary-text dark:text-dark-text-secondary border border-border-color dark:border-dark-border-color">
                    &gt;
                </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map(day => (
              <div key={day} className="text-center font-bold text-secondary-text dark:text-dark-text-secondary p-2">{day}</div>
            ))}
            {emptyDays.map(d => <div key={`empty-${d}`} className="border border-border-color/50 dark:border-dark-border-color/50 bg-gray-50 dark:bg-dark-background/50"></div>)}
            {calendarDays.map(day => (
              <CalendarDay 
                key={day} 
                day={day} 
                posts={getPostsForDay(day)}
                isDragOver={dragOverDay === day}
                onDrop={(e) => handleDrop(e, day)}
                onDragOver={handleDragOver}
                onDragEnter={() => setDragOverDay(day)}
                onDragLeave={() => setDragOverDay(null)}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border-color dark:border-dark-border-color flex flex-col">
            <h3 className="text-xl font-bold text-primary-text dark:text-dark-text-primary mb-4">Drafts</h3>
            <div className="space-y-2 overflow-y-auto flex-1">
                {draftPosts.length > 0 ? (
                    draftPosts.map(post => <DraftItem key={post.id} post={post} onEdit={setEditingPost} />)
                ) : (
                    <p className="text-center text-secondary-text dark:text-dark-text-secondary italic mt-4">No drafts yet.</p>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default ContentCalendar;
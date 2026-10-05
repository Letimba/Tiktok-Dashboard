import React from 'react';
import { MOCK_ANALYTICS } from '../constants';
import { Post } from '../types';
import AnalyticsCard from './AnalyticsCard';
import PerformanceChart from './PerformanceChart';
import EngagementChart from './EngagementChart';
import TrendingHashtags from './TrendingHashtags';

interface DashboardProps {
  theme: 'light' | 'dark';
  posts: Post[];
  onCreateDraft?: (hashtag: string, creatorTip: string) => void;
  onNavigateToCalendar?: () => void;
}

const PostItem: React.FC<{ post: Post }> = ({ post }) => (
  <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors">
    <img src={post.thumbnailUrl} alt={post.caption} className="w-16 h-20 object-cover rounded-md" />
    <div className="flex-1">
      <p className="text-primary-text dark:text-dark-text-primary font-medium truncate">{post.caption}</p>
      <p className="text-sm text-secondary-text dark:text-dark-text-secondary">
        {post.status === 'posted' ? `${post.views.toLocaleString()} views` : `Scheduled for ${post.scheduledDate?.toLocaleDateString()}`}
      </p>
    </div>
    <div className="text-right text-secondary-text dark:text-dark-text-secondary text-sm">
        <div className="flex items-center justify-end">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1 text-tiktok-pink">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9-22.247 22.247 0 01-3.664-3.585 22.383 22.383 0 01-2.047-4.225A23.038 23.038 0 01.5 4.887a.75.75 0 01.658-.653l.006-.003.019-.01a20.759 20.759 0 011.162.682 22.045 22.045 0 012.582 1.9 22.247 22.247 0 013.664 3.585 22.383 22.383 0 012.047 4.225A23.038 23.038 0 0119.5 15.113a.75.75 0 01-.658.653l-.006.003-.019.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9 22.247 22.247 0 01-3.664-3.585 22.383 22.383 0 01-2.047-4.225A23.038 23.038 0 019.5 4.887a.75.75 0 01.153-.013z" />
            </svg>
            {post.likes.toLocaleString()}
        </div>
        <div className="flex items-center justify-end mt-1">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1 text-tiktok-cyan">
                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.19a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
            {post.comments.toLocaleString()}
        </div>
    </div>
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({
  theme,
  posts,
  onCreateDraft,
  onNavigateToCalendar,
}) => {
  const recentPosts = posts.filter(p => p.status === 'posted').slice(0, 5);
  const upcomingPosts = posts.filter(p => p.status === 'scheduled').slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Followers" value={MOCK_ANALYTICS.followers.total} change={MOCK_ANALYTICS.followers.change} />
        <AnalyticsCard title="Total Views (30d)" value={MOCK_ANALYTICS.views.total} change={MOCK_ANALYTICS.views.change} />
        <AnalyticsCard title="Total Likes (30d)" value={MOCK_ANALYTICS.likes.total} change={MOCK_ANALYTICS.likes.change} />
        <AnalyticsCard title="Total Comments (30d)" value={MOCK_ANALYTICS.comments.total} change={MOCK_ANALYTICS.comments.change} />
      </div>

      {/* Real-Time Trending TikTok Hashtags Module (Google Search Grounded) */}
      <TrendingHashtags
        onCreateDraft={onCreateDraft}
        onNavigateToCalendar={onNavigateToCalendar}
      />

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <h3 className="text-xl font-semibold mb-4 text-primary-text dark:text-dark-text-primary">Performance Overview</h3>
            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border-color dark:border-dark-border-color shadow-sm">
                 <PerformanceChart data={MOCK_ANALYTICS.growth} theme={theme} />
            </div>
        </div>
        <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-primary-text dark:text-dark-text-primary">Engagement Breakdown</h3>
            <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border-color dark:border-dark-border-color shadow-sm">
                 <EngagementChart data={recentPosts} theme={theme} />
            </div>
        </div>
      </div>

      {/* Posts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-primary-text dark:text-dark-text-primary">Recent Posts</h3>
          <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border-color dark:border-dark-border-color space-y-2 shadow-sm">
            {recentPosts.map(post => <PostItem key={post.id} post={post} />)}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 text-primary-text dark:text-dark-text-primary">Upcoming Posts</h3>
          <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border-color dark:border-dark-border-color space-y-2 shadow-sm">
            {upcomingPosts.map(post => <PostItem key={post.id} post={post} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
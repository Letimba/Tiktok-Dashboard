
export enum View {
  Dashboard = 'DASHBOARD',
  Calendar = 'CALENDAR',
  AITools = 'AI_TOOLS',
  LiveAssistant = 'LIVE_ASSISTANT',
  Schedule = 'SCHEDULE',
  Analytics = 'ANALYTICS',
}

export interface Post {
  id: string;
  thumbnailUrl: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  scheduledDate: Date | null;
  status: 'posted' | 'scheduled' | 'draft';
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  avatarUrl: string;
}

export interface AnalyticsData {
  followers: {
    total: number;
    change: number;
  };
  views: {
    total: number;
    change: number;
  };
  likes: {
    total: number;
    change: number;
  };
  comments: {
    total: number;
    change: number;
  };
  // Fix: Add 'views' to the growth data type to match its usage in the performance chart and mock data.
  growth: { month: string; followers: number; views: number }[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface TrendingHashtagItem {
  hashtag: string;
  category: string;
  momentum: 'Breakout' | 'Surging' | 'Peaking' | 'Steady';
  reason: string;
  creatorTip: string;
  volumeEstimate: string;
}

export interface TrendingHashtagsResponse {
  summary: string;
  hashtags: TrendingHashtagItem[];
  sources: GroundingSource[];
  searchQueries: string[];
  fetchedAt: string;
}

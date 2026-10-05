import { Post, AnalyticsData, Comment } from './types';

export const MOCK_ANALYTICS: AnalyticsData = {
  followers: { total: 125000, change: 5.2 },
  views: { total: 2400000, change: 12.8 },
  likes: { total: 310000, change: 8.1 },
  comments: { total: 4200, change: -2.3 },
  growth: [
    { month: 'Jan', followers: 1000, views: 50000 },
    { month: 'Feb', followers: 1800, views: 90000 },
    { month: 'Mar', followers: 2200, views: 150000 },
    { month: 'Apr', followers: 3500, views: 220000 },
    { month: 'May', followers: 4100, views: 310000 },
    { month: 'Jun', followers: 5800, views: 450000 },
  ],
};

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    thumbnailUrl: 'https://picsum.photos/seed/tiktok1/300/400',
    caption: 'Unboxing the new tech gadget! ✨',
    views: 120000,
    likes: 15000,
    comments: 345,
    scheduledDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    status: 'posted',
  },
  {
    id: '2',
    thumbnailUrl: 'https://picsum.photos/seed/tiktok2/300/400',
    caption: 'My morning routine for success ☀️',
    views: 250000,
    likes: 32000,
    comments: 812,
    scheduledDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: 'posted',
  },
  {
    id: '3',
    thumbnailUrl: 'https://picsum.photos/seed/tiktok3/300/400',
    caption: 'Hilarious moments from my last stream!',
    views: 89000,
    likes: 11000,
    comments: 210,
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    status: 'posted',
  },
    {
    id: '4',
    thumbnailUrl: 'https://picsum.photos/seed/tiktok4/300/400',
    caption: 'New dance challenge!',
    views: 180000,
    likes: 22000,
    comments: 550,
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    status: 'posted',
  },
  {
    id: '5',
    thumbnailUrl: 'https://picsum.photos/seed/tiktok5/300/400',
    caption: 'Q&A session next week!',
    views: 0,
    likes: 0,
    comments: 0,
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    status: 'scheduled',
  },
  {
    id: 'draft-1',
    thumbnailUrl: 'https://picsum.photos/seed/draft1/300/400',
    caption: 'Initial idea for a cooking tutorial.',
    views: 0,
    likes: 0,
    comments: 0,
    scheduledDate: null,
    status: 'draft',
  },
  {
    id: 'draft-2',
    thumbnailUrl: 'https://picsum.photos/seed/draft2/300/400',
    caption: 'Testing a new camera angle for vlogs.',
    views: 0,
    likes: 0,
    comments: 0,
    scheduledDate: null,
    status: 'draft',
  },
];


export const MOCK_COMMENTS: Comment[] = [
    { id: 'c1', username: 'user123', text: 'This is amazing! 🔥 Where did you get that jacket?', avatarUrl: 'https://picsum.photos/seed/avatar1/40/40' },
    { id: 'c2', username: 'fan_of_yours', text: 'You inspire me so much! Keep it up!', avatarUrl: 'https://picsum.photos/seed/avatar2/40/40' },
    { id: 'c3', username: 'critic_guy', text: 'Not your best video tbh.', avatarUrl: 'https://picsum.photos/seed/avatar3/40/40' },
];
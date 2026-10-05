import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ContentCalendar from './components/ContentCalendar';
import AITools from './components/AITools';
import LiveAssistant from './components/LiveAssistant';
import { View, Post } from './types';
import { MOCK_POSTS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  useEffect(() => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleCreateTrendDraft = (hashtag: string, creatorTip: string) => {
    const svgThumb = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E1E1E"/><stop offset="50%" stop-color="#282828"/><stop offset="100%" stop-color="#FE2C55"/></linearGradient></defs><rect width="300" height="400" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#25F4EE" font-family="sans-serif" font-weight="bold" font-size="22">${hashtag.replace(/[<>&"']/g, '')}</text></svg>`;
    const newDraft: Post = {
      id: `draft-${Date.now()}`,
      thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svgThumb)}`,
      caption: `${creatorTip} ${hashtag} #trending #fyp`,
      views: 0,
      likes: 0,
      comments: 0,
      scheduledDate: null,
      status: 'draft',
    };
    setPosts(prev => [newDraft, ...prev]);
  };

  const renderContent = () => {
    switch (activeView) {
      case View.Dashboard:
        return (
          <Dashboard
            theme={theme}
            posts={posts}
            onCreateDraft={handleCreateTrendDraft}
            onNavigateToCalendar={() => setActiveView(View.Calendar)}
          />
        );
      case View.Calendar:
        return <ContentCalendar posts={posts} onUpdatePost={handleUpdatePost} />;
      case View.AITools:
        return <AITools />;
      case View.LiveAssistant:
        return <LiveAssistant />;
      default:
        return (
          <Dashboard
            theme={theme}
            posts={posts}
            onCreateDraft={handleCreateTrendDraft}
            onNavigateToCalendar={() => setActiveView(View.Calendar)}
          />
        );
    }
  };

  const viewTitles: Record<View, string> = {
    [View.Dashboard]: "Performance Dashboard",
    [View.Calendar]: "Content Calendar",
    [View.AITools]: "AI Creative Suite",
    [View.LiveAssistant]: "Live AI Assistant",
    [View.Schedule]: "Auto-Scheduler", 
    [View.Analytics]: "Analytics Deep Dive"
  };


  return (
    <div className="flex h-screen bg-background dark:bg-dark-background text-primary-text dark:text-dark-text-primary font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header title={viewTitles[activeView]} theme={theme} toggleTheme={toggleTheme} />
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
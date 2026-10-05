import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
  title: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, theme, toggleTheme }) => {
  return (
    <header className="p-6 lg:p-8 bg-surface/80 dark:bg-dark-background/80 backdrop-blur-sm border-b border-border-color dark:border-dark-border-color flex justify-between items-center">
      <h2 className="text-2xl font-bold text-primary-text dark:text-dark-text-primary">{title}</h2>
      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleTheme} 
          className="text-secondary-text dark:text-dark-text-secondary hover:text-primary-text dark:hover:text-dark-text-primary transition-colors"
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} className="h-6 w-6" />
        </button>
        <button className="relative text-secondary-text dark:text-dark-text-secondary hover:text-primary-text dark:hover:text-dark-text-primary">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-0 right-0 h-2 w-2 bg-tiktok-pink rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2">
            <img src="https://picsum.photos/seed/avatar/40/40" alt="User Avatar" className="h-10 w-10 rounded-full border-2 border-tiktok-pink" />
            <div>
                <p className="font-semibold text-primary-text dark:text-dark-text-primary">Creator Name</p>
                <p className="text-xs text-secondary-text dark:text-dark-text-secondary">@creatorhandle</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

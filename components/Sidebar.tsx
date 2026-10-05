import React from 'react';
import { View } from '../types';
import { Icon } from './Icon';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  icon: string;
  activeView: View;
  onClick: (view: View) => void;
  isCollapsed: boolean;
}> = ({ view, label, icon, activeView, onClick, isCollapsed }) => {
  const isActive = activeView === view;
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-300 group ${
        isActive
          ? 'bg-tiktok-pink/10 text-tiktok-pink'
          : 'text-secondary-text dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-card hover:text-primary-text dark:hover:text-dark-text-primary'
      }`}
      onClick={() => onClick(view)}
    >
      <div className="relative flex items-center">
        <Icon name={icon} className="h-5 w-5" />
        <span
          className={`absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-1 bg-tiktok-pink rounded-r-full transition-all duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0'
          } ${isCollapsed ? 'left-0' : '-left-3'}`}
        />
      </div>
      <span className={`ml-4 font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setIsCollapsed }) => {
  const navItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: 'dashboard' },
    { view: View.Calendar, label: 'Calendar', icon: 'calendar' },
    { view: View.AITools, label: 'AI Tools', icon: 'ai' },
    { view: View.LiveAssistant, label: 'Live Assistant', icon: 'live' },
    { view: View.Analytics, label: 'Analytics', icon: 'analytics', action: () => setActiveView(View.Dashboard) },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-surface dark:bg-dark-surface flex-shrink-0 border-r border-border-color dark:border-dark-border-color flex flex-col justify-between transition-all duration-300 ${isCollapsed ? 'w-20 p-2' : 'w-64 p-4'}`}>
      <div>
        <div className={`flex items-center mb-10 transition-all duration-300 ${isCollapsed ? 'justify-center p-0' : 'p-2'}`}>
            <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-tiktok-pink flex-shrink-0">
                <path d="M11.25 3.291l-7.77 2.053a.75.75 0 00-.48 0l-1.383.364a.75.75 0 00-.48 1.34l2.427 4.117a.75.75 0 010 .812l-2.427 4.117a.75.75 0 00.48 1.341l1.383.364a.75.75 0 00.48 0l7.77 2.053a.75.75 0 00.729-.001l7.77-2.053a.75.75 0 00.48 0l1.383-.364a.75.75 0 00.48-1.34l-2.427-4.117a.75.75 0 010-.812l2.427-4.117a.75.75 0 00-.48-1.341l-1.383-.364a.75.75 0 00-.48 0l-7.77-2.053a.75.75 0 00-.729.001zM12 21.088V2.912" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <h1 className={`text-xl font-bold text-primary-text dark:text-dark-text-primary ml-2 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            AI Power-Up
            </h1>
        </div>
        <ul>
          {navItems.map(item => (
            <NavItem 
              key={item.view}
              view={item.view} 
              label={item.label} 
              icon={item.icon} 
              activeView={activeView} 
              onClick={item.action || setActiveView}
              isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      </div>
      <div>
        <div 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card cursor-pointer text-secondary-text dark:text-dark-text-secondary"
        >
            <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="h-5 w-5" />
            <span className={`ml-4 font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Collapse</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

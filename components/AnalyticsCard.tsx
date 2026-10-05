import React from 'react';

interface AnalyticsCardProps {
  title: string;
  value: number;
  change: number;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, change }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-surface dark:bg-dark-surface p-6 rounded-xl border border-border-color dark:border-dark-border-color transition-all duration-300 hover:border-tiktok-pink/50 shadow-sm hover:shadow-lg dark:hover:shadow-tiktok-pink/10">
      <p className="text-secondary-text dark:text-dark-text-secondary text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-primary-text dark:text-dark-text-primary my-2">{value.toLocaleString()}</p>
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
          style={{ transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)' }}
        >
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>{Math.abs(change)}% vs last 30d</span>
      </div>
    </div>
  );
};

export default AnalyticsCard;
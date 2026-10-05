import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Post } from '../types';

interface ChartProps {
  data: Post[];
  theme: 'light' | 'dark';
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/80 dark:bg-dark-card/80 backdrop-blur-md p-3 rounded-lg border border-border-color dark:border-dark-border-color shadow-lg">
          <p className="label text-primary-text dark:text-dark-text-primary font-bold truncate max-w-xs">{`"${label}"`}</p>
          <p className="intro" style={{color: payload[0].fill}}>{`Likes: ${payload[0].value.toLocaleString()}`}</p>
          <p className="intro" style={{color: payload[1].fill}}>{`Comments: ${payload[1].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
};

const EngagementChart: React.FC<ChartProps> = ({ data, theme }) => {
    const tickColor = theme === 'dark' ? '#AAAAAA' : '#6B7280';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    const chartData = data.map(post => ({
        ...post,
        name: post.caption.length > 15 ? `${post.caption.substring(0, 15)}...` : post.caption,
    }));
    
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fill: tickColor }} stroke={gridColor} fontSize={12} />
          <YAxis tick={{ fill: tickColor }} stroke={gridColor} fontSize={12} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(254, 44, 85, 0.1)'}}/>
          <Legend wrapperStyle={{ color: tickColor, fontSize: '14px' }} />
          <Bar dataKey="likes" fill="#FE2C55" name="Likes" />
          <Bar dataKey="comments" fill="#25F4EE" name="Comments" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EngagementChart;
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartProps {
  data: { month: string; followers: number, views: number }[];
  theme: 'light' | 'dark';
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/80 dark:bg-dark-card/80 backdrop-blur-md p-3 rounded-lg border border-border-color dark:border-dark-border-color shadow-lg">
          <p className="label text-primary-text dark:text-dark-text-primary font-bold">{`${label}`}</p>
          <p className="intro" style={{color: payload[0].color}}>{`Followers: ${payload[0].value.toLocaleString()}`}</p>
          <p className="intro" style={{color: payload[1].color}}>{`Views: ${payload[1].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
};


const PerformanceChart: React.FC<ChartProps> = ({ data, theme }) => {
  const tickColor = theme === 'dark' ? '#AAAAAA' : '#6B7280';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" tick={{ fill: tickColor }} stroke={gridColor} fontSize={12} />
          <YAxis tick={{ fill: tickColor }} stroke={gridColor} fontSize={12} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(254, 44, 85, 0.1)'}}/>
          <Legend wrapperStyle={{ color: tickColor, fontSize: '14px' }} />
          <Line
            type="monotone"
            dataKey="followers"
            stroke="#FE2C55"
            strokeWidth={2}
            dot={{ r: 4, fill: '#FE2C55' }}
            activeDot={{ r: 8, stroke: 'rgba(254, 44, 85, 0.3)', strokeWidth: 8 }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#25F4EE"
            strokeWidth={2}
            dot={{ r: 4, fill: '#25F4EE' }}
            activeDot={{ r: 8, stroke: 'rgba(37, 244, 238, 0.3)', strokeWidth: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
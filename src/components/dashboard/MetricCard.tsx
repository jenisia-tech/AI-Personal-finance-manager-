import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = 'blue',
}) => {
  const accentClasses = {
    blue: 'bg-apple-blue/10 text-apple-blue dark:bg-apple-blue/20',
    green: 'bg-apple-green/10 text-apple-green dark:bg-apple-green/20',
    red: 'bg-apple-red/10 text-apple-red dark:bg-apple-red/20',
    orange: 'bg-apple-orange/10 text-apple-orange dark:bg-apple-orange/20',
    purple: 'bg-apple-purple/10 text-apple-purple dark:bg-apple-purple/20',
  };

  return (
    <div className="p-5 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card hover:shadow-apple-card-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-apple-md ${accentClasses[accentColor]}`}>
          {icon}
        </div>
      </div>

      <div className="text-2xl font-bold tracking-tight text-apple-gray-900 dark:text-white mb-1">
        {value}
      </div>

      <div className="flex items-center justify-between text-xs text-apple-gray-500 dark:text-apple-gray-400">
        <span>{subtext}</span>
        {trend && (
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-apple-green' : 'text-apple-red'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};

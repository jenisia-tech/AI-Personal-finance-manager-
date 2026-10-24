import React from 'react';

interface ProgressBarProps {
  value: number; // percentage (0 - 100 or higher)
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  dangerThreshold?: number;
  warningThreshold?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color,
  dangerThreshold = 90,
  warningThreshold = 75,
}) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  // Determine dynamic color based on thresholds if no explicit color provided
  let barColor = color;
  if (!barColor) {
    if (value >= dangerThreshold) {
      barColor = '#FF3B30'; // Apple Red
    } else if (value >= warningThreshold) {
      barColor = '#FF9500'; // Apple Orange
    } else {
      barColor = '#34C759'; // Apple Green
    }
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-apple-gray-200 dark:bg-apple-gray-800 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-1">
          <span>{Math.round(value)}%</span>
          <span>{value > 100 ? 'Over limit' : `${100 - Math.round(value)}% left`}</span>
        </div>
      )}
    </div>
  );
};

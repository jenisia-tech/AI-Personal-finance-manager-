import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/50 dark:bg-apple-darkCard/50 rounded-apple-lg border border-dashed border-apple-gray-300 dark:border-apple-gray-800">
      <div className="p-3 bg-apple-gray-100 dark:bg-apple-gray-850 rounded-full text-apple-gray-500 mb-3">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-apple-gray-900 dark:text-white">
        {title}
      </h4>
      <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 max-w-xs mt-1 mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-medium rounded-apple-sm transition shadow-apple-pill"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { Target, ChevronRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ProgressBar } from '../common/ProgressBar';
import { formatINR } from '../../utils/formatters';

interface GoalsProgressWidgetProps {
  onViewAll?: () => void;
}

export const GoalsProgressWidget: React.FC<GoalsProgressWidgetProps> = ({ onViewAll }) => {
  const { goals } = useFinance();

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-apple-green/10 text-apple-green">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
            Savings Goals
          </h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-apple-blue hover:text-apple-blue-hover font-medium flex items-center"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {goals.slice(0, 3).map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );

          return (
            <div key={goal.id} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{goal.icon || '🎯'}</span>
                  <span className="font-medium text-apple-gray-800 dark:text-apple-gray-200 truncate">
                    {goal.title}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-semibold text-apple-gray-900 dark:text-white">
                    {formatINR(goal.currentAmount)}
                  </span>
                  <span className="text-apple-gray-400 text-[10px] ml-1">
                    / {formatINR(goal.targetAmount)}
                  </span>
                </div>
              </div>
              <ProgressBar
                value={percentage}
                color={goal.color || '#34C759'}
                size="sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

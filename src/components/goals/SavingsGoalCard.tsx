import React from 'react';
import { Edit2, Trash2, Plus, Calendar, TrendingUp } from 'lucide-react';
import { SavingsGoal } from '../../types/finance';
import { ProgressBar } from '../common/ProgressBar';
import { formatINR, formatDate } from '../../utils/formatters';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
  onDeposit: (goal: SavingsGoal) => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onDeposit,
}) => {
  const percentage = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  // Calculate days remaining
  const targetTime = new Date(goal.targetDate).getTime();
  const now = new Date().getTime();
  const daysRemaining = Math.max(0, Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
  const monthlyRequired = Math.round(remaining / monthsRemaining);

  return (
    <div className="p-5 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card hover:shadow-apple-card-hover transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="text-2xl p-2 rounded-apple-md bg-apple-gray-100 dark:bg-apple-gray-850">
              {goal.icon || '🎯'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white leading-snug">
                {goal.title}
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-600 dark:text-apple-gray-400">
                {goal.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 text-apple-gray-400 hover:text-apple-blue hover:bg-apple-blue/10 rounded-apple-sm transition"
              title="Edit Goal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal)}
              className="p-1.5 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 rounded-apple-sm transition"
              title="Delete Goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Amount Saved & Target */}
        <div className="flex items-baseline justify-between mt-2 mb-1">
          <div className="text-xl font-bold text-apple-gray-900 dark:text-white">
            {formatINR(goal.currentAmount)}
          </div>
          <div className="text-xs text-apple-gray-400">
            Target: {formatINR(goal.targetAmount)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-2.5">
          <ProgressBar
            value={percentage}
            color={goal.color || '#34C759'}
            size="md"
          />
        </div>

        {/* Velocity Stats */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-apple-gray-50 dark:bg-apple-gray-850/60 rounded-apple-sm text-[11px] text-apple-gray-500 dark:text-apple-gray-400 my-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-apple-gray-400" />
            <span>{daysRemaining} days left ({formatDate(goal.targetDate)})</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <TrendingUp className="w-3.5 h-3.5 text-apple-blue" />
            <span>Req: {formatINR(monthlyRequired)}/mo</span>
          </div>
        </div>
      </div>

      {/* Deposit Action Trigger */}
      <div className="pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300">
          {percentage}% funded
        </span>

        <button
          onClick={() => onDeposit(goal)}
          className="flex items-center gap-1 px-3 py-1.5 bg-apple-green hover:bg-green-600 text-white rounded-apple-sm text-xs font-semibold transition shadow-apple-pill"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add / Withdraw</span>
        </button>
      </div>
    </div>
  );
};

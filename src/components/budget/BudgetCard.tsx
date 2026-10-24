import React from 'react';
import { Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Budget } from '../../types/finance';
import { ProgressBar } from '../common/ProgressBar';
import { formatINR } from '../../utils/formatters';

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  spent,
  onEdit,
  onDelete,
}) => {
  const utilization = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
  const isOver = spent > budget.limit;
  const isNear = utilization >= budget.alertThreshold && !isOver;
  const remaining = Math.max(0, budget.limit - spent);

  return (
    <div className="p-5 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card hover:shadow-apple-card-hover transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
              {budget.category}
            </span>
            <div className="text-xl font-bold text-apple-gray-900 dark:text-white mt-0.5">
              {formatINR(spent)}
            </div>
            <p className="text-xs text-apple-gray-400">
              Limit: {formatINR(budget.limit)} ({utilization}%)
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(budget)}
              className="p-1.5 text-apple-gray-400 hover:text-apple-blue hover:bg-apple-blue/10 rounded-apple-sm transition"
              title="Edit Limit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              className="p-1.5 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 rounded-apple-sm transition"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar with Thresholds */}
        <div className="my-3">
          <ProgressBar
            value={utilization}
            dangerThreshold={budget.alertThreshold}
            size="md"
          />
        </div>
      </div>

      {/* Footer Status Badge */}
      <div className="pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800/80 flex items-center justify-between text-xs">
        {isOver ? (
          <div className="flex items-center gap-1.5 text-apple-red font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Over by {formatINR(spent - budget.limit)}</span>
          </div>
        ) : isNear ? (
          <div className="flex items-center gap-1.5 text-apple-orange font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{formatINR(remaining)} remaining</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-apple-green font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{formatINR(remaining)} remaining</span>
          </div>
        )}

        <span className="text-[10px] text-apple-gray-400 font-medium">
          Alert at {budget.alertThreshold}%
        </span>
      </div>
    </div>
  );
};

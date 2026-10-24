import React, { useState } from 'react';
import { Plus, Target, Trophy } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { SavingsGoalCard } from './SavingsGoalCard';
import { GoalFormModal } from './GoalFormModal';
import { DepositModal } from './DepositModal';
import { EmptyState } from '../common/EmptyState';
import { formatINR } from '../../utils/formatters';

export const SavingsGoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, depositToGoal, withdrawFromGoal } = useFinance();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);

  const totalCurrentSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetRequired = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercentage =
    totalTargetRequired > 0
      ? Math.min(100, Math.round((totalCurrentSaved / totalTargetRequired) * 100))
      : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
            Savings Goals & Milestones
          </h2>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            Fund your dreams with time-horizon tracking and automated monthly velocity metrics
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* Aggregate Milestones Stats Banner */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Total Accumulated Savings
          </span>
          <div className="text-2xl font-bold text-apple-green mt-1">
            {formatINR(totalCurrentSaved)}
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">Across {goals.length} active target funds</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Total Milestone Commitments
          </span>
          <div className="text-2xl font-bold text-apple-gray-900 dark:text-white mt-1">
            {formatINR(totalTargetRequired)}
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">
            Remaining deficit: {formatINR(Math.max(0, totalTargetRequired - totalCurrentSaved))}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Overall Portfolio Velocity
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Trophy className="w-5 h-5 text-apple-orange" />
            <span className="text-2xl font-bold text-apple-gray-900 dark:text-white">
              {overallPercentage}%
            </span>
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">Funded completion rate</p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8" />}
          title="No Active Savings Goals"
          description="Create savings targets like an Emergency Fund, Travel Vacation, or Tech purchase."
          actionText="Create First Goal"
          onAction={() => {
            setEditingGoal(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={(item) => {
                setEditingGoal(item);
                setIsFormOpen(true);
              }}
              onDelete={(item) => deleteGoal(item.id)}
              onDeposit={(item) => setActiveDepositGoal(item)}
            />
          ))}
        </div>
      )}

      {/* Goal Add/Edit Form Modal */}
      <GoalFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={(data) => {
          if (editingGoal) {
            updateGoal(editingGoal.id, data);
          } else {
            addGoal(data);
          }
        }}
        initialData={editingGoal}
      />

      {/* Deposit / Withdraw Funds Modal */}
      <DepositModal
        isOpen={Boolean(activeDepositGoal)}
        onClose={() => setActiveDepositGoal(null)}
        goal={activeDepositGoal}
        onDeposit={depositToGoal}
        onWithdraw={withdrawFromGoal}
      />
    </div>
  );
};

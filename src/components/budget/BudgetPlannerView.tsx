import React, { useState } from 'react';
import { Plus, PieChart, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types/finance';
import { BudgetCard } from './BudgetCard';
import { BudgetFormModal } from './BudgetFormModal';
import { EmptyState } from '../common/EmptyState';
import { calculateCategoryExpenses } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';

export const BudgetPlannerView: React.FC = () => {
  const { budgets, transactions, activeMonth, addBudget, updateBudget, deleteBudget } = useFinance();
  const categoryExpenses = calculateCategoryExpenses(transactions, activeMonth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (categoryExpenses[b.category] || 0), 0);
  const overallUtilization = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  const breachedCount = budgets.filter(b => (categoryExpenses[b.category] || 0) > b.limit).length;
  const existingCategories = budgets.map(b => b.category);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
            Monthly Budget Planner
          </h2>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            Real-time expenditure tracking with proactive AI alerts in INR (₹)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Aggregate Budget Discipline KPI Summary */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Total Allocated Limit
          </span>
          <div className="text-2xl font-bold text-apple-gray-900 dark:text-white mt-1">
            {formatINR(totalBudgetLimit)}
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">Across {budgets.length} assigned categories</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Actual Spent This Month
          </span>
          <div className="text-2xl font-bold text-apple-gray-900 dark:text-white mt-1">
            {formatINR(totalBudgetSpent)}
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">
            Utilization: <span className="font-semibold">{overallUtilization}%</span>
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Adherence Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            {breachedCount > 0 ? (
              <div className="flex items-center gap-2 text-apple-red font-bold text-base">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span>{breachedCount} Category Over-Budget</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-apple-green font-bold text-base">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>All Budgets Disciplined</span>
              </div>
            )}
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">
            {totalBudgetLimit > totalBudgetSpent
              ? `${formatINR(totalBudgetLimit - totalBudgetSpent)} cushion remaining`
              : 'Deficit detected'}
          </p>
        </div>
      </div>

      {/* Grid of Budget Cards */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={<PieChart className="w-8 h-8" />}
          title="No Category Budgets Assigned"
          description="Create spending limits for groceries, rent, entertainment, etc. to monitor limits."
          actionText="Create Budget"
          onAction={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              spent={categoryExpenses[b.category] || 0}
              onEdit={(item) => {
                setEditingBudget(item);
                setIsModalOpen(true);
              }}
              onDelete={(item) => deleteBudget(item.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={(data) => {
          if (editingBudget) {
            updateBudget(editingBudget.id, data);
          } else {
            addBudget(data);
          }
        }}
        initialData={editingBudget}
        existingCategories={existingCategories}
      />
    </div>
  );
};

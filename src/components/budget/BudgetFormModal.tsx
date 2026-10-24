import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Budget, TransactionCategory } from '../../types/finance';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (budget: Omit<Budget, 'id'>) => void;
  initialData?: Budget | null;
  existingCategories: string[];
}

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Other',
];

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingCategories,
}) => {
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [limit, setLimit] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(85);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setLimit(initialData.limit.toString());
      setAlertThreshold(initialData.alertThreshold || 85);
    } else {
      // Pick first non-assigned category if possible
      const available = CATEGORIES.find(c => !existingCategories.includes(c)) || 'Food';
      setCategory(available);
      setLimit('');
      setAlertThreshold(85);
    }
    setError('');
  }, [initialData, isOpen, existingCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);

    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Please enter a valid monthly limit greater than ₹0.');
      return;
    }

    if (!initialData && existingCategories.includes(category)) {
      setError(`A budget for "${category}" already exists.`);
      return;
    }

    onSubmit({
      category,
      limit: numLimit,
      period: 'monthly',
      alertThreshold,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit ${initialData.category} Budget` : 'Create Category Budget'}
      subtitle="Assign monthly expenditure ceilings in Indian Rupees (₹)"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-apple-sm bg-apple-red/10 border border-apple-red/20 text-apple-red text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
            Expense Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            disabled={Boolean(initialData)}
            className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue disabled:opacity-60"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
            Monthly Limit in INR (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-apple-gray-400 font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              step="any"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full pl-8 pr-3 py-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <label className="font-semibold text-apple-gray-700 dark:text-apple-gray-300">
              Warning Alert Threshold
            </label>
            <span className="font-bold text-apple-blue">{alertThreshold}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
            className="w-full accent-apple-blue cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-apple-gray-400 mt-0.5">
            <span>60%</span>
            <span>80% (Recommended)</span>
            <span>95%</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-semibold rounded-apple-sm transition shadow-apple-pill"
          >
            {initialData ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

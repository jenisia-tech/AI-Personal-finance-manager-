import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { SavingsGoal, SearchAlgorithmType } from '../../types/finance';
import { runBreadthFirstSearch, runBestFirstSearch } from '../../services/financialSearchService';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<SavingsGoal, 'id'>) => void;
  initialData?: SavingsGoal | null;
}

const EMOJI_OPTIONS = ['🛡️', '💻', '🏖️', '🚗', '🏠', '🎓', '💍', '🚀', '📱', '🎁'];
const COLOR_OPTIONS = ['#FF5E97', '#D946EF', '#10B981', '#FB923C', '#F43F5E', '#38BDF8'];

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Tech');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#FF5E97');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTargetAmount(initialData.targetAmount.toString());
      setCurrentAmount(initialData.currentAmount.toString());
      setTargetDate(initialData.targetDate);
      setCategory(initialData.category);
      setIcon(initialData.icon || '🎯');
      setColor(initialData.color || '#FF5E97');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      // Set default target date to 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetDate(d.toISOString().split('T')[0]);
      setCategory('Tech');
      setIcon('🎯');
      setColor('#FF5E97');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount);
    const numCurrent = parseFloat(currentAmount) || 0;

    if (!title.trim()) {
      setError('Please provide a goal name.');
      return;
    }

    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Target amount must be greater than ₹0.');
      return;
    }

    if (!targetDate) {
      setError('Please select a target deadline date.');
      return;
    }

    onSubmit({
      title: title.trim(),
      targetAmount: numTarget,
      currentAmount: numCurrent,
      targetDate,
      category: category.trim() || 'General',
      icon,
      color,
    });

    onClose();
  };

  const [showSearchPlan, setShowSearchPlan] = useState(false);
  const [searchAlgorithm, setSearchAlgorithm] = useState<SearchAlgorithmType>('BestFirst');

  const searchPreview = useMemo(() => {
    if (!showSearchPlan) return null;
    const numTarget = parseFloat(targetAmount);
    const numCurrent = parseFloat(currentAmount) || 0;
    if (isNaN(numTarget) || numTarget <= numCurrent || !targetDate) return null;

    const targetTime = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const days = Math.max(0, Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24)));
    const months = Math.max(1, Math.min(24, Math.ceil(days / 30)));

    const deficit = numTarget - numCurrent;
    const baseStep = Math.max(500, Math.round(deficit / (months * 2) / 500) * 500);
    const choices = [baseStep, baseStep * 2, baseStep * 3];

    const input = {
      initialSavings: numCurrent,
      targetSavings: numTarget,
      planningHorizonMonths: months,
      monthlySavingChoices: choices,
    };

    return searchAlgorithm === 'BFS' ? runBreadthFirstSearch(input) : runBestFirstSearch(input);
  }, [showSearchPlan, targetAmount, currentAmount, targetDate, searchAlgorithm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      subtitle="Define milestone targets and funding deadlines in INR (₹)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-apple-sm bg-apple-red/10 border border-apple-red/20 text-apple-red text-xs font-medium">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
            Goal Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. MacBook Pro M3 or Emergency Reserve"
            className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            required
          />
        </div>

        {/* Target and Initial Saved Amount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Target Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 100000"
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Already Saved (₹)
            </label>
            <input
              type="number"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>
        </div>

        {/* Target Deadline Date & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Category Tag
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Tech, Travel, Safety"
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>
        </div>

        {/* Optional AI Search Plan Preview Toggle */}
        <div className="p-3 rounded-apple-md bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-apple-gray-900 dark:text-white flex items-center gap-1.5">
              <span>🧭 Generate AI Savings Plan (CO2 Search)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowSearchPlan(!showSearchPlan)}
              className="text-[11px] font-bold text-apple-blue hover:underline"
            >
              {showSearchPlan ? 'Hide Plan' : 'Preview Roadmap'}
            </button>
          </div>

          {showSearchPlan && (
            <div className="mt-3 pt-2.5 border-t border-apple-blue/10 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-apple-gray-500 text-[11px]">Algorithm:</span>
                <button
                  type="button"
                  onClick={() => setSearchAlgorithm('BestFirst')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    searchAlgorithm === 'BestFirst'
                      ? 'bg-apple-blue text-white shadow-sm'
                      : 'bg-white dark:bg-apple-gray-800 text-apple-gray-600'
                  }`}
                >
                  Greedy Best-First
                </button>
                <button
                  type="button"
                  onClick={() => setSearchAlgorithm('BFS')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    searchAlgorithm === 'BFS'
                      ? 'bg-apple-blue text-white shadow-sm'
                      : 'bg-white dark:bg-apple-gray-800 text-apple-gray-600'
                  }`}
                >
                  BFS
                </button>
              </div>

              {searchPreview ? (
                searchPreview.success ? (
                  <div className="p-2 rounded bg-white dark:bg-apple-gray-900 border border-apple-gray-200/80 dark:border-apple-gray-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-apple-green font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        Optimal Path: Reachable in {searchPreview.plan.length} month(s)
                      </span>
                    </div>
                    <div className="text-[11px] text-apple-gray-500">
                      Explored {searchPreview.statesExplored} state(s) in {searchPreview.executionTimeMs} ms
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-apple-orange/10 border border-apple-orange/20 text-apple-orange text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Horizon too short for current targets. Try a farther date.</span>
                  </div>
                )
              ) : (
                <div className="text-[11px] text-apple-gray-400">
                  Enter target amount and valid date to preview savings roadmap.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Emoji Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1.5">
            Goal Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setIcon(em)}
                className={`w-9 h-9 rounded-apple-sm text-lg flex items-center justify-center transition ${
                  icon === em
                    ? 'bg-apple-blue/20 ring-2 ring-apple-blue'
                    : 'bg-apple-gray-100 dark:bg-apple-gray-850 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-800'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Color Theme */}
        <div>
          <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1.5">
            Card Accent Color
          </label>
          <div className="flex gap-2.5">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition ${
                  color === c ? 'ring-2 ring-offset-2 ring-apple-blue' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
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
            {initialData ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

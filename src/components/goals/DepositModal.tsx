import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SavingsGoal } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onDeposit: (goalId: string, amount: number) => void;
  onWithdraw: (goalId: string, amount: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  onDeposit,
  onWithdraw,
}) => {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!goal) return null;

  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (mode === 'withdraw' && val > goal.currentAmount) {
      setError(`Cannot withdraw more than current savings (${formatINR(goal.currentAmount)}).`);
      return;
    }

    if (mode === 'deposit') {
      onDeposit(goal.id, val);
    } else {
      onWithdraw(goal.id, val);
    }

    setAmount('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'deposit' ? `Deposit to ${goal.title}` : `Withdraw from ${goal.title}`}
      subtitle={`Current savings: ${formatINR(goal.currentAmount)} of ${formatINR(goal.targetAmount)} target`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-apple-sm bg-apple-red/10 border border-apple-red/20 text-apple-red text-xs font-medium">
            {error}
          </div>
        )}

        {/* Action Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-apple-gray-100 dark:bg-apple-gray-850 p-1 rounded-apple-md">
          <button
            type="button"
            onClick={() => {
              setMode('deposit');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-apple-sm transition ${
              mode === 'deposit'
                ? 'bg-white dark:bg-apple-gray-900 text-apple-green shadow-sm'
                : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
            }`}
          >
            Deposit (+)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('withdraw');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-apple-sm transition ${
              mode === 'withdraw'
                ? 'bg-white dark:bg-apple-gray-900 text-apple-orange shadow-sm'
                : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
            }`}
          >
            Withdraw (-)
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
            Amount in INR (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-apple-gray-400 font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full pl-8 pr-3 py-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
              required
            />
          </div>
        </div>

        {/* Quick Amount Preset Chips */}
        <div>
          <label className="block text-[11px] font-semibold text-apple-gray-500 mb-1.5">
            Quick Preset Chips
          </label>
          <div className="flex flex-wrap gap-1.5">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-apple-gray-100 dark:bg-apple-gray-850 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-300 transition"
              >
                +{formatINR(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Buttons */}
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
            className={`px-5 py-2 text-white text-xs font-semibold rounded-apple-sm transition shadow-apple-pill ${
              mode === 'deposit'
                ? 'bg-apple-green hover:bg-green-600'
                : 'bg-apple-orange hover:bg-orange-600'
            }`}
          >
            Confirm {mode === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

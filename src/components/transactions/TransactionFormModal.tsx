import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  TrendingDown,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentMode,
} from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialData?: Transaction | null;
  initialType?: TransactionType;
}

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Salary',
  'Freelance',
  'Investments',
  'Allowance',
  'Other',
];

const PAYMENT_MODES: PaymentMode[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialType = 'expense',
}) => {
  const { goals } = useFinance();
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [goalId, setGoalId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setPaymentMode(initialData.paymentMode);
      setDate(initialData.date);
      setDescription(initialData.description);
      setGoalId(initialData.goalId || '');
    } else {
      setType(initialType);
      setAmount('');
      setCategory(initialType === 'income' ? 'Salary' : initialType === 'deposit' || initialType === 'withdrawal' ? 'Investments' : 'Food');
      setPaymentMode('UPI');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setGoalId(goals.length > 0 ? goals[0].id : '');
    }
    setError('');
  }, [initialData, initialType, isOpen, goals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a short description or merchant name.');
      return;
    }

    // Round to 2 decimal places to avoid floating point drift
    const exactAmount = Math.round(numAmount * 100) / 100;

    onSubmit({
      type,
      amount: exactAmount,
      category,
      paymentMode,
      date,
      description: description.trim(),
      goalId: (type === 'deposit' || type === 'withdrawal') && goalId ? goalId : undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData
          ? 'Edit Transaction'
          : type === 'income'
          ? 'Record Inflow / Income'
          : type === 'deposit'
          ? 'Record Goal Deposit'
          : type === 'withdrawal'
          ? 'Record Goal Withdrawal'
          : 'Record Outflow / Expense'
      }
      subtitle="Track your inflows and outflows in Indian Rupees (₹)"
      maxWidth="xl"
      scrollable={false}
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 space-y-3 pr-0.5 overflow-y-auto min-h-0">
          {error && (
            <div className="p-3 rounded-apple-md bg-apple-red/10 border border-apple-red/20 text-apple-red text-xs font-medium flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle Tabs */}
          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1.5">
              Transaction Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-apple-gray-100/90 dark:bg-apple-gray-850/90 p-1.5 rounded-apple-lg border border-apple-gray-200/60 dark:border-apple-gray-800/60">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  if (category === 'Salary' || category === 'Freelance') setCategory('Food');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-apple-md transition-all duration-150 whitespace-nowrap ${
                  type === 'expense'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-sm font-bold'
                    : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-apple-gray-800/60 border border-transparent'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span>Expense (-)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Salary');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-apple-md transition-all duration-150 whitespace-nowrap ${
                  type === 'income'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm font-bold'
                    : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-apple-gray-800/60 border border-transparent'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                <span>Income (+)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('deposit');
                  setCategory('Investments');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-apple-md transition-all duration-150 whitespace-nowrap ${
                  type === 'deposit'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shadow-sm font-bold'
                    : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-apple-gray-800/60 border border-transparent'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5 shrink-0" />
                <span>Goal Deposit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('withdrawal');
                  setCategory('Investments');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-apple-md transition-all duration-150 whitespace-nowrap ${
                  type === 'withdrawal'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-sm font-bold'
                    : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-apple-gray-800/60 border border-transparent'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                <span>Withdrawal</span>
              </button>
            </div>
          </div>

          {/* Linked Goal Selector if Deposit or Withdrawal */}
          {(type === 'deposit' || type === 'withdrawal') && goals.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
                Linked Savings Goal (Optional)
              </label>
              <select
                id="tx-goal-id"
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 bg-apple-gray-50/80 dark:bg-apple-gray-850/80 border border-apple-gray-200 dark:border-apple-gray-750 rounded-apple-md text-xs font-medium text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bubblegum focus:border-transparent transition"
              >
                <option value="">None (Independent Transfer)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.icon} {g.title} (Current: ₹{g.currentAmount.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount in INR */}
          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Exact Amount in INR (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-apple-gray-500 dark:text-apple-gray-400 font-bold text-sm">
                ₹
              </span>
              <input
                id="tx-amount"
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full pl-9 pr-3.5 py-2 bg-apple-gray-50/80 dark:bg-apple-gray-850/80 border border-apple-gray-200 dark:border-apple-gray-750 rounded-apple-md text-sm font-semibold text-apple-gray-900 dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-bubblegum focus:border-transparent transition"
                required
              />
            </div>
          </div>

          {/* Category & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
                Category
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 bg-apple-gray-50/80 dark:bg-apple-gray-850/80 border border-apple-gray-200 dark:border-apple-gray-750 rounded-apple-md text-xs font-medium text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bubblegum focus:border-transparent transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
                Payment Mode
              </label>
              <select
                id="tx-payment-mode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 bg-apple-gray-50/80 dark:bg-apple-gray-850/80 border border-apple-gray-200 dark:border-apple-gray-750 rounded-apple-md text-xs font-medium text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bubblegum focus:border-transparent transition"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Transaction Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-apple-gray-50/80 dark:bg-apple-gray-850/80 border border-apple-gray-200 dark:border-apple-gray-750 rounded-apple-md text-xs font-medium text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bubblegum focus:border-transparent transition"
              required
            />
          </div>

          {/* Description / Merchant */}
          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Description / Source / Merchant
            </label>
            <input
              id="tx-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'income'
                  ? 'e.g. October Consulting Fee or Software Salary'
                  : type === 'deposit'
                  ? 'e.g. Transfer to Emergency Fund'
                  : type === 'withdrawal'
                  ? 'e.g. Vacation expense withdrawal from Goal'
                  : 'e.g. Nature Basket Groceries or Electricity Bill'
              }
              className="w-full px-3 py-2 bg-apple-gray-50/80 dark:bg-apple-gray-850/80 border border-apple-gray-200 dark:border-apple-gray-750 rounded-apple-md text-xs font-medium text-apple-gray-900 dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-bubblegum focus:border-transparent transition"
              required
            />
          </div>
        </div>

        {/* Actions - Fixed Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 pt-3 mt-2 border-t border-apple-gray-150 dark:border-apple-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-gray-900 dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 rounded-apple-md transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-bubblegum hover:bg-bubblegum-hover text-white text-xs font-bold rounded-apple-md transition shadow-apple-pill active:scale-[0.98] flex items-center gap-1.5"
          >
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

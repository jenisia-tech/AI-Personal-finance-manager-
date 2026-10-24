import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentMode,
} from '../../types/finance';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialData?: Transaction | null;
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
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setPaymentMode(initialData.paymentMode);
      setDate(initialData.date);
      setDescription(initialData.description);
    } else {
      setType('expense');
      setAmount('');
      setCategory('Food');
      setPaymentMode('UPI');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

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

    onSubmit({
      type,
      amount: numAmount,
      category,
      paymentMode,
      date,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record Transaction'}
      subtitle="Track your inflows and outflows in Indian Rupees (₹)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-apple-sm bg-apple-red/10 border border-apple-red/20 text-apple-red text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type Toggle Tabs */}
        <div>
          <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 bg-apple-gray-100 dark:bg-apple-gray-850 p-1 rounded-apple-md">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'Salary' || category === 'Freelance') setCategory('Food');
              }}
              className={`py-2 text-xs font-semibold rounded-apple-sm transition ${
                type === 'expense'
                  ? 'bg-white dark:bg-apple-gray-900 text-apple-red shadow-sm'
                  : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salary');
              }}
              className={`py-2 text-xs font-semibold rounded-apple-sm transition ${
                type === 'income'
                  ? 'bg-white dark:bg-apple-gray-900 text-apple-green shadow-sm'
                  : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Amount in INR */}
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
              placeholder="e.g. 2500"
              className="w-full pl-8 pr-3 py-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-sm font-semibold text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue"
              required
            />
          </div>
        </div>

        {/* Category & Payment Mode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue"
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
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue"
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
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue"
            required
          />
        </div>

        {/* Description / Merchant */}
        <div>
          <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
            Description / Merchant
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Swiggy Gourmet Dinner or Client Invoice"
            className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white rounded-apple-sm transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-semibold rounded-apple-sm transition shadow-apple-pill"
          >
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

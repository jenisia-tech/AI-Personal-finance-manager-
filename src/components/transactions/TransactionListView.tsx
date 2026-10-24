import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ReceiptText,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { TransactionItem } from './TransactionItem';
import { TransactionFormModal } from './TransactionFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EmptyState } from '../common/EmptyState';
import { formatINR } from '../../utils/formatters';

const CATEGORIES = [
  'All',
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

const PAYMENT_MODES = [
  'All',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
];

export const TransactionListView: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, exportCSV } = useFinance();

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentModeFilter, setPaymentModeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search query
        if (search) {
          const q = search.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchAmt = t.amount.toString().includes(q);
          if (!matchDesc && !matchCat && !matchAmt) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;

        // Payment mode filter
        if (paymentModeFilter !== 'All' && t.paymentMode !== paymentModeFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
      });
  }, [transactions, search, typeFilter, categoryFilter, paymentModeFilter, sortBy, sortOrder]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [filteredTransactions]);

  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTx) {
      updateTransaction(editingTx.id, data);
    } else {
      addTransaction(data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header: Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
            Transactions
          </h2>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            {filteredTransactions.length} transaction(s) recorded • Net Inflow/Outflow: {formatINR(totalFilteredAmount)}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-apple-gray-850 hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingTx(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-apple-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, category, or amount..."
              className="w-full pl-9 pr-3 py-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white placeholder-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 bg-apple-gray-100 dark:bg-apple-gray-850 p-1 rounded-apple-md w-full md:w-auto">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-apple-sm text-xs font-semibold capitalize transition ${
                  typeFilter === t
                    ? 'bg-white dark:bg-apple-gray-900 text-apple-gray-900 dark:text-white shadow-sm'
                    : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Category, Payment Mode, and Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-apple-gray-100 dark:border-apple-gray-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-apple-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm px-2 py-1 text-apple-gray-900 dark:text-white outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-apple-gray-500">
            <span className="font-medium">Payment Mode:</span>
            <select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm px-2 py-1 text-apple-gray-900 dark:text-white outline-none cursor-pointer"
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-apple-gray-500 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="font-medium">Sort:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as 'date' | 'amount');
                setSortOrder(so as 'desc' | 'asc');
              }}
              className="bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm px-2 py-1 text-apple-gray-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="w-8 h-8" />}
          title="No Transactions Found"
          description={search ? 'No matches found for your current filter query.' : 'Record your first transaction to start tracking.'}
          actionText="Add Transaction"
          onAction={() => {
            setEditingTx(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-apple-gray-50/80 dark:bg-apple-gray-850/80 border-b border-apple-gray-200/80 dark:border-apple-gray-800 text-[11px] font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onEdit={handleEditClick}
                    onDelete={(item) => setDeletingTx(item)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTx}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTx)}
        onClose={() => setDeletingTx(null)}
        onConfirm={() => {
          if (deletingTx) deleteTransaction(deletingTx.id);
        }}
        transaction={deletingTx}
      />
    </div>
  );
};

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ReceiptText,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  PiggyBank,
  TrendingDown,
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
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

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
    return filteredTransactions.reduce((sum, t) => {
      if (t.type === 'income' || t.type === 'withdrawal') {
        return sum + t.amount;
      } else {
        return sum - t.amount;
      }
    }, 0);
  }, [filteredTransactions]);

  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    setModalType(tx.type);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTx) {
      await updateTransaction(editingTx.id, data);
    } else {
      await addTransaction(data);
    }
  };

  const openAddModal = (type: TransactionType) => {
    setEditingTx(null);
    setModalType(type);
    setIsFormOpen(true);
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
            {filteredTransactions.length} transaction(s) recorded • Net Cash Impact: {formatINR(totalFilteredAmount)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 bg-white dark:bg-apple-gray-850 hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-md text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 transition shadow-sm active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5 text-apple-gray-500" />
            <span>Export CSV</span>
          </button>

          {/* Add Income Action */}
          <button
            onClick={() => openAddModal('income')}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-apple-md text-xs font-semibold shadow-sm transition active:scale-[0.98]"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Add Income</span>
          </button>

          {/* Add Expense Action */}
          <button
            onClick={() => openAddModal('expense')}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-apple-md text-xs font-semibold shadow-sm transition active:scale-[0.98]"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          {/* More Types Popover */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 bg-bubblegum hover:bg-bubblegum-hover text-white rounded-apple-md text-xs font-semibold shadow-sm transition active:scale-[0.98]"
              aria-expanded={isMoreMenuOpen}
              aria-haspopup="true"
            >
              <Plus className="w-4 h-4" />
              <span>More Types</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMoreMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-apple-darkCard border border-apple-gray-200 dark:border-apple-gray-750 rounded-apple-xl shadow-apple-modal z-40 p-1.5 animate-scale-in">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-apple-gray-400 dark:text-apple-gray-500">
                  Additional Transaction Types
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    openAddModal('deposit');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-apple-md hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-left transition group"
                >
                  <div className="p-2 rounded-apple-md bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-apple-gray-900 dark:text-white">
                      Deposit to Goal
                    </div>
                    <div className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400">
                      Allocate savings into a target goal
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    openAddModal('withdrawal');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-apple-md hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-left transition group"
                >
                  <div className="p-2 rounded-apple-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-apple-gray-900 dark:text-white">
                      Withdraw from Goal
                    </div>
                    <div className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400">
                      Withdraw saved funds from a goal
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-3">
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
          <div className="flex items-center gap-1 bg-apple-gray-100 dark:bg-apple-gray-850 p-1 rounded-apple-md w-full md:w-auto overflow-x-auto">
            {(['all', 'income', 'expense', 'deposit', 'withdrawal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-apple-sm text-xs font-semibold capitalize whitespace-nowrap transition ${
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
          description={
            search || typeFilter !== 'all' || categoryFilter !== 'All'
              ? 'No matches found for your current filter query.'
              : 'Record your first income or expense to start tracking your finances.'
          }
          actionText="Add Income"
          onAction={() => openAddModal('income')}
        />
      ) : (
        <div className="rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card overflow-hidden">
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
        initialType={modalType}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTx)}
        onClose={() => setDeletingTx(null)}
        onConfirm={async () => {
          if (deletingTx) await deleteTransaction(deletingTx.id);
        }}
        transaction={deletingTx}
      />
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  UserProfile,
  AgentGoalId,
} from '../types/finance';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { getCurrentYearMonth } from '../utils/formatters';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  userProfile: UserProfile;
  activeMonth: string;
  darkMode: boolean;
  activeGoalId: AgentGoalId;
  toasts: Toast[];
  isLoadingData: boolean;

  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Budget CRUD
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Goals CRUD
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  depositToGoal: (id: string, amount: number, paymentMode?: string) => Promise<void>;
  withdrawFromGoal: (id: string, amount: number, paymentMode?: string) => Promise<void>;

  // Profile & Preferences
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setActiveMonth: (month: string) => void;
  setActiveGoalId: (goalId: AgentGoalId) => void;
  toggleDarkMode: () => void;
  resetToDemo: () => Promise<void>;
  exportJSON: () => Promise<void>;
  importJSON: (jsonString: string) => Promise<boolean>;
  exportCSV: () => void;
  refreshData: () => Promise<void>;

  // Toast notifications
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const defaultProfile: UserProfile = {
  name: 'User',
  email: '',
  monthlyIncome: 0,
  currency: 'INR',
  theme: 'light',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [activeMonth, setActiveMonth] = useState<string>(() => getCurrentYearMonth());
  const [activeGoalId, setActiveGoalId] = useState<AgentGoalId>('avoid_budget_breach');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch all user records from database when authenticated
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setUserProfile(defaultProfile);
      return;
    }

    setIsLoadingData(true);
    try {
      const [txList, budgetList, goalList, profileData] = await Promise.all([
        api.transactions.list(),
        api.budgets.list(),
        api.goals.list(),
        api.user.getProfile(),
      ]);

      setTransactions(txList);
      setBudgets(budgetList);
      setGoals(goalList);
      if (profileData) {
        setUserProfile(profileData);
        if (profileData.theme) {
          setDarkMode(profileData.theme === 'dark');
        }
      }
    } catch (err: any) {
      console.error('Failed to load user financial data from database', err);
      showToast('Could not load financial records from server', 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setUserProfile(defaultProfile);
    }
  }, [isAuthenticated, refreshData]);

  const toggleDarkMode = async () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    const updatedTheme = nextMode ? ('dark' as const) : ('light' as const);
    const updated = { ...userProfile, theme: updatedTheme };
    setUserProfile(updated);
    if (isAuthenticated) {
      try {
        await api.user.updateProfile({ theme: updatedTheme });
      } catch (err) {
        console.error('Failed to save theme preference', err);
      }
    }
  };

  // Transactions CRUD
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const createdTx = await api.transactions.create(tx);
      setTransactions(prev => [createdTx, ...prev]);
      showToast(
        `Added ${createdTx.type === 'income' ? 'income' : createdTx.type === 'expense' ? 'expense' : createdTx.type}: ${createdTx.description}`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to save transaction', 'error');
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTx = await api.transactions.update(id, updates);
      setTransactions(prev => prev.map(t => (t.id === id ? updatedTx : t)));
      showToast('Transaction updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update transaction', 'error');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const target = transactions.find(t => t.id === id);
      await api.transactions.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      showToast(`Deleted transaction: ${target ? target.description : ''}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete transaction', 'error');
      throw err;
    }
  };

  // Budgets CRUD
  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const created = await api.budgets.create(budget);
      setBudgets(prev => {
        const filtered = prev.filter(b => b.category !== created.category);
        return [...filtered, created];
      });
      showToast(`Saved budget for ${created.category}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save budget', 'error');
      throw err;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const updated = await api.budgets.update(id, updates);
      setBudgets(prev => prev.map(b => (b.id === id ? updated : b)));
      showToast('Budget updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update budget', 'error');
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await api.budgets.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      showToast('Budget removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete budget', 'error');
      throw err;
    }
  };

  // Goals CRUD
  const addGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    try {
      const created = await api.goals.create(goal);
      setGoals(prev => [...prev, created]);
      showToast(`Created goal: ${created.title}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create goal', 'error');
      throw err;
    }
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const updated = await api.goals.update(id, updates);
      setGoals(prev => prev.map(g => (g.id === id ? updated : g)));
      showToast('Savings goal updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update goal', 'error');
      throw err;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await api.goals.delete(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      showToast('Savings goal deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete goal', 'error');
      throw err;
    }
  };

  const depositToGoal = async (id: string, amount: number, paymentMode = 'UPI') => {
    if (amount <= 0) return;
    try {
      const res = await api.goals.deposit(id, amount, paymentMode);
      setGoals(prev => prev.map(g => (g.id === id ? res.goal : g)));
      if (res.transaction) {
        setTransactions(prev => [res.transaction, ...prev]);
      }
      showToast(res.message || `Deposited ₹${amount.toLocaleString('en-IN')}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Deposit failed', 'error');
      throw err;
    }
  };

  const withdrawFromGoal = async (id: string, amount: number, paymentMode = 'Net Banking') => {
    if (amount <= 0) return;
    try {
      const res = await api.goals.withdraw(id, amount, paymentMode);
      setGoals(prev => prev.map(g => (g.id === id ? res.goal : g)));
      if (res.transaction) {
        setTransactions(prev => [res.transaction, ...prev]);
      }
      showToast(res.message || `Withdrew ₹${amount.toLocaleString('en-IN')}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Withdrawal failed', 'error');
      throw err;
    }
  };

  // Profile Update
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await api.user.updateProfile(updates);
      setUserProfile(updated);
      showToast('Profile updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
      throw err;
    }
  };

  // Reset / Load Demo Data (Explicit Dev Action Only)
  const resetToDemo = async () => {
    try {
      await api.data.devSeed();
      await refreshData();
      showToast('Loaded demo dataset for evaluation', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to seed demo data', 'error');
    }
  };

  // Export JSON Snapshot
  const exportJSON = async () => {
    try {
      const data = await api.data.exportSnapshot();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance_backup_${getCurrentYearMonth()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Backup JSON exported successfully', 'success');
    } catch (err: any) {
      showToast('Failed to export backup JSON', 'error');
    }
  };

  // Import JSON Snapshot
  const importJSON = async (jsonString: string): Promise<boolean> => {
    try {
      const payload = JSON.parse(jsonString);
      const res = await api.data.importSnapshot(payload);
      await refreshData();
      showToast(res.message || 'Backup restored successfully!', 'success');
      return true;
    } catch (err: any) {
      console.error('Import failed', err);
      showToast(err.message || 'Invalid backup file format.', 'error');
      return false;
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount (INR)', 'Payment Mode'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.paymentMode,
    ]);
    const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${getCurrentYearMonth()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Transactions exported to CSV', 'success');
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        userProfile,
        activeMonth,
        darkMode,
        activeGoalId,
        toasts,
        isLoadingData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        withdrawFromGoal,
        updateProfile,
        setActiveMonth,
        setActiveGoalId,
        toggleDarkMode,
        resetToDemo,
        exportJSON,
        importJSON,
        exportCSV,
        refreshData,
        showToast,
        removeToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

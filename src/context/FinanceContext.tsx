import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  UserProfile,
  AgentGoalId,
} from '../types/finance';
import { storageService } from '../services/storageService';
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

  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budget CRUD
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Goals CRUD
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (id: string, amount: number) => void;
  withdrawFromGoal: (id: string, amount: number) => void;

  // Profile & Preferences
  updateProfile: (updates: Partial<UserProfile>) => void;
  setActiveMonth: (month: string) => void;
  setActiveGoalId: (goalId: AgentGoalId) => void;
  toggleDarkMode: () => void;
  resetToDemo: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
  exportCSV: () => void;

  // Toast notifications
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.loadTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => storageService.loadBudgets());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => storageService.loadGoals());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.loadProfile());
  const [activeMonth, setActiveMonth] = useState<string>(() => getCurrentYearMonth());
  const [activeGoalId, setActiveGoalId] = useState<AgentGoalId>('avoid_budget_breach');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return userProfile.theme === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
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

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    const updated = { ...userProfile, theme: nextMode ? ('dark' as const) : ('light' as const) };
    setUserProfile(updated);
    storageService.saveProfile(updated);
  };

  // Transactions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    storageService.saveTransactions(updated);
    showToast(`Added ${newTx.type === 'income' ? 'income' : 'expense'}: ${newTx.description}`, 'success');
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => (t.id === id ? { ...t, ...updates } : t));
    setTransactions(updated);
    storageService.saveTransactions(updated);
    showToast('Transaction updated successfully', 'success');
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    storageService.saveTransactions(updated);
    showToast(`Deleted transaction: ${target ? target.description : ''}`, 'info');
  };

  // Budgets
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: `b-${Date.now()}`,
    };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    storageService.saveBudgets(updated);
    showToast(`Created budget for ${newBudget.category}`, 'success');
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map(b => (b.id === id ? { ...b, ...updates } : b));
    setBudgets(updated);
    storageService.saveBudgets(updated);
    showToast('Budget updated successfully', 'success');
  };

  const deleteBudget = (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    storageService.saveBudgets(updated);
    showToast('Budget removed', 'info');
  };

  // Goals
  const addGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `g-${Date.now()}`,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    storageService.saveGoals(updated);
    showToast(`Created goal: ${newGoal.title}`, 'success');
  };

  const updateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    const updated = goals.map(g => (g.id === id ? { ...g, ...updates } : g));
    setGoals(updated);
    storageService.saveGoals(updated);
    showToast('Savings goal updated', 'success');
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    storageService.saveGoals(updated);
    showToast('Savings goal deleted', 'info');
  };

  const depositToGoal = (id: string, amount: number) => {
    if (amount <= 0) return;
    const target = goals.find(g => g.id === id);
    if (!target) return;

    const newAmount = target.currentAmount + amount;
    const updated = goals.map(g => (g.id === id ? { ...g, currentAmount: newAmount } : g));
    setGoals(updated);
    storageService.saveGoals(updated);
    showToast(`Deposited ₹${amount.toLocaleString('en-IN')} to ${target.title}`, 'success');
  };

  const withdrawFromGoal = (id: string, amount: number) => {
    if (amount <= 0) return;
    const target = goals.find(g => g.id === id);
    if (!target) return;

    const newAmount = Math.max(0, target.currentAmount - amount);
    const updated = goals.map(g => (g.id === id ? { ...g, currentAmount: newAmount } : g));
    setGoals(updated);
    storageService.saveGoals(updated);
    showToast(`Withdrew ₹${amount.toLocaleString('en-IN')} from ${target.title}`, 'info');
  };

  // Profile
  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    storageService.saveProfile(updated);
    showToast('Profile updated', 'success');
  };

  // Reset to Demo Data
  const resetToDemo = () => {
    const reset = storageService.resetToDemo();
    setTransactions(reset.transactions);
    setBudgets(reset.budgets);
    setGoals(reset.goals);
    setUserProfile(reset.profile);
    showToast('Application reset to default demo dataset', 'success');
  };

  // Export JSON Snapshot
  const exportJSON = () => {
    const jsonStr = storageService.exportJSONSnapshot();
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
  };

  // Import JSON Snapshot
  const importJSON = (jsonString: string): boolean => {
    const ok = storageService.importJSONSnapshot(jsonString);
    if (ok) {
      setTransactions(storageService.loadTransactions());
      setBudgets(storageService.loadBudgets());
      setGoals(storageService.loadGoals());
      setUserProfile(storageService.loadProfile());
      showToast('Backup restored successfully!', 'success');
      return true;
    }
    showToast('Invalid backup file format.', 'error');
    return false;
  };

  // Export CSV
  const exportCSV = () => {
    const csvStr = storageService.exportTransactionsCSV(transactions);
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

import { Transaction, Budget, SavingsGoal, UserProfile } from '../types/finance';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_USER_PROFILE,
} from './demoData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'fin_manager_transactions_v2',
  BUDGETS: 'fin_manager_budgets_v2',
  GOALS: 'fin_manager_goals_v2',
  PROFILE: 'fin_manager_profile_v2',
  THEME: 'fin_manager_theme_v2',
};

export const storageService = {
  loadTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        this.saveTransactions(INITIAL_TRANSACTIONS);
        return INITIAL_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  },

  loadBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        this.saveBudgets(INITIAL_BUDGETS);
        return INITIAL_BUDGETS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets(budgets: Budget[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets to localStorage', e);
    }
  },

  loadGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) {
        this.saveGoals(INITIAL_SAVINGS_GOALS);
        return INITIAL_SAVINGS_GOALS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  },

  saveGoals(goals: SavingsGoal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals to localStorage', e);
    }
  },

  loadProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) {
        this.saveProfile(INITIAL_USER_PROFILE);
        return INITIAL_USER_PROFILE;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USER_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  resetToDemo(): {
    transactions: Transaction[];
    budgets: Budget[];
    goals: SavingsGoal[];
    profile: UserProfile;
  } {
    this.saveTransactions(INITIAL_TRANSACTIONS);
    this.saveBudgets(INITIAL_BUDGETS);
    this.saveGoals(INITIAL_SAVINGS_GOALS);
    this.saveProfile(INITIAL_USER_PROFILE);
    return {
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      goals: INITIAL_SAVINGS_GOALS,
      profile: INITIAL_USER_PROFILE,
    };
  },

  exportJSONSnapshot(): string {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      transactions: this.loadTransactions(),
      budgets: this.loadBudgets(),
      goals: this.loadGoals(),
      profile: this.loadProfile(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importJSONSnapshot(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) this.saveTransactions(data.transactions);
      if (Array.isArray(data.budgets)) this.saveBudgets(data.budgets);
      if (Array.isArray(data.goals)) this.saveGoals(data.goals);
      if (data.profile) this.saveProfile(data.profile);
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  },

  exportTransactionsCSV(transactions: Transaction[]): string {
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
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },
};

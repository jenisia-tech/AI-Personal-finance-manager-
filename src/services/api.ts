import { Transaction, Budget, SavingsGoal, UserProfile } from '../types/finance';

const BASE_URL = ''; // Relative path, handled by Vite proxy to backend

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

let authToken: string | null = null;

export function setClientToken(token: string | null): void {
  authToken = token;
  if (token) {
    try {
      localStorage.setItem('finintel_auth_token', token);
    } catch {
      // localStorage might fail in restricted privacy mode
    }
  } else {
    try {
      localStorage.removeItem('finintel_auth_token');
    } catch {}
  }
}

export function getClientToken(): string | null {
  if (authToken) return authToken;
  try {
    authToken = localStorage.getItem('finintel_auth_token');
    return authToken;
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getClientToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Automatically send and receive HttpOnly cookies
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `HTTP error ${response.status}`;
    throw new ApiError(response.status, errorMsg, data);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    async register(name: string, email: string, password: string, confirmPassword: string) {
      const res = await request<{ success: boolean; user: UserProfile; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      if (res.token) setClientToken(res.token);
      return res;
    },

    async login(email: string, password: string) {
      const res = await request<{ success: boolean; user: UserProfile; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setClientToken(res.token);
      return res;
    },

    async logout() {
      try {
        await request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
      } finally {
        setClientToken(null);
      }
    },

    async getMe() {
      return request<{ success: boolean; user: UserProfile }>('/api/auth/me');
    },
  },

  // Transactions
  transactions: {
    async list() {
      const res = await request<{ success: boolean; transactions: Transaction[] }>('/api/transactions');
      return res.transactions;
    },

    async create(tx: Omit<Transaction, 'id' | 'createdAt'>) {
      const res = await request<{ success: boolean; transaction: Transaction }>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(tx),
      });
      return res.transaction;
    },

    async update(id: string, updates: Partial<Transaction>) {
      const res = await request<{ success: boolean; transaction: Transaction }>(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return res.transaction;
    },

    async delete(id: string) {
      await request<{ success: boolean; id: string }>(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
  },

  // Budgets
  budgets: {
    async list() {
      const res = await request<{ success: boolean; budgets: Budget[] }>('/api/budgets');
      return res.budgets;
    },

    async create(budget: Omit<Budget, 'id'>) {
      const res = await request<{ success: boolean; budget: Budget }>('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(budget),
      });
      return res.budget;
    },

    async update(id: string, updates: Partial<Budget>) {
      const res = await request<{ success: boolean; budget: Budget }>(`/api/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return res.budget;
    },

    async delete(id: string) {
      await request<{ success: boolean; id: string }>(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
  },

  // Savings Goals
  goals: {
    async list() {
      const res = await request<{ success: boolean; goals: SavingsGoal[] }>('/api/goals');
      return res.goals;
    },

    async create(goal: Omit<SavingsGoal, 'id'>) {
      const res = await request<{ success: boolean; goal: SavingsGoal }>('/api/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      });
      return res.goal;
    },

    async update(id: string, updates: Partial<SavingsGoal>) {
      const res = await request<{ success: boolean; goal: SavingsGoal }>(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return res.goal;
    },

    async delete(id: string) {
      await request<{ success: boolean; id: string }>(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      return id;
    },

    async deposit(id: string, amount: number, paymentMode?: string) {
      return request<{ success: boolean; goal: SavingsGoal; transaction: Transaction; message: string }>(
        `/api/goals/${id}/deposit`,
        {
          method: 'POST',
          body: JSON.stringify({ amount, paymentMode }),
        }
      );
    },

    async withdraw(id: string, amount: number, paymentMode?: string) {
      return request<{ success: boolean; goal: SavingsGoal; transaction: Transaction; message: string }>(
        `/api/goals/${id}/withdraw`,
        {
          method: 'POST',
          body: JSON.stringify({ amount, paymentMode }),
        }
      );
    },
  },

  // User Profile
  user: {
    async getProfile() {
      const res = await request<{ success: boolean; profile: UserProfile }>('/api/user/profile');
      return res.profile;
    },

    async updateProfile(updates: Partial<UserProfile>) {
      const res = await request<{ success: boolean; profile: UserProfile; message: string }>('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return res.profile;
    },
  },

  // Data & Snapshots
  data: {
    async devSeed() {
      return request<{ success: boolean; message: string }>('/api/data/dev-seed', {
        method: 'POST',
      });
    },

    async exportSnapshot() {
      return request<any>('/api/data/export');
    },

    async importSnapshot(payload: any) {
      return request<{ success: boolean; message: string; stats: any }>('/api/data/import', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },
};

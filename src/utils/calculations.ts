import {
  Transaction,
  Budget,
  SavingsGoal,
  FinancialHealthScore,
  TransactionCategory,
} from '../types/finance';

/**
 * Filter transactions by matching Year-Month (e.g. '2026-10')
 */
export function filterTransactionsByMonth(transactions: Transaction[], yearMonth?: string): Transaction[] {
  if (!yearMonth) return transactions;
  return transactions.filter(t => t.date.startsWith(yearMonth));
}

export function calculateTotalIncome(transactions: Transaction[], yearMonth?: string): number {
  const filtered = filterTransactionsByMonth(transactions, yearMonth);
  return filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalExpenses(transactions: Transaction[], yearMonth?: string): number {
  const filtered = filterTransactionsByMonth(transactions, yearMonth);
  return filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalDeposits(transactions: Transaction[], yearMonth?: string): number {
  const filtered = filterTransactionsByMonth(transactions, yearMonth);
  return filtered
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalWithdrawals(transactions: Transaction[], yearMonth?: string): number {
  const filtered = filterTransactionsByMonth(transactions, yearMonth);
  return filtered
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateNetSavings(
  income: number,
  expenses: number,
  deposits: number = 0,
  withdrawals: number = 0
): number {
  return income + withdrawals - expenses - deposits;
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const net = income - expenses;
  if (net <= 0) return 0;
  return Math.min(100, Math.round((net / income) * 100));
}

export function calculateCategoryExpenses(
  transactions: Transaction[],
  yearMonth?: string
): Record<TransactionCategory, number> {
  const filtered = filterTransactionsByMonth(transactions, yearMonth).filter(t => t.type === 'expense');
  const record = {} as Record<TransactionCategory, number>;

  for (const t of filtered) {
    record[t.category] = (record[t.category] || 0) + t.amount;
  }

  return record;
}

export function calculateDailySpendRate(expenses: number, daysElapsed: number): number {
  if (daysElapsed <= 0) return 0;
  return Math.round(expenses / daysElapsed);
}

export function calculateSafeDailyAllowance(surplus: number, daysRemaining: number): number {
  if (daysRemaining <= 0 || surplus <= 0) return 0;
  return Math.round(surplus / daysRemaining);
}

export function calculateBudgetUtilization(spent: number, limit: number): number {
  if (limit <= 0) return spent > 0 ? 100 : 0;
  return Math.round((spent / limit) * 100);
}

export function isDiscretionaryCategory(category: TransactionCategory): boolean {
  const discretionary: TransactionCategory[] = ['Shopping', 'Entertainment', 'Other'];
  return discretionary.includes(category);
}

export function calculateHealthScore(
  income: number,
  expenses: number,
  budgets: Budget[],
  goals: SavingsGoal[],
  categoryExpenses: Record<string, number>
): FinancialHealthScore {
  let score = 50; // base score
  const factors: FinancialHealthScore['factors'] = [];
  const recommendations: string[] = [];

  // 1. Savings rate component (0 - 30 pts)
  if (income > 0) {
    const savingsRate = calculateSavingsRate(income, expenses);
    if (savingsRate >= 30) {
      score += 25;
      factors.push({
        name: 'Strong Savings Rate',
        impact: 'positive',
        description: `You are saving ${savingsRate}% of your monthly income.`,
      });
    } else if (savingsRate >= 15) {
      score += 15;
      factors.push({
        name: 'Moderate Savings Rate',
        impact: 'positive',
        description: `You are saving ${savingsRate}% of your monthly income. Aim for 20%+.`,
      });
    } else if (savingsRate > 0) {
      score += 5;
      factors.push({
        name: 'Low Savings Rate',
        impact: 'warning',
        description: `Savings rate is only ${savingsRate}%. Try to trim discretionary costs.`,
      });
      recommendations.push('Aim to save at least 20% of your net monthly earnings.');
    } else {
      score -= 20;
      factors.push({
        name: 'Deficit / No Savings',
        impact: 'negative',
        description: 'Expenses exceed your income this month.',
      });
      recommendations.push('Immediate action needed: Cut unneeded subscriptions and dining expenses.');
    }
  } else {
    factors.push({
      name: 'No Income Recorded',
      impact: 'warning',
      description: 'Record your salary or inflows to calculate accurate savings ratios.',
    });
  }

  // 2. Budget adherence component (0 - 25 pts)
  let breachedBudgets = 0;
  let nearBreachBudgets = 0;

  for (const b of budgets) {
    const spent = categoryExpenses[b.category] || 0;
    const util = calculateBudgetUtilization(spent, b.limit);
    if (util > 100) breachedBudgets++;
    else if (util >= b.alertThreshold) nearBreachBudgets++;
  }

  if (breachedBudgets === 0 && nearBreachBudgets === 0 && budgets.length > 0) {
    score += 15;
    factors.push({
      name: 'Disciplined Budgets',
      impact: 'positive',
      description: 'All expense categories are strictly within assigned limits.',
    });
  } else if (breachedBudgets > 0) {
    score -= breachedBudgets * 10;
    factors.push({
      name: 'Over-Budget Categories',
      impact: 'negative',
      description: `${breachedBudgets} category budget(s) have been breached.`,
    });
    recommendations.push('Review category limits and freeze discretionary purchases in over-budget sectors.');
  }

  // 3. Savings goals progress (0 - 15 pts)
  if (goals.length > 0) {
    const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const goalRatio = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    if (goalRatio >= 50) {
      score += 10;
      factors.push({
        name: 'Active Goal Funding',
        impact: 'positive',
        description: `Savings goals funded at ${Math.round(goalRatio)}% overall.`,
      });
    } else {
      factors.push({
        name: 'Goal Funding Underway',
        impact: 'warning',
        description: `Savings goals are currently at ${Math.round(goalRatio)}% of milestone targets.`,
      });
    }
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(10, Math.min(100, Math.round(score)));

  let grade: FinancialHealthScore['grade'] = 'Fair';
  if (finalScore >= 80) grade = 'Excellent';
  else if (finalScore >= 65) grade = 'Good';
  else if (finalScore >= 45) grade = 'Fair';
  else grade = 'Critical';

  return {
    score: finalScore,
    grade,
    factors,
    recommendations,
  };
}

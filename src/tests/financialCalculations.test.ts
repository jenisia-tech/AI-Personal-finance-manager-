import { describe, it, expect } from 'vitest';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateTotalDeposits,
  calculateTotalWithdrawals,
  calculateNetSavings,
  calculateSavingsRate,
  calculateCategoryExpenses,
} from '../utils/calculations';
import { Transaction } from '../types/finance';
import { perceiveFinancialState } from '../services/financialAgentService';
import { extractFinancialFacts, runForwardChainingReasoning } from '../services/financialReasoningService';

describe('Financial Calculations & State Integrity', () => {
  it('1. Calculates exact total income from transactions without clamping or randomization', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'income',
        amount: 30000,
        category: 'Salary',
        paymentMode: 'Net Banking',
        date: '2026-10-01',
        description: 'Software Salary',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx-2',
        type: 'income',
        amount: 5450.75,
        category: 'Freelance',
        paymentMode: 'UPI',
        date: '2026-10-05',
        description: 'Freelance Design',
        createdAt: new Date().toISOString(),
      },
    ];

    const total = calculateTotalIncome(transactions, '2026-10');
    expect(total).toBe(35450.75); // Exact amount with decimals
  });

  it('2. Empty transaction list calculates 0 income and 0 expenses without invented defaults', () => {
    const emptyTxs: Transaction[] = [];
    const income = calculateTotalIncome(emptyTxs, '2026-10');
    const expenses = calculateTotalExpenses(emptyTxs, '2026-10');
    const net = calculateNetSavings(income, expenses);

    expect(income).toBe(0);
    expect(expenses).toBe(0);
    expect(net).toBe(0);
  });

  it('3. Accurately accounts for deposits and withdrawals in net liquid balance', () => {
    const mixedTxs: Transaction[] = [
      { id: '1', type: 'deposit', amount: 10000, category: 'Investments', paymentMode: 'UPI', date: '2026-10-01', description: 'Dep', createdAt: '' },
      { id: '2', type: 'withdrawal', amount: 2000, category: 'Investments', paymentMode: 'UPI', date: '2026-10-02', description: 'With', createdAt: '' },
    ];
    const totalDep = calculateTotalDeposits(mixedTxs, '2026-10');
    const totalWith = calculateTotalWithdrawals(mixedTxs, '2026-10');
    expect(totalDep).toBe(10000);
    expect(totalWith).toBe(2000);

    const income = 50000;
    const expenses = 20000;

    // Liquid balance = Income + Withdrawals - Expenses - Deposits
    const liquidBalance = calculateNetSavings(income, expenses, totalDep, totalWith);
    expect(liquidBalance).toBe(22000); // 50000 + 2000 - 20000 - 10000 = 22000

    const rate = calculateSavingsRate(income, expenses);
    expect(rate).toBe(60);
  });

  it('4. Filters transactions by month properly', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'income',
        amount: 50000,
        category: 'Salary',
        paymentMode: 'Net Banking',
        date: '2026-10-01',
        description: 'October Salary',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx-2',
        type: 'income',
        amount: 50000,
        category: 'Salary',
        paymentMode: 'Net Banking',
        date: '2026-09-01',
        description: 'September Salary',
        createdAt: new Date().toISOString(),
      },
    ];

    const octIncome = calculateTotalIncome(transactions, '2026-10');
    const sepIncome = calculateTotalIncome(transactions, '2026-09');
    const allIncome = calculateTotalIncome(transactions);

    expect(octIncome).toBe(50000);
    expect(sepIncome).toBe(50000);
    expect(allIncome).toBe(100000);
  });

  it('5. Category expenses calculation ignores income transactions', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'income',
        amount: 80000,
        category: 'Salary',
        paymentMode: 'Net Banking',
        date: '2026-10-01',
        description: 'Salary',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx-2',
        type: 'expense',
        amount: 4500,
        category: 'Food',
        paymentMode: 'UPI',
        date: '2026-10-02',
        description: 'Groceries',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx-3',
        type: 'expense',
        amount: 2500,
        category: 'Bills',
        paymentMode: 'UPI',
        date: '2026-10-03',
        description: 'Electricity',
        createdAt: new Date().toISOString(),
      },
    ];

    const catMap = calculateCategoryExpenses(transactions, '2026-10');
    expect(catMap.Food).toBe(4500);
    expect(catMap.Bills).toBe(2500);
    expect(catMap.Salary).toBeUndefined(); // Income categories must not appear in expenses
  });

  it('6. Empty dataset in AI Agent Perception gives zero totals without throwing', () => {
    const perception = perceiveFinancialState([], [], [], 0, '2026-10');
    expect(perception.totalIncome).toBe(0);
    expect(perception.totalExpenses).toBe(0);
    expect(perception.netSurplus).toBe(0);
    expect(perception.savingsRate).toBe(0);
    expect(perception.highestCategory).toBeNull();
  });

  it('7. Empty dataset in Rule Engine fires ZERO_INCOME_ANOMALY without inventing numbers', () => {
    const facts = extractFinancialFacts([], [], [], 0, '2026-10');
    expect(facts.totalIncome.value).toBe(0);
    expect(facts.totalExpenses.value).toBe(0);

    const { results } = runForwardChainingReasoning(facts);
    const zeroRule = results.find(r => r.ruleId === 'RULE_04_ZERO_INCOME_ANOMALY');
    expect(zeroRule).toBeDefined();
    expect(zeroRule?.satisfied).toBe(true);
  });
});

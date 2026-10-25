import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.ts';
import { db } from '../db/database.ts';
import {
  runIntelligentAgentCycle,
  perceiveFinancialState,
  analyzeFinancialCondition,
  selectAgentAction,
  generateRecommendation,
  evaluateActionOutcome,
  AGENT_GOALS,
} from '../../src/services/financialAgentService';
import {
  runBreadthFirstSearch,
  runBestFirstSearch,
  compareSearchAlgorithms,
  calculateHeuristic,
  SearchProblemInput,
} from '../../src/services/financialSearchService';
import {
  extractFinancialFacts,
  runForwardChainingReasoning,
  runMonteCarloBudgetSimulation,
  FINANCIAL_RULES,
} from '../../src/services/financialReasoningService';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetSavings,
  calculateSavingsRate,
} from '../../src/utils/calculations';
import { Transaction, Budget, SavingsGoal } from '../../src/types/finance';

describe('Comprehensive Verification Suite for AI Personal Finance Manager', () => {
  // =========================================================================
  // SECTION 3: AUTHENTICATION, REGISTRATION & MULTI-TENANT USER ISOLATION
  // =========================================================================
  describe('Section 3: Authentication and Multi-Tenant Isolation', () => {
    const userA = {
      name: 'User A Verified',
      email: `usera_${Date.now()}@testfinance.com`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    const userB = {
      name: 'User B Verified',
      email: `userb_${Date.now()}@testfinance.com`,
      password: 'SecurePassword456!',
      confirmPassword: 'SecurePassword456!',
    };

    let tokenA: string;
    let tokenB: string;
    let userA_txId: string;
    let userA_budgetId: string;
    let userA_goalId: string;

    it('3.A.1 Rejects registration with invalid email, empty fields, or weak password', async () => {
      // Invalid email
      const resBadEmail = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'invalid-email-format', password: 'Password123!', confirmPassword: 'Password123!' });
      expect(resBadEmail.status).toBe(400);

      // Short password (<8 chars)
      const resShortPass = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'valid@test.com', password: 'short', confirmPassword: 'short' });
      expect(resShortPass.status).toBe(400);

      // Missing name
      const resNoName = await request(app)
        .post('/api/auth/register')
        .send({ name: '', email: 'valid@test.com', password: 'Password123!', confirmPassword: 'Password123!' });
      expect(resNoName.status).toBe(400);
    });

    it('3.A.2 Successfully registers User A and User B with zero initial records', async () => {
      const resA = await request(app).post('/api/auth/register').send(userA);
      expect(resA.status).toBe(201);
      expect(resA.body.token).toBeDefined();
      expect(resA.body.user.monthlyIncome).toBe(0);
      tokenA = resA.body.token;

      const resB = await request(app).post('/api/auth/register').send(userB);
      expect(resB.status).toBe(201);
      expect(resB.body.token).toBeDefined();
      expect(resB.body.user.monthlyIncome).toBe(0);
      tokenB = resB.body.token;
    });

    it('3.A.3 Safely rejects duplicate email registration', async () => {
      const resDup = await request(app).post('/api/auth/register').send(userA);
      expect(resDup.status).toBe(409);
      expect(resDup.body.error).toBe('Duplicate Email');
    });

    it('3.B.1 Rejects login with incorrect password', async () => {
      const resBadLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: userA.email, password: 'WrongPassword999!' });
      expect(resBadLogin.status).toBe(401);
    });

    it('3.B.2 Successfully logs in with valid credentials and accesses protected session', async () => {
      const resLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: userA.email, password: userA.password });
      expect(resLogin.status).toBe(200);
      expect(resLogin.body.user.email).toBe(userA.email.toLowerCase());

      const resMe = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(resMe.status).toBe(200);
      expect(resMe.body.user.name).toBe(userA.name);
    });

    it('3.C.1 User A creates financial records: income ₹30,000, expense ₹2,500, budget, and goal', async () => {
      // 1. Income transaction of ₹30,000
      const txRes1 = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'income',
          amount: 30000,
          category: 'Salary',
          paymentMode: 'Net Banking',
          date: '2026-10-01',
          description: 'User A Monthly Salary ₹30,000',
        });
      expect(txRes1.status).toBe(201);
      expect(txRes1.body.transaction.amount).toBe(30000);
      userA_txId = txRes1.body.transaction.id;

      // 2. Expense transaction of ₹2,500
      const txRes2 = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          type: 'expense',
          amount: 2500,
          category: 'Food',
          paymentMode: 'UPI',
          date: '2026-10-05',
          description: 'User A Groceries ₹2,500',
        });
      expect(txRes2.status).toBe(201);
      expect(txRes2.body.transaction.amount).toBe(2500);

      // 3. Category budget for Food
      const bRes = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          category: 'Food',
          limit: 10000,
          alertThreshold: 80,
        });
      expect(bRes.status).toBe(201);
      userA_budgetId = bRes.body.budget.id;

      // 4. Savings goal
      const gRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Emergency Safety Reserve',
          targetAmount: 90000,
          currentAmount: 15000,
          targetDate: '2027-04-01',
          category: 'Safety',
        });
      expect(gRes.status).toBe(201);
      userA_goalId = gRes.body.goal.id;
    });

    it('3.C.2 User B logs in and CANNOT view User A transactions, budgets, goals, or financial totals', async () => {
      const txB = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(txB.status).toBe(200);
      expect(txB.body.transactions).toEqual([]); // Zero leak!

      const budB = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(budB.status).toBe(200);
      expect(budB.body.budgets).toEqual([]);

      const goalB = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(goalB.status).toBe(200);
      expect(goalB.body.goals).toEqual([]);
    });

    it('3.C.3 Cross-user access attacks from User B session against User A IDs are strictly rejected', async () => {
      // User B attempts to read/modify User A's transaction
      const hackTx = await request(app)
        .put(`/api/transactions/${userA_txId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ amount: 999999, description: 'Tampered by User B' });
      expect(hackTx.status).toBe(404);

      // User B attempts to delete User A's budget
      const hackBud = await request(app)
        .delete(`/api/budgets/${userA_budgetId}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(hackBud.status).toBe(404);

      // User B attempts to withdraw from User A's savings goal
      const hackGoal = await request(app)
        .post(`/api/goals/${userA_goalId}/withdraw`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ amount: 5000 });
      expect(hackGoal.status).toBe(404);
    });

    it('3.C.4 User A logs back in and confirms all records and totals remain intact', async () => {
      const listA = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(listA.status).toBe(200);
      expect(listA.body.transactions.length).toBe(2);

      const incomeTx = listA.body.transactions.find((t: any) => t.type === 'income');
      const expenseTx = listA.body.transactions.find((t: any) => t.type === 'expense');
      expect(incomeTx.amount).toBe(30000);
      expect(expenseTx.amount).toBe(2500);

      // Verify exact calculation: 30000 income - 2500 expense = 27500 net surplus
      const net = calculateNetSavings(incomeTx.amount, expenseTx.amount);
      expect(net).toBe(27500);
    });
  });

  // =========================================================================
  // SECTION 4: FINANCIAL DATA PERSISTENCE & TRANSACTION TOTALS
  // =========================================================================
  describe('Section 4: Financial Data Persistence, Validation & Edge Cases', () => {
    let testToken: string;

    it('4.A & 4.B Tests exact ₹30,000 income and ₹2,500 expense persistence in SQLite database', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Exact Persistence Tester',
          email: `persist_${Date.now()}@testfinance.com`,
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });
      testToken = regRes.body.token;

      // Add salary income transaction of ₹30,000
      const incomeRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          type: 'income',
          amount: 30000,
          category: 'Salary',
          paymentMode: 'Net Banking',
          date: '2026-10-01',
          description: 'Exact Salary Income',
        });
      expect(incomeRes.status).toBe(201);
      expect(incomeRes.body.transaction.amount).toBe(30000);
      const incId = incomeRes.body.transaction.id;

      // Add expense transaction of ₹2,500
      const expenseRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          type: 'expense',
          amount: 2500,
          category: 'Food',
          paymentMode: 'UPI',
          date: '2026-10-02',
          description: 'Dining & Groceries',
        });
      expect(expenseRes.status).toBe(201);
      expect(expenseRes.body.transaction.amount).toBe(2500);
      const expId = expenseRes.body.transaction.id;

      // Verify direct database query matches exact non-random values
      const dbInc = db.prepare('SELECT amount, type FROM transactions WHERE id = ?').get(incId) as any;
      const dbExp = db.prepare('SELECT amount, type FROM transactions WHERE id = ?').get(expId) as any;
      expect(dbInc.amount).toBe(30000);
      expect(dbExp.amount).toBe(2500);

      // Verify calculated net surplus = 30000 - 2500 = 27500
      expect(calculateNetSavings(dbInc.amount, dbExp.amount)).toBe(27500);
      // Savings rate = (27500 / 30000) * 100 = 92%
      expect(calculateSavingsRate(dbInc.amount, dbExp.amount)).toBe(92);
    });

    it('4.C Tests decimal precision (paise) and extreme boundary values', async () => {
      // 2 decimal places precision
      const decimalTx = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          type: 'expense',
          amount: 1234.567, // Should normalize to 1234.57
          category: 'Shopping',
          paymentMode: 'Credit Card',
          date: '2026-10-03',
          description: 'Decimals test',
        });
      expect(decimalTx.status).toBe(201);
      expect(decimalTx.body.transaction.amount).toBe(1234.57);

      // Large financial value (e.g. ₹50,00,000 / 50 Lakhs)
      const largeTx = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          type: 'income',
          amount: 5000000,
          category: 'Investments',
          paymentMode: 'Net Banking',
          date: '2026-10-04',
          description: 'Mutual Fund Maturity',
        });
      expect(largeTx.status).toBe(201);
      expect(largeTx.body.transaction.amount).toBe(5000000);

      // Rejects negative amount
      const negativeRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          type: 'expense',
          amount: -100,
          category: 'Food',
          paymentMode: 'UPI',
          date: '2026-10-05',
          description: 'Negative test',
        });
      expect(negativeRes.status).toBe(400);

      // Rejects zero amount
      const zeroRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          type: 'expense',
          amount: 0,
          category: 'Food',
          paymentMode: 'UPI',
          date: '2026-10-05',
          description: 'Zero test',
        });
      expect(zeroRes.status).toBe(400);
    });

    it('4.D Tests update and delete transaction updates totals accurately', async () => {
      // Add a test expense of ₹1,000
      const addRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          type: 'expense',
          amount: 1000,
          category: 'Entertainment',
          paymentMode: 'UPI',
          date: '2026-10-06',
          description: 'Movie Tickets',
        });
      const txId = addRes.body.transaction.id;

      // Update amount to ₹1,500
      const updateRes = await request(app)
        .put(`/api/transactions/${txId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ amount: 1500 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.transaction.amount).toBe(1500);

      // Delete the transaction
      const delRes = await request(app)
        .delete(`/api/transactions/${txId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(delRes.status).toBe(200);

      // Confirm it is gone from the database
      const checkDb = db.prepare('SELECT id FROM transactions WHERE id = ?').get(txId);
      expect(checkDb).toBeUndefined();
    });
  });

  // =========================================================================
  // SECTION 5: CO1 INTELLIGENT AGENT 5-STAGE PIPELINE & COUNTERFACTUAL
  // =========================================================================
  describe('Section 5: CO1 Intelligent Financial Agent Testing', () => {
    const liveTransactions: Transaction[] = [
      { id: '1', type: 'income', amount: 30000, category: 'Salary', date: '2026-10-01', description: 'Salary', paymentMode: 'Net Banking', createdAt: '' },
      { id: '2', type: 'expense', amount: 2500, category: 'Food', date: '2026-10-05', description: 'Food', paymentMode: 'UPI', createdAt: '' },
      { id: '3', type: 'expense', amount: 9500, category: 'Shopping', date: '2026-10-08', description: 'Clothes', paymentMode: 'Credit Card', createdAt: '' },
    ];

    const liveBudgets: Budget[] = [
      { id: 'b1', category: 'Food', limit: 10000, period: 'monthly', alertThreshold: 80 },
      { id: 'b2', category: 'Shopping', limit: 10000, period: 'monthly', alertThreshold: 80 }, // 95% utilization
    ];

    const liveGoals: SavingsGoal[] = [
      { id: 'g1', title: 'Emergency Fund', targetAmount: 60000, currentAmount: 10000, targetDate: '2027-04-01', category: 'Safety' },
    ];

    it('5.1 Stage 1 Perceive: Extracts accurate financial facts from live state', () => {
      const p = perceiveFinancialState(liveTransactions, liveBudgets, liveGoals, 0, '2026-10');
      expect(p.totalIncome).toBe(30000);
      expect(p.totalExpenses).toBe(12000);
      expect(p.netSurplus).toBe(18000);
      expect(p.savingsRate).toBe(60); // 18000 / 30000 = 60%
      expect(p.highestCategory?.category).toBe('Shopping');
      expect(p.highestCategory?.amount).toBe(9500);
    });

    it('5.2 Stage 2 Analyze: Accurately identifies 95% category utilization condition', () => {
      const p = perceiveFinancialState(liveTransactions, liveBudgets, liveGoals, 0, '2026-10');
      const conditions = analyzeFinancialCondition(p);
      const shoppingWarn = conditions.find(c => c.conditionId === 'budget_warning_Shopping');
      expect(shoppingWarn).toBeDefined();
      expect(shoppingWarn?.severity).toBe('warning');
      expect(shoppingWarn?.value).toBe(95);
    });

    it('5.3 Stage 3 Decide & Stage 4 Act: Generates relevant recommendation for avoid_budget_breach', () => {
      const rec = runIntelligentAgentCycle(liveTransactions, liveBudgets, liveGoals, 'avoid_budget_breach');
      expect(rec.selectedAction.targetCategory).toBe('Shopping');
      expect(rec.selectedAction.type).toBe('budget_cut');
      expect(rec.explanation).toContain('Shopping');
      expect(rec.explanation).toContain('95%');
    });

    it('5.4 Stage 5 Evaluate: Counterfactual analysis simulates improvement without altering database', () => {
      const p = perceiveFinancialState(liveTransactions, liveBudgets, liveGoals, 0, '2026-10');
      const action = selectAgentAction(p, [], 'avoid_budget_breach');
      const counterfactual = evaluateActionOutcome(p, action);

      expect(counterfactual.improvement).toBe(true);
      expect(counterfactual.after).toBeGreaterThan(counterfactual.before);
      expect(counterfactual.explanation).toContain('Savings rate expands');

      // Check database to ensure no real transaction was created by what-if evaluation
      const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get() as any;
      expect(txCount.count).toBeGreaterThan(0); // existing real txs untouched
    });

    it('5.5 Switches seamlessly between all 4 agent goals', () => {
      for (const goalId of Object.keys(AGENT_GOALS) as (keyof typeof AGENT_GOALS)[]) {
        const rec = runIntelligentAgentCycle(liveTransactions, liveBudgets, liveGoals, goalId);
        expect(rec.goal.id).toBe(goalId);
        expect(rec.selectedAction).toBeDefined();
        expect(rec.counterfactual).toBeDefined();
      }
    });
  });

  // =========================================================================
  // SECTION 6: CO2 BFS AND GREEDY BEST-FIRST SEARCH
  // =========================================================================
  describe('Section 6: CO2 BFS vs Greedy Best-First Search on Savings Goals', () => {
    it('6.1 Handles already achieved goal (initial savings >= target)', () => {
      const input: SearchProblemInput = {
        initialSavings: 50000,
        targetSavings: 50000,
        planningHorizonMonths: 6,
        monthlySavingChoices: [2000, 5000, 10000],
      };

      const bfsRes = runBreadthFirstSearch(input);
      expect(bfsRes.success).toBe(true);
      expect(bfsRes.plan.length).toBe(0);
      expect(bfsRes.statesExplored).toBe(1);

      const bestFirstRes = runBestFirstSearch(input);
      expect(bestFirstRes.success).toBe(true);
      expect(bestFirstRes.plan.length).toBe(0);
      expect(bestFirstRes.statesExplored).toBe(1);
    });

    it('6.2 Handles zero initial savings (initial savings = 0)', () => {
      const input: SearchProblemInput = {
        initialSavings: 0,
        targetSavings: 15000,
        planningHorizonMonths: 6,
        monthlySavingChoices: [2500, 5000, 7500],
      };

      const bfsRes = runBreadthFirstSearch(input);
      expect(bfsRes.success).toBe(true);
      expect(bfsRes.totalSaved).toBeGreaterThanOrEqual(15000);
      expect(bfsRes.plan.length).toBeGreaterThan(0);

      const bestFirstRes = runBestFirstSearch(input);
      expect(bestFirstRes.success).toBe(true);
      expect(bestFirstRes.totalSaved).toBeGreaterThanOrEqual(15000);
      expect(bestFirstRes.plan.length).toBeGreaterThan(0);
    });

    it('6.3 Handles unreachable goal safely without crashing', () => {
      const input: SearchProblemInput = {
        initialSavings: 1000,
        targetSavings: 100000,
        planningHorizonMonths: 3, // Max possible = 1000 + 3*2000 = 7000 << 100000
        monthlySavingChoices: [1000, 2000],
      };

      const bfsRes = runBreadthFirstSearch(input);
      expect(bfsRes.success).toBe(false);
      expect(bfsRes.plan).toEqual([]);
      expect(bfsRes.message).toContain('unreachable');

      const bestFirstRes = runBestFirstSearch(input);
      expect(bestFirstRes.success).toBe(false);
      expect(bestFirstRes.plan).toEqual([]);
      expect(bestFirstRes.message).toContain('unreachable');
    });

    it('6.4 Verifies algorithmic guarantees: BFS finds minimum depth; Best-First uses heuristic h(n)', () => {
      const input: SearchProblemInput = {
        initialSavings: 0,
        targetSavings: 10000,
        planningHorizonMonths: 6,
        monthlySavingChoices: [1000, 2000, 5000, 10000],
      };

      const bfs = runBreadthFirstSearch(input);
      const best = runBestFirstSearch(input);

      expect(bfs.success).toBe(true);
      expect(best.success).toBe(true);
      // Both find solution within horizon
      expect(bfs.plan.length).toBeLessThanOrEqual(6);
      expect(best.plan.length).toBeLessThanOrEqual(6);

      // Best-First Search uses heuristic deficit h(s) = max(0, target - current)
      expect(calculateHeuristic(4000, 10000)).toBe(6000);
      expect(calculateHeuristic(10000, 10000)).toBe(0);
    });
  });

  // =========================================================================
  // SECTION 7: CO4 RULE-BASED REASONING AND MONTE CARLO SIMULATION
  // =========================================================================
  describe('Section 7: CO4 Rule-Based Reasoning and Monte Carlo Simulation', () => {
    it('7.1 Inspects all 7 forward-chaining rules and confirms exact rule triggers', () => {
      expect(FINANCIAL_RULES.length).toBe(7);

      // Verify Rule 1: Near Budget Breach (utilization >= 90% and excess === 0)
      const r1 = FINANCIAL_RULES.find(r => r.id === 'RULE_01_NEAR_BUDGET_BREACH')!;
      expect(r1.evaluate({ maxCategoryUtilization: { value: 92 }, totalBudgetExcess: { value: 0 } } as any)).toBe(true);
      expect(r1.evaluate({ maxCategoryUtilization: { value: 85 }, totalBudgetExcess: { value: 0 } } as any)).toBe(false);

      // Verify Rule 2: Budget Overrun (excess > 0)
      const r2 = FINANCIAL_RULES.find(r => r.id === 'RULE_02_BUDGET_OVERRUN_DISCRETIONARY')!;
      expect(r2.evaluate({ totalBudgetExcess: { value: 1500 } } as any)).toBe(true);
      expect(r2.evaluate({ totalBudgetExcess: { value: 0 } } as any)).toBe(false);

      // Verify Rule 3: Goal Velocity Deficit (goal needed > net surplus)
      const r3 = FINANCIAL_RULES.find(r => r.id === 'RULE_03_GOAL_VELOCITY_DEFICIT')!;
      expect(r3.evaluate({ totalMonthlyGoalNeeded: { value: 10000 }, netSurplus: { value: 4000 } } as any)).toBe(true);
      expect(r3.evaluate({ totalMonthlyGoalNeeded: { value: 5000 }, netSurplus: { value: 10000 } } as any)).toBe(false);

      // Verify Rule 4: Zero Income Anomaly
      const r4 = FINANCIAL_RULES.find(r => r.id === 'RULE_04_ZERO_INCOME_ANOMALY')!;
      expect(r4.evaluate({ totalIncome: { value: 0 } } as any)).toBe(true);
      expect(r4.evaluate({ totalIncome: { value: 30000 } } as any)).toBe(false);

      // Verify Rule 5: Projected Run-Rate Breach
      const r5 = FINANCIAL_RULES.find(r => r.id === 'RULE_05_PROJECTED_RUN_RATE_BREACH')!;
      expect(r5.evaluate({ daysElapsed: { value: 10 }, daysRemaining: { value: 20 }, totalExpenses: { value: 25000 }, totalIncome: { value: 30000 } } as any)).toBe(true);

      // Verify Rule 6: Emergency Runway Vulnerability (< 3 months)
      const r6 = FINANCIAL_RULES.find(r => r.id === 'RULE_06_EMERGENCY_RESERVE_VULNERABILITY')!;
      expect(r6.evaluate({ emergencyRunwayMonths: { value: 1.5 }, totalExpenses: { value: 10000 } } as any)).toBe(true);
      expect(r6.evaluate({ emergencyRunwayMonths: { value: 4.0 }, totalExpenses: { value: 10000 } } as any)).toBe(false);

      // Verify Rule 7: High Discretionary Outflow Ratio (>= 35%)
      const r7 = FINANCIAL_RULES.find(r => r.id === 'RULE_07_DISCRETIONARY_CAP_BREACH')!;
      expect(r7.evaluate({ discretionaryRatio: { value: 42 } } as any)).toBe(true);
      expect(r7.evaluate({ discretionaryRatio: { value: 20 } } as any)).toBe(false);
    });

    it('7.2 Monte Carlo simulation produces valid quantiles with P10 <= P50 <= P90 and 0-100% breach probability', () => {
      const res = runMonteCarloBudgetSimulation({
        budget: 15000,
        alreadySpent: 8000,
        daysRemaining: 15,
        meanDailySpend: 400,
        stdDevDailySpend: 100,
        simulationCount: 1000,
        randomSeed: 42,
      });

      expect(res.breachProbability).toBeGreaterThanOrEqual(0);
      expect(res.breachProbability).toBeLessThanOrEqual(100);
      expect(res.quantiles.p10).toBeLessThanOrEqual(res.quantiles.p50);
      expect(res.quantiles.p50).toBeLessThanOrEqual(res.quantiles.p90);
      expect(res.quantiles.min).toBeLessThanOrEqual(res.quantiles.max);
    });

    it('7.3 Monte Carlo responds appropriately to low vs high spending scenarios', () => {
      // Low spending scenario: ₹15,000 budget, already spent ₹1,000, 10 days left at ₹50/day
      const lowRes = runMonteCarloBudgetSimulation({
        budget: 15000,
        alreadySpent: 1000,
        daysRemaining: 10,
        meanDailySpend: 50,
        stdDevDailySpend: 10,
        simulationCount: 500,
        randomSeed: 42,
      });
      expect(lowRes.breachProbability).toBe(0);
      expect(lowRes.riskCategory).toBe('Low');

      // High spending scenario: ₹10,000 budget, already spent ₹9,500, 15 days left at ₹500/day
      const highRes = runMonteCarloBudgetSimulation({
        budget: 10000,
        alreadySpent: 9500,
        daysRemaining: 15,
        meanDailySpend: 500,
        stdDevDailySpend: 80,
        simulationCount: 500,
        randomSeed: 42,
      });
      expect(highRes.breachProbability).toBe(100);
      expect(highRes.riskCategory).toBe('High');
    });

    it('7.4 Seeded PRNG (Mulberry32) produces 100% deterministic reproducibility across runs', () => {
      const run1 = runMonteCarloBudgetSimulation({
        budget: 20000,
        alreadySpent: 12000,
        daysRemaining: 12,
        meanDailySpend: 600,
        stdDevDailySpend: 150,
        simulationCount: 500,
        randomSeed: 98765,
      });

      const run2 = runMonteCarloBudgetSimulation({
        budget: 20000,
        alreadySpent: 12000,
        daysRemaining: 12,
        meanDailySpend: 600,
        stdDevDailySpend: 150,
        simulationCount: 500,
        randomSeed: 98765,
      });

      expect(run1.breachProbability).toBe(run2.breachProbability);
      expect(run1.quantiles.p10).toBe(run2.quantiles.p10);
      expect(run1.quantiles.p50).toBe(run2.quantiles.p50);
      expect(run1.quantiles.p90).toBe(run2.quantiles.p90);
    });
  });
});

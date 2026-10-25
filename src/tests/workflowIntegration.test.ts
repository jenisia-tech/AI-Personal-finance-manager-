import { describe, it, expect } from 'vitest';
import {
  perceiveFinancialState,
  analyzeFinancialCondition,
  selectAgentAction,
  evaluateActionOutcome,
  runIntelligentAgentCycle,
  AGENT_GOALS,
} from '../services/financialAgentService';
import {
  runBreadthFirstSearch,
  runBestFirstSearch,
  SearchProblemInput,
} from '../services/financialSearchService';
import {
  extractFinancialFacts,
  runForwardChainingReasoning,
  runMonteCarloBudgetSimulation,
} from '../services/financialReasoningService';
import { Transaction, Budget, SavingsGoal } from '../types/finance';

describe('Workflow Integration: CO1, CO2, and CO4 in Normal User Workflow', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'user-123',
      type: 'income',
      amount: 60000,
      category: 'Salary',
      description: 'Monthly Salary',
      date: '2026-10-01',
      paymentMode: 'Net Banking',
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'tx-2',
      userId: 'user-123',
      type: 'expense',
      amount: 14000,
      category: 'Food',
      description: 'Groceries and Dining',
      date: '2026-10-05',
      paymentMode: 'UPI',
      createdAt: '2026-10-05T12:00:00Z',
    },
    {
      id: 'tx-3',
      userId: 'user-123',
      type: 'expense',
      amount: 8000,
      category: 'Entertainment',
      description: 'Weekend Concert and Movies',
      date: '2026-10-10',
      paymentMode: 'Credit Card',
      createdAt: '2026-10-10T15:00:00Z',
    },
  ];

  const mockBudgets: Budget[] = [
    {
      id: 'b-1',
      userId: 'user-123',
      category: 'Food',
      limit: 15000,
      period: 'monthly',
      alertThreshold: 90,
    },
    {
      id: 'b-2',
      userId: 'user-123',
      category: 'Entertainment',
      limit: 6000,
      period: 'monthly',
      alertThreshold: 85,
    },
  ];

  const mockGoals: SavingsGoal[] = [
    {
      id: 'g-1',
      userId: 'user-123',
      title: 'Emergency Safety Net',
      category: 'Safety',
      targetAmount: 100000,
      currentAmount: 20000,
      targetDate: '2027-04-01',
      icon: '🛡️',
      color: '#34C759',
    },
    {
      id: 'g-2',
      userId: 'user-123',
      title: 'Tech Upgrade Fund',
      category: 'Tech',
      targetAmount: 40000,
      currentAmount: 10000,
      targetDate: '2027-01-01',
      icon: '💻',
      color: '#0071E3',
    },
  ];

  // =========================================================================
  // 1. CO1 INTELLIGENT AGENT IN NORMAL WORKFLOW
  // =========================================================================
  describe('CO1: Intelligent Financial Agent Normal Workflow Integration', () => {
    it('uses latest saved database transactions and budgets to perceive environment', () => {
      const perception = perceiveFinancialState(mockTransactions, mockBudgets, mockGoals, 0, '2026-10');

      expect(perception.totalIncome).toBe(60000);
      expect(perception.totalExpenses).toBe(22000);
      expect(perception.netSurplus).toBe(38000);
      expect(perception.savingsRate).toBe(63); // 38000 / 60000 = 63%
      expect(perception.highestCategory?.category).toBe('Food');
      expect(perception.highestCategory?.amount).toBe(14000);
    });

    it('identifies budget conditions and selects appropriate action on avoid_budget_breach goal', () => {
      const rec = runIntelligentAgentCycle(
        mockTransactions,
        mockBudgets,
        mockGoals,
        'avoid_budget_breach',
        60000,
        '2026-10'
      );

      expect(rec.goal.id).toBe('avoid_budget_breach');
      expect(rec.selectedAction).toBeDefined();
      expect(rec.selectedAction.title).toBeTruthy();
      expect(rec.explanation).toBeTruthy();
      expect(rec.counterfactual).toBeDefined();
    });

    it('adapts advice when user switches active goal in normal workflow', () => {
      // Goal A: Avoid Budget Breach
      const recBreach = runIntelligentAgentCycle(
        mockTransactions,
        mockBudgets,
        mockGoals,
        'avoid_budget_breach',
        60000,
        '2026-10'
      );

      // Goal B: Accelerate Savings Targets
      const recSavings = runIntelligentAgentCycle(
        mockTransactions,
        mockBudgets,
        mockGoals,
        'reach_savings_goal',
        60000,
        '2026-10'
      );

      // Goal C: Maintain Emergency Net
      const recEmergency = runIntelligentAgentCycle(
        mockTransactions,
        mockBudgets,
        mockGoals,
        'maintain_emergency_fund',
        60000,
        '2026-10'
      );

      expect(recBreach.goal.name).toBe(AGENT_GOALS.avoid_budget_breach.name);
      expect(recSavings.goal.name).toBe(AGENT_GOALS.reach_savings_goal.name);
      expect(recEmergency.goal.name).toBe(AGENT_GOALS.maintain_emergency_fund.name);

      // They should evaluate counterfactual outcomes appropriately
      expect(recSavings.counterfactual.improvement).toBe(true);
    });

    it('produces counterfactual evaluation showing predicted improvement', () => {
      const perception = perceiveFinancialState(mockTransactions, mockBudgets, mockGoals, 0, '2026-10');
      const conditions = analyzeFinancialCondition(perception);
      const action = selectAgentAction(perception, conditions, 'reduce_discretionary');
      const counterfactual = evaluateActionOutcome(perception, action);

      expect(counterfactual.metricName).toBeTruthy();
      expect(typeof counterfactual.before).toBe('number');
      expect(typeof counterfactual.after).toBe('number');
      expect(counterfactual.explanation).toBeTruthy();
    });
  });

  // =========================================================================
  // 2. CO2 SEARCH-BASED SAVINGS PLANNING IN NORMAL WORKFLOW
  // =========================================================================
  describe('CO2: Savings Goal Search Planning Integration', () => {
    it('generates a step-by-step roadmap for a specific savings goal using BFS', () => {
      const goal = mockGoals[1]; // Tech: current 10k, target 40k -> deficit 30k
      const input: SearchProblemInput = {
        initialSavings: goal.currentAmount,
        targetSavings: goal.targetAmount,
        planningHorizonMonths: 6,
        monthlySavingChoices: [5000, 10000, 15000],
      };

      const result = runBreadthFirstSearch(input);

      expect(result.algorithm).toBe('BFS');
      expect(result.success).toBe(true);
      expect(result.plan.length).toBeGreaterThan(0);
      expect(result.totalSaved).toBeGreaterThanOrEqual(goal.targetAmount);

      // Month steps must increment sequentially
      result.plan.forEach((step, idx) => {
        expect(step.month).toBe(idx + 1);
        expect(step.saveAmount).toBeGreaterThan(0);
      });
    });

    it('generates a roadmap for a specific savings goal using Greedy Best-First Search', () => {
      const goal = mockGoals[1];
      const input: SearchProblemInput = {
        initialSavings: goal.currentAmount,
        targetSavings: goal.targetAmount,
        planningHorizonMonths: 6,
        monthlySavingChoices: [5000, 10000, 15000],
      };

      const result = runBestFirstSearch(input);

      expect(result.algorithm).toBe('BestFirst');
      expect(result.success).toBe(true);
      expect(result.plan.length).toBeGreaterThan(0);
      expect(result.totalSaved).toBeGreaterThanOrEqual(goal.targetAmount);
    });

    it('correctly reports failure when horizon or choices cannot satisfy goal', () => {
      const input: SearchProblemInput = {
        initialSavings: 1000,
        targetSavings: 50000,
        planningHorizonMonths: 2,
        monthlySavingChoices: [1000, 2000], // max 1000 + 4000 = 5000 << 50000
      };

      const result = runBreadthFirstSearch(input);
      expect(result.success).toBe(false);
      expect(result.plan.length).toBe(0);
    });
  });

  // =========================================================================
  // 3. CO4 FORWARD-CHAINING RULES & MONTE CARLO IN NORMAL WORKFLOW
  // =========================================================================
  describe('CO4: Forward-Chaining Rules & Monte Carlo in Normal Workflow', () => {
    it('evaluates forward-chaining rules on saved user data and triggers budget overrun rule', () => {
      const facts = extractFinancialFacts(mockTransactions, mockBudgets, mockGoals, 60000, '2026-10');
      const reasoning = runForwardChainingReasoning(facts);

      expect(reasoning.evaluatedCount).toBe(7);

      // Entertainment is limit 6000, spent 8000 -> overrun detected
      const overrunRule = reasoning.results.find(r => r.ruleId === 'RULE_02_BUDGET_OVERRUN_DISCRETIONARY');
      expect(overrunRule).toBeDefined();
      expect(overrunRule?.satisfied).toBe(true);
      expect(overrunRule?.conclusion).toContain('Entertainment');
    });

    it('evaluates near-breach rule when a category utilization is >= 90% without total breach', () => {
      const singleBudget: Budget[] = [
        {
          id: 'b-food',
          userId: 'user-123',
          category: 'Food',
          limit: 15000,
          period: 'monthly',
          alertThreshold: 90,
        },
      ];
      // Food spent is 14000 out of 15000 = 93.3% utilization
      const facts = extractFinancialFacts(mockTransactions, singleBudget, mockGoals, 60000, '2026-10');
      const reasoning = runForwardChainingReasoning(facts);

      const nearBreachRule = reasoning.results.find(r => r.ruleId === 'RULE_01_NEAR_BUDGET_BREACH');
      expect(nearBreachRule?.satisfied).toBe(true);
      expect(nearBreachRule?.conclusion).toContain('Food');
    });

    it('runs Monte Carlo budget risk simulation on-demand for a category budget', () => {
      const sim = runMonteCarloBudgetSimulation({
        budget: 15000,
        alreadySpent: 14000,
        daysElapsed: 15,
        daysRemaining: 15,
        meanDailySpend: 300,
        stdDevDailySpend: 100,
        simulationCount: 1000,
        randomSeed: 42,
      });

      expect(sim.simulationCount).toBe(1000);
      expect(sim.breachProbability).toBeGreaterThan(0);
      expect(sim.riskCategory).toBeDefined();
      expect(sim.quantiles.p10).toBeLessThanOrEqual(sim.quantiles.p50);
      expect(sim.quantiles.p50).toBeLessThanOrEqual(sim.quantiles.p90);
      expect(sim.recommendedMitigation).toBeTruthy();
    });

    it('produces 100% deterministic Monte Carlo simulation results with the same random seed', () => {
      const config = {
        budget: 20000,
        alreadySpent: 10000,
        daysElapsed: 20,
        daysRemaining: 10,
        meanDailySpend: 800,
        stdDevDailySpend: 250,
        simulationCount: 1000,
        randomSeed: 99,
      };

      const run1 = runMonteCarloBudgetSimulation(config);
      const run2 = runMonteCarloBudgetSimulation(config);

      expect(run1.breachProbability).toBe(run2.breachProbability);
      expect(run1.breachCount).toBe(run2.breachCount);
      expect(run1.quantiles.p50).toBe(run2.quantiles.p50);
      expect(run1.quantiles.p90).toBe(run2.quantiles.p90);
    });
  });
});

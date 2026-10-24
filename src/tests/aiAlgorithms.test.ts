import { describe, it, expect } from 'vitest';
import {
  runIntelligentAgentCycle,
  perceiveFinancialState,
  analyzeFinancialCondition,
  selectAgentAction,
  generateRecommendation,
  evaluateActionOutcome,
} from '../services/financialAgentService';
import {
  runBreadthFirstSearch,
  runBestFirstSearch,
  compareSearchAlgorithms,
  calculateHeuristic,
} from '../services/financialSearchService';
import {
  extractFinancialFacts,
  runForwardChainingReasoning,
  runMonteCarloBudgetSimulation,
} from '../services/financialReasoningService';
import {
  calculateNetSavings,
  calculateSavingsRate,
  calculateHealthScore,
} from '../utils/calculations';
import { formatINR } from '../utils/formatters';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
} from '../services/demoData';
import { Transaction, Budget } from '../types/finance';

describe('CO1: Intelligent Agent Models & Problem-Solving', () => {
  it('1. Intelligent agent changes its recommendation when the financial state changes', () => {
    // Normal baseline state
    const normalRec = runIntelligentAgentCycle(
      INITIAL_TRANSACTIONS,
      INITIAL_BUDGETS,
      INITIAL_SAVINGS_GOALS,
      'avoid_budget_breach',
      103000
    );

    // Now introduce a massive spending spike in Entertainment that exceeds budget
    const spikedTransactions: Transaction[] = [
      {
        id: 'tx-spike',
        type: 'expense',
        amount: 8000,
        category: 'Entertainment',
        paymentMode: 'UPI',
        date: '2026-10-20',
        description: 'Luxury Concert VIP Passes',
        createdAt: new Date().toISOString(),
      },
      ...INITIAL_TRANSACTIONS,
    ];

    const spikedRec = runIntelligentAgentCycle(
      spikedTransactions,
      INITIAL_BUDGETS,
      INITIAL_SAVINGS_GOALS,
      'avoid_budget_breach',
      103000
    );

    expect(normalRec).toBeDefined();
    expect(spikedRec).toBeDefined();
    // The recommendation or action should adapt to the over-budget category
    expect(spikedRec.selectedAction.targetCategory).toBe('Entertainment');
    expect(spikedRec.explanation).toContain('Entertainment');
  });

  it('Separates Perceive, Analyze, Decide, Act, Evaluate stages cleanly', () => {
    const perception = perceiveFinancialState(
      INITIAL_TRANSACTIONS,
      INITIAL_BUDGETS,
      INITIAL_SAVINGS_GOALS,
      103000
    );
    expect(perception.totalIncome).toBeGreaterThan(0);
    expect(perception.totalExpenses).toBeGreaterThan(0);

    const conditions = analyzeFinancialCondition(perception);
    expect(Array.isArray(conditions)).toBe(true);

    const action = selectAgentAction(perception, conditions, 'reach_savings_goal');
    expect(action.actionId).toBeDefined();

    const recommendation = generateRecommendation(
      {
        id: 'reach_savings_goal',
        name: 'Accelerate Savings Targets',
        description: '',
        targetMetric: '',
        targetValue: 100,
      },
      conditions,
      action,
      perception
    );
    expect(recommendation.explanation).toBeDefined();

    const evaluation = evaluateActionOutcome(perception, action);
    expect(evaluation.improvement).toBe(true);
  });
});

describe('CO2: Uninformed and Informed Search Techniques', () => {
  it('2. BFS finds a valid plan for a reachable savings target', () => {
    const result = runBreadthFirstSearch({
      initialSavings: 5000,
      targetSavings: 10000,
      planningHorizonMonths: 3,
      monthlySavingChoices: [1000, 2000, 3000],
    });

    expect(result.success).toBe(true);
    expect(result.plan.length).toBeGreaterThan(0);
    expect(result.plan.length).toBeLessThanOrEqual(3);
    expect(result.totalSaved).toBeGreaterThanOrEqual(10000);
  });

  it('3. Search algorithms report failure correctly when no goal state is reachable', () => {
    const impossibleProblem = {
      initialSavings: 2000,
      targetSavings: 20000,
      planningHorizonMonths: 2,
      monthlySavingChoices: [1000, 2000], // Max reachable = 2000 + 2000 + 2000 = 6000 < 20000
    };

    const bfsRes = runBreadthFirstSearch(impossibleProblem);
    const bestFirstRes = runBestFirstSearch(impossibleProblem);

    expect(bfsRes.success).toBe(false);
    expect(bfsRes.plan.length).toBe(0);
    expect(bfsRes.message).toContain('unreachable');

    expect(bestFirstRes.success).toBe(false);
    expect(bestFirstRes.plan.length).toBe(0);
    expect(bestFirstRes.message).toContain('unreachable');
  });

  it('4. Search does not explore the same state repeatedly', () => {
    const input = {
      initialSavings: 0,
      targetSavings: 10000,
      planningHorizonMonths: 4,
      monthlySavingChoices: [1000, 2000, 3000],
    };

    const result = runBreadthFirstSearch(input);
    const visitedKeys = new Set<string>();

    for (const step of result.trace) {
      const key = `${step.state.month}_${step.state.currentSavings}`;
      expect(visitedKeys.has(key)).toBe(false);
      visitedKeys.add(key);
    }
  });

  it('5. Best-First Search orders its frontier according to the documented heuristic', () => {
    const target = 15000;
    const h1 = calculateHeuristic(5000, target);
    const h2 = calculateHeuristic(10000, target);
    const h3 = calculateHeuristic(15000, target);

    expect(h1).toBe(10000);
    expect(h2).toBe(5000);
    expect(h3).toBe(0);
    expect(h2).toBeLessThan(h1);
    expect(h3).toBeLessThan(h2);

    const result = runBestFirstSearch({
      initialSavings: 5000,
      targetSavings: 12000,
      planningHorizonMonths: 3,
      monthlySavingChoices: [1000, 2000, 4000],
    });

    expect(result.success).toBe(true);
    // Best First should prioritize the largest choice to minimize h(n)
    expect(result.plan[0].saveAmount).toBe(4000);
  });

  it('Compares BFS and Best-First Search on identical problem definitions', () => {
    const comparison = compareSearchAlgorithms({
      initialSavings: 5000,
      targetSavings: 12000,
      planningHorizonMonths: 4,
      monthlySavingChoices: [1000, 2000, 3000],
    });

    expect(comparison.bfsResult).toBeDefined();
    expect(comparison.bestFirstResult).toBeDefined();
    expect(comparison.analysis).toBeDefined();
  });
});

describe('CO4: Rule-Based Systems and Probabilistic Reasoning', () => {
  it('6. Rule-based reasoning fires the correct rules for valid input conditions', () => {
    const facts = extractFinancialFacts(
      INITIAL_TRANSACTIONS,
      INITIAL_BUDGETS,
      INITIAL_SAVINGS_GOALS,
      103000
    );

    const results = runForwardChainingReasoning(facts);
    expect(results.evaluatedCount).toBeGreaterThanOrEqual(6);
    expect(results.triggeredCount).toBeGreaterThan(0);

    const firedRules = results.results.filter(r => r.satisfied);
    expect(firedRules.length).toBeGreaterThan(0);
    for (const r of firedRules) {
      expect(r.conclusion).toBeDefined();
      expect(r.recommendedAction).toBeDefined();
      expect(r.factsUsed.length).toBeGreaterThan(0);
    }
  });

  it('7. The reasoning engine handles multiple simultaneously triggered rules', () => {
    // Construct scenario with multiple extreme conditions: zero income, over budget, low emergency fund
    const extremeBudgets: Budget[] = [
      { id: 'b1', category: 'Food', limit: 2000, period: 'monthly', alertThreshold: 80 },
    ];
    const extremeTxs: Transaction[] = [
      {
        id: 'tx1',
        type: 'expense',
        amount: 3500, // Exceeds 2000 limit
        category: 'Food',
        paymentMode: 'Cash',
        date: '2026-10-10',
        description: 'Exceeded Food budget',
        createdAt: new Date().toISOString(),
      },
    ];

    const facts = extractFinancialFacts(extremeTxs, extremeBudgets, [], 0);
    const reasoning = runForwardChainingReasoning(facts);

    const firedIds = reasoning.results.filter(r => r.satisfied).map(r => r.ruleId);
    // Should trigger at least ZERO_INCOME and BUDGET_OVERRUN
    expect(firedIds).toContain('RULE_02_BUDGET_OVERRUN_DISCRETIONARY');
    expect(firedIds).toContain('RULE_04_ZERO_INCOME_ANOMALY');
    expect(reasoning.triggeredCount).toBeGreaterThanOrEqual(2);
  });

  it('8. The probability estimator produces reproducible results with a fixed seed', () => {
    const config = {
      budget: 12000,
      alreadySpent: 8000,
      daysElapsed: 15,
      daysRemaining: 15,
      meanDailySpend: 350,
      stdDevDailySpend: 150,
      simulationCount: 1000,
      randomSeed: 12345,
    };

    const run1 = runMonteCarloBudgetSimulation(config);
    const run2 = runMonteCarloBudgetSimulation(config);

    expect(run1.breachProbability).toBe(run2.breachProbability);
    expect(run1.breachCount).toBe(run2.breachCount);
    expect(run1.quantiles.p50).toBe(run2.quantiles.p50);
    expect(run1.quantiles.p90).toBe(run2.quantiles.p90);
  });

  it('9. A zero budget, empty transaction list, or missing income does not crash the application', () => {
    // Empty dataset test
    const emptyFacts = extractFinancialFacts([], [], [], 0);
    expect(() => runForwardChainingReasoning(emptyFacts)).not.toThrow();

    // Zero budget Monte Carlo simulation
    const zeroBudgetSim = runMonteCarloBudgetSimulation({
      budget: 0,
      alreadySpent: 500,
      daysElapsed: 10,
      daysRemaining: 10,
      meanDailySpend: 50,
      stdDevDailySpend: 10,
      simulationCount: 200,
      randomSeed: 99,
    });
    expect(zeroBudgetSim.breachProbability).toBe(100);
    expect(zeroBudgetSim.riskCategory).toBe('High');

    // Agent with empty inputs
    expect(() => runIntelligentAgentCycle([], [], [], 'avoid_budget_breach', 0)).not.toThrow();
  });

  it('10. Financial calculations and Indian formatting handle edge cases cleanly', () => {
    expect(formatINR(125000)).toBe('₹1,25,000');
    expect(formatINR(-5400)).toBe('-₹5,400');
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(null as any)).toBe('₹0');

    expect(calculateSavingsRate(100000, 75000)).toBe(25);
    expect(calculateSavingsRate(0, 5000)).toBe(0);
    expect(calculateNetSavings(50000, 30000)).toBe(20000);

    const health = calculateHealthScore(100000, 60000, INITIAL_BUDGETS, INITIAL_SAVINGS_GOALS, {});
    expect(health.score).toBeGreaterThan(0);
    expect(health.score).toBeLessThanOrEqual(100);
  });
});

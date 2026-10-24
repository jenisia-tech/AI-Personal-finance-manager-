import {
  Transaction,
  Budget,
  SavingsGoal,
  FinancialFact,
  InferenceRule,
  RuleEvaluationResult,
  MonteCarloConfig,
  MonteCarloSimulationResult,
  RiskCategory,
} from '../types/finance';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetSavings,
  calculateSavingsRate,
  calculateCategoryExpenses,
  calculateBudgetUtilization,
  isDiscretionaryCategory,
} from '../utils/calculations';
import {
  getDaysElapsedInMonth,
  getDaysRemainingInMonth,
  formatINR,
} from '../utils/formatters';

/* =========================================================================
 * PART A: FORWARD-CHAINING RULE-BASED INFERENCE SYSTEM
 * ========================================================================= */

/**
 * Extracts and normalizes domain facts from application state.
 */
export function extractFinancialFacts(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  monthlyIncomeBaseline: number = 0,
  yearMonth?: string
): Record<string, FinancialFact> {
  const incomeFromTx = calculateTotalIncome(transactions, yearMonth);
  const totalIncome = Math.max(incomeFromTx, monthlyIncomeBaseline);
  const totalExpenses = calculateTotalExpenses(transactions, yearMonth);
  const netSurplus = calculateNetSavings(totalIncome, totalExpenses);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  const daysElapsed = getDaysElapsedInMonth();
  const daysRemaining = getDaysRemainingInMonth();
  const categoryExpenses = calculateCategoryExpenses(transactions, yearMonth);

  // Compute maximum category utilization & excess
  let maxUtilization = 0;
  let maxUtilCategory = 'None';
  let totalBudgetExcess = 0;
  let breachedCategories: string[] = [];
  let nearBreachCategories: string[] = [];

  for (const b of budgets) {
    const spent = categoryExpenses[b.category] || 0;
    const util = calculateBudgetUtilization(spent, b.limit);
    if (util > maxUtilization) {
      maxUtilization = util;
      maxUtilCategory = b.category;
    }
    if (spent > b.limit) {
      totalBudgetExcess += spent - b.limit;
      breachedCategories.push(b.category);
    } else if (util >= 90) {
      nearBreachCategories.push(b.category);
    }
  }

  // Discretionary calculation
  let discretionaryTotal = 0;
  for (const [cat, amt] of Object.entries(categoryExpenses)) {
    if (isDiscretionaryCategory(cat as any)) {
      discretionaryTotal += amt;
    }
  }
  const discretionaryRatio =
    totalExpenses > 0 ? Math.round((discretionaryTotal / totalExpenses) * 100) : 0;

  // Goals requirement
  let totalMonthlyGoalNeeded = 0;
  const now = new Date();
  for (const g of goals) {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const targetDate = new Date(g.targetDate);
    const months = Math.max(
      1,
      (targetDate.getFullYear() - now.getFullYear()) * 12 +
        (targetDate.getMonth() - now.getMonth())
    );
    totalMonthlyGoalNeeded += Math.round(remaining / months);
  }

  // Emergency fund
  const emergencyGoal = goals.find(g =>
    g.title.toLowerCase().includes('emergency') || g.category.toLowerCase().includes('safety')
  );
  const emergencyAmount = emergencyGoal ? emergencyGoal.currentAmount : 0;
  const emergencyRunwayMonths =
    totalExpenses > 0 ? Number((emergencyAmount / totalExpenses).toFixed(1)) : 0;

  const facts: Record<string, FinancialFact> = {
    totalIncome: {
      key: 'totalIncome',
      label: 'Monthly Income',
      value: totalIncome,
      formattedValue: formatINR(totalIncome),
      category: 'income',
    },
    totalExpenses: {
      key: 'totalExpenses',
      label: 'Monthly Expenses',
      value: totalExpenses,
      formattedValue: formatINR(totalExpenses),
      category: 'expense',
    },
    netSurplus: {
      key: 'netSurplus',
      label: 'Net Monthly Surplus',
      value: netSurplus,
      formattedValue: formatINR(netSurplus),
      category: 'cashflow',
    },
    savingsRate: {
      key: 'savingsRate',
      label: 'Savings Rate',
      value: savingsRate,
      formattedValue: `${savingsRate}%`,
      category: 'cashflow',
    },
    daysElapsed: {
      key: 'daysElapsed',
      label: 'Days Elapsed',
      value: daysElapsed,
      formattedValue: `${daysElapsed} days`,
      category: 'timing',
    },
    daysRemaining: {
      key: 'daysRemaining',
      label: 'Days Remaining in Month',
      value: daysRemaining,
      formattedValue: `${daysRemaining} days`,
      category: 'timing',
    },
    maxCategoryUtilization: {
      key: 'maxCategoryUtilization',
      label: `Max Utilization (${maxUtilCategory})`,
      value: maxUtilization,
      formattedValue: `${maxUtilization}%`,
      category: 'budget',
    },
    maxUtilCategory: {
      key: 'maxUtilCategory',
      label: 'Highest Utilization Category',
      value: maxUtilCategory,
      formattedValue: maxUtilCategory,
      category: 'budget',
    },
    totalBudgetExcess: {
      key: 'totalBudgetExcess',
      label: 'Total Budget Excess',
      value: totalBudgetExcess,
      formattedValue: formatINR(totalBudgetExcess),
      category: 'budget',
    },
    breachedCategories: {
      key: 'breachedCategories',
      label: 'Breached Categories',
      value: breachedCategories,
      formattedValue: breachedCategories.length > 0 ? breachedCategories.join(', ') : 'None',
      category: 'budget',
    },
    nearBreachCategories: {
      key: 'nearBreachCategories',
      label: 'Near-Breach Categories (≥90%)',
      value: nearBreachCategories,
      formattedValue: nearBreachCategories.length > 0 ? nearBreachCategories.join(', ') : 'None',
      category: 'budget',
    },
    discretionaryRatio: {
      key: 'discretionaryRatio',
      label: 'Discretionary Outflow Ratio',
      value: discretionaryRatio,
      formattedValue: `${discretionaryRatio}%`,
      category: 'expense',
    },
    totalMonthlyGoalNeeded: {
      key: 'totalMonthlyGoalNeeded',
      label: 'Monthly Goals Needed',
      value: totalMonthlyGoalNeeded,
      formattedValue: formatINR(totalMonthlyGoalNeeded),
      category: 'goal',
    },
    emergencyRunwayMonths: {
      key: 'emergencyRunwayMonths',
      label: 'Emergency Runway',
      value: emergencyRunwayMonths,
      formattedValue: `${emergencyRunwayMonths} months`,
      category: 'safety',
    },
  };

  return facts;
}

/**
 * Standard Rule Base: Extensible registry of financial IF-THEN inference rules.
 */
export const FINANCIAL_RULES: InferenceRule[] = [
  // Rule 1: High utilization warning
  {
    id: 'RULE_01_NEAR_BUDGET_BREACH',
    name: 'Near-Breach Category Utilization Alert',
    category: 'budget',
    priority: 'high',
    conditionDescription: 'IF category budget utilization is at least 90%, THEN generate a high-priority budget warning.',
    evaluate: (facts) => facts.maxCategoryUtilization?.value >= 90 && facts.totalBudgetExcess?.value === 0,
    getConclusion: (facts) =>
      `Category "${facts.maxUtilCategory?.value}" has reached ${facts.maxCategoryUtilization?.value}% utilization with ${facts.daysRemaining?.value} days remaining.`,
    getAction: (facts) =>
      `Immediate warning: Freeze non-essential spending in ${facts.maxUtilCategory?.value} to avoid exceeding the monthly ceiling.`,
    getRequiredFacts: () => ['maxCategoryUtilization', 'maxUtilCategory', 'daysRemaining', 'totalBudgetExcess'],
  },

  // Rule 2: Exceeded budget excess calculation
  {
    id: 'RULE_02_BUDGET_OVERRUN_DISCRETIONARY',
    name: 'Budget Overrun & Discretionary Remediation',
    category: 'budget',
    priority: 'critical',
    conditionDescription: 'IF a budget is exceeded, THEN calculate the excess amount and recommend reviewing discretionary spending.',
    evaluate: (facts) => facts.totalBudgetExcess?.value > 0,
    getConclusion: (facts) =>
      `Budget breach detected: Total excess expenditure of ${facts.totalBudgetExcess?.formattedValue} across [${facts.breachedCategories?.formattedValue}].`,
    getAction: (facts) =>
      `Review discretionary expenditures immediately. Reallocate ${facts.totalBudgetExcess?.formattedValue} from non-essential funds to absorb the overrun.`,
    getRequiredFacts: () => ['totalBudgetExcess', 'breachedCategories'],
  },

  // Rule 3: Goal deficit warning
  {
    id: 'RULE_03_GOAL_VELOCITY_DEFICIT',
    name: 'Savings Goal Feasibility Deficit',
    category: 'savings',
    priority: 'high',
    conditionDescription: 'IF required monthly savings exceed available surplus, THEN warn that the savings goal may be difficult to achieve.',
    evaluate: (facts) => facts.totalMonthlyGoalNeeded?.value > facts.netSurplus?.value && facts.totalMonthlyGoalNeeded?.value > 0,
    getConclusion: (facts) =>
      `Goal deficit: Required monthly target funding (${facts.totalMonthlyGoalNeeded?.formattedValue}) exceeds available monthly surplus (${facts.netSurplus?.formattedValue}).`,
    getAction: (facts) =>
      `Trim variable expenses by ${formatINR(facts.totalMonthlyGoalNeeded?.value - facts.netSurplus?.value)} or extend the goal target timeline to avoid missed milestones.`,
    getRequiredFacts: () => ['totalMonthlyGoalNeeded', 'netSurplus'],
  },

  // Rule 4: Zero / Missing income check
  {
    id: 'RULE_04_ZERO_INCOME_ANOMALY',
    name: 'Zero Income Anomaly & Data Integrity',
    category: 'cashflow',
    priority: 'medium',
    conditionDescription: 'IF monthly income is zero or unavailable, THEN avoid calculating misleading savings-rate percentages and request sufficient data.',
    evaluate: (facts) => Number(facts.totalIncome?.value) <= 0,
    getConclusion: () =>
      'No income recorded for this period. Savings rate percentage is mathematically undefined and cannot be evaluated.',
    getAction: () =>
      'Add your monthly salary or revenue transactions in the Transactions tab to enable accurate cash-flow metrics.',
    getRequiredFacts: () => ['totalIncome'],
  },

  // Rule 5: Projected run-rate breach
  {
    id: 'RULE_05_PROJECTED_RUN_RATE_BREACH',
    name: 'Run-Rate Extrapolation Budget Warning',
    category: 'budget',
    priority: 'high',
    conditionDescription: 'IF projected monthly expenses exceed the category budget, THEN flag a potential budget breach.',
    evaluate: (facts) => {
      if (facts.daysElapsed?.value <= 3 || facts.totalExpenses?.value <= 0) return false;
      const projectedTotal = (facts.totalExpenses?.value / facts.daysElapsed?.value) * (facts.daysElapsed?.value + facts.daysRemaining?.value);
      return projectedTotal > facts.totalIncome?.value && facts.totalIncome?.value > 0;
    },
    getConclusion: (facts) => {
      const projectedTotal = Math.round((facts.totalExpenses?.value / facts.daysElapsed?.value) * (facts.daysElapsed?.value + facts.daysRemaining?.value));
      return `Projected month-end expenses (${formatINR(projectedTotal)}) exceed monthly income (${facts.totalIncome?.formattedValue}).`;
    },
    getAction: (facts) =>
      `Slow daily burn rate by at least 20% over the next ${facts.daysRemaining?.value} days to maintain a positive balance.`,
    getRequiredFacts: () => ['totalExpenses', 'daysElapsed', 'daysRemaining', 'totalIncome'],
  },

  // Rule 6: Emergency runway vulnerability
  {
    id: 'RULE_06_EMERGENCY_RESERVE_VULNERABILITY',
    name: 'Emergency Fund Runway Deficiency',
    category: 'safety',
    priority: 'critical',
    conditionDescription: 'IF emergency fund covers less than 3 months of expenses, THEN flag inadequate financial resilience.',
    evaluate: (facts) => facts.emergencyRunwayMonths?.value < 3 && facts.totalExpenses?.value > 0,
    getConclusion: (facts) =>
      `Emergency runway is currently ${facts.emergencyRunwayMonths?.formattedValue}, falling short of the recommended 3-to-6-month safety benchmark.`,
    getAction: () =>
      'Automate a recurring monthly transfer into your emergency deposit before making discretionary purchases.',
    getRequiredFacts: () => ['emergencyRunwayMonths', 'totalExpenses'],
  },

  // Rule 7: High discretionary spending proportion
  {
    id: 'RULE_07_DISCRETIONARY_CAP_BREACH',
    name: 'Elevated Discretionary Spend Ratio',
    category: 'expense',
    priority: 'medium',
    conditionDescription: 'IF discretionary expenses exceed 35% of total expenses, THEN recommend enforcing the 48-hour purchase delay rule.',
    evaluate: (facts) => facts.discretionaryRatio?.value >= 35,
    getConclusion: (facts) =>
      `Discretionary spending accounts for ${facts.discretionaryRatio?.formattedValue} of total outflows, exceeding the 30% guideline.`,
    getAction: () =>
      'Apply the 48-Hour Cart Rule to all non-essential shopping items to filter impulse spending.',
    getRequiredFacts: () => ['discretionaryRatio'],
  },
];

/**
 * Forward Chaining Inference Engine
 * Matches known facts against the rule base and collects fired rules.
 */
export function runForwardChainingReasoning(
  facts: Record<string, FinancialFact>,
  rules: InferenceRule[] = FINANCIAL_RULES
): {
  evaluatedCount: number;
  triggeredCount: number;
  results: RuleEvaluationResult[];
} {
  const results: RuleEvaluationResult[] = [];
  let triggeredCount = 0;

  for (const rule of rules) {
    const isSatisfied = rule.evaluate(facts);
    const requiredKeys = rule.getRequiredFacts();

    const factsUsed = requiredKeys.map(k => {
      const fact = facts[k];
      return {
        key: k,
        label: fact ? fact.label : k,
        value: fact ? fact.value : undefined,
        formatted: fact ? fact.formattedValue : 'N/A',
      };
    });

    const conclusion = isSatisfied ? rule.getConclusion(facts) : 'Condition not satisfied.';
    const recommendedAction = isSatisfied ? rule.getAction(facts) : 'None required.';

    if (isSatisfied) {
      triggeredCount++;
    }

    results.push({
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      priority: rule.priority,
      conditionDescription: rule.conditionDescription,
      satisfied: isSatisfied,
      factsUsed,
      conclusion,
      recommendedAction,
    });
  }

  return {
    evaluatedCount: rules.length,
    triggeredCount,
    results,
  };
}

/* =========================================================================
 * PART B: PROBABILISTIC FINANCIAL RISK ESTIMATION (MONTE CARLO SIMULATION)
 * ========================================================================= */

/**
 * Mulberry32 seeded pseudo-random number generator.
 * Produces deterministic, reproducible random sequences for academic evaluation.
 */
export function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller transform for generating normally distributed numbers (mean, stdDev).
 */
export function sampleGaussian(
  random: () => number,
  mean: number,
  stdDev: number
): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = random(); // Convert [0,1) to (0,1)
  while (v === 0) v = random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const sample = mean + z * stdDev;
  return Math.max(0, sample); // Expenses cannot be negative
}

/**
 * Runs a Monte Carlo simulation of remaining daily expenses.
 * Estimates probability of budget breach under spending uncertainty.
 */
export function runMonteCarloBudgetSimulation(config: MonteCarloConfig): MonteCarloSimulationResult {
  const {
    budget,
    alreadySpent,
    daysRemaining,
    meanDailySpend,
    stdDevDailySpend,
    simulationCount,
    randomSeed,
  } = config;

  // Edge case handling
  if (budget <= 0) {
    return {
      simulationCount: 0,
      breachCount: 0,
      breachProbability: alreadySpent > 0 ? 100 : 0,
      riskCategory: alreadySpent > 0 ? 'High' : 'Low',
      quantiles: { p10: alreadySpent, p50: alreadySpent, p90: alreadySpent, min: alreadySpent, max: alreadySpent, mean: alreadySpent },
      simulatedTotalsSample: [],
      assumptions: ['Budget is set to 0. Any spending results in immediate 100% breach.'],
      limitations: ['Zero budget eliminates simulation variance.'],
      explanation: 'No positive budget limit assigned to evaluate.',
      recommendedMitigation: 'Set an explicit category spending limit to run probabilistic analysis.',
    };
  }

  if (alreadySpent >= budget) {
    return {
      simulationCount,
      breachCount: simulationCount,
      breachProbability: 100,
      riskCategory: 'High',
      quantiles: { p10: alreadySpent, p50: alreadySpent, p90: alreadySpent, min: alreadySpent, max: alreadySpent, mean: alreadySpent },
      simulatedTotalsSample: Array(Math.min(30, simulationCount)).fill(alreadySpent),
      assumptions: ['Budget already breached at current date.'],
      limitations: ['Deterministic breach requires no stochastic projection.'],
      explanation: `Current expenditure (${formatINR(alreadySpent)}) already equals or exceeds limit (${formatINR(budget)}).`,
      recommendedMitigation: 'Halt all non-vital transactions in this category for the rest of the month.',
    };
  }

  if (daysRemaining <= 0) {
    const breach = alreadySpent > budget;
    return {
      simulationCount: 1,
      breachCount: breach ? 1 : 0,
      breachProbability: breach ? 100 : 0,
      riskCategory: breach ? 'High' : 'Low',
      quantiles: { p10: alreadySpent, p50: alreadySpent, p90: alreadySpent, min: alreadySpent, max: alreadySpent, mean: alreadySpent },
      simulatedTotalsSample: [alreadySpent],
      assumptions: ['End of month reached. 0 days remaining.'],
      limitations: ['No remaining horizon for variance.'],
      explanation: 'Month has concluded. Actual final spending is known.',
      recommendedMitigation: 'Finalize monthly review.',
    };
  }

  const random = createMulberry32(randomSeed);
  const simulatedTotals: number[] = [];
  let breachCount = 0;

  for (let i = 0; i < simulationCount; i++) {
    let runTotal = alreadySpent;
    for (let d = 0; d < daysRemaining; d++) {
      const dailySpend = sampleGaussian(random, meanDailySpend, stdDevDailySpend);
      runTotal += dailySpend;
    }

    simulatedTotals.push(Math.round(runTotal));
    if (runTotal > budget) {
      breachCount++;
    }
  }

  // Sort totals to extract quantiles
  simulatedTotals.sort((a, b) => a - b);

  const min = simulatedTotals[0];
  const max = simulatedTotals[simulatedTotals.length - 1];
  const p10 = simulatedTotals[Math.floor(simulationCount * 0.1)];
  const p50 = simulatedTotals[Math.floor(simulationCount * 0.5)];
  const p90 = simulatedTotals[Math.floor(simulationCount * 0.9)];
  const mean = Math.round(simulatedTotals.reduce((s, v) => s + v, 0) / simulationCount);

  const breachProbability = Number(((breachCount / simulationCount) * 100).toFixed(1));

  let riskCategory: RiskCategory = 'Low';
  if (breachProbability >= 70) riskCategory = 'High';
  else if (breachProbability >= 25) riskCategory = 'Moderate';

  // Sample for UI distribution chart (downsample to 30 evenly spaced values)
  const step = Math.max(1, Math.floor(simulatedTotals.length / 30));
  const simulatedTotalsSample: number[] = [];
  for (let i = 0; i < simulatedTotals.length && simulatedTotalsSample.length < 30; i += step) {
    simulatedTotalsSample.push(simulatedTotals[i]);
  }

  const assumptions = [
    `Daily expenses over the remaining ${daysRemaining} day(s) follow a normal distribution (mean: ${formatINR(meanDailySpend)}/day, stdDev: ${formatINR(stdDevDailySpend)}/day).`,
    'Stochastic spending behavior remains stationary across remaining weekdays and weekends.',
    `Simulation run using seeded pseudo-random generator (Mulberry32, seed: ${randomSeed}) for 100% deterministic reproducibility.`,
  ];

  const limitations = [
    'Illustrative statistical model based on past spending volatility, not a guaranteed financial prediction.',
    'Model does not account for extraordinary tail-risk events (e.g., sudden emergency medical expenses or unannounced annual bonuses).',
  ];

  const explanation =
    riskCategory === 'High'
      ? `High Risk (${breachProbability}%): In ${breachCount} of ${simulationCount} simulated scenarios, projected spending breached the ${formatINR(budget)} limit (median outcome: ${formatINR(p50)}).`
      : riskCategory === 'Moderate'
      ? `Moderate Risk (${breachProbability}%): Current daily volatility indicates a notable risk of exceeding your ${formatINR(budget)} ceiling (median outcome: ${formatINR(p50)}).`
      : `Low Risk (${breachProbability}%): Spending is well within safety thresholds. In 90% of simulations, final spend stays under ${formatINR(p90)}.`;

  const recommendedMitigation =
    riskCategory === 'High'
      ? `Immediately cut daily spending to under ${formatINR(Math.max(0, Math.round((budget - alreadySpent) / daysRemaining)))}/day for the next ${daysRemaining} days.`
      : riskCategory === 'Moderate'
      ? `Maintain daily vigilance and keep discretionary spending under ${formatINR(Math.round((budget - alreadySpent) / daysRemaining))}/day.`
      : 'Maintain current disciplined expenditure habits.';

  return {
    simulationCount,
    breachCount,
    breachProbability,
    riskCategory,
    quantiles: { p10, p50, p90, min, max, mean },
    simulatedTotalsSample,
    assumptions,
    limitations,
    explanation,
    recommendedMitigation,
  };
}

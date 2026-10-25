import {
  Transaction,
  Budget,
  SavingsGoal,
  TransactionCategory,
  AgentGoal,
  AgentGoalId,
  AgentPerception,
  AgentCondition,
  AgentAction,
  AgentRecommendation,
  AgentCounterfactual,
} from '../types/finance';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetSavings,
  calculateSavingsRate,
  calculateCategoryExpenses,
  calculateDailySpendRate,
  calculateSafeDailyAllowance,
  calculateBudgetUtilization,
  isDiscretionaryCategory,
} from '../utils/calculations';
import {
  getDaysInCurrentMonth,
  getDaysElapsedInMonth,
  getDaysRemainingInMonth,
  formatINR,
} from '../utils/formatters';

export const AGENT_GOALS: Record<AgentGoalId, AgentGoal> = {
  avoid_budget_breach: {
    id: 'avoid_budget_breach',
    name: 'Avoid Budget Breaches',
    description: 'Ensure no expense category exceeds assigned limits before month-end.',
    targetMetric: 'Max Category Utilization',
    targetValue: 90, // %
  },
  reach_savings_goal: {
    id: 'reach_savings_goal',
    name: 'Accelerate Savings Targets',
    description: 'Ensure monthly surplus covers required velocity for milestone goals.',
    targetMetric: 'Savings Surplus vs Goals Needed',
    targetValue: 100, // %
  },
  maintain_emergency_fund: {
    id: 'maintain_emergency_fund',
    name: 'Maintain Emergency Safety Net',
    description: 'Build and preserve at least 3 to 6 months of living expenses.',
    targetMetric: 'Emergency Runway Months',
    targetValue: 6, // months
  },
  reduce_discretionary: {
    id: 'reduce_discretionary',
    name: 'Trim Discretionary Outflows',
    description: 'Cap shopping and entertainment spend to less than 25% of total outflows.',
    targetMetric: 'Discretionary Ratio',
    targetValue: 25, // %
  },
};

/**
 * STEP 1: PERCEIVE
 * Extracts environmental facts from transactions, budgets, goals, and timing.
 */
export function perceiveFinancialState(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  monthlyIncomeBaseline: number = 0,
  yearMonth?: string
): AgentPerception {
  const calculatedIncome = calculateTotalIncome(transactions, yearMonth);
  const totalIncome = calculatedIncome > 0 ? calculatedIncome : (monthlyIncomeBaseline || 0);
  const totalExpenses = calculateTotalExpenses(transactions, yearMonth);
  const netSurplus = calculateNetSavings(totalIncome, totalExpenses);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  const daysInMonth = getDaysInCurrentMonth();
  const daysElapsed = getDaysElapsedInMonth();
  const daysRemaining = getDaysRemainingInMonth();

  const safeDailySpend = calculateSafeDailyAllowance(netSurplus, daysRemaining);
  const actualDailySpend = calculateDailySpendRate(totalExpenses, daysElapsed);

  const categoryExpenses = calculateCategoryExpenses(transactions, yearMonth);

  // Identify highest category
  let highestCategory: AgentPerception['highestCategory'] = null;
  let maxCatAmount = 0;
  for (const [cat, amt] of Object.entries(categoryExpenses)) {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      highestCategory = {
        category: cat as TransactionCategory,
        amount: amt,
        percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
      };
    }
  }

  // Budget alerts
  const budgetAlerts = budgets.map(b => {
    const spent = categoryExpenses[b.category] || 0;
    const utilization = calculateBudgetUtilization(spent, b.limit);
    const excess = Math.max(0, spent - b.limit);
    return {
      category: b.category,
      limit: b.limit,
      spent,
      utilization,
      excess,
    };
  });

  // Active goals metrics
  const activeGoals = goals.map(g => {
    const remainingNeeded = Math.max(0, g.targetAmount - g.currentAmount);
    // Calculate months remaining
    const targetDate = new Date(g.targetDate);
    const now = new Date();
    const monthsRemaining = Math.max(
      1,
      (targetDate.getFullYear() - now.getFullYear()) * 12 +
        (targetDate.getMonth() - now.getMonth())
    );
    const monthlyNeeded = Math.round(remainingNeeded / monthsRemaining);
    return {
      id: g.id,
      title: g.title,
      target: g.targetAmount,
      current: g.currentAmount,
      monthlyNeeded,
      monthsRemaining,
    };
  });

  // Emergency runway
  const emergencyGoal = goals.find(g =>
    g.title.toLowerCase().includes('emergency') || g.category.toLowerCase().includes('safety')
  );
  const emergencyAmount = emergencyGoal ? emergencyGoal.currentAmount : 0;
  const emergencyFundMonths =
    totalExpenses > 0 ? Number((emergencyAmount / totalExpenses).toFixed(1)) : 0;

  return {
    totalIncome,
    totalExpenses,
    netSurplus,
    savingsRate,
    daysElapsed,
    daysRemaining,
    daysInMonth,
    safeDailySpend,
    actualDailySpend,
    highestCategory,
    budgetAlerts,
    activeGoals,
    emergencyFundMonths,
  };
}

/**
 * STEP 2: ANALYZE
 * Computes conditions and anomalies from perceived state.
 */
export function analyzeFinancialCondition(perception: AgentPerception): AgentCondition[] {
  const conditions: AgentCondition[] = [];

  // Condition 1: Check category budget breaches or warnings
  for (const b of perception.budgetAlerts) {
    if (b.utilization >= 100) {
      conditions.push({
        conditionId: `budget_breached_${b.category}`,
        description: `Budget for ${b.category} has been exceeded by ${formatINR(b.excess)} (${b.utilization}% spent).`,
        severity: 'critical',
        metric: `${b.category} Utilization`,
        value: b.utilization,
        threshold: 100,
      });
    } else if (b.utilization >= 85) {
      conditions.push({
        conditionId: `budget_warning_${b.category}`,
        description: `${b.category} spending has reached ${b.utilization}% of limit with ${perception.daysRemaining} days remaining.`,
        severity: 'warning',
        metric: `${b.category} Utilization`,
        value: b.utilization,
        threshold: 85,
      });
    }
  }

  // Condition 2: Savings velocity vs goal requirements
  const totalMonthlyGoalNeeded = perception.activeGoals.reduce((s, g) => s + g.monthlyNeeded, 0);
  if (totalMonthlyGoalNeeded > 0) {
    if (perception.netSurplus < totalMonthlyGoalNeeded) {
      conditions.push({
        conditionId: 'savings_velocity_deficit',
        description: `Current surplus of ${formatINR(perception.netSurplus)} is lower than monthly goal requirements of ${formatINR(totalMonthlyGoalNeeded)}.`,
        severity: perception.netSurplus < 0 ? 'critical' : 'warning',
        metric: 'Goal Coverage Surplus',
        value: perception.netSurplus,
        threshold: totalMonthlyGoalNeeded,
      });
    } else {
      conditions.push({
        conditionId: 'savings_velocity_healthy',
        description: `Monthly surplus of ${formatINR(perception.netSurplus)} comfortably covers required savings targets (${formatINR(totalMonthlyGoalNeeded)}).`,
        severity: 'safe',
        metric: 'Goal Coverage Surplus',
        value: perception.netSurplus,
        threshold: totalMonthlyGoalNeeded,
      });
    }
  }

  // Condition 3: Emergency Fund adequacy
  if (perception.emergencyFundMonths < 3) {
    conditions.push({
      conditionId: 'emergency_fund_insufficient',
      description: `Emergency safety reserve covers only ${perception.emergencyFundMonths} month(s) of expenses (minimum recommended: 3-6 months).`,
      severity: perception.emergencyFundMonths < 1 ? 'critical' : 'warning',
      metric: 'Emergency Months Runway',
      value: perception.emergencyFundMonths,
      threshold: 3,
    });
  }

  // Condition 4: Burn rate velocity
  if (perception.actualDailySpend > perception.safeDailySpend && perception.safeDailySpend > 0) {
    conditions.push({
      conditionId: 'burn_rate_elevated',
      description: `Current daily spend (${formatINR(perception.actualDailySpend)}/day) exceeds recommended safe allowance (${formatINR(perception.safeDailySpend)}/day).`,
      severity: 'warning',
      metric: 'Daily Spend vs Safe Allowance',
      value: perception.actualDailySpend,
      threshold: perception.safeDailySpend,
    });
  }

  // Condition 5: Discretionary spend proportion
  const discretionarySpent = perception.budgetAlerts
    .filter(b => isDiscretionaryCategory(b.category))
    .reduce((sum, b) => sum + b.spent, 0);
  const discretionaryRatio =
    perception.totalExpenses > 0
      ? Math.round((discretionarySpent / perception.totalExpenses) * 100)
      : 0;

  if (discretionaryRatio > 35) {
    conditions.push({
      conditionId: 'high_discretionary_spend',
      description: `Discretionary purchases (Shopping, Entertainment, etc.) represent ${discretionaryRatio}% of total outflows.`,
      severity: 'warning',
      metric: 'Discretionary Ratio',
      value: discretionaryRatio,
      threshold: 30,
    });
  }

  return conditions;
}

/**
 * STEP 3: DECIDE
 * Chooses the best financial action based on the agent's goal and analyzed conditions.
 */
export function selectAgentAction(
  perception: AgentPerception,
  _conditions: AgentCondition[],
  goalId: AgentGoalId
): AgentAction {
  // 1. Goal: Avoid Budget Breach
  if (goalId === 'avoid_budget_breach') {
    const breachedAlert = [...perception.budgetAlerts]
      .filter(b => b.utilization >= 90)
      .sort((a, b) => b.utilization - a.utilization)[0];
    if (breachedAlert) {
      const cutAmount = Math.max(
        1000,
        Math.round(breachedAlert.spent - breachedAlert.limit * 0.9)
      );
      return {
        actionId: 'action_budget_trim',
        title: `Throttle ${breachedAlert.category} Spending`,
        type: 'budget_cut',
        targetCategory: breachedAlert.category,
        suggestedAmount: cutAmount,
        actionDetails: `Halt non-essential ${breachedAlert.category} orders for the next ${perception.daysRemaining} days to pull utilization below 90%.`,
      };
    }

    // Default preventive action
    return {
      actionId: 'action_daily_spend_cap',
      title: 'Enforce Daily Spending Cap',
      type: 'budget_cut',
      suggestedAmount: Math.max(500, perception.safeDailySpend),
      actionDetails: `Cap daily variable expenses at ${formatINR(perception.safeDailySpend)} to prevent any category from approaching threshold.`,
    };
  }

  // 2. Goal: Reach Savings Goal
  if (goalId === 'reach_savings_goal') {
    const totalGoalNeeded = perception.activeGoals.reduce((s, g) => s + g.monthlyNeeded, 0);
    const deficit = Math.max(0, totalGoalNeeded - perception.netSurplus);

    if (deficit > 0) {
      return {
        actionId: 'action_boost_savings_surplus',
        title: 'Reallocate Cash Flow to Cover Goal Deficit',
        type: 'boost_savings',
        suggestedAmount: deficit,
        actionDetails: `Trim discretionary expenses by ${formatINR(deficit)} to fully fund your active milestone commitments.`,
      };
    }

    return {
      actionId: 'action_accelerate_deposit',
      title: 'Execute Goal Milestone Deposit',
      type: 'boost_savings',
      suggestedAmount: Math.min(perception.netSurplus, 5000),
      actionDetails: `Deposit ${formatINR(Math.min(perception.netSurplus, 5000))} of your current surplus directly into your top priority goal.`,
    };
  }

  // 3. Goal: Maintain Emergency Fund
  if (goalId === 'maintain_emergency_fund') {
    const targetFund = perception.totalExpenses * 3;
    const currentFund = perception.emergencyFundMonths * perception.totalExpenses;
    const gap = Math.max(0, targetFund - currentFund);
    const suggestedDeposit = Math.min(Math.max(2500, Math.round(gap / 6)), perception.netSurplus);

    return {
      actionId: 'action_fund_emergency_reserve',
      title: 'Deposit Emergency Reserve Allocation',
      type: 'emergency_reallocation',
      suggestedAmount: Math.max(1500, suggestedDeposit),
      actionDetails: `Direct ${formatINR(Math.max(1500, suggestedDeposit))} from this month's net cash flow to bring emergency runway to safe levels.`,
    };
  }

  // 4. Goal: Reduce Discretionary Spending
  const discretionaryCats: TransactionCategory[] = ['Shopping', 'Entertainment', 'Other'];
  const highestDiscretionary = perception.budgetAlerts
    .filter(b => discretionaryCats.includes(b.category))
    .sort((a, b) => b.spent - a.spent)[0];

  const trimAmt = highestDiscretionary
    ? Math.round(highestDiscretionary.spent * 0.25)
    : 2000;

  return {
    actionId: 'action_discretionary_pause',
    title: `Implement 48-Hour Pause on ${highestDiscretionary ? highestDiscretionary.category : 'Discretionary'} Orders`,
    type: 'discretionary_pause',
    targetCategory: highestDiscretionary ? highestDiscretionary.category : 'Shopping',
    suggestedAmount: trimAmt,
    actionDetails: `Delay new impulse purchases by 48 hours to save approximately ${formatINR(trimAmt)} this cycle.`,
  };
}

/**
 * STEP 4: ACT & RECOMMEND
 * Generates transparent explanation with clear rationale and numbers.
 */
export function generateRecommendation(
  activeGoal: AgentGoal,
  conditions: AgentCondition[],
  action: AgentAction,
  perception: AgentPerception
): AgentRecommendation {
  let explanation = '';
  const rationale: string[] = [];

  if (action.targetCategory) {
    const alert = perception.budgetAlerts.find(b => b.category === action.targetCategory);
    if (alert) {
      explanation = `Your ${action.targetCategory} spending has reached ${alert.utilization}% of its monthly limit (${formatINR(alert.spent)} of ${formatINR(alert.limit)}), with ${perception.daysRemaining} days remaining in the month. Applying ${action.title} will protect you from exceeding the assigned budget.`;
      rationale.push(
        `Category: ${alert.category} | Spent: ${formatINR(alert.spent)} | Limit: ${formatINR(alert.limit)} (${alert.utilization}%)`
      );
    }
  }

  if (!explanation) {
    explanation = `Under your active goal "${activeGoal.name}", the agent identified an opportunity to optimize your finances. By executing "${action.title}", you will strengthen your monthly net surplus from ${formatINR(perception.netSurplus)} and preserve long-term financial discipline.`;
  }

  rationale.push(`Days remaining in month: ${perception.daysRemaining} days.`);
  rationale.push(`Current burn rate: ${formatINR(perception.actualDailySpend)}/day vs Safe rate: ${formatINR(perception.safeDailySpend)}/day.`);
  if (perception.savingsRate > 0) {
    rationale.push(`Current savings rate: ${perception.savingsRate}% of total inflows.`);
  }

  const expectedOutcome = `By applying this recommendation, you will preserve an estimated ${formatINR(action.suggestedAmount)} in liquidity and maintain compliance with your "${activeGoal.name}" target.`;

  const counterfactual = evaluateActionOutcome(perception, action);

  return {
    goal: activeGoal,
    conditionsDetected: conditions,
    selectedAction: action,
    explanation,
    rationale,
    expectedOutcome,
    counterfactual,
  };
}

/**
 * STEP 5: EVALUATE (Counterfactual Analysis)
 * Calculates whether the financial situation improves when the action is applied.
 */
export function evaluateActionOutcome(
  perception: AgentPerception,
  action: AgentAction
): AgentCounterfactual {
  if (action.type === 'budget_cut' || action.type === 'discretionary_pause') {
    const beforeExpenses = perception.totalExpenses;
    const afterExpenses = Math.max(0, beforeExpenses - action.suggestedAmount);
    const beforeRate = perception.savingsRate;
    const afterRate = calculateSavingsRate(perception.totalIncome, afterExpenses);

    return {
      metricName: 'Monthly Savings Rate',
      before: beforeRate,
      after: afterRate,
      unit: '%',
      improvement: afterRate > beforeRate,
      explanation: `Savings rate expands by +${afterRate - beforeRate}% as monthly outflows drop from ${formatINR(beforeExpenses)} to ${formatINR(afterExpenses)}.`,
    };
  }

  if (action.type === 'emergency_reallocation') {
    const beforeRunway = perception.emergencyFundMonths;
    const additionalMonths =
      perception.totalExpenses > 0
        ? Number((action.suggestedAmount / perception.totalExpenses).toFixed(2))
        : 0;
    const afterRunway = Number((beforeRunway + additionalMonths).toFixed(1));

    return {
      metricName: 'Emergency Runway',
      before: beforeRunway,
      after: afterRunway,
      unit: 'months',
      improvement: afterRunway > beforeRunway,
      explanation: `Emergency reserves improve from ${beforeRunway} to ${afterRunway} months of defensive runway coverage.`,
    };
  }

  // Boost savings
  const beforeSurplus = perception.netSurplus;
  const afterSurplus = beforeSurplus + action.suggestedAmount;

  return {
    metricName: 'Net Surplus Saved',
    before: beforeSurplus,
    after: afterSurplus,
    unit: '₹',
    improvement: afterSurplus > beforeSurplus,
    explanation: `Available monthly cash surplus increases by +${formatINR(action.suggestedAmount)} toward your target milestone.`,
  };
}

/**
 * Complete Agent Execution Cycle Helper
 */
export function runIntelligentAgentCycle(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  goalId: AgentGoalId = 'avoid_budget_breach',
  monthlyIncomeBaseline: number = 0,
  yearMonth?: string
): AgentRecommendation {
  const goal = AGENT_GOALS[goalId];
  const perception = perceiveFinancialState(
    transactions,
    budgets,
    goals,
    monthlyIncomeBaseline,
    yearMonth
  );
  const conditions = analyzeFinancialCondition(perception);
  const action = selectAgentAction(perception, conditions, goalId);
  return generateRecommendation(goal, conditions, action, perception);
}

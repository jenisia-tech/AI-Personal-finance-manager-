import {
  Transaction,
  Budget,
  SavingsGoal,
  UserProfile,
  AgentGoalId,
  AgentRecommendation,
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
  calculateHealthScore,
} from '../utils/calculations';
import { formatINR, getDaysRemainingInMonth, getDaysElapsedInMonth } from '../utils/formatters';
import { runIntelligentAgentCycle } from './financialAgentService';
import { extractFinancialFacts, runForwardChainingReasoning } from './financialReasoningService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  chips?: string[];
  recommendation?: AgentRecommendation;
}

export interface InsightCardData {
  id: string;
  type: 'anomaly' | 'velocity' | 'savings' | 'alert';
  title: string;
  description: string;
  impact: string;
  icon: string;
  actionText?: string;
  actionTab?: string;
}

export interface BudgetAlertItem {
  category: string;
  spent: number;
  limit: number;
  utilization: number;
  excess: number;
  urgency: 'warning' | 'danger';
  recommendation: string;
}

export interface SavingStrategyItem {
  id: string;
  title: string;
  formula: string;
  description: string;
  savingsPotential: string;
  targetCategory: string;
}

export const aiAdvisorService = {
  /**
   * Generates categorized insights from live user transactions and budgets.
   */
  generateInsights(
    transactions: Transaction[],
    budgets: Budget[],
    goals: SavingsGoal[],
    monthlyIncomeBaseline: number = 0,
    yearMonth?: string
  ): InsightCardData[] {
    const totalIncome = Math.max(calculateTotalIncome(transactions, yearMonth), monthlyIncomeBaseline);
    const totalExpenses = calculateTotalExpenses(transactions, yearMonth);
    const categoryExpenses = calculateCategoryExpenses(transactions, yearMonth);
    const daysElapsed = getDaysElapsedInMonth();
    const daysRemaining = getDaysRemainingInMonth();
    const netSurplus = calculateNetSavings(totalIncome, totalExpenses);
    const safeDaily = calculateSafeDailyAllowance(netSurplus, daysRemaining);
    const actualDaily = calculateDailySpendRate(totalExpenses, daysElapsed);

    const insights: InsightCardData[] = [];

    // 1. Highest Expense Anomaly
    let highestCat = '';
    let maxAmount = 0;
    for (const [cat, amt] of Object.entries(categoryExpenses)) {
      if (amt > maxAmount) {
        maxAmount = amt;
        highestCat = cat;
      }
    }

    if (highestCat && totalExpenses > 0) {
      const pct = Math.round((maxAmount / totalExpenses) * 100);
      insights.push({
        id: 'ins-highest-cat',
        type: 'anomaly',
        title: `Heavy Outflow in ${highestCat}`,
        description: `You have spent ${formatINR(maxAmount)} on ${highestCat}, making up ${pct}% of all outflows this month.`,
        impact: `${pct}% of total expenses`,
        icon: '📊',
        actionText: 'View Transactions',
        actionTab: 'transactions',
      });
    }

    // 2. Daily Spend Velocity
    if (actualDaily > safeDaily && safeDaily > 0) {
      insights.push({
        id: 'ins-velocity',
        type: 'velocity',
        title: 'Elevated Daily Spend Rate',
        description: `Current burn rate is ${formatINR(actualDaily)}/day compared to your safe limit of ${formatINR(safeDaily)}/day.`,
        impact: `${formatINR(actualDaily - safeDaily)}/day above safe pace`,
        icon: '⚡',
        actionText: 'Open AI Lab',
        actionTab: 'ai-lab',
      });
    } else if (safeDaily > 0) {
      insights.push({
        id: 'ins-velocity-safe',
        type: 'velocity',
        title: 'Safe Daily Spending Pace',
        description: `You are spending ${formatINR(actualDaily)}/day. You can safely spend up to ${formatINR(safeDaily)}/day without deficit.`,
        impact: 'On track',
        icon: '🟢',
      });
    }

    // 3. Savings Goal Velocity
    if (goals.length > 0) {
      const topGoal = goals[0];
      const remaining = Math.max(0, topGoal.targetAmount - topGoal.currentAmount);
      const pct = Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100);
      insights.push({
        id: 'ins-goal-pace',
        type: 'savings',
        title: `${topGoal.title} Funding Pace`,
        description: `Goal is at ${pct}% funded (${formatINR(topGoal.currentAmount)} of ${formatINR(topGoal.targetAmount)}). Remaining needed: ${formatINR(remaining)}.`,
        impact: `${pct}% complete`,
        icon: topGoal.icon || '🎯',
        actionText: 'View Goals',
        actionTab: 'goals',
      });
    }

    // 4. Over Budget Alerts
    for (const b of budgets) {
      const spent = categoryExpenses[b.category] || 0;
      const util = calculateBudgetUtilization(spent, b.limit);
      if (util >= 90) {
        insights.push({
          id: `ins-alert-${b.id}`,
          type: 'alert',
          title: `${b.category} Budget Alert (${util}%)`,
          description: `Spent ${formatINR(spent)} against limit of ${formatINR(b.limit)}. ${daysRemaining} days remain.`,
          impact: util > 100 ? `${formatINR(spent - b.limit)} over budget` : 'Critical threshold',
          icon: '🚨',
          actionText: 'View Budgets',
          actionTab: 'budgets',
        });
      }
    }

    return insights;
  },

  /**
   * Generates over-budget alerts list.
   */
  generateBudgetAlerts(
    transactions: Transaction[],
    budgets: Budget[],
    yearMonth?: string
  ): BudgetAlertItem[] {
    const categoryExpenses = calculateCategoryExpenses(transactions, yearMonth);
    const alerts: BudgetAlertItem[] = [];

    for (const b of budgets) {
      const spent = categoryExpenses[b.category] || 0;
      const util = calculateBudgetUtilization(spent, b.limit);
      if (util >= b.alertThreshold) {
        alerts.push({
          category: b.category,
          spent,
          limit: b.limit,
          utilization: util,
          excess: Math.max(0, spent - b.limit),
          urgency: util >= 100 ? 'danger' : 'warning',
          recommendation:
            util >= 100
              ? `Halt non-vital transactions in ${b.category} to prevent further deficit.`
              : `Spend cautiously: only ${formatINR(b.limit - spent)} remaining for the month.`,
        });
      }
    }

    return alerts.sort((a, b) => b.utilization - a.utilization);
  },

  /**
   * Generates actionable financial strategies.
   */
  generateSavingStrategies(income: number, expenses: number): SavingStrategyItem[] {
    const surplus = calculateNetSavings(income, expenses);
    const target503020Savings = Math.round(income * 0.2);

    return [
      {
        id: 'strat-1',
        title: '50 / 30 / 20 Budget Allocation',
        formula: '50% Needs + 30% Wants + 20% Savings',
        description: `Based on your monthly income of ${formatINR(income)}, allocate ${formatINR(income * 0.5)} for essentials, ${formatINR(income * 0.3)} for discretionary, and ${formatINR(target503020Savings)} for guaranteed savings.`,
        savingsPotential: `${formatINR(target503020Savings)}/month`,
        targetCategory: 'Cash Flow Allocation',
      },
      {
        id: 'strat-2',
        title: 'The 48-Hour Cart Rule',
        formula: 'Delay Discretionary Checkout by 48h',
        description: 'Before making any unplanned online purchase over ₹1,000 in Shopping or Entertainment, keep it in cart for 48 hours to eliminate impulse dopamine spending.',
        savingsPotential: '₹2,500 - ₹5,000/month',
        targetCategory: 'Shopping & Entertainment',
      },
      {
        id: 'strat-3',
        title: 'Automated Micro-SIP Compounding',
        formula: 'Surplus Auto-Debit on 1st of Month',
        description: `Direct at least ${formatINR(Math.min(5000, Math.max(1000, surplus * 0.4)))} into low-cost index funds or liquid funds as soon as your salary credits.`,
        savingsPotential: 'High Long-Term Wealth',
        targetCategory: 'Investments',
      },
    ];
  },

  /**
   * Conversational Chat Response Generator (Offline Rule-Based AI Engine + CO1 Agent Integration).
   */
  async generateChatResponse(
    userMessage: string,
    transactions: Transaction[],
    budgets: Budget[],
    goals: SavingsGoal[],
    profile: UserProfile,
    activeGoalId: AgentGoalId = 'avoid_budget_breach',
    yearMonth?: string
  ): Promise<{ text: string; chips?: string[]; recommendation?: AgentRecommendation }> {
    const query = userMessage.toLowerCase().trim();
    const totalIncome = Math.max(calculateTotalIncome(transactions, yearMonth), profile.monthlyIncome);
    const totalExpenses = calculateTotalExpenses(transactions, yearMonth);
    const netSurplus = calculateNetSavings(totalIncome, totalExpenses);
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);
    const categoryExpenses = calculateCategoryExpenses(transactions, yearMonth);
    const daysRemaining = getDaysRemainingInMonth();
    const safeDaily = calculateSafeDailyAllowance(netSurplus, daysRemaining);

    // Run CO1 agent cycle
    const agentRec = runIntelligentAgentCycle(
      transactions,
      budgets,
      goals,
      activeGoalId,
      profile.monthlyIncome,
      yearMonth
    );

    // 1. Health check queries
    if (query.includes('health') || query.includes('how am i doing') || query.includes('status')) {
      const health = calculateHealthScore(totalIncome, totalExpenses, budgets, goals, categoryExpenses);
      return {
        text: `Your overall Financial Health Score is **${health.score}/100 (${health.grade})**!\n\n` +
          `• **Monthly Inflows:** ${formatINR(totalIncome)}\n` +
          `• **Total Expenses:** ${formatINR(totalExpenses)}\n` +
          `• **Net Surplus:** ${formatINR(netSurplus)} (${savingsRate}% savings rate)\n` +
          `• **Safe Daily Spend:** ${formatINR(safeDaily)}/day for the next ${daysRemaining} days.\n\n` +
          (health.recommendations.length > 0 ? `💡 **Top Recommendation:** ${health.recommendations[0]}` : 'Keep up the disciplined financial habits!'),
        chips: ['Where am I overspending?', 'What does the agent recommend?', 'Tips to save ₹5,000'],
      };
    }

    // 2. Overspending queries
    if (query.includes('overspend') || query.includes('spending') || query.includes('category')) {
      const alerts = budgets
        .map(b => ({
          cat: b.category,
          spent: categoryExpenses[b.category] || 0,
          limit: b.limit,
          util: calculateBudgetUtilization(categoryExpenses[b.category] || 0, b.limit),
        }))
        .filter(b => b.util >= 85)
        .sort((a, b) => b.util - a.util);

      if (alerts.length > 0) {
        const lines = alerts.map(
          a => `• **${a.cat}:** ${a.util}% spent (${formatINR(a.spent)} of ${formatINR(a.limit)})`
        );
        return {
          text: `Here are your categories requiring immediate attention:\n\n${lines.join('\n')}\n\n` +
            `With ${daysRemaining} days remaining in the month, I recommend cutting back non-vital expenses in these sectors immediately.`,
          chips: ['How healthy is my budget?', 'What does the agent recommend?'],
        };
      }

      return {
        text: `Great news! None of your category budgets are currently breached or above 85% utilization. Your total expenses stand at ${formatINR(totalExpenses)} against total inflows of ${formatINR(totalIncome)}.`,
        chips: ['How healthy is my budget?', 'Tips to save ₹5,000'],
      };
    }

    // 3. Saving tips queries
    if (query.includes('save') || query.includes('tip') || query.includes('5000') || query.includes('reduce')) {
      return {
        text: `Here is a custom 3-step action plan to boost your savings this month:\n\n` +
          `1. **Discretionary Freeze:** Pause non-essential Shopping & Dining orders for the next 7 days (estimated savings: ${formatINR(2500)}).\n` +
          `2. **Safe Daily Cap:** Maintain your daily spend under ${formatINR(safeDaily)}/day for the remaining ${daysRemaining} days.\n` +
          `3. **SIP Automator:** Direct ${formatINR(Math.min(5000, Math.max(1000, netSurplus * 0.3)))} of your ${formatINR(netSurplus)} surplus directly into your top savings goal.`,
        chips: ['How healthy is my budget?', 'What does the agent recommend?'],
      };
    }

    // 4. Intelligent Agent recommendation query
    if (query.includes('agent') || query.includes('recommend') || query.includes('ai lab') || query.includes('action')) {
      return {
        text: `🤖 **FinBot Intelligent Agent Decision Cycle:**\n\n` +
          `• **Active Goal:** ${agentRec.goal.name}\n` +
          `• **Agent Action Selected:** ${agentRec.selectedAction.title}\n` +
          `• **Explanation:** ${agentRec.explanation}\n\n` +
          `📈 **Counterfactual Projected Outcome:**\n` +
          `${agentRec.counterfactual.explanation}\n\n` +
          `You can test and simulate full Perceive-Analyze-Decide-Act cycles in the **AI Algorithms Lab** tab!`,
        chips: ['How healthy is my budget?', 'Where am I overspending?', 'Explain my budget breach risk'],
        recommendation: agentRec,
      };
    }

    // 5. Risk / uncertainty queries
    if (query.includes('risk') || query.includes('probability') || query.includes('uncertainty') || query.includes('breach')) {
      const facts = extractFinancialFacts(transactions, budgets, goals, profile.monthlyIncome, yearMonth);
      const reasoning = runForwardChainingReasoning(facts);
      return {
        text: `📊 **Probabilistic & Rule-Based Reasoning Summary:**\n\n` +
          `• **Rules Evaluated:** ${reasoning.evaluatedCount} | **Triggered Rules:** ${reasoning.triggeredCount}\n` +
          `• **Highest Category Utilization:** ${facts.maxCategoryUtilization.formattedValue} (${facts.maxUtilCategory.formattedValue})\n` +
          `• **Days Remaining:** ${facts.daysRemaining.formattedValue}\n\n` +
          `Head over to the **AI Algorithms Lab (Reasoning Under Uncertainty)** tab to execute Monte Carlo simulations with customizable iteration counts and seeded randomness!`,
        chips: ['What does the agent recommend?', 'How healthy is my budget?'],
      };
    }

    // Default response integrating agent decision
    return {
      text: `Hello ${profile.name}! I am FinBot, your intelligent AI financial advisor.\n\n` +
        `Current Status:\n` +
        `• **Net Balance:** ${formatINR(netSurplus)}\n` +
        `• **Savings Rate:** ${savingsRate}%\n` +
        `• **Agent Recommendation:** ${agentRec.selectedAction.title} (${formatINR(agentRec.selectedAction.suggestedAmount)})\n\n` +
        `How can I assist your financial planning today?`,
      chips: [
        'How healthy is my budget?',
        'Where am I overspending?',
        'What does the agent recommend?',
        'Tips to save ₹5,000',
      ],
      recommendation: agentRec,
    };
  },
};

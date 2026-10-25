export type TransactionType = 'income' | 'expense' | 'deposit' | 'withdrawal';

export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Education'
  | 'Entertainment'
  | 'Bills'
  | 'Healthcare'
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Allowance'
  | 'Other';

export type PaymentMode =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'Cash';

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  paymentMode: PaymentMode;
  date: string; // YYYY-MM-DD
  description: string;
  goalId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId?: string;
  category: TransactionCategory;
  limit: number;
  period: 'monthly';
  alertThreshold: number; // percentage, e.g. 80
  startDate?: string;
  endDate?: string;
}

export interface SavingsGoal {
  id: string;
  userId?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  monthlyIncome: number;
  currency: string;
  theme: 'light' | 'dark';
  apiKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  grade: 'Excellent' | 'Good' | 'Fair' | 'Critical';
  factors: {
    name: string;
    impact: 'positive' | 'warning' | 'negative';
    description: string;
  }[];
  recommendations: string[];
}

export interface FilterOptions {
  search: string;
  type: 'all' | TransactionType;
  category: string;
  paymentMode: string;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

/* =========================================================================
 * COURSE OUTCOME 1 (CO1): Intelligent Agent Models & Problem-Solving
 * ========================================================================= */

export type AgentGoalId =
  | 'avoid_budget_breach'
  | 'reach_savings_goal'
  | 'maintain_emergency_fund'
  | 'reduce_discretionary';

export interface AgentGoal {
  id: AgentGoalId;
  name: string;
  description: string;
  targetMetric: string;
  targetValue: number;
}

export interface AgentPerception {
  totalIncome: number;
  totalExpenses: number;
  netSurplus: number;
  savingsRate: number; // in %
  daysElapsed: number;
  daysRemaining: number;
  daysInMonth: number;
  safeDailySpend: number;
  actualDailySpend: number;
  highestCategory: {
    category: TransactionCategory;
    amount: number;
    percentage: number;
  } | null;
  budgetAlerts: {
    category: TransactionCategory;
    limit: number;
    spent: number;
    utilization: number;
    excess: number;
  }[];
  activeGoals: {
    id: string;
    title: string;
    target: number;
    current: number;
    monthlyNeeded: number;
    monthsRemaining: number;
  }[];
  emergencyFundMonths: number;
}

export interface AgentCondition {
  conditionId: string;
  description: string;
  severity: 'safe' | 'info' | 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
}

export interface AgentAction {
  actionId: string;
  title: string;
  type: 'budget_cut' | 'boost_savings' | 'emergency_reallocation' | 'discretionary_pause';
  suggestedAmount: number;
  targetCategory?: TransactionCategory;
  actionDetails: string;
}

export interface AgentCounterfactual {
  metricName: string;
  before: number;
  after: number;
  unit: string;
  improvement: boolean;
  explanation: string;
}

export interface AgentRecommendation {
  goal: AgentGoal;
  conditionsDetected: AgentCondition[];
  selectedAction: AgentAction;
  explanation: string;
  rationale: string[];
  expectedOutcome: string;
  counterfactual: AgentCounterfactual;
}

export interface AgentCycleState {
  timestamp: string;
  perception: AgentPerception;
  conditions: AgentCondition[];
  activeGoal: AgentGoal;
  recommendation: AgentRecommendation | null;
}

/* =========================================================================
 * COURSE OUTCOME 2 (CO2): Uninformed & Informed Search Techniques
 * ========================================================================= */

export interface SearchState {
  month: number;
  currentSavings: number;
}

export interface SearchAction {
  month: number;
  saveAmount: number;
}

export interface SearchNode {
  state: SearchState;
  parent: SearchNode | null;
  action: SearchAction | null;
  g: number; // Path cost (cumulative months or penalty)
  h: number; // Heuristic estimate to target savings
  f: number; // Evaluation function f(n)
  depth: number;
}

export interface SearchTraceStep {
  stepNumber: number;
  state: SearchState;
  actionTaken?: SearchAction;
  heuristic: number;
  evaluationScore: number;
  frontierSize: number;
  visitedCount: number;
  isGoal: boolean;
  notes: string;
}

export interface SavingsPlanStep {
  month: number;
  saveAmount: number;
  resultingSavings: number;
}

export type SearchAlgorithmType = 'BFS' | 'BestFirst';

export interface SearchResult {
  algorithm: SearchAlgorithmType;
  success: boolean;
  plan: SavingsPlanStep[];
  totalSaved: number;
  targetSavings: number;
  planningHorizonMonths: number;
  statesExplored: number;
  maxFrontierSize: number;
  executionTimeMs: number;
  trace: SearchTraceStep[];
  message: string;
}

export interface SearchComparison {
  bfsResult: SearchResult;
  bestFirstResult: SearchResult;
  fasterAlgorithm: 'BFS' | 'BestFirst' | 'Equal';
  fewerStatesAlgorithm: 'BFS' | 'BestFirst' | 'Equal';
  analysis: string;
}

/* =========================================================================
 * COURSE OUTCOME 4 (CO4): Rule-Based & Probabilistic Reasoning
 * ========================================================================= */

export interface FinancialFact {
  key: string;
  label: string;
  value: any;
  formattedValue: string;
  category: 'income' | 'expense' | 'budget' | 'goal' | 'timing' | 'cashflow' | 'safety';
}

export interface InferenceRule {
  id: string;
  name: string;
  category: 'budget' | 'savings' | 'cashflow' | 'safety' | 'expense';
  priority: 'low' | 'medium' | 'high' | 'critical';
  conditionDescription: string;
  evaluate: (facts: Record<string, any>) => boolean;
  getConclusion: (facts: Record<string, any>) => string;
  getAction: (facts: Record<string, any>) => string;
  getRequiredFacts: () => string[];
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  conditionDescription: string;
  satisfied: boolean;
  factsUsed: { key: string; label: string; value: any; formatted: string }[];
  conclusion: string;
  recommendedAction: string;
}

export interface MonteCarloConfig {
  budget: number;
  alreadySpent: number;
  daysElapsed: number;
  daysRemaining: number;
  meanDailySpend: number;
  stdDevDailySpend: number;
  simulationCount: number;
  randomSeed: number;
}

export interface SimulationQuantiles {
  p10: number;
  p50: number; // Median projected total
  p90: number;
  min: number;
  max: number;
  mean: number;
}

export type RiskCategory = 'Low' | 'Moderate' | 'High';

export interface MonteCarloSimulationResult {
  simulationCount: number;
  breachCount: number;
  breachProbability: number; // percentage (0 - 100)
  riskCategory: RiskCategory;
  quantiles: SimulationQuantiles;
  simulatedTotalsSample: number[]; // First 40 for distribution visual
  assumptions: string[];
  limitations: string[];
  explanation: string;
  recommendedMitigation: string;
}

/* =========================================================================
 * COURSE OUTCOME 5 (CO5): Machine Learning for Intelligent Decision-Making
 * ========================================================================= */

export interface HoldoutEvaluation {
  canEvaluate: boolean;
  trainMonths: number;
  testMonths: number;
  mae: number;
  message: string;
}

export interface BudgetComparisonResult {
  hasBudget: boolean;
  budgetLimit: number;
  difference: number;
  isExceeded: boolean;
  status: 'exceeded' | 'within_budget' | 'no_budget';
  message: string;
}

export interface SpendingPredictionData {
  hasEnoughData: boolean;
  monthsCount: number;
  requiredMonths: number;
  predictedAmount: number;
  nextMonth: string;
  nextMonthLabel: string;
  recentActualAmount: number;
  differenceRupees: number;
  differencePercent: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  historicalData: Array<{
    month: string;
    actualAmount: number;
    predictedTrend?: number;
  }>;
  chartData: Array<{
    month: string;
    actual: number | null;
    predicted: number | null;
    isProjected?: boolean;
  }>;
  model: {
    slope: number;
    intercept: number;
    rSquared: number;
    isZeroVariance: boolean;
  } | null;
  evaluation: HoldoutEvaluation;
  budgetComparison: BudgetComparisonResult;
  explanation: string;
  disclaimer: string;
}


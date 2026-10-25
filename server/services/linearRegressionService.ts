export interface RawTransactionRecord {
  date: string;
  amount: number;
  type: string;
}

export interface MonthlyExpensePoint {
  month: string; // YYYY-MM
  actualAmount: number;
  index: number;
  transactionCount: number;
}

export interface LinearRegressionModel {
  slope: number;
  intercept: number;
  rSquared: number;
  isZeroVariance: boolean;
  predict: (x: number) => number;
}

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

export interface SpendingPredictionResponse {
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

/**
 * Filter valid historical expenses:
 * - Must be type 'expense'
 * - Must not be future-dated relative to reference date (YYYY-MM-DD)
 * - Amount must be positive
 */
export function filterHistoricalExpenses(
  transactions: RawTransactionRecord[],
  referenceDateStr?: string
): RawTransactionRecord[] {
  const maxDate = referenceDateStr || new Date().toISOString().split('T')[0];

  return transactions.filter((tx) => {
    if (tx.type !== 'expense') return false;
    if (typeof tx.amount !== 'number' || isNaN(tx.amount) || tx.amount <= 0) return false;
    if (!tx.date || typeof tx.date !== 'string') return false;
    // Exclude future-dated transactions
    if (tx.date > maxDate) return false;
    return true;
  });
}

/**
 * Aggregate expenses by calendar month (YYYY-MM) in chronological order.
 */
export function aggregateMonthlyExpenses(
  expenses: RawTransactionRecord[]
): MonthlyExpensePoint[] {
  const monthlyMap = new Map<string, { total: number; count: number }>();

  for (const exp of expenses) {
    const monthKey = exp.date.substring(0, 7); // Extract YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(monthKey)) continue;

    const current = monthlyMap.get(monthKey) || { total: 0, count: 0 };
    monthlyMap.set(monthKey, {
      total: current.total + exp.amount,
      count: current.count + 1,
    });
  }

  // Sort months chronologically
  const sortedMonths = Array.from(monthlyMap.keys()).sort();

  return sortedMonths.map((month, index) => {
    const data = monthlyMap.get(month)!;
    return {
      month,
      actualAmount: Math.round(data.total * 100) / 100,
      index,
      transactionCount: data.count,
    };
  });
}

/**
 * Fit an Ordinary Least Squares (OLS) Linear Regression model:
 * y = slope * x + intercept
 *
 * Handles:
 * - Known linear trends
 * - Zero variance (all y identical)
 * - Outliers and single-point boundaries
 */
export function fitLinearRegression(points: Array<{ x: number; y: number }>): LinearRegressionModel {
  const n = points.length;
  if (n === 0) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      isZeroVariance: true,
      predict: () => 0,
    };
  }

  if (n === 1) {
    const val = points[0].y;
    return {
      slope: 0,
      intercept: val,
      rSquared: 1,
      isZeroVariance: true,
      predict: () => val,
    };
  }

  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let ssXX = 0;
  let ssXY = 0;
  let ssYY = 0;

  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    ssXX += dx * dx;
    ssXY += dx * dy;
    ssYY += dy * dy;
  }

  // Zero variance in Y: all target expenses are identical
  const isZeroVariance = ssYY === 0 || Math.abs(ssYY) < 1e-9;
  if (isZeroVariance) {
    const exactY = points[0].y;
    return {
      slope: 0,
      intercept: exactY,
      rSquared: 1,
      isZeroVariance: true,
      predict: () => exactY,
    };
  }

  // If all X are identical (cannot happen with sequence 0, 1, ..., n-1)
  if (ssXX === 0 || Math.abs(ssXX) < 1e-9) {
    return {
      slope: 0,
      intercept: meanY,
      rSquared: 0,
      isZeroVariance: false,
      predict: () => meanY,
    };
  }

  const slope = ssXY / ssXX;
  const intercept = meanY - slope * meanX;
  const rSquared = ssYY > 0 ? Math.min(1, Math.max(0, (ssXY * ssXY) / (ssXX * ssYY))) : 1;

  return {
    slope,
    intercept,
    rSquared,
    isZeroVariance: false,
    predict: (x: number) => {
      const pred = slope * x + intercept;
      // Expenses cannot be negative
      return Math.max(0, Math.round(pred * 100) / 100);
    },
  };
}

/**
 * Calculate Mean Absolute Error (MAE) between actual and predicted vectors.
 */
export function calculateMAE(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) return 0;
  const totalError = actual.reduce((sum, act, idx) => sum + Math.abs(act - predicted[idx]), 0);
  return Math.round((totalError / actual.length) * 100) / 100;
}

/**
 * Perform chronological holdout evaluation:
 * Trains strictly on earlier months and tests strictly on later un-seen months.
 * Guarantees zero data leakage from future observations.
 */
export function evaluateChronologicalHoldout(
  monthlyData: MonthlyExpensePoint[]
): HoldoutEvaluation {
  const n = monthlyData.length;
  // Require at least 4 months so we have at least 3 train and 1 test month
  if (n < 4) {
    return {
      canEvaluate: false,
      trainMonths: n,
      testMonths: 0,
      mae: 0,
      message: `Chronological holdout evaluation requires at least 4 historical monthly observations (currently ${n}) to train on earlier months and evaluate on un-seen future observations without data leakage.`,
    };
  }

  // Test set: the most recent 1 to 2 months (e.g. 20-25% of time series)
  const testCount = Math.max(1, Math.min(2, Math.floor(n * 0.25)));
  const trainCount = n - testCount;

  const trainSet = monthlyData.slice(0, trainCount).map((m, idx) => ({ x: idx, y: m.actualAmount }));
  const testSet = monthlyData.slice(trainCount);

  const model = fitLinearRegression(trainSet);

  const actuals: number[] = [];
  const predicteds: number[] = [];

  testSet.forEach((item, offset) => {
    const testIndex = trainCount + offset;
    actuals.push(item.actualAmount);
    predicteds.push(model.predict(testIndex));
  });

  const mae = calculateMAE(actuals, predicteds);

  return {
    canEvaluate: true,
    trainMonths: trainCount,
    testMonths: testCount,
    mae,
    message: `Chronological holdout validation: trained on first ${trainCount} historical month(s) and evaluated on ${testCount} holdout month(s). Average deviation: ₹${mae.toLocaleString('en-IN')}.`,
  };
}

/**
 * Compute the next calendar month in 'YYYY-MM' format.
 */
export function getNextCalendarMonth(currentMonthStr: string): string {
  const [yearStr, monthStr] = currentMonthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  if (month === 12) {
    year += 1;
    month = 1;
  } else {
    month += 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Convert 'YYYY-MM' into human-readable label (e.g. 'Nov 2026')
 */
export function formatMonthLabel(monthStr: string): string {
  const [yearStr, monthPart] = monthStr.split('-');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const mIdx = parseInt(monthPart, 10) - 1;
  return `${monthNames[mIdx] || monthPart} ${yearStr}`;
}

/**
 * Compare predicted spending against applicable monthly budget.
 */
export function evaluateBudgetComparison(
  predictedAmount: number,
  budgetLimit: number
): BudgetComparisonResult {
  if (!budgetLimit || budgetLimit <= 0) {
    return {
      hasBudget: false,
      budgetLimit: 0,
      difference: 0,
      isExceeded: false,
      status: 'no_budget',
      message: 'No active monthly budget configured. Create a budget in Budget Planner to compare your spending forecast against target spending limits.',
    };
  }

  const roundedLimit = Math.round(budgetLimit * 100) / 100;
  const diff = Math.round(Math.abs(predictedAmount - roundedLimit) * 100) / 100;
  const isExceeded = predictedAmount > roundedLimit;

  if (isExceeded) {
    const excessPct = Math.round((diff / roundedLimit) * 100);
    return {
      hasBudget: true,
      budgetLimit: roundedLimit,
      difference: diff,
      isExceeded: true,
      status: 'exceeded',
      message: `Warning: Projected next-month expenses (₹${predictedAmount.toLocaleString('en-IN')}) exceed your monthly budget limit of ₹${roundedLimit.toLocaleString('en-IN')} by approximately ₹${diff.toLocaleString('en-IN')} (${excessPct}%).`,
    };
  } else {
    return {
      hasBudget: true,
      budgetLimit: roundedLimit,
      difference: diff,
      isExceeded: false,
      status: 'within_budget',
      message: `Healthy Margin: Projected expenses (₹${predictedAmount.toLocaleString('en-IN')}) remain within your monthly budget of ₹${roundedLimit.toLocaleString('en-IN')}, leaving a projected buffer of ₹${diff.toLocaleString('en-IN')}.`,
    };
  }
}

/**
 * Full Pipeline: Generates spending prediction, evaluation, and comparisons.
 */
export function generateSpendingPrediction(
  rawTransactions: RawTransactionRecord[],
  totalBudgetLimit: number = 0,
  referenceDateStr?: string
): SpendingPredictionResponse {
  const REQUIRED_MONTHS = 3;

  // 1. Filter valid historical expenses
  const expenses = filterHistoricalExpenses(rawTransactions, referenceDateStr);

  // 2. Aggregate monthly expenses chronologically
  const monthlyData = aggregateMonthlyExpenses(expenses);

  const monthsCount = monthlyData.length;

  // Check if we have at least 3 valid monthly observations
  if (monthsCount < REQUIRED_MONTHS) {
    const currentMonthStr = new Date().toISOString().substring(0, 7);
    const nextMonth = getNextCalendarMonth(currentMonthStr);

    return {
      hasEnoughData: false,
      monthsCount,
      requiredMonths: REQUIRED_MONTHS,
      predictedAmount: 0,
      nextMonth,
      nextMonthLabel: formatMonthLabel(nextMonth),
      recentActualAmount: monthsCount > 0 ? monthlyData[monthsCount - 1].actualAmount : 0,
      differenceRupees: 0,
      differencePercent: 0,
      direction: 'stable',
      historicalData: monthlyData.map((m) => ({
        month: m.month,
        actualAmount: m.actualAmount,
      })),
      chartData: monthlyData.map((m) => ({
        month: formatMonthLabel(m.month),
        actual: m.actualAmount,
        predicted: null,
      })),
      model: null,
      evaluation: {
        canEvaluate: false,
        trainMonths: monthsCount,
        testMonths: 0,
        mae: 0,
        message: `Insufficient historical data: FinIntel AI requires at least ${REQUIRED_MONTHS} distinct calendar months of recorded expenses to train the linear regression model. You currently have ${monthsCount} month(s) recorded.`,
      },
      budgetComparison: {
        hasBudget: totalBudgetLimit > 0,
        budgetLimit: totalBudgetLimit,
        difference: 0,
        isExceeded: false,
        status: totalBudgetLimit > 0 ? 'within_budget' : 'no_budget',
        message: totalBudgetLimit > 0
          ? `Budget configured (₹${totalBudgetLimit.toLocaleString('en-IN')}), awaiting additional transaction history.`
          : 'No monthly budget configured.',
      },
      explanation: `FinIntel AI requires at least ${REQUIRED_MONTHS} months of recorded expenses before running statistical regression. Please record transactions across at least ${REQUIRED_MONTHS} distinct months to unlock machine learning forecasts.`,
      disclaimer: 'Predictions are machine learning statistical approximations and not guarantees.',
    };
  }

  // 3. Fit Linear Regression model on all available historical months
  const trainingPoints = monthlyData.map((m) => ({ x: m.index, y: m.actualAmount }));
  const model = fitLinearRegression(trainingPoints);

  // 4. Predict next month expenses (x = n)
  const nextMonthIndex = monthsCount;
  const predictedAmount = model.predict(nextMonthIndex);

  const lastObservedMonth = monthlyData[monthsCount - 1].month;
  const nextMonth = getNextCalendarMonth(lastObservedMonth);
  const nextMonthLabel = formatMonthLabel(nextMonth);

  // 5. Compute direction and delta
  const recentActual = monthlyData[monthsCount - 1].actualAmount;
  const diffRupees = Math.round((predictedAmount - recentActual) * 100) / 100;
  const diffPercent = recentActual > 0
    ? Math.round(((predictedAmount - recentActual) / recentActual) * 1000) / 10
    : 0;

  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(diffRupees) >= 100 || Math.abs(diffPercent) >= 2) {
    direction = diffRupees > 0 ? 'increasing' : 'decreasing';
  }

  // 6. Chronological holdout evaluation
  const evaluation = evaluateChronologicalHoldout(monthlyData);

  // 7. Budget comparison
  const budgetComparison = evaluateBudgetComparison(predictedAmount, totalBudgetLimit);

  // 8. Prepare chart and historical trend data
  const historicalData = monthlyData.map((m) => ({
    month: m.month,
    actualAmount: m.actualAmount,
    predictedTrend: model.predict(m.index),
  }));

  const chartData = monthlyData.map((m) => ({
    month: formatMonthLabel(m.month),
    actual: m.actualAmount,
    predicted: null as number | null,
    isProjected: false,
  }));

  // Append next-month prediction point to chart
  chartData.push({
    month: `${nextMonthLabel} (Pred)`,
    actual: null,
    predicted: predictedAmount,
    isProjected: true,
  });

  // 9. Plain-language explanation
  const trendDescription =
    direction === 'increasing'
      ? `reflecting an upward expenditure trajectory (+₹${Math.abs(diffRupees).toLocaleString('en-IN')})`
      : direction === 'decreasing'
      ? `reflecting a downward expenditure trajectory (-₹${Math.abs(diffRupees).toLocaleString('en-IN')})`
      : 'indicating approximately stable expenditure levels';

  const explanation = `Based on your recorded expenses over ${monthsCount} historical calendar month(s), the Linear Regression model predicts approximately ₹${predictedAmount.toLocaleString('en-IN')} in total expenses for ${nextMonthLabel}, ${trendDescription}.`;

  return {
    hasEnoughData: true,
    monthsCount,
    requiredMonths: REQUIRED_MONTHS,
    predictedAmount,
    nextMonth,
    nextMonthLabel,
    recentActualAmount: recentActual,
    differenceRupees: diffRupees,
    differencePercent: diffPercent,
    direction,
    historicalData,
    chartData,
    model: {
      slope: Math.round(model.slope * 100) / 100,
      intercept: Math.round(model.intercept * 100) / 100,
      rSquared: Math.round(model.rSquared * 1000) / 1000,
      isZeroVariance: model.isZeroVariance,
    },
    evaluation,
    budgetComparison,
    explanation,
    disclaimer: 'Notice: This prediction is a mathematical regression estimate computed from historical records and is not a financial guarantee.',
  };
}

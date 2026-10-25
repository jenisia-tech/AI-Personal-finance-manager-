import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Calculator,
  RefreshCw,
  Info,
  Calendar,
  Wallet,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../../services/api';
import { SpendingPredictionData } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

interface SpendingPredictionViewProps {
  setActiveTab?: (tab: string) => void;
}

export const SpendingPredictionView: React.FC<SpendingPredictionViewProps> = ({ setActiveTab }) => {
  const [prediction, setPrediction] = useState<SpendingPredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.prediction.getSpendingPrediction();
      setPrediction(data);
    } catch (err: any) {
      console.error('Failed to load spending prediction:', err);
      setError(err.message || 'Unable to load spending prediction.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-9 h-9 border-3 border-bubblegum/20 border-t-bubblegum rounded-full animate-spin" />
        <span className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400">
          Fitting Linear Regression Model on Historical Transactions...
        </span>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="p-6 rounded-apple-xl bg-apple-red/5 border border-apple-red/20 text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-apple-red mx-auto mb-2" />
        <h3 className="text-sm font-bold text-apple-gray-900 dark:text-white mb-1">
          Failed to Load Prediction
        </h3>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchPrediction}
          className="px-4 py-2 bg-bubblegum hover:bg-bubblegum-hover text-white text-xs font-semibold rounded-apple-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    hasEnoughData,
    monthsCount,
    requiredMonths,
    predictedAmount,
    nextMonthLabel,
    recentActualAmount,
    differenceRupees,
    differencePercent,
    direction,
    chartData,
    model,
    evaluation,
    budgetComparison,
    explanation,
    disclaimer,
  } = prediction;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-apple-xl bg-white/70 dark:bg-apple-darkCard/70 backdrop-blur-md border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-apple-md bg-gradient-to-tr from-bubblegum to-purple-600 flex items-center justify-center text-white shadow-apple-pill font-bold">
              <Brain className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
              AI Spending Prediction (CO5 Machine Learning)
            </h2>
          </div>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-1">
            Supervised Ordinary Least Squares (OLS) Linear Regression model predicting future monthly expense trajectories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPrediction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-apple-sm bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-200 text-xs font-semibold transition"
            title="Refresh Prediction"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retrain & Refresh</span>
          </button>
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-bubblegum/10 text-bubblegum rounded-full border border-bubblegum/20">
            CO5: Machine Learning
          </span>
        </div>
      </div>

      {/* Insufficient Data State */}
      {!hasEnoughData ? (
        <div className="space-y-6">
          <div className="p-8 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-bubblegum/10 text-bubblegum flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-apple-gray-900 dark:text-white mb-2">
              Insufficient Historical Data for ML Training
            </h3>
            <p className="text-xs text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed mb-6">
              FinIntel AI's Linear Regression model requires at least{' '}
              <strong className="text-bubblegum font-semibold">{requiredMonths} distinct calendar months</strong> of
              recorded expense transactions to compute a mathematically valid trend line. You currently have{' '}
              <strong>{monthsCount}</strong> month(s) of recorded data.
            </p>

            {/* Progress Meter */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-xs font-semibold text-apple-gray-500 mb-1.5">
                <span>Progress: {monthsCount} of {requiredMonths} Months</span>
                <span>{Math.round((monthsCount / requiredMonths) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-apple-gray-100 dark:bg-apple-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bubblegum to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (monthsCount / requiredMonths) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-apple-lg bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800 text-left mb-6">
              <h4 className="text-xs font-bold text-apple-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-bubblegum" />
                <span>Why is a minimum of 3 months required?</span>
              </h4>
              <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400 leading-relaxed">
                In linear regression (y = mx + c), fitting on a single point is undefined, and fitting on only two points
                merely connects them without degrees of freedom to verify a trend or compute residual variance. A minimum
                of 3 points (n ≥ 3) ensures statistical degrees of freedom (df = n - 2 ≥ 1) to prevent misleading or
                overfitted extrapolations.
              </p>
            </div>

            {setActiveTab && (
              <button
                onClick={() => setActiveTab('transactions')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-bubblegum hover:bg-bubblegum-hover text-white text-xs font-semibold rounded-apple-sm shadow-apple-pill transition"
              >
                <span>Record Expense Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Sufficient Data: Display Model Predictions, KPIs, Chart, MAE & Decisions */
        <div className="space-y-6">
          {/* Section A: 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Next Month Predicted Expenses */}
            <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-apple-gray-500 dark:text-apple-gray-400">
                  Forecast ({nextMonthLabel})
                </span>
                <span className="p-2 rounded-apple-md bg-bubblegum/10 text-bubblegum">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-apple-gray-900 dark:text-white mb-1">
                {formatINR(predictedAmount)}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                {direction === 'increasing' && (
                  <span className="flex items-center gap-0.5 text-apple-red">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Increasing Trend</span>
                  </span>
                )}
                {direction === 'decreasing' && (
                  <span className="flex items-center gap-0.5 text-apple-green">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Decreasing Trend</span>
                  </span>
                )}
                {direction === 'stable' && (
                  <span className="flex items-center gap-0.5 text-apple-gray-500">
                    <Minus className="w-3.5 h-3.5" />
                    <span>Stable Trajectory</span>
                  </span>
                )}
              </div>
            </div>

            {/* 2. Most Recent Actual Month */}
            <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-apple-gray-500 dark:text-apple-gray-400">
                  Recent Actual Expenses
                </span>
                <span className="p-2 rounded-apple-md bg-blue-500/10 text-blue-500">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-apple-gray-900 dark:text-white mb-1">
                {formatINR(recentActualAmount)}
              </div>
              <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400">
                Last recorded month actual total
              </p>
            </div>

            {/* 3. Projected Delta (Change) */}
            <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-apple-gray-500 dark:text-apple-gray-400">
                  Projected Variance (Δ)
                </span>
                <span
                  className={`p-2 rounded-apple-md ${
                    differenceRupees > 0
                      ? 'bg-apple-red/10 text-apple-red'
                      : differenceRupees < 0
                      ? 'bg-apple-green/10 text-apple-green'
                      : 'bg-apple-gray-100 text-apple-gray-500'
                  }`}
                >
                  {differenceRupees > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : differenceRupees < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                </span>
              </div>
              <div
                className={`text-2xl font-black mb-1 ${
                  differenceRupees > 0
                    ? 'text-apple-red'
                    : differenceRupees < 0
                    ? 'text-apple-green'
                    : 'text-apple-gray-900 dark:text-white'
                }`}
              >
                {differenceRupees > 0 ? `+${formatINR(differenceRupees)}` : formatINR(differenceRupees)}
              </div>
              <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400 font-semibold">
                {differencePercent > 0 ? `+${differencePercent}%` : `${differencePercent}%`} vs. recent month
              </p>
            </div>

            {/* 4. Model Training Basis */}
            <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-apple-gray-500 dark:text-apple-gray-400">
                  Dataset & Goodness of Fit
                </span>
                <span className="p-2 rounded-apple-md bg-purple-500/10 text-purple-500">
                  <Calculator className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-apple-gray-900 dark:text-white mb-1">
                {monthsCount} Months
              </div>
              <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400 font-semibold">
                R² = {model?.rSquared ?? 0} • Slope: {model?.slope && model.slope > 0 ? '+' : ''}
                {model?.slope ? formatINR(model.slope) : '₹0'}/mo
              </p>
            </div>
          </div>

          {/* Section B: Actual vs. Predicted Chart */}
          <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
                  Historical Monthly Expenses vs. Machine Learning Forecast
                </h3>
                <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                  Solid bars denote verified historical expenditures. The highlighted marker represents the next-month OLS linear extrapolation.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-bubblegum" />
                  <span className="text-apple-gray-600 dark:text-apple-300">Actual Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-600" />
                  <span className="text-apple-gray-600 dark:text-apple-300">Predicted Forecast</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" stroke="#B59F91" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#B59F91"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload;
                      const isProjected = item.isProjected;

                      return (
                        <div className="p-3 bg-white dark:bg-apple-darkCard rounded-apple-md shadow-apple-card border border-apple-gray-200 dark:border-apple-gray-800 text-xs">
                          <p className="font-bold text-apple-gray-900 dark:text-white mb-1.5">{label}</p>
                          {item.actual !== null && (
                            <div className="flex items-center justify-between gap-4 text-apple-gray-600 dark:text-apple-gray-300">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-bubblegum" />
                                Actual Recorded:
                              </span>
                              <span className="font-bold text-apple-gray-900 dark:text-white">
                                {formatINR(item.actual)}
                              </span>
                            </div>
                          )}
                          {item.predicted !== null && (
                            <div className="flex items-center justify-between gap-4 text-purple-600 dark:text-purple-400 mt-1">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-600" />
                                Predicted Forecast:
                              </span>
                              <span className="font-bold">{formatINR(item.predicted)}</span>
                            </div>
                          )}
                          {isProjected && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold">
                              Machine Learning Projection
                            </span>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-apple-gray-600 dark:text-apple-gray-300 font-medium">
                        {value === 'actual' ? 'Actual Recorded Expenses (₹)' : 'ML Predicted Next-Month Expense (₹)'}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="actual"
                    name="actual"
                    fill="#FF5E97"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="predicted"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFFFFF' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section C & D: Model Evaluation & Intelligent Budget Decision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Evaluation (MAE & Chronological Holdout) */}
            <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-apple-md bg-purple-500/10 text-purple-600">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white">
                        Model Evaluation (Chronological Holdout)
                      </h4>
                      <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400">
                        Time-series validation preventing future data leakage
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      evaluation.canEvaluate
                        ? 'bg-apple-green/10 text-apple-green border border-apple-green/20'
                        : 'bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-500'
                    }`}
                  >
                    {evaluation.canEvaluate ? 'Evaluated' : 'Limited Sample'}
                  </span>
                </div>

                {evaluation.canEvaluate ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-apple-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40">
                      <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                        Mean Absolute Error (MAE)
                      </div>
                      <div className="text-2xl font-black text-apple-gray-900 dark:text-white">
                        {formatINR(evaluation.mae)}
                      </div>
                      <p className="text-xs text-apple-gray-600 dark:text-apple-gray-300 mt-1">
                        On average, the linear model's projections deviated by{' '}
                        <strong>{formatINR(evaluation.mae)}</strong> from actual observed expenditure during holdout months.
                      </p>
                    </div>

                    <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 space-y-1">
                      <p>
                        • <strong>Training Window:</strong> First {evaluation.trainMonths} chronological month(s)
                      </p>
                      <p>
                        • <strong>Holdout Test Window:</strong> Subsequent {evaluation.testMonths} un-seen month(s)
                      </p>
                      <p className="text-[11px] italic mt-2 text-apple-gray-400">
                        Notice: Time-series holdout guarantees that the model was never trained on future observations, adhering strictly to temporal causality.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-apple-lg bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                    <p className="text-xs text-apple-gray-600 dark:text-apple-gray-300 mb-2">
                      {evaluation.message}
                    </p>
                    <p className="text-[11px] text-apple-gray-400 italic">
                      With 3 historical months, the entire dataset is utilized for training the predictor. Once a 4th month of records is logged, chronological holdout evaluation will activate automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Intelligent Budget Decision & Comparison */}
            <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-apple-md ${
                        budgetComparison.status === 'exceeded'
                          ? 'bg-apple-red/10 text-apple-red'
                          : budgetComparison.status === 'within_budget'
                          ? 'bg-apple-green/10 text-apple-green'
                          : 'bg-apple-gray-100 text-apple-gray-500'
                      }`}
                    >
                      {budgetComparison.status === 'exceeded' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : budgetComparison.status === 'within_budget' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Wallet className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white">
                        Intelligent Budget Decision
                      </h4>
                      <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400">
                        Bridging ML predictions with actionable financial policy
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      budgetComparison.status === 'exceeded'
                        ? 'bg-apple-red/10 text-apple-red border border-apple-red/20'
                        : budgetComparison.status === 'within_budget'
                        ? 'bg-apple-green/10 text-apple-green border border-apple-green/20'
                        : 'bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-500'
                    }`}
                  >
                    {budgetComparison.status === 'exceeded'
                      ? 'Risk: Exceeds Budget'
                      : budgetComparison.status === 'within_budget'
                      ? 'Adherent'
                      : 'No Budget'}
                  </span>
                </div>

                <div className="space-y-3">
                  {budgetComparison.hasBudget ? (
                    <div
                      className={`p-4 rounded-apple-lg border ${
                        budgetComparison.status === 'exceeded'
                          ? 'bg-apple-red/5 border-apple-red/20'
                          : 'bg-apple-green/5 border-apple-green/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-apple-gray-600 dark:text-apple-gray-300">
                          Active Monthly Budget Limit:
                        </span>
                        <span className="text-apple-gray-900 dark:text-white font-bold">
                          {formatINR(budgetComparison.budgetLimit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-apple-gray-600 dark:text-apple-gray-300">
                          Projected Next-Month Spending:
                        </span>
                        <span className="text-apple-gray-900 dark:text-white font-bold">
                          {formatINR(predictedAmount)}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-medium leading-relaxed ${
                          budgetComparison.status === 'exceeded'
                            ? 'text-apple-red dark:text-red-400'
                            : 'text-apple-green dark:text-green-400'
                        }`}
                      >
                        {budgetComparison.message}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-apple-lg bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                      <p className="text-xs text-apple-gray-600 dark:text-apple-gray-300 mb-3">
                        {budgetComparison.message}
                      </p>
                      {setActiveTab && (
                        <button
                          onClick={() => setActiveTab('budget')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bubblegum hover:bg-bubblegum-hover text-white text-xs font-semibold rounded-apple-sm transition"
                        >
                          <span>Open Budget Planner</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400 leading-relaxed">
                    <strong>Decision Logic:</strong> If projected spending exceeds target limits, FinIntel AI flags the projected surplus deficit so you can curtail discretionary categories before the new month starts.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section E: Explainable Result & Mathematical Foundations */}
          <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-4">
            <div>
              <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-bubblegum" />
                <span>Explainable AI (XAI) & Mathematical Formulation</span>
              </h4>
              <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-0.5">
                Transparent interpretation of the algorithm without black-box approximations
              </p>
            </div>

            <div className="p-4 rounded-apple-lg bg-bubblegum/5 border border-bubblegum/20">
              <p className="text-xs text-apple-gray-700 dark:text-apple-gray-200 leading-relaxed font-medium">
                "{explanation}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                <span className="font-bold text-apple-gray-900 dark:text-white block mb-1">
                  1. Target Variable (y)
                </span>
                <span className="text-apple-gray-500 dark:text-apple-gray-400 text-[11px]">
                  Aggregated calendar month expense sum in INR (₹). Excludes all income, deposit, and future-dated records.
                </span>
              </div>
              <div className="p-3 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                <span className="font-bold text-apple-gray-900 dark:text-white block mb-1">
                  2. Predictor Variable (x)
                </span>
                <span className="text-apple-gray-500 dark:text-apple-gray-400 text-[11px]">
                  Sequential chronological index (x = 0, 1, 2, ..., n-1). Forecast predicts at x = n for next month.
                </span>
              </div>
              <div className="p-3 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                <span className="font-bold text-apple-gray-900 dark:text-white block mb-1">
                  3. Least Squares Estimation
                </span>
                <span className="text-apple-gray-500 dark:text-apple-gray-400 text-[11px]">
                  Formula: y = {model?.slope} · x + {model?.intercept}. Minimizes the sum of squared residuals (SS_res).
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-apple-gray-200/60 dark:border-apple-gray-800 text-[11px] text-apple-gray-400 italic">
              {disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

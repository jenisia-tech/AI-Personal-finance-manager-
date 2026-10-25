import React, { useState, useEffect } from 'react';
import {
  Brain,
  Calculator,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { SpendingPredictionData } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

interface CustomPoint {
  month: string;
  amount: number;
}

export const LinearRegressionPanel: React.FC = () => {
  const [dataSource, setDataSource] = useState<'live' | 'academic'>('live');
  const [liveData, setLiveData] = useState<SpendingPredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Academic Viva Presets
  const presets: Record<string, { label: string; description: string; points: CustomPoint[] }> = {
    knownLinear: {
      label: '1. Known Linear Trend (y = 2000x + 10000)',
      description: 'Deterministic test where expenses grow steadily by ₹2,000 each month.',
      points: [
        { month: 'Month 1', amount: 10000 },
        { month: 'Month 2', amount: 12000 },
        { month: 'Month 3', amount: 14000 },
        { month: 'Month 4', amount: 16000 },
      ],
    },
    zeroVariance: {
      label: '2. Zero Variance (Constant Spending)',
      description: 'All monthly expenditures are identical (₹15,000). Slope must equal 0.',
      points: [
        { month: 'Month 1', amount: 15000 },
        { month: 'Month 2', amount: 15000 },
        { month: 'Month 3', amount: 15000 },
      ],
    },
    seasonalVariance: {
      label: '3. Fluctuation with Upward Trend',
      description: 'Typical realistic spending pattern with minor fluctuations.',
      points: [
        { month: 'Jan', amount: 22000 },
        { month: 'Feb', amount: 19500 },
        { month: 'Mar', amount: 24000 },
        { month: 'Apr', amount: 26500 },
        { month: 'May', amount: 28000 },
      ],
    },
  };

  const [selectedPreset, setSelectedPreset] = useState<string>('knownLinear');
  const [academicPoints, setAcademicPoints] = useState<CustomPoint[]>(presets.knownLinear.points);
  const [academicBudget, setAcademicBudget] = useState<number>(18000);

  const fetchLiveData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.prediction.getSpendingPrediction();
      setLiveData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live prediction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setAcademicPoints(presets[presetKey].points);
    if (presetKey === 'knownLinear') setAcademicBudget(17000);
    if (presetKey === 'zeroVariance') setAcademicBudget(15000);
    if (presetKey === 'seasonalVariance') setAcademicBudget(29000);
  };

  // Math calculation for academic points
  const computeAcademicModel = (points: CustomPoint[]) => {
    const n = points.length;
    if (n === 0) return null;

    const sumX = points.reduce((acc, _, idx) => acc + idx, 0);
    const sumY = points.reduce((acc, p) => acc + p.amount, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let ssXX = 0;
    let ssXY = 0;
    let ssYY = 0;

    const rowDetails = points.map((p, i) => {
      const dx = i - meanX;
      const dy = p.amount - meanY;
      const dxSq = dx * dx;
      const dxdy = dx * dy;
      const dySq = dy * dy;
      ssXX += dxSq;
      ssXY += dxdy;
      ssYY += dySq;
      return {
        i,
        month: p.month,
        amount: p.amount,
        dx,
        dy,
        dxSq,
        dxdy,
        dySq,
      };
    });

    const isZeroVariance = ssYY === 0 || Math.abs(ssYY) < 1e-9;
    let slope = 0;
    let intercept = meanY;
    let rSquared = 1;

    if (!isZeroVariance && ssXX > 0) {
      slope = ssXY / ssXX;
      intercept = meanY - slope * meanX;
      rSquared = (ssXY * ssXY) / (ssXX * ssYY);
    }

    const nextX = n;
    const nextPred = Math.max(0, Math.round((slope * nextX + intercept) * 100) / 100);

    // Chronological holdout evaluation if n >= 4
    let holdoutMAE = 0;
    let canEvaluateHoldout = n >= 4;
    let trainCount = n - 1;
    let testCount = 1;

    if (canEvaluateHoldout) {
      // Train on first n - 1
      const trainSet = points.slice(0, trainCount);
      const testPoint = points[trainCount];

      const trMeanX = (trainCount - 1) / 2;
      const trMeanY = trainSet.reduce((s, p) => s + p.amount, 0) / trainCount;
      let trSSxx = 0;
      let trSSxy = 0;
      trainSet.forEach((p, idx) => {
        trSSxx += (idx - trMeanX) * (idx - trMeanX);
        trSSxy += (idx - trMeanX) * (p.amount - trMeanY);
      });
      const trSlope = trSSxx > 0 ? trSSxy / trSSxx : 0;
      const trIntercept = trMeanY - trSlope * trMeanX;
      const testPred = trSlope * trainCount + trIntercept;
      holdoutMAE = Math.abs(testPoint.amount - testPred);
    }

    return {
      n,
      meanX,
      meanY,
      ssXX,
      ssXY,
      ssYY,
      slope: Math.round(slope * 100) / 100,
      intercept: Math.round(intercept * 100) / 100,
      rSquared: Math.round(rSquared * 1000) / 1000,
      isZeroVariance,
      nextPred,
      rowDetails,
      canEvaluateHoldout,
      holdoutMAE: Math.round(holdoutMAE * 100) / 100,
      trainCount,
      testCount,
    };
  };

  const academicModel = computeAcademicModel(academicPoints);

  return (
    <div className="space-y-6">
      {/* Course Outcome Header Banner */}
      <div className="p-6 rounded-apple-xl bg-gradient-to-r from-bubblegum/10 via-purple-500/10 to-blue-500/10 border border-bubblegum/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-apple-md bg-bubblegum text-white shadow-apple-pill font-black">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-apple-gray-900 dark:text-white">
                CO5: Machine Learning Techniques for Intelligent Decision-Making
              </h3>
              <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                Supervised Learning with Ordinary Least Squares (OLS) Linear Regression for Spending Prediction
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 bg-bubblegum/20 text-bubblegum rounded-full border border-bubblegum/30">
            Course Outcome 5
          </span>
        </div>
        <p className="text-xs text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed">
          Course Outcome 5 requires applying machine learning techniques to solve real-world decision-making problems.
          In FinIntel AI, historical monthly expenses act as continuous time-series training data. The model learns
          the linear regression function ŷ = mx + c by minimizing the sum of squared residuals, predicts next-month
          spending, evaluates generalizability using chronological holdout validation (preventing data leakage), and informs
          budget adjustments before financial overruns occur.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center justify-between p-3 rounded-apple-lg bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDataSource('live')}
            className={`px-3 py-1.5 rounded-apple-sm text-xs font-semibold transition ${
              dataSource === 'live'
                ? 'bg-bubblegum text-white shadow-apple-pill'
                : 'text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-850'
            }`}
          >
            Live User Data (Database)
          </button>
          <button
            onClick={() => setDataSource('academic')}
            className={`px-3 py-1.5 rounded-apple-sm text-xs font-semibold transition ${
              dataSource === 'academic'
                ? 'bg-bubblegum text-white shadow-apple-pill'
                : 'text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-850'
            }`}
          >
            Academic Demonstration / Viva Testbench
          </button>
        </div>

        {dataSource === 'live' && (
          <button
            onClick={fetchLiveData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-bubblegum hover:bg-bubblegum/10 rounded-apple-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Retrain Model</span>
          </button>
        )}
      </div>

      {/* VIEW 1: LIVE USER DATA */}
      {dataSource === 'live' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-apple-gray-400">
              Fitting linear regression model on SQLite database records...
            </div>
          ) : error ? (
            <div className="p-4 rounded-apple-lg bg-apple-red/10 text-apple-red text-xs">
              {error}
            </div>
          ) : !liveData?.hasEnoughData ? (
            <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 text-center">
              <AlertTriangle className="w-8 h-8 text-bubblegum mx-auto mb-2" />
              <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white mb-1">
                Insufficient Historical Observations
              </h4>
              <p className="text-xs text-apple-gray-500 max-w-md mx-auto mb-3">
                {liveData?.evaluation.message}
              </p>
              <div className="text-[11px] font-semibold text-bubblegum">
                Recorded Months: {liveData?.monthsCount} / {liveData?.requiredMonths} Required
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Live Parameters */}
              <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray-500">
                  Learned Regression Parameters (Live)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                    <span className="text-apple-gray-400 block text-[10px]">Slope (m)</span>
                    <span className="text-base font-black text-apple-gray-900 dark:text-white">
                      {liveData.model?.slope && liveData.model.slope > 0 ? '+' : ''}
                      {formatINR(liveData.model?.slope)} / mo
                    </span>
                  </div>
                  <div className="p-3 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                    <span className="text-apple-gray-400 block text-[10px]">Intercept (c)</span>
                    <span className="text-base font-black text-apple-gray-900 dark:text-white">
                      {formatINR(liveData.model?.intercept)}
                    </span>
                  </div>
                  <div className="p-3 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                    <span className="text-apple-gray-400 block text-[10px]">Coefficient of Determination (R²)</span>
                    <span className="text-base font-black text-apple-gray-900 dark:text-white">
                      {liveData.model?.rSquared}
                    </span>
                  </div>
                  <div className="p-3 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800">
                    <span className="text-apple-gray-400 block text-[10px]">Next Month Extrapolation</span>
                    <span className="text-base font-black text-bubblegum">
                      {formatINR(liveData.predictedAmount)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-apple-md bg-bubblegum/5 border border-bubblegum/20 text-xs">
                  <span className="font-semibold text-bubblegum block mb-1">Regression Equation:</span>
                  <code className="text-[11px] font-mono text-apple-gray-800 dark:text-apple-gray-200">
                    ŷ = {liveData.model?.slope} · x + {liveData.model?.intercept} (where x = {liveData.monthsCount} for {liveData.nextMonthLabel})
                  </code>
                </div>
              </div>

              {/* Evaluation & Decision */}
              <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray-500">
                  Holdout Validation & Decision
                </h4>

                <div className="p-3.5 rounded-apple-md bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40 text-xs">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 block mb-1">
                    Chronological Holdout MAE:
                  </span>
                  <div className="text-xl font-bold text-apple-gray-900 dark:text-white">
                    {liveData.evaluation.canEvaluate ? formatINR(liveData.evaluation.mae) : 'Pending (n < 4)'}
                  </div>
                  <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                    {liveData.evaluation.message}
                  </p>
                </div>

                <div className="p-3.5 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800 text-xs">
                  <span className="font-semibold text-apple-gray-900 dark:text-white block mb-1">
                    Intelligent Budget Decision:
                  </span>
                  <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400">
                    {liveData.budgetComparison.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ACADEMIC DEMONSTRATION / VIVA TESTBENCH */}
      {dataSource === 'academic' && academicModel && (
        <div className="space-y-6">
          {/* Preset Selector */}
          <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray-500 mb-3">
              Select Deterministic Academic Preset for Viva Demonstration:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {Object.entries(presets).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key)}
                  className={`p-3 rounded-apple-lg text-left text-xs border transition ${
                    selectedPreset === key
                      ? 'border-bubblegum bg-bubblegum/5 ring-1 ring-bubblegum/30 font-semibold'
                      : 'border-apple-gray-200 dark:border-apple-gray-800 hover:bg-apple-gray-50 dark:hover:bg-apple-gray-850'
                  }`}
                >
                  <div className="font-bold text-apple-gray-900 dark:text-white mb-1">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-apple-gray-500">{item.description}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <label className="text-apple-gray-600 dark:text-apple-300">
                Simulated Monthly Budget Limit:
              </label>
              <input
                type="number"
                value={academicBudget}
                onChange={(e) => setAcademicBudget(Number(e.target.value) || 0)}
                className="w-32 px-2.5 py-1 text-xs border rounded-apple-sm dark:bg-apple-gray-800 dark:border-apple-gray-700"
              />
              <span className="text-[11px] text-apple-gray-400">
                (Compares forecast against this limit)
              </span>
            </div>
          </div>

          {/* Mathematical Step-by-Step Table */}
          <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card overflow-x-auto">
            <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-bubblegum" />
              <span>Step-by-Step Ordinary Least Squares (OLS) Derivation</span>
            </h4>
            <p className="text-xs text-apple-gray-500 mb-4">
              Demonstrates manual calculation of means, deviations, and sums of products required during academic evaluation.
            </p>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-apple-gray-200 dark:border-apple-gray-800 text-apple-gray-500 uppercase text-[10px]">
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3">Index (x)</th>
                  <th className="py-2 px-3">Expense (y)</th>
                  <th className="py-2 px-3">x - x̄</th>
                  <th className="py-2 px-3">y - ȳ</th>
                  <th className="py-2 px-3">(x - x̄)²</th>
                  <th className="py-2 px-3">(x - x̄)(y - ȳ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-gray-100 dark:divide-apple-gray-850">
                {academicModel.rowDetails.map((row) => (
                  <tr key={row.i} className="hover:bg-apple-gray-50/50 dark:hover:bg-apple-gray-850/50">
                    <td className="py-2 px-3 font-semibold text-apple-gray-900 dark:text-white">
                      {row.month}
                    </td>
                    <td className="py-2 px-3">{row.i}</td>
                    <td className="py-2 px-3 font-medium">{formatINR(row.amount)}</td>
                    <td className="py-2 px-3">{row.dx.toFixed(2)}</td>
                    <td className="py-2 px-3">{formatINR(row.dy)}</td>
                    <td className="py-2 px-3">{row.dxSq.toFixed(2)}</td>
                    <td className="py-2 px-3">{formatINR(row.dxdy)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-apple-gray-200 dark:border-apple-gray-800 font-bold bg-apple-gray-50/50 dark:bg-apple-gray-850/50">
                  <td className="py-2 px-3" colSpan={2}>
                    Means: x̄ = {academicModel.meanX.toFixed(2)}
                  </td>
                  <td className="py-2 px-3">ȳ = {formatINR(academicModel.meanY)}</td>
                  <td className="py-2 px-3" colSpan={2}>
                    SS_xx = {academicModel.ssXX.toFixed(2)}
                  </td>
                  <td className="py-2 px-3" colSpan={2}>
                    SS_xy = {formatINR(academicModel.ssXY)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Formula Results */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-apple-gray-200/80 dark:border-apple-gray-800">
              <div className="p-3 rounded-apple-md bg-bubblegum/5 border border-bubblegum/20 text-xs">
                <span className="text-apple-gray-500 block text-[10px]">Slope (m = SS_xy / SS_xx)</span>
                <span className="text-base font-black text-bubblegum">
                  {academicModel.slope > 0 ? '+' : ''}{formatINR(academicModel.slope)} / mo
                </span>
              </div>
              <div className="p-3 rounded-apple-md bg-bubblegum/5 border border-bubblegum/20 text-xs">
                <span className="text-apple-gray-500 block text-[10px]">Intercept (c = ȳ - m · x̄)</span>
                <span className="text-base font-black text-bubblegum">
                  {formatINR(academicModel.intercept)}
                </span>
              </div>
              <div className="p-3 rounded-apple-md bg-purple-500/5 border border-purple-500/20 text-xs">
                <span className="text-apple-gray-500 block text-[10px]">Goodness of Fit (R²)</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                  {academicModel.rSquared}
                </span>
              </div>
              <div className="p-3 rounded-apple-md bg-green-500/5 border border-green-500/20 text-xs">
                <span className="text-apple-gray-500 block text-[10px]">Predicted Next Month (x = {academicModel.n})</span>
                <span className="text-base font-black text-apple-green">
                  {formatINR(academicModel.nextPred)}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Decision Comparison */}
          <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray-500 mb-2">
              Academic Intelligent Decision Assessment
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-apple-lg border">
              <div>
                <span className="text-xs font-bold text-apple-gray-900 dark:text-white block">
                  Projected Spending: {formatINR(academicModel.nextPred)} vs. Budget Ceiling: {formatINR(academicBudget)}
                </span>
                <p className="text-[11px] text-apple-gray-500 mt-0.5">
                  {academicModel.nextPred > academicBudget
                    ? `Warning: Excess of ₹${(academicModel.nextPred - academicBudget).toLocaleString('en-IN')} projected.`
                    : `Safe: Buffer of ₹${(academicBudget - academicModel.nextPred).toLocaleString('en-IN')} projected.`}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  academicModel.nextPred > academicBudget
                    ? 'bg-apple-red/10 text-apple-red border border-apple-red/20'
                    : 'bg-apple-green/10 text-apple-green border border-apple-green/20'
                }`}
              >
                {academicModel.nextPred > academicBudget ? 'Excess Projected' : 'Within Budget'}
              </span>
            </div>

            {academicModel.canEvaluateHoldout && (
              <div className="mt-3 text-[11px] text-apple-gray-500 dark:text-apple-gray-400">
                • <strong>Chronological Holdout Validation MAE:</strong> {formatINR(academicModel.holdoutMAE)} (Trained on first {academicModel.trainCount} periods, tested on period {academicModel.trainCount + 1}).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

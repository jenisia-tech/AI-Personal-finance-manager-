import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Budget, Transaction, MonteCarloSimulationResult, MonteCarloConfig } from '../../types/finance';
import { runMonteCarloBudgetSimulation } from '../../services/financialReasoningService';
import { formatINR, getDaysElapsedInMonth, getDaysRemainingInMonth } from '../../utils/formatters';
import { AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Dices, RefreshCw } from 'lucide-react';

interface BudgetRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  spent: number;
  transactions: Transaction[];
  activeMonth: string;
  onOpenLab?: () => void;
}

export const BudgetRiskModal: React.FC<BudgetRiskModalProps> = ({
  isOpen,
  onClose,
  budget,
  spent,
  transactions,
  activeMonth,
  onOpenLab,
}) => {
  const daysElapsed = Math.max(1, getDaysElapsedInMonth());
  const daysRemaining = Math.max(0, getDaysRemainingInMonth());

  // Calculate empirical daily mean and standard deviation for this category from actual transactions
  const empiricalStats = useMemo(() => {
    if (!budget) return { meanDaily: 0, stdDevDaily: 0 };
    const catTxs = transactions.filter(
      (t) => t.type === 'expense' && t.category === budget.category && t.date.startsWith(activeMonth)
    );

    const mean = spent > 0 ? Math.round(spent / daysElapsed) : 0;
    let stdDev = Math.round(mean * 0.35); // fallback estimate if transactions are few

    if (catTxs.length > 1) {
      const avgTx = spent / catTxs.length;
      const variance =
        catTxs.reduce((sum, t) => sum + Math.pow(t.amount - avgTx, 2), 0) / catTxs.length;
      stdDev = Math.max(50, Math.round(Math.sqrt(variance)));
    }

    return { meanDaily: mean, stdDevDaily: stdDev };
  }, [budget, spent, transactions, activeMonth, daysElapsed]);

  const [simCount, setSimCount] = useState<number>(1000);
  const [customMean, setCustomMean] = useState<number>(empiricalStats.meanDaily);
  const [customStdDev, setCustomStdDev] = useState<number>(empiricalStats.stdDevDaily);
  const [seed, setSeed] = useState<number>(42);

  // Sync state when empirical stats change
  React.useEffect(() => {
    setCustomMean(empiricalStats.meanDaily);
    setCustomStdDev(empiricalStats.stdDevDaily);
  }, [empiricalStats]);

  // Run Monte Carlo simulation on demand
  const simulationResult: MonteCarloSimulationResult | null = useMemo(() => {
    if (!budget) return null;

    const config: MonteCarloConfig = {
      budget: budget.limit,
      alreadySpent: spent,
      daysElapsed,
      daysRemaining,
      meanDailySpend: Math.max(0, customMean),
      stdDevDailySpend: Math.max(0, customStdDev),
      simulationCount: simCount,
      randomSeed: seed,
    };

    return runMonteCarloBudgetSimulation(config);
  }, [budget, spent, daysRemaining, customMean, customStdDev, simCount, seed]);

  if (!budget) return null;

  const utilization = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Budget Risk Simulation: ${budget.category}`}
      subtitle="CO4 Stochastic Uncertainty Modeling (Mulberry32 PRNG & Gaussian Daily Burn)"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Category Budget Status Banner */}
        <div className="p-4 rounded-apple-xl bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/80 dark:border-apple-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-apple-gray-400">Assigned Limit</span>
            <div className="text-sm font-bold text-apple-gray-900 dark:text-white mt-0.5">
              {formatINR(budget.limit)}
            </div>
          </div>
          <div>
            <span className="text-apple-gray-400">Spent So Far</span>
            <div className="text-sm font-bold text-apple-gray-900 dark:text-white mt-0.5">
              {formatINR(spent)} ({utilization}%)
            </div>
          </div>
          <div>
            <span className="text-apple-gray-400">Timeline Horizon</span>
            <div className="text-sm font-bold text-apple-blue mt-0.5">
              {daysRemaining} day(s) remaining ({daysElapsed} elapsed)
            </div>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="p-3.5 rounded-apple-md bg-white dark:bg-apple-gray-850/60 border border-apple-gray-200/60 dark:border-apple-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-apple-gray-800 dark:text-apple-gray-200 flex items-center gap-1.5">
              <Dices className="w-3.5 h-3.5 text-apple-blue" />
              <span>Stochastic Parameters (Derived from real transaction velocity)</span>
            </span>
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="text-[11px] font-semibold text-apple-blue hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reseed PRNG ({seed})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-apple-gray-500 mb-1">
                Expected Daily Spend (₹/day)
              </label>
              <input
                type="number"
                min="0"
                value={customMean}
                onChange={(e) => setCustomMean(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-sm text-xs font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] text-apple-gray-500 mb-1">
                Daily Volatility (StdDev ₹)
              </label>
              <input
                type="number"
                min="0"
                value={customStdDev}
                onChange={(e) => setCustomStdDev(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-sm text-xs font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] text-apple-gray-500 mb-1">
                Simulated Scenarios (N)
              </label>
              <select
                value={simCount}
                onChange={(e) => setSimCount(parseInt(e.target.value))}
                className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-sm text-xs font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
              >
                <option value={500}>500 Iterations</option>
                <option value={1000}>1,000 Iterations</option>
                <option value={2000}>2,000 Iterations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Simulation Output Dashboard */}
        {simulationResult && (
          <div className="space-y-4">
            {/* Risk Probability Header */}
            <div
              className={`p-4 rounded-apple-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                simulationResult.riskCategory === 'High'
                  ? 'bg-apple-red/5 border-apple-red/20 text-apple-red'
                  : simulationResult.riskCategory === 'Moderate'
                  ? 'bg-apple-orange/5 border-apple-orange/20 text-apple-orange'
                  : 'bg-apple-green/5 border-apple-green/20 text-apple-green'
              }`}
            >
              <div className="flex items-center gap-3">
                {simulationResult.riskCategory === 'High' ? (
                  <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                ) : simulationResult.riskCategory === 'Moderate' ? (
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {simulationResult.riskCategory} Breach Risk: {simulationResult.breachProbability}%
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30">
                      {simulationResult.breachCount} of {simulationResult.simulationCount} breached
                    </span>
                  </div>
                  <p className="text-xs text-apple-gray-700 dark:text-apple-gray-300 mt-0.5 leading-relaxed">
                    {simulationResult.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantiles Spectrum */}
            <div className="p-4 rounded-apple-xl bg-white dark:bg-apple-gray-850/80 border border-apple-gray-200/80 dark:border-apple-gray-800 space-y-3">
              <span className="text-xs font-bold text-apple-gray-900 dark:text-white block">
                Statistical Quantile Outcomes vs. Budget Limit
              </span>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-apple-sm bg-apple-green/10 border border-apple-green/20">
                  <div className="text-[10px] font-bold text-apple-green uppercase">P10 (Best Case)</div>
                  <div className="text-sm font-bold text-apple-gray-900 dark:text-white mt-1">
                    {formatINR(simulationResult.quantiles.p10)}
                  </div>
                </div>

                <div className="p-2.5 rounded-apple-sm bg-apple-blue/10 border border-apple-blue/20">
                  <div className="text-[10px] font-bold text-apple-blue uppercase">P50 (Median)</div>
                  <div className="text-sm font-bold text-apple-gray-900 dark:text-white mt-1">
                    {formatINR(simulationResult.quantiles.p50)}
                  </div>
                </div>

                <div className="p-2.5 rounded-apple-sm bg-apple-red/10 border border-apple-red/20">
                  <div className="text-[10px] font-bold text-apple-red uppercase">P90 (Stress Test)</div>
                  <div className="text-sm font-bold text-apple-gray-900 dark:text-white mt-1">
                    {formatINR(simulationResult.quantiles.p90)}
                  </div>
                </div>
              </div>

              {/* Actionable Risk Mitigation Directive */}
              <div className="p-3 rounded-apple-sm bg-apple-gray-50 dark:bg-apple-gray-800/80 text-xs text-apple-gray-700 dark:text-apple-gray-300">
                <span className="font-semibold text-apple-gray-900 dark:text-white mr-1">
                  AI Remediation Directive:
                </span>
                <span>{simulationResult.recommendedMitigation}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-apple-gray-100 dark:border-apple-gray-800">
          {onOpenLab && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLab();
              }}
              className="text-xs text-apple-purple hover:underline font-semibold flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Inspect Full Monte Carlo Distribution in AI Lab (CO4)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-apple-gray-100 dark:bg-apple-gray-800 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700 text-apple-gray-900 dark:text-white text-xs font-semibold rounded-apple-sm transition ml-auto"
          >
            Close Simulation
          </button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import {
  Brain,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  extractFinancialFacts,
  runForwardChainingReasoning,
  runMonteCarloBudgetSimulation,
} from '../../services/financialReasoningService';
import { MonteCarloConfig, MonteCarloSimulationResult } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

export const ReasoningPanel: React.FC = () => {
  const { transactions, budgets, goals, userProfile, activeMonth } = useFinance();

  // Part A: Facts & Rules
  const facts = extractFinancialFacts(
    transactions,
    budgets,
    goals,
    userProfile.monthlyIncome,
    activeMonth
  );
  const reasoningResults = runForwardChainingReasoning(facts);

  // Part B: Monte Carlo Simulation State
  // Default values initialized from the highest spending category budget
  const topBudget = budgets[0] || { category: 'Food', limit: 12000 };
  const alreadySpentDefault = 8500;
  const daysElapsedDefault = 18;
  const daysRemainingDefault = 12;

  const [simBudget, setSimBudget] = useState<number>(topBudget.limit || 12000);
  const [alreadySpent, setAlreadySpent] = useState<number>(alreadySpentDefault);
  const [daysElapsed, setDaysElapsed] = useState<number>(daysElapsedDefault);
  const [daysRemaining, setDaysRemaining] = useState<number>(daysRemainingDefault);
  const [meanDailySpend, setMeanDailySpend] = useState<number>(450);
  const [stdDevDailySpend, setStdDevDailySpend] = useState<number>(180);
  const [simulationCount, setSimulationCount] = useState<number>(1000);
  const [randomSeed, setRandomSeed] = useState<number>(42);

  const [simResult, setSimResult] = useState<MonteCarloSimulationResult | null>(() =>
    runMonteCarloBudgetSimulation({
      budget: topBudget.limit || 12000,
      alreadySpent: alreadySpentDefault,
      daysElapsed: daysElapsedDefault,
      daysRemaining: daysRemainingDefault,
      meanDailySpend: 450,
      stdDevDailySpend: 180,
      simulationCount: 1000,
      randomSeed: 42,
    })
  );

  const handleRunSimulation = () => {
    const config: MonteCarloConfig = {
      budget: simBudget,
      alreadySpent,
      daysElapsed,
      daysRemaining,
      meanDailySpend,
      stdDevDailySpend,
      simulationCount,
      randomSeed,
    };
    const res = runMonteCarloBudgetSimulation(config);
    setSimResult(res);
  };

  const handleResetSimInputs = () => {
    setSimBudget(12000);
    setAlreadySpent(8500);
    setDaysElapsed(18);
    setDaysRemaining(12);
    setMeanDailySpend(450);
    setStdDevDailySpend(180);
    setSimulationCount(1000);
    setRandomSeed(42);

    const res = runMonteCarloBudgetSimulation({
      budget: 12000,
      alreadySpent: 8500,
      daysElapsed: 18,
      daysRemaining: 12,
      meanDailySpend: 450,
      stdDevDailySpend: 180,
      simulationCount: 1000,
      randomSeed: 42,
    });
    setSimResult(res);
  };

  return (
    <div className="space-y-6">
      {/* CO4 Academic Outcome Banner */}
      <div className="p-5 rounded-apple-xl bg-gradient-to-r from-apple-purple/10 via-apple-red/10 to-apple-orange/5 border border-apple-purple/20">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-apple-md bg-apple-purple text-white shadow-apple-pill mt-0.5">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-apple-purple/20 text-apple-purple">
                Course Outcome: CO4
              </span>
              <span className="text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300">
                Rule-Based Inference & Probabilistic Reasoning Under Uncertainty
              </span>
            </div>
            <h3 className="text-base font-bold text-apple-gray-900 dark:text-white mt-1">
              Forward-Chaining Rule System & Monte Carlo Budget Risk Estimator
            </h3>
            <p className="text-xs text-apple-gray-600 dark:text-apple-gray-400 mt-1 leading-relaxed">
              Combines deterministic propositional forward chaining over extracted financial domain facts with a reproducible Monte Carlo simulation of daily spending volatility (using Mulberry32 seeded PRNG) to estimate end-of-month budget breach probabilities.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
       * PART A: FORWARD-CHAINING RULE-BASED INFERENCE SYSTEM
       * ========================================================================= */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-apple-gray-100 dark:border-apple-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-apple-purple/10 text-apple-purple">
                Part A
              </span>
              <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white">
                Forward-Chaining Expert Rule Engine
              </h4>
            </div>
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-0.5">
              Evaluated {reasoningResults.evaluatedCount} formal IF–THEN rules against live facts • {reasoningResults.triggeredCount} Rule(s) Triggered
            </p>
          </div>
        </div>

        {/* Known Facts Grid */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-apple-gray-400 block mb-2">
            Perceived Environmental Domain Facts (Working Memory):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {Object.values(facts).slice(0, 6).map((fact) => (
              <div
                key={fact.key}
                className="p-2.5 rounded-apple-sm bg-apple-gray-50 dark:bg-apple-gray-850/80 border border-apple-gray-200/60 dark:border-apple-gray-800"
              >
                <span className="text-[10px] text-apple-gray-400 block truncate">{fact.label}</span>
                <strong className="text-apple-gray-900 dark:text-white truncate block mt-0.5">
                  {fact.formattedValue}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* Fired Rules Stream */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-apple-gray-400 block">
            Rule Base Evaluation & Triggered Inferences:
          </span>

          <div className="space-y-3">
            {reasoningResults.results.map((res) => (
              <div
                key={res.ruleId}
                className={`p-4 rounded-apple-lg border transition-all ${
                  res.satisfied
                    ? 'bg-apple-purple/5 dark:bg-apple-purple/10 border-apple-purple/30 shadow-xs'
                    : 'bg-apple-gray-50/50 dark:bg-apple-gray-850/30 border-apple-gray-200/60 dark:border-apple-gray-800 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {res.satisfied ? (
                      <CheckCircle className="w-4 h-4 text-apple-purple flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-apple-gray-400 flex-shrink-0" />
                    )}
                    <span className="font-bold text-xs text-apple-gray-900 dark:text-white">
                      [{res.ruleId}] {res.ruleName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        res.satisfied
                          ? 'bg-apple-purple/20 text-apple-purple'
                          : 'bg-apple-gray-200 dark:bg-apple-gray-800 text-apple-gray-500'
                      }`}
                    >
                      {res.satisfied ? 'RULE FIRED' : 'Not Triggered'}
                    </span>
                    <span className="text-[10px] text-apple-gray-400 uppercase font-semibold">
                      Priority: {res.priority}
                    </span>
                  </div>
                </div>

                {/* Condition */}
                <div className="text-[11px] font-mono text-apple-gray-600 dark:text-apple-gray-400 bg-white/60 dark:bg-[#151518]/60 p-2 rounded-apple-sm mb-2">
                  {res.conditionDescription}
                </div>

                {/* Fired Conclusion & Action */}
                {res.satisfied && (
                  <div className="mt-2 pt-2 border-t border-apple-purple/20 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-apple-purple font-bold uppercase block">
                        Deductive Conclusion:
                      </span>
                      <p className="text-apple-gray-800 dark:text-apple-200 mt-0.5">
                        {res.conclusion}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-apple-green font-bold uppercase block">
                        Prescribed Action:
                      </span>
                      <p className="text-apple-gray-800 dark:text-apple-200 mt-0.5">
                        {res.recommendedAction}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
       * PART B: PROBABILISTIC MONTE CARLO BUDGET RISK ESTIMATOR
       * ========================================================================= */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-apple-gray-100 dark:border-apple-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-apple-red/10 text-apple-red">
                Part B
              </span>
              <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white">
                Probabilistic Budget Risk Estimator (Monte Carlo Simulation)
              </h4>
            </div>
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-0.5">
              Stochastic daily spending variance modeling under partial uncertainty
            </p>
          </div>

          <button
            onClick={handleResetSimInputs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-apple-sm text-xs font-medium bg-apple-gray-100 dark:bg-apple-gray-850 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation Parameters</span>
          </button>
        </div>

        {/* Simulation Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Monthly Budget Ceiling (₹)
            </label>
            <input
              type="number"
              min="1"
              value={simBudget}
              onChange={(e) => setSimBudget(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Amount Already Spent (₹)
            </label>
            <input
              type="number"
              min="0"
              value={alreadySpent}
              onChange={(e) => setAlreadySpent(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Days Remaining in Month
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(parseInt(e.target.value, 10) || 1)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Simulations Count (N Iterations)
            </label>
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={simulationCount}
              onChange={(e) => setSimulationCount(parseInt(e.target.value, 10) || 500)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Mean Daily Spend (μ in ₹/day)
            </label>
            <input
              type="number"
              min="0"
              value={meanDailySpend}
              onChange={(e) => setMeanDailySpend(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Daily Volatility (StdDev σ in ₹/day)
            </label>
            <input
              type="number"
              min="0"
              value={stdDevDailySpend}
              onChange={(e) => setStdDevDailySpend(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Random Seed (Mulberry32 PRNG)
            </label>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(parseInt(e.target.value, 10) || 1)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-mono text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSimulation}
              className="w-full py-2.5 bg-apple-red hover:bg-red-600 text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Execute Monte Carlo (N={simulationCount})</span>
            </button>
          </div>
        </div>

        {/* Simulation Output Dashboard */}
        {simResult && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Breach Probability */}
              <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800">
                <span className="text-[10px] font-bold uppercase text-apple-gray-400 block">
                  Breach Probability
                </span>
                <div
                  className={`text-2xl font-bold mt-1 ${
                    simResult.riskCategory === 'High'
                      ? 'text-apple-red'
                      : simResult.riskCategory === 'Moderate'
                      ? 'text-apple-orange'
                      : 'text-apple-green'
                  }`}
                >
                  {simResult.breachProbability}%
                </div>
                <span className="text-[10px] text-apple-gray-400">
                  {simResult.breachCount} of {simResult.simulationCount} breached
                </span>
              </div>

              {/* Risk Category Badge */}
              <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800">
                <span className="text-[10px] font-bold uppercase text-apple-gray-400 block">
                  Risk Category
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-lg font-bold px-3 py-0.5 rounded-full ${
                      simResult.riskCategory === 'High'
                        ? 'bg-apple-red/10 text-apple-red border border-apple-red/20'
                        : simResult.riskCategory === 'Moderate'
                        ? 'bg-apple-orange/10 text-apple-orange border border-apple-orange/20'
                        : 'bg-apple-green/10 text-apple-green border border-apple-green/20'
                    }`}
                  >
                    {simResult.riskCategory} Risk
                  </span>
                </div>
                <span className="text-[10px] text-apple-gray-400">
                  Threshold: Low &lt;25% | Mod 25-70% | High &gt;70%
                </span>
              </div>

              {/* Median Outcome P50 */}
              <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800">
                <span className="text-[10px] font-bold uppercase text-apple-gray-400 block">
                  Projected Median (P50)
                </span>
                <div className="text-2xl font-bold text-apple-gray-900 dark:text-white mt-1">
                  {formatINR(simResult.quantiles.p50)}
                </div>
                <span className="text-[10px] text-apple-gray-400">
                  50th Percentile final total
                </span>
              </div>

              {/* P90 Worst Case Tail */}
              <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800">
                <span className="text-[10px] font-bold uppercase text-apple-gray-400 block">
                  P90 Tail Risk Outcome
                </span>
                <div className="text-2xl font-bold text-apple-red mt-1">
                  {formatINR(simResult.quantiles.p90)}
                </div>
                <span className="text-[10px] text-apple-gray-400">
                  90% chance spend stays below this
                </span>
              </div>
            </div>

            {/* Explanation & Prescribed Mitigation */}
            <div className="p-4 rounded-apple-lg bg-apple-gray-50 dark:bg-apple-gray-850/80 border border-apple-gray-200/80 dark:border-apple-gray-800 text-xs space-y-2">
              <div className="font-semibold text-apple-gray-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-apple-orange" />
                <span>Probabilistic Risk Assessment Conclusion:</span>
              </div>
              <p className="text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed">
                {simResult.explanation}
              </p>
              <div className="pt-2 border-t border-apple-gray-200/40 dark:border-apple-gray-800 flex items-start gap-2">
                <strong className="text-apple-green flex-shrink-0">Actionable Mitigation:</strong>
                <span className="text-apple-gray-700 dark:text-apple-gray-300">
                  {simResult.recommendedMitigation}
                </span>
              </div>
            </div>

            {/* Simulated Distribution Visual Sample */}
            <div className="p-4 rounded-apple-lg bg-white dark:bg-[#151518] border border-apple-gray-200 dark:border-apple-gray-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-apple-gray-400 block mb-2">
                Simulated Month-End Spend Trajectory Sample (Quantile Spectrum):
              </span>
              <div className="flex items-end gap-1 h-20 w-full pt-2">
                {simResult.simulatedTotalsSample.map((total, idx) => {
                  const isBreach = total > simBudget;
                  const maxVal = Math.max(...simResult.simulatedTotalsSample, simBudget * 1.1);
                  const minVal = Math.min(...simResult.simulatedTotalsSample, simBudget * 0.8);
                  const heightPct = Math.max(
                    15,
                    Math.min(100, Math.round(((total - minVal) / (maxVal - minVal)) * 100))
                  );

                  return (
                    <div
                      key={idx}
                      title={`Run #${idx + 1}: ${formatINR(total)} ${isBreach ? '(Breach)' : '(Safe)'}`}
                      className={`flex-1 rounded-t transition-all ${
                        isBreach ? 'bg-apple-red/80' : 'bg-apple-green/80'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[10px] text-apple-gray-400 mt-2 border-t border-apple-gray-100 dark:border-apple-gray-800 pt-1">
                <span>Min: {formatINR(simResult.quantiles.min)}</span>
                <span className="font-semibold text-apple-blue">
                  Budget Threshold: {formatINR(simBudget)}
                </span>
                <span>Max: {formatINR(simResult.quantiles.max)}</span>
              </div>
            </div>

            {/* Assumptions & Limitations Academic Disclosure */}
            <div className="p-3.5 rounded-apple-sm bg-apple-gray-50/60 dark:bg-apple-gray-850/40 border border-dashed border-apple-gray-300 dark:border-apple-gray-800 text-[11px] text-apple-gray-500 space-y-1">
              <div className="font-semibold text-apple-gray-700 dark:text-apple-gray-300 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-apple-blue" />
                <span>Academic Assumptions & Probabilistic Modeling Limitations:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-apple-gray-400 pl-1">
                {simResult.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
                {simResult.limitations.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart2,
} from 'lucide-react';
import {
  runBreadthFirstSearch,
  runBestFirstSearch,
  compareSearchAlgorithms,
  SearchProblemInput,
} from '../../services/financialSearchService';
import { SearchResult, SearchComparison } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

const DEFAULT_INPUT: SearchProblemInput = {
  initialSavings: 5000,
  targetSavings: 10000,
  planningHorizonMonths: 3,
  monthlySavingChoices: [1000, 2000, 3000],
};

export const SearchAlgorithmsPanel: React.FC = () => {
  const [initialSavings, setInitialSavings] = useState<number>(DEFAULT_INPUT.initialSavings);
  const [targetSavings, setTargetSavings] = useState<number>(DEFAULT_INPUT.targetSavings);
  const [planningHorizonMonths, setPlanningHorizonMonths] = useState<number>(DEFAULT_INPUT.planningHorizonMonths);
  const [choicesText, setChoicesText] = useState<string>('1000, 2000, 3000');

  // Search Results State
  const [bfsResult, setBfsResult] = useState<SearchResult | null>(() => runBreadthFirstSearch(DEFAULT_INPUT));
  const [bestFirstResult, setBestFirstResult] = useState<SearchResult | null>(() => runBestFirstSearch(DEFAULT_INPUT));
  const [comparison, setComparison] = useState<SearchComparison | null>(() => compareSearchAlgorithms(DEFAULT_INPUT));
  const [selectedTraceView, setSelectedTraceView] = useState<'BFS' | 'BestFirst'>('BestFirst');

  const parseChoices = (): number[] => {
    return choicesText
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
  };

  const getInputObject = (): SearchProblemInput => ({
    initialSavings,
    targetSavings,
    planningHorizonMonths,
    monthlySavingChoices: parseChoices(),
  });

  const handleRunBFS = () => {
    const input = getInputObject();
    const res = runBreadthFirstSearch(input);
    setBfsResult(res);
    setSelectedTraceView('BFS');
  };

  const handleRunBestFirst = () => {
    const input = getInputObject();
    const res = runBestFirstSearch(input);
    setBestFirstResult(res);
    setSelectedTraceView('BestFirst');
  };

  const handleRunBoth = () => {
    const input = getInputObject();
    const comp = compareSearchAlgorithms(input);
    setBfsResult(comp.bfsResult);
    setBestFirstResult(comp.bestFirstResult);
    setComparison(comp);
  };

  const handleReset = () => {
    setInitialSavings(DEFAULT_INPUT.initialSavings);
    setTargetSavings(DEFAULT_INPUT.targetSavings);
    setPlanningHorizonMonths(DEFAULT_INPUT.planningHorizonMonths);
    setChoicesText('1000, 2000, 3000');

    const comp = compareSearchAlgorithms(DEFAULT_INPUT);
    setBfsResult(comp.bfsResult);
    setBestFirstResult(comp.bestFirstResult);
    setComparison(comp);
    setSelectedTraceView('BestFirst');
  };

  const activeTraceResult = selectedTraceView === 'BFS' ? bfsResult : bestFirstResult;

  return (
    <div className="space-y-6">
      {/* CO2 Academic Outcome Banner */}
      <div className="p-5 rounded-apple-xl bg-gradient-to-r from-apple-orange/10 via-apple-blue/10 to-apple-purple/5 border border-apple-orange/20">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-apple-md bg-apple-orange text-white shadow-apple-pill mt-0.5">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-apple-orange/20 text-apple-orange">
                Course Outcome: CO2
              </span>
              <span className="text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300">
                Uninformed and Informed Search Problem-Solving Techniques
              </span>
            </div>
            <h3 className="text-base font-bold text-apple-gray-900 dark:text-white mt-1">
              BFS (Uninformed) vs. Best-First Search (Informed Heuristic)
            </h3>
            <p className="text-xs text-apple-gray-600 dark:text-apple-gray-400 mt-1 leading-relaxed">
              Explores discrete state spaces defined by monthly saving decisions across a fixed planning horizon.
              BFS explores layer-by-layer using a FIFO queue; Best-First Search prioritizes states using a priority queue guided by the heuristic evaluation function{' '}
              <strong className="text-apple-blue font-mono">h(n) = max(0, Target - CurrentSavings)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Problem Configuration Panel */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-apple-gray-100 dark:border-apple-gray-800">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray-500">
              Savings Search Problem Formulation
            </h4>
            <p className="text-xs text-apple-gray-400">
              State: (Month m, CurrentSavings s) • Actions: Save Choice c ∈ C • Horizon: H
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-apple-sm text-xs font-medium bg-apple-gray-100 dark:bg-apple-gray-850 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Example Data</span>
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Initial Savings (₹)
            </label>
            <input
              type="number"
              min="0"
              value={initialSavings}
              onChange={(e) => setInitialSavings(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Target Savings Goal (₹)
            </label>
            <input
              type="number"
              min="1"
              value={targetSavings}
              onChange={(e) => setTargetSavings(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Planning Horizon (Months)
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={planningHorizonMonths}
              onChange={(e) => setPlanningHorizonMonths(parseInt(e.target.value, 10) || 1)}
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Available Choices Set (₹, comma-separated)
            </label>
            <input
              type="text"
              value={choicesText}
              onChange={(e) => setChoicesText(e.target.value)}
              placeholder="e.g. 1000, 2000, 3000"
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={handleRunBFS}
            className="flex items-center gap-1.5 px-4 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run BFS (Uninformed)</span>
          </button>

          <button
            onClick={handleRunBestFirst}
            className="flex items-center gap-1.5 px-4 py-2 bg-apple-orange hover:bg-orange-600 text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Best-First Search (Informed)</span>
          </button>

          <button
            onClick={handleRunBoth}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-apple-blue to-apple-purple text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill hover:opacity-90 transition"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Compare Both Algorithms</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Algorithm Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* BFS Card */}
        {bfsResult && (
          <div className="p-5 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-apple-blue/10 text-apple-blue font-bold text-xs">
                    BFS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-apple-gray-900 dark:text-white">
                      Breadth-First Search (Uninformed)
                    </h4>
                    <span className="text-[10px] text-apple-gray-400">Queue (FIFO) Frontier</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    bfsResult.success
                      ? 'bg-apple-green/10 text-apple-green'
                      : 'bg-apple-red/10 text-apple-red'
                  }`}
                >
                  {bfsResult.success ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{bfsResult.success ? 'Goal Reached' : 'Goal Unreachable'}</span>
                </span>
              </div>

              {/* Execution Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-apple-gray-50 dark:bg-apple-gray-850 rounded-apple-md text-xs text-apple-gray-600 dark:text-apple-300 my-3">
                <div>
                  <span className="text-[10px] text-apple-gray-400 block">Explored States</span>
                  <strong className="text-apple-gray-900 dark:text-white">{bfsResult.statesExplored}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-apple-gray-400 block">Max Frontier</span>
                  <strong className="text-apple-gray-900 dark:text-white">{bfsResult.maxFrontierSize}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-apple-gray-400 block">Time</span>
                  <strong className="text-apple-blue">{bfsResult.executionTimeMs} ms</strong>
                </div>
              </div>

              {/* Plan Sequence */}
              <div className="my-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-apple-gray-400 block mb-1.5">
                  Discovered Monthly Savings Plan:
                </span>
                {bfsResult.plan.length > 0 ? (
                  <div className="space-y-1">
                    {bfsResult.plan.map((step) => (
                      <div
                        key={step.month}
                        className="flex items-center justify-between p-2 rounded-apple-sm bg-apple-gray-50/80 dark:bg-apple-gray-850/60 text-xs"
                      >
                        <span className="font-semibold text-apple-gray-800 dark:text-apple-200">
                          Month {step.month}: Save {formatINR(step.saveAmount)}
                        </span>
                        <span className="text-apple-green font-bold">
                          Balance: {formatINR(step.resultingSavings)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-apple-gray-400 italic">No plan found within horizon.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800 text-[11px] text-apple-gray-500">
              {bfsResult.message}
            </div>
          </div>
        )}

        {/* Best-First Search Card */}
        {bestFirstResult && (
          <div className="p-5 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-apple-orange/10 text-apple-orange font-bold text-xs">
                    Informed
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-apple-gray-900 dark:text-white">
                      Best-First Search (Heuristic)
                    </h4>
                    <span className="text-[10px] text-apple-gray-400">f(n) = h(n) Priority Queue</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    bestFirstResult.success
                      ? 'bg-apple-green/10 text-apple-green'
                      : 'bg-apple-red/10 text-apple-red'
                  }`}
                >
                  {bestFirstResult.success ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{bestFirstResult.success ? 'Goal Reached' : 'Goal Unreachable'}</span>
                </span>
              </div>

              {/* Execution Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-apple-gray-50 dark:bg-apple-gray-850 rounded-apple-md text-xs text-apple-gray-600 dark:text-apple-300 my-3">
                <div>
                  <span className="text-[10px] text-apple-gray-400 block">Explored States</span>
                  <strong className="text-apple-gray-900 dark:text-white">{bestFirstResult.statesExplored}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-apple-gray-400 block">Max Frontier</span>
                  <strong className="text-apple-gray-900 dark:text-white">{bestFirstResult.maxFrontierSize}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-apple-gray-400 block">Time</span>
                  <strong className="text-apple-orange">{bestFirstResult.executionTimeMs} ms</strong>
                </div>
              </div>

              {/* Plan Sequence */}
              <div className="my-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-apple-gray-400 block mb-1.5">
                  Discovered Monthly Savings Plan:
                </span>
                {bestFirstResult.plan.length > 0 ? (
                  <div className="space-y-1">
                    {bestFirstResult.plan.map((step) => (
                      <div
                        key={step.month}
                        className="flex items-center justify-between p-2 rounded-apple-sm bg-apple-gray-50/80 dark:bg-apple-gray-850/60 text-xs"
                      >
                        <span className="font-semibold text-apple-gray-800 dark:text-apple-200">
                          Month {step.month}: Save {formatINR(step.saveAmount)}
                        </span>
                        <span className="text-apple-green font-bold">
                          Balance: {formatINR(step.resultingSavings)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-apple-gray-400 italic">No plan found within horizon.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800 text-[11px] text-apple-gray-500">
              {bestFirstResult.message}
            </div>
          </div>
        )}
      </div>

      {/* Comparative Search Behavior Analysis Note */}
      {comparison && (
        <div className="p-4 rounded-apple-xl bg-apple-gray-50 dark:bg-apple-gray-850/80 border border-apple-gray-200/80 dark:border-apple-gray-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-apple-gray-900 dark:text-white">
            <HelpCircle className="w-4 h-4 text-apple-blue" />
            <span>Search Behavior Comparison & Heuristic Distinction Note</span>
          </div>
          <p className="text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed">
            {comparison.analysis}
          </p>
          <p className="text-[11px] text-apple-gray-400 leading-relaxed">
            <strong>Theoretical Note:</strong> The heuristic evaluation score <code className="text-apple-blue">h(n)</code> represents estimated distance to target savings. It is not identical to monetary cost. While Best-First Search is guided by heuristic greedy bias, it does not mathematically guarantee optimality unless combined with accumulated path cost (e.g. A* search). BFS guarantees the shortest plan length (minimum planning depth).
          </p>
        </div>
      )}

      {/* Step-by-Step Search Trace Table */}
      {activeTraceResult && (
        <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white">
                Step-by-Step Search Execution Trace ({activeTraceResult.algorithm})
              </h4>
              <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                Detailed record of visited nodes, evaluated heuristics, and frontier states
              </p>
            </div>

            {/* Switch Trace View */}
            <div className="flex items-center gap-1 bg-apple-gray-100 dark:bg-apple-gray-850 p-1 rounded-apple-md text-xs">
              <button
                onClick={() => setSelectedTraceView('BestFirst')}
                className={`px-3 py-1 rounded-apple-sm font-semibold transition ${
                  selectedTraceView === 'BestFirst'
                    ? 'bg-white dark:bg-apple-gray-900 text-apple-orange shadow-xs'
                    : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
                }`}
              >
                Best-First Trace
              </button>
              <button
                onClick={() => setSelectedTraceView('BFS')}
                className={`px-3 py-1 rounded-apple-sm font-semibold transition ${
                  selectedTraceView === 'BFS'
                    ? 'bg-white dark:bg-apple-gray-900 text-apple-blue shadow-xs'
                    : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
                }`}
              >
                BFS Trace
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-apple-gray-50 dark:bg-apple-gray-850">
                <tr className="border-b border-apple-gray-200 dark:border-apple-gray-800 text-[10px] uppercase font-bold text-apple-gray-500">
                  <th className="py-2.5 px-3">Step</th>
                  <th className="py-2.5 px-3">State (Month, Savings)</th>
                  <th className="py-2.5 px-3">Action Applied</th>
                  <th className="py-2.5 px-3">Heuristic h(n)</th>
                  <th className="py-2.5 px-3">Frontier Size</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Trace Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-gray-100 dark:divide-apple-gray-800">
                {activeTraceResult.trace.map((t) => (
                  <tr
                    key={t.stepNumber}
                    className={`hover:bg-apple-gray-50/60 dark:hover:bg-apple-gray-850/40 ${
                      t.isGoal ? 'bg-apple-green/10 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-mono">{t.stepNumber}</td>
                    <td className="py-2 px-3 font-semibold text-apple-gray-900 dark:text-white">
                      Month {t.state.month}, {formatINR(t.state.currentSavings)}
                    </td>
                    <td className="py-2 px-3 text-apple-blue">
                      {t.actionTaken ? `+${formatINR(t.actionTaken.saveAmount)}` : 'Root State'}
                    </td>
                    <td className="py-2 px-3 font-mono text-apple-orange">
                      {formatINR(t.heuristic)}
                    </td>
                    <td className="py-2 px-3 text-apple-gray-500">{t.frontierSize}</td>
                    <td className="py-2 px-3">
                      {t.isGoal ? (
                        <span className="text-apple-green font-bold">Goal!</span>
                      ) : (
                        <span className="text-apple-gray-400">Exploring</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-apple-gray-500 truncate max-w-xs">{t.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

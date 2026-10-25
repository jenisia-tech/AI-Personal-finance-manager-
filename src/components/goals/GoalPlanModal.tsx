import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { SavingsGoal, SearchResult, SearchAlgorithmType } from '../../types/finance';
import {
  runBreadthFirstSearch,
  runBestFirstSearch,
  SearchProblemInput,
} from '../../services/financialSearchService';
import { formatINR, formatDate } from '../../utils/formatters';
import { Compass, CheckCircle2, AlertTriangle, Layers, Clock, Cpu } from 'lucide-react';

interface GoalPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onOpenLab?: () => void;
}

export const GoalPlanModal: React.FC<GoalPlanModalProps> = ({
  isOpen,
  onClose,
  goal,
  onOpenLab,
}) => {
  const [algorithm, setAlgorithm] = useState<SearchAlgorithmType>('BestFirst');
  const [choicesStr, setChoicesStr] = useState<string>('1000, 2500, 5000');
  const [customHorizon, setCustomHorizon] = useState<number>(6);

  // Derive initial values when goal changes
  const targetDateMonths = useMemo(() => {
    if (!goal) return 6;
    const targetTime = new Date(goal.targetDate).getTime();
    const now = new Date().getTime();
    const days = Math.max(0, Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24)));
    return Math.max(1, Math.min(24, Math.ceil(days / 30)));
  }, [goal]);

  // Synchronize horizon when goal opens
  React.useEffect(() => {
    if (goal) {
      setCustomHorizon(targetDateMonths);
      // Auto-suggest reasonable choices based on deficit
      const deficit = Math.max(0, goal.targetAmount - goal.currentAmount);
      const step = Math.max(500, Math.round(deficit / (targetDateMonths * 3) / 500) * 500);
      setChoicesStr(`${step}, ${step * 2}, ${step * 3}`);
    }
  }, [goal, targetDateMonths]);

  // Parse choices
  const parsedChoices = useMemo(() => {
    return choicesStr
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  }, [choicesStr]);

  // Execute Search on demand
  const searchResult: SearchResult | null = useMemo(() => {
    if (!goal || parsedChoices.length === 0) return null;

    const input: SearchProblemInput = {
      initialSavings: goal.currentAmount,
      targetSavings: goal.targetAmount,
      planningHorizonMonths: customHorizon,
      monthlySavingChoices: parsedChoices,
      maxIterations: 5000,
    };

    if (algorithm === 'BFS') {
      return runBreadthFirstSearch(input);
    } else {
      return runBestFirstSearch(input);
    }
  }, [goal, algorithm, parsedChoices, customHorizon]);

  if (!goal) return null;

  const remainingDeficit = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Savings Plan: ${goal.title}`}
      subtitle="CO2 Search-Based Milestone Planning (BFS & Best-First Heuristic)"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Goal Snapshot Banner */}
        <div className="p-4 rounded-apple-xl bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/80 dark:border-apple-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-apple-gray-400">Current Progress</span>
            <div className="text-sm font-bold text-apple-gray-900 dark:text-white mt-0.5">
              {formatINR(goal.currentAmount)} / {formatINR(goal.targetAmount)}
            </div>
          </div>
          <div>
            <span className="text-apple-gray-400">Remaining Deficit</span>
            <div className="text-sm font-bold text-apple-blue mt-0.5">
              {formatINR(remainingDeficit)}
            </div>
          </div>
          <div>
            <span className="text-apple-gray-400">Target Deadline</span>
            <div className="text-sm font-bold text-apple-gray-900 dark:text-white mt-0.5">
              {formatDate(goal.targetDate)} ({targetDateMonths} mo)
            </div>
          </div>
        </div>

        {/* Algorithm & Strategy Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Search Technique (CO2)
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-apple-gray-100 dark:bg-apple-gray-850 rounded-apple-md border border-apple-gray-200/60 dark:border-apple-gray-800">
              <button
                type="button"
                onClick={() => setAlgorithm('BestFirst')}
                className={`py-1.5 px-2 rounded-apple-sm text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  algorithm === 'BestFirst'
                    ? 'bg-white dark:bg-apple-gray-900 text-apple-blue shadow-sm'
                    : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Greedy Best-First</span>
              </button>
              <button
                type="button"
                onClick={() => setAlgorithm('BFS')}
                className={`py-1.5 px-2 rounded-apple-sm text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  algorithm === 'BFS'
                    ? 'bg-white dark:bg-apple-gray-900 text-apple-blue shadow-sm'
                    : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>BFS (Minimal Steps)</span>
              </button>
            </div>
            <p className="text-[10px] text-apple-gray-400 mt-1">
              {algorithm === 'BestFirst'
                ? 'Heuristic h(n) = max(0, Target - Savings) prioritizes closest states.'
                : 'Uninformed layer-by-layer exploration guarantees minimum planning months.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Monthly Saving Options (₹ Steps)
            </label>
            <input
              type="text"
              value={choicesStr}
              onChange={(e) => setChoicesStr(e.target.value)}
              placeholder="e.g. 1000, 2500, 5000"
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
            />
            <p className="text-[10px] text-apple-gray-400 mt-1">
              Comma-separated monthly deposit actions evaluated in search tree.
            </p>
          </div>
        </div>

        {/* Planning Horizon Slider */}
        <div className="p-3 rounded-apple-md bg-white dark:bg-apple-gray-850/60 border border-apple-gray-200/60 dark:border-apple-gray-800">
          <div className="flex items-center justify-between text-xs font-semibold text-apple-gray-800 dark:text-apple-gray-200 mb-1">
            <span>Planning Horizon Limit:</span>
            <span className="text-apple-blue font-bold">{customHorizon} Month(s)</span>
          </div>
          <input
            type="range"
            min="1"
            max="18"
            value={customHorizon}
            onChange={(e) => setCustomHorizon(parseInt(e.target.value))}
            className="w-full accent-apple-blue"
          />
        </div>

        {/* Search Results Display */}
        {searchResult && (
          <div className="space-y-4">
            {/* Search Metric Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-apple-md bg-gradient-to-r from-apple-blue/5 to-apple-purple/5 border border-apple-blue/20 text-xs">
              <div className="flex items-center gap-2">
                {searchResult.success ? (
                  <span className="flex items-center gap-1 text-apple-green font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Feasible Plan Discovered</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-apple-red font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>No Path Reached Target</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-apple-gray-500 dark:text-apple-gray-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-apple-blue" />
                  <span>Explored: <b>{searchResult.statesExplored}</b> states</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-apple-purple" />
                  <span>Time: <b>{searchResult.executionTimeMs} ms</b></span>
                </span>
              </div>
            </div>

            {/* Plan Roadmap Table */}
            {searchResult.success && searchResult.plan.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-apple-gray-900 dark:text-white flex items-center justify-between">
                  <span>Recommended Monthly Savings Roadmap:</span>
                  <span className="text-[11px] font-normal text-apple-gray-400">
                    Hits target in {searchResult.plan.length} month(s)
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-apple-md border border-apple-gray-200/80 dark:border-apple-gray-800 divide-y divide-apple-gray-100 dark:divide-apple-gray-850">
                  {searchResult.plan.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-apple-gray-900 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-apple-blue/10 text-apple-blue font-bold text-[11px] flex items-center justify-center">
                          M{step.month}
                        </span>
                        <div>
                          <span className="font-semibold text-apple-gray-900 dark:text-white">
                            Contribute +{formatINR(step.saveAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-apple-green text-xs">
                          {formatINR(step.resultingSavings)}
                        </div>
                        <div className="text-[10px] text-apple-gray-400">
                          {Math.min(100, Math.round((step.resultingSavings / goal.targetAmount) * 100))}% target
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchResult.success && searchResult.plan.length === 0 ? (
              <div className="p-4 rounded-apple-md bg-apple-green/10 border border-apple-green/20 text-xs text-apple-green font-medium">
                Goal is already satisfied at initial amount {formatINR(goal.currentAmount)}!
              </div>
            ) : (
              <div className="p-4 rounded-apple-md bg-apple-orange/10 border border-apple-orange/20 text-xs text-apple-orange">
                <p className="font-semibold">Target not reachable within {customHorizon} months.</p>
                <p className="mt-1 text-[11px]">
                  Recommendation: Increase your monthly contribution step (currently maxing out at {formatINR(Math.max(...parsedChoices))}) or extend the planning horizon.
                </p>
              </div>
            )}
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
              <span>Inspect Search Trace in AI Lab (CO2)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-apple-gray-100 dark:bg-apple-gray-800 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700 text-apple-gray-900 dark:text-white text-xs font-semibold rounded-apple-sm transition ml-auto"
          >
            Close Plan
          </button>
        </div>
      </div>
    </Modal>
  );
};

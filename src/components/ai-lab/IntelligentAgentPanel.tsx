import React, { useState } from 'react';
import {
  Bot,
  Eye,
  Activity,
  GitBranch,
  Play,
  CheckCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  AGENT_GOALS,
  perceiveFinancialState,
  analyzeFinancialCondition,
  selectAgentAction,
  generateRecommendation,
  evaluateActionOutcome,
} from '../../services/financialAgentService';
import { AgentGoalId } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

export const IntelligentAgentPanel: React.FC = () => {
  const { transactions, budgets, goals, userProfile, activeMonth, activeGoalId, setActiveGoalId } = useFinance();

  // Sandbox simulation inputs allowing the user to test what happens when data changes
  const [selectedGoalId, setSelectedGoalId] = useState<AgentGoalId>(activeGoalId);
  const [simulatedExtraExpense, setSimulatedExtraExpense] = useState<number>(0);
  const [simulatedExpenseCategory, setSimulatedExpenseCategory] = useState<string>('Entertainment');
  const [isSimulatedActionApplied, setIsSimulatedActionApplied] = useState<boolean>(false);

  // Compute live perception with optional sandbox modifications
  const testTransactions = [...transactions];
  if (simulatedExtraExpense > 0) {
    testTransactions.unshift({
      id: 'sim-tx-test',
      type: 'expense',
      amount: simulatedExtraExpense,
      category: simulatedExpenseCategory as any,
      paymentMode: 'UPI',
      date: new Date().toISOString().split('T')[0],
      description: `[Simulation Test] Extra ${simulatedExpenseCategory} Expense`,
      createdAt: new Date().toISOString(),
    });
  }

  const activeGoal = AGENT_GOALS[selectedGoalId];
  const perception = perceiveFinancialState(
    testTransactions,
    budgets,
    goals,
    userProfile.monthlyIncome,
    activeMonth
  );

  const conditions = analyzeFinancialCondition(perception);
  const selectedAction = selectAgentAction(perception, conditions, selectedGoalId);
  const recommendation = generateRecommendation(activeGoal, conditions, selectedAction, perception);
  const counterfactual = evaluateActionOutcome(perception, selectedAction);

  const resetSimulation = () => {
    setSimulatedExtraExpense(0);
    setSimulatedExpenseCategory('Entertainment');
    setIsSimulatedActionApplied(false);
  };

  return (
    <div className="space-y-6">
      {/* CO1 Academic Outcome Banner */}
      <div className="p-5 rounded-apple-xl bg-gradient-to-r from-apple-blue/10 via-apple-purple/10 to-apple-blue/5 border border-apple-blue/20">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-apple-md bg-apple-blue text-white shadow-apple-pill mt-0.5">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-apple-blue/20 text-apple-blue">
                Course Outcome: CO1
              </span>
              <span className="text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300">
                Intelligent Agent Models & Goal-Based Problem Solving
              </span>
            </div>
            <h3 className="text-base font-bold text-apple-gray-900 dark:text-white mt-1">
              Autonomous Financial Agent: 5-Stage Agentic Reasoning Architecture
            </h3>
            <p className="text-xs text-apple-gray-600 dark:text-apple-gray-400 mt-1 leading-relaxed">
              Demonstrates a goal-driven intelligent agent executing the formal cycle:{' '}
              <strong className="text-apple-blue">Perceive</strong> environmental facts →{' '}
              <strong className="text-apple-purple">Analyze</strong> financial conditions →{' '}
              <strong className="text-apple-orange">Decide</strong> optimal utility action →{' '}
              <strong className="text-apple-green">Act</strong> by dispatching transparent recommendations →{' '}
              <strong className="text-apple-red">Evaluate</strong> counterfactual outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Goal Selector */}
      <div className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray-500">
              Active Agent Goal Selection
            </h4>
            <p className="text-xs text-apple-gray-400">
              The agent re-evaluates its decision rules when you select different financial objectives:
            </p>
          </div>

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-apple-sm text-xs font-medium bg-apple-gray-100 dark:bg-apple-gray-850 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario Inputs</span>
          </button>
        </div>

        {/* Goal Selector Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(AGENT_GOALS) as AgentGoalId[]).map((gId) => {
            const g = AGENT_GOALS[gId];
            const isSelected = selectedGoalId === gId;

            return (
              <button
                key={gId}
                onClick={() => {
                  setSelectedGoalId(gId);
                  setActiveGoalId(gId);
                  setIsSimulatedActionApplied(false);
                }}
                className={`p-3.5 rounded-apple-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-apple-blue/10 dark:bg-apple-blue/20 border-apple-blue text-apple-blue shadow-sm'
                    : 'bg-apple-gray-50 dark:bg-apple-gray-850/60 border-apple-gray-200/80 dark:border-apple-gray-800 hover:border-apple-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-apple-gray-900 dark:text-white">
                    {g.name}
                  </span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-apple-blue" />}
                </div>
                <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400 line-clamp-2">
                  {g.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Simulation Sandbox Slider */}
        <div className="pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-apple-gray-700 dark:text-apple-gray-300">
                Simulate Hypothetical Expense Spike (What-If Test):
              </span>
              <span className="font-bold text-apple-red">+{formatINR(simulatedExtraExpense)}</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={simulatedExpenseCategory}
                onChange={(e) => setSimulatedExpenseCategory(e.target.value)}
                className="bg-apple-gray-100 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm px-2 py-1 text-xs outline-none"
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Food">Food</option>
                <option value="Shopping">Shopping</option>
                <option value="Transport">Transport</option>
              </select>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={simulatedExtraExpense}
                onChange={(e) => setSimulatedExtraExpense(parseInt(e.target.value, 10))}
                className="flex-1 accent-apple-blue cursor-pointer"
              />
            </div>
          </div>
          <div className="text-[11px] text-apple-gray-400 max-w-xs">
            Modifying this slider updates the agent's percepts dynamically without modifying your real stored records.
          </div>
        </div>
      </div>

      {/* 5-Stage Agent Cycle Flow Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Stage 1: Perceive */}
        <div className="p-4 rounded-apple-lg bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-2">
          <div className="flex items-center gap-2 text-apple-blue">
            <Eye className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">1. Perceive</span>
          </div>
          <div className="text-xs space-y-1 text-apple-gray-600 dark:text-apple-gray-400">
            <div>Inflows: <strong className="text-apple-gray-900 dark:text-white">{formatINR(perception.totalIncome)}</strong></div>
            <div>Outflows: <strong className="text-apple-gray-900 dark:text-white">{formatINR(perception.totalExpenses)}</strong></div>
            <div>Net Surplus: <strong className="text-apple-green">{formatINR(perception.netSurplus)}</strong></div>
            <div>Remaining: <strong>{perception.daysRemaining} days</strong></div>
          </div>
        </div>

        {/* Stage 2: Analyze */}
        <div className="p-4 rounded-apple-lg bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-2">
          <div className="flex items-center gap-2 text-apple-purple">
            <Activity className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">2. Analyze</span>
          </div>
          <div className="text-xs space-y-1 text-apple-gray-600 dark:text-apple-gray-400">
            <div>Savings Rate: <strong>{perception.savingsRate}%</strong></div>
            <div>Safe Spend: <strong>{formatINR(perception.safeDailySpend)}/d</strong></div>
            <div>Actual Spend: <strong>{formatINR(perception.actualDailySpend)}/d</strong></div>
            <div>Conditions: <strong className="text-apple-orange">{conditions.length} flagged</strong></div>
          </div>
        </div>

        {/* Stage 3: Decide */}
        <div className="p-4 rounded-apple-lg bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-2">
          <div className="flex items-center gap-2 text-apple-orange">
            <GitBranch className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">3. Decide</span>
          </div>
          <div className="text-xs space-y-1 text-apple-gray-600 dark:text-apple-gray-400">
            <div>Target Goal: <strong className="text-apple-gray-900 dark:text-white truncate block">{activeGoal.name}</strong></div>
            <div>Action ID: <strong className="text-apple-blue font-mono">{selectedAction.actionId}</strong></div>
            <div>Magnitude: <strong className="text-apple-green">{formatINR(selectedAction.suggestedAmount)}</strong></div>
          </div>
        </div>

        {/* Stage 4: Act */}
        <div className="p-4 rounded-apple-lg bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-2">
          <div className="flex items-center gap-2 text-apple-green">
            <Play className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">4. Act</span>
          </div>
          <div className="text-xs space-y-1 text-apple-gray-600 dark:text-apple-gray-400">
            <div className="font-semibold text-apple-gray-900 dark:text-white line-clamp-2">
              {selectedAction.title}
            </div>
            <div className="text-[10px] text-apple-gray-400">
              Transparent user recommendation generated.
            </div>
          </div>
        </div>

        {/* Stage 5: Evaluate */}
        <div className="p-4 rounded-apple-lg bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-2">
          <div className="flex items-center gap-2 text-apple-red">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">5. Evaluate</span>
          </div>
          <div className="text-xs space-y-1 text-apple-gray-600 dark:text-apple-gray-400">
            <div>Metric: <strong>{counterfactual.metricName}</strong></div>
            <div>Before: <strong>{counterfactual.before}{counterfactual.unit}</strong></div>
            <div>After: <strong className="text-apple-green">{counterfactual.after}{counterfactual.unit}</strong></div>
            <div>Delta: <strong className="text-apple-green font-bold">+{counterfactual.after - counterfactual.before}{counterfactual.unit}</strong></div>
          </div>
        </div>
      </div>

      {/* Main Agent Decision & Recommendation Panel */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-apple-gray-100 dark:border-apple-gray-800">
          <div>
            <h3 className="text-sm font-bold text-apple-gray-900 dark:text-white flex items-center gap-2">
              <span>Agent Decision Explanation & Reasoning</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-apple-green/10 text-apple-green">
                Goal: {activeGoal.name}
              </span>
            </h3>
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-0.5">
              Deterministic, explainable recommendation generated dynamically from your financial percepts
            </p>
          </div>
        </div>

        {/* Live Recommendation Message */}
        <div className="p-4 rounded-apple-lg bg-apple-gray-50 dark:bg-apple-gray-850/80 border border-apple-gray-200/80 dark:border-apple-gray-800 text-xs leading-relaxed text-apple-gray-800 dark:text-apple-gray-200">
          <div className="font-semibold text-sm text-apple-blue mb-1">
            {selectedAction.title} ({formatINR(selectedAction.suggestedAmount)})
          </div>
          <p className="text-apple-gray-700 dark:text-apple-gray-300">
            "{recommendation.explanation}"
          </p>
        </div>

        {/* Rationale Bullet Points */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-apple-gray-500 mb-2">
            Perception Facts & Rationale
          </h4>
          <ul className="space-y-1.5 text-xs text-apple-gray-600 dark:text-apple-gray-400">
            {recommendation.rationale.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-apple-blue font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Counterfactual Evaluation Sandbox Card */}
        <div className="p-4 rounded-apple-lg bg-gradient-to-r from-apple-green/5 to-apple-blue/5 border border-apple-green/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-apple-green" />
              <span className="text-xs font-bold text-apple-gray-900 dark:text-white">
                Step 5: Counterfactual Outcome Evaluation
              </span>
            </div>
            <button
              onClick={() => setIsSimulatedActionApplied(!isSimulatedActionApplied)}
              className={`px-3 py-1 rounded-apple-sm text-xs font-semibold transition ${
                isSimulatedActionApplied
                  ? 'bg-apple-green text-white shadow-apple-pill'
                  : 'bg-white dark:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-300 border border-apple-gray-200 dark:border-apple-gray-700 hover:bg-apple-gray-50'
              }`}
            >
              {isSimulatedActionApplied ? '✓ Action Applied in Sandbox' : 'Simulate Applying Action'}
            </button>
          </div>

          <div className="p-3 bg-white/80 dark:bg-apple-gray-850/80 rounded-apple-sm text-xs text-apple-gray-700 dark:text-apple-gray-300">
            {counterfactual.explanation}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-apple-sm bg-white dark:bg-apple-darkCard border border-apple-gray-100 dark:border-apple-gray-800">
              <span className="text-[10px] text-apple-gray-400">Metric Evaluated</span>
              <div className="font-semibold text-apple-gray-900 dark:text-white mt-0.5">
                {counterfactual.metricName}
              </div>
            </div>
            <div className="p-2.5 rounded-apple-sm bg-white dark:bg-apple-darkCard border border-apple-gray-100 dark:border-apple-gray-800">
              <span className="text-[10px] text-apple-gray-400">Current Value</span>
              <div className="font-semibold text-apple-gray-900 dark:text-white mt-0.5">
                {counterfactual.before} {counterfactual.unit}
              </div>
            </div>
            <div className="p-2.5 rounded-apple-sm bg-white dark:bg-apple-darkCard border border-apple-gray-100 dark:border-apple-gray-800">
              <span className="text-[10px] text-apple-gray-400">Projected Value</span>
              <div className="font-semibold text-apple-green mt-0.5">
                {counterfactual.after} {counterfactual.unit}
              </div>
            </div>
            <div className="p-2.5 rounded-apple-sm bg-white dark:bg-apple-darkCard border border-apple-gray-100 dark:border-apple-gray-800">
              <span className="text-[10px] text-apple-gray-400">Outcome Quality</span>
              <div className="font-semibold text-apple-green mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Optimal Improvement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Bot,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Target,
  Sparkles,
  TrendingUp,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  calculateCategoryExpenses,
  calculateHealthScore,
  calculateTotalIncome,
  calculateTotalExpenses,
} from '../../utils/calculations';
import {
  runIntelligentAgentCycle,
  AGENT_GOALS,
} from '../../services/financialAgentService';
import { AgentGoalId } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

interface AdvisorSummaryCardProps {
  onOpenAdvisor?: () => void;
  onOpenLab?: () => void;
}

export const AdvisorSummaryCard: React.FC<AdvisorSummaryCardProps> = ({
  onOpenAdvisor,
  onOpenLab,
}) => {
  const {
    transactions,
    budgets,
    goals,
    userProfile,
    activeMonth,
    activeGoalId,
    setActiveGoalId,
  } = useFinance();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Live');
  const [showCycleDetail, setShowCycleDetail] = useState(false);

  // Exact calculations from saved records
  const totalIncome = calculateTotalIncome(transactions, activeMonth);
  const totalExpenses = calculateTotalExpenses(transactions, activeMonth);
  const categoryExpenses = calculateCategoryExpenses(transactions, activeMonth);

  const health = useMemo(() => {
    return calculateHealthScore(totalIncome, totalExpenses, budgets, goals, categoryExpenses);
  }, [totalIncome, totalExpenses, budgets, goals, categoryExpenses]);

  // CO1: Autonomous Agent Perception-Action Cycle
  // Evaluated on latest saved data and active goal
  const agentRec = useMemo(() => {
    return runIntelligentAgentCycle(
      transactions,
      budgets,
      goals,
      activeGoalId,
      totalIncome || userProfile.monthlyIncome || 0,
      activeMonth
    );
  }, [transactions, budgets, goals, activeGoalId, totalIncome, userProfile.monthlyIncome, activeMonth]);

  // Manual Trigger: User explicitly requests fresh AI advice
  const handleRequestAdvice = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastRefreshed(`Refreshed at ${timeStr}`);
    }, 400);
  };

  const goalOptions: { id: AgentGoalId; label: string }[] = [
    { id: 'avoid_budget_breach', label: 'Avoid Budget Breaches' },
    { id: 'reach_savings_goal', label: 'Accelerate Savings Targets' },
    { id: 'maintain_emergency_fund', label: 'Maintain Emergency Net' },
    { id: 'reduce_discretionary', label: 'Trim Discretionary' },
  ];

  return (
    <div className="p-6 rounded-apple-xl bg-gradient-to-br from-white to-apple-blue/5 dark:from-apple-darkCard dark:to-apple-blue/15 border border-apple-blue/20 shadow-apple-card relative overflow-hidden">
      {/* Background soft blur accent */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-apple-blue/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Bot Title & Health Index */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-apple-md bg-gradient-to-tr from-apple-blue to-apple-purple flex items-center justify-center text-white shadow-apple-pill">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-apple-gray-900 dark:text-white">
                FinBot Intelligence & Health Score
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-apple-green/10 text-apple-green border border-apple-green/20">
                Grade: {health.grade}
              </span>
            </div>
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mt-0.5">
              <span>CO1 Autonomous Agent Model</span>
              <span className="text-apple-gray-300 dark:text-apple-gray-700">•</span>
              <span className="text-apple-blue font-medium">{lastRefreshed}</span>
            </p>
          </div>
        </div>

        {/* Health Gauge & Manual Request Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRequestAdvice}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-apple-md bg-white/80 dark:bg-apple-gray-850 hover:bg-white dark:hover:bg-apple-gray-800 border border-apple-gray-200/80 dark:border-apple-gray-800 text-xs font-semibold text-apple-gray-800 dark:text-apple-200 transition shadow-sm"
            title="Request AI Agent Advice (Re-analyze latest saved records)"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-apple-blue ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Analyzing...' : 'Request Advice'}</span>
          </button>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-apple-gray-850 px-3 py-1.5 rounded-apple-md border border-apple-gray-200/80 dark:border-apple-gray-800">
            <ShieldCheck className="w-4 h-4 text-apple-blue" />
            <div className="text-right">
              <div className="text-xs font-bold text-apple-gray-900 dark:text-white">
                {health.score} / 100
              </div>
              <div className="text-[10px] text-apple-gray-400">Health Index</div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Switcher Selector */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
        <span className="text-[11px] font-semibold text-apple-gray-400 flex items-center gap-1 mr-1">
          <Target className="w-3.5 h-3.5 text-apple-blue" />
          <span>Active Agent Goal:</span>
        </span>
        {goalOptions.map((opt) => {
          const isActive = activeGoalId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setActiveGoalId(opt.id)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-apple-sm transition ${
                isActive
                  ? 'bg-apple-blue text-white shadow-sm'
                  : 'bg-white/80 dark:bg-apple-gray-850 text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white border border-apple-gray-200/60 dark:border-apple-gray-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Agent Advice Body */}
      <div className="p-4 rounded-apple-md bg-white/80 dark:bg-[#1C1C20]/90 border border-apple-gray-200/70 dark:border-apple-gray-800 space-y-3 mb-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-apple-orange flex-shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="font-bold text-xs text-apple-gray-900 dark:text-white">
                {agentRec.selectedAction.title}
              </span>
              {agentRec.selectedAction.suggestedAmount > 0 && (
                <span className="text-[11px] font-bold text-apple-blue px-2 py-0.5 rounded-full bg-apple-blue/10">
                  Target: {formatINR(agentRec.selectedAction.suggestedAmount)}
                </span>
              )}
            </div>
            <p className="text-xs text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed">
              {agentRec.explanation}
            </p>
          </div>
        </div>

        {/* Counterfactual Evaluation Pill */}
        {agentRec.counterfactual && (
          <div className="p-2.5 rounded-apple-sm bg-apple-green/5 dark:bg-apple-green/10 border border-apple-green/20 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-apple-green font-semibold">
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Counterfactual: {agentRec.counterfactual.metricName} {agentRec.counterfactual.before}
                {agentRec.counterfactual.unit} &rarr; {agentRec.counterfactual.after}
                {agentRec.counterfactual.unit}
              </span>
            </div>
            <span className="text-[10px] text-apple-gray-500 dark:text-apple-gray-400 font-medium">
              {agentRec.counterfactual.improvement ? 'Predicted Improvement' : 'Neutral'}
            </span>
          </div>
        )}        {/* Detected Environmental Condition Badges */}
        {agentRec.conditionsDetected.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-apple-gray-400 font-medium">Percept Conditions:</span>
            {agentRec.conditionsDetected.map((cond, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-300 border border-apple-gray-200 dark:border-apple-gray-700"
              >
                {cond.conditionId.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expandable 5-Stage Agent Cycle Inspector */}
      {showCycleDetail && (
        <div className="p-3.5 rounded-apple-md bg-white/70 dark:bg-apple-gray-850/80 border border-apple-gray-200/60 dark:border-apple-gray-800 text-xs space-y-2 mb-4 animate-fade-in">
          <div className="font-bold text-apple-gray-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-apple-gray-200/40 dark:border-apple-gray-800">
            <Cpu className="w-3.5 h-3.5 text-apple-purple" />
            <span>5-Stage Agent Execution Pipeline (CO1)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-apple-gray-600 dark:text-apple-gray-400">
            <div>
              <b>1. Perceive:</b> Inflows {formatINR(totalIncome)}, Outflows {formatINR(totalExpenses)}
            </div>
            <div>
              <b>2. Analyze:</b> {agentRec.conditionsDetected.length} conditions identified
            </div>
            <div>
              <b>3. Decide:</b> Selected action <span className="text-apple-blue font-semibold">{agentRec.selectedAction.type}</span> under goal <i>{AGENT_GOALS[activeGoalId].name}</i>
            </div>
            <div>
              <b>4. Act:</b> Emitted explainable recommendation: {agentRec.selectedAction.title}
            </div>
          </div>
          <div className="pt-1 text-[11px] text-apple-gray-500 border-t border-apple-gray-200/40 dark:border-apple-gray-800">
            <b>5. Evaluate:</b> {agentRec.expectedOutcome}
          </div>
        </div>
      )}

      {/* Bottom Action Triggers */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-apple-gray-200/40 dark:border-apple-gray-800">
        <button
          onClick={() => setShowCycleDetail(!showCycleDetail)}
          className="text-[11px] text-apple-gray-500 hover:text-apple-gray-800 dark:hover:text-white font-medium flex items-center gap-1 transition"
        >
          <span>{showCycleDetail ? 'Hide Agent Stages' : 'Inspect 5-Stage Agent Pipeline (CO1)'}</span>
          {showCycleDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <div className="flex items-center gap-2">
          {onOpenLab && (
            <button
              onClick={onOpenLab}
              className="text-xs text-apple-purple hover:underline font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>What-If Lab</span>
            </button>
          )}
          {onOpenAdvisor && (
            <button
              onClick={onOpenAdvisor}
              className="px-3 py-1.5 bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-semibold rounded-apple-sm transition shadow-apple-pill flex items-center gap-1.5"
            >
              <span>Chat with FinBot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Bot, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { calculateCategoryExpenses, calculateHealthScore, calculateTotalIncome, calculateTotalExpenses } from '../../utils/calculations';
import { runIntelligentAgentCycle } from '../../services/financialAgentService';

interface AdvisorSummaryCardProps {
  onOpenAdvisor?: () => void;
  onOpenLab?: () => void;
}

export const AdvisorSummaryCard: React.FC<AdvisorSummaryCardProps> = ({
  onOpenAdvisor,
  onOpenLab,
}) => {
  const { transactions, budgets, goals, userProfile, activeMonth, activeGoalId } = useFinance();

  const totalIncome = Math.max(
    calculateTotalIncome(transactions, activeMonth),
    userProfile.monthlyIncome
  );
  const totalExpenses = calculateTotalExpenses(transactions, activeMonth);
  const categoryExpenses = calculateCategoryExpenses(transactions, activeMonth);

  const health = calculateHealthScore(totalIncome, totalExpenses, budgets, goals, categoryExpenses);
  const agentRec = runIntelligentAgentCycle(
    transactions,
    budgets,
    goals,
    activeGoalId,
    userProfile.monthlyIncome,
    activeMonth
  );

  return (
    <div className="p-6 rounded-apple-xl bg-gradient-to-br from-white to-apple-blue/5 dark:from-[#151518] dark:to-apple-blue/10 border border-apple-blue/20 shadow-apple-card relative overflow-hidden">
      {/* Background soft blur accent */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-apple-blue/10 rounded-full blur-3xl pointer-events-none" />

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
                {health.grade}
              </span>
            </div>
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
              CO1 Autonomous Agent Model Active
            </p>
          </div>
        </div>

        {/* Health Score Gauge */}
        <div className="flex items-center gap-2.5 bg-white/80 dark:bg-apple-gray-850 px-3.5 py-1.5 rounded-apple-md border border-apple-gray-200/80 dark:border-apple-gray-800">
          <ShieldCheck className="w-4 h-4 text-apple-blue" />
          <div className="text-right">
            <div className="text-xs font-bold text-apple-gray-900 dark:text-white">
              {health.score} / 100
            </div>
            <div className="text-[10px] text-apple-gray-400">Discipline Index</div>
          </div>
        </div>
      </div>

      {/* Dynamic Agent Advice Body */}
      <div className="p-3.5 rounded-apple-md bg-white/70 dark:bg-[#1C1C20]/80 border border-apple-gray-200/60 dark:border-apple-gray-800 text-xs text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-apple-orange flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-apple-gray-900 dark:text-white mr-1">
              {agentRec.selectedAction.title}:
            </span>
            <span>{agentRec.explanation}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Triggers */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-apple-gray-200/40 dark:border-apple-gray-800">
        <div className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400 font-medium">
          Goal: <span className="text-apple-blue font-semibold">{agentRec.goal.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenLab && (
            <button
              onClick={onOpenLab}
              className="text-xs text-apple-purple hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore AI Lab</span>
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

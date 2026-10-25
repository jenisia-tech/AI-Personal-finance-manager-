import React, { useState, useMemo } from 'react';
import { Plus, PieChart, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types/finance';
import { BudgetCard } from './BudgetCard';
import { BudgetFormModal } from './BudgetFormModal';
import { BudgetRiskModal } from './BudgetRiskModal';
import { EmptyState } from '../common/EmptyState';
import { calculateCategoryExpenses } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';
import { extractFinancialFacts, runForwardChainingReasoning } from '../../services/financialReasoningService';

interface BudgetPlannerViewProps {
  setActiveTab?: (tab: string) => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({ setActiveTab }) => {
  const { budgets, transactions, goals, userProfile, activeMonth, addBudget, updateBudget, deleteBudget } = useFinance();
  const categoryExpenses = calculateCategoryExpenses(transactions, activeMonth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [activeRiskBudget, setActiveRiskBudget] = useState<Budget | null>(null);
  const [showRulesDetail, setShowRulesDetail] = useState(false);

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (categoryExpenses[b.category] || 0), 0);
  const overallUtilization = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  const breachedCount = budgets.filter(b => (categoryExpenses[b.category] || 0) > b.limit).length;
  const existingCategories = budgets.map(b => b.category);

  // CO4 Forward-Chaining Reasoning Engine: evaluated on demand when data changes
  const facts = useMemo(() => {
    return extractFinancialFacts(transactions, budgets, goals, userProfile.monthlyIncome, activeMonth);
  }, [transactions, budgets, goals, userProfile.monthlyIncome, activeMonth]);

  const reasoning = useMemo(() => {
    return runForwardChainingReasoning(facts);
  }, [facts]);

  const triggeredRules = reasoning.results.filter(r => r.satisfied);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
            Monthly Budget Planner
          </h2>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            Real-time expenditure tracking with proactive AI alerts in INR (₹)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Aggregate Budget Discipline KPI Summary */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Total Allocated Limit
          </span>
          <div className="text-2xl font-bold text-apple-gray-900 dark:text-white mt-1">
            {formatINR(totalBudgetLimit)}
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">Across {budgets.length} assigned categories</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Actual Spent This Month
          </span>
          <div className="text-2xl font-bold text-apple-gray-900 dark:text-white mt-1">
            {formatINR(totalBudgetSpent)}
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">
            Utilization: <span className="font-semibold">{overallUtilization}%</span>
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
            Adherence Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            {breachedCount > 0 ? (
              <div className="flex items-center gap-2 text-apple-red font-bold text-base">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span>{breachedCount} Category Over-Budget</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-apple-green font-bold text-base">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>All Budgets Disciplined</span>
              </div>
            )}
          </div>
          <p className="text-xs text-apple-gray-400 mt-0.5">
            {totalBudgetLimit > totalBudgetSpent
              ? `${formatINR(totalBudgetLimit - totalBudgetSpent)} cushion remaining`
              : 'Deficit detected'}
          </p>
        </div>
      </div>

      {/* CO4 Forward-Chaining Inference Rules Banner */}
      <div className="p-4 rounded-apple-xl bg-gradient-to-r from-apple-purple/5 to-apple-blue/5 border border-apple-purple/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-apple-purple/10 text-apple-purple font-bold text-xs">
              CO4
            </span>
            <div>
              <h3 className="text-xs font-bold text-apple-gray-900 dark:text-white">
                Forward-Chaining Rule Diagnostics
              </h3>
              <p className="text-[11px] text-apple-gray-500">
                {triggeredRules.length > 0
                  ? `${triggeredRules.length} of ${reasoning.evaluatedCount} domain rules triggered warnings`
                  : `All ${reasoning.evaluatedCount} inference rules evaluated clear`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {setActiveTab && (
              <button
                onClick={() => setActiveTab('ai-lab')}
                className="text-[11px] text-apple-purple hover:underline font-semibold flex items-center gap-1"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Lab</span>
              </button>
            )}
            <button
              onClick={() => setShowRulesDetail(!showRulesDetail)}
              className="px-2.5 py-1 bg-white dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-sm text-xs font-semibold text-apple-gray-800 dark:text-apple-200 flex items-center gap-1 shadow-sm"
            >
              <span>{showRulesDetail ? 'Hide Rules' : 'Inspect Rules'}</span>
              {showRulesDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Triggered Rules Preview or Expanded Cards */}
        {triggeredRules.length > 0 ? (
          <div className="space-y-2 pt-1">
            {triggeredRules.slice(0, showRulesDetail ? undefined : 2).map((r) => {
              const isCrit = r.priority === 'critical';
              const isHigh = r.priority === 'high';

              return (
                <div
                  key={r.ruleId}
                  className={`p-3 rounded-apple-md border text-xs ${
                    isCrit
                      ? 'bg-apple-red/5 border-apple-red/20 text-apple-red'
                      : isHigh
                      ? 'bg-apple-orange/5 border-apple-orange/20 text-apple-orange'
                      : 'bg-apple-blue/5 border-apple-blue/20 text-apple-blue'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isCrit ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-apple-gray-900 dark:text-white">
                          {r.ruleName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/60 dark:bg-black/30">
                          {r.priority}
                        </span>
                      </div>
                      <p className="text-apple-gray-700 dark:text-apple-gray-300 font-medium">
                        {r.conclusion}
                      </p>
                      {r.recommendedAction && (
                        <p className="text-[11px] text-apple-gray-600 dark:text-apple-gray-400 italic">
                          Action: {r.recommendedAction}
                        </p>
                      )}
                      {showRulesDetail && (
                        <div className="pt-1.5 text-[10px] text-apple-gray-400 border-t border-current/10">
                          <b>Premise:</b> {r.conditionDescription}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {!showRulesDetail && triggeredRules.length > 2 && (
              <p className="text-[11px] text-apple-gray-400 text-center">
                + {triggeredRules.length - 2} more rule warnings. Click 'Inspect Rules' to view all.
              </p>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-apple-md bg-apple-green/10 border border-apple-green/20 text-xs text-apple-green flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>
              All inference rules satisfied. No emergency runway, category overspending, or concentration alerts triggered.
            </span>
          </div>
        )}
      </div>

      {/* Grid of Budget Cards */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={<PieChart className="w-8 h-8" />}
          title="No Category Budgets Assigned"
          description="Create spending limits for groceries, rent, entertainment, etc. to monitor limits."
          actionText="Create Budget"
          onAction={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              spent={categoryExpenses[b.category] || 0}
              onEdit={(item) => {
                setEditingBudget(item);
                setIsModalOpen(true);
              }}
              onDelete={(item) => deleteBudget(item.id)}
              onSimulate={(item) => setActiveRiskBudget(item)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Budget Limit Modal */}
      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={(data) => {
          if (editingBudget) {
            updateBudget(editingBudget.id, data);
          } else {
            addBudget(data);
          }
        }}
        initialData={editingBudget}
        existingCategories={existingCategories}
      />

      {/* CO4 Monte Carlo Budget Risk Modal */}
      <BudgetRiskModal
        isOpen={Boolean(activeRiskBudget)}
        onClose={() => setActiveRiskBudget(null)}
        budget={activeRiskBudget}
        spent={activeRiskBudget ? categoryExpenses[activeRiskBudget.category] || 0 : 0}
        transactions={transactions}
        activeMonth={activeMonth}
        onOpenLab={setActiveTab ? () => setActiveTab('ai-lab') : undefined}
      />
    </div>
  );
};

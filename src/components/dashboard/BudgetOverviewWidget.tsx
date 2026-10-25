import React, { useMemo } from 'react';
import { PieChart, ChevronRight, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { calculateCategoryExpenses, calculateBudgetUtilization } from '../../utils/calculations';
import { ProgressBar } from '../common/ProgressBar';
import { formatINR } from '../../utils/formatters';
import { extractFinancialFacts, runForwardChainingReasoning } from '../../services/financialReasoningService';

interface BudgetOverviewWidgetProps {
  onViewAll?: () => void;
}

export const BudgetOverviewWidget: React.FC<BudgetOverviewWidgetProps> = ({ onViewAll }) => {
  const { budgets, transactions, goals, userProfile, activeMonth } = useFinance();
  const categoryExpenses = calculateCategoryExpenses(transactions, activeMonth);

  // Evaluate CO4 Forward-Chaining Rules
  const facts = useMemo(() => {
    return extractFinancialFacts(transactions, budgets, goals, userProfile.monthlyIncome, activeMonth);
  }, [transactions, budgets, goals, userProfile.monthlyIncome, activeMonth]);

  const activeRuleAlert = useMemo(() => {
    const res = runForwardChainingReasoning(facts);
    return res.results.find(
      (r) => r.satisfied && (r.priority === 'critical' || r.priority === 'high')
    );
  }, [facts]);

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-apple-blue/10 text-apple-blue">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
              Budget Overview
            </h3>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs text-apple-blue hover:text-apple-blue-hover font-medium flex items-center"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* CO4 Rule Trigger Highlight if any near breach / overrun detected */}
        {activeRuleAlert && (
          <div className="mb-3 p-2.5 rounded-apple-sm bg-apple-orange/10 border border-apple-orange/20 text-apple-orange text-[11px] flex items-start gap-1.5 leading-snug">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">CO4 Alert: </span>
              <span>{activeRuleAlert.conclusion}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {budgets.slice(0, 4).map((b) => {
            const spent = categoryExpenses[b.category] || 0;
            const utilization = calculateBudgetUtilization(spent, b.limit);

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-apple-gray-800 dark:text-apple-gray-200">
                    {b.category}
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-apple-gray-900 dark:text-white">
                      {formatINR(spent)}
                    </span>
                    <span className="text-apple-gray-400 text-[10px] ml-1">
                      / {formatINR(b.limit)}
                    </span>
                  </div>
                </div>
                <ProgressBar
                  value={utilization}
                  size="sm"
                  dangerThreshold={b.alertThreshold}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

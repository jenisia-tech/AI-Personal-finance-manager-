import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { aiAdvisorService } from '../../services/aiAdvisorService';
import { formatINR } from '../../utils/formatters';

export const BudgetAlertsList: React.FC = () => {
  const { transactions, budgets, activeMonth } = useFinance();
  const alerts = aiAdvisorService.generateBudgetAlerts(transactions, budgets, activeMonth);

  if (alerts.length === 0) {
    return (
      <div className="p-8 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card text-center">
        <div className="text-3xl mb-2">🎉</div>
        <h4 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
          No Critical Budget Alerts
        </h4>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 max-w-sm mx-auto mt-1">
          All your category spending limits are currently well within their alert thresholds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => {
        const isDanger = alert.urgency === 'danger';

        return (
          <div
            key={idx}
            className={`p-4 rounded-apple-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-apple-card ${
              isDanger
                ? 'bg-apple-red/5 border-apple-red/20 text-apple-red'
                : 'bg-apple-orange/5 border-apple-orange/20 text-apple-orange'
            }`}
          >
            <div className="flex items-start gap-3">
              {isDanger ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-apple-gray-900 dark:text-white">
                    {alert.category} Budget {isDanger ? 'Over-Limit' : 'Near-Capacity'}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDanger
                        ? 'bg-apple-red/10 text-apple-red'
                        : 'bg-apple-orange/10 text-apple-orange'
                    }`}
                  >
                    {alert.utilization}% spent
                  </span>
                </div>
                <p className="text-xs text-apple-gray-600 dark:text-apple-gray-300 mt-1 leading-relaxed">
                  {alert.recommendation}
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-apple-gray-200/20">
              <div className="text-xs font-bold text-apple-gray-900 dark:text-white">
                {formatINR(alert.spent)}
              </div>
              <div className="text-[10px] text-apple-gray-400">
                Limit: {formatINR(alert.limit)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

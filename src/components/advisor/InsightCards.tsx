import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { aiAdvisorService } from '../../services/aiAdvisorService';

interface InsightCardsProps {
  setActiveTab?: (tab: string) => void;
}

export const InsightCards: React.FC<InsightCardsProps> = ({ setActiveTab }) => {
  const { transactions, budgets, goals, userProfile, activeMonth } = useFinance();

  const insights = aiAdvisorService.generateInsights(
    transactions,
    budgets,
    goals,
    userProfile.monthlyIncome,
    activeMonth
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
          Real-Time Contextual Insights
        </h3>
        <span className="text-xs text-apple-gray-400">
          {insights.length} active pattern(s) identified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card hover:shadow-apple-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl p-2 rounded-lg bg-apple-gray-100 dark:bg-apple-gray-850">
                    {item.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-apple-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-apple-blue uppercase tracking-wider">
                      {item.impact}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed mt-2">
                {item.description}
              </p>
            </div>

            {item.actionText && item.actionTab && setActiveTab && (
              <div className="mt-4 pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800/80 flex justify-end">
                <button
                  onClick={() => setActiveTab(item.actionTab!)}
                  className="text-xs font-semibold text-apple-blue hover:text-apple-blue-hover flex items-center gap-1 transition"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

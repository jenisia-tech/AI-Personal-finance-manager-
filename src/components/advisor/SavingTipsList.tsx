import React from 'react';
import { Lightbulb, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { aiAdvisorService } from '../../services/aiAdvisorService';
import { calculateTotalIncome, calculateTotalExpenses } from '../../utils/calculations';

export const SavingTipsList: React.FC = () => {
  const { transactions, userProfile, activeMonth } = useFinance();

  const totalIncome = Math.max(
    calculateTotalIncome(transactions, activeMonth),
    userProfile.monthlyIncome
  );
  const totalExpenses = calculateTotalExpenses(transactions, activeMonth);

  const tips = aiAdvisorService.generateSavingStrategies(totalIncome, totalExpenses);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
          Personalized Wealth & Saving Strategies
        </h3>
        <span className="text-xs text-apple-gray-400">
          Tailored to your {userProfile.name} profile
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="p-5 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card hover:shadow-apple-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-apple-purple/10 text-apple-purple">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-apple-gray-900 dark:text-white">
                    {tip.title}
                  </h4>
                  <span className="text-[10px] text-apple-gray-400">
                    {tip.targetCategory}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-apple-sm bg-apple-gray-50 dark:bg-apple-gray-850/80 text-[11px] font-mono text-apple-blue my-2">
                {tip.formula}
              </div>

              <p className="text-xs text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed mt-2">
                {tip.description}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-apple-gray-100 dark:border-apple-gray-800 flex items-center justify-between text-xs">
              <span className="text-apple-gray-400 text-[10px]">Savings Potential:</span>
              <div className="flex items-center gap-1 text-apple-green font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{tip.savingsPotential}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

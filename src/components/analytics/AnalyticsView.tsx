import React from 'react';
import { IncomeExpenseChart } from './IncomeExpenseChart';
import { CategoryPieChart } from './CategoryPieChart';
import { SpendingTrendChart } from './SpendingTrendChart';
import { BudgetVsActualChart } from './BudgetVsActualChart';
import { PaymentMethodChart } from './PaymentMethodChart';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
          Financial Analytics & Intelligence
        </h2>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
          In-depth data visualizations of cash inflows, spending velocities, and budget adherence
        </p>
      </div>

      {/* Top 6-Month Income vs Expense Trend */}
      <IncomeExpenseChart />

      {/* Two Column Grid: Category Distribution & Daily Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart />
        <SpendingTrendChart />
      </div>

      {/* Two Column Grid: Budget vs Actual & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetVsActualChart />
        <PaymentMethodChart />
      </div>
    </div>
  );
};

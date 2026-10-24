import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetSavings,
  calculateSavingsRate,
  calculateDailySpendRate,
} from '../../utils/calculations';
import { formatINR, getDaysElapsedInMonth } from '../../utils/formatters';
import { MetricCard } from './MetricCard';
import { AdvisorSummaryCard } from './AdvisorSummaryCard';
import { SpendingBreakdown } from './SpendingBreakdown';
import { GoalsProgressWidget } from './GoalsProgressWidget';
import { BudgetOverviewWidget } from './BudgetOverviewWidget';
import { RecentTransactions } from './RecentTransactions';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { transactions, activeMonth, userProfile } = useFinance();

  const totalIncome = Math.max(
    calculateTotalIncome(transactions, activeMonth),
    userProfile.monthlyIncome
  );
  const totalExpenses = calculateTotalExpenses(transactions, activeMonth);
  const netSurplus = calculateNetSavings(totalIncome, totalExpenses);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  const daysElapsed = getDaysElapsedInMonth();
  const dailySpend = calculateDailySpendRate(totalExpenses, daysElapsed);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Balance */}
        <MetricCard
          title="Total Net Balance"
          value={formatINR(netSurplus)}
          subtext="Available liquid surplus"
          icon={<Wallet className="w-5 h-5" />}
          accentColor="blue"
          trend={{
            value: netSurplus >= 0 ? '+Surplus' : '-Deficit',
            isPositive: netSurplus >= 0,
          }}
        />

        {/* Monthly Income */}
        <MetricCard
          title="Monthly Inflows"
          value={formatINR(totalIncome)}
          subtext="Verified income streams"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="green"
          trend={{
            value: 'Salary & Freelance',
            isPositive: true,
          }}
        />

        {/* Monthly Expenses */}
        <MetricCard
          title="Monthly Outflows"
          value={formatINR(totalExpenses)}
          subtext={`Avg. ${formatINR(dailySpend)} / day`}
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="red"
          trend={{
            value: `${daysElapsed} days tracked`,
            isPositive: false,
          }}
        />

        {/* Net Savings & Rate */}
        <MetricCard
          title="Savings Velocity"
          value={`${savingsRate}%`}
          subtext={`${formatINR(netSurplus)} net saved`}
          icon={<PiggyBank className="w-5 h-5" />}
          accentColor="purple"
          trend={{
            value: savingsRate >= 20 ? 'Target Achieved' : 'Below 20%',
            isPositive: savingsRate >= 20,
          }}
        />
      </div>

      {/* AI Advisor Highlight Banner */}
      <AdvisorSummaryCard
        onOpenAdvisor={() => setActiveTab('advisor')}
        onOpenLab={() => setActiveTab('ai-lab')}
      />

      {/* Grid: Spending Breakdown & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SpendingBreakdown />
        </div>
        <div className="lg:col-span-1">
          <BudgetOverviewWidget onViewAll={() => setActiveTab('budget')} />
        </div>
        <div className="lg:col-span-1">
          <GoalsProgressWidget onViewAll={() => setActiveTab('goals')} />
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <RecentTransactions onViewAll={() => setActiveTab('transactions')} />
    </div>
  );
};

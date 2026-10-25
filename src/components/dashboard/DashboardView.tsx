import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateTotalDeposits,
  calculateTotalWithdrawals,
  calculateNetSavings,
  calculateSavingsRate,
  calculateDailySpendRate,
} from '../../utils/calculations';
import { formatINR, getDaysElapsedInMonth, getMonthName } from '../../utils/formatters';
import { MetricCard } from './MetricCard';
import { AdvisorSummaryCard } from './AdvisorSummaryCard';
import { PredictionSummaryWidget } from './PredictionSummaryWidget';
import { SpendingBreakdown } from './SpendingBreakdown';
import { GoalsProgressWidget } from './GoalsProgressWidget';
import { BudgetOverviewWidget } from './BudgetOverviewWidget';
import { RecentTransactions } from './RecentTransactions';
import { TransactionFormModal } from '../transactions/TransactionFormModal';
import { TransactionType } from '../../types/finance';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { transactions, activeMonth, userProfile, addTransaction } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');

  // Exact calculations from saved transaction records
  const totalIncome = calculateTotalIncome(transactions, activeMonth);
  const totalExpenses = calculateTotalExpenses(transactions, activeMonth);
  const totalDeposits = calculateTotalDeposits(transactions, activeMonth);
  const totalWithdrawals = calculateTotalWithdrawals(transactions, activeMonth);

  // Net surplus/liquid balance accounting for income, expenses, deposits, withdrawals
  const netSurplus = calculateNetSavings(totalIncome, totalExpenses, totalDeposits, totalWithdrawals);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  const daysElapsed = getDaysElapsedInMonth();
  const dailySpend = calculateDailySpendRate(totalExpenses, daysElapsed);

  const openAddModal = (type: TransactionType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const hasData = transactions.length > 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Quick Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-apple-xl bg-white/70 dark:bg-apple-darkCard/70 backdrop-blur-md border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-apple-gray-900 dark:text-white flex items-center gap-1.5">
            <span>Financial Overview</span>
            <span className="text-apple-gray-400 font-normal">•</span>
            <span className="text-apple-blue font-medium text-xs">{getMonthName(activeMonth)}</span>
          </h2>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            {hasData
              ? `Tracking ${transactions.length} record(s) persistently in database`
              : 'Your workspace is empty. Add your first transaction below.'}
          </p>
        </div>

        {/* Clear Add Income & Add Expense Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-apple-green hover:bg-green-600 text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => openAddModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-apple-red hover:bg-red-600 text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* New User Empty State Welcome Banner */}
      {!hasData && (
        <div className="p-6 rounded-apple-xl bg-gradient-to-r from-apple-blue/5 via-apple-purple/5 to-apple-green/5 dark:from-apple-blue/10 dark:via-apple-purple/10 dark:to-apple-green/10 border border-apple-blue/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-apple-blue/10 text-apple-blue">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-apple-gray-900 dark:text-white">
                Welcome to your new financial dashboard, {userProfile.name}!
              </h3>
              <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-0.5">
                No mock or random values are prefilled. All balances and analytics are computed strictly from your records.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddModal('income')}
              className="px-4 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill transition"
            >
              + Record Initial Income
            </button>
          </div>
        </div>
      )}

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
          subtext={totalIncome > 0 ? 'Verified income streams' : 'No income recorded yet'}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="green"
          trend={{
            value: totalIncome > 0 ? 'Actual Inflows' : 'Pending Salary',
            isPositive: totalIncome > 0,
          }}
        />

        {/* Monthly Expenses */}
        <MetricCard
          title="Monthly Outflows"
          value={formatINR(totalExpenses)}
          subtext={totalExpenses > 0 ? `Avg. ${formatINR(dailySpend)} / day` : 'No expenses recorded'}
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
          subtext={`${formatINR(Math.max(0, netSurplus))} net saved`}
          icon={<PiggyBank className="w-5 h-5" />}
          accentColor="purple"
          trend={{
            value: totalIncome === 0 ? 'Awaiting Inflows' : savingsRate >= 20 ? 'Target Achieved' : 'Below 20%',
            isPositive: savingsRate >= 20,
          }}
        />
      </div>

      {/* AI Advisor Highlight Banner */}
      <AdvisorSummaryCard
        onOpenAdvisor={() => setActiveTab('advisor')}
        onOpenLab={() => setActiveTab('ai-lab')}
      />

      {/* CO5 Machine Learning Spending Prediction Banner */}
      <PredictionSummaryWidget onViewPrediction={() => setActiveTab('prediction')} />

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

      {/* Quick Add Form Modal */}
      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(data) => addTransaction(data)}
        initialType={modalType}
      />
    </div>
  );
};

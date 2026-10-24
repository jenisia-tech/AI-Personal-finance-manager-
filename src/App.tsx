import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { ToastContainer } from './components/common/Toast';

import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionListView } from './components/transactions/TransactionListView';
import { BudgetPlannerView } from './components/budget/BudgetPlannerView';
import { SavingsGoalsView } from './components/goals/SavingsGoalsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AIAdvisorView } from './components/advisor/AIAdvisorView';
import { AIAlgorithmsLabView } from './components/ai-lab/AIAlgorithmsLabView';
import { SettingsView } from './components/settings/SettingsView';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="flex min-h-screen bg-apple-bg dark:bg-apple-darkBg text-[#1D1D1F] dark:text-[#F5F5F7]">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'transactions' && <TransactionListView />}
          {activeTab === 'budget' && <BudgetPlannerView />}
          {activeTab === 'goals' && <SavingsGoalsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'advisor' && <AIAdvisorView setActiveTab={setActiveTab} />}
          {activeTab === 'ai-lab' && <AIAlgorithmsLabView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { ToastContainer } from './components/common/Toast';

import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';

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
    <div className="flex min-h-screen bg-apple-bg dark:bg-apple-darkBg text-apple-gray-900 dark:text-[#FAF1F5]">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'transactions' && <TransactionListView />}
          {activeTab === 'budget' && <BudgetPlannerView setActiveTab={setActiveTab} />}
          {activeTab === 'goals' && <SavingsGoalsView setActiveTab={setActiveTab} />}
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

export const Root: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-apple-bg dark:bg-apple-darkBg text-apple-gray-600 dark:text-apple-gray-400 gap-3">
        <div className="w-10 h-10 border-3 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide">Loading FinIntel AI...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
};

export default App;

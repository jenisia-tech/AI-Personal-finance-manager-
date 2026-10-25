import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  BarChart3,
  TrendingUp,
  Bot,
  Cpu,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateTotalDeposits,
  calculateTotalWithdrawals,
  calculateNetSavings,
} from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { transactions, activeMonth, userProfile } = useFinance();
  const { user, logout } = useAuth();

  const totalIncome = calculateTotalIncome(transactions, activeMonth);
  const totalExpenses = calculateTotalExpenses(transactions, activeMonth);
  const totalDeposits = calculateTotalDeposits(transactions, activeMonth);
  const totalWithdrawals = calculateTotalWithdrawals(transactions, activeMonth);
  const netBalance = calculateNetSavings(totalIncome, totalExpenses, totalDeposits, totalWithdrawals);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budget', label: 'Budget Planner', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {
      id: 'prediction',
      label: 'Spending Prediction',
      icon: TrendingUp,
      badge: 'CO5 ML',
    },
    { id: 'advisor', label: 'FinBot Advisor', icon: Bot },
    {
      id: 'ai-lab',
      label: 'AI Algorithms Lab',
      icon: Cpu,
      badge: 'CO1–CO5',
      highlight: true,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-apple-gray-200/80 dark:border-apple-gray-800/80 bg-white/70 dark:bg-apple-darkBg/80 backdrop-blur-xl p-4 sm:p-5 h-screen sticky top-0 justify-between overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-apple-md bg-gradient-to-tr from-bubblegum to-purple-600 flex items-center justify-center text-white shadow-apple-pill font-black text-lg shrink-0">
            ₹
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-apple-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>FinIntel AI</span>
              <span className="px-1.5 py-0.5 bg-bubblegum/10 text-bubblegum text-[10px] font-bold rounded shrink-0">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-apple-gray-400 font-medium truncate">Smart Finance Manager</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-apple-sm text-xs font-medium transition-all group ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-bubblegum to-purple-600 text-white shadow-md font-semibold'
                      : 'bg-bubblegum text-white shadow-apple-pill font-semibold'
                    : item.highlight
                    ? 'text-bubblegum dark:text-pink-300 bg-bubblegum/10 hover:bg-bubblegum/15 font-semibold'
                    : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-bubblegum/5 dark:hover:bg-bubblegum/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-bubblegum dark:text-pink-300'
                        : 'text-apple-gray-500 group-hover:text-apple-gray-900 dark:group-hover:text-white'
                    }`}
                  />
                  <span className="truncate whitespace-nowrap text-left">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`shrink-0 whitespace-nowrap text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-2 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-bubblegum/20 text-bubblegum dark:text-pink-200'
                        : 'bg-bubblegum/15 text-bubblegum dark:text-pink-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 mt-auto">
        {/* Mini Financial Summary Card in Sidebar */}
        <div className="p-3.5 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850/80 border border-apple-gray-200/60 dark:border-apple-gray-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-semibold text-apple-gray-500 uppercase tracking-wider">
              Net Surplus
            </span>
            <Sparkles className="w-3.5 h-3.5 text-bubblegum animate-pulse-subtle shrink-0" />
          </div>
          <div className="text-lg font-bold text-apple-gray-900 dark:text-white tracking-tight">
            {formatINR(netBalance)}
          </div>
          <div className="flex justify-between items-center text-[10px] text-apple-gray-400 mt-2 pt-2 border-t border-apple-gray-200/40 dark:border-apple-gray-800">
            <span className="truncate mr-1">In: {formatINR(totalIncome)}</span>
            <span className="truncate text-right">Out: {formatINR(totalExpenses)}</span>
          </div>
        </div>

        {/* User Badge & Logout in Sidebar */}
        <div className="p-2.5 rounded-apple-md bg-apple-gray-50/80 dark:bg-apple-gray-850/50 border border-apple-gray-200/40 dark:border-apple-gray-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-bubblegum/15 text-bubblegum flex items-center justify-center font-bold text-xs shrink-0">
              {userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-apple-gray-900 dark:text-white truncate block text-left">
                {userProfile.name}
              </div>
              <div className="text-[10px] text-apple-gray-400 truncate block text-left">
                {userProfile.email || user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 rounded transition shrink-0 ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

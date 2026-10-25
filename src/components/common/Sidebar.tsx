import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  BarChart3,
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
    { id: 'advisor', label: 'FinBot Advisor', icon: Bot },
    {
      id: 'ai-lab',
      label: 'AI Algorithms Lab',
      icon: Cpu,
      badge: 'CO1•CO2•CO4',
      highlight: true,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-apple-gray-200/80 dark:border-apple-gray-800/80 bg-white/70 dark:bg-apple-darkBg/80 backdrop-blur-xl p-5 min-h-screen sticky top-0 justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-apple-md bg-gradient-to-tr from-apple-blue to-apple-purple flex items-center justify-center text-white shadow-apple-pill font-black text-lg">
            ₹
          </div>
          <div>
            <div className="font-bold text-sm text-apple-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>FinIntel AI</span>
              <span className="px-1.5 py-0.2 bg-apple-blue/10 text-apple-blue text-[10px] font-bold rounded">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-apple-gray-400 font-medium">Smart Finance Manager</p>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-apple-sm text-xs font-medium transition-all group ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-apple-blue to-apple-purple text-white shadow-md font-semibold'
                      : 'bg-apple-blue text-white shadow-apple-pill font-semibold'
                    : item.highlight
                    ? 'text-apple-blue dark:text-pink-300 bg-apple-blue/5 dark:bg-apple-blue/10 hover:bg-apple-blue/15'
                    : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-apple-gray-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-apple-blue dark:text-pink-300'
                        : 'text-apple-gray-500 group-hover:text-apple-gray-900 dark:group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-apple-blue/20 text-apple-blue dark:text-pink-200'
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

      <div className="space-y-3">
        {/* Mini Financial Summary Card in Sidebar */}
        <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850/80 border border-apple-gray-200/60 dark:border-apple-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-apple-gray-500 uppercase tracking-wider">
              Net Surplus
            </span>
            <Sparkles className="w-3.5 h-3.5 text-apple-orange animate-pulse-subtle" />
          </div>
          <div className="text-lg font-bold text-apple-gray-900 dark:text-white tracking-tight">
            {formatINR(netBalance)}
          </div>
          <div className="flex justify-between items-center text-[10px] text-apple-gray-400 mt-2 pt-2 border-t border-apple-gray-200/40 dark:border-apple-gray-800">
            <span>In: {formatINR(totalIncome)}</span>
            <span>Out: {formatINR(totalExpenses)}</span>
          </div>
        </div>

        {/* User Badge & Logout in Sidebar */}
        <div className="p-2.5 rounded-apple-md bg-apple-gray-50/80 dark:bg-apple-gray-850/50 border border-apple-gray-200/40 dark:border-apple-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center font-bold text-xs flex-shrink-0">
              {userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-apple-gray-900 dark:text-white truncate">
                {userProfile.name}
              </div>
              <div className="text-[10px] text-apple-gray-400 truncate">
                {userProfile.email || user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 rounded transition flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

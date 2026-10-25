import React from 'react';
import { Sun, Moon, Calendar, Bot, LogOut } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { getMonthName } from '../../utils/formatters';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab }) => {
  const { userProfile, activeMonth, setActiveMonth, darkMode, toggleDarkMode } = useFinance();
  const { logout } = useAuth();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Generate selectable months (3 previous, current, 3 future)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const monthOptions: string[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(currentYear, currentMonthIdx + i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthOptions.push(ym);
  }

  // Ensure activeMonth is in options
  if (!monthOptions.includes(activeMonth)) {
    monthOptions.push(activeMonth);
    monthOptions.sort();
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-apple-darkBg/80 backdrop-blur-xl border-b border-apple-gray-200/80 dark:border-apple-gray-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Left: Personalized Greeting & Date */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-apple-gray-900 dark:text-white flex items-center gap-2">
          <span>{getGreeting()}, {userProfile.name}</span>
          <span className="text-xl">👋</span>
        </h1>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 hidden sm:block">
          Personal Wealth Intelligence • {getMonthName(activeMonth)}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick AI Lab Trigger Chip */}
        <button
          onClick={() => setActiveTab('ai-lab')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-apple-blue/10 to-apple-purple/10 dark:from-apple-blue/20 dark:to-apple-purple/20 text-apple-blue dark:text-pink-300 hover:opacity-90 rounded-full text-xs font-semibold border border-apple-blue/20 transition shadow-sm"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Lab (CO1, CO2, CO4)</span>
        </button>

        {/* Month Selector */}
        <div className="flex items-center gap-1 bg-apple-gray-100 dark:bg-apple-gray-850 px-2.5 py-1.5 rounded-apple-sm text-xs font-medium text-apple-gray-700 dark:text-apple-gray-300 border border-apple-gray-200 dark:border-apple-gray-800">
          <Calendar className="w-3.5 h-3.5 text-apple-gray-500" />
          <select
            value={activeMonth}
            onChange={(e) => setActiveMonth(e.target.value)}
            className="bg-transparent border-none outline-none cursor-pointer text-xs font-medium"
          >
            {monthOptions.map(m => (
              <option key={m} value={m} className="bg-white dark:bg-apple-gray-900 text-apple-gray-800 dark:text-white">
                {getMonthName(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-apple-sm text-apple-gray-500 hover:text-apple-gray-900 dark:text-apple-gray-400 dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-apple-gray-850 transition"
        >
          {darkMode ? <Sun className="w-4 h-4 text-apple-orange" /> : <Moon className="w-4 h-4 text-apple-blue" />}
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-apple-sm text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

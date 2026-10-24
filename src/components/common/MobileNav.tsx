import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  Bot,
  Cpu,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Spend', icon: ReceiptText },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'advisor', label: 'FinBot', icon: Bot },
    { id: 'ai-lab', label: 'AI Lab', icon: Cpu, highlight: true },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0A0A0C]/90 backdrop-blur-xl border-t border-apple-gray-200 dark:border-apple-gray-800 px-2 py-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition text-[10px] font-medium ${
              isActive
                ? item.highlight
                  ? 'text-apple-purple font-bold'
                  : 'text-apple-blue font-bold'
                : 'text-apple-gray-500 hover:text-apple-gray-900 dark:text-apple-gray-400 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {item.highlight && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-apple-purple rounded-full animate-ping" />
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { MessageSquare, Sparkles, AlertTriangle, Lightbulb, Cpu, ArrowRight } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { InsightCards } from './InsightCards';
import { BudgetAlertsList } from './BudgetAlertsList';
import { SavingTipsList } from './SavingTipsList';

interface AIAdvisorViewProps {
  setActiveTab: (tab: string) => void;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ setActiveTab }) => {
  const [advisorSubTab, setAdvisorSubTab] = useState<'chat' | 'insights' | 'alerts' | 'strategies'>('chat');

  const tabs = [
    { id: 'chat', label: 'Interactive Chat', icon: MessageSquare },
    { id: 'insights', label: 'Live Insights', icon: Sparkles },
    { id: 'alerts', label: 'Budget Alerts', icon: AlertTriangle },
    { id: 'strategies', label: 'Saving Strategies', icon: Lightbulb },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white flex items-center gap-2">
            <span>FinBot AI Financial Advisor</span>
            <span className="text-base">🤖</span>
          </h2>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            Intelligent conversational guidance, spending anomaly detection, and automated goal velocity tracking
          </p>
        </div>

        {/* AI Algorithms Lab Navigation Bridge */}
        <button
          onClick={() => setActiveTab('ai-lab')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-apple-blue to-apple-purple text-white rounded-apple-sm text-xs font-semibold shadow-apple-pill hover:opacity-90 transition"
        >
          <Cpu className="w-4 h-4" />
          <span>Launch AI Algorithms Lab (CO1•CO2•CO4)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-apple-gray-100 dark:bg-apple-gray-850 rounded-apple-lg border border-apple-gray-200/60 dark:border-apple-gray-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = advisorSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setAdvisorSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-apple-md text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-white dark:bg-apple-gray-900 text-apple-gray-900 dark:text-white shadow-sm'
                  : 'text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {advisorSubTab === 'chat' && <ChatInterface onOpenLab={() => setActiveTab('ai-lab')} />}
      {advisorSubTab === 'insights' && <InsightCards setActiveTab={setActiveTab} />}
      {advisorSubTab === 'alerts' && <BudgetAlertsList />}
      {advisorSubTab === 'strategies' && <SavingTipsList />}
    </div>
  );
};

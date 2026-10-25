import React, { useState } from 'react';
import { Bot, Search, Brain, Cpu, TrendingUp } from 'lucide-react';
import { IntelligentAgentPanel } from './IntelligentAgentPanel';
import { SearchAlgorithmsPanel } from './SearchAlgorithmsPanel';
import { ReasoningPanel } from './ReasoningPanel';
import { LinearRegressionPanel } from './LinearRegressionPanel';

export const AIAlgorithmsLabView: React.FC = () => {
  const [activeLabTab, setActiveLabTab] = useState<'co1' | 'co2' | 'co4' | 'co5'>('co1');

  const tabs = [
    {
      id: 'co1',
      title: 'CO1: Intelligent Agent Model',
      shortTitle: 'CO1: Intelligent Agent',
      icon: Bot,
      description: 'Perceive-Analyze-Decide-Act-Evaluate cycle with multiple goals and counterfactual testing',
      badge: 'Goal-Based Agent',
    },
    {
      id: 'co2',
      title: 'CO2: Uninformed & Informed Search',
      shortTitle: 'CO2: Search Techniques',
      icon: Search,
      description: 'Manual BFS (Queue) vs. Best-First Search (Priority Queue & Heuristic Distance)',
      badge: 'BFS vs Best-First',
    },
    {
      id: 'co4',
      title: 'CO4: Reasoning Under Uncertainty',
      shortTitle: 'CO4: Reasoning & Risk',
      icon: Brain,
      description: 'Forward-chaining rule engine and Monte Carlo probabilistic budget risk estimation',
      badge: 'Rules & Monte Carlo',
    },
    {
      id: 'co5',
      title: 'CO5: Machine Learning for Decision-Making',
      shortTitle: 'CO5: ML Prediction',
      icon: TrendingUp,
      description: 'Supervised Ordinary Least Squares Linear Regression spending forecast & chronological holdout MAE',
      badge: 'Linear Regression',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-apple-md bg-gradient-to-tr from-bubblegum to-purple-600 flex items-center justify-center text-white shadow-apple-pill">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
              AI Algorithms Lab (CO1 • CO2 • CO4 • CO5)
            </h2>
          </div>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-1">
            Interactive academic experimentation suite showcasing core Artificial Intelligence course outcomes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full border border-apple-blue/20">
            Offline Deterministic Algorithms
          </span>
        </div>
      </div>

      {/* 4 Main Course Outcome Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeLabTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveLabTab(tab.id as any)}
              className={`p-4 rounded-apple-xl text-left transition-all border ${
                isActive
                  ? 'bg-white dark:bg-apple-darkCard border-bubblegum ring-2 ring-bubblegum/30 shadow-apple-card-hover'
                  : 'bg-white/60 dark:bg-apple-darkCard/60 border-apple-gray-200/80 dark:border-apple-gray-800 hover:bg-white dark:hover:bg-apple-darkCard'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-apple-md ${
                    isActive
                      ? 'bg-bubblegum text-white shadow-apple-pill'
                      : 'bg-apple-gray-100 dark:bg-apple-gray-850 text-apple-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-bubblegum/20 text-bubblegum'
                      : 'bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </div>

              <h3 className="text-xs font-bold text-apple-gray-900 dark:text-white mb-1">
                {tab.title}
              </h3>
              <p className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400 line-clamp-2">
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Tab View Content */}
      <div className="pt-2">
        {activeLabTab === 'co1' && <IntelligentAgentPanel />}
        {activeLabTab === 'co2' && <SearchAlgorithmsPanel />}
        {activeLabTab === 'co4' && <ReasoningPanel />}
        {activeLabTab === 'co5' && <LinearRegressionPanel />}
      </div>
    </div>
  );
};

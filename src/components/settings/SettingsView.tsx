import React, { useState } from 'react';
import { Save, Download, Upload, RotateCcw, ShieldCheck, Key, User } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const SettingsView: React.FC = () => {
  const { userProfile, updateProfile, resetToDemo, exportJSON, importJSON, showToast } = useFinance();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [income, setIncome] = useState(userProfile.monthlyIncome.toString());
  const [apiKey, setApiKey] = useState(userProfile.apiKey || '');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numIncome = parseFloat(income);
    if (isNaN(numIncome) || numIncome < 0) {
      showToast('Please enter a valid monthly income.', 'error');
      return;
    }

    updateProfile({
      name: name.trim() || 'User',
      email: email.trim() || 'user@example.com',
      monthlyIncome: numIncome,
      apiKey: apiKey.trim() || undefined,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
          Application Settings & Preferences
        </h2>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
          Manage your personal profile, baseline monthly salary, local data backup, and AI engine
        </p>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
        <div className="flex items-center gap-2.5 pb-4 border-b border-apple-gray-100 dark:border-apple-gray-800 mb-4">
          <div className="p-2 rounded-lg bg-apple-blue/10 text-apple-blue">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
              User Profile & Financial Baseline
            </h3>
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
              Configured for Indian Rupee currency (₹)
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
                Baseline Monthly Salary / Inflows (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-apple-gray-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
                System Currency
              </label>
              <input
                type="text"
                value="INR (₹) Indian Rupee"
                disabled
                className="w-full p-2 bg-apple-gray-100 dark:bg-apple-gray-900 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* AI Advisor Configuration */}
          <div className="pt-4 border-t border-apple-gray-100 dark:border-apple-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-apple-purple" />
              <label className="text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300">
                Optional External AI Key (Google Gemini / OpenAI)
              </label>
            </div>
            <p className="text-[11px] text-apple-gray-400 mb-2">
              The application works 100% offline using our built-in CO1, CO2, and CO4 rule and search engines. You may optionally connect an external LLM key if desired.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste optional API key here..."
              className="w-full p-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue font-mono"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-semibold rounded-apple-sm transition shadow-apple-pill"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* LocalStorage Data Management & JSON Backup */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-apple-gray-100 dark:border-apple-gray-800">
          <div className="p-2 rounded-lg bg-apple-green/10 text-apple-green">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
              Data Management & Backup
            </h3>
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
              Zero external server requirements • All records stored securely in your browser's localStorage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-apple-gray-900 dark:text-white">
                Export JSON Snapshot
              </div>
              <p className="text-[11px] text-apple-gray-400 mt-1">
                Download a complete JSON backup of all transactions, budgets, goals, and profile.
              </p>
            </div>
            <button
              onClick={exportJSON}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-white dark:bg-apple-gray-800 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-sm text-xs font-semibold text-apple-gray-800 dark:text-white transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-apple-gray-900 dark:text-white">
                Restore From Backup
              </div>
              <p className="text-[11px] text-apple-gray-400 mt-1">
                Upload a previously exported JSON file to restore your entire financial state.
              </p>
            </div>
            <label className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-white dark:bg-apple-gray-800 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple-sm text-xs font-semibold text-apple-gray-800 dark:text-white transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-apple-gray-900 dark:text-white">
                Reset Demo Dataset
              </div>
              <p className="text-[11px] text-apple-gray-400 mt-1">
                Revert all balances to the initial pre-populated Indian INR demonstration data.
              </p>
            </div>
            <button
              onClick={resetToDemo}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-apple-red/10 hover:bg-apple-red/20 text-apple-red border border-apple-red/20 rounded-apple-sm text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Everything</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

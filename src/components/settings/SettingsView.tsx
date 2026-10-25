import React, { useState } from 'react';
import { Save, Download, Upload, RotateCcw, ShieldCheck, Key, User, LogOut } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatShortDate } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const { userProfile, updateProfile, resetToDemo, exportJSON, importJSON, showToast } = useFinance();
  const { user, logout } = useAuth();

  const [name, setName] = useState(userProfile.name || user?.name || '');
  const [email] = useState(userProfile.email || user?.email || '');
  const [income, setIncome] = useState(userProfile.monthlyIncome?.toString() || '0');
  const [apiKey, setApiKey] = useState(userProfile.apiKey || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numIncome = parseFloat(income);
    if (isNaN(numIncome) || numIncome < 0) {
      showToast('Please enter a valid monthly income baseline (₹0 or higher).', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim() || 'User',
        monthlyIncome: numIncome,
        apiKey: apiKey.trim() || undefined,
      });
    } catch {
      // Error toast handled in context
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await importJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
            Account Settings & Preferences
          </h2>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            Authenticated workspace with persistent SQLite database storage
          </p>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-apple-sm text-xs font-semibold text-apple-red bg-apple-red/10 hover:bg-apple-red/20 border border-apple-red/20 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Info Card */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
        <div className="flex items-center justify-between pb-4 border-b border-apple-gray-100 dark:border-apple-gray-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-apple-blue/10 text-apple-blue">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
                Personal Profile & Financial Baseline
              </h3>
              <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                Indian Rupee standard (₹ INR) • User ID: {user?.id || 'Active'}
              </p>
            </div>
          </div>
          {user?.createdAt && (
            <span className="text-[11px] text-apple-gray-400">
              Member since {formatShortDate(user.createdAt.split('T')[0])}
            </span>
          )}
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
                Email Address (Account Identifier)
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-2 bg-apple-gray-100 dark:bg-apple-gray-900 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs text-apple-gray-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1">
                Expected Monthly Income Baseline (₹)
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
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs font-semibold text-apple-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-apple-blue"
                />
              </div>
              <p className="text-[10px] text-apple-gray-400 mt-1">
                Optional reference baseline. Actual inflows are computed directly from your saved income transactions.
              </p>
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
              The application operates 100% offline using deterministic CO1, CO2, and CO4 rule and search engines. You may optionally connect an external LLM key if desired.
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
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-semibold rounded-apple-sm transition shadow-apple-pill disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Database Management & Backup */}
      <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-apple-gray-100 dark:border-apple-gray-800">
          <div className="p-2 rounded-lg bg-apple-green/10 text-apple-green">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
              Database Persistence & Data Isolation
            </h3>
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
              Records are persistently stored in the server SQLite database with user-isolated security
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
                Download a verified backup of all your transactions, budgets, goals, and profile.
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
                Upload a JSON snapshot to import records directly into your authenticated account.
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

          {/* Seed Demo Dataset (Dev Only) */}
          <div className="p-4 rounded-apple-md bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200/60 dark:border-apple-gray-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-apple-gray-900 dark:text-white flex items-center gap-1.5">
                <span>Demo Dataset</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-apple-orange/10 text-apple-orange">
                  Dev Only
                </span>
              </div>
              <p className="text-[11px] text-apple-gray-400 mt-1">
                Populate this account with sample Indian transactions and budgets for viva testing.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Load sample Indian demo transactions and budgets into your account?')) {
                  resetToDemo();
                }
              }}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue border border-apple-blue/20 rounded-apple-sm text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

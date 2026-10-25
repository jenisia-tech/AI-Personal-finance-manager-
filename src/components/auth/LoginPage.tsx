import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-bg dark:bg-apple-darkBg px-4 py-12 transition-colors">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-apple-blue to-apple-purple items-center justify-center text-white shadow-apple-card text-2xl font-black mb-4">
            ₹
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
            Welcome to FinIntel AI
          </h1>
          <p className="text-xs sm:text-sm text-apple-gray-500 dark:text-apple-gray-400 mt-1">
            Personal Wealth Intelligence & AI Algorithms Platform
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-apple-xl bg-white/80 dark:bg-apple-darkCard/90 backdrop-blur-xl border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-apple-gray-100 dark:border-apple-gray-800">
            <div>
              <h2 className="text-base font-bold text-apple-gray-900 dark:text-white">
                Account Sign In
              </h2>
              <p className="text-xs text-apple-gray-400">
                Access your isolated financial workspace
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-apple-blue" />
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-apple-sm bg-apple-red/10 border border-apple-red/20 text-apple-red text-xs font-medium flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-apple-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs font-medium text-apple-gray-900 dark:text-white placeholder-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-apple-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-apple-gray-50 dark:bg-apple-gray-850 border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple-sm text-xs font-medium text-apple-gray-900 dark:text-white placeholder-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-semibold rounded-apple-sm shadow-apple-pill flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-apple-gray-100 dark:border-apple-gray-800 text-center">
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-apple-blue hover:text-apple-blue-hover inline-flex items-center gap-0.5 ml-1 transition"
              >
                <span>Register here</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

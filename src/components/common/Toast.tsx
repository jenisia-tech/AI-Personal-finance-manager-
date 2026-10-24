import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-apple-green flex-shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-apple-red flex-shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-apple-blue flex-shrink-0" />
          );

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between p-3.5 bg-white/95 dark:bg-[#1C1C20]/95 backdrop-blur-md rounded-apple-md shadow-apple-card border border-apple-gray-200 dark:border-apple-gray-800 text-sm animate-fade-in"
          >
            <div className="flex items-center gap-2.5 mr-2">
              {icon}
              <span className="text-apple-gray-800 dark:text-apple-gray-100 font-medium leading-snug">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full text-apple-gray-400 hover:text-apple-gray-600 dark:hover:text-apple-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

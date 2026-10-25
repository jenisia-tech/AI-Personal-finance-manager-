import React from 'react';
import { ChevronRight, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, formatShortDate } from '../../utils/formatters';

interface RecentTransactionsProps {
  onViewAll?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onViewAll }) => {
  const { transactions } = useFinance();
  const recent = transactions.slice(0, 5);

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            Latest cash flow activities
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-apple-blue hover:text-apple-blue-hover font-medium flex items-center"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-apple-gray-400">No transactions recorded yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-apple-gray-100 dark:divide-apple-gray-800/80">
          {recent.map((tx) => {
            const isIncome = tx.type === 'income';
            const isDeposit = tx.type === 'deposit';
            const isWithdrawal = tx.type === 'withdrawal';

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between hover:bg-apple-gray-50/60 dark:hover:bg-apple-gray-850/40 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-apple-sm flex items-center justify-center ${
                      isIncome
                        ? 'bg-apple-green/10 text-apple-green'
                        : isDeposit
                        ? 'bg-apple-blue/10 text-apple-blue'
                        : isWithdrawal
                        ? 'bg-apple-orange/10 text-apple-orange'
                        : 'bg-apple-red/10 text-apple-red'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : isDeposit ? (
                      <ArrowRightLeft className="w-4 h-4" />
                    ) : isWithdrawal ? (
                      <ArrowRightLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-apple-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">
                      {tx.description}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-apple-gray-400 mt-0.5">
                      <span>{formatShortDate(tx.date)}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-apple-gray-100 dark:bg-apple-gray-850 text-apple-gray-600 dark:text-apple-gray-300">
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span>{tx.paymentMode}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs font-bold ${
                    isIncome
                      ? 'text-apple-green'
                      : isDeposit
                      ? 'text-apple-blue'
                      : isWithdrawal
                      ? 'text-apple-orange'
                      : 'text-apple-gray-900 dark:text-white'
                  }`}
                >
                  {isIncome ? '+' : isWithdrawal ? '+' : '-'}
                  {formatINR(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

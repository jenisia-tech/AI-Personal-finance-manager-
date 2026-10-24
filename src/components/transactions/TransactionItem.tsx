import React from 'react';
import { Edit2, Trash2, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../../types/finance';
import { formatINR, formatDate } from '../../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const isIncome = transaction.type === 'income';

  return (
    <tr className="hover:bg-apple-gray-50/80 dark:hover:bg-apple-gray-850/50 transition border-b border-apple-gray-100 dark:border-apple-gray-800/80 text-xs">
      {/* Date & Type Indicator */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-apple-sm flex items-center justify-center ${
              isIncome
                ? 'bg-apple-green/10 text-apple-green'
                : 'bg-apple-red/10 text-apple-red'
            }`}
          >
            {isIncome ? (
              <ArrowDownRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="font-medium text-apple-gray-700 dark:text-apple-gray-300 whitespace-nowrap">
            {formatDate(transaction.date)}
          </span>
        </div>
      </td>

      {/* Description */}
      <td className="py-3 px-4 font-semibold text-apple-gray-900 dark:text-white max-w-xs truncate">
        {transaction.description}
      </td>

      {/* Category Badge */}
      <td className="py-3 px-4">
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-700 dark:text-apple-gray-300">
          {transaction.category}
        </span>
      </td>

      {/* Payment Mode */}
      <td className="py-3 px-4 text-apple-gray-500 dark:text-apple-gray-400">
        {transaction.paymentMode}
      </td>

      {/* Amount */}
      <td
        className={`py-3 px-4 font-bold text-right whitespace-nowrap ${
          isIncome ? 'text-apple-green' : 'text-apple-gray-900 dark:text-white'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatINR(transaction.amount)}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 text-apple-gray-400 hover:text-apple-blue hover:bg-apple-blue/10 rounded-apple-sm transition"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="p-1.5 text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 rounded-apple-sm transition"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

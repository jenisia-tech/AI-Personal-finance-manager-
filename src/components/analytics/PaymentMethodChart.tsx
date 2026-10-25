import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';

const PAYMENT_COLORS: Record<string, string> = {
  UPI: '#10B981', // Sweet Mint
  'Credit Card': '#D946EF', // Bubblegum Orchid
  'Debit Card': '#FF5E97', // Bubblegum Pink
  'Net Banking': '#FB923C', // Peach Lace
  Cash: '#B59F91', // Warm Lace Taupe
};

export const PaymentMethodChart: React.FC = () => {
  const { transactions, activeMonth } = useFinance();

  const methodTotals: Record<string, number> = {
    UPI: 0,
    'Credit Card': 0,
    'Debit Card': 0,
    'Net Banking': 0,
    Cash: 0,
  };

  transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(activeMonth))
    .forEach(t => {
      methodTotals[t.paymentMode] = (methodTotals[t.paymentMode] || 0) + t.amount;
    });

  const data = Object.entries(methodTotals)
    .map(([method, amount]) => ({
      method,
      amount,
      color: PAYMENT_COLORS[method] || '#FF5E97',
    }))
    .filter(item => item.amount > 0);

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
          Payment Mode Distribution
        </h3>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
          UPI vs Cards vs Net Banking vs Cash outflows in INR (₹)
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis dataKey="method" stroke="#B59F91" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#B59F91"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatINR(value), 'Spent']}
              contentStyle={{
                backgroundColor: 'rgba(34, 21, 32, 0.95)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 94, 151, 0.2)',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';

export const IncomeExpenseChart: React.FC = () => {
  const { transactions } = useFinance();

  // Generate 6 months historical trend data up to current date
  const now = new Date();
  const months: string[] = [];
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(ym);
    monthLabels.push(d.toLocaleString('default', { month: 'short' }));
  }

  const data = months.map((m, idx) => {
    const monthlyTxs = transactions.filter(t => t.date.startsWith(m));
    const income = monthlyTxs
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expenses = monthlyTxs
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const savings = Math.max(0, income - expenses);

    return {
      month: monthLabels[idx],
      Income: income,
      Expenses: expenses,
      NetSavings: savings,
    };
  });

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
          Income vs. Expenses Trend (6 Months)
        </h3>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
          Monthly inflows, outflows, and net surplus velocity in INR (₹)
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis dataKey="month" stroke="#B59F91" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#B59F91"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatINR(value), '']}
              contentStyle={{
                backgroundColor: 'rgba(34, 21, 32, 0.95)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 94, 151, 0.2)',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="NetSavings" fill="#FF5E97" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

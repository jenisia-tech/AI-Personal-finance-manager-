import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';

export const SpendingTrendChart: React.FC = () => {
  const { transactions, activeMonth } = useFinance();

  // Aggregate day-by-day expenses
  const daysInMonth = 31;
  const dayMap = new Map<number, number>();

  for (let d = 1; d <= daysInMonth; d++) {
    dayMap.set(d, 0);
  }

  transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(activeMonth))
    .forEach(t => {
      const day = parseInt(t.date.split('-')[2], 10);
      dayMap.set(day, (dayMap.get(day) || 0) + t.amount);
    });

  const data = Array.from(dayMap.entries()).map(([day, amount]) => ({
    day: `Day ${day}`,
    Spent: amount,
  }));

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
          Daily Spending Velocity
        </h3>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
          Timeline of daily cash outflows throughout the current month
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0071E3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0071E3" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis dataKey="day" stroke="#8E8E93" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#8E8E93"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip
              formatter={(value: number) => [formatINR(value), 'Spent']}
              contentStyle={{
                backgroundColor: 'rgba(21, 21, 24, 0.95)',
                borderRadius: '10px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="Spent"
              stroke="#0071E3"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

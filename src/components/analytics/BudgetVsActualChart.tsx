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
import { calculateCategoryExpenses } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';

export const BudgetVsActualChart: React.FC = () => {
  const { budgets, transactions, activeMonth } = useFinance();
  const categoryExpenses = calculateCategoryExpenses(transactions, activeMonth);

  const data = budgets.map((b) => ({
    category: b.category,
    Budget: b.limit,
    Actual: categoryExpenses[b.category] || 0,
  }));

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
          Budget Limit vs. Actual Expenditure
        </h3>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
          Comparative variance analysis across assigned categories
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis dataKey="category" stroke="#8E8E93" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#8E8E93"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatINR(value), '']}
              contentStyle={{
                backgroundColor: 'rgba(21, 21, 24, 0.95)',
                borderRadius: '10px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Budget" fill="#0071E3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Actual" fill="#FF9500" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

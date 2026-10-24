import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { calculateCategoryExpenses } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';

const COLORS = [
  '#0071E3',
  '#34C759',
  '#FF9500',
  '#AF52DE',
  '#FF3B30',
  '#5856D6',
  '#5AC8FA',
  '#30B0C7',
  '#8E8E93',
];

export const CategoryPieChart: React.FC = () => {
  const { transactions, activeMonth } = useFinance();
  const categoryExpenses = calculateCategoryExpenses(transactions, activeMonth);

  const data = Object.entries(categoryExpenses)
    .map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length],
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, i) => s + i.value, 0);

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-[#151518] border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
          Spending Category Distribution
        </h3>
        <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
          Total Month Outflows: {formatINR(total)}
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
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
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

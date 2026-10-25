import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { calculateCategoryExpenses } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';

const CATEGORY_COLORS: Record<string, string> = {
  Bills: '#FF5E97', // Bubblegum Pink
  Food: '#10B981', // Sweet Mint
  Shopping: '#FB923C', // Peach Lace
  Transport: '#D946EF', // Bubblegum Orchid
  Entertainment: '#F43F5E', // Strawberry Rose
  Healthcare: '#A855F7', // Soft Lilac
  Education: '#38BDF8', // Cotton Candy Sky
  Investments: '#FF73B3', // Sweet Bubblegum Rose
  Freelance: '#10B981',
  Salary: '#FF5E97',
  Other: '#B59F91', // Warm Lace Taupe
};

export const SpendingBreakdown: React.FC = () => {
  const { transactions, activeMonth } = useFinance();
  const categoryExpenses = calculateCategoryExpenses(transactions, activeMonth);

  const data = Object.entries(categoryExpenses)
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#B59F91',
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalSpent = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-sm text-apple-gray-400">No expenses recorded for this month</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-apple-xl bg-white dark:bg-apple-darkCard border border-apple-gray-200/80 dark:border-apple-gray-800 shadow-apple-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white">
            Spending by Category
          </h3>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
            Total Outflows: {formatINR(totalSpent)}
          </p>
        </div>
      </div>

      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatINR(value), 'Spent']}
              contentStyle={{
                backgroundColor: 'rgba(21, 21, 24, 0.9)',
                borderRadius: '10px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Total Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-apple-gray-400 uppercase font-medium">Total</span>
          <span className="text-sm font-bold text-apple-gray-900 dark:text-white">
            {formatINR(totalSpent)}
          </span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800/80">
        {data.slice(0, 4).map((item) => {
          const pct = totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-apple-gray-600 dark:text-apple-gray-300 truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-apple-gray-500 font-medium ml-1 flex-shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

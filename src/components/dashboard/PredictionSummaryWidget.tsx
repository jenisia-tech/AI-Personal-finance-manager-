import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, TrendingUp, TrendingDown, Minus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { SpendingPredictionData } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

interface PredictionSummaryWidgetProps {
  onViewPrediction: () => void;
}

export const PredictionSummaryWidget: React.FC<PredictionSummaryWidgetProps> = ({ onViewPrediction }) => {
  const [data, setData] = useState<SpendingPredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.prediction.getSpendingPrediction()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => {
        console.error('Widget prediction fetch error:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-5 rounded-apple-xl bg-white/70 dark:bg-apple-darkCard/70 border border-apple-gray-200/80 dark:border-apple-gray-800 animate-pulse">
        <div className="h-4 w-32 bg-apple-gray-200 dark:bg-apple-gray-800 rounded mb-2" />
        <div className="h-6 w-24 bg-apple-gray-200 dark:bg-apple-gray-800 rounded" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-5 rounded-apple-xl bg-gradient-to-r from-bubblegum/5 via-purple-500/5 to-transparent border border-bubblegum/20 dark:border-bubblegum/30 shadow-apple-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-apple-md bg-bubblegum/10 text-bubblegum flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-apple-gray-900 dark:text-white">
              AI Spending Prediction (CO5 ML)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bubblegum/15 text-bubblegum">
              {data.hasEnoughData ? data.nextMonthLabel : `${data.monthsCount}/${data.requiredMonths} Months`}
            </span>
          </div>

          {data.hasEnoughData ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-apple-gray-500 dark:text-apple-gray-400">Projected:</span>
              <span className="font-bold text-apple-gray-900 dark:text-white">
                {formatINR(data.predictedAmount)}
              </span>
              <span className="text-apple-gray-400">•</span>
              <span className="flex items-center gap-1 font-semibold">
                {data.direction === 'increasing' && (
                  <span className="text-apple-red flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{formatINR(data.differenceRupees)}
                  </span>
                )}
                {data.direction === 'decreasing' && (
                  <span className="text-apple-green flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {formatINR(data.differenceRupees)}
                  </span>
                )}
                {data.direction === 'stable' && (
                  <span className="text-apple-gray-500 flex items-center gap-0.5">
                    <Minus className="w-3.5 h-3.5" />
                    Stable
                  </span>
                )}
              </span>

              {data.budgetComparison.hasBudget && (
                <>
                  <span className="text-apple-gray-400">•</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      data.budgetComparison.status === 'exceeded'
                        ? 'text-apple-red'
                        : 'text-apple-green'
                    }`}
                  >
                    {data.budgetComparison.status === 'exceeded' ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {data.budgetComparison.status === 'exceeded' ? 'Exceeds Budget' : 'Within Budget'}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
              Record expense transactions across at least {data.requiredMonths} calendar months to unlock Linear Regression forecasting.
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onViewPrediction}
        className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-apple-sm bg-bubblegum hover:bg-bubblegum-hover text-white text-xs font-semibold shadow-apple-pill transition"
      >
        <span>{data.hasEnoughData ? 'View ML Forecast' : 'Learn More'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

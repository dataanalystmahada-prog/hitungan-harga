import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badgeText?: string;
  iconBgColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badgeText,
  iconBgColor = 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400',
}) => {
  return (
    <Card hoverEffect className="p-3.5 sm:p-4 relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h4 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5 tracking-tight truncate">{value}</h4>
        </div>
        <div className={cn('p-2 rounded-xl flex-shrink-0 flex items-center justify-center', iconBgColor)}>
          {icon}
        </div>
      </div>

      {(trend || subtitle || badgeText) && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
          {trend ? (
            <div className="flex items-center gap-1.5 font-semibold">
              {trend.isPositive ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  {trend.value}
                </span>
              ) : (
                <span className="flex items-center text-rose-600 dark:text-rose-400">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {trend.value}
                </span>
              )}
              {subtitle && <span className="text-slate-400 font-normal">{subtitle}</span>}
            </div>
          ) : (
            subtitle && <span className="text-slate-400 font-normal">{subtitle}</span>
          )}

          {badgeText && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

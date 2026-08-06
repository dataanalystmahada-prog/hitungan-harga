import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = false,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-150',
        glass
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-800/80 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none',
        hoverEffect && 'hover:shadow-md hover:border-brand-500/30 dark:hover:border-brand-500/30 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

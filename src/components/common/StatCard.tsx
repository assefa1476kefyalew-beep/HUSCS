import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue',
  onClick
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/80 dark:bg-blue-950/50',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/80 dark:border-blue-900/60',
      glow: 'group-hover:ring-blue-500/20'
    },
    emerald: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/80 dark:border-emerald-900/60',
      glow: 'group-hover:ring-emerald-500/20'
    },
    amber: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/50',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200/80 dark:border-amber-900/60',
      glow: 'group-hover:ring-amber-500/20'
    },
    rose: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/50',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200/80 dark:border-rose-900/60',
      glow: 'group-hover:ring-rose-500/20'
    },
    indigo: {
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/50',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200/80 dark:border-indigo-900/60',
      glow: 'group-hover:ring-indigo-500/20'
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-800/80',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      glow: 'group-hover:ring-slate-500/20'
    }
  }[colorScheme];

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all duration-200 ${
        onClick 
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99]' 
          : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 font-feature-settings tracking-tight">
            {value}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${colorMap.bg} ${colorMap.text} border ${colorMap.border} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span className={`font-semibold shrink-0 ml-2 ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

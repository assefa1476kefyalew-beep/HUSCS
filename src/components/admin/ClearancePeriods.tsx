import React, { useState } from 'react';
import { ClearancePeriod } from '../../types';
import { Calendar, Plus, Check, Clock, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface ClearancePeriodsProps {
  periods: ClearancePeriod[];
  onTogglePeriod?: (periodId: string) => void;
}

export const ClearancePeriods: React.FC<ClearancePeriodsProps> = ({
  periods
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Academic Calendar
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Clearance Intake Windows & Deadlines
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage academic years, submission windows, and statutory clearance cutoff dates.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {periods.map(period => (
          <div
            key={period.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{period.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  period.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {period.isActive ? 'Active Window' : 'Closed'}
                </span>
              </div>
              <p className="text-xs text-slate-500">{period.description}</p>
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                Academic Year: {period.academicYearLabel} • Term: {period.semester}
              </p>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 shrink-0">
              <p>Starts: <strong className="text-slate-900 dark:text-white">{formatDate(period.startDate)}</strong></p>
              <p>Deadline: <strong className="text-rose-600 dark:text-rose-400">{formatDate(period.endDate)}</strong></p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

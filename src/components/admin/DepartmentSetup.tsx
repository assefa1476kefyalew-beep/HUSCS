import React, { useState } from 'react';
import { Department } from '../../types';
import { Building2, Plus, Check, Edit2, ShieldCheck, AlertCircle } from 'lucide-react';

interface DepartmentSetupProps {
  departments: Department[];
  onToggleActive?: (deptId: string) => void;
  onToggleMandatory?: (deptId: string) => void;
}

export const DepartmentSetup: React.FC<DepartmentSetupProps> = ({
  departments,
  onToggleActive,
  onToggleMandatory
}) => {
  const [localDepts, setLocalDepts] = useState(departments);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            System Configuration
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Clearance Departments & Sign-off Hierarchy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure clearance units, assign officers, and set mandatory sign-off thresholds.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localDepts.map((dept, index) => (
          <div
            key={dept.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-900 text-amber-400 font-bold text-xs font-certificate flex items-center justify-center">
                    {dept.code}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{dept.name}</h3>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{dept.category}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  dept.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {dept.active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                {dept.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className={`font-semibold ${dept.isMandatory ? 'text-rose-600' : 'text-slate-500'}`}>
                {dept.isMandatory ? '● Mandatory Sign-off' : '○ Optional'}
              </span>
              <span className="text-slate-400 text-[11px]">Sequence Order #{dept.order}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

import React from 'react';
import { Department, ClearanceRequest } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { BarChart3, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface OfficerReportsProps {
  department: Department;
  requests: ClearanceRequest[];
}

export const OfficerReports: React.FC<OfficerReportsProps> = ({
  department,
  requests
}) => {
  const deptItems = requests.map(r => r.items.find(i => i.departmentId === department.id || i.departmentCode === department.code)).filter(Boolean);

  const cleared = deptItems.filter(i => i?.status === 'CLEARED').length;
  const pending = deptItems.filter(i => i?.status === 'PENDING' || i?.status === 'UNDER_REVIEW' || i?.status === 'NEEDS_DOCUMENT').length;
  const rejected = deptItems.filter(i => i?.status === 'REJECTED').length;

  const pieData = [
    { name: 'Cleared / Approved', value: cleared, color: '#10b981' },
    { name: 'Pending Review', value: pending, color: '#f59e0b' },
    { name: 'Rejected / Flagged', value: rejected, color: '#ef4444' }
  ];

  // Distribution by College
  const collegeMap: Record<string, number> = {};
  requests.forEach(r => {
    collegeMap[r.studentCollege] = (collegeMap[r.studentCollege] || 0) + 1;
  });
  const collegeData = Object.entries(collegeMap).map(([college, count]) => ({
    name: college.replace('College of ', ''),
    count
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Department Analytics
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          {department.name} Performance & Metrics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review clearance turnaround metrics, rejection distribution, and candidate intake statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Clearance Decision Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Candidates by College */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Clearance Volume by College
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collegeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

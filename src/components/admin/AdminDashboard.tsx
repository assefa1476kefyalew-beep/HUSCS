import React from 'react';
import { 
  ClearanceRequest, ClearanceCertificate, Department, 
  ClearancePeriod, Student 
} from '../../types';
import { 
  CheckCircle2, Clock, XCircle, Award, 
  Users, Building2, TrendingUp, BarChart3, 
  Sparkles, ArrowRight, ShieldCheck, FileCheck 
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { formatDate } from '../../utils/helpers';

interface AdminDashboardProps {
  requests: ClearanceRequest[];
  certificates: ClearanceCertificate[];
  departments: Department[];
  students: Student[];
  onNavigateTab: (tab: string) => void;
  onOpenCertificateModal: (certificate: ClearanceCertificate) => void;
  onIssueCertificate: (requestId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  requests,
  certificates,
  departments,
  students,
  onNavigateTab,
  onOpenCertificateModal,
  onIssueCertificate
}) => {
  const totalRequests = requests.length;
  const issuedCount = certificates.length;
  const readyForCertCount = requests.filter(r => r.overallStatus === 'APPROVED').length;
  const inProgressCount = requests.filter(r => r.overallStatus === 'PARTIALLY_CLEARED' || r.overallStatus === 'PENDING').length;
  const rejectedCount = requests.filter(r => r.overallStatus === 'REJECTED').length;

  // Pie chart data
  const pieData = [
    { name: 'Certificates Issued', value: issuedCount, color: '#10b981' },
    { name: 'Ready for Issuance', value: readyForCertCount, color: '#3b82f6' },
    { name: 'In Progress / Review', value: inProgressCount, color: '#f59e0b' },
    { name: 'Obligations / Rejected', value: rejectedCount, color: '#ef4444' }
  ];

  // Department Clearance Rates
  const deptProgressData = departments.map(d => {
    let cleared = 0;
    requests.forEach(r => {
      const item = r.items.find(i => i.departmentId === d.id);
      if (item?.status === 'CLEARED') cleared++;
    });
    return {
      name: d.code,
      fullName: d.name,
      cleared,
      total: requests.length
    };
  });

  // Ready for certificate candidates
  const readyRequests = requests.filter(r => r.overallStatus === 'APPROVED');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 border border-blue-900/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-blue-950 font-bold text-xs">
                Registrar & Central Admin
              </span>
              <span className="text-xs text-slate-300">Hawassa University CMS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Institutional Clearance Control Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Live monitoring of multi-departmental clearance throughput, certificate issuance, and candidate verification.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('admin-clearances')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Manage All Clearances
            </button>
            <button
              onClick={() => onNavigateTab('admin-certificates')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              Issued Certificates ({issuedCount})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={totalRequests}
          subtitle="All academic colleges"
          icon={Users}
          colorScheme="blue"
          onClick={() => onNavigateTab('admin-clearances')}
        />
        <StatCard
          title="Ready for Certificate"
          value={readyForCertCount}
          subtitle="All 8 departments cleared"
          icon={Sparkles}
          colorScheme={readyForCertCount > 0 ? 'amber' : 'slate'}
          onClick={() => onNavigateTab('admin-clearances')}
        />
        <StatCard
          title="Certificates Issued"
          value={issuedCount}
          subtitle="Publicly verified credentials"
          icon={Award}
          colorScheme="emerald"
          onClick={() => onNavigateTab('admin-certificates')}
        />
        <StatCard
          title="Flagged Obligations"
          value={rejectedCount}
          subtitle="Awaiting student payment/remedy"
          icon={XCircle}
          colorScheme={rejectedCount > 0 ? 'rose' : 'slate'}
          onClick={() => onNavigateTab('admin-clearances')}
        />
      </div>

      {/* Pending Certificate Issuance Action Table (if any are ready) */}
      {readyRequests.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Candidates Ready for Certificate Issuance ({readyRequests.length})
              </h3>
            </div>
            <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
              Registrar Sign-off Required
            </span>
          </div>

          <div className="space-y-2">
            {readyRequests.map(req => (
              <div
                key={req.id}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{req.studentName}</p>
                    <span className="text-xs font-mono-code text-slate-400">({req.studentStudentId})</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      100% Cleared
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {req.studentDepartment} • {req.studentCollege} • Purpose: {req.reason}
                  </p>
                </div>

                <button
                  id={`btn-issue-cert-${req.id}`}
                  onClick={() => onIssueCertificate(req.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Award className="w-4 h-4" />
                  Sign & Issue Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Visual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Clearance Pipeline Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Department Clearance Approval Volume
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
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
                <Bar dataKey="cleared" name="Approvals" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clearance Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Institutional Clearance Progress Overview
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

      </div>

    </div>
  );
};

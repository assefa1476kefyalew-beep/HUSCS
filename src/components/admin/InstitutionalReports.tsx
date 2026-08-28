import React, { useState } from 'react';
import { ClearanceRequest, ClearanceCertificate, Department, Student } from '../../types';
import { 
  BarChart3, TrendingUp, Award, Clock, CheckCircle2, 
  XCircle, AlertTriangle, Download, Printer, Filter, 
  Building2, Users, FileCheck, Layers, Calendar, DollarSign
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface InstitutionalReportsProps {
  requests: ClearanceRequest[];
  certificates: ClearanceCertificate[];
  departments: Department[];
  students: Student[];
  onShowToast?: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
}

export const InstitutionalReports: React.FC<InstitutionalReportsProps> = ({
  requests,
  certificates,
  departments,
  students,
  onShowToast
}) => {
  const [selectedCollege, setSelectedCollege] = useState<string>('ALL');
  const [selectedReason, setSelectedReason] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');

  // Colleges list
  const collegesList = Array.from(new Set(students.map(s => s.college))).filter(Boolean);

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (selectedCollege !== 'ALL' && req.studentCollege !== selectedCollege) return false;
    if (selectedReason !== 'ALL' && req.reason !== selectedReason) return false;
    return true;
  });

  // Calculate statistics
  const totalRequests = filteredRequests.length;
  const completedRequests = filteredRequests.filter(r => r.overallStatus === 'CERTIFICATE_ISSUED').length;
  const approvedRequests = filteredRequests.filter(r => r.overallStatus === 'APPROVED').length;
  const inProgressRequests = filteredRequests.filter(r => r.overallStatus === 'UNDER_REVIEW' || r.overallStatus === 'PARTIALLY_CLEARED').length;
  const rejectedRequests = filteredRequests.filter(r => r.overallStatus === 'REJECTED').length;
  const completionRate = totalRequests > 0 ? Math.round(((completedRequests + approvedRequests) / totalRequests) * 100) : 0;

  // Department Bottleneck and Throughput Breakdown
  const departmentMetrics = departments.map(dept => {
    let totalItems = 0;
    let clearedItems = 0;
    let rejectedItems = 0;
    let pendingItems = 0;
    let totalFines = 0;

    filteredRequests.forEach(req => {
      const item = req.items.find(i => i.departmentId === dept.id || i.departmentCode === dept.code);
      if (item) {
        totalItems++;
        if (item.status === 'CLEARED') clearedItems++;
        else if (item.status === 'REJECTED') rejectedItems++;
        else pendingItems++;

        if (item.outstandingBalance) {
          totalFines += item.outstandingBalance;
        }
      }
    });

    const clearanceRate = totalItems > 0 ? Math.round((clearedItems / totalItems) * 100) : 0;

    return {
      department: dept,
      totalItems,
      clearedItems,
      rejectedItems,
      pendingItems,
      clearanceRate,
      totalFines
    };
  });

  // Reason Breakdown
  const reasonBreakdown = ['GRADUATION', 'WITHDRAWAL', 'TRANSFER', 'END_OF_YEAR'].map(reason => {
    const count = filteredRequests.filter(r => r.reasonType === reason).length;
    const completed = filteredRequests.filter(r => r.reasonType === reason && r.overallStatus === 'CERTIFICATE_ISSUED').length;
    return {
      reason,
      count,
      percentage: totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0,
      completed
    };
  });

  // College Breakdown
  const collegeBreakdown = collegesList.map(college => {
    const colRequests = filteredRequests.filter(r => r.studentCollege === college);
    const colCompleted = colRequests.filter(r => r.overallStatus === 'CERTIFICATE_ISSUED').length;
    return {
      college,
      total: colRequests.length,
      completed: colCompleted,
      rate: colRequests.length > 0 ? Math.round((colCompleted / colRequests.length) * 100) : 0
    };
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Request ID', 'Student ID', 'Student Name', 'College', 'Department',
      'Reason', 'Status', 'Progress %', 'Submission Date', 'Certificate Issued'
    ];
    const rows = filteredRequests.map(r => [
      r.id,
      r.studentStudentId,
      `"${r.studentName}"`,
      `"${r.studentCollege}"`,
      `"${r.studentDepartment}"`,
      r.reasonType,
      r.overallStatus,
      `${r.progressPercentage}%`,
      r.submissionDate,
      r.certificateId ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hawassa_clearance_institutional_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Export Generated', 'Institutional clearance data exported to CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              Institutional Intelligence & Analytics
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Academic Year 2023/24 (2016 E.C.)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Hawassa University Clearance & Graduation Throughput Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cross-department sign-off velocity, hold bottlenecks, college completion rates, and official clearance registry audit.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* College Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">College:</span>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Colleges ({collegesList.length})</option>
              {collegesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Reason Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Reason:</span>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Clearance Types</option>
              <option value="GRADUATION">Graduation Clearance</option>
              <option value="WITHDRAWAL">Withdrawal Clearance</option>
              <option value="TRANSFER">University Transfer</option>
              <option value="END_OF_YEAR">End of Year Dormitory</option>
            </select>
          </div>

        </div>

        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Showing <span className="text-blue-600 dark:text-blue-400">{filteredRequests.length}</span> clearance records
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Intake */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Clearance Intake</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalRequests}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">100%</span> active students tracked
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Certificates Issued</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {completedRequests}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-bold text-amber-600">{completionRate}%</span> clearance completion rate
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Under Active Review</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {inProgressRequests}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Passing through 8 clearance units
          </div>
        </div>

        {/* Rejected / Holds */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Holds & Fines Pending</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {rejectedRequests}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Outstanding items or penalty fees
          </div>
        </div>

      </div>

      {/* 8 Department Sign-Off & Velocity Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Department Sign-off Matrix & Bottleneck Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live breakdown of items approved, rejected, and pending across each of the 8 clearance offices.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
            8 Mandatory Units
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {departmentMetrics.map(({ department, totalItems, clearedItems, rejectedItems, pendingItems, clearanceRate, totalFines }) => (
            <div
              key={department.id}
              className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-900 text-amber-400 font-bold text-[11px] flex items-center justify-center font-certificate">
                      {department.code}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {department.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {clearanceRate}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                  <div style={{ width: `${clearanceRate}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${totalItems > 0 ? (rejectedItems / totalItems) * 100 : 0}%` }} className="bg-rose-500 h-full" />
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] text-center mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block">Cleared</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{clearedItems}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pending</span>
                    <strong className="text-blue-600 dark:text-blue-400">{pendingItems}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Holds</span>
                    <strong className="text-rose-600 dark:text-rose-400">{rejectedItems}</strong>
                  </div>
                </div>
              </div>

              {totalFines > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Unsettled Fines:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{totalFines} ETB</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* College Comparison & Reason Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* College Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Clearance Throughput by College
            </h3>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {collegeBreakdown.map(col => (
              <div key={col.college} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {col.college}
                  </span>
                  <span className="text-slate-500 shrink-0 font-medium">
                    {col.completed}/{col.total} Cleared ({col.rate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${col.rate}%` }}
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reason Type Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Clearance Intake by Category
            </h3>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {reasonBreakdown.map(r => (
              <div key={r.reason} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {r.reason.replace(/_/g, ' ')}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {r.completed} official certificates generated
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {r.count} students
                  </span>
                  <span className="text-[10px] block text-blue-600 dark:text-blue-400 font-bold">
                    {r.percentage}% of intake
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

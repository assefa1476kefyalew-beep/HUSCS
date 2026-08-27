import React from 'react';
import { 
  CheckCircle2, Clock, XCircle, FileText, 
  Award, AlertTriangle, ArrowRight, ShieldCheck, 
  FolderOpen, Calendar, BookOpen, GraduationCap,
  Sparkles, Check, ChevronRight, User, ExternalLink
} from 'lucide-react';
import { 
  Student, ClearanceRequest, NotificationItem, 
  ClearanceCertificate, ClearancePeriod 
} from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, timeAgo } from '../../utils/helpers';

interface StudentDashboardProps {
  student: Student;
  activeRequest?: ClearanceRequest;
  certificate?: ClearanceCertificate;
  activePeriods: ClearancePeriod[];
  notifications: NotificationItem[];
  onNavigateTab: (tab: string) => void;
  onStartClearance: () => void;
  onOpenCertificate: (certificateId: string) => void;
  onOpenDepartmentDetail?: (itemId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  activeRequest,
  certificate,
  activePeriods,
  notifications,
  onNavigateTab,
  onStartClearance,
  onOpenCertificate,
  onOpenDepartmentDetail
}) => {
  const totalItems = activeRequest?.items.length || 0;
  const clearedCount = activeRequest?.items.filter(i => i.status === 'CLEARED').length || 0;
  const rejectedCount = activeRequest?.items.filter(i => i.status === 'REJECTED').length || 0;
  const pendingCount = activeRequest?.items.filter(i => i.status === 'PENDING' || i.status === 'UNDER_REVIEW' || i.status === 'NEEDS_DOCUMENT').length || 0;

  const hasCertificate = !!certificate || activeRequest?.overallStatus === 'CERTIFICATE_ISSUED';
  const progressPercent = activeRequest?.progressPercentage || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Welcome & Student Bio Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-900/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
              alt={student.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-amber-400/50 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-blue-950 font-bold text-xs">
                  {student.program} STUDENT
                </span>
                <span className="text-xs text-slate-300 font-mono-code">
                  ID: {student.studentId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Welcome back, {student.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {student.department} • {student.college}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                <span>📍 {student.campus}</span>
                {student.dormitoryNumber && <span>🏠 {student.blockNumber}, {student.dormitoryNumber}</span>}
                <span>📅 Class of {student.expectedGraduationYear}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button on Hero */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {!activeRequest ? (
              <button
                id="btn-start-clearance-hero"
                onClick={onStartClearance}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Start Clearance Application
              </button>
            ) : hasCertificate ? (
              <button
                id="btn-download-cert-hero"
                onClick={() => onNavigateTab('student-certificate')}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                View & Download Certificate
              </button>
            ) : (
              <button
                id="btn-view-tracker-hero"
                onClick={() => onNavigateTab('student-clearance')}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Track Clearance Progress
              </button>
            )}
          </div>
        </div>

        {/* Subtle decorative background watermarks */}
        <div className="absolute -right-12 -bottom-12 opacity-10 text-white select-none pointer-events-none font-certificate font-extrabold text-9xl">
          HU
        </div>
      </div>

      {/* Action Required Banner if rejected items exist */}
      {rejectedCount > 0 && activeRequest && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg text-rose-600 dark:text-rose-300 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Department Clearance Action Required ({rejectedCount} {rejectedCount === 1 ? 'Department' : 'Departments'})
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
              One or more departments have flagged outstanding obligations (e.g. unreturned book, property inspection or document needed). Please review the instructions and respond promptly.
            </p>
            <button
              onClick={() => onNavigateTab('student-clearance')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Resolve Obligations <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Status"
          value={activeRequest ? activeRequest.overallStatus.replace(/_/g, ' ') : 'Not Started'}
          subtitle={activeRequest ? `${activeRequest.reason} Clearance` : 'Apply when eligible'}
          icon={activeRequest?.overallStatus === 'CERTIFICATE_ISSUED' ? Award : ShieldCheck}
          colorScheme={
            activeRequest?.overallStatus === 'CERTIFICATE_ISSUED' ? 'emerald' :
            activeRequest?.overallStatus === 'APPROVED' ? 'emerald' :
            activeRequest?.overallStatus === 'REJECTED' ? 'rose' :
            activeRequest?.overallStatus === 'PARTIALLY_CLEARED' ? 'indigo' : 'blue'
          }
          onClick={() => onNavigateTab('student-clearance')}
        />
        <StatCard
          title="Departments Cleared"
          value={activeRequest ? `${clearedCount} / ${totalItems}` : '0'}
          subtitle={activeRequest ? `${progressPercent}% Completed` : '0 of 8 cleared'}
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={() => onNavigateTab('student-clearance')}
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          subtitle="Department queues active"
          icon={Clock}
          colorScheme="amber"
          onClick={() => onNavigateTab('student-clearance')}
        />
        <StatCard
          title="Issues / Rejections"
          value={rejectedCount}
          subtitle={rejectedCount === 0 ? 'Zero outstanding flags' : 'Requires student remedy'}
          icon={XCircle}
          colorScheme={rejectedCount > 0 ? 'rose' : 'slate'}
          onClick={() => onNavigateTab('student-clearance')}
        />
      </div>

      {/* Progress & Department Breakdown Section */}
      {activeRequest ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Progress Tracker (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Clearance Progress Pipeline
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Academic Year: {activeRequest.academicYearLabel} • {activeRequest.clearancePeriodTitle}
                </p>
              </div>
              <StatusBadge status={activeRequest.overallStatus} type="overall" size="md" />
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Total Verification Completed</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent === 100 ? 'bg-emerald-500' :
                    progressPercent > 50 ? 'bg-blue-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex justify-between">
                <span>{clearedCount} of {totalItems} mandatory departments approved</span>
                <span>{totalItems - clearedCount} remaining</span>
              </p>
            </div>

            {/* Department Cards Grid */}
            <div className="mt-6 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Department Clearance Checklist
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeRequest.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigateTab('student-clearance')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      item.status === 'CLEARED'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50'
                        : item.status === 'REJECTED'
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50'
                        : item.status === 'UNDER_REVIEW'
                        ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/60 hover:bg-sky-50'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.departmentName}
                        </span>
                        {item.isMandatory && (
                          <span className="text-[10px] text-rose-500 font-semibold shrink-0">*</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.reviewedByOfficerName ? `Approved by ${item.reviewedByOfficerName}` : 'Pending officer evaluation'}
                      </p>
                      {item.rejectionReason && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1 truncate">
                          ⚠️ {item.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={item.status} type="item" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom button */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => onNavigateTab('student-clearance')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                Open detailed clearance tracker <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Next Steps & Quick Activity (1 col) */}
          <div className="space-y-6">
            
            {/* Certificate Card or Readiness Card */}
            {hasCertificate ? (
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-600/40">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300 ring-1 ring-emerald-500/40">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                      Graduation Clearance Complete
                    </span>
                    <h3 className="font-bold text-base text-white">
                      Official Certificate Issued
                    </h3>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white/10 rounded-xl text-xs space-y-1">
                  <p className="text-slate-300 font-mono-code">
                    Cert #: {certificate?.certificateNumber || 'HU-CLR-2026-000123'}
                  </p>
                  <p className="text-slate-300">
                    Issued Date: {formatDate(certificate?.issueDate || new Date().toISOString())}
                  </p>
                  <p className="text-emerald-300 font-semibold flex items-center gap-1 mt-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Publicly Verifiable via QR Code
                  </p>
                </div>

                <button
                  onClick={() => onNavigateTab('student-certificate')}
                  className="mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  View & Download Certificate
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Clearance Guidelines
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>All mandatory 8 university departments must approve your request.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>Upload any requested supporting forms (Cost Sharing agreement, Thesis approval).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>Once fully cleared, the Registrar generates your official tamper-proof certificate with QR code.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Recent Notifications Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Recent Updates
                </h3>
                <button
                  onClick={() => onNavigateTab('student-notifications')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start gap-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Empty State: No active clearance request */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            No Active Clearance Request Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
            You do not currently have an active clearance submission for this academic term. Click below to begin the official clearance application workflow.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-start-clearance-empty"
              onClick={onStartClearance}
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Begin Clearance Application
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

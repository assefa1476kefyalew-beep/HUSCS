import React, { useState } from 'react';
import { 
  User, Department, ClearanceRequest, ClearanceItem, 
  ClearanceRequirement, SupportingDocument, Student 
} from '../../types';
import { 
  CheckCircle2, Clock, XCircle, Search, Filter, 
  FileText, Download, Building2, User as UserIcon, 
  ArrowUpDown, Check, RefreshCw 
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { ClearanceReviewModal } from './ClearanceReviewModal';
import { formatDate, formatDateTime, exportToCSV } from '../../utils/helpers';

interface OfficerDashboardProps {
  currentUser: User;
  department: Department;
  clearanceRequests: ClearanceRequest[];
  students: Student[];
  requirements: ClearanceRequirement[];
  documents: SupportingDocument[];
  onApproveItem: (requestId: string, itemId: string, comment?: string) => void;
  onRejectItem: (requestId: string, itemId: string, reason: string, remedy: string, balance?: number, items?: string[]) => void;
  onRequestDocItem: (requestId: string, itemId: string, note: string) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  currentUser,
  department,
  clearanceRequests,
  students,
  requirements,
  documents,
  onApproveItem,
  onRejectItem,
  onRequestDocItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'CLEARED' | 'REJECTED'>('ALL');
  const [selectedReviewTarget, setSelectedReviewTarget] = useState<{ request: ClearanceRequest; item: ClearanceItem } | null>(null);

  // Filter requests that contain this department's item
  const departmentEntries = clearanceRequests.map(req => {
    const item = req.items.find(i => i.departmentId === department.id || i.departmentCode === department.code);
    return { request: req, item };
  }).filter((entry): entry is { request: ClearanceRequest; item: ClearanceItem } => entry.item !== undefined);

  // Counts
  const totalAssigned = departmentEntries.length;
  const pendingCount = departmentEntries.filter(e => e.item.status === 'PENDING' || e.item.status === 'UNDER_REVIEW' || e.item.status === 'NEEDS_DOCUMENT').length;
  const clearedCount = departmentEntries.filter(e => e.item.status === 'CLEARED').length;
  const rejectedCount = departmentEntries.filter(e => e.item.status === 'REJECTED').length;

  // Filtered list
  const filteredEntries = departmentEntries.filter(({ request, item }) => {
    const matchesSearch = 
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentStudentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentCollege.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'PENDING' ? (item.status === 'PENDING' || item.status === 'UNDER_REVIEW' || item.status === 'NEEDS_DOCUMENT') :
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const deptRequirement = requirements.find(r => r.departmentId === department.id);

  const handleExportCSV = () => {
    const rows = departmentEntries.map(({ request, item }) => ({
      'Student ID': request.studentStudentId,
      'Full Name': request.studentName,
      'College': request.studentCollege,
      'Department': request.studentDepartment,
      'Clearance Purpose': request.reason,
      'Department Status': item.status,
      'Reviewed By': item.reviewedByOfficerName || '',
      'Reviewed Date': item.reviewedAt ? formatDate(item.reviewedAt) : '',
      'Rejection Reason': item.rejectionReason || '',
      'Assessed Fee (ETB)': item.outstandingBalance || 0
    }));
    exportToCSV(`Hawassa_Univ_${department.code}_Clearance_Queue.csv`, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Officer Department Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-400 font-bold text-lg font-certificate flex items-center justify-center shadow-md">
            {department.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Department Clearance Workspace
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {department.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {department.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Logged in officer: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.fullName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Queue CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending in Queue"
          value={pendingCount}
          subtitle="Awaiting officer evaluation"
          icon={Clock}
          colorScheme={pendingCount > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Approved / Cleared"
          value={clearedCount}
          subtitle={`${Math.round((clearedCount / (totalAssigned || 1)) * 100)}% clearance rate`}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Flags / Rejections"
          value={rejectedCount}
          subtitle="Obligations awaiting resolution"
          icon={XCircle}
          colorScheme={rejectedCount > 0 ? 'rose' : 'slate'}
        />
        <StatCard
          title="Total Assigned"
          value={totalAssigned}
          subtitle="Current clearance intake"
          icon={FileText}
          colorScheme="blue"
        />
      </div>

      {/* Queue Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Table Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID (e.g. HU/1476), department..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'PENDING', 'CLEARED', 'REJECTED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-blue-900 text-white shadow-xs dark:bg-blue-700'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {filter === 'ALL' ? 'All Requests' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">College & Dept</th>
                <th className="px-4 py-3.5">Purpose</th>
                <th className="px-4 py-3.5">Submission</th>
                <th className="px-4 py-3.5">Department Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No clearance requests found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(({ request, item }) => (
                  <tr
                    key={request.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {request.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {request.studentName}
                          </p>
                          <p className="font-mono-code text-[11px] text-slate-400 mt-0.5">
                            {request.studentStudentId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                      <p className="font-medium">{request.studentDepartment}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{request.studentCollege}</p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        {request.reason}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(request.submissionDate)}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} type="item" size="sm" />
                      {item.rejectionReason && (
                        <p className="text-[10px] text-rose-600 font-medium mt-1 truncate max-w-xs">
                          {item.rejectionReason}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        id={`btn-review-${item.id}`}
                        onClick={() => setSelectedReviewTarget({ request, item })}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                          item.status === 'CLEARED'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-blue-900 hover:bg-blue-800 text-white'
                        }`}
                      >
                        {item.status === 'CLEARED' ? 'View Decision' : 'Inspect & Decide'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal Dialog */}
      {selectedReviewTarget && (
        <ClearanceReviewModal
          request={selectedReviewTarget.request}
          item={selectedReviewTarget.item}
          student={students.find(s => s.id === selectedReviewTarget.request.studentId)}
          department={department}
          requirement={deptRequirement}
          documents={documents}
          onClose={() => setSelectedReviewTarget(null)}
          onApprove={onApproveItem}
          onReject={onRejectItem}
          onRequestDoc={onRequestDocItem}
        />
      )}

    </div>
  );
};

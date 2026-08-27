import React, { useState } from 'react';
import { 
  ClearanceRequest, ClearanceCertificate, Department, 
  Student, ClearancePeriod 
} from '../../types';
import { 
  Search, Filter, Download, Award, Eye, 
  CheckCircle2, Clock, XCircle, Building2, Check, X 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatDateTime, exportToCSV } from '../../utils/helpers';

interface ClearanceManagementProps {
  requests: ClearanceRequest[];
  certificates: ClearanceCertificate[];
  departments: Department[];
  students: Student[];
  onIssueCertificate: (requestId: string) => void;
  onOpenCertificateModal: (certificate: ClearanceCertificate) => void;
}

export const ClearanceManagement: React.FC<ClearanceManagementProps> = ({
  requests,
  certificates,
  departments,
  students,
  onIssueCertificate,
  onOpenCertificateModal
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRequestForInspect, setSelectedRequestForInspect] = useState<ClearanceRequest | null>(null);

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.studentName.toLowerCase().includes(search.toLowerCase()) ||
      req.studentStudentId.toLowerCase().includes(search.toLowerCase()) ||
      req.studentDepartment.toLowerCase().includes(search.toLowerCase()) ||
      req.studentCollege.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true :
      req.overallStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const rows = requests.map(r => ({
      'Student ID': r.studentStudentId,
      'Full Name': r.studentName,
      'College': r.studentCollege,
      'Department': r.studentDepartment,
      'Reason': r.reason,
      'Progress': `${r.progressPercentage}%`,
      'Overall Status': r.overallStatus,
      'Submission Date': formatDate(r.submissionDate)
    }));
    exportToCSV('Hawassa_University_Master_Clearances.csv', rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Registrar Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Central Clearance Operations Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit multi-departmental clearance items, handle candidate escalations, and issue official graduation certificates.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
        >
          <Download className="w-4 h-4" />
          Export Master CSV
        </button>
      </div>

      {/* Table & Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, ID (e.g. HU/1476), department..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Submissions' },
              { id: 'APPROVED', label: 'Ready for Cert' },
              { id: 'CERTIFICATE_ISSUED', label: 'Issued' },
              { id: 'PARTIALLY_CLEARED', label: 'In Progress' },
              { id: 'REJECTED', label: 'Flagged' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  statusFilter === f.id
                    ? 'bg-blue-900 text-white dark:bg-blue-700'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Department & College</th>
                <th className="px-4 py-3.5">Purpose</th>
                <th className="px-4 py-3.5">Progress Matrix</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No clearance submissions found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const cert = certificates.find(c => c.clearanceRequestId === req.id);
                  const isReady = req.overallStatus === 'APPROVED';
                  const isIssued = req.overallStatus === 'CERTIFICATE_ISSUED';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {req.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{req.studentName}</p>
                            <p className="font-mono-code text-[11px] text-slate-400 mt-0.5">{req.studentStudentId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <p className="font-medium">{req.studentDepartment}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{req.studentCollege}</p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-blue-700 dark:text-blue-400">{req.reason}</span>
                      </td>

                      {/* Mini Department Dot Matrix */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {req.items.map(item => (
                            <span
                              key={item.id}
                              title={`${item.departmentCode}: ${item.status}`}
                              className={`w-2.5 h-2.5 rounded-full ${
                                item.status === 'CLEARED' ? 'bg-emerald-500' :
                                item.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-400'
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 ml-1.5">
                            {req.progressPercentage}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={req.overallStatus} type="overall" size="sm" />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequestForInspect(req)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                          >
                            Inspect
                          </button>

                          {isReady && (
                            <button
                              id={`btn-manage-issue-${req.id}`}
                              onClick={() => onIssueCertificate(req.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" /> Issue Cert
                            </button>
                          )}

                          {isIssued && cert && (
                            <button
                              id={`btn-view-cert-${req.id}`}
                              onClick={() => onOpenCertificateModal(cert)}
                              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-300" /> Certificate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedRequestForInspect && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Clearance Audit Dossier: {selectedRequestForInspect.studentName}
                </h3>
                <p className="text-xs text-slate-500 font-mono-code">
                  ID: {selectedRequestForInspect.studentStudentId} • {selectedRequestForInspect.studentDepartment}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestForInspect(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Departmental Clearances Status
              </h4>
              <div className="space-y-2">
                {selectedRequestForInspect.items.map(item => (
                  <div key={item.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{item.departmentName} ({item.departmentCode})</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.status === 'CLEARED' && item.reviewedByOfficerName
                          ? `Cleared by ${item.reviewedByOfficerName} on ${formatDate(item.reviewedAt)}`
                          : item.rejectionReason
                          ? `Flagged: ${item.rejectionReason}`
                          : 'Pending Officer Review'}
                      </p>
                    </div>
                    <StatusBadge status={item.status} type="item" size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedRequestForInspect(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

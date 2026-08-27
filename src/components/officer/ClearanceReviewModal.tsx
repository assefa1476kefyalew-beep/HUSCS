import React, { useState } from 'react';
import { 
  ClearanceRequest, ClearanceItem, Department, 
  ClearanceRequirement, SupportingDocument, Student 
} from '../../types';
import { 
  CheckCircle2, XCircle, FileUp, AlertTriangle, 
  FileText, User, ShieldCheck, Download, Check, 
  X, Clock, Building2, ExternalLink 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/helpers';

interface ClearanceReviewModalProps {
  request: ClearanceRequest;
  item: ClearanceItem;
  student?: Student;
  department: Department;
  requirement?: ClearanceRequirement;
  documents: SupportingDocument[];
  onClose: () => void;
  onApprove: (requestId: string, itemId: string, comment?: string) => void;
  onReject: (requestId: string, itemId: string, reason: string, remedy: string, balance?: number, itemsList?: string[]) => void;
  onRequestDoc: (requestId: string, itemId: string, note: string) => void;
}

export const ClearanceReviewModal: React.FC<ClearanceReviewModalProps> = ({
  request,
  item,
  student,
  department,
  requirement,
  documents,
  onClose,
  onApprove,
  onReject,
  onRequestDoc
}) => {
  const [activeAction, setActiveAction] = useState<'NONE' | 'APPROVE' | 'REJECT' | 'REQUEST_DOC'>('NONE');
  
  // Approve State
  const [approveComment, setApproveComment] = useState('All departmental obligations verified and cleared.');
  
  // Reject State
  const [rejectReason, setRejectReason] = useState('');
  const [remedyInstructions, setRemedyInstructions] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState<number | ''>('');
  const [unreturnedItem, setUnreturnedItem] = useState('');

  // Request Doc State
  const [docRequestNote, setDocRequestNote] = useState('');

  const attachedDocs = documents.filter(d => item.supportingDocumentIds.includes(d.id));

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove(request.id, item.id, approveComment);
    onClose();
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Rejection reason is required.');
      return;
    }
    const balanceNum = typeof outstandingBalance === 'number' ? outstandingBalance : undefined;
    const itemsArray = unreturnedItem.trim() ? [unreturnedItem.trim()] : undefined;
    onReject(request.id, item.id, rejectReason, remedyInstructions, balanceNum, itemsArray);
    onClose();
  };

  const handleRequestDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docRequestNote.trim()) return;
    onRequestDoc(request.id, item.id, docRequestNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-900 text-amber-400 font-bold text-xs font-certificate shadow-xs">
              {department.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {department.name} Clearance Review
                </h3>
                <StatusBadge status={item.status} type="item" size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Student: {request.studentName} ({request.studentStudentId})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          
          {/* Student Dossier Overview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Student ID</span>
              <p className="font-mono-code font-bold text-slate-900 dark:text-white">{request.studentStudentId}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{request.studentDepartment}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">College</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{request.studentCollege}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Program</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{request.studentProgram}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Purpose</span>
              <p className="font-bold text-blue-700 dark:text-blue-300">{request.reason}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Submission Date</span>
              <p className="font-medium text-slate-700 dark:text-slate-300">{formatDate(request.submissionDate)}</p>
            </div>
          </div>

          {/* Department Standard Obligations Checklist */}
          {requirement?.checklistItems && requirement.checklistItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Department Verification Checklist Requirements
              </h4>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                {requirement.checklistItems.map((chk, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Supporting Documents */}
          {attachedDocs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Student Uploaded Supporting Documents
              </h4>
              <div className="space-y-2">
                {attachedDocs.map(doc => (
                  <div key={doc.id} className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{doc.title}</p>
                        <p className="text-[10px] text-slate-500">{doc.fileName} • {formatFileSize(doc.fileSize)} • Uploaded {formatDateTime(doc.uploadedAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Reviewing ${doc.fileName}... (Simulated document preview)`)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Rejection or Existing Decision History */}
          {item.status === 'REJECTED' && item.rejectionReason && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
              <p className="font-bold">Current Flagged Obligation:</p>
              <p className="mt-1">"{item.rejectionReason}"</p>
              {item.outstandingBalance && (
                <p className="mt-1 font-bold">Outstanding Fee: {item.outstandingBalance} ETB</p>
              )}
            </div>
          )}

          {/* ACTION FORMS */}
          {activeAction === 'APPROVE' && (
            <form onSubmit={handleApproveSubmit} className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Department Clearance Approval</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-1">
                  Approval Endorsement Notes
                </label>
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction('NONE')}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Grant Clearance Approval
                </button>
              </div>
            </form>
          )}

          {activeAction === 'REJECT' && (
            <form onSubmit={handleRejectSubmit} className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                <XCircle className="w-4 h-4" />
                <span>Reject / Flag Department Obligation</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300 mb-1">
                  Rejection Reason (Mandatory) *
                </label>
                <input
                  type="text"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Unreturned textbook: Database Systems 7th Edition"
                  className="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300 mb-1">
                  Remedy Instructions for Student *
                </label>
                <textarea
                  required
                  value={remedyInstructions}
                  onChange={(e) => setRemedyInstructions(e.target.value)}
                  placeholder="e.g. Return book to Library Desk or deposit replacement fine to CBE Account #1000012345."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300 mb-1">
                    Assessed Fee / Penalty (ETB)
                  </label>
                  <input
                    type="number"
                    value={outstandingBalance}
                    onChange={(e) => setOutstandingBalance(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 450"
                    className="w-full p-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300 mb-1">
                    Unreturned Item Tag
                  </label>
                  <input
                    type="text"
                    value={unreturnedItem}
                    onChange={(e) => setUnreturnedItem(e.target.value)}
                    placeholder="e.g. Call No: QA76.76"
                    className="w-full p-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveAction('NONE')}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          )}

          {activeAction === 'REQUEST_DOC' && (
            <form onSubmit={handleRequestDocSubmit} className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                <FileUp className="w-4 h-4" />
                <span>Request Additional Document from Student</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 mb-1">
                  Required Document Specification *
                </label>
                <textarea
                  required
                  value={docRequestNote}
                  onChange={(e) => setDocRequestNote(e.target.value)}
                  placeholder="e.g. Please upload stamped Cost Sharing confirmation or Advisor sign-off slip."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction('NONE')}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Send Document Request
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Action Buttons Footer */}
        {activeAction === 'NONE' && (
          <div className="p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Close
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveAction('REQUEST_DOC')}
                className="px-3.5 py-2 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5" />
                Request Doc
              </button>
              <button
                onClick={() => setActiveAction('REJECT')}
                className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject / Obligation
              </button>
              <button
                onClick={() => setActiveAction('APPROVE')}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve Clearance
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

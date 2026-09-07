import React, { useState, useEffect } from 'react';
import { 
  ClearanceRequest, ClearanceItem, Department, 
  ClearanceRequirement, SupportingDocument, Student 
} from '../../types';
import { 
  CheckCircle2, XCircle, FileUp, AlertTriangle, 
  FileText, User, ShieldCheck, Download, Check, 
  X, Clock, Building2, ExternalLink, Sparkles,
  Search, CheckSquare, Square, HelpCircle, ShieldAlert
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
  
  // Interactive Condition Verification Checklist
  const defaultChecklist = requirement?.checklistItems || [
    'No outstanding institutional property or borrowed items',
    'No pending financial fines or unpaid semester arrears',
    'Physical or digital departmental clearance verification verified'
  ];

  const [checkedConditions, setCheckedConditions] = useState<Record<number, boolean>>({});
  const [isAutomatedChecking, setIsAutomatedChecking] = useState(false);
  const [automatedCheckResult, setAutomatedCheckResult] = useState<{
    status: 'CLEAN' | 'FLAGGED';
    summary: string;
    suggestedReason?: string;
    suggestedFine?: number;
    suggestedItem?: string;
  } | null>(null);

  // Approve State
  const [approveComment, setApproveComment] = useState('All departmental obligations and rule conditions verified and cleared in full.');
  
  // Reject State
  const [rejectReason, setRejectReason] = useState(item.rejectionReason || '');
  const [remedyInstructions, setRemedyInstructions] = useState(item.remedyInstructions || '');
  const [outstandingBalance, setOutstandingBalance] = useState<number | ''>(item.outstandingBalance || '');
  const [unreturnedItem, setUnreturnedItem] = useState(item.outstandingItemsList?.[0] || '');

  // Request Doc State
  const [docRequestNote, setDocRequestNote] = useState('');

  const attachedDocs = documents.filter(d => item.supportingDocumentIds.includes(d.id));

  // Toggle condition checkbox
  const toggleCondition = (index: number) => {
    setCheckedConditions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Run Automated Department Rule & Records Pre-check
  const handleRunAutomatedRuleCheck = () => {
    setIsAutomatedChecking(true);
    setAutomatedCheckResult(null);

    setTimeout(() => {
      setIsAutomatedChecking(false);
      
      // Simulate real rule checks based on student and department
      if (department.code === 'LIB' && (request.studentStudentId.includes('1476') || student?.fullName.includes('Kassahun'))) {
        setAutomatedCheckResult({
          status: 'FLAGGED',
          summary: 'Library Catalog Database reports 1 overdue textbook checked out during Semester II.',
          suggestedReason: 'Overdue textbook: "Database Systems: Models, Languages, Design (7th Ed.)" - Call No: QA76.9.D3',
          suggestedFine: 450,
          suggestedItem: 'QA76.9.D3 / Barcode #HU-LIB-88412'
        });
        setRejectReason('Overdue textbook: Database Systems (7th Ed.) - Call No: QA76.9.D3');
        setRemedyInstructions('Please return the physical volume to Main Library Circulation Desk or deposit replacement fine to CBE Account #1000012345.');
        setOutstandingBalance(450);
        setUnreturnedItem('QA76.9.D3 (HU-LIB-88412)');
      } else if (department.code === 'DOR' && student?.dormitoryNumber) {
        setAutomatedCheckResult({
          status: 'CLEAN',
          summary: 'Proctor inventory ledger indicates room keys and mattress handed over in satisfactory condition.',
        });
        // Check all conditions
        const allChecked: Record<number, boolean> = {};
        defaultChecklist.forEach((_, idx) => { allChecked[idx] = true; });
        setCheckedConditions(allChecked);
      } else {
        setAutomatedCheckResult({
          status: 'CLEAN',
          summary: `All ${department.name} database rules and academic conditions passed with zero outstanding liabilities.`
        });
        const allChecked: Record<number, boolean> = {};
        defaultChecklist.forEach((_, idx) => { allChecked[idx] = true; });
        setCheckedConditions(allChecked);
      }
    }, 600);
  };

  // Department-specific violation presets
  const violationPresets: Record<string, Array<{ reason: string; remedy: string; fine?: number }>> = {
    LIB: [
      { reason: 'Overdue textbook: "Operating System Concepts" (10th Ed)', remedy: 'Return book to Central Library Desk or pay replacement value.', fine: 600 },
      { reason: 'Unpaid overdue library fine accumulation (32 days)', remedy: 'Settle overdue penalty at cashier window or via CBE mobile app.', fine: 160 },
      { reason: 'Lost digital ID card / library pass', remedy: 'Pay ID replacement charge at campus branch.', fine: 100 }
    ],
    DOR: [
      { reason: 'Dormitory room key and locker padlock not returned', remedy: 'Hand in keys to Block Proctor and obtain physical inspection stamp.', fine: 150 },
      { reason: 'Damaged mattress/bed frame noted during room audit', remedy: 'Pay repair assessment charge at campus housing office.', fine: 350 }
    ],
    DEP: [
      { reason: 'Final hardcopy thesis / capstone project missing department signature', remedy: 'Submit bound copy to Department Secretary with advisor sign-off.', fine: 0 },
      { reason: 'Laboratory glassware / equipment return pending', remedy: 'Return lab toolkit to Department Laboratory Technician in Block 4.', fine: 200 }
    ],
    FIN: [
      { reason: 'Unsettled semester tuition / cost sharing contract agreement pending', remedy: 'Submit signed Cost Sharing form to Finance Bureau Window #3.', fine: 0 },
      { reason: 'Outstanding lab breakage penalty fee', remedy: 'Pay penalty slip at CBE Bank and upload deposit receipt.', fine: 300 }
    ]
  };

  const currentPresets = violationPresets[department.code] || [
    { reason: 'Required departmental property or clearance condition not met', remedy: 'Consult department office in person for resolution.', fine: 0 }
  ];

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

  const allConditionsMet = defaultChecklist.length > 0 && 
    defaultChecklist.every((_, idx) => !!checkedConditions[idx]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-900 text-amber-400 font-bold text-xs font-certificate shadow-xs">
              {department.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {department.name} Clearance Evaluation
                </h3>
                <StatusBadge status={item.status} type="item" size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Clearance request from <span className="font-bold text-slate-800 dark:text-slate-200">{request.studentName}</span> ({request.studentStudentId})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[72vh] overflow-y-auto">
          
          {/* Student Dossier Overview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <span className="text-[10px] uppercase font-bold text-slate-400">Clearance Purpose</span>
              <p className="font-bold text-blue-700 dark:text-blue-300">{request.reason}</p>
            </div>
          </div>

          {/* Automated Rule Check Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-200 font-bold">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Department Rules & Records Auto-Verifier</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                Automatically verify university databases (inventory, library catalog, bursar, grades) against departmental rules.
              </p>
            </div>
            <button
              onClick={handleRunAutomatedRuleCheck}
              disabled={isAutomatedChecking}
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-xs text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {isAutomatedChecking ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Checking Records...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Run Rule Check
                </>
              )}
            </button>
          </div>

          {/* Auto-check Results Display */}
          {automatedCheckResult && (
            <div className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
              automatedCheckResult.status === 'CLEAN'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-start gap-2.5">
                {automatedCheckResult.status === 'CLEAN' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <p className="font-bold">
                    {automatedCheckResult.status === 'CLEAN' ? 'Rule Verification Passed' : 'Rule Violation / Obligation Detected'}
                  </p>
                  <p className="mt-1 leading-relaxed">{automatedCheckResult.summary}</p>
                  
                  {automatedCheckResult.status === 'FLAGGED' && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setActiveAction('REJECT')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                      >
                        Apply Rejection & Penalty Form
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Department Verification Rules & Conditions Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px]">
                Department Rules & Condition Checklist
              </h4>
              <span className="text-[10px] text-slate-400">
                {Object.values(checkedConditions).filter(Boolean).length} of {defaultChecklist.length} Verified
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
              {defaultChecklist.map((condition, i) => {
                const isChecked = !!checkedConditions[i];
                return (
                  <label
                    key={i}
                    onClick={() => toggleCondition(i)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCondition(i)}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                    />
                    <div className="text-xs">
                      <p className={`font-medium ${isChecked ? 'text-emerald-900 dark:text-emerald-300' : ''}`}>
                        {condition}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Uploaded Supporting Documents */}
          {attachedDocs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Student Uploaded Supporting Documents ({attachedDocs.length})
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
                      onClick={() => alert(`Reviewing ${doc.fileName}... (Simulated preview)`)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Decision / Rejection Alert */}
          {item.status === 'REJECTED' && item.rejectionReason && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
              <p className="font-bold">Current Flagged Obligation:</p>
              <p className="mt-1">"{item.rejectionReason}"</p>
              {item.outstandingBalance && (
                <p className="mt-1 font-bold">Outstanding Assessed Penalty: {item.outstandingBalance} ETB</p>
              )}
            </div>
          )}

          {/* DECISION ACTION FORM 1: APPROVE */}
          {activeAction === 'APPROVE' && (
            <form onSubmit={handleApproveSubmit} className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Department Clearance Approval</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-1">
                  Approval Endorsement Notes & Clearance Stamp *
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
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  Grant Department Clearance
                </button>
              </div>
            </form>
          )}

          {/* DECISION ACTION FORM 2: REJECT */}
          {activeAction === 'REJECT' && (
            <form onSubmit={handleRejectSubmit} className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                  <XCircle className="w-4 h-4" />
                  <span>Reject Clearance / Flag Department Obligation</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Select Quick Preset or Enter Custom
                </span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5">
                {currentPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRejectReason(preset.reason);
                      setRemedyInstructions(preset.remedy);
                      if (preset.fine !== undefined) setOutstandingBalance(preset.fine);
                    }}
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium cursor-pointer"
                  >
                    + {preset.reason.slice(0, 38)}...
                  </button>
                ))}
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
                  placeholder="e.g. Unreturned textbook: Database Systems (7th Ed.)"
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
                  placeholder="e.g. Return book to Library Circulation Desk or deposit replacement fine to CBE Account #1000012345."
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
                    className="w-full p-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300 mb-1">
                    Unreturned Item Identifier
                  </label>
                  <input
                    type="text"
                    value={unreturnedItem}
                    onChange={(e) => setUnreturnedItem(e.target.value)}
                    placeholder="e.g. Call No: QA76.9.D3"
                    className="w-full p-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  Submit Rejection & Flag Obligation
                </button>
              </div>
            </form>
          )}

          {/* DECISION ACTION FORM 3: REQUEST DOC / HOLD */}
          {activeAction === 'REQUEST_DOC' && (
            <form onSubmit={handleRequestDocSubmit} className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                <FileUp className="w-4 h-4" />
                <span>Request Additional Document / Proof from Student</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 mb-1">
                  Required Document Specification *
                </label>
                <textarea
                  required
                  value={docRequestNote}
                  onChange={(e) => setDocRequestNote(e.target.value)}
                  placeholder="e.g. Please upload stamped Cost Sharing bank slip or Department Advisor capstone sign-off."
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
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  Send Document Request to Student
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
              Close Window
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveAction('REQUEST_DOC')}
                className="px-3.5 py-2 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FileUp className="w-3.5 h-3.5" />
                Request Document
              </button>
              <button
                onClick={() => setActiveAction('REJECT')}
                className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject / Flag Obligation
              </button>
              <button
                onClick={() => setActiveAction('APPROVE')}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
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

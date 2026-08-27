import React, { useState } from 'react';
import { 
  ClearanceRequest, ClearanceItem, Department, 
  ClearanceRequirement, SupportingDocument 
} from '../../types';
import { 
  CheckCircle2, XCircle, Clock, FileUp, AlertTriangle, 
  Upload, FileText, ChevronDown, ChevronUp, Award, 
  ExternalLink, MessageSquare, Info, ShieldCheck, Check
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/helpers';

interface ClearanceTrackerProps {
  request: ClearanceRequest;
  departments: Department[];
  requirements: ClearanceRequirement[];
  documents: SupportingDocument[];
  onUploadDocument: (requestId: string, itemId: string, title: string, docType: SupportingDocument['documentType'], fileName: string, fileSize: number) => void;
  onNavigateToCertificate?: () => void;
}

export const ClearanceTracker: React.FC<ClearanceTrackerProps> = ({
  request,
  departments,
  requirements,
  documents,
  onUploadDocument,
  onNavigateToCertificate
}) => {
  const [selectedItemForRemedy, setSelectedItemForRemedy] = useState<ClearanceItem | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(request.items.find(i => i.status === 'REJECTED')?.id || request.items[0]?.id || null);
  
  // Remedy Form State
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<SupportingDocument['documentType']>('RECEIPT');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleOpenRemedyModal = (item: ClearanceItem) => {
    setSelectedItemForRemedy(item);
    setDocTitle(`Resolution proof for ${item.departmentName}`);
    setSelectedFileName('');
    setUploadSuccess(false);
  };

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(file.size);
    } else {
      setSelectedFileName('CBE_Bank_Deposit_Slip_450ETB.pdf');
      setSelectedFileSize(845200);
    }
  };

  const handleRemedySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRemedy) return;

    const finalFileName = selectedFileName || 'Proof_Of_Resolution.pdf';
    const finalSize = selectedFileSize || 520000;

    onUploadDocument(
      request.id,
      selectedItemForRemedy.id,
      docTitle || `Resolution document for ${selectedItemForRemedy.departmentName}`,
      docType,
      finalFileName,
      finalSize
    );

    setUploadSuccess(true);
    setTimeout(() => {
      setSelectedItemForRemedy(null);
      setUploadSuccess(false);
    }, 1000);
  };

  const clearedCount = request.items.filter(i => i.status === 'CLEARED').length;
  const totalCount = request.items.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner with Progress summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application #{request.id.slice(-6).toUpperCase()}
              </span>
              <StatusBadge status={request.overallStatus} type="overall" size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {request.reason} Clearance Verification
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Submitted on {formatDateTime(request.submissionDate)} • {request.academicYearLabel}
            </p>
          </div>

          {request.overallStatus === 'CERTIFICATE_ISSUED' && onNavigateToCertificate && (
            <button
              onClick={onNavigateToCertificate}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              View Official Certificate
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>Overall Clearance Completion</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{request.progressPercentage}% ({clearedCount}/{totalCount} Departments)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                request.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${request.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Department Clearance Cards List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Departmental Clearances ({clearedCount} of {totalCount} Cleared)
        </h2>

        {request.items.map((item, index) => {
          const isExpanded = expandedItemId === item.id;
          const req = requirements.find(r => r.departmentId === item.departmentId);
          const attachedDocs = documents.filter(d => item.supportingDocumentIds.includes(d.id));

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden ${
                item.status === 'REJECTED'
                  ? 'border-rose-300 dark:border-rose-900 ring-1 ring-rose-200 dark:ring-rose-900/50 shadow-xs'
                  : item.status === 'CLEARED'
                  ? 'border-emerald-200/80 dark:border-emerald-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Item Header Row */}
              <div
                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.status === 'CLEARED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.status === 'CLEARED' ? <Check className="w-4 h-4" /> : index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.departmentName}
                      </h3>
                      <span className="text-[11px] font-mono-code font-bold text-slate-400">
                        {item.departmentCode}
                      </span>
                      {item.isMandatory && (
                        <span className="hidden sm:inline-block text-[10px] text-slate-400 font-medium">
                          (Mandatory)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {item.status === 'CLEARED' && item.reviewedByOfficerName
                        ? `Approved by ${item.reviewedByOfficerName} on ${formatDate(item.reviewedAt)}`
                        : item.status === 'REJECTED'
                        ? `Action Required: ${item.rejectionReason}`
                        : 'Under review by department clearance officer'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={item.status} type="item" size="md" />
                  <button className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Item Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/60 text-xs space-y-4">
                  
                  {/* REJECTION / OBLIGATION ALERT */}
                  {item.status === 'REJECTED' && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="font-bold">Officer Rejection Reason:</span>
                        </div>
                        {item.reviewedAt && (
                          <span className="text-[10px] text-rose-500">{formatDateTime(item.reviewedAt)}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold pl-6">
                        "{item.rejectionReason}"
                      </p>

                      {item.remedyInstructions && (
                        <div className="mt-2 pt-2 border-t border-rose-200/80 dark:border-rose-900/80 pl-6">
                          <p className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300">
                            Remedy Instructions:
                          </p>
                          <p className="text-xs mt-0.5">
                            {item.remedyInstructions}
                          </p>
                        </div>
                      )}

                      {item.outstandingBalance && (
                        <div className="pl-6 mt-1 flex items-center gap-2 font-bold text-xs text-rose-700">
                          <span>Outstanding Assessed Balance:</span>
                          <span className="px-2 py-0.5 bg-rose-200 dark:bg-rose-900 rounded font-mono-code">
                            {item.outstandingBalance} ETB
                          </span>
                        </div>
                      )}

                      {/* Action button */}
                      <div className="pt-2 pl-6">
                        <button
                          id={`btn-remedy-${item.id}`}
                          onClick={() => handleOpenRemedyModal(item)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload Proof / Bank Deposit Slip & Resubmit
                        </button>
                      </div>
                    </div>
                  )}

                  {/* APPROVAL NOTE */}
                  {item.status === 'CLEARED' && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-xs">Cleared by {item.reviewedByOfficerName || 'Authorized Officer'}</p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                          {item.comments || 'All requirements satisfied.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Criteria / Checklist */}
                  {req?.checklistItems && req.checklistItems.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Department Verification Checklist
                      </p>
                      <div className="mt-1.5 space-y-1.5">
                        {req.checklistItems.map((chk, i) => (
                          <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            {item.status === 'CLEARED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                            )}
                            <span>{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attached Documents */}
                  {attachedDocs.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Uploaded Supporting Documents
                      </p>
                      <div className="mt-1.5 space-y-1.5">
                        {attachedDocs.map(doc => (
                          <div
                            key={doc.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">{doc.title}</p>
                                <p className="text-[10px] text-slate-400">{doc.fileName} • {formatFileSize(doc.fileSize)}</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-800">
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decision History Timeline */}
                  {item.decisions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Decision History Audit
                      </p>
                      <div className="space-y-2">
                        {item.decisions.map(dec => (
                          <div key={dec.id} className="text-[11px] p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center text-slate-500">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {dec.action}: {dec.officerName}
                              </span>
                              <span>{formatDateTime(dec.timestamp)}</span>
                            </div>
                            {dec.reason && <p className="text-slate-600 dark:text-slate-400 mt-1">"{dec.reason}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Remedy Modal Dialog */}
      {selectedItemForRemedy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Resolve {selectedItemForRemedy.departmentName} Clearance
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload proof of payment or compliance to request re-evaluation from the clearance officer.
              </p>
            </div>

            <form onSubmit={handleRemedySubmit} className="p-5 space-y-4 text-xs">
              
              {/* Highlight rejection requirement */}
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200">
                <p className="font-bold">Pending Flag:</p>
                <p className="mt-0.5">{selectedItemForRemedy.rejectionReason}</p>
                {selectedItemForRemedy.outstandingBalance && (
                  <p className="font-bold mt-1">Amount: {selectedItemForRemedy.outstandingBalance} ETB</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  Document Description / Title *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Commercial Bank of Ethiopia (CBE) 450 ETB Deposit Slip"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  Document Classification *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="RECEIPT">Bank Payment Receipt / Slip</option>
                  <option value="COST_SHARING">Cost Sharing Contract Form</option>
                  <option value="LAB_SLIP">Laboratory / Project Sign-off</option>
                  <option value="ID_CARD">Surrendered ID Card Scan</option>
                  <option value="OTHER">Other Official Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  Attach File (PDF, JPG, PNG) *
                </label>
                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedFileName ? selectedFileName : 'Click to select or drag & drop'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {selectedFileName ? `${formatFileSize(selectedFileSize)} selected` : 'Maximum file size: 10MB'}
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleSimulateFileSelect}
                    className="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Document uploaded and sent to officer!
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForRemedy(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Submit for Re-evaluation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

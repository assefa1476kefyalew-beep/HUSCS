import React, { useState } from 'react';
import { SupportingDocument, ClearanceRequest } from '../../types';
import { 
  FolderOpen, FileText, Upload, Download, Trash2, 
  CheckCircle2, Clock, ShieldCheck, Plus, AlertCircle 
} from 'lucide-react';
import { formatDateTime, formatFileSize } from '../../utils/helpers';

interface StudentDocumentsProps {
  documents: SupportingDocument[];
  activeRequest?: ClearanceRequest;
  onUploadDocument: (requestId: string, itemId: string, title: string, docType: SupportingDocument['documentType'], fileName: string, fileSize: number) => void;
}

export const StudentDocuments: React.FC<StudentDocumentsProps> = ({
  documents,
  activeRequest,
  onUploadDocument
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<SupportingDocument['documentType']>('RECEIPT');
  const [selectedItemId, setSelectedItemId] = useState(activeRequest?.items[0]?.id || '');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState(0);

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(file.size);
    } else {
      setSelectedFileName('Official_Hawassa_Document.pdf');
      setSelectedFileSize(620000);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    onUploadDocument(
      activeRequest.id,
      selectedItemId || activeRequest.items[0]?.id,
      docTitle || 'Student Supporting Document',
      docType,
      selectedFileName || 'Clearance_Document.pdf',
      selectedFileSize || 450000
    );

    setShowUploadModal(false);
    setDocTitle('');
    setSelectedFileName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Document Repository
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Supporting Clearance Documents
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload and archive official bank receipts, cost-sharing forms, and departmental approval slips.
          </p>
        </div>

        {activeRequest && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        )}
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Documents Uploaded Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            When departments request cost-sharing agreements or bank payment slips, your uploaded files will be stored here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doc.status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {doc.status}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-3 line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-[11px] font-mono-code text-slate-400 mt-1 truncate">
                  {doc.fileName}
                </p>
                <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <p>Type: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.documentType}</span></p>
                  <p>Size: {formatFileSize(doc.fileSize)}</p>
                  <p>Uploaded: {formatDateTime(doc.uploadedAt)}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  By {doc.uploadedByName}
                </span>
                <button
                  onClick={() => alert(`Downloading ${doc.fileName}... (Simulated secure file retrieval)`)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && activeRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Upload Clearance Supporting Document
            </h3>
            <p className="text-xs text-slate-500">
              Select target department and document type to append to your clearance dossier.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  Target Department *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {activeRequest.items.map(i => (
                    <option key={i.id} value={i.id}>{i.departmentName} ({i.departmentCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Signed Cost-Sharing Contract Form"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  Document Classification *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="COST_SHARING">Cost Sharing Contract</option>
                  <option value="RECEIPT">Bank Payment Receipt / Slip</option>
                  <option value="LAB_SLIP">Lab / Thesis Approval Slip</option>
                  <option value="ID_CARD">Surrendered ID Card Scan</option>
                  <option value="OTHER">Other Official Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  File Attachment *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleSimulateFileSelect}
                  className="w-full text-xs p-2 border rounded-xl border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Upload & Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

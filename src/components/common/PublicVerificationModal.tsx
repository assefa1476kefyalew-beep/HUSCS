import React, { useState } from 'react';
import { 
  ShieldCheck, Search, X, CheckCircle2, AlertCircle, 
  Award, Building2, Calendar, FileText, Check 
} from 'lucide-react';
import { ClearanceCertificate } from '../../types';
import { formatDate } from '../../utils/helpers';

interface PublicVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificates: ClearanceCertificate[];
  onOpenCertificateFull?: (cert: ClearanceCertificate) => void;
}

export const PublicVerificationModal: React.FC<PublicVerificationModalProps> = ({
  isOpen,
  onClose,
  certificates,
  onOpenCertificateFull
}) => {
  const [certQuery, setCertQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<ClearanceCertificate | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const cleanQuery = certQuery.trim().toUpperCase();
    const found = certificates.find(
      c => c.certificateNumber.toUpperCase() === cleanQuery || 
           c.studentId.toUpperCase() === cleanQuery
    );
    setResult(found || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Public Certificate Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify Hawassa University authentic graduation clearance
              </p>
            </div>
          </div>
          <button
            id="btn-close-verify-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Certificate Number or Student ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-verify-cert-num"
                  type="text"
                  required
                  placeholder="e.g. HU-CLR-2026-000123"
                  value={certQuery}
                  onChange={(e) => setCertQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                id="btn-submit-verify"
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify</span>
              </button>
            </div>
          </form>

          {/* Verification Result */}
          {searched && (
            result ? (
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Valid & Authenticated Hawassa University Certificate</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{result.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student ID</span>
                    <span className="font-mono-code font-semibold text-slate-800 dark:text-slate-100">{result.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate block">{result.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Issue Date</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatDate(result.issuedAt)}</span>
                  </div>
                </div>

                {onOpenCertificateFull && (
                  <button
                    onClick={() => {
                      onOpenCertificateFull(result);
                      onClose();
                    }}
                    className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    View Printable Certificate Record
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-center space-y-1 animate-in fade-in duration-150">
                <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
                <p className="text-xs font-bold text-rose-900 dark:text-rose-200">No Record Found</p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300">
                  The certificate number or ID entered does not match any officially registered clearance certificate.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

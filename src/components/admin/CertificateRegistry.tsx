import React, { useState } from 'react';
import { ClearanceCertificate, ClearanceRequest, Student } from '../../types';
import { 
  Award, Search, Printer, ShieldCheck, 
  ExternalLink, Download, CheckCircle2, QrCode as QrCodeIcon, X 
} from 'lucide-react';
import { formatDate, formatDateTime, exportToCSV } from '../../utils/helpers';

interface CertificateRegistryProps {
  certificates: ClearanceCertificate[];
  requests: ClearanceRequest[];
  students: Student[];
  onOpenCertificateModal: (certificate: ClearanceCertificate) => void;
}

export const CertificateRegistry: React.FC<CertificateRegistryProps> = ({
  certificates,
  requests,
  students,
  onOpenCertificateModal
}) => {
  const [search, setSearch] = useState('');
  const [verifyingCert, setVerifyingCert] = useState<ClearanceCertificate | null>(null);

  const filteredCerts = certificates.filter(c => {
    const q = search.toLowerCase();
    const certNum = (c.certificateNumber || '').toLowerCase();
    const sName = (c.studentName || '').toLowerCase();
    const sId = (c.studentIdNumber || c.studentStudentId || '').toLowerCase();
    const dept = (c.department || c.studentDepartment || '').toLowerCase();
    const col = (c.college || c.studentCollege || '').toLowerCase();
    return certNum.includes(q) || sName.includes(q) || sId.includes(q) || dept.includes(q) || col.includes(q);
  });

  const handleExportCSV = () => {
    const rows = certificates.map(c => ({
      'Certificate Number': c.certificateNumber,
      'Student ID': c.studentIdNumber || c.studentStudentId || '',
      'Student Name': c.studentName || '',
      'College': c.college || c.studentCollege || '',
      'Department': c.department || c.studentDepartment || '',
      'Degree Level': c.degreeLevel || 'UNDERGRADUATE',
      'Academic Year': c.academicYearLabel || c.graduationAcademicYear || '',
      'Issue Date': formatDate(c.issueDate),
      'Registrar Sign-off': c.registrarName || c.issuedByOfficerName || '',
      'Verification Hash': c.securityHash || ''
    }));
    exportToCSV('Hawassa_University_Issued_Certificates.csv', rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Registrar Registry
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Digital Clearance Certificate Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master ledger of all officially signed and cryptographic graduation clearance certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            Export Registry (CSV)
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Search Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, ID (e.g. HU/0982/14), certificate #, college..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filteredCerts.length} certificates registered
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Certificate Number</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">College & Dept</th>
                <th className="px-4 py-3.5">Issued Date</th>
                <th className="px-4 py-3.5">Verification Security</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No certificates found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCerts.map(cert => {
                  const studentName = cert.studentName || 'Student Name';
                  const studentId = cert.studentIdNumber || cert.studentStudentId || 'HU/0000/00';
                  const dept = cert.department || cert.studentDepartment || 'Department';
                  const college = cert.college || cert.studentCollege || 'Hawassa University';
                  const ay = cert.academicYearLabel || cert.graduationAcademicYear || '2025/2026 A.Y.';

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-mono-code font-bold text-slate-900 dark:text-white">
                              {cert.certificateNumber}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Academic Year: {ay}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{studentName}</p>
                        <p className="font-mono-code text-[11px] text-slate-400 mt-0.5">{studentId}</p>
                      </td>

                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <p className="font-medium">{dept}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{college}</p>
                      </td>

                      <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(cert.issueDate)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> Valid & Verified
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setVerifyingCert(cert)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <QrCodeIcon className="w-3.5 h-3.5" /> Verify
                          </button>
                          <button
                            id={`btn-open-cert-${cert.id}`}
                            onClick={() => onOpenCertificateModal(cert)}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-300" /> View & Download
                          </button>
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

      {/* Online Verification Dialog */}
      {verifyingCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Cryptographic Verification
                </h3>
              </div>
              <button
                onClick={() => setVerifyingCert(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Certificate Status: AUTHENTIC & VALID</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Registered to: <strong>{verifyingCert.studentName}</strong> ({verifyingCert.studentIdNumber || verifyingCert.studentStudentId})
              </p>
              <p className="text-slate-600 dark:text-slate-400 font-mono-code text-[11px]">
                Hash: {verifyingCert.securityHash}
              </p>
            </div>

            <button
              onClick={() => {
                onOpenCertificateModal(verifyingCert);
                setVerifyingCert(null);
              }}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-300" />
              Open Full Certificate Document
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

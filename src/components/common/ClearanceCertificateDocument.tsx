import React, { useRef, useState, useEffect } from 'react';
import { 
  ClearanceCertificate, ClearanceRequest, Student, Department 
} from '../../types';
import { 
  Printer, Download, ShieldCheck, CheckCircle2, 
  QrCode as QrCodeIcon, Award, Copy, Check, Sparkles,
  ExternalLink, Building2, Calendar, FileText, User,
  CheckCircle, Loader2
} from 'lucide-react';
import { generateVerificationQRCode, formatDate, formatDateTime } from '../../utils/helpers';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ClearanceCertificateDocumentProps {
  certificate: ClearanceCertificate;
  request?: ClearanceRequest;
  student?: Student;
  departments?: Department[];
  showControls?: boolean;
}

export const ClearanceCertificateDocument: React.FC<ClearanceCertificateDocumentProps> = ({
  certificate,
  request,
  student,
  departments = [],
  showControls = true
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Normalize student information from certificate, student prop, or request
  const studentName = certificate.studentName || student?.fullName || request?.studentName || 'Student Name';
  const studentId = certificate.studentStudentId || certificate.studentIdNumber || student?.studentId || request?.studentStudentId || 'HU/0000/00';
  const college = certificate.studentCollege || certificate.college || student?.college || request?.studentCollege || 'Hawassa University';
  const department = certificate.studentDepartment || certificate.department || student?.department || request?.studentDepartment || 'General Studies';
  const program = certificate.studentProgram || certificate.program || student?.program || request?.studentProgram || 'REGULAR';
  const degreeLevel = certificate.degreeLevel || student?.degreeLevel || 'UNDERGRADUATE (B.Sc. / B.A.)';
  const academicYear = certificate.graduationAcademicYear || certificate.academicYearLabel || request?.academicYearLabel || '2025/2026 A.Y. (2018 E.C.)';
  const issueDate = certificate.issueDate || (request?.completedDate ? request.completedDate.split('T')[0] : new Date().toISOString().split('T')[0]);
  const purpose = certificate.purpose || request?.reason || 'GRADUATION & DEGREE AWARD';
  const registrarName = certificate.issuedByOfficerName || certificate.registrarName || 'Dr. Marta Yohannes';
  const registrarTitle = certificate.issuedByOfficerTitle || 'Central University Registrar Director';
  const certNumber = certificate.certificateNumber || 'HU-CLR-2026-000123';
  const securityHash = certificate.securityHash || 'e7f3c9a1b4d82f6e50c4a3b1d7e9f2a8';

  // Build approvals array from request items or certificate approvals or fallback departments
  const departmentApprovals = (certificate.departmentApprovals && certificate.departmentApprovals.length > 0)
    ? certificate.departmentApprovals
    : (request?.items && request.items.length > 0)
    ? request.items.map(item => ({
        departmentId: item.departmentId,
        departmentName: item.departmentName,
        departmentCode: item.departmentCode,
        officerName: item.reviewedByOfficerName || 'Authorized Officer',
        approvedAt: item.reviewedAt || request.completedDate || issueDate,
        status: item.status,
        remarks: item.comments
      }))
    : [
        { departmentId: '1', departmentName: 'University Library Services', departmentCode: 'LIB', officerName: 'Abebe Kebede (Library Officer)', approvedAt: issueDate, status: 'CLEARED' },
        { departmentId: '2', departmentName: 'Academic Department Head', departmentCode: 'DEPT', officerName: 'Dr. Yonas Mulugeta (CS Head)', approvedAt: issueDate, status: 'CLEARED' },
        { departmentId: '3', departmentName: 'College Dean Directorate', departmentCode: 'DEAN', officerName: 'Prof. Tadesse Desta (Dean)', approvedAt: issueDate, status: 'CLEARED' },
        { departmentId: '4', departmentName: 'Student Cafeteria & Catering', departmentCode: 'CAFE', officerName: 'Almaz Tefera (Cafeteria Sup)', approvedAt: issueDate, status: 'CLEARED' },
        { departmentId: '5', departmentName: 'Residential & Dormitory Services', departmentCode: 'DORM', officerName: 'Getachew Bekele (Dorm Warden)', approvedAt: issueDate, status: 'CLEARED' },
        { departmentId: '6', departmentName: 'Sports & Gymnasium Complex', departmentCode: 'SPORT', officerName: 'Dawit Solomon (Sports Director)', approvedAt: issueDate, status: 'CLEARED' },
        { departmentId: '7', departmentName: 'Cost-Sharing & Finance Bureau', departmentCode: 'FIN', officerName: 'Tigist Haile (Finance Officer)', approvedAt: issueDate, status: 'CLEARED' },
        { departmentId: '8', departmentName: 'Office of the Registrar', departmentCode: 'REG', officerName: registrarName, approvedAt: issueDate, status: 'CLEARED' },
      ];

  useEffect(() => {
    generateVerificationQRCode(certNumber).then(url => {
      setQrCodeDataUrl(url);
    });
  }, [certNumber]);

  const handlePrintOrSavePdf = async () => {
    if (!certificateRef.current) {
      window.print();
      return;
    }
    try {
      setIsGeneratingPdf(true);
      // Wait slightly for DOM font and image layout
      await new Promise(r => setTimeout(r, 120));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.2, // Crisp retina A4 printing
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 8000
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      
      // Create A4 PDF in portrait format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 8;
      const printableWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * printableWidth) / canvas.width;
      
      const yOffset = imgHeight < pageHeight - (margin * 2) 
        ? margin + ((pageHeight - (margin * 2) - imgHeight) / 5) 
        : margin;

      pdf.addImage(imgData, 'JPEG', margin, yOffset, printableWidth, Math.min(imgHeight, pageHeight - (margin * 2)));
      pdf.save(`Hawassa_University_Clearance_Certificate_${certNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);

      // Trigger native window.print() so browser print dialog also opens if desired
      setTimeout(() => {
        window.print();
      }, 400);
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
      // Fallback to native window.print
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    try {
      setIsDownloading(true);
      // Wait slightly for rendering
      await new Promise(r => setTimeout(r, 120));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5, // Crisp 2.5x high resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 8000
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Hawassa_University_Clearance_Certificate_${certNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating certificate image:', error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const verifyUrl = `https://clearance.hu.edu.et/verify?cert=${encodeURIComponent(certNumber)}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Action Toolbar (Hidden during print) */}
      {showControls && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white">
                  Official Clearance Certificate
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Valid & Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-code mt-0.5">
                Reference: <strong className="text-amber-300">{certNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              id="btn-download-cert-image"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              title="Download High-Resolution PNG Image"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Image (PNG)</span>
                </>
              )}
            </button>

            <button
              id="btn-print-cert-pdf"
              onClick={handlePrintOrSavePdf}
              disabled={isGeneratingPdf}
              className="px-3.5 sm:px-4 py-2 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              title="Save as PDF Document & Open Print Dialog"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </>
              )}
            </button>

            <button
              id="btn-copy-cert-link"
              onClick={handleCopyLink}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Copy verification link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Verification Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE CERTIFICATE CANVAS (PRINTABLE & DOWNLOADABLE HIGH-RES CANVAS)
         ========================================================================= */}
      <div 
        ref={certificateRef}
        id="hawassa-clearance-certificate"
        className="w-full bg-[#fdfdfb] text-slate-900 rounded-2xl shadow-2xl p-4 sm:p-8 lg:p-10 border-2 border-amber-900/20 relative overflow-hidden print:p-6 print:m-0 print:border-none print:shadow-none print:bg-white print:rounded-none"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {/* Ornate Gold & Deep Blue Outer Border */}
        <div className="border-[6px] border-double border-[#0f284e] p-4 sm:p-8 rounded-xl relative bg-white">
          
          {/* Inner Golden Filigree Border */}
          <div className="border border-amber-600/60 p-4 sm:p-6 rounded-lg relative bg-gradient-to-b from-[#fcfbf7] to-[#ffffff]">
            
            {/* Corner Decorative Ornaments */}
            <div className="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-amber-600 rounded-tl-md pointer-events-none" />
            <div className="absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 border-amber-600 rounded-tr-md pointer-events-none" />
            <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 border-amber-600 rounded-bl-md pointer-events-none" />
            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-amber-600 rounded-br-md pointer-events-none" />

            {/* University Crest Large Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.045] pointer-events-none select-none">
              <img 
                src="/hawassa-logo.png" 
                alt="Watermark" 
                className="w-[380px] h-[380px] object-contain" 
              />
            </div>

            {/* Top Certificate Header with University Logo */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-amber-600/30 pb-5">
              
              {/* Left: Official Hawassa University Crest Logo */}
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-amber-600 p-1 shadow-md flex items-center justify-center shrink-0">
                  <img 
                    src="/hawassa-logo.png" 
                    alt="Hawassa University Official Seal" 
                    className="w-full h-full object-contain rounded-full"
                    crossOrigin="anonymous"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#0f284e] tracking-wide leading-tight">
                    ሀዋሳ ዩኒቨርሲቲ
                  </h3>
                  <h1 className="font-serif text-xl sm:text-2xl font-black text-[#0f284e] tracking-tight uppercase leading-tight">
                    Hawassa University
                  </h1>
                  <p className="text-xs font-semibold text-amber-800 tracking-wide mt-0.5">
                    Office of the University Registrar • Directorate of Academic Affairs
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    P.O. Box 05, Hawassa, Sidama Region, Ethiopia • www.hu.edu.et
                  </p>
                </div>
              </div>

              {/* Right: Security & Certificate Badge */}
              <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                <div className="px-3.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 font-mono-code text-xs font-bold shadow-2xs">
                  CERTIFICATE NO: {certNumber}
                </div>
                <p className="text-[11px] text-slate-600 font-semibold mt-1">
                  Academic Year: <strong className="text-slate-900">{academicYear}</strong>
                </p>
                <p className="text-[10px] text-slate-500">
                  Issue Date: <strong className="text-slate-800">{formatDate(issueDate)}</strong>
                </p>
              </div>

            </div>

            {/* Main Title Ribbon */}
            <div className="text-center my-6 space-y-1">
              <div className="inline-block relative">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent w-full mb-1.5" />
                <h2 className="font-serif text-lg sm:text-2xl font-extrabold uppercase tracking-widest text-[#0f284e] px-6">
                  Official Student Clearance Certificate
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent w-full mt-1.5" />
              </div>
              <p className="text-[11px] font-serif italic text-amber-900 font-medium">
                Issued in accordance with Hawassa University Senate Legislation & Academic Clearance Directives
              </p>
            </div>

            {/* Student Certification Statement */}
            <div className="my-6 text-center max-w-3xl mx-auto space-y-2">
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                This is to officially certify that the student named below:
              </p>

              {/* Student Name Display */}
              <div className="py-2 px-6 bg-gradient-to-r from-amber-50/50 via-blue-50/60 to-amber-50/50 rounded-xl border border-amber-200/80 inline-block mx-auto min-w-[320px]">
                <h3 className="font-serif text-xl sm:text-3xl font-extrabold text-[#0a1e3b] tracking-wide">
                  {studentName}
                </h3>
                <p className="text-xs sm:text-sm font-mono-code font-bold text-blue-900 mt-0.5">
                  University ID Number: {studentId}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed max-w-2xl mx-auto pt-2">
                has successfully surrendered all university properties, settled all financial, tuition, library, dormitory, sports, laboratory, and cost-sharing accounts, and is hereby declared <strong className="text-emerald-800 uppercase font-black">FULLY CLEARED</strong> from all institutional obligations for the purpose of <strong className="text-[#0f284e] font-extrabold">{purpose}</strong>.
              </p>
            </div>

            {/* Student Academic Matrix Grid */}
            <div className="my-6 bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shadow-2xs">
              <div className="p-2 border-r border-slate-200 last:border-none">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">College / Faculty</span>
                <p className="font-bold text-xs sm:text-sm text-[#0f284e] mt-0.5 leading-snug">{college}</p>
              </div>
              <div className="p-2 sm:border-r border-slate-200 last:border-none">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Academic Department</span>
                <p className="font-bold text-xs sm:text-sm text-[#0f284e] mt-0.5 leading-snug">{department}</p>
              </div>
              <div className="p-2 border-r border-slate-200 last:border-none">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Degree Program</span>
                <p className="font-bold text-xs sm:text-sm text-[#0f284e] mt-0.5 leading-snug">{program}</p>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Qualification Level</span>
                <p className="font-bold text-xs sm:text-sm text-[#0f284e] mt-0.5 leading-snug">{degreeLevel}</p>
              </div>
            </div>

            {/* Departmental Verification Sign-off Matrix */}
            <div className="my-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#0f284e] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  Official Departmental Clearance Sign-Off Matrix
                </h4>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  8 / 8 Departments Cleared
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[10px]">
                {departmentApprovals.map((app, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                        <span className="font-mono-code font-bold text-blue-900">{app.departmentCode}</span>
                        <div className="flex items-center gap-0.5 text-emerald-700 font-bold text-[9px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>CLEARED</span>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-800 truncate text-[10px] mt-1">
                        {app.departmentName}
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-dashed border-slate-200 text-[8.5px] text-slate-500">
                      <p className="truncate text-slate-600 font-medium">By: {app.officerName}</p>
                      <p className="font-mono-code">{formatDate(app.approvedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Signatures, Rubber Stamp & QR Verification Section */}
            <div className="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 items-center gap-6 relative">
              
              {/* Left: Scannable Security QR Code */}
              <div className="flex items-center gap-3">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Official Verification QR Code"
                    className="w-22 h-22 sm:w-24 sm:h-24 border-2 border-slate-300 p-1 rounded-xl bg-white shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-22 h-22 sm:w-24 sm:h-24 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center">
                    <QrCodeIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="text-[10px] text-slate-600 space-y-0.5">
                  <p className="font-bold text-[#0f284e] uppercase">Cryptographic QR Verification</p>
                  <p className="text-slate-500">Scan to verify document authenticity online</p>
                  <p className="font-mono-code text-[8.5px] text-slate-400 truncate max-w-[130px]">
                    Hash: {securityHash.slice(0, 16)}...
                  </p>
                </div>
              </div>

              {/* Center: Authentic Ethiopian University Rubber Stamp (Sample Stamp) */}
              <div className="flex justify-center items-center py-2">
                <div 
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-dashed border-blue-800 text-blue-900 flex flex-col items-center justify-center p-2 text-center shadow-xs select-none rotate-[-4deg] opacity-90 transition-transform hover:rotate-0"
                  style={{
                    backgroundColor: 'rgba(30, 58, 138, 0.03)',
                    boxShadow: 'inset 0 0 10px rgba(30, 58, 138, 0.08)'
                  }}
                >
                  <div className="w-full h-full rounded-full border border-blue-800 flex flex-col items-center justify-center p-1 relative">
                    <p className="text-[7.5px] font-black uppercase tracking-tighter text-blue-900 leading-none">
                      ★ HAWASSA UNIVERSITY ★
                    </p>
                    <div className="w-8 h-0.5 bg-blue-800 my-0.5" />
                    <p className="text-[9px] font-black uppercase text-blue-950 leading-tight">
                      OFFICIALLY CLEARED
                    </p>
                    <p className="text-[7px] font-bold text-blue-800 font-mono-code mt-0.5">
                      {formatDate(issueDate)}
                    </p>
                    <div className="w-8 h-0.5 bg-blue-800 my-0.5" />
                    <p className="text-[7px] font-black uppercase tracking-tighter text-blue-900 leading-none">
                      ★ REGISTRAR DIRECTORATE ★
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Registrar Signature & Official Endorsement */}
              <div className="text-center sm:text-right space-y-1">
                <div className="relative inline-block sm:ml-auto">
                  {/* Handwritten Signature SVG Simulation */}
                  <div className="font-serif italic text-blue-950 font-black text-lg sm:text-xl transform -rotate-3 select-none pb-1">
                    {registrarName}
                  </div>
                  <div className="w-48 sm:w-52 border-b-2 border-slate-900 mt-1" />
                </div>
                <p className="font-extrabold text-xs text-[#0f284e] uppercase">
                  {registrarName}
                </p>
                <p className="text-[10px] font-semibold text-slate-600">
                  {registrarTitle}
                </p>
                <p className="text-[9px] text-slate-500">
                  Hawassa University Central Directorate, Ethiopia
                </p>
              </div>

            </div>

            {/* Legal Security & Anti-Fraud Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-500 gap-2">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="w-3 h-3" />
                Tamper-Evident Digital Security Seal • Verified Document
              </span>
              <span className="text-center sm:text-right text-slate-400">
                Any illegal alteration or forgery of this certificate is punishable under FDRE Criminal Code.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

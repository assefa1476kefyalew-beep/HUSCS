import React from 'react';
import { 
  ClearanceCertificate, ClearanceRequest, Student, Department 
} from '../../types';
import { X, Award } from 'lucide-react';
import { ClearanceCertificateDocument } from '../common/ClearanceCertificateDocument';

interface CertificateModalProps {
  certificate: ClearanceCertificate;
  request?: ClearanceRequest;
  student?: Student;
  departments: Department[];
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  request,
  student,
  departments,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 sm:py-8 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-transparent max-w-5xl w-full my-auto print:m-0 print:w-full print:max-w-none animate-in fade-in zoom-in-95 duration-150 relative">
        
        {/* Close Button at top right (Hidden when printing) */}
        <div className="flex justify-end mb-2 print:hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/90 text-white hover:bg-slate-700 hover:text-amber-400 border border-slate-700 shadow-lg cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold px-3"
            title="Close Certificate View"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Certificate Document */}
        <ClearanceCertificateDocument
          certificate={certificate}
          request={request}
          student={student}
          departments={departments}
          showControls={true}
        />

      </div>
    </div>
  );
};

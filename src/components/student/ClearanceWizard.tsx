import React, { useState } from 'react';
import { 
  Student, ClearancePeriod, ClearanceReasonType, 
  Department, ClearanceRequirement 
} from '../../types';
import { 
  Check, ArrowRight, ArrowLeft, ShieldCheck, 
  AlertCircle, Sparkles, Building2, BookOpen, 
  FileText, CheckCircle2, Info 
} from 'lucide-react';

interface ClearanceWizardProps {
  student: Student;
  activePeriods: ClearancePeriod[];
  departments: Department[];
  requirements: ClearanceRequirement[];
  onSubmitClearance: (studentId: string, periodId: string, reason: ClearanceReasonType, note?: string) => void;
  onCancel: () => void;
}

export const ClearanceWizard: React.FC<ClearanceWizardProps> = ({
  student,
  activePeriods,
  departments,
  requirements,
  onSubmitClearance,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPeriodId, setSelectedPeriodId] = useState(activePeriods[0]?.id || '');
  const [selectedReason, setSelectedReason] = useState<ClearanceReasonType>('GRADUATION');
  const [customNote, setCustomNote] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPeriod = activePeriods.find(p => p.id === selectedPeriodId) || activePeriods[0];
  const sortedDepartments = [...departments].filter(d => d.active).sort((a, b) => a.order - b.order);

  const handleFinalSubmit = () => {
    if (!agreedToTerms) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitClearance(student.id, selectedPeriodId, selectedReason, customNote);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Official Application Workflow
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Initiate Student Clearance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit your centralized clearance request to all Hawassa University administrative and academic departments.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 self-start sm:self-center cursor-pointer"
        >
          Cancel Application
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, title: 'Student Info' },
            { num: 2, title: 'Clearance Purpose' },
            { num: 3, title: 'Obligations Preview' },
            { num: 4, title: 'Review & Submit' }
          ].map((step) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div
                key={step.num}
                className={`p-3 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                    : isDone
                    ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : step.num}
                  </span>
                  <span className={`text-xs font-semibold hidden sm:inline ${
                    isCurrent ? 'text-blue-900 dark:text-blue-200' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* STEP 1: Student Biographical Verification */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Step 1: Verify Synchronized Student Record
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The following academic information is imported from the Hawassa University Student Information System (SIS). Please confirm your details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Full Name</span>
                <p className="text-slate-900 dark:text-white font-bold text-sm mt-0.5">{student.fullName}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Student ID Number</span>
                <p className="text-slate-900 dark:text-white font-mono-code font-bold text-sm mt-0.5">{student.studentId}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">College / School</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{student.college}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Academic Department</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{student.department}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Program & Degree</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{student.program} • {student.degreeLevel}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Campus Location</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{student.campus}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Dormitory Allocation</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                  {student.blockNumber ? `${student.blockNumber}, ${student.dormitoryNumber}` : 'Non-Resident / Off-Campus'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Expected Graduation</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{student.expectedGraduationYear}</p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                If any academic record above appears inaccurate, please submit your clearance request first and notify the Registrar clearance officer during your final audit step.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Clearance Period and Purpose */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Step 2: Select Clearance Period & Reason
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose the applicable active university clearance intake period and state the objective of your clearance.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">
                  Active Clearance Intake Period *
                </label>
                <div className="space-y-2">
                  {activePeriods.map((period) => (
                    <label
                      key={period.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPeriodId === period.id
                          ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="period"
                        value={period.id}
                        checked={selectedPeriodId === period.id}
                        onChange={(e) => setSelectedPeriodId(e.target.value)}
                        className="mt-1 text-blue-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{period.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{period.description}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Active Intake Window
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">
                  Clearance Purpose / Reason *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'GRADUATION', label: 'Graduation / Degree Completion', desc: 'Final clearance for prospective graduating candidates.' },
                    { id: 'END_OF_YEAR', label: 'End-of-Year Campus Vacation', desc: 'Vacating dormitory and handing in equipment.' },
                    { id: 'WITHDRAWAL', label: 'Official Semester Withdrawal', desc: 'Temporary withdrawal due to medical or personal reasons.' },
                    { id: 'TRANSFER', label: 'Inter-University Transfer', desc: 'Transferring to another higher educational institution.' }
                  ].map((r) => (
                    <label
                      key={r.id}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedReason === r.id
                          ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.id}
                        checked={selectedReason === r.id}
                        onChange={() => setSelectedReason(r.id as ClearanceReasonType)}
                        className="sr-only"
                      />
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{r.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{r.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Additional Note (Optional)
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Senior capstone project submitted to Dept archive; thesis defense conducted on June 18."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Department Requirements Preview */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Step 3: Department Verification Pipeline Preview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your application will automatically be dispatched to all {sortedDepartments.length} university departments listed below:
              </p>
            </div>

            <div className="space-y-3">
              {sortedDepartments.map((dept, index) => {
                const req = requirements.find(r => r.departmentId === dept.id);
                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {dept.name}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {dept.code}
                        </span>
                        {dept.isMandatory && (
                          <span className="text-[10px] text-rose-600 font-semibold">Mandatory</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {dept.description}
                      </p>

                      {req?.checklistItems && req.checklistItems.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Department Criteria:</p>
                          <ul className="mt-1 space-y-1">
                            {req.checklistItems.map((chk, i) => (
                              <li key={i} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <span className="text-blue-500 font-bold">•</span>
                                {chk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Review, Honor Code & Final Submission */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Step 4: Honor Code & Final Submission
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please review your submission summary and sign the digital declaration.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-blue-200/60 dark:border-blue-900/60">
                <span className="text-slate-500 dark:text-slate-400">Student Name & ID:</span>
                <span className="font-bold text-slate-900 dark:text-white">{student.fullName} ({student.studentId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-200/60 dark:border-blue-900/60">
                <span className="text-slate-500 dark:text-slate-400">Department & College:</span>
                <span className="font-medium text-slate-900 dark:text-white">{student.department} • {student.college}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-200/60 dark:border-blue-900/60">
                <span className="text-slate-500 dark:text-slate-400">Clearance Purpose:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">{selectedReason}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Target Period:</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedPeriod?.title}</span>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded-sm border-slate-300"
                />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Hawassa University Student Declaration & Honor Code
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    I hereby certify that all information submitted is true and complete. I understand that any false declaration, unreturned institutional property, or concealed debt will result in immediate withholding of my academic transcript, diploma, and clearance certificate.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-submit-clearance-final"
              onClick={handleFinalSubmit}
              disabled={!agreedToTerms || isSubmitting}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all ${
                agreedToTerms && !isSubmitting
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>Submitting to Departments...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit Clearance Request
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

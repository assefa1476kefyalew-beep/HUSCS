import React, { useState } from 'react';
import { User, Department, ClearanceRequest } from '../../types';
import { 
  User as UserIcon, Building2, ShieldCheck, Award, 
  CheckCircle2, Clock, XCircle, Edit2, Save, KeyRound,
  FileText, MessageSquare, Plus, Trash2, Sparkles, Phone, Mail
} from 'lucide-react';
import { HawassaLogo } from '../common/HawassaLogo';

interface OfficerProfileProps {
  currentUser: User;
  department: Department;
  clearanceRequests: ClearanceRequest[];
  onUpdateProfile?: (userId: string, updates: Partial<User>) => void;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
}

export const OfficerProfile: React.FC<OfficerProfileProps> = ({
  currentUser,
  department,
  clearanceRequests,
  onUpdateProfile,
  onShowToast
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone || '+251 91 123 4567');
  const [email, setEmail] = useState(currentUser.email);
  const [officeNumber, setOfficeNumber] = useState('Block B, Room 204');
  const [isEditing, setIsEditing] = useState(false);

  // Quick rejection presets
  const [cannedReasons, setCannedReasons] = useState<string[]>([
    'Outstanding unreturned property / items',
    'Unsettled late return penalty fee',
    'Missing required departmental cost-sharing form',
    'Departmental lab equipment not handed over'
  ]);
  const [newReasonInput, setNewReasonInput] = useState('');

  // Calculate officer stats
  let totalProcessed = 0;
  let approvedCount = 0;
  let heldCount = 0;
  let pendingCount = 0;

  clearanceRequests.forEach(req => {
    const item = req.items.find(i => i.departmentId === department.id || i.departmentCode === department.code);
    if (item) {
      if (item.status === 'CLEARED') {
        approvedCount++;
        totalProcessed++;
      } else if (item.status === 'REJECTED' || item.status === 'NEEDS_DOCUMENT') {
        heldCount++;
        totalProcessed++;
      } else {
        pendingCount++;
      }
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(currentUser.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim()
      });
      if (onShowToast) onShowToast('Profile Updated', 'Clearance officer sign-off credentials updated.');
    }
    setIsEditing(false);
  };

  const handleAddCannedReason = () => {
    if (!newReasonInput.trim()) return;
    setCannedReasons([...cannedReasons, newReasonInput.trim()]);
    setNewReasonInput('');
    if (onShowToast) onShowToast('Template Added', 'Added fast-response rejection template.');
  };

  const handleRemoveReason = (index: number) => {
    setCannedReasons(cannedReasons.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-900 border-2 border-amber-400 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
                Authorized Signatory
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                {department.code} Clearance Unit
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {currentUser.fullName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clearance Officer • {department.name} • Hawassa University
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Edit2 className="w-4 h-4" />
          {isEditing ? 'Cancel Editing' : 'Edit Contact Info'}
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Requests Reviewed
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalProcessed}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">In current academic intake</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Approved & Cleared
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">Sign-offs granted</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Awaiting Your Action
          </span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {pendingCount}
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">Pending queue items</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Placed on Hold
          </span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {heldCount}
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">Unsettled obligations</span>
        </div>

      </div>

      {/* Main Grid: Details & Digital Seal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Officer Details & Edit Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Duty Station & Clearance Authority
          </h2>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Signatory Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={officeNumber}
                    onChange={(e) => setOfficeNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Official Clearance Unit</span>
                <strong className="text-slate-900 dark:text-white font-bold">{department.name} ({department.code})</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Official Email</span>
                <strong className="text-slate-900 dark:text-white font-bold">{email}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Direct Contact</span>
                <strong className="text-slate-900 dark:text-white font-bold">{phone}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Office Station</span>
                <strong className="text-slate-900 dark:text-white font-bold">{officeNumber}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Mandatory Department Sign-off</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {department.isMandatory ? 'Yes (Mandatory)' : 'Optional'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Digital Stamp / Official Seal Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Digital Clearance Stamp & Signature
          </h2>

          <p className="text-xs text-slate-500">
            This official digital signature and timestamp is affixed to student clearance documents whenever you approve a request.
          </p>

          {/* Stamp Preview Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-900 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            
            <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 p-1 border border-slate-200 shadow-sm flex items-center justify-center">
              <HawassaLogo className="w-12 h-12" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 block">
                Hawassa University Clearance Office
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {department.name} Digital Verification
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Signatory: {currentUser.fullName}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cryptographically Validated Stamp
            </div>
          </div>
        </div>

      </div>

      {/* Canned Rejection Reasons & Presets */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Fast-Triage Rejection & Remedy Templates
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Preset response templates to quickly provide students with actionable instructions when placing a request on hold.
            </p>
          </div>
        </div>

        {/* Add template */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add new rejection/remedy template (e.g. Return book #48102 to Library Main Desk)..."
            value={newReasonInput}
            onChange={(e) => setNewReasonInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCannedReason()}
            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
          <button
            onClick={handleAddCannedReason}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Template
          </button>
        </div>

        {/* List of canned reasons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {cannedReasons.map((reason, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                "{reason}"
              </span>
              <button
                onClick={() => handleRemoveReason(idx)}
                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                title="Delete Template"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

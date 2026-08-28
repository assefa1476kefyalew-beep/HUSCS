import React, { useState } from 'react';
import { ClearancePeriod, ClearanceReasonType } from '../../types';
import { 
  Calendar, Plus, Check, Clock, ShieldCheck, 
  Edit2, Trash2, X, Save, AlertCircle, Sparkles, Filter, Search
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface ClearancePeriodsProps {
  periods: ClearancePeriod[];
  onAddPeriod?: (period: Omit<ClearancePeriod, 'id'>) => void;
  onUpdatePeriod?: (id: string, updates: Partial<ClearancePeriod>) => void;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClearancePeriods: React.FC<ClearancePeriodsProps> = ({
  periods,
  onAddPeriod,
  onUpdatePeriod,
  onShowToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<ClearancePeriod | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formReason, setFormReason] = useState<ClearanceReasonType>('GRADUATION');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<'UPCOMING' | 'ACTIVE' | 'CLOSED'>('ACTIVE');

  const openAddModal = () => {
    setEditingPeriod(null);
    setFormTitle('2023/24 Academic Year Graduation Clearance Window');
    setFormDesc('Annual statutory clearance window for all graduating undergraduate and postgraduate cohorts.');
    setFormReason('GRADUATION');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (period: ClearancePeriod) => {
    setEditingPeriod(period);
    setFormTitle(period.title);
    setFormDesc(period.description);
    setFormReason(period.reason);
    setFormStartDate(period.startDate);
    setFormEndDate(period.endDate);
    setFormStatus(period.status);
    setIsModalOpen(true);
  };

  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingPeriod && onUpdatePeriod) {
      onUpdatePeriod(editingPeriod.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        reason: formReason,
        startDate: formStartDate,
        endDate: formEndDate,
        status: formStatus
      });
      if (onShowToast) onShowToast('Period Updated', `Saved schedule for ${formTitle}.`);
    } else if (onAddPeriod) {
      onAddPeriod({
        academicYearId: 'ay-2023-24',
        title: formTitle.trim(),
        description: formDesc.trim(),
        reason: formReason,
        startDate: formStartDate,
        endDate: formEndDate,
        eligiblePrograms: ['ALL'],
        status: formStatus
      });
      if (onShowToast) onShowToast('Period Created', `Configured new clearance window: ${formTitle}.`);
    }

    setIsModalOpen(false);
  };

  const togglePeriodActive = (period: ClearancePeriod) => {
    if (onUpdatePeriod) {
      const nextStatus = period.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
      onUpdatePeriod(period.id, { status: nextStatus });
      if (onShowToast) {
        onShowToast(
          'Intake Window Toggled',
          `${period.title} status is now ${nextStatus}.`
        );
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              Academic Calendars
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {periods.length} Clearance Windows
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Clearance Intake Windows & Statutory Deadlines
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure active university clearance windows, deadline cutoffs, and reasons across academic cohorts.
          </p>
        </div>

        <button
          id="btn-add-period"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Clearance Window
        </button>
      </div>

      {/* Periods Cards */}
      <div className="space-y-4">
        {periods.map(period => (
          <div
            key={period.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {period.title}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  period.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                    : period.status === 'UPCOMING'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {period.status === 'ACTIVE' ? 'Active Intake Window' : period.status === 'UPCOMING' ? 'Upcoming Window' : 'Closed Window'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {period.description}
              </p>

              <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  Target: {period.reason.replace(/_/g, ' ')}
                </span>
                <span>•</span>
                <span>Eligible: {period.eligiblePrograms.join(', ')}</span>
              </div>
            </div>

            {/* Date Details & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
              
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Opens:</span>
                  <strong className="text-slate-900 dark:text-white">{formatDate(period.startDate)}</strong>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Cutoff:</span>
                  <strong className="text-rose-600 dark:text-rose-400">{formatDate(period.endDate)}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(period)}
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Edit Period"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePeriodActive(period)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    period.status === 'ACTIVE'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900'
                  }`}
                >
                  {period.status === 'ACTIVE' ? 'Close Window' : 'Open Window'}
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Period Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingPeriod ? 'Edit Clearance Window' : 'Create Clearance Window'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePeriod} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clearance Window Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2023/24 Academic Year Graduation Clearance"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clearance Reason Target *
                  </label>
                  <select
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GRADUATION">Graduation Clearance</option>
                    <option value="WITHDRAWAL">Official Withdrawal</option>
                    <option value="TRANSFER">Transfer Out</option>
                    <option value="END_OF_YEAR">End of Year Dormitory</option>
                    <option value="OTHER">Other Purpose</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Window Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE (Accepting Submissions)</option>
                    <option value="UPCOMING">UPCOMING (Scheduled)</option>
                    <option value="CLOSED">CLOSED (Cutoff Enforced)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start / Opening Date *
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline / Cutoff Date *
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Intake Description & Instructions
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editingPeriod ? 'Save Changes' : 'Create Window'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { SystemSettings } from '../../types';
import { 
  Settings, Save, RefreshCw, ShieldCheck, Download, 
  Upload, Bell, CheckCircle2, AlertTriangle, Building2,
  Lock, Globe, QrCode, FileText, Sparkles, Database
} from 'lucide-react';

interface PortalSettingsProps {
  systemSettings: SystemSettings;
  onUpdateSettings?: (updates: Partial<SystemSettings>) => void;
  onResetDatabase?: () => void;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
}

export const PortalSettings: React.FC<PortalSettingsProps> = ({
  systemSettings,
  onUpdateSettings,
  onResetDatabase,
  onShowToast
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...systemSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'GENERAL' | 'REGISTRAR' | 'SECURITY' | 'MAINTENANCE'>('GENERAL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSettings) {
      onUpdateSettings(formData);
      setSavedSuccess(true);
      if (onShowToast) {
        onShowToast('Settings Saved', 'Hawassa University Clearance Portal settings updated successfully.');
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleExportBackup = () => {
    try {
      const stateJSON = localStorage.getItem('hawassa_clearance_system_v1') || JSON.stringify(systemSettings);
      const blob = new Blob([stateJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hawassa_clearance_portal_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (onShowToast) {
        onShowToast('Database Backup Exported', 'Full system state and clearance records saved to JSON.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              System Administration
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Version 2.6.0
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Hawassa University Clearance Portal Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure institutional parameters, registrar digital certificate sign-off details, verification security, and database maintenance.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-300 dark:border-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Changes Saved Successfully
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('GENERAL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'GENERAL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          University & Academic Identity
        </button>

        <button
          onClick={() => setActiveSubTab('REGISTRAR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'REGISTRAR'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Registrar Sign-Off & Certificate
        </button>

        <button
          onClick={() => setActiveSubTab('SECURITY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'SECURITY'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verification & Security
        </button>

        <button
          onClick={() => setActiveSubTab('MAINTENANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'MAINTENANCE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Database & Maintenance
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Tab 1: General */}
        {activeSubTab === 'GENERAL' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              University Identity & Contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institution Name (English)
                </label>
                <input
                  type="text"
                  value={formData.universityNameEn}
                  onChange={(e) => setFormData({ ...formData, universityNameEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institution Name (Amharic)
                </label>
                <input
                  type="text"
                  value={formData.universityNameAm}
                  onChange={(e) => setFormData({ ...formData, universityNameAm: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  University Motto
                </label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Support Phone / Hotline
                </label>
                <input
                  type="text"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowStudentDocumentResubmission}
                  onChange={(e) => setFormData({ ...formData, allowStudentDocumentResubmission: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Allow students to resubmit supporting documents upon request
                  </span>
                  <span className="text-[11px] text-slate-400">
                    If enabled, officers can request students to upload missing documents directly through the tracker.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableAutoFinalApproval}
                  onChange={(e) => setFormData({ ...formData, enableAutoFinalApproval: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Automatically generate certificate upon 8/8 departmental approvals
                  </span>
                  <span className="text-[11px] text-slate-400">
                    When enabled, the central registrar certificate is instantly created upon 100% completion.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Registrar */}
        {activeSubTab === 'REGISTRAR' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Office of the Central Registrar Sign-Off Authority
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registrar Officer Name (Printed on Certificate)
                </label>
                <input
                  type="text"
                  value={formData.registrarOfficerName}
                  onChange={(e) => setFormData({ ...formData, registrarOfficerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Title
                </label>
                <input
                  type="text"
                  value={formData.registrarOfficerTitle}
                  onChange={(e) => setFormData({ ...formData, registrarOfficerTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                Certificate Preview Seal Details
              </h3>
              <p className="text-xs text-slate-500">
                Every generated clearance certificate embeds the official Hawassa University circular seal, issue date, unique serial reference, and a 256-bit cryptographic verification signature.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Security */}
        {activeSubTab === 'SECURITY' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Public Verification & Cryptographic Security
            </h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableAuditLogging}
                  onChange={(e) => setFormData({ ...formData, enableAuditLogging: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Enable System-Wide Security Audit Logging
                  </span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Records immutable security logs for all clearance status transitions, document submissions, user role modifications, and certificate issuance events.
                  </span>
                </div>
              </label>

              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/60 flex items-start gap-3">
                <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-blue-900 dark:text-blue-300 block">
                    Tamper-Proof Digital Verification
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Certificate verification records are secured with immutable SHA hashes matching the student ID, graduation year, and registrar seal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Maintenance */}
        {activeSubTab === 'MAINTENANCE' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Data Persistence & System Maintenance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Backup */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Export Database Snapshot</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Download complete snapshot of all clearance requests, issued certificates, and audit trail logs as a JSON backup file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer w-fit"
                >
                  <Download className="w-4 h-4" />
                  Download Backup JSON
                </button>
              </div>

              {/* Reset */}
              <div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/80 dark:border-rose-900/60 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-rose-900 dark:text-rose-300">Restore Default University Seed Data</h3>
                  <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-1">
                    Restores all 8 clearance departments, standard graduation criteria, demo student records, and clearance periods.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all clearance data to default demo state?')) {
                      if (onResetDatabase) onResetDatabase();
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer w-fit"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Database
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Configuration Changes
          </button>
        </div>

      </form>

    </div>
  );
};

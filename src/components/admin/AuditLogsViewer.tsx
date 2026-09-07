import React, { useState, useMemo } from 'react';
import { AuditLog, Role } from '../../types';
import { 
  ShieldAlert, Search, Filter, Clock, Download, Plus, 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  FileText, User as UserIcon, RefreshCw, Calendar, 
  Laptop, ChevronRight, Copy, Check, Eye, Lock,
  ArrowUpDown, ExternalLink, Activity, Award, Building2,
  Sliders, Layers, Terminal, Info, Trash2
} from 'lucide-react';
import { formatDateTime, getRoleBadge } from '../../utils/helpers';

interface AuditLogsViewerProps {
  logs: AuditLog[];
  onAddAuditLog?: (log: {
    action: string;
    entity: string;
    entityId: string;
    description: string;
    previousValue?: string;
    newValue?: string;
  }) => void;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
}

type ActionCategory = 'ALL' | 'CLEARANCE' | 'CERTIFICATES' | 'SECURITY_USERS' | 'CONFIG_ACADEMIC';
type DateRangeOption = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';

export const AuditLogsViewer: React.FC<AuditLogsViewerProps> = ({ 
  logs,
  onAddAuditLog,
  onShowToast
}) => {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('ALL');
  
  // Inspector Modal State
  const [inspectedLog, setInspectedLog] = useState<AuditLog | null>(null);
  
  // Manual Log / Compliance Note Creator Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAction, setNewAction] = useState('ADMIN_SECURITY_AUDIT');
  const [newEntity, setNewEntity] = useState('SecurityPolicy');
  const [newEntityId, setNewEntityId] = useState('sec-policy-main');
  const [newDescription, setNewDescription] = useState('');
  
  // Feedback copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Classify logs by category
  const categorizeLog = (log: AuditLog): ActionCategory => {
    const action = log.action.toUpperCase();
    const entity = log.entity.toUpperCase();
    
    if (action.includes('CLEARANCE') || entity.includes('CLEARANCEITEM') || entity.includes('CLEARANCEREQUEST') || action.includes('DOCUMENT')) {
      return 'CLEARANCE';
    }
    if (action.includes('CERTIFICATE') || action.includes('VERIFICATION') || entity.includes('CERTIFICATE')) {
      return 'CERTIFICATES';
    }
    if (action.includes('USER') || action.includes('PERSONA') || action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('SIGNUP') || action.includes('PASSWORD')) {
      return 'SECURITY_USERS';
    }
    if (action.includes('PERIOD') || action.includes('SETTINGS') || action.includes('DEPARTMENT') || action.includes('REQUIREMENT') || action.includes('STUDENT')) {
      return 'CONFIG_ACADEMIC';
    }
    return 'ALL';
  };

  // Role stats calculation
  const roleStats = useMemo(() => {
    const counts: Record<string, number> = {
      SUPER_ADMIN: 0,
      REGISTRAR: 0,
      OFFICER: 0,
      STUDENT: 0,
      SYSTEM: 0
    };

    logs.forEach(log => {
      if (log.userId === 'system' || log.userFullName.toLowerCase().includes('daemon') || log.userFullName.toLowerCase().includes('system')) {
        counts.SYSTEM = (counts.SYSTEM || 0) + 1;
      } else if (log.userRole) {
        counts[log.userRole] = (counts[log.userRole] || 0) + 1;
      }
    });

    return counts;
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search text filter
      const q = search.toLowerCase();
      const matchesSearch = !search || 
        log.action.toLowerCase().includes(q) ||
        log.userFullName.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        (log.userRole && log.userRole.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Role filter
      if (selectedRole !== 'ALL') {
        if (selectedRole === 'SYSTEM') {
          const isSys = log.userId === 'system' || log.userFullName.toLowerCase().includes('system') || log.userFullName.toLowerCase().includes('daemon');
          if (!isSys) return false;
        } else if (log.userRole !== selectedRole) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        const cat = categorizeLog(log);
        if (cat !== selectedCategory) return false;
      }

      // Date range filter
      if (selectedDateRange !== 'ALL') {
        const logDate = new Date(log.timestamp).getTime();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (selectedDateRange === 'TODAY' && now - logDate > oneDay) return false;
        if (selectedDateRange === 'WEEK' && now - logDate > 7 * oneDay) return false;
        if (selectedDateRange === 'MONTH' && now - logDate > 30 * oneDay) return false;
      }

      return true;
    });
  }, [logs, search, selectedRole, selectedCategory, selectedDateRange]);

  // Paginated records
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Target Entity', 'Entity ID', 'IP Address', 'Description'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.userFullName.replace(/"/g, '""')}"`,
      l.userRole,
      l.action,
      l.entity,
      l.entityId,
      l.ipAddress,
      `"${l.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Hawassa_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('Audit Log Exported', `Exported ${filteredLogs.length} audit records to CSV.`, 'success');
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Hawassa_Security_Ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('JSON Export Complete', `Exported full forensic payload (${filteredLogs.length} records).`, 'success');
    }
  };

  const handleCreateCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    if (onAddAuditLog) {
      onAddAuditLog({
        action: newAction.trim(),
        entity: newEntity.trim(),
        entityId: newEntityId.trim() || `sec-${Date.now()}`,
        description: newDescription.trim()
      });
    }

    setNewDescription('');
    setShowCreateModal(false);
    if (onShowToast) {
      onShowToast('Audit Event Recorded', 'Compliance checkpoint entry appended to immutable security ledger.', 'success');
    }
  };

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('APPROVED') || act.includes('ISSUED') || act.includes('SUCCESS') || act.includes('COMPLETED')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (act.includes('REJECTED') || act.includes('REVOKED') || act.includes('ERROR') || act.includes('FAILED')) {
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
    if (act.includes('OVERRIDE') || act.includes('WARNING') || act.includes('HOLD') || act.includes('REQUIRED')) {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    if (act.includes('CERTIFICATE') || act.includes('REGISTRAR')) {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Institutional Security & Compliance
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Immutable Ledger Active
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            System Audit Trail & Role Activity Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Forensic audit record capturing real-time user role authorizations, clearance approvals, overrides, certificate seals, and security events.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-create-audit-note"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Compliance Note</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              id="btn-export-audit-csv"
              onClick={handleExportCSV}
              title="Download CSV report"
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>CSV</span>
            </button>
            <button
              id="btn-export-audit-json"
              onClick={handleExportJSON}
              title="Download JSON format"
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Events */}
        <button
          onClick={() => {
            setSelectedRole('ALL');
            setSelectedCategory('ALL');
            setSelectedDateRange('ALL');
            setSearch('');
          }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-left hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Audit Logs</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {logs.length}
          </p>
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
            <span>{filteredLogs.length} matching filters</span>
          </span>
        </button>

        {/* Clearance Decisions */}
        <button
          onClick={() => setSelectedCategory('CLEARANCE')}
          className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all text-left cursor-pointer group ${
            selectedCategory === 'CLEARANCE' 
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Clearance Decisions</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {logs.filter(l => categorizeLog(l) === 'CLEARANCE').length}
          </p>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
            Approvals, Rejections & Overrides
          </span>
        </button>

        {/* Certificates & Security */}
        <button
          onClick={() => setSelectedCategory('CERTIFICATES')}
          className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all text-left cursor-pointer group ${
            selectedCategory === 'CERTIFICATES' 
              ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md' 
              : 'border-slate-200 dark:border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Certificates & Seals</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {logs.filter(l => categorizeLog(l) === 'CERTIFICATES').length}
          </p>
          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-1 block">
            Registrar Seals & QR Verifications
          </span>
        </button>

        {/* User & Security Events */}
        <button
          onClick={() => setSelectedCategory('SECURITY_USERS')}
          className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all text-left cursor-pointer group ${
            selectedCategory === 'SECURITY_USERS' 
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md' 
              : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Auth & User Roles</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {logs.filter(l => categorizeLog(l) === 'SECURITY_USERS').length}
          </p>
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
            Logins, Persona Switches, Updates
          </span>
        </button>

      </div>

      {/* Role of User Activity Breakdown Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Role Activity Distribution Engine</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Filter audit events by authenticated user role to isolate administrative actions, sign-offs, and student submissions.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-400">
            Click any role to filter ledger:
          </span>
        </div>

        {/* Role Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'ALL', label: 'All Roles', count: logs.length, color: 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' },
            { id: 'SUPER_ADMIN', label: 'Super Admin', count: roleStats.SUPER_ADMIN, color: 'bg-purple-600 text-white' },
            { id: 'REGISTRAR', label: 'Registrar', count: roleStats.REGISTRAR, color: 'bg-blue-600 text-white' },
            { id: 'OFFICER', label: 'Officers & Deans', count: roleStats.OFFICER, color: 'bg-indigo-600 text-white' },
            { id: 'STUDENT', label: 'Students', count: roleStats.STUDENT, color: 'bg-emerald-600 text-white' },
            { id: 'SYSTEM', label: 'System Automated', count: roleStats.SYSTEM, color: 'bg-slate-600 text-white' }
          ].map(role => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setCurrentPage(1);
                }}
                className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                    {role.label}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {role.count}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {logs.length > 0 ? `${Math.round((role.count / logs.length) * 100)}%` : '0%'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual Multi-Segment Role Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${(roleStats.SUPER_ADMIN / (logs.length || 1)) * 100}%` }} 
              className="h-full bg-purple-600 transition-all" 
              title={`Super Admin: ${roleStats.SUPER_ADMIN}`}
            />
            <div 
              style={{ width: `${(roleStats.REGISTRAR / (logs.length || 1)) * 100}%` }} 
              className="h-full bg-blue-600 transition-all" 
              title={`Registrar: ${roleStats.REGISTRAR}`}
            />
            <div 
              style={{ width: `${(roleStats.OFFICER / (logs.length || 1)) * 100}%` }} 
              className="h-full bg-indigo-600 transition-all" 
              title={`Officers: ${roleStats.OFFICER}`}
            />
            <div 
              style={{ width: `${(roleStats.STUDENT / (logs.length || 1)) * 100}%` }} 
              className="h-full bg-emerald-600 transition-all" 
              title={`Students: ${roleStats.STUDENT}`}
            />
            <div 
              style={{ width: `${(roleStats.SYSTEM / (logs.length || 1)) * 100}%` }} 
              className="h-full bg-slate-500 transition-all" 
              title={`System: ${roleStats.SYSTEM}`}
            />
          </div>
        </div>
      </div>

      {/* Filter Bar & Table Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by actor name, action, IP, entity ID, or description..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Secondary Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => { setSelectedCategory('ALL'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setSelectedCategory('CLEARANCE'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'CLEARANCE' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Clearances
              </button>
              <button
                onClick={() => { setSelectedCategory('CERTIFICATES'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'CERTIFICATES' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Certificates
              </button>
              <button
                onClick={() => { setSelectedCategory('SECURITY_USERS'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'SECURITY_USERS' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Auth/Users
              </button>
              <button
                onClick={() => { setSelectedCategory('CONFIG_ACADEMIC'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCategory === 'CONFIG_ACADEMIC' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Rules/Config
              </button>
            </div>

            {/* Date Range Dropdown */}
            <select
              value={selectedDateRange}
              onChange={(e) => {
                setSelectedDateRange(e.target.value as DateRangeOption);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Time Periods</option>
              <option value="TODAY">Today Only</option>
              <option value="WEEK">Past 7 Days</option>
              <option value="MONTH">Past 30 Days</option>
            </select>

          </div>

        </div>

        {/* Active Filters Summary Banner */}
        {(selectedRole !== 'ALL' || selectedCategory !== 'ALL' || selectedDateRange !== 'ALL' || search) && (
          <div className="flex items-center justify-between gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-800 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-blue-900 dark:text-blue-200">Active Filters:</span>
              {selectedRole !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-semibold text-[11px]">
                  Role: {selectedRole}
                </span>
              )}
              {selectedCategory !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-semibold text-[11px]">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedDateRange !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-semibold text-[11px]">
                  Time: {selectedDateRange}
                </span>
              )}
              {search && (
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                  Query: "{search}"
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedRole('ALL');
                setSelectedCategory('ALL');
                setSelectedDateRange('ALL');
                setSearch('');
              }}
              className="text-blue-700 dark:text-blue-400 font-bold hover:underline shrink-0"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap">Timestamp</th>
                  <th className="px-4 py-3.5">User Actor & Role</th>
                  <th className="px-4 py-3.5">Action Executed</th>
                  <th className="px-4 py-3.5">Target Entity</th>
                  <th className="px-4 py-3.5">IP & Node</th>
                  <th className="px-5 py-3.5">Forensic Details</th>
                  <th className="px-3 py-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-600 dark:text-slate-300">No matching audit events</p>
                        <p className="text-xs text-slate-400">Try adjusting your role or category filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map(log => {
                    const roleBadge = getRoleBadge(log.userRole);
                    return (
                      <tr 
                        key={log.id} 
                        onClick={() => setInspectedLog(log)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        {/* Timestamp */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono-code text-[11px] text-slate-700 dark:text-slate-300 font-semibold block">
                            {formatDateTime(log.timestamp)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </td>

                        {/* Actor & Role */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                              {log.userFullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {log.userFullName}
                              </p>
                              <span className={`inline-block px-1.5 py-0.2 text-[9px] font-black rounded-sm ${roleBadge.color}`}>
                                {log.userRole || 'SYSTEM'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-md font-mono-code font-bold text-[10px] border shadow-2xs ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {log.entity}
                          </p>
                          <span className="text-[10px] font-mono-code text-slate-400">
                            {log.entityId}
                          </span>
                        </td>

                        {/* IP Address */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono-code text-[11px] text-slate-500">
                          {log.ipAddress}
                        </td>

                        {/* Details */}
                        <td className="px-5 py-3.5 max-w-xs sm:max-w-md">
                          <p className="text-slate-600 dark:text-slate-300 truncate text-xs font-medium">
                            {log.description}
                          </p>
                        </td>

                        {/* Action Button */}
                        <td className="px-3 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedLog(log);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="Inspect log metadata"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} events
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Forensic Inspection Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-6 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Audit Log Forensic Inspection
                  </h3>
                  <p className="text-xs text-slate-500 font-mono-code">
                    Log Entry ID: {inspectedLog.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectedLog(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Grid Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block font-semibold">Event Timestamp (UTC & Local)</span>
                <strong className="text-slate-900 dark:text-white font-mono-code block mt-0.5">
                  {formatDateTime(inspectedLog.timestamp)}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono-code">
                  {inspectedLog.timestamp}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block font-semibold">User Role & Authenticated Actor</span>
                <strong className="text-slate-900 dark:text-white block mt-0.5">
                  {inspectedLog.userFullName}
                </strong>
                <span className="text-[10px] font-mono-code font-bold text-blue-600 dark:text-blue-400">
                  Role: {inspectedLog.userRole || 'SYSTEM'} (ID: {inspectedLog.userId})
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block font-semibold">Target Entity & Entity Key</span>
                <strong className="text-slate-900 dark:text-white block mt-0.5">
                  {inspectedLog.entity}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono-code">
                  Key: {inspectedLog.entityId}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400 block font-semibold">Client Network IP & Origin</span>
                <strong className="text-slate-900 dark:text-white font-mono-code block mt-0.5">
                  {inspectedLog.ipAddress}
                </strong>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Hawassa University Intranet Gateway
                </span>
              </div>
            </div>

            {/* Description & Payload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Detailed Event Description & Audit Narrative
              </label>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {inspectedLog.description}
              </div>
            </div>

            {/* User Agent */}
            {inspectedLog.userAgent && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 font-mono-code truncate">
                Client Device Agent: {inspectedLog.userAgent}
              </div>
            )}

            {/* Cryptographic Checksum Banner */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-900 dark:text-emerald-200 font-semibold text-[11px]">
                  Cryptographic SHA-256 Ledger Integrity Signature: Verified
                </span>
              </div>
              <button
                onClick={() => handleCopyText(JSON.stringify(inspectedLog, null, 2), inspectedLog.id)}
                className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer border border-emerald-300/80"
              >
                {copiedId === inspectedLog.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === inspectedLog.id ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Compliance Note / Test Log Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Record Compliance Audit Checkpoint
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomLog} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Audit Action Type *
                </label>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono-code font-bold"
                >
                  <option value="ADMIN_SECURITY_AUDIT">ADMIN_SECURITY_AUDIT</option>
                  <option value="CLEARANCE_SYSTEM_CHECKPOINT">CLEARANCE_SYSTEM_CHECKPOINT</option>
                  <option value="POLICY_COMPLIANCE_VERIFIED">POLICY_COMPLIANCE_VERIFIED</option>
                  <option value="DATA_INTEGRITY_SNAPSHOT">DATA_INTEGRITY_SNAPSHOT</option>
                  <option value="CUSTOM_OFFICER_SIGN_OFF_NOTE">CUSTOM_OFFICER_SIGN_OFF_NOTE</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Entity
                  </label>
                  <input
                    type="text"
                    value={newEntity}
                    onChange={(e) => setNewEntity(e.target.value)}
                    required
                    placeholder="e.g. ClearanceRequest"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono-code"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Entity ID Key
                  </label>
                  <input
                    type="text"
                    value={newEntityId}
                    onChange={(e) => setNewEntityId(e.target.value)}
                    placeholder="e.g. clr-req-2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono-code"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Audit Narrative & Compliance Note *
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe the compliance check, rationale, or administrative verification note..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Append to Security Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

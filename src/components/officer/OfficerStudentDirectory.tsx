import React, { useState } from 'react';
import { Student, ClearanceRequest } from '../../types';
import { 
  Search, User, Mail, Phone, MapPin, GraduationCap, 
  Building2, Users, List, Grid, Filter, Plus, 
  Upload, Download, ShieldCheck, Clock, AlertTriangle, 
  CheckCircle2, X, Sparkles, ChevronRight, Eye, ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface OfficerStudentDirectoryProps {
  students: Student[];
  clearanceRequests: ClearanceRequest[];
  onAddStudent?: (student: Omit<Student, 'id'>) => void;
  onImportBatch?: (students: Omit<Student, 'id'>[]) => void;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateTab?: (tab: string) => void;
}

export const OfficerStudentDirectory: React.FC<OfficerStudentDirectoryProps> = ({
  students,
  clearanceRequests,
  onAddStudent,
  onImportBatch,
  onShowToast,
  onNavigateTab
}) => {
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+251 91 100 2233');
  const [formCollege, setFormCollege] = useState('IoT (Institute of Technology)');
  const [formDept, setFormDept] = useState('Software Engineering');
  const [formCampus, setFormCampus] = useState('Main Campus');
  const [formBlock, setFormBlock] = useState('Block 42');
  const [formDorm, setFormDorm] = useState('Dorm 204');
  const [formYear, setFormYear] = useState(2024);

  // Calculate Metrics
  const totalCount = students.length;
  const inProgressCount = clearanceRequests.filter(r => r.overallStatus === 'IN_PROGRESS' || r.overallStatus === 'SUBMITTED' || r.overallStatus === 'PARTIALLY_CLEARED' || r.overallStatus === 'PENDING').length;
  const clearedCount = clearanceRequests.filter(r => r.overallStatus === 'APPROVED' || r.overallStatus === 'COMPLETED').length;
  const onHoldCount = clearanceRequests.filter(r => r.overallStatus === 'ON_HOLD' || r.overallStatus === 'REJECTED').length;

  // Filtering
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.college.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchesCollege = selectedCollege === 'ALL' || s.college.includes(selectedCollege) || s.college === selectedCollege;

    const req = clearanceRequests.find(r => r.studentId === s.id);
    const reqStatus = req ? req.overallStatus : 'NOT_INITIATED';
    
    let matchesStatus = true;
    if (selectedStatus === 'ALL') {
      matchesStatus = true;
    } else if (selectedStatus === 'IN_PROGRESS') {
      matchesStatus = reqStatus === 'IN_PROGRESS' || reqStatus === 'SUBMITTED' || reqStatus === 'PARTIALLY_CLEARED' || reqStatus === 'PENDING';
    } else if (selectedStatus === 'APPROVED') {
      matchesStatus = reqStatus === 'APPROVED' || reqStatus === 'COMPLETED';
    } else if (selectedStatus === 'ON_HOLD') {
      matchesStatus = reqStatus === 'ON_HOLD' || reqStatus === 'REJECTED';
    } else if (selectedStatus === 'NOT_INITIATED') {
      matchesStatus = reqStatus === 'NOT_INITIATED' || !req;
    } else {
      matchesStatus = reqStatus === selectedStatus;
    }

    return matchesSearch && matchesCollege && matchesStatus;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim()) return;

    if (onAddStudent) {
      onAddStudent({
        studentId: formId.trim().toUpperCase(),
        fullName: formName.trim(),
        email: formEmail.trim() || `${formId.trim().toLowerCase()}@hu.edu.et`,
        phoneNumber: formPhone,
        department: formDept,
        college: formCollege,
        program: 'Regular Undergraduate',
        degreeLevel: 'B.Sc.',
        admissionYear: 2019,
        expectedGraduationYear: formYear,
        campus: formCampus,
        blockNumber: formBlock,
        dormitoryNumber: formDorm,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formName}`
      });
      if (onShowToast) {
        onShowToast('Student Enrolled', `Added ${formName} (${formId}) to university database.`);
      }
    }

    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Email', 'Phone', 'College', 'Department', 'Degree', 'Campus', 'Clearance Status'];
    const rows = filteredStudents.map(s => {
      const req = clearanceRequests.find(r => r.studentId === s.id);
      return [
        s.studentId,
        `"${s.fullName}"`,
        s.email,
        s.phoneNumber || '',
        `"${s.college}"`,
        `"${s.department}"`,
        s.degreeLevel,
        s.campus,
        req ? req.overallStatus : 'NOT_INITIATED'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hawassa_students_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast('Roster Exported', `Exported ${filteredStudents.length} student records.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner with Total Number of Students */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              Master Academic Registry
            </span>
            
            {/* Attractive Total Number of Students Pill */}
            <div 
              id="student-db-total-hero-pill"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Total Students: {totalCount}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Student Database & Profile Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Synchronized university roster across 8 colleges, residential dormitory blocks, and clearance status.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            id="btn-add-new-student"
            onClick={() => {
              setFormId(`UGR/${Math.floor(10000 + Math.random() * 90000)}/14`);
              setFormName('');
              setFormEmail('');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* List-wise Information Summary Cards with Clickable Filter & Navigation Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Enrolled Card */}
        <div 
          id="metric-card-total-enrolled"
          onClick={() => setSelectedStatus('ALL')}
          className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-left ${
            selectedStatus === 'ALL'
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            {selectedStatus === 'ALL' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                Active Filter
              </span>
            )}
          </div>
          <div className="mt-3 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Filter list
              </span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount} Students</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              All registered university students
            </p>
          </div>
        </div>

        {/* Active Clearance Card */}
        <div 
          id="metric-card-active-clearance"
          onClick={() => setSelectedStatus('IN_PROGRESS')}
          className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-left ${
            selectedStatus === 'IN_PROGRESS'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            {onNavigateTab ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('admin-clearances');
                }}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/60 dark:border-amber-800 transition-all flex items-center gap-1 cursor-pointer"
                title="Navigate to Clearance Requests"
              >
                <span>Clearances</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ) : selectedStatus === 'IN_PROGRESS' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                Active Filter
              </span>
            ) : null}
          </div>
          <div className="mt-3 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Clearance</p>
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Filter list
              </span>
            </div>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{inProgressCount} in-progress</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Under multi-department review
            </p>
          </div>
        </div>

        {/* Cleared & Certified Card */}
        <div 
          id="metric-card-cleared-certified"
          onClick={() => setSelectedStatus('APPROVED')}
          className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-left ${
            selectedStatus === 'APPROVED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {onNavigateTab ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('admin-certificates');
                }}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300/60 dark:border-emerald-800 transition-all flex items-center gap-1 cursor-pointer"
                title="Navigate to Certificate Registry"
              >
                <span>Certificates</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ) : selectedStatus === 'APPROVED' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                Active Filter
              </span>
            ) : null}
          </div>
          <div className="mt-3 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cleared & Certified</p>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Filter list
              </span>
            </div>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{clearedCount} completed</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Fully approved for graduation
            </p>
          </div>
        </div>

        {/* Action Holds Card */}
        <div 
          id="metric-card-action-holds"
          onClick={() => setSelectedStatus('ON_HOLD')}
          className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-left ${
            selectedStatus === 'ON_HOLD'
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {onNavigateTab ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('admin-clearances');
                }}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 hover:bg-rose-200 dark:hover:bg-rose-900 border border-rose-300/60 dark:border-rose-800 transition-all flex items-center gap-1 cursor-pointer"
                title="Navigate to Clearance Requests with Holds"
              >
                <span>Holds Queue</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ) : selectedStatus === 'ON_HOLD' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                Active Filter
              </span>
            ) : null}
          </div>
          <div className="mt-3 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action Holds</p>
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Filter list
              </span>
            </div>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{onHoldCount} holds</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Active departmental obligations
            </p>
          </div>
        </div>

      </div>

      {/* Filter & View Mode Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student ID, name, email, department, college..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Filters & View Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">All Colleges</option>
            <option value="IoT">IoT (Technology)</option>
            <option value="Medicine">Medicine & Health</option>
            <option value="Business">Business & Economics</option>
            <option value="Social Sciences">Social Sciences</option>
            <option value="Natural">Natural Sciences</option>
            <option value="Agriculture">Agriculture</option>
          </select>

          <select
            id="select-student-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden font-medium"
          >
            <option value="ALL">All Statuses ({totalCount})</option>
            <option value="IN_PROGRESS">Active Clearance ({inProgressCount})</option>
            <option value="APPROVED">Cleared & Certified ({clearedCount})</option>
            <option value="ON_HOLD">Action Holds ({onHoldCount})</option>
            <option value="NOT_INITIATED">Not Initiated</option>
          </select>

          {/* List vs Grid Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">List</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'GRID'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Grid</span>
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          VIEW MODE 1: LIST-WISE TABULAR STUDENT INFORMATION
         ========================================================================= */}
      {viewMode === 'LIST' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student & ID</th>
                  <th className="py-3.5 px-4">College & Department</th>
                  <th className="py-3.5 px-4">Program & Class</th>
                  <th className="py-3.5 px-4">Campus & Dorm</th>
                  <th className="py-3.5 px-4">Clearance Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No matching student records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const req = clearanceRequests.find(r => r.studentId === student.id);
                    
                    return (
                      <tr 
                        key={student.id} 
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Student Name & ID */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.fullName}`}
                              alt={student.fullName}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {student.fullName}
                              </p>
                              <p className="font-mono-code text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                                {student.studentId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* College & Department */}
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900 dark:text-slate-200">
                            {student.department}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {student.college}
                          </p>
                        </td>

                        {/* Program & Class */}
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900 dark:text-slate-200">
                            {student.program}
                          </p>
                          <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            Class of {student.expectedGraduationYear} • {student.degreeLevel}
                          </span>
                        </td>

                        {/* Campus & Dormitory */}
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 dark:text-slate-300">
                            {student.campus}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {student.blockNumber ? `${student.blockNumber}, ${student.dormitoryNumber}` : 'Off-Campus'}
                          </p>
                        </td>

                        {/* Clearance Status */}
                        <td className="py-3 px-4">
                          {req ? (
                            <StatusBadge status={req.overallStatus} type="overall" size="sm" />
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Not Initiated
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedStudentDetail(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Full Profile"
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
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: GRID CARDS
         ========================================================================= */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const req = clearanceRequests.find(r => r.studentId === student.id);

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.fullName}`}
                      alt={student.fullName}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {student.fullName}
                      </h3>
                      <p className="text-xs font-mono-code font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        {student.studentId}
                      </p>
                      <span className="inline-block text-[10px] font-semibold text-slate-500">
                        Class of {student.expectedGraduationYear} • {student.degreeLevel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{student.department}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{student.program}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{student.campus} • {student.blockNumber ? `${student.blockNumber}, ${student.dormitoryNumber}` : 'Off-Campus'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Clearance Status:</span>
                  {req ? (
                    <StatusBadge status={req.overallStatus} type="overall" size="sm" />
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">Not Initiated</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          ADD STUDENT MODAL
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Add Student to Registry
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID Number *
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 font-mono-code font-bold uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Yohannes Mengistu"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    College *
                  </label>
                  <select
                    value={formCollege}
                    onChange={(e) => setFormCollege(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IoT (Institute of Technology)">IoT (Institute of Technology)</option>
                    <option value="College of Medicine and Health Sciences">College of Medicine and Health Sciences</option>
                    <option value="College of Business and Economics">College of Business and Economics</option>
                    <option value="College of Social Sciences and Humanities">College of Social Sciences and Humanities</option>
                    <option value="College of Natural and Computational Sciences">College of Natural and Computational Sciences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campus *
                  </label>
                  <select
                    value={formCampus}
                    onChange={(e) => setFormCampus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Main Campus">Main Campus</option>
                    <option value="Tech Campus">Tech Campus</option>
                    <option value="Medicine Campus">Medicine Campus</option>
                    <option value="Wondo Genet Campus">Wondo Genet Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dormitory Block & Room
                  </label>
                  <input
                    type="text"
                    value={`${formBlock}, ${formDorm}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setFormBlock(parts[0] || 'Block 42');
                      setFormDorm(parts[1] || 'Dorm 204');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Register Student
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          STUDENT DETAIL DRAWER MODAL
         ========================================================================= */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Student Profile Dossier
              </h3>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedStudentDetail.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudentDetail.fullName}`}
                alt={selectedStudentDetail.fullName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/30 shrink-0"
              />
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedStudentDetail.fullName}
                </h4>
                <p className="font-mono-code font-bold text-xs text-blue-600 dark:text-blue-400">
                  {selectedStudentDetail.studentId}
                </p>
                <p className="text-[11px] text-slate-400">
                  {selectedStudentDetail.email}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="flex justify-between">
                <span className="text-slate-400">College:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedStudentDetail.college}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedStudentDetail.department}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Program:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedStudentDetail.program} ({selectedStudentDetail.degreeLevel})</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Residential:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedStudentDetail.campus} • {selectedStudentDetail.blockNumber}, {selectedStudentDetail.dormitoryNumber}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Graduation Year:</span>
                <strong className="text-slate-800 dark:text-slate-200">Class of {selectedStudentDetail.expectedGraduationYear}</strong>
              </p>
            </div>

            <button
              onClick={() => setSelectedStudentDetail(null)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

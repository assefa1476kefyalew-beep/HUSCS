import React, { useState } from 'react';
import { Student, ClearanceRequest } from '../../types';
import { Search, User, Mail, Phone, MapPin, GraduationCap, Building2 } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface OfficerStudentDirectoryProps {
  students: Student[];
  clearanceRequests: ClearanceRequest[];
}

export const OfficerStudentDirectory: React.FC<OfficerStudentDirectoryProps> = ({
  students,
  clearanceRequests
}) => {
  const [search, setSearch] = useState('');

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.college.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            University Directory
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Student Lookup & Profile Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search synchronized academic records, residential blocks, and clearance status.
          </p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student ID, name, college..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => {
          const req = clearanceRequests.find(r => r.studentId === student.id);

          return (
            <div
              key={student.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'}
                    alt={student.fullName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {student.fullName}
                    </h3>
                    <p className="text-xs font-mono-code font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      {student.studentId}
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-slate-500">
                      Class of {student.expectedGraduationYear}
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
                    <span>{student.program} ({student.degreeLevel})</span>
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

    </div>
  );
};

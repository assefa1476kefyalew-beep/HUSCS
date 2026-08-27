import React, { useState } from 'react';
import { Student, User } from '../../types';
import { 
  User as UserIcon, Mail, Phone, MapPin, 
  Building2, GraduationCap, Calendar, Lock, 
  Check, ShieldCheck, Home 
} from 'lucide-react';

interface StudentProfileProps {
  student: Student;
  user: User;
  onUpdateProfile?: (studentId: string, updates: Partial<Student>) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  user,
  onUpdateProfile
}) => {
  const [phone, setPhone] = useState(student.phone);
  const [email, setEmail] = useState(student.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(student.id, { phone, email });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Profile Card Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <img
          src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
          alt={student.fullName}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-100 dark:ring-blue-900 shadow-md"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {student.program}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {student.status}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {student.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            ID: <span className="font-mono-code font-bold text-slate-700 dark:text-slate-300">{student.studentId}</span> • {student.department}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {student.college} • {student.campus}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Read-only Academic Record */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Academic Information (SIS Synchronized)
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">Student ID Number</span>
              <span className="font-mono-code font-bold text-slate-900 dark:text-white">{student.studentId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">College / Institute</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right max-w-xs">{student.college}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">Academic Department</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right">{student.department}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">Degree & Program</span>
              <span className="font-semibold text-slate-900 dark:text-white">{student.degreeLevel} • {student.program}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">Admission Year</span>
              <span className="font-semibold text-slate-900 dark:text-white">{student.admissionYear}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500">Expected Graduation Year</span>
              <span className="font-semibold text-slate-900 dark:text-white">{student.expectedGraduationYear}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Dormitory Housing</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {student.blockNumber ? `${student.blockNumber}, ${student.dormitoryNumber}` : 'Off-Campus'}
              </span>
            </div>
          </div>
        </div>

        {/* Editable Contact Details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Contact Details
            </h2>
          </div>

          <form onSubmit={handleSaveContact} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                Official University Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                Mobile Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {isSaved && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-semibold text-center flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Contact information saved successfully!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
            >
              Update Contact Information
            </button>
          </form>
        </div>

      </div>

      {/* Security & Password Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Lock className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Account Security & Password
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2">
            {passwordError && (
              <span className="text-rose-600 font-medium">{passwordError}</span>
            )}
            {passwordSaved && (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Password changed successfully!
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer shadow-xs"
              >
                Change Password
              </button>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
};

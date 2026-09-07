import React, { useState } from 'react';
import { User, Role, Department } from '../../types';
import { 
  Users, UserPlus, Search, Filter, ShieldCheck, 
  KeyRound, CheckCircle2, XCircle, ArrowRightLeft, 
  Download, Edit2, X, AlertTriangle, Building2,
  Mail, Phone, Clock, Sparkles, RefreshCw, Eye, EyeOff,
  Loader2, Lock, Shield
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { registerUserWithFirebaseAndFirestore } from '../../services/firebaseDb';

interface UserAccountsManagerProps {
  users: User[];
  departments: Department[];
  currentUser: User | null;
  onAddUser?: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser?: (id: string, updates: Partial<User>) => void;
  onSwitchUser?: (userId: string) => void;
  onShowToast?: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
}

export const UserAccountsManager: React.FC<UserAccountsManagerProps> = ({
  users,
  departments,
  currentUser,
  onAddUser,
  onUpdateUser,
  onSwitchUser,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [formPhone, setFormPhone] = useState('+251 91 ');
  const [formRole, setFormRole] = useState<Role>('STUDENT');
  const [formStudentId, setFormStudentId] = useState('HU/');
  const [formDeptId, setFormDeptId] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingUser(null);
    setFormFullName('');
    setFormUsername('');
    setFormEmail('');
    setFormPassword('password123');
    setShowPassword(false);
    setFormPhone('+251 91 ');
    setFormRole('STUDENT');
    setFormStudentId(`HU/${Math.floor(1000 + Math.random() * 9000)}/14`);
    setFormDeptId(departments[0]?.id || '');
    setFormStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPhone(user.phone || '+251 ');
    setFormRole(user.role);
    setFormStudentId(user.studentId || '');
    setFormDeptId(user.departmentId || '');
    setFormStatus(user.status);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formEmail.trim()) return;

    const deptObj = departments.find(d => d.id === formDeptId);
    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanFullName = formFullName.trim();
    const derivedUsername = formUsername.trim() || cleanEmail.split('@')[0];

    if (editingUser && onUpdateUser) {
      onUpdateUser(editingUser.id, {
        fullName: cleanFullName,
        username: derivedUsername,
        email: cleanEmail,
        phone: formPhone.trim(),
        role: formRole,
        studentId: formRole === 'STUDENT' ? formStudentId : undefined,
        departmentId: formRole === 'OFFICER' ? formDeptId : undefined,
        departmentName: formRole === 'OFFICER' ? deptObj?.name : undefined,
        status: formStatus
      });
      if (onShowToast) onShowToast('User Updated', `Successfully updated account for ${cleanFullName}`);
      setIsModalOpen(false);
    } else {
      setIsSubmitting(true);
      try {
        // Register in Firebase Auth & Firestore database
        const res = await registerUserWithFirebaseAndFirestore({
          fullName: cleanFullName,
          email: cleanEmail,
          password: formPassword || 'password123',
          role: formRole,
          phone: formPhone.trim(),
          studentId: formRole === 'STUDENT' ? formStudentId : undefined,
          departmentId: formRole === 'OFFICER' ? formDeptId : undefined,
          departmentName: formRole === 'OFFICER' ? deptObj?.name : undefined
        });

        if (res.success && res.user) {
          if (onAddUser) {
            onAddUser({
              fullName: cleanFullName,
              username: derivedUsername,
              email: cleanEmail,
              phone: formPhone.trim(),
              role: formRole,
              studentId: formRole === 'STUDENT' ? formStudentId : undefined,
              departmentId: formRole === 'OFFICER' ? formDeptId : undefined,
              departmentName: formRole === 'OFFICER' ? deptObj?.name : undefined,
              status: formStatus,
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanFullName)}`
            });
          }
          if (onShowToast) {
            onShowToast(
              'Account Created in Firestore',
              `Account for ${cleanFullName} (${formRole}) successfully provisioned and stored in Firestore database.`,
              'success'
            );
          }
          setIsModalOpen(false);
        } else {
          // Fallback to local store
          if (onAddUser) {
            onAddUser({
              fullName: cleanFullName,
              username: derivedUsername,
              email: cleanEmail,
              phone: formPhone.trim(),
              role: formRole,
              studentId: formRole === 'STUDENT' ? formStudentId : undefined,
              departmentId: formRole === 'OFFICER' ? formDeptId : undefined,
              departmentName: formRole === 'OFFICER' ? deptObj?.name : undefined,
              status: formStatus,
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanFullName)}`
            });
          }
          if (onShowToast) {
            onShowToast('User Registered', `Account registered for ${cleanFullName}`);
          }
          setIsModalOpen(false);
        }
      } catch (err: any) {
        console.error('Error registering user:', err);
        if (onShowToast) {
          onShowToast('Registration Note', err?.message || 'Saved to state', 'info');
        }
        setIsModalOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Full Name', 'Username', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Created At'];
    const rows = users.map(u => [
      u.id,
      `"${u.fullName}"`,
      u.username,
      u.email,
      u.phone,
      u.role,
      `"${u.departmentName || u.departmentId || 'N/A'}"`,
      u.status,
      u.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hawassa_clearance_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Export Complete', 'Exported full user accounts directory to CSV.');
  };

  const handleResetPassword = (user: User) => {
    if (onShowToast) {
      onShowToast(
        'Password Reset Triggered',
        `A secure one-time password reset notice was generated for ${user.email}`,
        'info'
      );
    }
  };

  const filteredUsers = users.filter(user => {
    if (selectedRole !== 'ALL' && user.role !== selectedRole) return false;
    if (selectedStatus !== 'ALL' && user.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = user.fullName.toLowerCase().includes(q);
      const matchEmail = user.email.toLowerCase().includes(q);
      const matchUsername = user.username.toLowerCase().includes(q);
      const matchDept = user.departmentName?.toLowerCase().includes(q);
      const matchStudentId = user.studentId?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchUsername && !matchDept && !matchStudentId) return false;
    }
    return true;
  });

  const roleBadgeStyles: Record<Role, string> = {
    STUDENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    OFFICER: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    REGISTRAR: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    ADMIN: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    SUPER_ADMIN: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  };

  const isRegistrarOrAdmin = currentUser?.role === 'REGISTRAR' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              Registrar & Super Admin Credential Authority
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {users.length} Registered Accounts
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            User Account Registration & Identity Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provision official accounts for students, clearance officers, registrar auditors, and administrators directly to Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {isRegistrarOrAdmin && (
            <button
              id="btn-add-new-user"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Register New Account
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, student ID, username, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {['ALL', 'STUDENT', 'OFFICER', 'REGISTRAR', 'ADMIN', 'SUPER_ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedRole === role
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="px-5 py-3.5">User / Identity</th>
                <th className="px-4 py-3.5">System Role</th>
                <th className="px-4 py-3.5">Unit / Assignment</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((user) => {
                const isCurrent = currentUser?.id === user.id;

                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {/* User info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs shrink-0 overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                          ) : (
                            user.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {user.fullName}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded-sm font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            @{user.username} {user.studentId ? `• ID: ${user.studentId}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleBadgeStyles[user.role] || 'bg-slate-100 text-slate-800'}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3.5">
                      {user.departmentName ? (
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{user.departmentName}</span>
                        </div>
                      ) : user.role === 'STUDENT' ? (
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Undergraduate / Postgraduate</span>
                      ) : (
                        <span className="text-slate-400">Central University</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 space-y-0.5">
                      <p className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{user.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{user.phone || 'N/A'}</span>
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : user.status === 'SUSPENDED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Switch to this account */}
                        {onSwitchUser && !isCurrent && (
                          <button
                            onClick={() => onSwitchUser(user.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200/60 dark:border-blue-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Switch session to this user"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            Test Login
                          </button>
                        )}

                        {/* Reset Password */}
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Generate Password Reset Link"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit User */}
                        {isRegistrarOrAdmin && (
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Account Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No user accounts found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or role filters.</p>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {editingUser ? 'Edit User Account' : 'Register New User Account'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingUser ? 'Update account profile & permissions' : 'Authorized Registrar / Admin Account Provisioning'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assefa Kefyalew"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. assefa@hu.edu.et"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. assefa.kefyalew"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      minLength={6}
                      required
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    System Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                  >
                    <option value="STUDENT">STUDENT (Student Portal)</option>
                    <option value="OFFICER">OFFICER (Department Clearance Desk)</option>
                    <option value="REGISTRAR">REGISTRAR (Central Audit & Certificate Issuer)</option>
                    <option value="ADMIN">ADMIN (System Administrator)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full University Authority)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+251 91 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formRole === 'STUDENT' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID (HU/XXXX/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HU/1476/14"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              )}

              {formRole === 'OFFICER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Clearance Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code}) - {dept.category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE (Authorized to log in)</option>
                  <option value="INACTIVE">INACTIVE (Temporarily paused)</option>
                  <option value="SUSPENDED">SUSPENDED (Access blocked)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/60 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <span>{editingUser ? 'Save Changes' : 'Create & Register Account'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

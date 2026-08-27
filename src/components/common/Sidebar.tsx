import React from 'react';
import { 
  LayoutDashboard, FileText, CheckSquare, FolderOpen, 
  Award, Bell, User, Users, Building2, Sliders, 
  Calendar, ShieldAlert, BarChart3, Settings, 
  Search, X, ShieldCheck, FileCheck, Layers, LogOut,
  Sparkles, ChevronRight, Menu, PanelLeftClose, ChevronLeft
} from 'lucide-react';
import { Role, User as UserType } from '../../types';

interface SidebarProps {
  currentRole: Role;
  currentUser: UserType | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  isCollapsed?: boolean;
  onClose: () => void;
  onToggle?: () => void;
  pendingCount?: number;
  unreadNotifsCount?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentUser,
  activeTab,
  onTabChange,
  isOpen,
  isCollapsed = false,
  onClose,
  onToggle,
  pendingCount = 0,
  unreadNotifsCount = 0,
  onLogout
}) => {
  const getNavItems = () => {
    switch (currentRole) {
      case 'STUDENT':
        return [
          { id: 'student-dashboard', label: 'My Dashboard', icon: LayoutDashboard, hint: 'Overview & progress' },
          { id: 'student-clearance', label: 'My Clearance Request', icon: FileText, hint: '8-department clearance flow' },
          { id: 'student-documents', label: 'Supporting Documents', icon: FolderOpen, hint: 'ID & proof attachments' },
          { id: 'student-certificate', label: 'Clearance Certificate', icon: Award, hint: 'Official graduation document' },
          { id: 'student-notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount, hint: 'Updates & alerts' },
          { id: 'student-profile', label: 'Student Profile', icon: User, hint: 'Personal & academic record' }
        ];

      case 'OFFICER':
        return [
          { id: 'officer-dashboard', label: 'Department Dashboard', icon: LayoutDashboard, hint: 'Department queue summary' },
          { id: 'officer-queue', label: 'Clearance Requests', icon: CheckSquare, badge: pendingCount, hint: 'Approve or hold students' },
          { id: 'officer-students', label: 'Student Directory', icon: Search, hint: 'Search university roster' },
          { id: 'officer-reports', label: 'Department Analytics', icon: BarChart3, hint: 'Clearance turnaround metrics' },
          { id: 'officer-notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount, hint: 'Incoming requests' },
          { id: 'officer-profile', label: 'Officer Profile', icon: User, hint: 'Sign-off credentials' }
        ];

      case 'REGISTRAR':
        return [
          { id: 'admin-dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, hint: 'Executive summary' },
          { id: 'admin-clearances', label: 'All Clearance Requests', icon: FileCheck, badge: pendingCount, hint: 'All campus workflows' },
          { id: 'admin-certificates', label: 'Issued Certificates', icon: Award, hint: 'Official digital certificates' },
          { id: 'admin-students', label: 'Student Database', icon: Users, hint: 'Academic registry' },
          { id: 'admin-periods', label: 'Clearance Periods', icon: Calendar, hint: 'Active terms & dates' },
          { id: 'admin-reports', label: 'Institutional Reports', icon: BarChart3, hint: 'University statistics' },
          { id: 'admin-audit', label: 'Audit Logs', icon: ShieldAlert, hint: 'Security ledger' }
        ];

      case 'ADMIN':
      case 'SUPER_ADMIN':
      default:
        return [
          { id: 'admin-dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard, hint: 'Central portal metrics' },
          { id: 'admin-clearances', label: 'Clearance Operations', icon: FileCheck, hint: 'Manage campus requests' },
          { id: 'admin-certificates', label: 'Certificates Registry', icon: Award, hint: 'Digital stamp records' },
          { id: 'admin-students', label: 'Student Database', icon: Users, hint: 'Master student records' },
          { id: 'admin-departments', label: 'Departments', icon: Building2, hint: '8 Clearance offices' },
          { id: 'admin-requirements', label: 'Clearance Rules Engine', icon: Sliders, hint: 'Department criteria' },
          { id: 'admin-periods', label: 'Academic Years & Periods', icon: Calendar, hint: 'Academic calendars' },
          { id: 'admin-users', label: 'User Accounts & Roles', icon: Users, hint: 'Officers & administrators' },
          { id: 'admin-reports', label: 'Master Reports', icon: BarChart3, hint: 'Institutional analytics' },
          { id: 'admin-audit', label: 'System Audit Logs', icon: ShieldAlert, hint: 'Security event logs' },
          { id: 'admin-settings', label: 'Portal Settings', icon: Settings, hint: 'University system config' }
        ];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel: responsive for both expanded (w-72) and collapsed (w-20) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          // Desktop collapsed vs expanded
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${
          // Mobile open vs closed
          isOpen ? 'w-72 translate-x-0 opacity-100 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:opacity-100'
        }`}
      >
        {/* Top Header: Logo + Modern 3-Lines Collapse Toggle */}
        <div className={`h-16 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center ${
          isCollapsed ? 'px-3 justify-center' : 'px-4 sm:px-5 justify-between'
        }`}>
          {isCollapsed ? (
            <button
              id="btn-sidebar-expand-toggle"
              onClick={onToggle || onClose}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700/90 transition-all duration-200 cursor-pointer border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex items-center justify-center group active:scale-95"
              title="Expand Sidebar Navigation"
              aria-label="Expand navigation sidebar"
            >
              {/* Modern 3-Lines Indicator in Collapsed Mode */}
              <div className="w-5 h-4 flex flex-col justify-between items-start pointer-events-none">
                <span className="h-[2px] w-5 rounded-full bg-blue-600 dark:bg-blue-400 transition-all" />
                <span className="h-[2px] w-3 group-hover:w-5 rounded-full bg-amber-500 transition-all" />
                <span className="h-[2px] w-5 rounded-full bg-blue-600 dark:bg-blue-400 transition-all" />
              </div>
            </button>
          ) : (
            <>
              {/* Logo Branding */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-amber-400 flex items-center justify-center font-certificate font-extrabold text-sm shadow-md border border-blue-400/20 shrink-0">
                  HU
                </div>
                <div className="transition-opacity duration-200 whitespace-nowrap">
                  <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white block leading-tight">
                    Hawassa University
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                    Clearance Portal v2.6
                  </span>
                </div>
              </div>

              {/* Modern 3-Lines Collapse Toggle Icon */}
              <button
                id="btn-sidebar-collapse-three-lines"
                onClick={onToggle || onClose}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700/80 transition-all duration-200 cursor-pointer border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex items-center justify-center group active:scale-95"
                title="Collapse Sidebar"
                aria-label="Collapse navigation sidebar"
              >
                <div className="w-4 h-3.5 flex flex-col justify-between items-start pointer-events-none">
                  <span className="h-[2px] w-4 rounded-full bg-current transition-all" />
                  <span className="h-[2px] w-2.5 group-hover:w-4 rounded-full bg-amber-500 transition-all" />
                  <span className="h-[2px] w-4 rounded-full bg-current transition-all" />
                </div>
              </button>
            </>
          )}
        </div>

        {/* Role & Context Banner (Visible only in expanded mode) */}
        {!isCollapsed ? (
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50/90 to-indigo-50/60 dark:from-blue-950/40 dark:to-slate-900/60 border-b border-slate-200/70 dark:border-slate-800/80 transition-opacity">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                {currentRole === 'STUDENT' ? 'Student Workspace' : 
                 currentRole === 'OFFICER' ? (currentUser?.departmentName || 'Department Officer') : 
                 currentRole === 'REGISTRAR' ? 'Office of the Registrar' : 'Central Administration'}
              </span>
            </div>
            {currentRole === 'OFFICER' && currentUser?.departmentName && (
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5 truncate">
                {currentUser.departmentName}
              </p>
            )}
          </div>
        ) : (
          /* Subtle divider in collapsed mode */
          <div className="h-2 border-b border-slate-200/50 dark:border-slate-800/50" />
        )}

        {/* Navigation Menu */}
        <nav className={`flex-1 overflow-y-auto py-3 space-y-1.5 custom-scrollbar ${
          isCollapsed ? 'px-2' : 'px-3'
        }`}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <div key={item.id} className="relative group">
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative ${
                    isCollapsed 
                      ? 'justify-center p-3 hover:scale-105' 
                      : 'justify-between px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-500/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                  aria-label={item.label}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'
                    }`} />
                    {!isCollapsed && (
                      <span className="truncate text-left">{item.label}</span>
                    )}
                  </div>

                  {/* Badge in Expanded Mode */}
                  {!isCollapsed && item.badge && item.badge > 0 ? (
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isActive ? 'bg-amber-400 text-blue-950 shadow-xs' : 'bg-rose-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}

                  {/* Badge Dot in Collapsed Mode */}
                  {isCollapsed && item.badge && item.badge > 0 ? (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  ) : null}
                </button>

                {/* =========================================================================
                    HOVER POPOVER TOOLTIP: Only appears in Collapsed Mode when cursor moves here
                   ========================================================================= */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out translate-x-1 group-hover:translate-x-0 shadow-2xl">
                    <div className="relative bg-slate-900 dark:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl border border-slate-700/80 backdrop-blur-xl flex items-center gap-3 whitespace-nowrap shadow-xl">
                      {/* Left pointer triangle */}
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-800 border-l border-b border-slate-700/80 transform rotate-45 pointer-events-none" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white tracking-wide">
                            {item.label}
                          </span>
                          {item.badge && item.badge > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-400 text-blue-950 rounded-full">
                              {item.badge} new
                            </span>
                          )}
                        </div>
                        {item.hint && (
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {item.hint}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </nav>

        {/* Footer Info & Sign Out */}
        <div className={`border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 ${
          isCollapsed ? 'p-2 space-y-2' : 'p-4 space-y-3'
        }`}>
          {onLogout && (
            <div className="relative group">
              <button
                id="sidebar-btn-logout"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className={`w-full flex items-center justify-center font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-all cursor-pointer border border-rose-200/50 dark:border-rose-900/30 active:scale-95 ${
                  isCollapsed ? 'p-2.5' : 'gap-2 px-3 py-2 text-xs'
                }`}
                title={isCollapsed ? "Sign Out" : undefined}
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Sign Out</span>}
              </button>

              {/* Floating Tooltip in Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out shadow-2xl">
                  <div className="relative bg-slate-900 dark:bg-slate-800 text-rose-300 px-3 py-1.5 rounded-xl border border-slate-700 font-bold text-xs whitespace-nowrap flex items-center gap-1.5 shadow-xl">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-l border-b border-slate-700 transform rotate-45" />
                    <span>Sign Out of Portal</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isCollapsed ? (
            <div className="pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-[11px]">Official Digital Portal</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Hawassa, Sidama Region, Ethiopia
              </p>
            </div>
          ) : (
            <div className="relative group flex justify-center py-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 cursor-pointer" />
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out shadow-2xl">
                <div className="relative bg-slate-900 dark:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 font-semibold text-[11px] whitespace-nowrap shadow-xl">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-l border-b border-slate-700 transform rotate-45" />
                  <span>Hawassa University Verified Portal</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

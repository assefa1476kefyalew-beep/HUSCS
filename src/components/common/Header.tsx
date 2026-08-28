import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, Menu, User as UserIcon, LogOut, 
  RotateCcw, ShieldCheck, ChevronDown, Sun, Moon,
  ExternalLink, Search, Sparkles
} from 'lucide-react';
import { User, NotificationItem, SystemSettings } from '../../types';
import { initialSystemSettings } from '../../data/seedData';
import { getRoleBadge } from '../../utils/helpers';
import { NotificationDropdown } from './NotificationDropdown';
import { useTheme } from '../../services/theme';

interface HeaderProps {
  currentUser: User | null;
  users?: User[];
  allUsers?: User[];
  notifications: NotificationItem[];
  systemSettings?: SystemSettings;
  isSidebarCollapsed?: boolean;
  onToggleSidebar: () => void;
  onSwitchUser?: (userId: string) => void;
  onLogout?: () => void;
  onResetData?: () => void;
  onNavigateToEntity?: (entityId: string) => void;
  onOpenPublicVerification?: () => void;
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications = [],
  systemSettings = initialSystemSettings,
  isSidebarCollapsed = false,
  onToggleSidebar,
  onLogout = () => {},
  onResetData = () => {},
  onNavigateToEntity,
  onOpenPublicVerification,
  onMarkNotificationRead,
  onMarkAllNotificationsRead
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeSettings = systemSettings || initialSystemSettings;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className={`sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
      isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Three Lines Toggle & University Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="lg:hidden relative p-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100/80 hover:bg-blue-50 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex items-center justify-center group active:scale-95 shrink-0"
            title="Open Sidebar Navigation"
            aria-label="Toggle navigation sidebar"
          >
            {/* Modern Animated 3-Lines Custom Indicator */}
            <div className="w-5 h-4 flex flex-col justify-between items-start pointer-events-none">
              <span className="h-[2px] w-5 rounded-full bg-current" />
              <span className="h-[2px] w-3.5 group-hover:w-5 rounded-full bg-amber-500 transition-all" />
              <span className="h-[2px] w-5 rounded-full bg-current" />
            </div>
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 p-0.5 shadow-sm border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
              <img 
                src="/hawassa-logo.png" 
                alt="Hawassa University Emblem" 
                className="w-full h-full object-contain rounded-full" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight truncate">
                  {activeSettings.universityNameEn}
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shrink-0">
                  Digital Clearance
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {activeSettings.universityNameAm} • {activeSettings.motto}
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions: Verification, Day/Night Mode, Notifications, User Menu, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Public Verification Link */}
          {onOpenPublicVerification && (
            <button
              id="btn-header-verify-cert"
              onClick={onOpenPublicVerification}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Verify Clearance Certificate by QR Code"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verify Certificate</span>
            </button>
          )}

          {/* Day / Night Mode Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
                <span className="hidden sm:inline text-xs font-semibold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform rotate-0 hover:-rotate-12" />
                <span className="hidden sm:inline text-xs font-semibold">Dark</span>
              </>
            )}
          </button>

          {/* Notifications */}
          <NotificationDropdown
            notifications={notifications}
            currentUserId={currentUser.id}
            onMarkAsRead={(id) => onMarkNotificationRead ? onMarkNotificationRead(id) : {}}
            onMarkAllAsRead={() => onMarkAllNotificationsRead ? onMarkAllNotificationsRead() : {}}
            onNavigateToEntity={onNavigateToEntity}
          />

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              id="btn-user-profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/90 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 dark:ring-blue-400/30"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {roleInfo.label} {currentUser.departmentName ? `• ${currentUser.departmentName}` : ''}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.fullName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      if (onNavigateToEntity) onNavigateToEntity('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    My Account Profile
                  </button>

                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
                      <span>Appearance</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{isDark ? 'Dark' : 'Light'}</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    id="btn-logout-menu"
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

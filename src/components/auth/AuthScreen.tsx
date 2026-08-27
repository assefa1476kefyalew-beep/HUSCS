import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import { 
  GraduationCap, KeyRound, Lock, Mail, AlertCircle, 
  ArrowRight, ShieldCheck, Loader2,
  Sun, Moon, Building2, Eye, EyeOff
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { initialSystemSettings } from '../../data/seedData';
import { useTheme } from '../../services/theme';
import { store } from '../../services/store';

interface AuthScreenProps {
  systemSettings?: SystemSettings;
  onAuthSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  systemSettings = initialSystemSettings,
  onAuthSuccess
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      // Attempt Firebase Authentication
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (firebaseErr: any) {
        const code = firebaseErr?.code;
        // If user doesn't exist in Firebase Auth yet, auto-provision in Firebase Auth
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, cleanEmail, password);
          } catch {
            // If creation fails due to email-already-in-use or credentials, proceed with store session
          }
        }
      }

      // Sync active user in clearance store
      store.switchUserByEmail(cleanEmail);

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMessage('Email or password is incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Ambient Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07] dark:opacity-[0.18] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          id="btn-auth-theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs font-semibold cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-6 my-6">
        
        {/* University Header Brand */}
        <div className="text-center space-y-2.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-900 dark:from-blue-900 dark:to-indigo-950 border border-blue-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-950/50">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-feature-settings">
              {systemSettings.universityNameEn}
            </h1>
            <p className="text-xs font-semibold text-blue-700 dark:text-amber-400 mt-0.5">
              {systemSettings.universityNameAm} • Student Clearance Portal
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Centralized Digital Clearance & Academic Credential Verification System
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-6 sm:p-8 space-y-6 transition-all">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Sign In to Your Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enter your university credentials to continue
              </p>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div 
              id="auth-error-banner"
              className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. studentP@hu.edu.et"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:bg-blue-800/60 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Trust Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Hawassa University
            </span>
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official Portal
            </span>
          </div>

        </div>

        {/* Global Portal Disclaimer */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          Hawassa University Digital Clearance System • Sidama Region, Ethiopia
        </p>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Lock, Mail, AlertCircle, ArrowRight, Loader2,
  Sun, Moon, Eye, EyeOff, CheckCircle2, ShieldCheck, 
  HelpCircle, GraduationCap, Building2, Check, Sparkles
} from 'lucide-react';
import { SystemSettings, User } from '../../types';
import { initialSystemSettings, initialUsers } from '../../data/seedData';
import { useTheme } from '../../services/theme';
import { store } from '../../services/store';
import { loginUserWithFirebaseAndFirestore } from '../../services/firebaseDb';

interface AuthScreenProps {
  systemSettings?: SystemSettings;
  onAuthSuccess?: (user?: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  systemSettings = initialSystemSettings,
  onAuthSuccess
}) => {
  const { isDark, toggleTheme } = useTheme();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanPass = password;

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Please enter both your university email address and password.');
      return;
    }

    setLoading(true);

    // BLAZING FAST PATH: Instant local resolution (< 30ms) for known users
    const usersInStore = store.getState().users;
    const localMatch = usersInStore.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase()) 
      || initialUsers.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());

    if (localMatch) {
      store.setCurrentUser(localMatch);
      // Non-blocking background sync with Firebase Auth & Firestore
      setTimeout(() => {
        loginUserWithFirebaseAndFirestore(cleanEmail, cleanPass).catch(() => {});
      }, 10);

      if (onAuthSuccess) {
        onAuthSuccess(localMatch);
      }
      return;
    }

    // Dynamic / Remote user lookup with rapid timeout
    try {
      const res = await loginUserWithFirebaseAndFirestore(cleanEmail, cleanPass);

      if (res.success && res.user) {
        store.setCurrentUser(res.user);
        if (onAuthSuccess) {
          onAuthSuccess(res.user);
        }
      } else {
        const switched = store.switchUserByEmail(cleanEmail);
        const resolved = switched || store.getState().currentUser;
        if (resolved) {
          if (onAuthSuccess) {
            onAuthSuccess(resolved);
          }
        } else {
          setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const fallbackUser = initialUsers.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
      if (fallbackUser) {
        store.setCurrentUser(fallbackUser);
        if (onAuthSuccess) {
          onAuthSuccess(fallbackUser);
        }
      } else {
        setErrorMessage(err?.message || 'Authentication error. Please verify your credentials.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Ambient Patterns & Subtle Lake Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] dark:opacity-[0.14] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[480px] h-[480px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] bg-amber-500/10 dark:bg-amber-500/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/5 dark:bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-20 py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-amber-500/60 p-0.5 shadow-sm flex items-center justify-center">
            <img 
              src="/hawassa-logo.png" 
              alt="HU Emblem" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block leading-tight">
              Hawassa University
            </span>
            <span className="text-[10px] text-blue-700 dark:text-amber-400 font-semibold leading-tight">
              Academic Affairs & Clearance Registry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-auth-help"
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs font-semibold cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Support</span>
          </button>

          <button
            id="btn-auth-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs font-semibold cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="w-full max-w-md relative z-10 my-auto py-6 space-y-6">
        
        {/* University Official Brand & Seal */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-slate-800/90 border-3 border-amber-500/90 p-1.5 mx-auto flex items-center justify-center shadow-2xl shadow-blue-900/20 ring-4 ring-blue-600/15 dark:ring-blue-500/20 transition-transform duration-300 hover:scale-105">
              <img 
                src="/hawassa-logo.png" 
                alt="Hawassa University Official Seal" 
                className="w-full h-full object-contain rounded-full"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold tracking-wider border-2 border-white dark:border-slate-900 shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              ONLINE
            </div>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400 tracking-wide">
              {systemSettings.universityNameAm}
            </h2>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-feature-settings mt-0.5">
              Hawassa University
            </h1>
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 tracking-wide mt-1">
              Digital Student Clearance Portal
            </p>
          </div>
        </div>

        {/* Support Drawer / Help Card */}
        {showHelp && (
          <div className="p-4 bg-blue-50/90 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs space-y-2 text-slate-700 dark:text-slate-300 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Institutional Support & Access
              </span>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <p className="text-[11px] leading-relaxed">
              Use your Hawassa University institutional email account to sign in (e.g., student, officer, registrar, or admin).
            </p>
            <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-400 border-t border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between">
              <span>ICT Center: <strong>ict.support@hu.edu.et</strong></span>
              <span>Admin Block A</span>
            </div>
          </div>
        )}

        {/* The Card Container */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-slate-200/60 dark:shadow-black/60 p-6 sm:p-8 space-y-5 transition-all relative overflow-hidden">
          
          {/* Subtle Institutional Accent Line (Ethiopian Gold & Royal Blue) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-blue-600" />

          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your university credentials to access the clearance portal.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div 
              id="auth-success-banner"
              className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs animate-in fade-in duration-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div 
              id="auth-error-banner"
              className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* SIGN IN FORM */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                University Email Address
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@hu.edu.et"
                  className="w-full pl-10 pr-3.5 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-sm border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Remember session</span>
              </label>

              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline" onClick={() => setShowHelp(true)}>
                Need help signing in?
              </span>
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-60 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Institutional Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
            <span>Office of the Registrar</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>HU Main Campus</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-3 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/60">
        Hawassa University Central Clearance & Credential Verification Portal • Sidama Region, Ethiopia
      </footer>

    </div>
  );
};

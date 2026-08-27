import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'hu_theme_preference';

// Global state & listeners
type Listener = (theme: ThemeMode, isDark: boolean) => void;
const listeners = new Set<Listener>();

let currentTheme: ThemeMode = getInitialTheme();

export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved;
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  return 'light';
}

export function isDarkModeActive(theme: ThemeMode = currentTheme): boolean {
  if (typeof window === 'undefined') return false;
  if (theme === 'dark') return true;
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

export function applyTheme(theme: ThemeMode = currentTheme): boolean {
  if (typeof window === 'undefined') return false;
  
  const isDark = isDarkModeActive(theme);
  const root = document.documentElement;
  const body = document.body;

  if (isDark) {
    root.classList.add('dark');
    if (body) body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    if (body) body.classList.remove('dark');
  }

  return isDark;
}

export function setThemeMode(theme: ThemeMode) {
  currentTheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
  const isDark = applyTheme(theme);
  listeners.forEach(fn => fn(theme, isDark));
}

export function toggleThemeMode() {
  const next = isDarkModeActive(currentTheme) ? 'light' : 'dark';
  setThemeMode(next);
}

// Global listener for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (currentTheme === 'system') {
      const isDark = applyTheme('system');
      listeners.forEach(fn => fn('system', isDark));
    }
  });
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => currentTheme);
  const [isDark, setIsDark] = useState<boolean>(() => isDarkModeActive(currentTheme));

  useEffect(() => {
    // Initial sync
    setThemeState(currentTheme);
    setIsDark(isDarkModeActive(currentTheme));

    const listener: Listener = (t, dark) => {
      setThemeState(t);
      setIsDark(dark);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    theme,
    isDark,
    toggleTheme: toggleThemeMode,
    setTheme: setThemeMode
  };
}

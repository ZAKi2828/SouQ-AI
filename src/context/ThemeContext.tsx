'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { insforge } from '@/lib/insforge';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Set color-scheme for native elements
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage and Profile
  useEffect(() => {
    async function initTheme() {
      // 1. Try localStorage first for immediate results
      const saved = localStorage.getItem('souqai-theme') as Theme | null;
      let initial: Theme = (saved && ['light', 'dark', 'system'].includes(saved)) ? saved : 'system';

      // 2. Try to fetch from profile if logged in
      try {
        const { data: sessionData } = await insforge.auth.getCurrentSession();
        if (sessionData?.session?.user) {
          const { data: profile } = await insforge.database
            .from('profiles')
            .select('theme_preference')
            .eq('id', sessionData.session.user.id)
            .single();
          
          if (profile?.theme_preference && ['light', 'dark', 'system'].includes(profile.theme_preference)) {
            initial = profile.theme_preference as Theme;
            localStorage.setItem('souqai-theme', initial);
          }
        }
      } catch (err) {
        console.error('Failed to sync theme with profile', err);
      }

      setThemeState(initial);
      const resolved = initial === 'system' ? getSystemTheme() : (initial as 'light' | 'dark');
      setResolvedTheme(resolved);
      applyTheme(resolved);
      setMounted(true);
    }

    initTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const resolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, mounted]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('souqai-theme', newTheme);
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Sync to profile if logged in
    try {
      const { data: sessionData } = await insforge.auth.getCurrentSession();
      if (sessionData?.session?.user) {
        await insforge.database
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', sessionData.session.user.id);
      }
    } catch (err) {
      console.error('Failed to save theme to profile', err);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

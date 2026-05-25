'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
}

export default function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme-mode');
    const isSavedMode = saved === 'dark' || saved === 'light';
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;

    let nextMode: ThemeMode;
    if (isSavedMode) {
      nextMode = saved;
    } else {
      nextMode = prefersDark ? 'dark' : 'light';
    }

    setMode(nextMode);
    applyTheme(nextMode);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      toggleMode: () => {
        const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
        setMode(nextMode);
        localStorage.setItem('theme-mode', nextMode);
        applyTheme(nextMode);
      },
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeProvider belum dipasang.');
  return context;
}

import React, { createContext, useContext, useMemo, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeOverride = 'light' | 'dark' | null;

type AppThemeContextValue = {
  resolvedScheme: 'light' | 'dark';
  isDark: boolean;
  themeOverride: ThemeOverride;
  toggleTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<ThemeOverride>('light');

  const resolvedScheme: 'light' | 'dark' =
    (themeOverride ?? (systemScheme === 'dark' ? 'dark' : 'light')) === 'dark' ? 'dark' : 'light';

  const value = useMemo<AppThemeContextValue>(
    () => ({
      resolvedScheme,
      isDark: resolvedScheme === 'dark',
      themeOverride,
      toggleTheme: () => {
        setThemeOverride((current) => {
          if (current === null) {
            return resolvedScheme === 'dark' ? 'light' : 'dark';
          }
          return current === 'dark' ? 'light' : 'dark';
        });
      },
    }),
    [resolvedScheme, themeOverride],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}

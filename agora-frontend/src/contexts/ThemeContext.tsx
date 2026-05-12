import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextData {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({
  theme: 'light',
  toggleTheme: () => {}
});

const darkVars: Record<string, string> = {
  '--agora-ink': '#f0f0f0',
  '--agora-muted': '#9ca3af',
  '--agora-bg': '#111827',
  '--agora-panel': '#1f2937',
  '--agora-border': '#374151',
  '--agora-accent': '#22c55e',
  '--agora-accent-hover': '#16a34a',
  '--agora-accent-light': '#4ade80',
  '--agora-accent-bg': '#052e16',
  '--agora-sidebar': '#1a2228',
  '--agora-sidebar-soft': '#161d22',
  '--agora-shadow': '0 4px 24px rgba(0, 0, 0, 0.4)',
  '--agora-card-bg': '#1f2937',
  '--agora-input-bg': '#374151',
};

const lightVars: Record<string, string> = {
  '--agora-ink': '#1a1a1a',
  '--agora-muted': '#6b7280',
  '--agora-bg': '#f5f6f8',
  '--agora-panel': '#ffffff',
  '--agora-border': '#e5e7eb',
  '--agora-accent': '#0a5c2f',
  '--agora-accent-hover': '#084925',
  '--agora-accent-light': '#18915b',
  '--agora-accent-bg': '#f0fdf4',
  '--agora-sidebar': '#2b353a',
  '--agora-sidebar-soft': '#232d31',
  '--agora-shadow': '0 4px 24px rgba(10, 92, 47, 0.08)',
  '--agora-card-bg': '#ffffff',
  '--agora-input-bg': '#ffffff',
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('agora-theme') as Theme | null;
    return stored ?? 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const vars = theme === 'dark' ? darkVars : lightVars;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem('agora-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

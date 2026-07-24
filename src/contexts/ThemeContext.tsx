'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { theme as defaultTheme, cleanTheme } from '@/lib/theme';

export type ThemeType = 'default' | 'clean';

interface ThemeContextType {
  currentTheme: ThemeType;
  theme: typeof defaultTheme | typeof cleanTheme;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('app-theme') as ThemeType;
    if (savedTheme && (savedTheme === 'default' || savedTheme === 'clean')) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', theme);
    
    // Apply theme-specific CSS variables
    applyThemeVariables(theme);
  };

  const applyThemeVariables = (themeType: ThemeType) => {
    const root = document.documentElement;
    const selectedTheme = themeType === 'clean' ? cleanTheme : defaultTheme;

    if (themeType === 'clean') {
      // Apply clean theme CSS variables
      root.style.setProperty('--background', '#f9fafb');
      root.style.setProperty('--foreground', '#111827');
      root.style.setProperty('--card-background', '#ffffff');
      root.style.setProperty('--card-border', '#e5e7eb');
      root.style.setProperty('--card-shadow', '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--primary', '#FF6B00');
      root.style.setProperty('--primary-hover', '#FFF4EC');
      root.style.setProperty('--border-radius', '0.375rem');
      root.style.setProperty('--shadow-intensity', 'subtle');
      
      // Add clean theme class to body
      document.body.classList.add('clean-theme');
      document.body.classList.remove('default-theme');
    } else {
      // Apply default theme CSS variables
      root.style.setProperty('--background', '#0f0f23');
      root.style.setProperty('--foreground', '#ffffff');
      root.style.setProperty('--card-background', 'rgba(15, 15, 35, 0.8)');
      root.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--card-shadow', '0 4px 16px 0 rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--primary', '#8b5cf6');
      root.style.setProperty('--primary-hover', 'rgba(139, 92, 246, 0.1)');
      root.style.setProperty('--border-radius', '0.75rem');
      root.style.setProperty('--shadow-intensity', 'normal');
      
      // Add default theme class to body
      document.body.classList.add('default-theme');
      document.body.classList.remove('clean-theme');
    }
  };

  useEffect(() => {
    // Apply theme variables on initial load
    applyThemeVariables(currentTheme);
  }, [currentTheme]);

  const theme = currentTheme === 'clean' ? cleanTheme : defaultTheme;

  const value = {
    currentTheme,
    theme,
    setTheme: handleSetTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
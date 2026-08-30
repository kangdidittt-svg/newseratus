'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { theme as defaultTheme, cleanTheme, whiteMinimalistTheme } from '@/lib/theme';

export type ThemeType = 'default' | 'clean' | 'white-minimalist';

interface ThemeContextType {
  currentTheme: ThemeType;
  theme: typeof defaultTheme | typeof cleanTheme | typeof whiteMinimalistTheme;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('app-theme') as ThemeType;
    if (savedTheme && (savedTheme === 'default' || savedTheme === 'clean' || savedTheme === 'white-minimalist')) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', theme);
    applyThemeVariables(theme);
  };

  const applyThemeVariables = (themeType: ThemeType) => {
    const root = document.documentElement;
    const body = document.body;

    // Reset theme classes
    body.classList.remove('default-theme', 'clean-theme', 'theme-white-minimalist');
    root.classList.remove('default-theme', 'clean-theme', 'theme-white-minimalist');

    if (themeType === 'white-minimalist') {
      // Apply White Minimalist theme CSS variables
      root.style.setProperty('--background', '#F8F9FA');
      root.style.setProperty('--foreground', '#09090B');
      root.style.setProperty('--card', '#FFFFFF');
      root.style.setProperty('--elevated', '#F4F4F5');
      root.style.setProperty('--hover', '#E4E4E7');
      root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--primary', '#8B5CF6');
      root.style.setProperty('--primary-hover', '#7C3AED');
      root.style.setProperty('--secondary', '#71717A');
      root.style.setProperty('--muted', '#A1A1AA');

      // Neumorphic compatibility variables
      root.style.setProperty('--neuro-bg', '#F8F9FA');
      root.style.setProperty('--neuro-bg-secondary', '#FFFFFF');
      root.style.setProperty('--neuro-bg-light', '#F4F4F5');
      root.style.setProperty('--neuro-text-primary', '#09090B');
      root.style.setProperty('--neuro-text-secondary', '#71717A');
      root.style.setProperty('--neuro-text-muted', '#A1A1AA');
      root.style.setProperty('--neuro-border', 'rgba(0, 0, 0, 0.08)');

      body.classList.add('theme-white-minimalist');
      root.classList.add('theme-white-minimalist');
    } else if (themeType === 'clean') {
      // Apply clean theme CSS variables
      root.style.setProperty('--background', '#f9fafb');
      root.style.setProperty('--foreground', '#111827');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-background', '#ffffff');
      root.style.setProperty('--card-border', '#e5e7eb');
      root.style.setProperty('--card-shadow', '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--primary', '#FF6B00');
      root.style.setProperty('--primary-hover', '#FFF4EC');
      root.style.setProperty('--border-radius', '0.375rem');

      body.classList.add('clean-theme');
      root.classList.add('clean-theme');
    } else {
      // Apply default dark theme CSS variables
      root.style.setProperty('--background', '#0B0C0E');
      root.style.setProperty('--foreground', '#FAFAFA');
      root.style.setProperty('--card', '#14161A');
      root.style.setProperty('--elevated', '#1A1D22');
      root.style.setProperty('--hover', '#22252C');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--primary', '#8B5CF6');
      root.style.setProperty('--primary-hover', '#7C3AED');
      root.style.setProperty('--secondary', '#A1A1AA');
      root.style.setProperty('--muted', '#71717A');

      // Neumorphic compatibility variables
      root.style.setProperty('--neuro-bg', '#0F1115');
      root.style.setProperty('--neuro-bg-secondary', '#14161A');
      root.style.setProperty('--neuro-bg-light', '#1A1D22');
      root.style.setProperty('--neuro-text-primary', '#FAFAFA');
      root.style.setProperty('--neuro-text-secondary', '#A1A1AA');
      root.style.setProperty('--neuro-text-muted', '#71717A');
      root.style.setProperty('--neuro-border', 'rgba(255, 255, 255, 0.05)');

      body.classList.add('default-theme');
      root.classList.add('default-theme');
    }
  };

  useEffect(() => {
    applyThemeVariables(currentTheme);
  }, [currentTheme]);

  const getThemeObject = () => {
    switch (currentTheme) {
      case 'white-minimalist':
        return whiteMinimalistTheme;
      case 'clean':
        return cleanTheme;
      default:
        return defaultTheme;
    }
  };

  const value = {
    currentTheme,
    theme: getThemeObject(),
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
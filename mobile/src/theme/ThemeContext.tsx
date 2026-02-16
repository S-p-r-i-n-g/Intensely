/**
 * Theme Context
 * Provides theme (light/dark mode) to all components
 * Based on Intensely Design System v1.0
 * Reference: /design.md
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightMode, darkMode, LightModeColors, DarkModeColors } from '../tokens/colors';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  theme: LightModeColors | DarkModeColors;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  // Sync with system color scheme changes
  useEffect(() => {
    if (systemColorScheme) {
      setColorSchemeState(systemColorScheme as ColorScheme);
    }
  }, [systemColorScheme]);

  const theme = colorScheme === 'dark' ? darkMode : lightMode;

  const toggleTheme = () => {
    setColorSchemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, theme, toggleTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

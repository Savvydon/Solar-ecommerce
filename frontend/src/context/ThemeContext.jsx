import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Initialize theme with safe fallbacks (LocalStorage -> System Preferences -> Default Light)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('se_theme');
    if (savedTheme) return savedTheme;

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Synchronize dynamic global DOM attributes and local storage state updates
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('se_theme', theme);
  }, [theme]);

  // Handler to toggle between dark and light themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

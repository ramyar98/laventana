import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLanguage, languages } from '../i18n';
import { LanguageContext, ThemeContext } from './contexts';

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState(() => {
    return localStorage.getItem('laventana-lang') || 'ku';
  });

  const lang = useMemo(() => getLanguage(langCode), [langCode]);
  const switchLanguage = useCallback((code) => setLangCode(code), []);

  const value = useMemo(
    () => ({ lang, langCode, switchLanguage, languages }),
    [lang, langCode, switchLanguage]
  );

  useEffect(() => {
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
    localStorage.setItem('laventana-lang', lang.code);
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('laventana-theme') || 'dark';
  });

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('laventana-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
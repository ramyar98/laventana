import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage, useTheme } from '../context/hooks';
import { UtensilsCrossed, Sun, Moon, ChevronDown, ArrowLeft } from 'lucide-react';
import Flag from './Flag';

export default function Navbar({ current, onNavigate }) {
  const { lang, switchLanguage, languages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleSelect = useCallback((code) => {
    switchLanguage(code);
    setLangOpen(false);
  }, [switchLanguage]);

  const showBack = current === 'vip' || current === 'table';

  return (
    <nav className="sticky top-0 z-50 dark:bg-gray-950/80 bg-white/80 backdrop-blur-xl border-b dark:border-gray-800/50 border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-2.5 min-h-[44px] min-w-0">
            {showBack ? (
              <button
                onClick={() => onNavigate('home')}
                aria-label="Back to home"
                className="flex items-center justify-center w-9 h-9 rounded-lg dark:text-gray-400 text-gray-500 hover:dark:text-amber-400 hover:text-amber-600 hover:dark:bg-gray-800/50 hover:bg-gray-100 transition-all min-h-[44px]"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
            ) : (
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <UtensilsCrossed className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            )}
            <span className="font-serif text-lg sm:text-xl font-bold truncate dark:text-white text-gray-900">
              Laventana
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center justify-center w-10 h-10 rounded-lg dark:text-gray-400 text-gray-500 hover:dark:text-amber-400 hover:text-amber-600 hover:dark:bg-gray-800/50 hover:bg-gray-100 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-label="Change language"
                className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-sm dark:text-gray-300 text-gray-600 hover:dark:text-amber-400 hover:text-amber-600 hover:dark:bg-gray-800/50 hover:bg-gray-100 transition-all min-h-[44px]"
              >
                <Flag code={lang.flag} className="w-5 h-5 shrink-0 rounded-[3px]" />
                <span className="hidden md:inline text-xs font-medium">{lang.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute top-full mt-2 end-0 w-56 max-w-[calc(100vw-2rem)] rounded-xl dark:bg-gray-800 bg-white border dark:border-gray-700/50 border-gray-200 shadow-2xl shadow-black/20 dark:shadow-black/50 py-2 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleSelect(l.code)}
                      className={`w-full px-4 py-2.5 text-sm transition-colors flex items-center gap-3 min-h-[44px] ${
                        l.code === lang.code
                          ? 'dark:text-amber-400 text-amber-600 dark:bg-amber-500/10 bg-amber-50'
                          : 'dark:text-gray-300 text-gray-600 hover:dark:bg-gray-700/50 hover:bg-gray-50 hover:dark:text-white hover:text-gray-900'
                      }`}
                    >
                      <Flag code={l.flag} className="w-5 h-5 shrink-0 rounded-[3px]" />
                      <span className="flex-1 text-right truncate">{l.name}</span>
                      {l.code === lang.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/hooks';
import { getLockedTables } from '../utils/storage';
import { Lock } from 'lucide-react';

const TABLE_LAYOUT = [
  { row: 'A', tables: [1, 2, 3, 4, 5, 6] },
  { row: 'B', tables: [7, 8, 9, 10, 11, 12, 14] },
  { row: 'C', tables: [15, 16, 17, 18, 19, 20] },
  { row: 'D', tables: [21, 22, 23, 24, 25, 26] },
  { row: 'E', tables: [27, 28, 29, 30, 31, 32, 33] },
];

export default function TableGrid({ onSelect, selected }) {
  const { lang } = useLanguage();
  const [locked, setLocked] = useState(() => getLockedTables());
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => {
    const sync = () => setLocked(getLockedTables());
    window.addEventListener('storage', sync);
    window.addEventListener('laventana:locks', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('laventana:locks', sync);
    };
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative rounded-2xl dark:bg-gray-800/50 bg-white border dark:border-gray-700/50 border-gray-200 p-4 sm:p-6 md:p-8">
        <div className="text-center mb-5 sm:mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-amber-500/10 bg-amber-50 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider border dark:border-amber-500/20 border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {lang.table.floorPlan}
          </span>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {TABLE_LAYOUT.map((row) => (
            <div key={row.row} className="flex items-center gap-2 sm:gap-3">
              <span className="w-4 sm:w-6 text-center text-xs sm:text-sm dark:text-gray-600 text-gray-300 font-mono font-bold flex-shrink-0">
                {row.row}
              </span>
              <div
                className="grid flex-1 gap-1.5 sm:gap-2"
                style={{ gridTemplateColumns: `repeat(${row.tables.length}, minmax(0, 1fr))` }}
              >
                {row.tables.map((num) => {
                  const isLocked = locked.includes(num);
                  const isSelected = selected === num;

                  return (
                    <button
                      key={num}
                      aria-disabled={isLocked}
                      onClick={() => (isLocked ? showToast(lang.booking.locked) : onSelect(num))}
                      aria-label={`Table ${num}`}
                      className={`
                        relative aspect-square w-full rounded-lg sm:rounded-xl flex items-center justify-center
                        text-xs sm:text-sm font-bold transition-all duration-200
                        ${isLocked
                          ? 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-500 cursor-not-allowed border dark:border-red-400/40 border-red-300'
                          : isSelected
                            ? 'bg-amber-500 text-white border-2 border-amber-400 shadow-lg shadow-amber-500/30 scale-110'
                            : 'dark:bg-emerald-500/10 bg-emerald-50 dark:text-emerald-500 text-emerald-600 border dark:border-emerald-500/30 border-emerald-200 hover:dark:bg-emerald-500/20 hover:bg-emerald-100 hover:dark:border-emerald-500/50 hover:border-emerald-300 active:scale-95'
                        }
                      `}
                    >
                      <span className="flex flex-col items-center justify-center gap-0.5">
                        {num}
                        {isLocked && <Lock className="w-3 h-3" />}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 dark:border-gray-800 border-white bg-amber-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="w-4 sm:w-6 flex-shrink-0" />
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 pt-6 border-t dark:border-gray-700/50 border-gray-200 flex justify-center">
          <div className="px-6 sm:px-8 py-2.5 rounded-lg dark:bg-gray-700/30 bg-gray-100 border dark:border-gray-600/30 border-gray-200">
            <span className="text-xs dark:text-gray-500 text-gray-400 font-medium">{lang.table.kitchen}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        {selected ? (
          <button
            onClick={() => onSelect(selected)}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 active:scale-[0.98] min-h-[48px]"
          >
            {lang.table.bookButton} #{selected}
          </button>
        ) : (
          <p className="text-sm dark:text-gray-500 text-gray-400">{lang.table.noTableSelected}</p>
        )}
      </div>

      {toast && (
        <div
          dir="auto"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[calc(100vw-2rem)] px-5 py-3 rounded-xl bg-red-500 text-white text-sm font-medium shadow-2xl shadow-red-500/40 text-center"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
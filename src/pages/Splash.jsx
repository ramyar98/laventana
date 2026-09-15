import { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function Splash({ onEnter }) {
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 100);
    const t2 = setTimeout(() => setPhase('exiting'), 2600);
    const t3 = setTimeout(() => onEnter(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onEnter]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 dark:bg-gray-950 bg-stone-50 ${
        phase === 'exiting' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-400/5 dark:bg-amber-400/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/3 dark:bg-amber-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div
        className={`relative flex flex-col items-center gap-8 transition-all duration-1000 delay-200 ${
          phase === 'entering' ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-r from-amber-400/0 via-amber-500/20 to-amber-400/0 rounded-full blur-2xl animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-amber-500/20 dark:border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/10 dark:to-amber-600/5 backdrop-blur-sm">
            <UtensilsCrossed className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" strokeWidth={1.2} />
          </div>
        </div>

        <div className="text-center px-6">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight dark:text-white text-gray-900">
            Laventana
          </h1>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="h-px w-10 sm:w-20 bg-gradient-to-r from-transparent to-amber-400/40" />
            <span className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-amber-500/80 font-medium">
              Restaurant
            </span>
            <span className="h-px w-10 sm:w-20 bg-gradient-to-l from-transparent to-amber-400/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
import { useLanguage } from '../context/hooks';
import { Crown, UtensilsCrossed, ArrowRight } from 'lucide-react';

const cardClass =
  'group relative overflow-hidden rounded-2xl dark:bg-gray-800/60 bg-white border dark:border-gray-700/50 border-gray-200 hover:dark:border-amber-500/40 hover:border-amber-400/40 transition-all duration-300 hover:dark:shadow-xl hover:shadow-xl hover:dark:shadow-amber-500/10 hover:shadow-amber-500/10 active:scale-[0.97] min-h-[48px]';

export default function Home({ onNavigate }) {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <div className="text-center max-w-xl mx-auto w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-amber-500/20 dark:border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 mb-6 sm:mb-8">
            <UtensilsCrossed className="w-8 h-8 sm:w-9 sm:h-9 text-amber-500" strokeWidth={1.2} />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight dark:text-white text-gray-900">
            {lang.home.heroTitle}
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-base dark:text-gray-400 text-gray-500 leading-relaxed">
            {lang.home.heroSubtitle}
          </p>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-lg sm:max-w-2xl mx-auto">
            <button onClick={() => onNavigate('vip')} className={cardClass}>
              <div className="aspect-[4/3] dark:bg-gradient-to-br dark:from-amber-500/15 dark:to-amber-600/5 bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center">
                <Crown className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400/40 group-hover:text-amber-400/60 transition-colors" strokeWidth={1} />
              </div>
              <div className="p-4 sm:p-5 text-center">
                <h3 className="font-serif text-base sm:text-lg font-semibold dark:text-white text-gray-900">{lang.vip.title}</h3>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-amber-500 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{lang.home.bookNow}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </div>
              </div>
            </button>

            <button onClick={() => onNavigate('table')} className={cardClass}>
              <div className="aspect-[4/3] dark:bg-gradient-to-br dark:from-amber-500/15 dark:to-amber-600/5 bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center">
                <UtensilsCrossed className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400/40 group-hover:text-amber-400/60 transition-colors" strokeWidth={1} />
              </div>
              <div className="p-4 sm:p-5 text-center">
                <h3 className="font-serif text-base sm:text-lg font-semibold dark:text-white text-gray-900">{lang.table.title}</h3>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-amber-500 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{lang.table.bookButton}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <footer className="py-6 border-t dark:border-gray-800/50 border-gray-200/50">
        <div className="text-center">
          <p className="text-xs dark:text-gray-600 text-gray-400 flex items-center justify-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
            Laventana Restaurant
          </p>
        </div>
      </footer>
    </div>
  );
}
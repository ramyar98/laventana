import { useState } from 'react';
import { useLanguage } from '../context/hooks';
import { Armchair, Crown, Wifi, AudioLines, LampCeiling, SlidersHorizontal, Zap, Star } from 'lucide-react';
import BookingForm from '../components/BookingForm';

const galleryGradients = [
  'from-amber-500/20 to-amber-600/5',
  'from-amber-600/20 to-amber-500/5',
  'from-amber-400/20 to-amber-500/5',
  'from-amber-500/15 to-amber-400/5',
  'from-amber-600/15 to-amber-500/5',
  'from-amber-500/20 to-amber-600/5',
];

const amenityIcons = [Armchair, Wifi, AudioLines, LampCeiling, SlidersHorizontal, Zap];

export default function VIPBooking() {
  const { lang } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <BookingForm type="vip" onBack={() => setShowForm(false)} />;
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden dark:bg-gray-900/50 bg-gray-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/20 border-amber-200 mb-6">
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold dark:text-white text-gray-900">
            {lang.vip.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base dark:text-gray-400 text-gray-500 max-w-lg mx-auto">
            {lang.vip.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg sm:text-xl font-semibold dark:text-white text-gray-900 mb-6">{lang.vip.gallery}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {lang.vip.galleryItems.map((label, i) => (
              <div
                key={i}
                className={`group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br ${galleryGradients[i] || galleryGradients[0]} dark:border border dark:border-gray-700/50 border-gray-200 hover:dark:border-amber-500/30 hover:border-amber-500/30 transition-all duration-300`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crown className="w-10 h-10 dark:text-amber-500/15 text-amber-500/10 group-hover:dark:text-amber-500/25 group-hover:text-amber-500/15 transition-colors" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
                  <span className="text-xs sm:text-sm text-white/90 font-medium">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 dark:bg-gray-900/50 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg sm:text-xl font-semibold dark:text-white text-gray-900 mb-6">{lang.vip.amenities}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {lang.vip.features.map((feature, i) => {
              const Icon = amenityIcons[i] || Star;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 sm:p-5 rounded-xl dark:bg-gray-800/50 bg-white border dark:border-gray-700/30 border-gray-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/20 border-amber-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                  </div>
                  <span className="text-xs sm:text-sm dark:text-gray-300 text-gray-600">{feature}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 active:scale-[0.98] min-h-[48px]"
          >
            {lang.vip.bookButton}
          </button>
        </div>
      </section>
    </div>
  );
}
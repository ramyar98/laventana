import { useState } from 'react';
import { useLanguage } from '../context/hooks';
import TableGrid from '../components/TableGrid';
import BookingForm from '../components/BookingForm';

export default function TableBooking() {
  const { lang } = useLanguage();
  const [selectedTable, setSelectedTable] = useState(null);

  if (selectedTable) {
    return (
      <BookingForm
        type="table"
        tableNumber={selectedTable}
        onBack={() => setSelectedTable(null)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden dark:bg-gray-900/50 bg-gray-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold dark:text-white text-gray-900">
            {lang.table.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base dark:text-gray-400 text-gray-500 max-w-lg mx-auto">
            {lang.table.subtitle}
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm">
            <Legend color="bg-emerald-500" label={lang.table.available} />
            <Legend color="bg-red-500" label={lang.table.locked} />
            <Legend color="bg-amber-500" label={lang.table.selected} />
          </div>

          <TableGrid onSelect={setSelectedTable} selected={selectedTable} />
        </div>
      </section>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="dark:text-gray-400 text-gray-500 font-medium">{label}</span>
    </div>
  );
}
import React from 'react';
import { Card } from '../components/common/Card';
import { Wrench, Construction } from 'lucide-react';

export const KalkulatorRekomendasiPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <Card className="p-8 sm:p-12 max-w-md w-full text-center">
        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Construction className="w-10 h-10 text-amber-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Wrench className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Kalkulator Rekomendasi
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Fitur ini sedang dalam tahap pengembangan.
            </p>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Maintenance
            </span>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Kami sedang menyiapkan fitur kalkulator rekomendasi harga otomatis untuk membantu Anda menentukan harga terbaik berdasarkan data historis dan tren pasar.
          </p>
        </div>
      </Card>
    </div>
  );
};


import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { SyncStatusBar } from '../sync/SyncStatusBar';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Executive Dashboard', subtitle: 'Ikhtisar performa penjualan, margin, dan transaksi real-time.' },
  '/kalkulator': { title: 'Kalkulator Harga & Margin', subtitle: 'Hitung modal bahan, sablon/bordir, dan tentukan harga jual tiering.' },
  '/kalkulator-manual': { title: 'Kalkulator Harga Manual', subtitle: 'Kalkulasi cepat dengan input manual dan fleksibel.' },
  '/perhitungan': { title: 'Database Perhitungan Harga', subtitle: 'Daftar seluruh perhitungan harga tersinkron dari Supabase.' },
  '/sph': { title: 'Surat Penawaran Harga (SPH)', subtitle: 'Kelola dan buat penawaran resmi formal ke klien & perusahaan.' },
  '/master-data': { title: 'Master Data & Spreadsheet View', subtitle: 'Tabel referensi produk, modal, margin, dan brand.' },
  '/sync-monitor': { title: 'Sync Engine & Audit Logs', subtitle: 'Monitoring pipeline sinkronisasi Google Sheets ke Supabase.' },
  '/prompts': { title: 'Prompt Library & AI Assistant', subtitle: 'Kumpulan template pesan sales dan follow-up SPH.' },
};

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, role } = useAuth();
  const location = useLocation();

  const pageInfo = PAGE_TITLES[location.pathname] || {
    title: 'Enterprise Pricing Platform',
    subtitle: 'Sistem Hitungan Harga Terintegrasi Supabase & GAS',
  };

  const initials = user?.nama
    ? user.nama
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('')
    : 'US';

  return (
    <header className="sticky top-0 z-20 h-13 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-5 flex items-center justify-between transition-colors">
      {/* Page Title / Breadcrumb */}
      <div>
        <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {pageInfo.title}
        </h1>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Sync Status Badge */}
        <SyncStatusBar />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-800"
          title={`Ganti ke Tema ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shadow-brand-500/20">
            {initials}
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
              {user?.nama || 'Sales Admin'}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">
              {user?.role || role || 'Sales PIC'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, User, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { SyncStatusBar } from '../sync/SyncStatusBar';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Executive Dashboard', subtitle: 'Ikhtisar performa penjualan, margin, dan transaksi real-time.' },
  '/kalkulator': { title: 'Kalkulator Harga & Margin', subtitle: 'Hitung modal bahan, sablon/bordir, dan tentukan harga jual tiering.' },
  '/perhitungan': { title: 'Database Perhitungan Harga', subtitle: 'Daftar seluruh perhitungan harga tersinkron dari Supabase.' },
  '/sph': { title: 'Surat Penawaran Harga (SPH)', subtitle: 'Kelola dan buat penawaran resmi formal ke klien & perusahaan.' },
  '/master-data': { title: 'Master Data & Spreadsheet View', subtitle: 'Tabel referensi produk, modal, margin, dan brand.' },
  '/sync-monitor': { title: 'Sync Engine & Audit Logs', subtitle: 'Monitoring pipeline sinkronisasi Google Sheets ke Supabase.' },
  '/prompts': { title: 'Prompt Library & AI Assistant', subtitle: 'Kumpulan template pesan sales dan follow-up SPH.' },
};

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const pageInfo = PAGE_TITLES[location.pathname] || {
    title: 'Enterprise Pricing Platform',
    subtitle: 'Sistem Hitungan Harga Terintegrasi Supabase & GAS',
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-5 sm:px-8 flex items-center justify-between transition-colors">
      {/* Page Title / Breadcrumb */}
      <div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {pageInfo.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sync Status Badge */}
        <SyncStatusBar />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-800"
          title={`Ganti ke Tema ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-brand-500/20">
            AP
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Ahmad Pratama</span>
            <span className="text-[10px] text-slate-500">Corporate Sales</span>
          </div>
        </div>
      </div>
    </header>
  );
};

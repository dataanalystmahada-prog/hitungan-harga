import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Executive Dashboard', subtitle: 'Ikhtisar performa penjualan, margin, dan transaksi real-time.' },
  '/kalkulator': { title: 'Kalkulator Harga & Margin', subtitle: 'Hitung modal bahan, sablon/bordir, dan tentukan harga jual tiering.' },
  '/kalkulator-manual': { title: 'Kalkulator Harga Manual', subtitle: 'Kalkulasi cepat dengan input manual dan fleksibel.' },
  '/perhitungan': { title: 'Database Perhitungan Harga', subtitle: 'Daftar seluruh perhitungan harga tersinkron dari Supabase.' },
  '/sph': { title: 'Surat Penawaran Harga (SPH)', subtitle: 'Kelola dan buat penawaran resmi formal ke klien & perusahaan.' },
  '/master-data': { title: 'Master Data & Spreadsheet View', subtitle: 'Tabel referensi produk, modal, margin, dan brand.' },
  '/sync-monitor': { title: 'Sync Engine & Audit Logs', subtitle: 'Monitoring pipeline sinkronisasi Google Sheets ke Supabase.' },
  '/aturan': { title: 'Kumpulan Aturan Sistem', subtitle: 'Daftar regulasi, formula, dan logika baku yang diterapkan otomatis.' },
};

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const pageInfo = PAGE_TITLES[location.pathname] || {
    title: 'Enterprise Pricing Platform',
    subtitle: 'Sistem Hitungan Harga Terintegrasi Supabase & GAS',
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(prev => !prev)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Dynamic Page Outlet with Custom Scrollbar */}
        <main className="flex-1 overflow-y-auto pt-5 sm:pt-6 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 bg-slate-50 dark:bg-slate-950 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
          <div className="max-w-7xl mx-auto space-y-5">
            <div className="mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{pageInfo.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pageInfo.subtitle}</p>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

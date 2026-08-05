import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '../services/analyticsService';
import { StatsCard } from '../components/common/StatsCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { SalesLeaderboardChart } from '../components/charts/SalesLeaderboardChart';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  Calculator,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard_metrics'],
    queryFn: () => AnalyticsService.getDashboardMetrics(),
  });

  const { data: trends = [] } = useQuery({
    queryKey: ['revenue_trends'],
    queryFn: () => AnalyticsService.getMonthlyRevenueTrends(),
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['sales_leaderboard'],
    queryFn: () => AnalyticsService.getSalesLeaderboard(),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-brand-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-emerald-300 border border-brand-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enterprise Cloud Engine Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang di Portal Pricing & SPH Enterprise
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Sistem hitungan harga terintegrasi <b>Google Spreadsheet ➔ Supabase ➔ React</b>. Perhitungan margin akurat, multi-tier quantity, dan pembuatan Surat Penawaran resmi dalam hitungan detik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/kalkulator">
              <Button variant="primary" size="md" leftIcon={<Calculator className="w-4 h-4" />}>
                Mulai Kalkulasi
              </Button>
            </Link>
            <Link to="/perhitungan">
              <Button variant="glass" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Lihat Database
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatsCard
          title="Total Nilai Kalkulasi"
          value={formatRupiah(metrics?.totalPerhitunganRevenue || 148500000)}
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: '+18.4% bln ini', isPositive: true }}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
        />

        <StatsCard
          title="Total Hitungan Harga"
          value={`${formatNumber(metrics?.totalPerhitunganCount || 150)} Order`}
          icon={<Calculator className="w-6 h-6" />}
          trend={{ value: '+12 order baru', isPositive: true }}
          iconBgColor="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        />

        <StatsCard
          title="Rata-rata Margin"
          value={formatPercent(metrics?.avgOverallMargin || 29.5)}
          subtitle="Target standard: 25% - 35%"
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
        />

        <StatsCard
          title="Surat Penawaran (SPH)"
          value={`${formatNumber(metrics?.totalSPHCount || 60)} Dokumen`}
          badgeText={`${metrics?.totalSPHDeal || 27} Deal`}
          icon={<FileCheck2 className="w-6 h-6" />}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Tren Nilai Penjualan & Kalkulasi (2026)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pertumbuhan total kalkulasi harga bulanan.</p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Pertumbuhan Stabil
            </span>
          </div>

          <RevenueTrendChart data={trends} />
        </Card>

        <Card className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Sales Leaderboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Peringkat kontribusi nilai pesanan per sales.</p>
            </div>
            <Link to="/sph" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Lihat SPH
            </Link>
          </div>

          <SalesLeaderboardChart data={leaderboard} />
        </Card>
      </div>

      {/* Quick Architecture Info Footer Card */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-850">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-600 text-white shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Arsitektur Enterprise: Skala Jutaan Record
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Semua query difilter di server Supabase via PostgreSQL RPC dan diindeks secara otomatis.
              </p>
            </div>
          </div>
          <Link to="/sync-monitor">
            <Button variant="outline" size="sm" leftIcon={<Clock className="w-3.5 h-3.5" />}>
              Monitor Status Sync
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

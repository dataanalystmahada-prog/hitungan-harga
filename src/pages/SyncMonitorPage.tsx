import React, { useState } from 'react';
import { useSyncMonitor } from '../hooks/useSyncMonitor';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import {
  RefreshCw,
  Play,
  Database,
  FileSpreadsheet,
  Cpu,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { formatTimeAgo, formatNumber } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';
import { SyncLog } from '../types/database.types';

const SYNC_OPTIONS = [
  { label: 'Semua Sheet (Full Sync Master & Transaksi)', value: 'ALL_SHEETS' },
  { label: 'ModalProduk & Master Produk', value: 'ModalProduk' },
  { label: 'ModalLogo (Matriks Sablon/Bordir)', value: 'ModalLogo' },
  { label: 'Margin (Matriks Persentase Qty)', value: 'Margin' },
  { label: 'Brands & Rekening Bank', value: 'Brands' },
  { label: 'Users & Divisi', value: 'Users' },
  { label: 'Perhitungan (Histori Kalkulasi)', value: 'Perhitungan' },
  { label: 'SPH (Surat Penawaran)', value: 'SPH' },
];

export const SyncMonitorPage: React.FC = () => {
  const { logs, triggerSync, isSyncing, refetch } = useSyncMonitor();
  const [selectedSheet, setSelectedSheet] = useState('ALL_SHEETS');
  const { success, error } = useToast();

  const handleRunSync = async () => {
    try {
      const res = await triggerSync({
        sheetName: selectedSheet === 'ALL_SHEETS' ? undefined : selectedSheet,
        syncType: 'MANUAL',
      });
      if (res.success) {
        success('Sinkronisasi Sukses', res.message);
      } else {
        error('Sinkronisasi Gagal', res.message);
      }
    } catch (err: any) {
      error('Sinkronisasi Error', err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Sync Engine & Pipeline Audit Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pipeline sinkronisasi satu arah: Google Spreadsheet ➔ Google Apps Script ➔ Supabase ➔ React.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Architecture Pipeline Visualizer */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Alur Sinkronisasi Data Enterprise
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex flex-col gap-2 text-center items-center">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white">Google Spreadsheet</h4>
            <p className="text-[11px] text-slate-400">Admin mengelola master harga, produk, & template</p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex flex-col gap-2 text-center items-center">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white">Google Apps Script</h4>
            <p className="text-[11px] text-slate-400">Sync Engine batching & sanitasi data (RPC call)</p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex flex-col gap-2 text-center items-center">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white">Supabase PostgreSQL</h4>
            <p className="text-[11px] text-slate-400">Database utama & sumber kebenaran (Source of Truth)</p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex flex-col gap-2 text-center items-center">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white">React + Vite Web App</h4>
            <p className="text-[11px] text-slate-400">Tampilan frontend dengan server-side pagination</p>
          </div>
        </div>
      </Card>

      {/* Manual Trigger Panel */}
      <Card className="p-5 sm:p-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
          Manual Sync Trigger (Admin On-Demand)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Jalankan sinkronisasi manual sekarang jika terdapat perubahan data harga di spreadsheet tanpa menunggu cron trigger 15 menit.
        </p>

        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <Select
              label="Target Sinkronisasi"
              options={SYNC_OPTIONS}
              value={selectedSheet}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSheet(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            isLoading={isSyncing}
            onClick={handleRunSync}
            leftIcon={<Play className="w-4 h-4 fill-current" />}
            className="w-full sm:w-auto"
          >
            Eksekusi Sync Sekarang
          </Button>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="p-5 overflow-hidden">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
          Audit Logs Pipeline Sinkronisasi (25 Transaksi Terakhir)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Target Sheet</th>
                <th className="py-3 px-4">Tipe Sync</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Diproses</th>
                <th className="py-3 px-4 text-right">Durasi (ms)</th>
                <th className="py-3 px-4">Pemicu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log: SyncLog) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {formatTimeAgo(log.created_at)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {log.sheet_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.sync_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-slate-800 dark:text-slate-200">
                    {formatNumber(log.records_processed)} baris
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-slate-500">
                    {log.duration_ms} ms
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {log.triggered_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

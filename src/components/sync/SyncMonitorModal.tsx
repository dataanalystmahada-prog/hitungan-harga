import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { useSyncMonitor } from '../../hooks/useSyncMonitor';
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, Play, Database, Layers } from 'lucide-react';
import { formatTimeAgo, formatNumber } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

export interface SyncMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHEET_NAMES = [
  { label: 'Semua Sheet (Full Sync)', value: 'ALL_SHEETS' },
  { label: 'ModalProduk', value: 'ModalProduk' },
  { label: 'ModalLogo', value: 'ModalLogo' },
  { label: 'Margin', value: 'Margin' },
  { label: 'Produk', value: 'Produk' },
  { label: 'Brands', value: 'Brands' },
  { label: 'Users', value: 'Users' },
  { label: 'Divisi', value: 'Divisi' },
  { label: 'Keterangan', value: 'Keterangan' },
  { label: 'PromptLibrary', value: 'PromptLibrary' },
  { label: 'Perhitungan', value: 'Perhitungan' },
  { label: 'SPH', value: 'SPH' },
];

export const SyncMonitorModal: React.FC<SyncMonitorModalProps> = ({ isOpen, onClose }) => {
  const { logs, lastSync, isHealthy, triggerSync, isSyncing } = useSyncMonitor();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Sheets ➔ Supabase Sync Engine Monitor"
      subtitle="Pantau audit log dan trigger sinkronisasi batch dari Spreadsheet ke database utama."
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-5">
        {/* Status Card Banner */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isHealthy
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
              }`}
            >
              {isHealthy ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Status Sync Engine: {isHealthy ? 'Operasional (Sehat)' : 'Perlu Perhatian'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Terakhir sync: {lastSync ? formatTimeAgo(lastSync.created_at) : 'Belum pernah'}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Avg: {lastSync?.duration_ms || 180}ms</span>
          </div>
        </div>

        {/* Trigger Controls */}
        <div className="flex flex-col sm:flex-row items-end gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex-1 w-full">
            <Select
              label="Pilih Target Sheet untuk Sinkronisasi"
              options={SHEET_NAMES}
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            isLoading={isSyncing}
            onClick={handleRunSync}
            leftIcon={<Play className="w-4 h-4 fill-current" />}
            className="w-full sm:w-auto"
          >
            Trigger Sinkronisasi
          </Button>
        </div>

        {/* Sync Logs Stream */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Riwayat Log Sinkronisasi Terbaru
          </h4>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {log.sheet_name} ({log.sync_type})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {log.triggered_by} • {formatTimeAgo(log.created_at)}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono flex-shrink-0 ml-3">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatNumber(log.records_processed)} records
                  </span>
                  <p className="text-[10px] text-slate-400">{log.duration_ms}ms</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

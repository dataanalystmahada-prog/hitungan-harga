import React, { useState } from 'react';
import { useSyncMonitor } from '../../hooks/useSyncMonitor';
import { RefreshCw, Database, CheckCircle2 } from 'lucide-react';
import { SyncMonitorModal } from './SyncMonitorModal';
import { formatTimeAgo } from '../../utils/formatters';

export const SyncStatusBar: React.FC = () => {
  const { lastSync, isHealthy, isSyncing } = useSyncMonitor();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-sm select-none"
        title="Buka Sinkronisasi Monitor"
      >
        <span className="relative flex h-2 w-2">
          {isHealthy && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </span>
        <span className="hidden md:inline text-[11px]">
          {isSyncing ? 'Menyinkronkan...' : `Sync: ${lastSync ? formatTimeAgo(lastSync.created_at) : 'Aktif'}`}
        </span>
        <RefreshCw className={`w-3 h-3 text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
      </button>

      <SyncMonitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

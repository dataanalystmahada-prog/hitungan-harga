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
        className="flex items-center w-full gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-slate-900/50 hover:bg-slate-900 dark:bg-slate-950/50 dark:hover:bg-slate-900 text-slate-300 transition-all border border-slate-700/50 shadow-sm select-none"
        title="Buka Sinkronisasi Monitor"
      >
        <span className="relative flex h-2 w-2 flex-shrink-0">
          {isHealthy && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </span>
        <span className="flex-1 text-left truncate">
          {isSyncing ? 'Menyinkronkan...' : `Sync: ${lastSync ? formatTimeAgo(lastSync.created_at) : 'Aktif'}`}
        </span>
        <RefreshCw className={`w-3 h-3 flex-shrink-0 text-slate-400 ${isSyncing ? 'animate-spin text-brand-400' : ''}`} />
      </button>

      <SyncMonitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

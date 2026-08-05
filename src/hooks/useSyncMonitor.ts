import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SyncService } from '../services/syncService';
import { TriggerSyncPayload } from '../types/sync.types';

export const SYNC_LOGS_QUERY_KEY = 'sync_logs';

export function useSyncMonitor() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [SYNC_LOGS_QUERY_KEY],
    queryFn: () => SyncService.getLogs(25),
    refetchInterval: 1000 * 15, // Poll every 15 seconds
  });

  const triggerMutation = useMutation({
    mutationFn: (payload: TriggerSyncPayload) => SyncService.triggerSync(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SYNC_LOGS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['master_data_all'] });
      queryClient.invalidateQueries({ queryKey: ['perhitungan'] });
      queryClient.invalidateQueries({ queryKey: ['sph'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });

  const logs = query.data || [];
  const lastSync = logs.length > 0 ? logs[0] : null;
  const isHealthy = logs.length > 0 ? logs[0].status === 'SUCCESS' : true;

  return {
    ...query,
    logs,
    lastSync,
    isHealthy,
    triggerSync: triggerMutation.mutateAsync,
    isSyncing: triggerMutation.isPending,
  };
}

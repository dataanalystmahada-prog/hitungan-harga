import { BaseRepository } from './baseRepository';
import { SyncLog } from '../types/database.types';
import { MOCK_SYNC_LOGS } from '../services/mockData';
import { supabase, isConfigured } from '../services/supabaseClient';

export class SyncLogRepository extends BaseRepository {
  private static localLogs: SyncLog[] = [...MOCK_SYNC_LOGS];

  public static async getRecentLogs(limit: number = 20): Promise<SyncLog[]> {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data;
    }
    return this.localLogs.slice(0, limit);
  }

  public static async logSync(log: Omit<SyncLog, 'id' | 'created_at'>): Promise<SyncLog> {
    const newLog: SyncLog = {
      ...log,
      id: `log-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isConfigured) {
      const { data, error } = await supabase.from('sync_logs').insert(newLog).select().single();
      if (!error && data) return data;
    }

    this.localLogs.unshift(newLog);
    return newLog;
  }
}

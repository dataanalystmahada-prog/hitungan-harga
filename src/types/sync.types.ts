export interface SyncEngineStatus {
  lastSyncTime?: string;
  totalSynced24h: number;
  lastStatus: 'SUCCESS' | 'FAILED' | 'IDLE' | 'SYNCING';
  lastError?: string;
}

export interface TriggerSyncPayload {
  sheetName?: string;
  syncType: 'AUTO' | 'MANUAL' | 'WEBHOOK';
}

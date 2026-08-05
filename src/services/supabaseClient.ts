import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://enterprise-pricing.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.enterprise-demo-key';

export const isConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key');

export const isMockFallbackEnabled = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

// Singleton Supabase Client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Diagnostic test for Supabase Connection
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
  const start = performance.now();
  try {
    const { error, count } = await supabase.from('perhitungan').select('*', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);
    
    if (error) {
      return { ok: false, message: `Koneksi Supabase Error: ${error.message}`, latencyMs };
    }
    return { ok: true, message: `Koneksi Supabase Aktif (${latencyMs}ms)`, latencyMs };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return { ok: false, message: `Koneksi gagal: ${err?.message || 'Network error'}`, latencyMs };
  }
}

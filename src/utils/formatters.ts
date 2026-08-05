/**
 * Enterprise Formatters Utility
 */

export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Rp 0';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID').format(numeric);
}

export function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0%';
  }
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return `${numeric.toFixed(1)}%`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return String(dateStr);
    }
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const now = new Date().getTime();
    const past = new Date(dateStr).getTime();
    if (isNaN(past)) return String(dateStr);

    const diffInSec = Math.floor((now - past) / 1000);
    if (diffInSec < 5) return 'Baru saja';
    if (diffInSec < 60) return `${diffInSec} dtk lalu`;
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `${diffInMin} mnt lalu`;
    const diffInHour = Math.floor(diffInMin / 60);
    if (diffInHour < 24) return `${diffInHour} jam lalu`;
    const diffInDays = Math.floor(diffInHour / 24);
    return `${diffInDays} hari lalu`;
  } catch {
    return String(dateStr);
  }
}

export function getSPHStatusBadge(status: string | null | undefined): { label: string; className: string } {
  const s = String(status || 'Draft').toLowerCase();
  switch (s) {
    case 'deal':
    case 'disetujui':
      return { label: status || 'Deal', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' };
    case 'dikirim':
      return { label: status || 'Dikirim', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' };
    case 'negosiasi':
      return { label: status || 'Negosiasi', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' };
    case 'ditolak':
    case 'batal':
      return { label: status || 'Ditolak', className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' };
    default:
      return { label: status || 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
  }
}

export function getSyncStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'SUCCESS':
      return { label: 'SUKSES', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' };
    case 'FAILED':
      return { label: 'GAGAL', className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300' };
    case 'PARTIAL':
      return { label: 'PARSIAL', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' };
    default:
      return { label: status, className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
  }
}

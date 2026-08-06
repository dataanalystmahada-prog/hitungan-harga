/**
 * Engine Perhitungan Rekomendasi Diskon Maksimal (Kategori A)
 * 
 * Ketentuan Tabel Kategori A:
 * - Qty 12  : 5%
 * - Qty 24  : 5%
 * - Qty 50  : 5%
 * - Qty 75  : 4%
 * - Qty 100 : 4%
 * - Qty 150 : 3%
 * - Qty 200 : 2%
 * - Qty 300 : 2%
 * - Qty 500 : 2%
 */

export function getMaxDiskonPercentage(qty: number): number {
  const q = Math.max(0, qty || 0);
  if (q <= 50) return 5;
  if (q <= 100) return 4;
  if (q <= 150) return 3;
  return 2;
}

export interface MaxDiskonResult {
  persentase: number;
  maxNominal: number;
}

/**
 * Menghitung Rekomendasi Maksimal Diskon berdasarkan Grand Total Net x Persentase Diskon
 */
export function calculateMaxDiskon(grandTotalNet: number, totalPcs: number): MaxDiskonResult {
  const persentase = getMaxDiskonPercentage(totalPcs);
  const maxNominal = Math.round(Math.max(0, grandTotalNet || 0) * (persentase / 100));

  return {
    persentase,
    maxNominal,
  };
}

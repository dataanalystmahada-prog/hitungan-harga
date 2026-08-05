export type QuantityTier = 12 | 24 | 50 | 75 | 100 | 150 | 200 | 300 | 500;

export interface CalculationInput {
  produk: string;
  kode?: string;
  proses_logo: string;
  qty: number;
  sales?: string;
  diskonPersen: number;
  customModalProduk?: number;
  customModalLogo?: number;
  customMargin?: number;
}

export interface CalculationResult {
  modalProdukUnit: number;
  modalLogoUnit: number;
  totalModalUnit: number;
  marginPersen: number;
  hargaJualKotorUnit: number;
  totalHargaJualKotor: number;
  diskonPersen: number;
  diskonNominalUnit: number;
  hargaJualNetUnit: number;
  totalHargaJualNet: number;
  keuntunganTotal: number;
  closestTier: QuantityTier;
}

/**
 * Multi-Product Calculation Item
 */
export interface MultiProductItem {
  id: string;
  produk: string;
  kode?: string;
  proses_logo: string;
  qty: number;
  diskonPersen: number;
  customModalProduk?: number;
  customModalLogo?: number;
  customMargin?: number;
  calculation?: CalculationResult;
}

/**
 * Multi-Product Order Aggregate Summary
 */
export interface MultiProductOrderSummary {
  items: MultiProductItem[];
  totalItems: number;
  totalPcs: number;
  totalModal: number;
  totalHargaJualKotor: number;
  totalDiskonNominal: number;
  totalHargaJualNet: number;
  totalKeuntungan: number;
  avgMarginPersen: number;
  sales: string;
  namaPt?: string;
  brand?: string;
  catatan?: string;
}

export interface SPHItemDetail {
  produk: string;
  kode?: string;
  deskripsi?: string;
  proses_logo?: string;
  qty: number;
  hargaJualUnit: number;
  totalHargaJual: number;
  diskon: number;
}

export interface CreateSPHInput {
  tanggal: string;
  brand: string;
  no_sph?: string;
  nama_pt: string;
  deskripsi: string;
  produk: string;
  qty: number;
  harga_jual: number;
  ref_id?: string;
  sales: string;
  status_sph: string;
  keterangan: string;
  diskon: number;
  harga_jual_akhir: number;
  items?: SPHItemDetail[];
}

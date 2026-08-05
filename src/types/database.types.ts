export interface MasterProduk {
  id: string;
  nama_produk: string;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface ModalProduk {
  id: string;
  produk: string;
  kode?: string;
  harga_modal: number;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface ModalLogo {
  id: string;
  produk: string;
  proses_logo: string;
  qty_12: number;
  qty_24: number;
  qty_50: number;
  qty_75: number;
  qty_100: number;
  qty_150: number;
  qty_200: number;
  qty_300: number;
  qty_500: number;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface Margin {
  id: string;
  produk: string;
  proses_logo?: string;
  qty_12: number;
  qty_24: number;
  qty_50: number;
  qty_75: number;
  qty_100: number;
  qty_150: number;
  qty_200: number;
  qty_300: number;
  qty_500: number;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface Perhitungan {
  id: string;
  tanggal?: string;
  sales?: string;
  produk: string;
  kode?: string;
  proses_logo?: string;
  qty: number;
  modal_produk: number;
  modal_logo: number;
  margin: number;
  harga_jual: number;
  total_harga_jual: number;
  harga_jual_net: number;
  diskon: number;
  ref_id?: string;
  items?: any[];
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export type SPHStatus = 'Draft' | 'Dikirim' | 'Negosiasi' | 'Deal' | 'Disetujui' | 'Ditolak' | 'Batal';

export interface SPH {
  id: string;
  tanggal?: string;
  brand?: string;
  no_sph?: string;
  nama_pt?: string;
  deskripsi?: string;
  produk?: string;
  qty: number;
  harga_jual: number;
  ref_id?: string;
  sales?: string;
  status_sph: SPHStatus | string;
  keterangan?: string;
  diskon: number;
  harga_jual_akhir: number;
  items?: any[];
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface UserSales {
  id: string;
  nama: string;
  email?: string;
  role?: string;
  pin?: string;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface Divisi {
  id: string;
  nama_divisi: string;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface Brand {
  id: string;
  nama_brand: string;
  singkatan?: string;
  alamat?: string;
  email?: string;
  website?: string;
  no_telp_kantor?: string;
  no_telp_wa?: string;
  sosial_media?: string;
  rating_google_maps?: string;
  bank?: string;
  no_rekening?: string;
  atas_nama?: string;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface Keterangan {
  id: string;
  isi_keterangan: string;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export interface PromptLibrary {
  id: string;
  judul: string;
  kategori?: string;
  prompt_text: string;
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export type PromptItem = PromptLibrary;

export interface SyncLog {
  id: string;
  sheet_name: string;
  sync_type: 'AUTO' | 'MANUAL' | 'WEBHOOK';
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  records_processed: number;
  records_inserted: number;
  records_updated: number;
  records_failed?: number;
  duration_ms: number;
  error_message?: string;
  triggered_by: string;
  created_at: string;
}

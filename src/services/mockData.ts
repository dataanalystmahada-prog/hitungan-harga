import { 
  MasterProduk, ModalProduk, ModalLogo, Margin, Perhitungan, SPH, UserSales, Divisi, Brand, Keterangan, PromptLibrary, SyncLog 
} from '../types/database.types';

export const MOCK_MASTER_PRODUK: MasterProduk[] = [
  { id: 'PROD-001', nama_produk: 'Powerbank Std' },
  { id: 'PROD-002', nama_produk: 'Powerbank Premium' },
  { id: 'PROD-003', nama_produk: 'Payung_Ready' },
  { id: 'PROD-004', nama_produk: 'Payung_Fullprint' },
  { id: 'PROD-005', nama_produk: 'Agenda Ready' },
  { id: 'PROD-006', nama_produk: 'TS_Stainles' },
  { id: 'PROD-007', nama_produk: 'TS_Premium' },
  { id: 'PROD-008', nama_produk: 'TP_Plastik' },
  { id: 'PROD-009', nama_produk: 'Tas Ready A1' },
  { id: 'PROD-010', nama_produk: 'Tas Ready A2' },
  { id: 'PROD-011', nama_produk: 'Tas Ready A3' },
  { id: 'PROD-012', nama_produk: 'Jam_Meja' },
  { id: 'PROD-013', nama_produk: 'Ganci' },
  { id: 'PROD-014', nama_produk: 'Plakat Std' },
  { id: 'PROD-015', nama_produk: 'Packaging' },
  { id: 'PROD-016', nama_produk: 'Kaos Polos Premium Cotton 24s' },
  { id: 'PROD-017', nama_produk: 'Kaos Polo Lacoste CVC' },
  { id: 'PROD-018', nama_produk: 'Hoodie Zipper Fleece Cotton' },
  { id: 'PROD-019', nama_produk: 'Kemeja Drill Kantor PDL/PDH' }
];

export const MOCK_MODAL_PRODUK: ModalProduk[] = [
  // Powerbank Std
  { id: 'MOD-PB01', produk: 'Powerbank Std', kode: 'P100PL29', harga_modal: 72000 },
  { id: 'MOD-PB02', produk: 'Powerbank Std', kode: 'P100PL33', harga_modal: 72000 },
  { id: 'MOD-PB03', produk: 'Powerbank Std', kode: 'P100PL34B', harga_modal: 84000 },
  { id: 'MOD-PB04', produk: 'Powerbank Std', kode: 'P100PD02', harga_modal: 95000 },
  { id: 'MOD-PB05', produk: 'Powerbank Std', kode: 'P100PD03', harga_modal: 138000 },

  // Powerbank Premium
  { id: 'MOD-PBP01', produk: 'Powerbank Premium', kode: 'RT22', harga_modal: 247000 },
  { id: 'MOD-PBP02', produk: 'Powerbank Premium', kode: 'RT23', harga_modal: 273000 },
  { id: 'MOD-PBP03', produk: 'Powerbank Premium', kode: 'RT180', harga_modal: 180000 },
  { id: 'MOD-PBP04', produk: 'Powerbank Premium', kode: 'RT190', harga_modal: 137000 },
  { id: 'MOD-PBP05', produk: 'Powerbank Premium', kode: 'VPB-C20', harga_modal: 283000 },

  // Agenda Ready
  { id: 'MOD-AG01', produk: 'Agenda Ready', kode: 'AK 01', harga_modal: 37000 },
  { id: 'MOD-AG02', produk: 'Agenda Ready', kode: 'AK 03', harga_modal: 50000 },
  { id: 'MOD-AG03', produk: 'Agenda Ready', kode: 'AK 04', harga_modal: 52500 },
  { id: 'MOD-AG04', produk: 'Agenda Ready', kode: 'AG 01', harga_modal: 80000 },
  { id: 'MOD-AG05', produk: 'Agenda Ready', kode: 'AGLT06', harga_modal: 62500 },

  // Payung Ready
  { id: 'MOD-PY01', produk: 'Payung_Ready', kode: 'PG 01 (Kaz Luar Warna)', harga_modal: 75000 },
  { id: 'MOD-PY02', produk: 'Payung_Ready', kode: 'PG 02 (915)', harga_modal: 47000 },
  { id: 'MOD-PY03', produk: 'Payung_Ready', kode: 'PG 03 Manual 1', harga_modal: 23500 },
  { id: 'MOD-PY04', produk: 'Payung_Ready', kode: 'Golf Otomatis (76005)', harga_modal: 77500 },

  // Payung Fullprint
  { id: 'MOD-PYF01', produk: 'Payung_Fullprint', kode: 'PG 03 - STC - MP', harga_modal: 57600 },
  { id: 'MOD-PYF02', produk: 'Payung_Fullprint', kode: 'PG Golf Otomatis - STC - MP', harga_modal: 84900 },

  // Tas Ready
  { id: 'MOD-TR01', produk: 'Tas Ready A1', kode: 'Tas Spunbond Custom', harga_modal: 15000 },
  { id: 'MOD-TR02', produk: 'Tas Ready A2', kode: 'Tas Kanvas Standard', harga_modal: 28000 },
  { id: 'MOD-TR03', produk: 'Tas Ready A3', kode: 'Tas Ransel Laptop', harga_modal: 85000 },

  // Tumbler & Lainnya
  { id: 'MOD-TS01', produk: 'TS_Stainles', kode: 'Tumbler Sakura LED 500ml', harga_modal: 32000 },
  { id: 'MOD-TS02', produk: 'TS_Premium', kode: 'Tumbler Hydro Vacuum Flask', harga_modal: 68000 },
  { id: 'MOD-TP01', produk: 'TP_Plastik', kode: 'My Bottle BPA Free', harga_modal: 12000 },
  { id: 'MOD-PL01', produk: 'Plakat Std', kode: 'Plakat Akrilik 15x20cm', harga_modal: 75000 },

  // Apparel
  { id: 'MOD-AP01', produk: 'Kaos Polos Premium Cotton 24s', kode: 'KPS-24S', harga_modal: 35000 },
  { id: 'MOD-AP02', produk: 'Kaos Polo Lacoste CVC', kode: 'POLO-CVC', harga_modal: 55000 },
  { id: 'MOD-AP03', produk: 'Hoodie Zipper Fleece Cotton', kode: 'HD-ZIP-COT', harga_modal: 95000 },
  { id: 'MOD-AP04', produk: 'Kemeja Drill Kantor PDL/PDH', kode: 'KMJ-DRL', harga_modal: 78000 }
];

export const MOCK_MODAL_LOGO: ModalLogo[] = [
  // Tas Ready A2
  { id: 'MLG-001', produk: 'Tas Ready A2', proses_logo: 'A5 - Sablon 1 Sisi - UU', qty_12: 12000, qty_24: 3000, qty_50: 1500, qty_75: 1500, qty_100: 1500, qty_150: 1500, qty_200: 1500, qty_300: 1500, qty_500: 1500 },
  { id: 'MLG-002', produk: 'Tas Ready A2', proses_logo: 'A4 - DTF 1 Sisi - BP', qty_12: 10000, qty_24: 10000, qty_50: 10000, qty_75: 10000, qty_100: 10000, qty_150: 10000, qty_200: 10000, qty_300: 10000, qty_500: 10000 },
  { id: 'MLG-003', produk: 'Tas Ready A2', proses_logo: 'A5 - DTF 1 Sisi - BGP', qty_12: 5000, qty_24: 5000, qty_50: 5000, qty_75: 5000, qty_100: 5000, qty_150: 5000, qty_200: 5000, qty_300: 5000, qty_500: 5000 },

  // Powerbank Std & Premium
  { id: 'MLG-PB01', produk: 'Powerbank Std', proses_logo: 'Sablon 1 Sisi 1 Warna', qty_12: 8000, qty_24: 5000, qty_50: 3500, qty_75: 2500, qty_100: 2000, qty_150: 1800, qty_200: 1500, qty_300: 1200, qty_500: 1000 },
  { id: 'MLG-PB02', produk: 'Powerbank Std', proses_logo: 'Print UV Fullcolor 1 Sisi', qty_12: 15000, qty_24: 12000, qty_50: 9000, qty_75: 7500, qty_100: 6000, qty_150: 5500, qty_200: 5000, qty_300: 4500, qty_500: 4000 },
  { id: 'MLG-PBP01', produk: 'Powerbank Premium', proses_logo: 'Laser Engraving 1 Titik', qty_12: 12000, qty_24: 9000, qty_50: 7000, qty_75: 6000, qty_100: 5000, qty_150: 4500, qty_200: 4000, qty_300: 3500, qty_500: 3000 },
  { id: 'MLG-PBP02', produk: 'Powerbank Premium', proses_logo: 'Print UV Fullcolor', qty_12: 18000, qty_24: 14000, qty_50: 10000, qty_75: 8500, qty_100: 7000, qty_150: 6000, qty_200: 5500, qty_300: 5000, qty_500: 4500 },

  // Agenda Ready
  { id: 'MLG-AG01', produk: 'Agenda Ready', proses_logo: 'Deboss / Emboss Logo', qty_12: 15000, qty_24: 10000, qty_50: 7000, qty_75: 5500, qty_100: 4500, qty_150: 4000, qty_200: 3500, qty_300: 3000, qty_500: 2500 },
  { id: 'MLG-AG02', produk: 'Agenda Ready', proses_logo: 'Sablon Silver / Emas', qty_12: 8000, qty_24: 5000, qty_50: 3500, qty_75: 2500, qty_100: 2000, qty_150: 1800, qty_200: 1500, qty_300: 1200, qty_500: 1000 },

  // Payung
  { id: 'MLG-PY01', produk: 'Payung_Ready', proses_logo: 'Sablon 2 Daun 1 Warna', qty_12: 12000, qty_24: 8000, qty_50: 5000, qty_75: 4000, qty_100: 3000, qty_150: 2500, qty_200: 2000, qty_300: 1800, qty_500: 1500 },
  { id: 'MLG-PY02', produk: 'Payung_Ready', proses_logo: 'Sablon 4 Daun 1 Warna', qty_12: 18000, qty_24: 12000, qty_50: 8000, qty_75: 6500, qty_100: 5000, qty_150: 4500, qty_200: 4000, qty_300: 3500, qty_500: 3000 },

  // Apparel
  { id: 'MLG-AP01', produk: 'Kaos Polos Premium Cotton 24s', proses_logo: 'Sablon DTF A4', qty_12: 20000, qty_24: 18000, qty_50: 15000, qty_75: 13000, qty_100: 11000, qty_150: 10000, qty_200: 9000, qty_300: 8000, qty_500: 7000 },
  { id: 'MLG-AP02', produk: 'Kaos Polo Lacoste CVC', proses_logo: 'Bordir Komputer Dada + Punggung', qty_12: 30000, qty_24: 25000, qty_50: 20000, qty_75: 17000, qty_100: 15000, qty_150: 13000, qty_200: 12000, qty_300: 10000, qty_500: 9000 }
];

export const MOCK_MARGIN: Margin[] = [
  // Multipliers from spreadsheet (1.70 = 1.70x, etc.)
  { id: 'MRG-001', produk: 'Powerbank Std', proses_logo: '', qty_12: 1.67, qty_24: 1.60, qty_50: 1.54, qty_75: 1.50, qty_100: 1.47, qty_150: 1.45, qty_200: 1.43, qty_300: 1.40, qty_500: 1.37 },
  { id: 'MRG-002', produk: 'Powerbank Premium', proses_logo: '', qty_12: 1.67, qty_24: 1.60, qty_50: 1.54, qty_75: 1.50, qty_100: 1.47, qty_150: 1.45, qty_200: 1.43, qty_300: 1.40, qty_500: 1.37 },
  { id: 'MRG-003', produk: 'Agenda Ready', proses_logo: '', qty_12: 1.67, qty_24: 1.60, qty_50: 1.54, qty_75: 1.50, qty_100: 1.47, qty_150: 1.45, qty_200: 1.43, qty_300: 1.40, qty_500: 1.37 },
  { id: 'MRG-004', produk: 'Payung_Ready', proses_logo: '', qty_12: 1.67, qty_24: 1.60, qty_50: 1.54, qty_75: 1.50, qty_100: 1.47, qty_150: 1.45, qty_200: 1.43, qty_300: 1.40, qty_500: 1.37 },
  { id: 'MRG-005', produk: 'Payung_Fullprint', proses_logo: '', qty_12: 1.73, qty_24: 1.70, qty_50: 1.67, qty_75: 1.60, qty_100: 1.54, qty_150: 1.50, qty_200: 1.47, qty_300: 1.45, qty_500: 1.43 },
  { id: 'MRG-006', produk: 'TS_Stainles', proses_logo: '', qty_12: 1.70, qty_24: 1.60, qty_50: 1.54, qty_75: 1.50, qty_100: 1.47, qty_150: 1.45, qty_200: 1.43, qty_300: 1.40, qty_500: 1.37 },
  { id: 'MRG-007', produk: 'TS_Premium', proses_logo: '', qty_12: 1.55, qty_24: 1.50, qty_50: 1.47, qty_75: 1.45, qty_100: 1.43, qty_150: 1.40, qty_200: 1.35, qty_300: 1.33, qty_500: 1.30 },
  { id: 'MRG-008', produk: 'Tas Ready A1', proses_logo: '', qty_12: 1.90, qty_24: 1.60, qty_50: 1.54, qty_75: 1.50, qty_100: 1.47, qty_150: 1.45, qty_200: 1.43, qty_300: 1.40, qty_500: 1.37 },
  { id: 'MRG-009', produk: 'Tas Ready A2', proses_logo: '', qty_12: 1.73, qty_24: 1.70, qty_50: 1.67, qty_75: 1.60, qty_100: 1.54, qty_150: 1.50, qty_200: 1.47, qty_300: 1.45, qty_500: 1.43 },
  { id: 'MRG-010', produk: 'Tas Ready A3', proses_logo: '', qty_12: 1.67, qty_24: 1.60, qty_50: 1.54, qty_75: 1.50, qty_100: 1.47, qty_150: 1.45, qty_200: 1.43, qty_300: 1.40, qty_500: 1.37 },
  { id: 'MRG-011', produk: 'Kaos Polos Premium Cotton 24s', proses_logo: '', qty_12: 45.0, qty_24: 40.0, qty_50: 35.0, qty_75: 32.0, qty_100: 30.0, qty_150: 28.0, qty_200: 25.0, qty_300: 22.0, qty_500: 20.0 }
];

export const MOCK_USERS: UserSales[] = [
  { id: 'USR-001', nama: 'Ahmad Pratama', email: 'ahmad.pratama@company.com' },
  { id: 'USR-002', nama: 'Siti Rahmawati', email: 'siti.rahmawati@company.com' },
  { id: 'USR-003', nama: 'Budi Santoso', email: 'budi.santoso@company.com' },
  { id: 'USR-004', nama: 'Dian Anggraini', email: 'dian.anggraini@company.com' },
  { id: 'USR-005', nama: 'Rizky Kurniawan', email: 'rizky.kurniawan@company.com' }
];

export const MOCK_DIVISI: Divisi[] = [
  { id: 'DIV-001', nama_divisi: 'Corporate Sales & Tender' },
  { id: 'DIV-002', nama_divisi: 'Retail & Community Order' },
  { id: 'DIV-003', nama_divisi: 'Event Merchandise & Promotion' }
];

export const MOCK_BRANDS: Brand[] = [
  { 
    id: 'BRD-001', 
    nama_brand: 'Amanah Apparel Indonesia', 
    singkatan: 'AAI', 
    alamat: 'Jl. Industri Kreatif No. 88, Bandung', 
    email: 'sales@amanahapparel.id', 
    website: 'https://amanahapparel.id', 
    no_telp_kantor: '022-7201928', 
    no_telp_wa: '081234567890', 
    sosial_media: '@amanahapparel.official', 
    rating_google_maps: '4.9 (1.200 Review)', 
    bank: 'BCA', 
    no_rekening: '1390888999', 
    atas_nama: 'PT AMANAH APPAREL INDONESIA' 
  },
  { 
    id: 'BRD-002', 
    nama_brand: 'Nusantara Garment Enterprise', 
    singkatan: 'NGE', 
    alamat: 'Kawasan Niaga Terpadu Blok C3, Jakarta Selatan', 
    email: 'contact@nusantaragarment.com', 
    website: 'https://nusantaragarment.com', 
    no_telp_kantor: '021-55443322', 
    no_telp_wa: '081199887766', 
    sosial_media: '@nusantaragarment', 
    rating_google_maps: '4.8 (850 Review)', 
    bank: 'Mandiri', 
    no_rekening: '1270008887766', 
    atas_nama: 'PT NUSANTARA GARMENT' 
  }
];

export const MOCK_KETERANGAN: Keterangan[] = [
  { id: 'KET-001', isi_keterangan: 'Harga sudah termasuk biaya produksi, sablon/bordir/laser, dan packing rapi individual polybag.' },
  { id: 'KET-002', isi_keterangan: 'Pembayaran DP minimal 50% saat PO diterbitkan, pelunasan 50% sebelum barang dikirim.' },
  { id: 'KET-003', isi_keterangan: 'Waktu pengerjaan 10-14 hari kerja terhitung setelah persetujuan sampel mockup digital.' },
  { id: 'KET-004', isi_keterangan: 'Pengiriman gratis area Jadetabek untuk pemesanan di atas 100 pcs.' }
];

export const MOCK_PROMPT_LIBRARY: PromptLibrary[] = [
  { id: 'PRM-001', judul: 'SPH Follow-up Formal', kategori: 'Sales SPH', prompt_text: 'Halo Bapak/Ibu {nama_client}, perkenalkan saya {sales} dari {brand}. Melalui pesan ini kami ingin menanyakan konfirmasi penawaran SPH No. {no_sph} dengan rincian paket pesanan multi-item.' },
  { id: 'PRM-002', judul: 'Closing Diskon Khusus Batch', kategori: 'Promo', prompt_text: 'Dapatkan potongan diskon khusus tambahan 5% untuk persetujuan SPH sebelum akhir bulan ini. Kapasitas produksi aman tepat waktu.' }
];

export const generateMockPerhitungan = (): Perhitungan[] => {
  const list: Perhitungan[] = [];
  const sales = ['Ahmad Pratama', 'Siti Rahmawati', 'Budi Santoso', 'Dian Anggraini', 'Rizky Kurniawan'];
  const products = [
    { name: 'Powerbank Std', code: 'P100PL29', modalP: 72000, logo: 'Sablon 1 Sisi 1 Warna', modalL: 3500, margin: 35 },
    { name: 'Powerbank Premium', code: 'RT180', modalP: 180000, logo: 'Laser Engraving 1 Titik', modalL: 7000, margin: 30 },
    { name: 'Agenda Ready', code: 'AK 01', modalP: 37000, logo: 'Deboss / Emboss Logo', modalL: 7000, margin: 35 },
    { name: 'Payung_Ready', code: 'PG 02 (915)', modalP: 47000, logo: 'Sablon 2 Daun 1 Warna', modalL: 5000, margin: 35 },
    { name: 'Tas Ready A2', code: 'Tas Kanvas Standard', modalP: 28000, logo: 'A5 - Sablon 1 Sisi - UU', modalL: 1500, margin: 40 },
    { name: 'Kaos Polos Premium Cotton 24s', code: 'KPS-24S', modalP: 35000, logo: 'Sablon DTF A4', modalL: 15000, margin: 30 }
  ];

  for (let i = 1; i <= 150; i++) {
    const p = products[i % products.length];
    const s = sales[i % sales.length];
    const qty = [24, 50, 100, 150, 200, 500][i % 6];
    const totalModal = p.modalP + p.modalL;
    const hargaJualUnit = Math.round(totalModal / (1 - (p.margin / 100)));
    const totalHarga = hargaJualUnit * qty;
    const diskon = i % 7 === 0 ? 5 : 0;
    const net = Math.round(totalHarga * (1 - diskon / 100));

    list.push({
      id: `CALC-MOCK-${1000 + i}`,
      tanggal: `${(28 - (i % 25)).toString().padStart(2, '0')}/08/2026`,
      sales: s,
      produk: p.name,
      kode: p.code,
      proses_logo: p.logo,
      qty: qty,
      modal_produk: p.modalP,
      modal_logo: p.modalL,
      margin: p.margin,
      harga_jual: hargaJualUnit,
      total_harga_jual: totalHarga,
      harga_jual_net: net,
      diskon: diskon,
      created_at: new Date(Date.now() - i * 3600000 * 8).toISOString()
    });
  }
  return list;
};

export const generateMockSPH = (): SPH[] => {
  const list: SPH[] = [];
  const sales = ['Ahmad Pratama', 'Siti Rahmawati', 'Budi Santoso', 'Dian Anggraini', 'Rizky Kurniawan'];
  const companies = [
    'PT Bank Central Asia Tbk',
    'PT Telkom Indonesia (Persero) Tbk',
    'PT Astra International Tbk',
    'PT Pertamina Lubricants',
    'Universitas Indonesia',
    'PT Shopee International Indonesia',
    'Kementerian Keuangan RI'
  ];
  const products = ['Paket Souvenir Powerbank + Agenda', 'Payung Ready Promosi', 'Tas Ready Kanvas A2', 'Polo Shirt CVC Custom', 'Paket Merchandise Event'];
  const statuses = ['Deal', 'Dikirim', 'Negosiasi', 'Draft', 'Disetujui', 'Ditolak'];

  for (let i = 1; i <= 60; i++) {
    const comp = companies[i % companies.length];
    const s = sales[i % sales.length];
    const prod = products[i % products.length];
    const qty = [50, 100, 200, 300, 500, 1000][i % 6];
    const unitPrice = [65000, 125000, 185000, 48000, 92000][i % 5];
    const totalGross = unitPrice * qty;
    const diskon = i % 4 === 0 ? 5 : 0;
    const totalAkhir = Math.round(totalGross * (1 - diskon / 100));
    const status = statuses[i % statuses.length];

    list.push({
      id: `SPH-MOCK-${1000 + i}`,
      tanggal: `${(28 - (i % 25)).toString().padStart(2, '0')}/08/2026`,
      brand: i % 2 === 0 ? 'Amanah Apparel Indonesia' : 'Nusantara Garment Enterprise',
      no_sph: `SPH/AAI/2026/08/${String(100 + i).padStart(4, '0')}`,
      nama_pt: comp,
      deskripsi: `Pengadaan ${prod} pesanan resmi ${qty} pcs`,
      produk: prod,
      qty: qty,
      harga_jual: unitPrice,
      ref_id: `CALC-MOCK-${1000 + i}`,
      sales: s,
      status_sph: status,
      keterangan: 'Harga sudah termasuk custom logo dan packing rapi.',
      diskon: diskon,
      harga_jual_akhir: totalAkhir,
      created_at: new Date(Date.now() - i * 3600000 * 12).toISOString()
    });
  }
  return list;
};

export const MOCK_SYNC_LOGS: SyncLog[] = [
  {
    id: 'LOG-001',
    sheet_name: 'ModalProduk',
    sync_type: 'AUTO',
    status: 'SUCCESS',
    records_processed: 125,
    records_inserted: 120,
    records_updated: 5,
    duration_ms: 380,
    triggered_by: 'Cron Trigger 15m',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'LOG-002',
    sheet_name: 'ModalLogo',
    sync_type: 'AUTO',
    status: 'SUCCESS',
    records_processed: 48,
    records_inserted: 45,
    records_updated: 3,
    duration_ms: 290,
    triggered_by: 'Cron Trigger 15m',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'LOG-003',
    sheet_name: 'Margin',
    sync_type: 'AUTO',
    status: 'SUCCESS',
    records_processed: 30,
    records_inserted: 30,
    records_updated: 0,
    duration_ms: 210,
    triggered_by: 'Cron Trigger 15m',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  }
];

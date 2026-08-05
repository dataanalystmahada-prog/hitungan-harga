-- ====================================================================
-- ENTERPRISE SEED DATA
-- Master Data, Pricing Matrices, Calculations & Quotations
-- ====================================================================

-- 1. Master Produk
INSERT INTO public.produk (id, nama_produk) VALUES
('PROD-001', 'Kaos Polos Premium Cotton 24s'),
('PROD-002', 'Kaos Polo Lacoste CVC'),
('PROD-003', 'Hoodie Zipper Fleece Cotton'),
('PROD-004', 'Kemeja Drill Kantor PDL/PDH'),
('PROD-005', 'Jaket Bomber Taslan Waterproof'),
('PROD-006', 'Tote Bag Kanvas Premium'),
('PROD-007', 'Topi Baseball Twill Custom')
ON CONFLICT (id) DO NOTHING;

-- 2. Modal Produk
INSERT INTO public.modal_produk (id, produk, kode, harga_modal) VALUES
('MOD-001', 'Kaos Polos Premium Cotton 24s', 'KPS-24S', 35000),
('MOD-002', 'Kaos Polo Lacoste CVC', 'POLO-CVC', 55000),
('MOD-003', 'Hoodie Zipper Fleece Cotton', 'HD-ZIP-COT', 95000),
('MOD-004', 'Kemeja Drill Kantor PDL/PDH', 'KMJ-DRL', 78000),
('MOD-005', 'Jaket Bomber Taslan Waterproof', 'JKT-BMB-TSL', 125000),
('MOD-006', 'Tote Bag Kanvas Premium', 'TB-KNV', 28000),
('MOD-007', 'Topi Baseball Twill Custom', 'TP-BSB', 22000)
ON CONFLICT (id) DO NOTHING;

-- 3. Modal Logo Matrix
INSERT INTO public.modal_logo (id, produk, proses_logo, qty_12, qty_24, qty_50, qty_75, qty_100, qty_150, qty_200, qty_300, qty_500) VALUES
('MLG-001', 'Kaos Polos Premium Cotton 24s', 'Sablon DTF A4', 20000, 18000, 15000, 13000, 11000, 10000, 9000, 8000, 7000),
('MLG-002', 'Kaos Polos Premium Cotton 24s', 'Sablon Rubber Manual 3 Warna', 25000, 20000, 14000, 11000, 9000, 8000, 7000, 6000, 5000),
('MLG-003', 'Kaos Polo Lacoste CVC', 'Bordir Komputer Dada + Punggung', 30000, 25000, 20000, 17000, 15000, 13000, 12000, 10000, 9000),
('MLG-004', 'Hoodie Zipper Fleece Cotton', 'Bordir Komputer + Sablon DTF', 35000, 30000, 25000, 22000, 19000, 17000, 15000, 13000, 11000),
('MLG-005', 'Kemeja Drill Kantor PDL/PDH', 'Bordir Komputer 3 Titik', 28000, 23000, 18000, 15000, 13000, 11000, 10000, 8500, 7500)
ON CONFLICT (id) DO NOTHING;

-- 4. Margin Matrix (%)
INSERT INTO public.margin (id, produk, proses_logo, qty_12, qty_24, qty_50, qty_75, qty_100, qty_150, qty_200, qty_300, qty_500) VALUES
('MRG-001', 'Kaos Polos Premium Cotton 24s', 'Sablon DTF A4', 45.0, 40.0, 35.0, 32.0, 30.0, 28.0, 25.0, 22.0, 20.0),
('MRG-002', 'Kaos Polos Premium Cotton 24s', 'Sablon Rubber Manual 3 Warna', 45.0, 40.0, 35.0, 32.0, 30.0, 28.0, 25.0, 22.0, 20.0),
('MRG-003', 'Kaos Polo Lacoste CVC', 'Bordir Komputer Dada + Punggung', 40.0, 38.0, 35.0, 30.0, 28.0, 26.0, 24.0, 22.0, 20.0),
('MRG-004', 'Hoodie Zipper Fleece Cotton', 'Bordir Komputer + Sablon DTF', 42.0, 38.0, 34.0, 30.0, 28.0, 25.0, 24.0, 22.0, 20.0),
('MRG-005', 'Kemeja Drill Kantor PDL/PDH', 'Bordir Komputer 3 Titik', 40.0, 36.0, 33.0, 30.0, 28.0, 25.0, 23.0, 21.0, 19.0)
ON CONFLICT (id) DO NOTHING;

-- 5. Brands
INSERT INTO public.brands (id, nama_brand, singkatan, alamat, email, website, no_telp_kantor, no_telp_wa, sosial_media, rating_google_maps, bank, no_rekening, atas_nama) VALUES
('BRD-001', 'Amanah Apparel Indonesia', 'AAI', 'Jl. Industri Kreatif No. 88, Bandung', 'sales@amanahapparel.id', 'https://amanahapparel.id', '022-7201928', '081234567890', '@amanahapparel.official', '4.9 (1.200 Review)', 'BCA', '1390888999', 'PT AMANAH APPAREL INDONESIA'),
('BRD-002', 'Nusantara Garment Enterprise', 'NGE', 'Kawasan Niaga Terpadu Blok C3, Jakarta Selatan', 'contact@nusantaragarment.com', 'https://nusantaragarment.com', '021-55443322', '081199887766', '@nusantaragarment', '4.8 (850 Review)', 'Mandiri', '1270008887766', 'PT NUSANTARA GARMENT')
ON CONFLICT (id) DO NOTHING;

-- 6. Users / Sales
INSERT INTO public.users (id, nama, email) VALUES
('USR-001', 'Ahmad Pratama', 'ahmad.pratama@company.com'),
('USR-002', 'Siti Rahmawati', 'siti.rahmawati@company.com'),
('USR-003', 'Budi Santoso', 'budi.santoso@company.com'),
('USR-004', 'Dian Anggraini', 'dian.anggraini@company.com'),
('USR-005', 'Rizky Kurniawan', 'rizky.kurniawan@company.com')
ON CONFLICT (id) DO NOTHING;

-- 7. Divisi
INSERT INTO public.divisi (id, nama_divisi) VALUES
('DIV-001', 'Corporate Sales & Tender'),
('DIV-002', 'Retail & Community Order'),
('DIV-003', 'Event Merchandise & Promotion')
ON CONFLICT (id) DO NOTHING;

-- 8. Keterangan
INSERT INTO public.keterangan (id, isi_keterangan) VALUES
('KET-001', 'Harga sudah termasuk biaya produksi, sablon/bordir, dan packing rapi individual polybag.'),
('KET-002', 'Pembayaran DP minimal 50% saat PO diterbitkan, pelunasan 50% sebelum barang dikirim.'),
('KET-003', 'Waktu pengerjaan 10-14 hari kerja terhitung setelah persetujuan sampel mockup digital.'),
('KET-004', 'Pengiriman gratis area Jadetabek untuk pemesanan di atas 100 pcs.')
ON CONFLICT (id) DO NOTHING;

-- 9. Prompt Library
INSERT INTO public.prompt_library (id, judul, kategori, prompt_text) VALUES
('PRM-001', 'SPH Follow-up Formal', 'Sales SPH', 'Halo Bapak/Ibu {nama_client}, perkenalkan saya {sales} dari {brand}. Melalui pesan ini kami ingin menanyakan konfirmasi penawaran SPH No. {no_sph} dengan total order {qty} pcs {produk}.'),
('PRM-002', 'Closing Diskon Akhir Bulan', 'Promo', 'Dapatkan potongan diskon khusus 5% untuk persetujuan SPH sebelum tanggal akhir bulan ini. Estimasi pengerjaan aman tepat waktu.')
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Perhitungan
INSERT INTO public.perhitungan (id, tanggal, sales, produk, kode, proses_logo, qty, modal_produk, modal_logo, margin, harga_jual, total_harga_jual, harga_jual_net, diskon) VALUES
('CALC-1001', '01/08/2026', 'Ahmad Pratama', 'Kaos Polos Premium Cotton 24s', 'KPS-24S', 'Sablon DTF A4', 100, 35000, 11000, 30.0, 65700, 6570000, 6241500, 5.0),
('CALC-1002', '02/08/2026', 'Siti Rahmawati', 'Kaos Polo Lacoste CVC', 'POLO-CVC', 'Bordir Komputer Dada + Punggung', 50, 55000, 20000, 35.0, 115380, 5769000, 5769000, 0.0),
('CALC-1003', '03/08/2026', 'Budi Santoso', 'Hoodie Zipper Fleece Cotton', 'HD-ZIP-COT', 'Bordir Komputer + Sablon DTF', 75, 95000, 22000, 30.0, 167140, 12535500, 12535500, 0.0),
('CALC-1004', '04/08/2026', 'Dian Anggraini', 'Kemeja Drill Kantor PDL/PDH', 'KMJ-DRL', 'Bordir Komputer 3 Titik', 150, 78000, 11000, 25.0, 118660, 17799000, 16909050, 5.0),
('CALC-1005', '05/08/2026', 'Rizky Kurniawan', 'Kaos Polos Premium Cotton 24s', 'KPS-24S', 'Sablon Rubber Manual 3 Warna', 200, 35000, 7000, 25.0, 56000, 11200000, 11200000, 0.0)
ON CONFLICT (id) DO NOTHING;

-- 11. Sample SPH Quotations
INSERT INTO public.sph (id, tanggal, brand, no_sph, nama_pt, deskripsi, produk, qty, harga_jual, ref_id, sales, status_sph, keterangan, diskon, harga_jual_akhir) VALUES
('SPH-2026-001', '01/08/2026', 'Amanah Apparel Indonesia', 'SPH/AAI/2026/08/001', 'PT Telekomunikasi Solusi Bangsa', 'Pengadaan Seragam Gathering Kantor 2026', 'Kaos Polos Premium Cotton 24s', 100, 65700, 'CALC-1001', 'Ahmad Pratama', 'Deal', 'Pembayaran termin 50% DP, 50% pelunasan.', 5.0, 6241500),
('SPH-2026-002', '02/08/2026', 'Nusantara Garment Enterprise', 'SPH/NGE/2026/08/002', 'Bank Megatama Internasional', 'Seragam Polo Hari Jumat Divisi IT', 'Kaos Polo Lacoste CVC', 50, 115380, 'CALC-1002', 'Siti Rahmawati', 'Negosiasi', 'Include bordir 2 titik presisi tinggi.', 0.0, 5769000),
('SPH-2026-003', '03/08/2026', 'Amanah Apparel Indonesia', 'SPH/AAI/2026/08/003', 'Universitas Global Mandiri', 'Hoodie Jaket Angkatan Teknik Informatika', 'Hoodie Zipper Fleece Cotton', 75, 167140, 'CALC-1003', 'Budi Santoso', 'Dikirim', 'Include polybag ziplock premium.', 0.0, 12535500),
('SPH-2026-004', '04/08/2026', 'Nusantara Garment Enterprise', 'SPH/NGE/2026/08/004', 'PT Petro Energi Nusantara', 'Seragam Kemeja Lapangan PDL Staff Tambang', 'Kemeja Drill Kantor PDL/PDH', 150, 118660, 'CALC-1004', 'Dian Anggraini', 'Deal', 'Bahan drill American 1919 anti kusut.', 5.0, 16909050)
ON CONFLICT (id) DO NOTHING;

-- 12. Initial Sync Log
INSERT INTO public.sync_logs (sheet_name, sync_type, status, records_processed, records_inserted, records_updated, duration_ms, triggered_by) VALUES
('INITIAL_SEED', 'MANUAL', 'SUCCESS', 12, 12, 0, 185, 'System Setup Initializer');

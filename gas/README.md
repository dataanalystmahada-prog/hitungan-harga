# Google Apps Script Sync Engine Setup Guide

Panduan pemasangan Sync Engine pada Google Spreadsheet yang sudah ada:

## 1. Buka Google Spreadsheet Anda
1. Buka file Google Spreadsheet yang berisi master data (`ModalProduk`, `ModalLogo`, `Margin`, `Perhitungan`, `SPH`, `Users`, `Divisi`, `Brands`, `Produk`, `Keterangan`).
2. Klik menu **Extensions (Ekstensi)** > **Apps Script**.

## 2. Pasang Kode Sync Engine
1. Hapus isi file `Code.gs` default di editor Apps Script.
2. Salin seluruh isi dari file [`gas/Code.gs`](file:///c:/Users/DATA%20ANALYST%20-%20MHD/.Aplikasi%20Test/Hitungan%20Harga%20-%20Review%20-%20Copy/gas/Code.gs) dan tempel (*paste*) ke editor.
3. Klik ikon **Save (Simpan / Ctrl+S)**.

## 3. Konfigurasi Kredensial Supabase
1. Muat ulang (*refresh*) halaman Google Spreadsheet Anda.
2. Menu baru bernama **🚀 Supabase Sync Engine** akan muncul di bagian atas spreadsheet.
3. Klik **🚀 Supabase Sync Engine** > **⚙️ Setup Supabase Credentials**.
4. Masukkan:
   - **Supabase URL**: `https://your-project.supabase.co`
   - **Supabase API Key**: Kunci `anon` atau `service_role` dari dashboard Supabase Anda.
5. Berikan izin otorisasi (*authorization*) Google Apps Script saat diminta pertama kali.

## 4. Menjalankan Sinkronisasi
- **Sinkronisasi Manual**: Klik **🚀 Supabase Sync Engine** > **⚡ Sync Semua Sheet (Full Sync)**.
- **Sinkronisasi Otomatis**: Klik **🚀 Supabase Sync Engine** > **🔄 Aktifkan Auto-Sync (Setiap 15 Menit)**.
- **Cek Status**: Klik **🚀 Supabase Sync Engine** > **📊 Cek Status Koneksi & Log Sinkronisasi**.

Semua log transaksi sinkronisasi akan tercatat secara otomatis pada tabel `sync_logs` di database Supabase dan dapat dipantau langsung dari web dashboard React.

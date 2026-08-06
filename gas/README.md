# Google Apps Script Full Mirror Sync Guide (3 Tab Master)

Panduan pemasangan dan pembaruan Google Apps Script Sync Engine untuk sinkronisasi **Full Mirror** antara Google Spreadsheet dan Supabase:

## 1. Lingkup Sinkronisasi (Hanya 3 Tab)
Sync Engine hanya menyinkronkan 3 tab master pricing:
1. **`ModalProduk`** ➔ Tabel Supabase: `modal_produk`
2. **`ModalLogo`** ➔ Tabel Supabase: `modal_logo`
3. **`Margin`** ➔ Tabel Supabase: `margin`

> [!NOTE]
> Tab lain seperti `Perhitungan`, `SPH`, dll. dikelola langsung dari aplikasi web React dan tidak akan ditimpa (*overwrite*) oleh sinkronisasi Spreadsheet.

---

## 2. Cara Kerja Full Sync (Mirroring)
Setiap kali sinkronisasi dijalankan (otomatis maupun manual):
- ✅ **Data Baru** di Spreadsheet ➔ Ditambahkan ke Supabase.
- 🔄 **Data Berubah** di Spreadsheet ➔ Diperbarui (*updated*) di Supabase.
- 🗑️ **Data yang Dihapus** di Spreadsheet ➔ **Otomatis terhapus dari Supabase** sehingga Supabase selalu 100% identik (*mirror*) dengan Spreadsheet.

---

## 3. Cara Pasang / Update di Google Spreadsheet

1. Buka file Google Spreadsheet Anda.
2. Klik menu **Extensions (Ekstensi)** > **Apps Script**.
3. Buka file `Code.gs` di editor Apps Script, hapus seluruh isinya, lalu tempel (*paste*) kode terbaru dari [`gas/Code.gs`](file:///c:/Users/DATA%20ANALYST%20-%20MHD/.Aplikasi%20Test/Hitungan%20Harga%20-%20Review%20-%20Copy/gas/Code.gs).
4. Klik ikon **Save (Simpan / Ctrl+S)**.
5. Muat ulang (*refresh*) halaman Google Spreadsheet.
6. Menu baru bernama **🚀 Supabase Sync Engine** akan muncul di toolbar spreadsheet.

---

## 4. Setup Kredensial & Otorisasi

1. Di Spreadsheet, klik **🚀 Supabase Sync Engine** > **⚙️ Setup Supabase Credentials (URL & Key)**.
2. Masukkan:
   - **Supabase URL**: `https://your-project.supabase.co`
   - **Supabase API Key**: Anon Key atau Service Role Key Supabase Anda.
3. Berikan izin otorisasi (*authorization*) Google jika diminta.

---

## 5. Fitur Menu di Spreadsheet

- **⚡ Full Sync 3 Tab**: Menjalankan sinkronisasi cermin (*mirror*) untuk `ModalProduk`, `ModalLogo`, dan `Margin`.
- **📄 Sync Sheet Aktif**: Menjalankan sinkronisasi khusus untuk tab yang sedang dibuka (jika termasuk salah satu dari 3 tab master).
- **🔄 Aktifkan Auto-Sync (Setiap 15 Menit)**: Menjadwalkan sinkronisasi otomatis di latar belakang (*time-driven trigger*).
- **⏸️ Matikan Semua Trigger Auto-Sync**: Menonaktifkan sinkronisasi otomatis.
- **📊 Cek Status Koneksi & Log Sinkronisasi**: Menguji konektivitas dan melihat riwayat sinkronisasi terakhir.

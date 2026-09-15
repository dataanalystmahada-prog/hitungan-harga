import React from 'react';
import { Card } from '../components/common/Card';
import { 
  FileDigit, 
  Calculator, 
  PenSquare, 
  Percent, 
  Truck, 
  BarChart, 
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';

export const AturanAplikasiPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-500" />
          Kumpulan Aturan Sistem
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Daftar regulasi, formula, dan aturan logika baku yang diterapkan secara otomatis di dalam aplikasi Enterprise Pricing.
        </p>
      </div>

      {/* Rules Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Aturan Penomoran SPH */}
        <Card hoverEffect className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <FileDigit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Penomoran SPH Berkelanjutan</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Format Surat Penawaran</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <p>
              Nomor dokumen SPH di-generate secara otomatis dan akan <strong>terus berlanjut berurutan</strong> 
              (contoh: <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600 dark:text-brand-400">SPH 2326</span>, <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600 dark:text-brand-400">SPH 2327</span>).
            </p>
            <ul className="space-y-1.5 mt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs">Nomor tidak akan ter-reset meskipun terjadi pergantian bulan kalender.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs">Tahun dan penanda perusahaan tetap dinamis mengikuti input dokumen.</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Sumber Kalkulasi (M & H) */}
        <Card hoverEffect className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Sumber Data Penawaran</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Simbol H & M</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <p className="text-xs mb-3">Setiap perhitungan yang disimpan akan diberi identitas sumber yang jelas di tabel Data Penawaran maupun SPH:</p>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 text-[10px] font-black flex-shrink-0">
                  H
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kalkulator Harga</span>
                  <span className="text-[10px] text-slate-500">Perhitungan otomatis menggunakan margin dan modal bawaan sistem.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-black flex-shrink-0">
                  M
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kalkulasi Manual</span>
                  <span className="text-[10px] text-slate-500">Nilai custom / diinput langsung secara manual oleh sales.</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Aturan Finansial */}
        <Card hoverEffect className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Pajak (PPN) & Ekstra</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Komponen Biaya</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <ul className="space-y-3 mt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-700 dark:text-slate-300 text-xs block mb-0.5">Pajak Pertambahan Nilai (PPN)</strong>
                  <span className="text-xs">Jika fitur PPN diaktifkan, sistem akan otomatis menerapkan tarif pajak sebesar <strong className="text-emerald-600 dark:text-emerald-400">11%</strong> dari nilai Subtotal gross.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-700 dark:text-slate-300 text-xs block mb-0.5">Ongkos Kirim & Diskon</strong>
                  <span className="text-xs">Nilai ongkos kirim dan diskon nominal bersifat situasional. Kolom ini dapat dinonaktifkan / disembunyikan (hide) dari cetakan dokumen SPH apabila tidak diperlukan.</span>
                </div>
              </li>
            </ul>
          </div>
        </Card>

        {/* Skala Kuantiti & Interpolasi */}
        <Card hoverEffect className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Skala Kuantiti & Penyesuaian</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Interpolasi Harga</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <p>
              Apabila kuantiti (Qty) pesanan berada <strong>di antara dua tier matriks standar</strong> (misal: Qty 40 pcs berada di antara tier 24 dan 50), sistem <strong className="text-brand-600 dark:text-brand-400">tidak akan otomatis membulatkan</strong> harga ke tier terbawah/teratas.
            </p>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 rounded-lg flex items-start gap-2.5 mt-2">
              <Info className="w-4 h-4 text-purple-600 dark:text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-800 dark:text-purple-400">
                Sistem akan menghitung <strong>Penyesuaian (Interpolasi) Margin</strong> secara presisi agar harganya menjadi lebih adil dan mendekati tier di atasnya sesuai proporsi jumlah pesanan (misal: disesuaikan mendekati ke 50 pcs).
              </p>
            </div>
          </div>
        </Card>

        {/* Dashboard & Analitik */}
        <Card hoverEffect className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <BarChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Analitik & KPI Omset</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Metrik Dashboard</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-lg flex items-start gap-2.5 mb-3">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-400">
                Hanya SPH yang berhasil mencetak persetujuan atau pembayaran penuh yang masuk ke rekap performa perusahaan.
              </p>
            </div>
            <ul className="space-y-1.5 mt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs">Dashboard <strong>Total Omset Aktif</strong> hanya akan menghitung nominal dari SPH yang memiliki status <strong className="text-brand-600 dark:text-brand-400">Deal</strong> atau <strong className="text-brand-600 dark:text-brand-400">Disetujui</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs">SPH dengan status <em>Draft, Dikirim, atau Negosiasi</em> dianggap sebagai pipeline yang belum terealisasi nilainya (tidak masuk omset).</span>
              </li>
            </ul>
          </div>
        </Card>

      </div>
    </div>
  );
};

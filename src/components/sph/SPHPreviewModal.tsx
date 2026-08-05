import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useMasterData } from '../../hooks/useMasterData';
import { useSPH } from '../../hooks/useSPH';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { Printer, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { SPHItemDetail } from '../../types/pricing.types';

export interface SPHPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultData?: {
    produk?: string;
    qty?: number;
    hargaJualUnit?: number;
    totalHargaJual?: number;
    sales?: string;
    diskon?: number;
    namaPt?: string;
    brand?: string;
    items?: SPHItemDetail[];
  };
}

export const SPHPreviewModal: React.FC<SPHPreviewModalProps> = ({
  isOpen,
  onClose,
  defaultData,
}) => {
  const { brands, users, keterangan } = useMasterData();
  const { createSPH, isCreating, getNextSPHNumber } = useSPH({ page: 1, limit: 1 });
  const { success, error } = useToast();

  const [selectedBrandName, setSelectedBrandName] = useState(
    defaultData?.brand || brands[0]?.nama_brand || 'Amanah Apparel Indonesia'
  );
  const [namaPt, setNamaPt] = useState(defaultData?.namaPt || 'PT Solusi Mitra Nusantara');
  const [deskripsi, setDeskripsi] = useState(
    defaultData?.items && defaultData.items.length > 1
      ? `Paket Pengadaan Multi-Item (${defaultData.items.length} macam produk)`
      : 'Pengadaan Merchandise & Apparel Promosi Resmi'
  );
  const [globalDiskon, setGlobalDiskon] = useState<number>(
    defaultData?.items?.reduce((acc, it) => acc + (it.diskon || 0), 0) || 0
  );
  const [salesName, setSalesName] = useState(defaultData?.sales || users[0]?.nama || 'Ahmad Pratama');
  const [keteranganTambahan, setKeteranganTambahan] = useState(keterangan[0]?.isi_keterangan || '');

  const activeBrand = brands.find(b => b.nama_brand === selectedBrandName) || brands[0];

  const now = new Date();
  const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const brandCode = activeBrand?.singkatan || 'AAI';

  const [noSPH, setNoSPH] = useState('');

  const processedKeterangan = (keteranganTambahan || 'Pembayaran DP 50% saat PO terbit, pelunasan sebelum pengiriman.').replace(/sayangi diskon.*/gi, '').trim();

  useEffect(() => {
    if (isOpen) {
      getNextSPHNumber(brandCode).then(setNoSPH).catch(console.error);
    }
  }, [isOpen, brandCode]);

  // Multi-item or single item normalization
  const lineItems: SPHItemDetail[] = defaultData?.items && defaultData.items.length > 0
    ? defaultData.items
    : [
        {
          produk: defaultData?.produk || 'Custom Order Garment',
          qty: defaultData?.qty || 100,
          hargaJualUnit: defaultData?.totalHargaJual !== undefined
            ? Math.round(((defaultData.totalHargaJual) + (defaultData.diskon || 0)) / (defaultData.qty || 1))
            : defaultData?.hargaJualUnit || 85000,
          totalHargaJual: defaultData?.totalHargaJual !== undefined
            ? (defaultData.totalHargaJual + (defaultData.diskon || 0))
            : (defaultData?.hargaJualUnit || 85000) * (defaultData?.qty || 100),
          diskon: defaultData?.diskon || 0,
        }
      ];

  const totalQtyPcs = lineItems.reduce((acc, it) => acc + it.qty, 0);
  const subtotalGross = lineItems.reduce((acc, it) => acc + (it.hargaJualUnit * it.qty), 0);
  const grandTotal = Math.max(0, subtotalGross - globalDiskon);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = (noSPH || 'SPH-Draft').replace(/\//g, '-');
    window.print();
    document.title = originalTitle;
  };

  const handleSaveToDatabase = async () => {
    try {
      const summaryProduk = lineItems.map(it => `${it.produk} (${it.qty} pcs)`).join(', ');

      await createSPH({
        tanggal: dateFormatted,
        brand: selectedBrandName,
        no_sph: noSPH,
        nama_pt: namaPt,
        deskripsi: deskripsi,
        produk: summaryProduk,
        qty: totalQtyPcs,
        harga_jual: Math.round(grandTotal / (totalQtyPcs || 1)),
        ref_id: `REF-${Date.now()}`,
        sales: salesName,
        status_sph: 'Draft',
        keterangan: keteranganTambahan,
        diskon: globalDiskon, // save the nominal total discount
        harga_jual_akhir: grandTotal,
        items: lineItems,
      });

      success('SPH Tersimpan', `Surat Penawaran ${noSPH} (${lineItems.length} item) berhasil disimpan ke Supabase.`);
      onClose();
    } catch (err: any) {
      error('Gagal Menyimpan SPH', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generator & Preview Surat Penawaran Harga (SPH)"
      subtitle="Dokumen resmi penawaran harga multi-item siap cetak atau ekspor ke PDF."
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak / Export PDF
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isCreating}
              onClick={handleSaveToDatabase}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Simpan SPH
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
          <Select
            label="Kop Brand Perusahaan"
            options={brands.map(b => ({ label: b.nama_brand, value: b.nama_brand }))}
            value={selectedBrandName}
            onChange={(e) => setSelectedBrandName(e.target.value)}
          />
          <Input
            label="Nama Klien / Perusahaan"
            value={namaPt}
            onChange={(e) => setNamaPt(e.target.value)}
          />
          <Select
            label="Sales In-Charge"
            options={users.map(u => ({ label: u.nama, value: u.nama }))}
            value={salesName}
            onChange={(e) => setSalesName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs mt-[-1rem]">
          <Input
            label="Diskon Global SPH (Rp)"
            type="number"
            min={0}
            max={subtotalGross}
            value={globalDiskon || ''}
            onChange={(e) => setGlobalDiskon(parseInt(e.target.value) || 0)}
          />
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deskripsi Tambahan (Tampil di SPH)
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="HARUS DI ISI"
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-rose-500 placeholder:font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-150 resize-none"
            />
          </div>
        </div>

        {/* Printable Formal Document Preview */}
        <div className="printable-doc bg-white text-slate-900 p-8 sm:p-10 rounded-xl border border-slate-300 shadow-lg font-sans text-xs">
          {/* Header Brand */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                {activeBrand?.nama_brand || 'AMANAH APPAREL INDONESIA'}
              </h2>
              <p className="text-slate-600 mt-0.5">{activeBrand?.alamat || 'Jl. Industri Kreatif No. 88, Bandung'}</p>
              <p className="text-slate-600">
                Telp: {activeBrand?.no_telp_kantor || '022-7201928'} | WA: {activeBrand?.no_telp_wa || '081234567890'} | Email: {activeBrand?.email || 'sales@company.com'}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded">
                SURAT PENAWARAN HARGA
              </span>
              <p className="text-slate-600 mt-2 font-mono font-semibold">{noSPH}</p>
              <p className="text-slate-500">{dateFormatted}</p>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <p className="text-slate-500 font-semibold uppercase text-[10px]">Kepada Yth:</p>
            <p className="text-sm font-bold text-slate-900">{namaPt}</p>
            <p className="text-slate-600">Up. Bagian Pengadaan / Procurement</p>
          </div>

          <div className="mb-6 text-sm text-slate-800 leading-relaxed">
            <p>Dengan hormat,</p>
            <p className="mt-2">
              Pada kesempatan kali ini, kami {activeBrand?.nama_brand || 'PT MAHADA GROUP INTERNASIONAL'} bermaksud memberikan penawaran harga. Berikut spesifikasi tawaran yang dimaksud :
            </p>
          </div>

          {/* Multi-Item Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 uppercase text-[10px]">
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Deskripsi & Spesifikasi Produk</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">Qty</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right w-28">Harga Satuan</th>
                  <th className="py-2.5 px-3 text-right w-32">Total Harga</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="py-3 px-3 text-center font-mono border-r border-slate-300">{idx + 1}</td>
                    <td className="py-3 px-3 border-r border-slate-300">
                      <p className="font-bold text-slate-900">{item.produk}</p>
                      {item.kode && <p className="text-slate-600 text-[11px] font-mono">Model / Kode: {item.kode}</p>}
                      {item.proses_logo && <p className="text-slate-500 text-[11px]">Proses Logo: {item.proses_logo}</p>}
                    </td>
                    <td className="py-3 px-3 text-center font-mono border-r border-slate-300">{formatNumber(item.qty)} pcs</td>
                    <td className="py-3 px-3 text-right font-mono border-r border-slate-300">{formatRupiah(item.hargaJualUnit)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{formatRupiah(item.hargaJualUnit * item.qty)}</td>
                  </tr>
                ))}

                <tr className="bg-slate-100 font-bold">
                  <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-300 text-xs">
                    Subtotal:
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-sm whitespace-nowrap">
                    {formatRupiah(subtotalGross)}
                  </td>
                </tr>
                {globalDiskon > 0 && (
                  <tr className="bg-rose-50/50 font-bold text-rose-600">
                    <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-300 text-xs">
                      Diskon:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm whitespace-nowrap">
                      - {formatRupiah(globalDiskon)}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-200 font-bold">
                  <td colSpan={4} className="py-3 px-3 text-right border-r border-slate-300 text-xs uppercase">
                    Grand Total Penawaran Akhir:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-indigo-700 whitespace-nowrap">
                    {formatRupiah(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {deskripsi && (
            <div className="mb-6 text-sm text-slate-800 leading-relaxed border-l-4 border-slate-400 pl-4 py-2 bg-slate-50">
              <p className="font-semibold text-slate-900 mb-1">Catatan Tambahan / Deskripsi Project:</p>
              <p className="whitespace-pre-wrap">{deskripsi}</p>
            </div>
          )}

          <div className="mt-4 mb-6 text-sm text-slate-800 leading-relaxed">
            <p>Demikian surat penawaran yang dapat kami sampaikan saat ini dan semoga harga dan modelnya cocok. Atas perhatiannya kami ucapkan terima kasih.</p>
          </div>

          {/* Terms & Payment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-300">
            <div>
              <p className="font-bold text-slate-900 mb-1 uppercase text-[10px]">Syarat & Ketentuan Pembayaran:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                {processedKeterangan && <li>{processedKeterangan}</li>}
                <li>Waktu pengerjaan terhitung setelah approval sampel mockup digital.</li>
                <li>Harga penawaran ini berlaku selama 14 hari kalender sejak tanggal diterbitkan.</li>
              </ul>

              <div className="mt-3 p-3 bg-slate-100 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 text-[10px] uppercase">Rekening Pembayaran Resmi:</p>
                <p className="text-slate-800 font-semibold">{activeBrand?.bank || 'BCA'} : <span className="font-mono font-bold">{activeBrand?.no_rekening || '1390888999'}</span></p>
                <p className="text-slate-600 text-[10px]">A.N: {activeBrand?.atas_nama || 'PT AMANAH APPAREL INDONESIA'}</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="flex flex-col items-center justify-end text-center pt-8">
              <p className="text-slate-600">Hormat Kami,</p>
              <p className="font-bold text-slate-900">{activeBrand?.nama_brand}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">[Tanda Tangan & Stempel Resmi]</span>
              </div>
              <p className="font-bold underline text-slate-900">{salesName}</p>
              <p className="text-[10px] text-slate-500">Divisi Penjualan & Kemitraan</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

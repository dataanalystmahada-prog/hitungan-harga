import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useMasterData } from '../../hooks/useMasterData';
import { useSPH } from '../../hooks/useSPH';
import { CalculationService } from '../../services/calculationService';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { Printer, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { SPHItemDetail } from '../../types/pricing.types';

export interface SPHPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultData?: {
    no_sph?: string;
    tanggal?: string;
    produk?: string;
    kode?: string;
    proses_logo?: string;
    deskripsi?: string;
    keterangan?: string;
    qty?: number;
    hargaJualUnit?: number;
    totalHargaJual?: number;
    sales?: string;
    diskon?: number;
    namaPt?: string;
    brand?: string;
    items?: SPHItemDetail[];
    sourceCalculationIds?: string[];
  };
  sourceCalculationIds?: string[];
  onSavePerhitunganBeforePrint?: (deskripsi: string, diskon: number, namaPt?: string) => Promise<void> | void;
  onSaveSuccess?: () => void;
}

export const SPHPreviewModal: React.FC<SPHPreviewModalProps> = ({
  isOpen,
  onClose,
  defaultData,
  sourceCalculationIds,
  onSavePerhitunganBeforePrint,
  onSaveSuccess,
}) => {
  const { user, role } = useAuth();
  const { brands, users, keterangan } = useMasterData();
  const { createSPH, isCreating, getNextSPHNumber } = useSPH({ page: 1, limit: 1 });
  const { success, error } = useToast();

  const [selectedBrandName, setSelectedBrandName] = useState(
    defaultData?.brand || brands[0]?.nama_brand || 'Amanah Apparel Indonesia'
  );
  const [namaPt, setNamaPt] = useState(defaultData?.namaPt || '');
  const [deskripsi, setDeskripsi] = useState(defaultData?.deskripsi || '');
  const [globalDiskon, setGlobalDiskon] = useState<number>(
    defaultData?.diskon !== undefined
      ? defaultData.diskon
      : (defaultData?.items?.reduce((acc, it) => acc + (it.diskon || 0), 0) || 0)
  );
  const [salesName, setSalesName] = useState(
    defaultData?.sales || (role === 'sales' && user?.nama ? user.nama : users[0]?.nama || 'Sales Admin')
  );
  const [keteranganTambahan, setKeteranganTambahan] = useState(
    defaultData?.keterangan || keterangan[0]?.isi_keterangan || ''
  );

  useEffect(() => {
    if (user?.nama && role === 'sales') {
      setSalesName(user.nama);
    }
  }, [user, role]);

  useEffect(() => {
    if (isOpen && defaultData) {
      if (defaultData.namaPt !== undefined) {
        setNamaPt(defaultData.namaPt);
      }
      if (defaultData.brand) {
        setSelectedBrandName(defaultData.brand);
      }
      if (defaultData.deskripsi !== undefined) {
        setDeskripsi(defaultData.deskripsi);
      }
      if (defaultData.diskon !== undefined) {
        setGlobalDiskon(defaultData.diskon);
      }
      if (defaultData.sales) {
        setSalesName(defaultData.sales);
      }
    }
  }, [isOpen, defaultData]);

  const activeBrand = brands.find(b => b.nama_brand === selectedBrandName) || brands[0];

  const now = new Date();
  const dateFormatted = defaultData?.tanggal || `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const brandCode = activeBrand?.singkatan || 'AAI';

  const [noSPH, setNoSPH] = useState(defaultData?.no_sph || '');

  const processedKeterangan = (keteranganTambahan || 'Pembayaran DP 50% saat PO terbit, pelunasan sebelum pengiriman.').replace(/sayangi diskon.*/gi, '').trim();

  useEffect(() => {
    if (isOpen) {
      if (defaultData?.no_sph) {
        setNoSPH(defaultData.no_sph);
      } else {
        getNextSPHNumber(brandCode).then(setNoSPH).catch(console.error);
      }
    }
  }, [isOpen, brandCode, defaultData?.no_sph]);

  // Multi-item or single item normalization
  const lineItems: SPHItemDetail[] = defaultData?.items && defaultData.items.length > 0
    ? defaultData.items.map(it => {
        const unit = it.hargaJualUnit !== undefined && it.hargaJualUnit > 0
          ? it.hargaJualUnit
          : (it.totalHargaJual && it.qty ? Math.round(it.totalHargaJual / it.qty) : 85000);
        return {
          produk: it.produk || 'Payung_Ready',
          kode: it.kode,
          deskripsi: it.deskripsi,
          proses_logo: it.proses_logo,
          qty: it.qty || 1,
          hargaJualUnit: unit,
          totalHargaJual: unit * (it.qty || 1),
          diskon: it.diskon || 0,
        };
      })
    : [
        {
          produk: defaultData?.produk || 'Payung_Ready',
          kode: defaultData?.kode,
          deskripsi: defaultData?.deskripsi,
          proses_logo: defaultData?.proses_logo,
          qty: defaultData?.qty || 100,
          hargaJualUnit: defaultData?.hargaJualUnit !== undefined
            ? defaultData.hargaJualUnit
            : (defaultData?.totalHargaJual !== undefined
                ? Math.round(defaultData.totalHargaJual / (defaultData.qty || 1))
                : 85000),
          totalHargaJual: (defaultData?.hargaJualUnit !== undefined
            ? defaultData.hargaJualUnit
            : (defaultData?.totalHargaJual !== undefined
                ? Math.round(defaultData.totalHargaJual / (defaultData.qty || 1))
                : 85000)) * (defaultData?.qty || 100),
          diskon: defaultData?.diskon || 0,
        }
      ];

  const totalQtyPcs = lineItems.reduce((acc, it) => acc + it.qty, 0);
  const subtotalGross = lineItems.reduce((acc, it) => acc + (it.hargaJualUnit * it.qty), 0);
  const grandTotal = Math.max(0, subtotalGross - (globalDiskon || 0));

  const handlePrint = async () => {
    if (onSavePerhitunganBeforePrint) {
      try {
        await onSavePerhitunganBeforePrint(deskripsi, globalDiskon, (namaPt || '').trim());
      } catch (err) {
        console.error('Auto-save calculation on print error:', err);
      }
    }
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
        nama_pt: (namaPt || '').trim(),
        deskripsi: deskripsi,
        produk: summaryProduk,
        qty: totalQtyPcs,
        harga_jual: Math.round(subtotalGross / (totalQtyPcs || 1)),
        ref_id: `REF-${Date.now()}`,
        sales: salesName,
        status_sph: 'Draft',
        keterangan: keteranganTambahan,
        diskon: globalDiskon, // save the nominal total discount
        harga_jual_akhir: grandTotal,
        items: lineItems,
      });

      // Hapus data perhitungan dari tabel Supabase jika SPH dibuat dari Data Perhitungan
      const targetIds = sourceCalculationIds || defaultData?.sourceCalculationIds;
      if (targetIds && targetIds.length > 0) {
        try {
          await CalculationService.deleteBatchCalculations(targetIds);
        } catch (delErr) {
          console.warn('Gagal menghapus data perhitungan setelah simpan SPH:', delErr);
        }
      }

      success(
        'SPH Tersimpan',
        `Surat Penawaran ${noSPH} (${lineItems.length} item) berhasil disimpan ke SPH.${
          targetIds && targetIds.length > 0 ? ' Data perhitungan terkait telah dipindahkan ke SPH.' : ''
        }`
      );

      if (onSaveSuccess) {
        onSaveSuccess();
      }

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
            leftIcon={<Printer className="w-3.5 h-3.5" />}
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
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan SPH
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 print:gap-0 print:block">
        {/* Form Controls (Hidden in Print) */}
        <div className="print:hidden flex flex-col gap-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
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
              options={users.map(u => ({ label: u.nama === user?.nama ? `${u.nama} (Akun Anda)` : u.nama, value: u.nama }))}
              value={salesName}
              onChange={(e) => setSalesName(e.target.value)}
              disabled={role === 'sales'}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
            <Input
              label="Diskon Global SPH (Rp)"
              type="number"
              min={0}
              max={subtotalGross}
              value={globalDiskon || ''}
              onChange={(e) => setGlobalDiskon(parseInt(e.target.value) || 0)}
            />
            <div className="w-full flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Deskripsi / Nama Project (khusus SPH)
              </label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Harus di ISI"
                rows={2}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-rose-500 placeholder:font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all duration-150 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Printable Formal Document Preview */}
        <div className="printable-doc bg-white text-slate-900 p-8 sm:p-10 rounded-xl border border-slate-300 shadow-lg font-sans text-xs print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none">
          {/* Header Brand */}
          <div className="sph-header flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-5 print:mb-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                {activeBrand?.nama_brand || 'HELLOSWAG'}
              </h2>
              <p className="text-slate-600 mt-0.5 text-xs max-w-md">
                {activeBrand?.alamat || 'Jl. Kiara Sari I No.2, Sekejati, Kec. Buahbatu, Kota Bandung, Jawa Barat 40289'}
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                Telp: {activeBrand?.no_telp_kantor || '(022) 3209 3670'} | WA: {activeBrand?.no_telp_wa || '628112079792'} | Email: {activeBrand?.email || 'joy@helloswag.id'}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded uppercase tracking-wide">
                SURAT PENAWARAN HARGA
              </span>
              <p className="text-slate-700 mt-2 font-mono font-semibold text-xs">
                {noSPH || 'SPH 0002/MH/VIII/2026'}
              </p>
              <p className="text-slate-500 text-xs">{dateFormatted}</p>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-5 print:mb-4">
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Kepada Yth:</p>
            <p className="text-sm font-bold text-slate-900">{namaPt || 'Klien / Perusahaan Rekanan'}</p>
            <p className="text-slate-600 text-xs mt-0.5">Up. Bagian Pengadaan / Procurement</p>
          </div>

          <div className="mb-4 text-xs text-slate-800 leading-relaxed">
            <p>Dengan hormat,</p>
            <p className="mt-1.5">
              Pada kesempatan kali ini, kami <strong className="font-bold text-slate-900 uppercase">{activeBrand?.nama_brand || 'HELLOSWAG'}</strong> bermaksud memberikan penawaran harga{deskripsi ? ` untuk ${deskripsi}` : ''}. Berikut spesifikasi tawaran yang dimaksud :
            </p>
          </div>

          {/* Multi-Item Table */}
          <div className="mb-5 print:mb-4 overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 uppercase text-[10px]">
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-[6%]">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-[44%]">Deskripsi & Spesifikasi Produk</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-[14%]">Qty</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right w-[18%]">Harga Satuan</th>
                  <th className="py-2.5 px-3 text-right w-[18%]">Total Harga</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-300 break-inside-avoid">
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-300 align-top">{idx + 1}</td>
                    <td className="py-2.5 px-3 border-r border-slate-300 align-top">
                      <p className="font-bold text-slate-900">{item.produk}</p>
                      {item.kode && <p className="text-slate-600 text-[11px] font-mono mt-0.5">Model / Kode: {item.kode}</p>}
                      {item.proses_logo && <p className="text-slate-500 text-[11px] mt-0.5">Proses Logo: {item.proses_logo}</p>}
                      {!item.proses_logo && item.deskripsi && <p className="text-slate-500 text-[11px] mt-0.5">{item.deskripsi}</p>}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-300 align-top whitespace-nowrap">{formatNumber(item.qty)} pcs</td>
                    <td className="py-2.5 px-3 text-right font-mono border-r border-slate-300 align-top whitespace-nowrap">{formatRupiah(item.hargaJualUnit)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 align-top whitespace-nowrap">{formatRupiah(item.hargaJualUnit * item.qty)}</td>
                  </tr>
                ))}

                {/* Subtotal Row */}
                <tr className="border-t border-b border-slate-300 break-inside-avoid">
                  <td colSpan={3} className="border-r border-slate-300 bg-white"></td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 border-r border-slate-300 text-xs">
                    Subtotal:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                    {formatRupiah(subtotalGross)}
                  </td>
                </tr>

                {/* Diskon Row - Always included as requested */}
                <tr className="border-b border-slate-300 break-inside-avoid">
                  <td colSpan={3} className="border-r border-slate-300 bg-white"></td>
                  <td className="py-2 px-3 text-right font-bold text-rose-600 border-r border-slate-300 text-xs">
                    Diskon:
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-rose-600 text-xs sm:text-sm whitespace-nowrap">
                    {globalDiskon > 0 ? `- ${formatRupiah(globalDiskon)}` : 'Rp 0'}
                  </td>
                </tr>

                {/* Grand Total Row */}
                <tr className="bg-slate-100 border-b border-slate-300 font-bold break-inside-avoid">
                  <td colSpan={4} className="py-2.5 px-3 text-right border-r border-slate-300 text-xs uppercase font-extrabold text-slate-900 tracking-wider">
                    GRAND TOTAL PENAWARAN AKHIR:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm font-extrabold text-indigo-700 whitespace-nowrap">
                    {formatRupiah(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {deskripsi && (
            <div className="sph-keep-together mb-4 text-xs text-slate-800 leading-relaxed border-l-4 border-slate-700 pl-4 py-2.5 bg-slate-50 rounded-r">
              <p className="font-bold text-slate-900 mb-1 text-xs">Catatan Tambahan / Deskripsi Project:</p>
              <p className="text-slate-700 whitespace-pre-wrap">{deskripsi}</p>
            </div>
          )}

          <div className="sph-keep-together mt-3 mb-5 text-xs text-slate-800 leading-relaxed">
            <p>Demikian surat penawaran yang dapat kami sampaikan saat ini dan semoga harga dan modelnya cocok. Atas perhatiannya kami ucapkan terima kasih.</p>
          </div>

          {/* Terms & Payment Information */}
          <div className="sph-signature-section grid grid-cols-2 gap-6 pt-4 border-t border-slate-300">
            <div>
              <p className="font-bold text-slate-900 mb-1.5 uppercase text-[10px] tracking-wider">Syarat & Ketentuan Pembayaran:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                {processedKeterangan && <li>{processedKeterangan}</li>}
                <li>Waktu pengerjaan terhitung setelah approval sampel mockup digital.</li>
                <li>Harga penawaran ini berlaku selama 14 hari kalender sejak tanggal diterbitkan.</li>
              </ul>

              <div className="mt-3.5 p-3 bg-slate-100/90 rounded-xl border border-slate-200 print:bg-slate-50">
                <p className="font-bold text-slate-900 text-[10px] uppercase tracking-wider mb-1">Rekening Pembayaran Resmi:</p>
                <p className="text-slate-900 font-bold text-xs">
                  {activeBrand?.bank || 'BCA Syariah'} : <span className="font-mono font-bold">{activeBrand?.no_rekening || '590043923'}</span>
                </p>
                <p className="text-slate-500 text-[10px] mt-0.5">A.N: {activeBrand?.atas_nama || 'Elis Maidah'}</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="flex flex-col items-center justify-end text-center pt-2">
              <p className="text-slate-600 text-xs">Hormat Kami,</p>
              <p className="font-bold text-slate-900 text-xs uppercase">{activeBrand?.nama_brand || 'HELLOSWAG'}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">[Tanda Tangan & Stempel Resmi]</span>
              </div>
              <p className="font-bold underline text-slate-900 text-xs">{salesName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Divisi Penjualan & Kemitraan</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

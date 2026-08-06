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
import { calculateMaxDiskon } from '../../utils/discountEngine';

export interface SPHPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultData?: {
    id?: string;
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
    ongkir?: number;
    ppn?: number;
    is_ppn?: boolean;
    show_diskon?: boolean;
    show_ppn?: boolean;
    show_ongkir?: boolean;
    show_keterangan?: boolean;
    namaPt?: string;
    brand?: string;
    items?: SPHItemDetail[];
    sourceCalculationIds?: string[];
  };
  sourceCalculationIds?: string[];
  onSavePerhitunganBeforePrint?: (
    deskripsi: string, 
    diskon: number, 
    namaPt?: string,
    ongkir?: number,
    isPpn?: boolean,
    ppnNominal?: number,
    showDiskon?: boolean,
    showPpn?: boolean,
    showOngkir?: boolean,
    grandTotal?: number,
    keterangan?: string,
    showKeterangan?: boolean
  ) => Promise<void> | void;
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
  const { createSPH, updateSPH, isCreating, isUpdatingSPH, getNextSPHNumber } = useSPH({ page: 1, limit: 1 });
  const { success, error } = useToast();
  const isEditMode = Boolean(defaultData?.id);

  const [selectedBrandName, setSelectedBrandName] = useState(
    defaultData?.brand || brands[0]?.nama_brand || 'HELLOSWAG'
  );
  const [namaPt, setNamaPt] = useState(defaultData?.namaPt || '');
  const [deskripsi, setDeskripsi] = useState(defaultData?.deskripsi || '');
  const [keteranganManual, setKeteranganManual] = useState(
    defaultData?.keterangan !== undefined ? defaultData.keterangan : ''
  );
  const [showKeterangan, setShowKeterangan] = useState<boolean>(
    defaultData?.show_keterangan !== undefined ? defaultData.show_keterangan : true
  );
  const [globalDiskon, setGlobalDiskon] = useState<number>(
    defaultData?.diskon !== undefined
      ? defaultData.diskon
      : (defaultData?.items?.reduce((acc, it) => acc + (it.diskon || 0), 0) || 0)
  );
  const [ongkir, setOngkir] = useState<number>(defaultData?.ongkir || 0);
  const [isPpn, setIsPpn] = useState<boolean>(
    defaultData?.is_ppn !== undefined 
      ? defaultData.is_ppn 
      : ((defaultData?.ppn !== undefined && defaultData.ppn > 0) || false)
  );
  const [showDiskon, setShowDiskon] = useState<boolean>(
    defaultData?.show_diskon !== undefined ? defaultData.show_diskon : true
  );
  const [showOngkir, setShowOngkir] = useState<boolean>(
    defaultData?.show_ongkir !== undefined ? defaultData.show_ongkir : true
  );
  const [showPpn, setShowPpn] = useState<boolean>(
    defaultData?.show_ppn !== undefined ? defaultData.show_ppn : true
  );

  const [salesName, setSalesName] = useState(
    defaultData?.sales || (role === 'sales' && user?.nama ? user.nama : users[0]?.nama || 'Sales Admin')
  );

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
      if (defaultData.keterangan !== undefined) {
        setKeteranganManual(defaultData.keterangan);
      }
      if (defaultData.show_keterangan !== undefined) {
        setShowKeterangan(defaultData.show_keterangan);
      }
      if (defaultData.diskon !== undefined) {
        setGlobalDiskon(defaultData.diskon);
      }
      if (defaultData.ongkir !== undefined) {
        setOngkir(defaultData.ongkir);
      }
      if (defaultData.is_ppn !== undefined) {
        setIsPpn(defaultData.is_ppn);
      } else if (defaultData.ppn !== undefined) {
        setIsPpn(defaultData.ppn > 0);
      }
      if (defaultData.show_diskon !== undefined) {
        setShowDiskon(defaultData.show_diskon);
      }
      if (defaultData.show_ongkir !== undefined) {
        setShowOngkir(defaultData.show_ongkir);
      }
      if (defaultData.show_ppn !== undefined) {
        setShowPpn(defaultData.show_ppn);
      }
      if (defaultData.sales) {
        setSalesName(defaultData.sales);
      } else if (user?.nama && role === 'sales') {
        setSalesName(user.nama);
      }
    }
  }, [isOpen, defaultData, user, role]);

  const activeBrand = brands.find(b => b.nama_brand === selectedBrandName) || brands[0];

  const now = new Date();
  const dateFormatted = defaultData?.tanggal || `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const brandCode = activeBrand?.singkatan || 'MH';

  const [noSPH, setNoSPH] = useState(defaultData?.no_sph || '');

  useEffect(() => {
    if (isOpen) {
      if (defaultData?.no_sph) {
        setNoSPH(defaultData.no_sph);
      } else {
        getNextSPHNumber(brandCode).then(setNoSPH).catch(console.error);
      }
    }
  }, [isOpen, brandCode, defaultData?.no_sph]);

  const lineItems: SPHItemDetail[] = defaultData?.items && defaultData.items.length > 0
    ? defaultData.items.map(it => {
        const unit = it.hargaJualUnit !== undefined && it.hargaJualUnit > 0
          ? it.hargaJualUnit
          : (it.totalHargaJual && it.qty ? Math.round(it.totalHargaJual / it.qty) : 0);
        return {
          produk: it.produk || 'Produk',
          kode: it.kode || '',
          deskripsi: it.deskripsi || '',
          proses_logo: it.proses_logo || '',
          qty: it.qty || 1,
          hargaJualUnit: unit,
          totalHargaJual: unit * (it.qty || 1),
          diskon: it.diskon || 0,
        };
      })
    : [
        {
          produk: defaultData?.produk || 'Produk',
          kode: defaultData?.kode || '',
          deskripsi: defaultData?.deskripsi || '',
          proses_logo: defaultData?.proses_logo || '',
          qty: defaultData?.qty || 1,
          hargaJualUnit: defaultData?.hargaJualUnit !== undefined
            ? defaultData.hargaJualUnit
            : (defaultData?.totalHargaJual !== undefined
                ? Math.round(defaultData.totalHargaJual / (defaultData.qty || 1))
                : 0),
          totalHargaJual: (defaultData?.hargaJualUnit !== undefined
            ? defaultData.hargaJualUnit
            : (defaultData?.totalHargaJual !== undefined
                ? Math.round(defaultData.totalHargaJual / (defaultData.qty || 1))
                : 0)) * (defaultData?.qty || 1),
          diskon: defaultData?.diskon || 0,
        }
      ];

  const totalQtyPcs = lineItems.reduce((acc, it) => acc + it.qty, 0);
  const subtotalGross = lineItems.reduce((acc, it) => acc + (it.hargaJualUnit * it.qty), 0);
  
  const diskonNominal = Math.max(0, globalDiskon || 0);
  const subtotalAfterDiskon = Math.max(0, subtotalGross - diskonNominal);
  const ppnNominal = isPpn ? Math.round(subtotalAfterDiskon * 0.11) : 0;
  const ongkirNominal = Math.max(0, ongkir || 0);
  const grandTotal = subtotalAfterDiskon + ppnNominal + ongkirNominal;

  const maxDiskonInfo = calculateMaxDiskon(subtotalAfterDiskon, totalQtyPcs);

  const pesanDiskonObj = keterangan.find(
    k => k.id === 'PESAN_DISKON' || (k.isi_keterangan && k.isi_keterangan.toLowerCase().includes('sayangi diskon'))
  );
  const pesanDiskon = pesanDiskonObj?.isi_keterangan || 'Sayangi diskonnya seperti menyayangi gaji di tanggal 25. Jangan habis di awal bulan. 🤣';

  // Split manual terms into clean lines
  const manualTermsLines = (keteranganManual || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^(\d+[\.\)]|\-|\*)\s*/, ''));

  const handlePrint = async () => {
    const summaryProduk = lineItems.map(it => `${it.produk} (${it.qty} pcs)`).join(', ');
    const payload = {
      tanggal: dateFormatted,
      brand: selectedBrandName,
      no_sph: noSPH,
      nama_pt: (namaPt || '').trim(),
      deskripsi: deskripsi,
      produk: summaryProduk,
      qty: totalQtyPcs,
      harga_jual: Math.round(subtotalGross / (totalQtyPcs || 1)),
      sales: salesName,
      status_sph: 'Draft',
      keterangan: keteranganManual,
      diskon: diskonNominal,
      ongkir: ongkirNominal,
      is_ppn: isPpn,
      ppn: ppnNominal,
      show_diskon: showDiskon,
      show_ppn: showPpn,
      show_ongkir: showOngkir,
      show_keterangan: showKeterangan,
      harga_jual_akhir: grandTotal,
      items: lineItems,
    };

    if (isEditMode && defaultData?.id) {
      try {
        await updateSPH({ id: defaultData.id, input: payload });
        if (onSaveSuccess) onSaveSuccess();
      } catch (err) {
        console.error('Auto-update SPH on print error:', err);
      }
    } else if (onSavePerhitunganBeforePrint) {
      try {
        await onSavePerhitunganBeforePrint(
          deskripsi, 
          diskonNominal, 
          (namaPt || '').trim(),
          ongkirNominal,
          isPpn,
          ppnNominal,
          showDiskon,
          showPpn,
          showOngkir,
          grandTotal,
          keteranganManual,
          showKeterangan
        );
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

      const payload = {
        tanggal: dateFormatted,
        brand: selectedBrandName,
        no_sph: noSPH,
        nama_pt: (namaPt || '').trim(),
        deskripsi: deskripsi,
        produk: summaryProduk,
        qty: totalQtyPcs,
        harga_jual: Math.round(subtotalGross / (totalQtyPcs || 1)),
        sales: salesName,
        status_sph: 'Draft',
        keterangan: keteranganManual,
        diskon: diskonNominal,
        ongkir: ongkirNominal,
        is_ppn: isPpn,
        ppn: ppnNominal,
        show_diskon: showDiskon,
        show_ppn: showPpn,
        show_ongkir: showOngkir,
        show_keterangan: showKeterangan,
        harga_jual_akhir: grandTotal,
        items: lineItems,
      };

      if (isEditMode && defaultData?.id) {
        await updateSPH({ id: defaultData.id, input: payload });
        success('SPH Diperbarui', `Dokumen penawaran ${noSPH} berhasil diperbarui.`);
      } else {
        await createSPH({
          ...payload,
          ref_id: `REF-${Date.now()}`,
        });

        const targetIds = sourceCalculationIds || defaultData?.sourceCalculationIds;
        if (targetIds && targetIds.length > 0) {
          try {
            await CalculationService.deleteBatchCalculations(targetIds);
          } catch (delErr) {
            console.warn('Gagal menghapus data perhitungan setelah simpan SPH:', delErr);
          }
        }

        success('SPH Tersimpan', `Surat Penawaran ${noSPH} berhasil disimpan.`);
      }

      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err: any) {
      error('Gagal Menyimpan SPH', err.message);
    }
  };

  const isSavingSPH = isCreating || isUpdatingSPH;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit & Preview Surat Penawaran Harga (SPH)' : 'Generator & Preview Surat Penawaran Harga (SPH)'}
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>Cetak / Export PDF</Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSavingSPH}>Batal</Button>
            <Button variant="primary" size="sm" isLoading={isSavingSPH} onClick={handleSaveToDatabase} leftIcon={<Save className="w-3.5 h-3.5" />}>
              {isEditMode ? 'Perbarui SPH' : 'Simpan SPH'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5 print:gap-0 print:block">
        {/* Settings Panel */}
        <div className="print:hidden flex flex-col gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
            <Select
              label="Kop Brand Perusahaan"
              options={brands.map(b => ({ label: b.nama_brand, value: b.nama_brand }))}
              value={selectedBrandName}
              onChange={(e) => setSelectedBrandName(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Nama Klien / Perusahaan
              </label>
              <textarea
                rows={2}
                value={namaPt}
                onChange={(e) => setNamaPt(e.target.value)}
                placeholder="Contoh: PT Bank Mandiri Tbk&#10;Up. Ibu Rina (Procurement)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-y"
              />
            </div>
            <Select
              label="Sales In-Charge"
              options={users.map(u => ({ label: u.nama === user?.nama ? `${u.nama} (Akun Anda)` : u.nama, value: u.nama }))}
              value={salesName}
              onChange={(e) => setSalesName(e.target.value)}
              disabled={role === 'sales'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/50">
            <div className="flex flex-col gap-1">
              <Input
                label="Diskon (Rp)"
                type="number"
                min={0}
                max={subtotalGross}
                value={globalDiskon || ''}
                onChange={(e) => setGlobalDiskon(parseInt(e.target.value) || 0)}
              />
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input type="checkbox" checked={showDiskon} onChange={(e) => setShowDiskon(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>Tampilkan Diskon di SPH</span>
              </label>
              {role === 'sales' && (
                <div className="mt-1 p-2 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-500/30 text-[11px]">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-amber-200">
                    <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                      Max Diskon (Kategori A - {maxDiskonInfo.persentase}%):
                    </span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                      {formatRupiah(maxDiskonInfo.maxNominal)}
                    </span>
                  </div>
                  <p className="text-[10px] italic text-slate-600 dark:text-slate-300 mt-0.5">
                    "{pesanDiskon}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label="Biaya Pengiriman/Ongkir (Rp)"
                type="number"
                min={0}
                value={ongkir || ''}
                onChange={(e) => setOngkir(parseInt(e.target.value) || 0)}
              />
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input type="checkbox" checked={showOngkir} onChange={(e) => setShowOngkir(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>Tampilkan Ongkir di SPH</span>
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <Select
                label="PPN (11%)"
                options={[
                  { label: 'Tidak (Non-PPN)', value: 'tidak' },
                  { label: 'Ya (PPN 11%)', value: 'ya' },
                ]}
                value={isPpn ? 'ya' : 'tidak'}
                onChange={(e) => {
                  const val = e.target.value === 'ya';
                  setIsPpn(val);
                  if (val) setShowPpn(true);
                }}
              />
              <label className={`flex items-center gap-1.5 text-[11px] font-medium select-none ${isPpn ? 'text-slate-600 dark:text-slate-300 cursor-pointer' : 'text-slate-400 opacity-60'}`}>
                <input type="checkbox" checked={showPpn && isPpn} disabled={!isPpn} onChange={(e) => setShowPpn(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>Tampilkan PPN di SPH</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/50">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Catatan / Deskripsi Project</label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tulis deskripsi project (Tekan Enter untuk baris baru)..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-y"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Syarat & Ketentuan (Manual)</label>
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input type="checkbox" checked={showKeterangan} onChange={(e) => setShowKeterangan(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>Tampilkan di SPH</span>
                </label>
              </div>
              <textarea
                rows={2}
                value={keteranganManual}
                onChange={(e) => setKeteranganManual(e.target.value)}
                placeholder="Setiap baris Enter otomatis jadi poin 3, 4, 5...&#10;Contoh:&#10;Pembayaran DP 50%&#10;Estimasi produksi 14 hari kerja"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-y"
              />
            </div>
          </div>
        </div>

        {/* Printable SPH Document Preview */}
        <div id="sph-print-document" className="printable-doc sph-document bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="flex justify-between items-start pb-2">
            <div>
              <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight uppercase leading-tight">{activeBrand?.nama_brand || 'HELLOSWAG'}</h1>
              <p className="text-xs text-slate-600 mt-1">{activeBrand?.alamat || 'Jl. Kiara Sari I No.2. Sekejati. Kec. Buahbatu. Kota Bandung. Jawa Barat 40289'}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeBrand?.no_telp_kantor ? `Telp: ${activeBrand.no_telp_kantor} | ` : ''}
                {activeBrand?.no_telp_wa ? `WA: ${activeBrand.no_telp_wa} | ` : ''}
                {activeBrand?.email ? `Email: ${activeBrand.email}` : ''}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider rounded">SURAT PENAWARAN HARGA</span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1.5">{noSPH || 'SPH 0001/MH/VIII/2026'}</p>
              <p className="text-xs text-slate-600 mt-0.5">{dateFormatted}</p>
            </div>
          </div>

          <div className="border-b-2 border-slate-900 mb-4"></div>

          {/* Kepada Yth */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">KEPADA YTH:</p>
            {namaPt ? (
              <div className="text-xs font-bold text-slate-900 mt-0.5 whitespace-pre-wrap leading-relaxed">{namaPt}</div>
            ) : (
              <p className="text-xs font-semibold text-slate-400 mt-0.5">-</p>
            )}
          </div>

          {/* Opening Greeting */}
          <div className="mb-3 text-xs text-slate-800 leading-relaxed">
            <p className="mb-2">Dengan hormat,</p>
            <p>Pada kesempatan kali ini, kami <strong className="text-slate-900">{activeBrand?.nama_brand || 'HELLOSWAG'}</strong> bermaksud memberikan penawaran harga. Berikut spesifikasi tawaran yang dimaksud :</p>
          </div>

          {/* Products Table */}
          <div className="sph-table-wrapper mb-3">
            <table className="sph-table w-full border-collapse border border-slate-300 text-xs text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900 text-[11px]">
                  <th className="py-2 px-3 border-r border-slate-300 text-center w-10">No</th>
                  <th className="py-2 px-3 border-r border-slate-300">Deskripsi & Spesifikasi Produk</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center w-16">Qty</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-right w-28">Harga Satuan</th>
                  <th className="py-2 px-3 text-right w-32">Total Harga</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-300 break-inside-avoid">
                    <td className="py-2 px-3 text-center border-r border-slate-300 align-top">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-300 align-top">
                      <p className="font-bold">{item.produk}</p>
                      {item.kode && <p className="text-[11px] font-mono mt-0.5">Kode: {item.kode}</p>}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-300 align-top">{formatNumber(item.qty)}</td>
                    <td className="py-2 px-3 text-right border-r border-slate-300 align-top">{formatRupiah(item.hargaJualUnit)}</td>
                    <td className="py-2 px-3 text-right font-bold align-top">{formatRupiah(item.hargaJualUnit * item.qty)}</td>
                  </tr>
                ))}
                <tr className="border-t border-b border-slate-300 break-inside-avoid">
                  <td colSpan={3} className="border-r border-slate-300"></td>
                  <td className="py-2 px-3 text-right font-bold text-xs border-r border-slate-300">Sub Total:</td>
                  <td className="py-2 px-3 text-right font-bold text-xs">{formatRupiah(subtotalGross)}</td>
                </tr>
                {showDiskon && (
                  <tr className="border-b border-slate-300 break-inside-avoid">
                    <td colSpan={3} className="border-r border-slate-300"></td>
                    <td className="py-1.5 px-3 text-right font-bold text-rose-600 text-xs border-r border-slate-300">Diskon:</td>
                    <td className="py-1.5 px-3 text-right font-bold text-rose-600 text-xs">{diskonNominal > 0 ? `- ${formatRupiah(diskonNominal)}` : 'Rp 0'}</td>
                  </tr>
                )}
                {isPpn && showPpn && (
                  <tr className="border-b border-slate-300 break-inside-avoid">
                    <td colSpan={3} className="border-r border-slate-300"></td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-800 text-xs border-r border-slate-300">PPN (11%):</td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-800 text-xs">+ {formatRupiah(ppnNominal)}</td>
                  </tr>
                )}
                {showOngkir && (
                  <tr className="border-b border-slate-300 break-inside-avoid">
                    <td colSpan={3} className="border-r border-slate-300"></td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-800 text-xs border-r border-slate-300">Biaya Pengiriman:</td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-800 text-xs">{ongkirNominal > 0 ? `+ ${formatRupiah(ongkirNominal)}` : 'Rp 0'}</td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-bold break-inside-avoid">
                  <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-300 uppercase text-xs">GRAND TOTAL PENAWARAN AKHIR:</td>
                  <td className="py-2 px-3 text-right text-sm text-indigo-700">{formatRupiah(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Catatan Tambahan / Deskripsi Project (Bawah Tabel) */}
          {deskripsi && (
            <div className="sph-keep-together mb-3 text-xs text-slate-800 leading-relaxed border-l-4 border-slate-700 pl-3 py-2 bg-slate-50 rounded-r">
              <p className="font-bold text-slate-900 mb-1 text-xs">Catatan Tambahan / Deskripsi Project:</p>
              <p className="text-slate-700 whitespace-pre-wrap">{deskripsi}</p>
            </div>
          )}

          {/* Closing Statement */}
          <div className="sph-keep-together mt-2 mb-4 text-xs text-slate-800 leading-relaxed">
            <p>Demikian surat penawaran yang dapat kami sampaikan saat ini dan semoga harga dan modelnya cocok. Atas perhatiannya kami ucapkan terima kasih.</p>
          </div>

          {/* Syarat & Ketentuan & Rekening Pembayaran */}
          <div className="sph-signature-section grid grid-cols-2 gap-6 pt-4 border-t border-slate-300">
            <div>
              <p className="font-bold text-slate-900 mb-1.5 uppercase text-[10px] tracking-wider">Syarat & Ketentuan:</p>
              <ol className="list-decimal list-outside ml-4 text-slate-700 space-y-1 text-[11px]">
                <li>Waktu pengerjaan terhitung setelah approval sampel mockup digital.</li>
                <li>Harga penawaran ini berlaku selama 14 hari kalender sejak tanggal diterbitkan.</li>
                {showKeterangan && manualTermsLines.map((line, idx) => (
                  <li key={idx} value={3 + idx}>{line}</li>
                ))}
              </ol>

              <div className="mt-3.5 p-2.5 bg-slate-100/90 rounded-lg border border-slate-200 print:bg-slate-50">
                <p className="font-bold text-slate-900 text-[10px] uppercase tracking-wider mb-0.5">Rekening Pembayaran Resmi:</p>
                <p className="text-slate-900 font-bold text-xs">
                  {activeBrand?.bank || 'BCA Syariah'} : <span className="font-mono font-bold">{activeBrand?.no_rekening || '590043923'}</span>
                </p>
                <p className="text-slate-500 text-[10px] mt-0.5">A.N: {activeBrand?.atas_nama || 'Elis Maidah'}</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="flex flex-col items-center justify-end text-center pt-1">
              <p className="text-slate-600 text-xs">Hormat Kami,</p>
              <p className="font-bold text-slate-900 text-xs uppercase">{activeBrand?.nama_brand || 'HELLOSWAG'}</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900 text-xs">{salesName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Divisi Penjualan & Kemitraan</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

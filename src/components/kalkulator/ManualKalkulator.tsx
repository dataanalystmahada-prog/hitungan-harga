import React, { useState } from 'react';
import { useManualKalkulator, ManualItem } from '../../hooks/useManualKalkulator';
import { QUANTITY_TIERS } from '../../utils/calcEngine';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { Calculator, Save, FileText, CheckCircle, Trash2, Plus, ArrowRight, TrendingUp, Copy, Layers, PenSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePerhitungan } from '../../hooks/usePerhitungan';
import { useToast } from '../../contexts/ToastContext';
import { SPHPreviewModal } from '../sph/SPHPreviewModal';
import { SavePreviewModal } from './SavePreviewModal';

export const ManualKalkulator: React.FC = () => {
  const { user, role } = useAuth();
  const {
    items,
    orderSummary,
    focusedItem,
    focusedItemId,
    setFocusedItemId,
    sales,
    setSales,
    namaPt,
    setNamaPt,
    brand,
    setBrand,
    addItem,
    removeItem,
    duplicateItem,
    updateItem,
    users,
    brands,
  } = useManualKalkulator();

  const { createCalculation, isCreating, isCreatingBatch } = usePerhitungan({ page: 1, limit: 1 });
  const isSaving = isCreating || Boolean(isCreatingBatch);
  const { success, error } = useToast();
  const [isSPHModalOpen, setIsSPHModalOpen] = useState(false);
  const [isSavePreviewModalOpen, setIsSavePreviewModalOpen] = useState(false);

  // Prepare SPH line items
  const sphLineItems = items.map(it => ({
    produk: it.namaProduk || '-',
    kode: it.kode,
    deskripsi: it.prosesLogo || '-',
    proses_logo: it.prosesLogo,
    qty: it.qty,
    hargaJualUnit: it.hargaJualUnit || 0,
    totalHargaJual: it.totalHargaJualKotor || 0,
    diskon: (it.totalHargaJualKotor || 0) - (it.totalHargaJualNet || 0),
  }));

  // Open save preview modal
  const handleSaveAll = () => {
    if (items.length === 0 || !items[0].namaProduk) {
      error('Item Belum Lengkap', 'Silakan isi nama produk terlebih dahulu.');
      return;
    }
    setIsSavePreviewModalOpen(true);
  };

  // Actual save logic (Single Unified Record for 1 or More Products)
  const executeSaveAll = async (globalDiskon: number, deskripsi: string, modalNamaPt?: string) => {
    try {
      const finalNamaPt = (modalNamaPt !== undefined ? modalNamaPt : (namaPt || '')).trim();
      if (modalNamaPt !== undefined && modalNamaPt !== namaPt) {
        setNamaPt(modalNamaPt);
      }

      const now = new Date();
      const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      
      const totalPcs = orderSummary.totalPcs || 1;
      const totalGross = orderSummary.totalHargaJualKotor;
      const totalModalProd = items.reduce((acc, it) => acc + ((it.modalProduk || 0) * it.qty), 0);
      const totalModalLogo = items.reduce((acc, it) => acc + ((it.modalLogo || 0) * it.qty), 0);

      const summaryProduk = items.length === 1 
        ? (items[0].namaProduk || '-')
        : items.map(it => `${it.namaProduk || '-'} (${it.qty} pcs)`).join(', ');

      const summaryKode = items.map(it => it.kode).filter(Boolean).join(', ') || '-';
      const summaryLogo = items.map(it => it.prosesLogo).filter(Boolean).join(', ') || '-';

      const payload = {
        id: `MANUAL-${Date.now()}`,
        tanggal: dateFormatted,
        sales: (user?.nama || sales || 'Sales Admin').trim(),
        nama_pt: finalNamaPt,
        produk: summaryProduk,
        kode: summaryKode,
        proses_logo: summaryLogo,
        qty: totalPcs,
        modal_produk: Math.round(totalModalProd / totalPcs),
        modal_logo: Math.round(totalModalLogo / totalPcs),
        margin: orderSummary.avgMarginPersen,
        harga_jual: Math.round(totalGross / totalPcs),
        total_harga_jual: totalGross,
        harga_jual_net: Math.max(0, totalGross - globalDiskon),
        diskon: globalDiskon,
        items: sphLineItems,
      };

      await createCalculation(payload);
      success('Berhasil Disimpan', `Perhitungan manual ${summaryProduk} (${totalPcs} pcs) untuk ${finalNamaPt || 'Klien'} berhasil disimpan.`);
    } catch (err: any) {
      error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan.');
    }
  };

  const TIER_QUICK = [12, 24, 50, 75, 100, 150, 200, 300, 500] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header Card */}
      <Card className="p-3.5 sm:p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
                <PenSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Kalkulator Harga Manual & Custom
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hitung cepat produk custom atau item non-matriks dengan input manual modal & margin target.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              leftIcon={<Plus className="w-3.5 h-3.5 text-amber-500" />}
              className="flex-1 md:flex-none border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              + Tambah Item Manual
            </Button>
          </div>
        </div>

        {/* Sales, Klien, Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 text-xs">
          <Select
            label="Sales In-Charge (PIC)"
            options={users.map(u => ({ label: u.nama === user?.nama ? `${u.nama} (Akun Anda)` : `${u.nama}`, value: u.nama }))}
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            disabled={role === 'sales'}
          />
          <Input
            label="Nama Klien / Perusahaan"
            placeholder="Contoh: PT Bank Central Asia Tbk"
            value={namaPt}
            onChange={(e) => setNamaPt(e.target.value)}
          />
          <Select
            label="Kop Brand Perusahaan"
            options={brands.map(b => ({ label: `${b.nama_brand} (${b.singkatan})`, value: b.nama_brand }))}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
      </Card>

      {/* 2. Item List */}
      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const isFocused = item.id === focusedItemId;

          return (
            <div
              key={item.id}
              onClick={() => setFocusedItemId(item.id)}
              className={`rounded-xl border transition-all duration-150 cursor-pointer ${
                isFocused
                  ? 'bg-white dark:bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Item Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                    {item.namaProduk || `Item Manual #${index + 1}`}
                  </span>
                  {item.kode && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                      {item.kode}
                    </span>
                  )}
                  {isFocused && (
                    <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Aktif
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); duplicateItem(item.id); }}
                    leftIcon={<Copy className="w-3 h-3" />}
                  >
                    Duplikat
                  </Button>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      leftIcon={<Trash2 className="w-3 h-3" />}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </div>

              {/* Item Body */}
              <div className="p-3.5">
                {/* Row 1: Produk & Kode & Proses */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3">
                  <Input
                    label="Nama Produk (bebas)"
                    placeholder="Contoh: Powerbank Custom 10.000mAh"
                    value={item.namaProduk}
                    onChange={(e) => updateItem(item.id, { namaProduk: e.target.value })}
                  />
                  <Input
                    label="Kode / Model (opsional)"
                    placeholder="Contoh: RT-180, AK-01"
                    value={item.kode}
                    onChange={(e) => updateItem(item.id, { kode: e.target.value })}
                  />
                  <Input
                    label="Proses Logo / Keterangan"
                    placeholder="Contoh: Sablon 2 Sisi, Laser, Bordir"
                    value={item.prosesLogo}
                    onChange={(e) => updateItem(item.id, { prosesLogo: e.target.value })}
                  />
                </div>

                {/* Row 2: Modal & Margin & Qty */}
                <div className={`grid grid-cols-2 gap-3 ${role !== 'sales' ? 'md:grid-cols-5' : 'md:grid-cols-2'}`}>
                  {role !== 'sales' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Modal Produk (Rp)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.modalProduk || ''}
                          placeholder="0"
                          onChange={(e) => updateItem(item.id, { modalProduk: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Modal Logo (Rp)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.modalLogo || ''}
                          placeholder="0"
                          onChange={(e) => updateItem(item.id, { modalLogo: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Tipe Margin
                        </label>
                        <select
                          value={item.marginType}
                          onChange={(e) => updateItem(item.id, { marginType: e.target.value as 'multiplier' | 'persen' })}
                          className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="multiplier">Multiplier (×1.70)</option>
                          <option value="persen">Persen (35%)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          {item.marginType === 'multiplier' ? 'Multiplier (×)' : 'Margin (%)'}
                        </label>
                        <input
                          type="number"
                          step={item.marginType === 'multiplier' ? 0.01 : 1}
                          min={item.marginType === 'multiplier' ? 1.01 : 1}
                          max={item.marginType === 'multiplier' ? 10 : 99}
                          value={item.marginValue}
                          onChange={(e) => updateItem(item.id, { marginValue: parseFloat(e.target.value) || (item.marginType === 'multiplier' ? 1.5 : 25) })}
                          className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Harga Jual Net (Rp)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={item.manualHargaJual || ''}
                        placeholder="0"
                        onChange={(e) => updateItem(item.id, { manualHargaJual: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Qty (Pcs)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={item.qty === 0 ? '' : item.qty}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateItem(item.id, { qty: val === '' ? 0 : Math.max(0, parseInt(val) || 0) });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Quick Tier */}
                {role !== 'sales' && (
                  <div className="flex flex-wrap items-center gap-1 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
                    <span className="text-[10px] font-medium text-slate-400 mr-1">Quick Tier:</span>
                    {TIER_QUICK.map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateItem(item.id, { qty: tier }); }}
                        className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all ${
                          item.qty === tier
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {tier} pcs
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Result Badges */}
                {(item.totalModal !== undefined) && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-3 p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                    {role !== 'sales' && (
                      <>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Total Modal:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">
                            {formatRupiah(item.totalModal || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            {item.marginType === 'multiplier' ? `Multiplier ×${item.marginValue}:` : `Margin ${item.marginValue}%:`}
                          </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                            {item.marginPersen?.toFixed(1)}% margin
                          </span>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga Jual / Pcs:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm">
                        {formatRupiah(item.hargaJualUnit || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Subtotal ({item.qty} pcs):</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm">
                        {formatRupiah(item.totalHargaJualNet || 0)}
                      </span>
                    </div>
                    {role !== 'sales' && (
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Est. Keuntungan:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                          +{formatRupiah(item.keuntunganTotal || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Sticky Bottom Summary Bar */}
      <div className="sticky bottom-3 z-20">
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white shadow-xl border border-amber-500/30 backdrop-blur-md">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 items-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Produk:</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {orderSummary.totalItems} Macam ({formatNumber(orderSummary.totalPcs)} Pcs)
              </span>
            </div>

            {role !== 'sales' && (
              <>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Modal:</span>
                  <span className="text-xs font-semibold text-slate-300 font-mono">
                    {formatRupiah(orderSummary.totalModal)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Avg Margin:</span>
                  <span className="text-xs font-bold text-amber-300">
                    {orderSummary.avgMarginPersen}%
                  </span>
                </div>
              </>
            )}

            {role !== 'sales' && (
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Est. Laba Bersih:</span>
                <span className="text-xs font-extrabold text-emerald-400 font-mono">
                  +{formatRupiah(orderSummary.totalKeuntungan)}
                </span>
              </div>
            )}

            <div>
              <span className="text-[10px] text-amber-300 uppercase tracking-wider block">Grand Total Net:</span>
              <span className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white font-mono">
                {formatRupiah(orderSummary.totalHargaJualNet)}
              </span>
            </div>

            <div className="col-span-2 lg:col-span-1 flex items-center justify-end gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsSPHModalOpen(true)}
                leftIcon={<FileText className="w-3.5 h-3.5" />}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-amber-500/25"
              >
                Buat SPH
              </Button>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isSaving}
                onClick={handleSaveAll}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                title="Simpan ke Database"
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Tier Simulation for Focused Item */}
      {focusedItem && focusedItem.namaProduk && role !== 'sales' && (
        <Card className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Simulasi Semua Tier Qty untuk: <span className="text-amber-600 dark:text-amber-400 underline">{focusedItem.namaProduk}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Menampilkan harga jual dan estimasi keuntungan di tiap tier kuantiti, berdasarkan modal dan margin yang Anda input.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-2.5">Tier Qty</th>
                  <th className="py-2 px-2.5">Total Modal/Pcs</th>
                  <th className="py-2 px-2.5">
                    {focusedItem.marginType === 'multiplier' ? 'Multiplier' : 'Margin'}
                  </th>
                  <th className="py-2 px-2.5 text-right">Harga Jual/Pcs</th>
                  <th className="py-2 px-2.5 text-right">Total Nilai</th>
                  <th className="py-2 px-2.5 text-right text-emerald-600 dark:text-emerald-400">Est. Keuntungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {QUANTITY_TIERS.map(tier => {
                  const totalM = (focusedItem.modalProduk || 0) + (focusedItem.modalLogo || 0);
                  let unitPrice = 0;
                  let marginPct = 0;
                  const mv = focusedItem.marginValue || 1;

                  if (focusedItem.marginType === 'multiplier') {
                    unitPrice = Math.ceil((totalM * mv) / 100) * 100;
                    marginPct = mv > 0 ? Math.round(((mv - 1) / mv) * 100) : 0;
                  } else {
                    const factor = 1 - mv / 100;
                    unitPrice = Math.ceil((totalM / (factor > 0 ? factor : 0.75)) / 100) * 100;
                    marginPct = mv;
                  }

                  const isCurrent = tier === focusedItem.qty;
                  const diskon = focusedItem.diskonPersen || 0;
                  const netUnit = Math.round(unitPrice * (1 - diskon / 100));
                  const totalNet = netUnit * tier;
                  const profit = totalNet - totalM * tier;

                  return (
                    <tr
                      key={tier}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-amber-50/80 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-200'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-2.5 font-semibold">
                        <span className="flex items-center gap-1.5">
                          {tier} pcs
                          {isCurrent && (
                            <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500 text-white">
                              Pilihan Anda
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">{formatRupiah(totalM)}</td>
                      <td className="py-2 px-2.5 font-sans">
                        {focusedItem.marginType === 'multiplier'
                          ? `×${mv} (${marginPct}%)`
                          : `${mv}%`}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatRupiah(netUnit)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold">{formatRupiah(totalNet)}</td>
                      <td className="py-2 px-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        +{formatRupiah(profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SPH Modal */}
      {isSPHModalOpen && (
        <SPHPreviewModal
          isOpen={isSPHModalOpen}
          onClose={() => setIsSPHModalOpen(false)}
          defaultData={{
            sales,
            namaPt,
            brand,
            diskon: orderSummary.totalDiskon,
            items: sphLineItems,
          }}
          onSavePerhitunganBeforePrint={async (modalDeskripsi, modalDiskon, modalNamaPt) => {
            await executeSaveAll(modalDiskon !== undefined ? modalDiskon : orderSummary.totalDiskon, modalDeskripsi, modalNamaPt);
          }}
        />
      )}

      {isSavePreviewModalOpen && (
        <SavePreviewModal
          isOpen={isSavePreviewModalOpen}
          onClose={() => setIsSavePreviewModalOpen(false)}
          onSave={executeSaveAll}
          items={items}
          totalKotor={orderSummary.totalHargaJualKotor}
          isSaving={isSaving}
          defaultNamaPt={namaPt}
        />
      )}
    </div>
  );
};

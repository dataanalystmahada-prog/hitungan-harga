import React, { useState } from 'react';
import { useMultiKalkulator } from '../../hooks/useMultiKalkulator';
import { QUANTITY_TIERS, findClosestTier, getTierKey, parseSpreadsheetNumber } from '../../utils/calcEngine';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  Building2, 
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePerhitungan } from '../../hooks/usePerhitungan';
import { useMasterData } from '../../hooks/useMasterData';
import { useToast } from '../../contexts/ToastContext';
import { SPHPreviewModal } from '../sph/SPHPreviewModal';
import { SavePreviewModal } from './SavePreviewModal';

export const InteractiveKalkulator: React.FC = () => {
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
    handleItemProductChange,
    getAvailableKodes,
    getAvailableLogos,
    masterProduk,
    users,
    brands,
  } = useMultiKalkulator();

  const { modalProduk, modalLogo, margin } = useMasterData();
  const uniqueProdukList = React.useMemo(() => {
    return Array.from(new Set(modalProduk.map(m => m.produk))).filter(Boolean).sort();
  }, [modalProduk]);

  const { createCalculation, isCreating, isCreatingBatch } = usePerhitungan({ page: 1, limit: 1 });
  const isSaving = isCreating || Boolean(isCreatingBatch);
  const { success, error } = useToast();

  const [isSPHModalOpen, setIsSPHModalOpen] = useState(false);
  const [isSavePreviewModalOpen, setIsSavePreviewModalOpen] = useState(false);

  // Prepare line items for SPH modal & unified storage
  const sphLineItems = items.map(it => {
    const calc = it.calculation;
    return {
      produk: it.produk,
      kode: it.kode,
      proses_logo: it.proses_logo,
      qty: it.qty,
      hargaJualUnit: calc ? calc.hargaJualKotorUnit : 0,
      totalHargaJual: calc ? calc.totalHargaJualKotor : 0,
      diskon: calc ? (calc.diskonNominalUnit * it.qty) : 0,
    };
  });

  // Open save preview modal
  const handleSaveAllCalculations = () => {
    if (items.length === 0 || !items[0].produk) {
      error('Item Belum Lengkap', 'Silakan pilih produk terlebih dahulu.');
      return;
    }
    setIsSavePreviewModalOpen(true);
  };

  // Actual save logic (Single Unified Record for 1 or More Products)
  const executeSaveAll = async (globalDiskon: number, deskripsi: string) => {
    try {
      const now = new Date();
      const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      
      const totalPcs = orderSummary.totalPcs || 1;
      const totalGross = orderSummary.totalHargaJualKotor;
      const totalModalProd = items.reduce((acc, it) => acc + ((it.calculation?.modalProdukUnit || 0) * it.qty), 0);
      const totalModalLogo = items.reduce((acc, it) => acc + ((it.calculation?.modalLogoUnit || 0) * it.qty), 0);

      const summaryProduk = items.length === 1 
        ? items[0].produk 
        : items.map(it => `${it.produk} (${it.qty} pcs)`).join(', ');

      const summaryKode = items.map(it => it.kode).filter(Boolean).join(', ') || '-';
      const summaryLogo = items.map(it => it.proses_logo).filter(Boolean).join(', ') || '-';

      const payload = {
        id: `CALC-${Date.now()}`,
        tanggal: dateFormatted,
        sales: (user?.nama || sales || 'Sales Admin').trim(),
        nama_pt: (namaPt || '').trim(),
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
      success(
        'Berhasil Disimpan',
        `Perhitungan ${summaryProduk} (${totalPcs} pcs) berhasil disimpan sebagai 1 data perhitungan.`
      );
    } catch (err: any) {
      error('Gagal Menyimpan Hitungan', err.message || 'Terjadi kesalahan saat menyimpan.');
    }
  };

  // Open Multi-Item SPH Modal
  const handleOpenSPH = () => {
    setIsSPHModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Order Information Card */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Kalkulator Harga & Margin Multi-Produk
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hitung beberapa produk sekaligus dalam 1 pesanan, auto-lookup matriks harga modal, logo & margin.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              leftIcon={<Plus className="w-4 h-4 text-indigo-500" />}
              className="flex-1 md:flex-none border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              + Tambah Item Produk
            </Button>
          </div>
        </div>

        {/* Client & Sales Order Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <Select
            label="Sales In-Charge (PIC)"
            options={users.map(u => ({ label: u.nama === user?.nama ? `${u.nama} (Akun Anda)` : `${u.nama} (${u.email})`, value: u.nama }))}
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            disabled={role === 'sales'}
          />
          <Input
            label="Nama Klien / Perusahaan (Draft SPH)"
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

      {/* 2. List of Multi-Product Items */}
      <div className="flex flex-col gap-4">
        {items.map((item, index) => {
          const calc = item.calculation;
          const kodes = getAvailableKodes(item.produk);
          const logos = getAvailableLogos(item.produk);
          const isFocused = item.id === focusedItemId;

          return (
            <div
              key={item.id}
              onClick={() => setFocusedItemId(item.id)}
              className={`rounded-2xl border transition-all duration-200 ${
                isFocused
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Item Card Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {item.produk || `Item Produk #${index + 1}`}
                  </span>
                  {item.kode && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {item.kode}
                    </span>
                  )}
                  {isFocused && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Aktif di Matriks
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateItem(item.id);
                    }}
                    title="Duplikat Item"
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                  >
                    Duplikat
                  </Button>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      title="Hapus Item"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </div>

              {/* Item Card Body */}
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Select Produk */}
                  <div className="md:col-span-4">
                    <Select
                      label="Kategori Produk"
                      options={uniqueProdukList.map(p => ({ label: p, value: p }))}
                      value={item.produk}
                      onChange={(e) => handleItemProductChange(item.id, e.target.value)}
                    />
                  </div>

                  {/* Select Kode / Model */}
                  <div className="md:col-span-3">
                    <Select
                      label="Varian / Kode Model"
                      options={
                        kodes.length > 0
                          ? kodes.map(k => ({
                              label: k.kode,
                              value: k.kode
                            }))
                          : [{ label: 'Standard / Default', value: '' }]
                      }
                      value={item.kode || ''}
                      onChange={(e) => updateItem(item.id, { kode: e.target.value })}
                    />
                  </div>

                  {/* Select Logo */}
                  <div className="md:col-span-3">
                    <Select
                      label="Proses Logo & Branding"
                      options={
                        logos.length > 0
                          ? logos.map(l => ({ label: l, value: l }))
                          : [{ label: 'Tanpa Logo / Polos', value: '' }]
                      }
                      value={item.proses_logo || ''}
                      onChange={(e) => updateItem(item.id, { proses_logo: e.target.value })}
                    />
                  </div>

                  {/* Quantity & Discount */}
                  <div className="md:col-span-2">
                    <Input
                      label="Qty (Pcs)"
                      type="number"
                      min={0}
                      value={item.qty === 0 ? '' : item.qty}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateItem(item.id, { qty: val === '' ? 0 : Math.max(0, parseInt(val) || 0) });
                      }}
                    />
                  </div>
                </div>

                {/* Quick Quantity Tier Buttons */}
                {role !== 'sales' && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                    <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Tier:</span>
                    {QUANTITY_TIERS.map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateItem(item.id, { qty: tier });
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                          item.qty === tier
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {tier} pcs
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Item Calculation Badges */}
                {calc && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                    {role !== 'sales' && (
                      <>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Modal Produk:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                            {formatRupiah(calc.modalProdukUnit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Modal Logo:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                            {formatRupiah(calc.modalLogoUnit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Margin Target:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {calc.marginPersen}%
                          </span>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga Jual / Pcs:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                        {formatRupiah(calc.hargaJualNetUnit)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Subtotal ({item.qty} pcs):</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                        {formatRupiah(calc.totalHargaJualNet)}
                      </span>
                    </div>
                    {role !== 'sales' && (
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Est. Keuntungan:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          +{formatRupiah(calc.keuntunganTotal)}
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

      {/* 3. Grand Total Aggregate Order Sticky Summary */}
      <div className="sticky bottom-4 z-20">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-indigo-500/30 backdrop-blur-md">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-center">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Produk:</span>
              <span className="text-base font-extrabold text-white">
                {orderSummary.totalItems} Macam ({formatNumber(orderSummary.totalPcs)} Pcs)
              </span>
            </div>

            {role !== 'sales' && (
              <>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Modal:</span>
                  <span className="text-sm font-semibold text-slate-300 font-mono">
                    {formatRupiah(orderSummary.totalModal)}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Avg Margin:</span>
                  <span className="text-sm font-bold text-indigo-300">
                    {orderSummary.avgMarginPersen}%
                  </span>
                </div>
              </>
            )}

            {role !== 'sales' && (
              <div>
                <span className="text-[11px] text-emerald-400 uppercase tracking-wider block">Est. Laba Bersih:</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  +{formatRupiah(orderSummary.totalKeuntungan)}
                </span>
              </div>
            )}

            <div>
              <span className="text-[11px] text-indigo-300 uppercase tracking-wider block">Grand Total Net:</span>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white font-mono">
                {formatRupiah(orderSummary.totalHargaJualNet)}
              </span>
            </div>

            <div className="col-span-2 lg:col-span-1 flex items-center justify-end gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenSPH}
                leftIcon={<FileText className="w-4 h-4" />}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/25"
              >
                Buat SPH
              </Button>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isSaving}
                onClick={handleSaveAllCalculations}
                leftIcon={<Save className="w-4 h-4" />}
                title="Simpan Semua Item ke Database"
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Item Tier Matrix Simulation Table (12 - 500 Pcs) */}
      {focusedItem && role !== 'sales' && (
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Simulasi Matriks Skala Quantity (12 - 500 Pcs) untuk: <span className="text-indigo-600 dark:text-indigo-400 underline">{focusedItem.produk}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Membandingkan harga jual satuan dan keuntungan pada seluruh tier kuantiti dari master database spreadsheet.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Tier Qty</th>
                  <th className="py-2.5 px-3">Modal Produk</th>
                  <th className="py-2.5 px-3">Modal Logo</th>
                  <th className="py-2.5 px-3">Total Modal/Pcs</th>
                  <th className="py-2.5 px-3">Margin / Multiplier</th>
                  <th className="py-2.5 px-3 text-right">Harga Jual/Pcs</th>
                  <th className="py-2.5 px-3 text-right">Total Nilai Order</th>
                  <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">Est. Keuntungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {QUANTITY_TIERS.map(tier => {
                  const tierKey = getTierKey(tier);
                  const isCurrent = findClosestTier(focusedItem?.qty || 0) === tier;

                  const focusedProd = (focusedItem?.produk || '').toLowerCase().trim();
                  const focusedKode = (focusedItem?.kode || '').toLowerCase().trim();
                  const focusedLogo = (focusedItem?.proses_logo || '').toLowerCase().trim();

                  // Modal Produk
                  let modalP = 0;
                  const foundP = modalProduk.find(
                    m => (m.produk || '').toLowerCase().trim() === focusedProd &&
                         (focusedKode ? (m.kode || '').toLowerCase().trim() === focusedKode : true)
                  );
                  if (foundP) modalP = parseSpreadsheetNumber(foundP.harga_modal);

                  // Modal Logo
                  let modalL = 0;
                  const foundL = modalLogo.find(
                    l => (l.produk || '').toLowerCase().trim() === focusedProd &&
                         (focusedLogo ? (l.proses_logo || '').toLowerCase().trim() === focusedLogo : true)
                  );
                  if (foundL && foundL[tierKey] !== undefined) {
                    modalL = parseSpreadsheetNumber(foundL[tierKey]);
                  }

                  // Margin Multiplier / %
                  let marginVal = 25;
                  const foundM = margin.find(m => (m.produk || '').toLowerCase().trim() === focusedProd);
                  if (foundM && foundM[tierKey] !== undefined) {
                    marginVal = parseSpreadsheetNumber(foundM[tierKey]);
                  }

                  const totalM = modalP + modalL;
                  let unitPrice = 0;
                  let marginPct = 25;

                  if (marginVal >= 1.05 && marginVal <= 5.0) {
                    unitPrice = Math.ceil((totalM * marginVal) / 100) * 100;
                    marginPct = Math.round(((marginVal - 1) / marginVal) * 100);
                  } else if (marginVal > 0 && marginVal < 1.0) {
                    const factor = 1 - marginVal;
                    unitPrice = Math.ceil((totalM / factor) / 100) * 100;
                    marginPct = Math.round(marginVal * 100);
                  } else {
                    const factor = 1 - (marginVal / 100);
                    unitPrice = Math.ceil((totalM / (factor > 0 ? factor : 0.75)) / 100) * 100;
                    marginPct = marginVal;
                  }

                  const subtotal = unitPrice * tier;
                  const profit = subtotal - (totalM * tier);

                  return (
                    <tr
                      key={tier}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold">
                        <span className="flex items-center gap-1.5">
                          {tier} pcs
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-600 text-white">
                              Pilihan Anda
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{formatRupiah(modalP)}</td>
                      <td className="py-2.5 px-3">{formatRupiah(modalL)}</td>
                      <td className="py-2.5 px-3 font-semibold">{formatRupiah(totalM)}</td>
                      <td className="py-2.5 px-3 font-sans">{marginVal >= 1.05 ? `${marginVal}x (${marginPct}%)` : `${marginPct}%`}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatRupiah(unitPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">{formatRupiah(subtotal)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
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

      {/* 5. SPH Generator Modal */}
      {isSPHModalOpen && (
        <SPHPreviewModal
          isOpen={isSPHModalOpen}
          onClose={() => setIsSPHModalOpen(false)}
          defaultData={{
            sales: sales,
            namaPt: namaPt,
            brand: brand,
            diskon: orderSummary.totalDiskonNominal,
            items: sphLineItems,
          }}
          onSavePerhitunganBeforePrint={async (modalDeskripsi, modalDiskon) => {
            await executeSaveAll(modalDiskon !== undefined ? modalDiskon : orderSummary.totalDiskonNominal, modalDeskripsi);
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
        />
      )}
    </div>
  );
};

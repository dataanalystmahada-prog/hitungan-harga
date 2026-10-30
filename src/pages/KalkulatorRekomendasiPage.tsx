import React, { useState, useMemo, useCallback } from 'react';
import { useMasterData } from '../hooks/useMasterData';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { calculatePricingEngine, QUANTITY_TIERS } from '../utils/calcEngine';
import { formatRupiah, formatNumber } from '../utils/formatters';
import {
  Sparkles,
  ClipboardCopy,
  Check,
  CheckCircle2,
  AlertCircle,
  Coins,
  Package,
  TrendingDown,
  ArrowDownUp,
  Layers,
  Info,
} from 'lucide-react';

interface RecommendedVariant {
  kode: string;
  hargaModalProduk: number;
  hargaModalLogo: number;
  totalModal: number;
  marginPersen: number;
  hargaJual: number;
  hematDariBudget: number;
  subtotal: number;
}

export const KalkulatorRekomendasiPage: React.FC = () => {
  const { role } = useAuth();
  const { success, error: toastError } = useToast();
  const { masterProduk, modalProduk, modalLogo, margin, isLoading } = useMasterData();

  // 1. Form Inputs: Produk, Qty, Budget, Logo
  const [produk, setProduk] = useState<string>('');
  const [qty, setQty] = useState<number | ''>(100);
  const [budget, setBudget] = useState<number | ''>(50000);
  const [prosesLogo, setProsesLogo] = useState<string>('');

  // 2. Calculation Results State
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [calculatedItems, setCalculatedItems] = useState<RecommendedVariant[]>([]);
  const [allVariantsCount, setAllVariantsCount] = useState<number>(0);
  const [cheapestAvailablePrice, setCheapestAvailablePrice] = useState<number>(0);
  const [lastCalculatedProduk, setLastCalculatedProduk] = useState<string>('');
  const [lastCalculatedQty, setLastCalculatedQty] = useState<number>(0);
  const [lastCalculatedBudget, setLastCalculatedBudget] = useState<number>(0);

  // Sorting: 'closest' (tertinggi / paling mendekati budget), 'cheapest' (terendah), or 'kode' (A-Z)
  const [sortBy, setSortBy] = useState<'closest' | 'cheapest' | 'kode'>('closest');
  const [copied, setCopied] = useState<boolean>(false);

  // Unique Products List (Alphabetically Sorted)
  const uniqueProdukList = useMemo(() => {
    const all = [
      ...masterProduk.map(p => p.nama_produk),
      ...modalProduk.map(m => m.produk),
    ]
      .filter(Boolean)
      .map(s => s.trim());
    return Array.from(new Set(all)).sort((a, b) =>
      a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' })
    );
  }, [masterProduk, modalProduk]);

  // Set default product when master data loads
  React.useEffect(() => {
    if (!produk && uniqueProdukList.length > 0) {
      setProduk(uniqueProdukList[0]);
    }
  }, [uniqueProdukList, produk]);

  // Available Logo Options for the selected product
  const logoOptions = useMemo(() => {
    if (!produk) return [{ label: 'Tanpa Logo / Polos', value: '' }];
    const prodNorm = produk.toLowerCase().trim();
    const distinctLogos = Array.from(
      new Set(
        modalLogo
          .filter(l => (l.produk || '').toLowerCase().trim() === prodNorm)
          .map(l => (l.proses_logo || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' }));

    return [
      { label: 'Tanpa Logo / Polos', value: '' },
      ...distinctLogos.map(l => ({ label: l, value: l })),
    ];
  }, [produk, modalLogo]);

  // Reset logo when product changes if current logo is not available
  const handleProductChange = (newProd: string) => {
    setProduk(newProd);
    setProsesLogo('');
  };

  // Execute Recommendation Calculation
  const handleCalculate = () => {
    if (!produk) {
      toastError('Produk Belum Dipilih', 'Silakan pilih kategori produk terlebih dahulu.');
      return;
    }

    const numericQty = typeof qty === 'number' ? qty : parseInt(String(qty)) || 0;
    if (numericQty <= 0) {
      toastError('Qty Tidak Valid', 'Silakan masukkan jumlah kuantiti (minimal 1 pcs).');
      return;
    }

    const numericBudget = typeof budget === 'number' ? budget : parseInt(String(budget)) || 0;
    if (numericBudget <= 0) {
      toastError('Budget Belum Diisi', 'Silakan masukkan target budget per pcs.');
      return;
    }

    const prodNorm = produk.toLowerCase().trim();

    // 1. Get all unique variants (kodes) for this product
    const kodeMap = new Map<string, number>();
    modalProduk
      .filter(m => (m.produk || '').toLowerCase().trim() === prodNorm)
      .forEach(m => {
        const k = (m.kode || m.id || '').trim();
        if (k && !kodeMap.has(k)) {
          kodeMap.set(k, Number(m.harga_modal) || 0);
        }
      });

    let variants = Array.from(kodeMap.entries()).map(([kode, harga_modal]) => ({
      kode,
      harga_modal,
    }));

    // Fallback if no specific kode is configured in modalProduk
    if (variants.length === 0) {
      variants = [{ kode: 'Standard / Default', harga_modal: 0 }];
    }

    setAllVariantsCount(variants.length);

    // 2. Calculate selling price for every variant
    const allCalculated: RecommendedVariant[] = variants.map(v => {
      const calcResult = calculatePricingEngine(
        {
          produk,
          kode: v.kode === 'Standard / Default' ? '' : v.kode,
          proses_logo: prosesLogo || '',
          qty: numericQty,
          diskonPersen: 0,
        },
        modalProduk,
        modalLogo,
        margin
      );

      const hargaJual = calcResult.hargaJualNetUnit;
      const hemat = Math.max(0, numericBudget - hargaJual);
      const subtotal = hargaJual * numericQty;

      return {
        kode: v.kode,
        hargaModalProduk: calcResult.modalProdukUnit,
        hargaModalLogo: calcResult.modalLogoUnit,
        totalModal: calcResult.totalModalUnit,
        marginPersen: calcResult.marginPersen,
        hargaJual,
        hematDariBudget: hemat,
        subtotal,
      };
    });

    // Lowest available price across all variants
    const minPrice = Math.min(...allCalculated.map(i => i.hargaJual));
    setCheapestAvailablePrice(minPrice);

    // 3. Filter: Only items <= budget ("yang di tampilkan adalah harga yang sama dan di bawah budget")
    const filtered = allCalculated.filter(item => item.hargaJual <= numericBudget);

    setCalculatedItems(filtered);
    setLastCalculatedProduk(produk);
    setLastCalculatedQty(numericQty);
    setLastCalculatedBudget(numericBudget);
    setHasCalculated(true);

    if (filtered.length > 0) {
      success('Rekomendasi Ditemukan', `Ditemukan ${filtered.length} kode produk sesuai budget.`);
    }
  };

  // Sorted Recommended Items
  const sortedItems = useMemo(() => {
    const list = [...calculatedItems];
    if (sortBy === 'closest') {
      // Highest price under budget first (closest to max budget)
      list.sort((a, b) => b.hargaJual - a.hargaJual);
    } else if (sortBy === 'cheapest') {
      // Lowest price first
      list.sort((a, b) => a.hargaJual - b.hargaJual);
    } else if (sortBy === 'kode') {
      list.sort((a, b) => a.kode.localeCompare(b.kode, 'id', { numeric: true, sensitivity: 'base' }));
    }
    return list;
  }, [calculatedItems, sortBy]);

  // Generate plain text according to required user format
  const generateCopyText = useCallback(() => {
    if (sortedItems.length === 0) return '';
    const lines = [
      `Produk : ${lastCalculatedProduk || produk}`,
      `Qty : ${formatNumber(lastCalculatedQty || qty)} pcs`,
      '',
      'Kode : ',
      ...sortedItems.map(item => `${formatRupiah(item.hargaJual)} : ${item.kode}`),
    ];
    return lines.join('\n');
  }, [sortedItems, lastCalculatedProduk, lastCalculatedQty, produk, qty]);

  // Copy to clipboard
  const handleCopy = async () => {
    const text = generateCopyText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success('Tersalin!', 'Format rekomendasi berhasil disalin ke clipboard.');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success('Tersalin!', 'Format rekomendasi berhasil disalin ke clipboard.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header Information */}
      <Card className="p-3.5 sm:p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-4 h-4 sm:w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Kalkulator Rekomendasi Harga
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih kategori produk, masukkan kuantiti & budget klien untuk mendapatkan daftar kode produk yang sesuai.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Main Content Grid: Left Form & Results, Right Quick-Copy Card */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Left Column: Input Form + Result Badges + Variant Cards */}
        <div className="flex flex-col gap-4 xl:flex-1 xl:min-w-0">
          {/* Input Form Card */}
          <Card className="p-3.5 sm:p-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-brand-500" />
                Parameter Pencarian Rekomendasi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Kategori Produk */}
              <div>
                <SearchableSelect
                  label="1. Kategori Produk"
                  placeholder="Pilih atau cari produk..."
                  options={uniqueProdukList.map(p => ({ label: p, value: p }))}
                  value={produk}
                  onChange={handleProductChange}
                  allowCustom={false}
                  sortAlphabetically={true}
                  disabled={isLoading}
                />
              </div>

              {/* 2. Qty */}
              <div>
                <Input
                  label="2. Qty Pesanan (Pcs)"
                  type="number"
                  min={1}
                  placeholder="Contoh: 100"
                  value={qty === '' ? '' : qty}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQty(val === '' ? '' : Math.max(1, parseInt(val) || 0));
                  }}
                />
              </div>

              {/* 3. Budget */}
              <div>
                <Input
                  label="3. Budget Maksimal per Pcs (Rp)"
                  type="number"
                  min={0}
                  step={500}
                  placeholder="Contoh: 50000"
                  value={budget === '' ? '' : budget}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBudget(val === '' ? '' : Math.max(0, parseInt(val) || 0));
                  }}
                  helperText={
                    typeof budget === 'number' && typeof qty === 'number' && budget > 0 && qty > 0
                      ? `Total Budget: ${formatRupiah(budget * qty)}`
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Quick Qty Tier Buttons & Optional Logo Selector */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Tier Qty:</span>
              {QUANTITY_TIERS.map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setQty(tier)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg transition-all ${
                    qty === tier
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tier} pcs
                </button>
              ))}

              {/* Optional Logo Selector */}
              <div className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0 flex items-center gap-2">
                <span className="text-[11px] text-slate-400 whitespace-nowrap">Proses Logo:</span>
                <select
                  value={prosesLogo}
                  onChange={(e) => setProsesLogo(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {logoOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Hitung Button */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={handleCalculate}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="w-full sm:w-auto px-6 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/20"
              >
                Hitung Rekomendasi
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {hasCalculated && (
            <div className="flex flex-col gap-3">
              {/* Summary Bar & Sorting Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Hasil Rekomendasi:
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-sm">
                    {sortedItems.length} dari {allVariantsCount} Varian Masuk Budget
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    (Budget: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(lastCalculatedBudget)}</span> / pcs)
                  </span>
                </div>

                {sortedItems.length > 0 && (
                  <div className="flex items-center gap-1 text-xs self-end sm:self-auto">
                    <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 text-[11px]">Urutkan:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      <option value="closest">Tertinggi (Dekat Budget)</option>
                      <option value="cheapest">Terendah (Paling Murah)</option>
                      <option value="kode">Nama Kode (A-Z)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Case 1: No items match budget */}
              {sortedItems.length === 0 && (
                <Card className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-md">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Tidak Ada Kode Produk di Bawah Budget
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Seluruh {allVariantsCount} varian kode untuk kategori <span className="font-semibold">{lastCalculatedProduk}</span> melebihi budget <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatRupiah(lastCalculatedBudget)}</span>.
                      </p>
                      {cheapestAvailablePrice > 0 && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                          Harga termurah yang tersedia mulai dari <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{formatRupiah(cheapestAvailablePrice)}</span> / pcs.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Case 2: Matching items found */}
              {sortedItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sortedItems.map((item, idx) => (
                    <div
                      key={item.kode}
                      className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-brand-500/50 hover:shadow-md transition-all flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                              Kode Model
                            </span>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                              {item.kode}
                            </span>
                          </div>
                        </div>

                        {item.hematDariBudget > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <TrendingDown className="w-3 h-3" />
                            Hemat {formatRupiah(item.hematDariBudget)}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            Pas Budget
                          </span>
                        )}
                      </div>

                      {/* Pricing row */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block leading-tight">Harga Jual / Pcs:</span>
                          <span className="text-base font-black text-brand-600 dark:text-brand-400 font-mono">
                            {formatRupiah(item.hargaJual)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Subtotal ({lastCalculatedQty} pcs):
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {formatRupiah(item.subtotal)}
                          </span>
                        </div>
                      </div>

                      {/* Modal & margin details for non-sales */}
                      {role !== 'sales' && (
                        <div className="pt-1.5 border-t border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Modal Prod: {formatRupiah(item.hargaModalProduk)}</span>
                          <span>Margin: {item.marginPersen}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Initial State Helper */}
          {!hasCalculated && (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-500">
                  <Coins className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Siap Menghitung Rekomendasi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tentukan kategori produk, kuantiti pesanan, dan target budget klien di atas, lalu klik tombol <span className="font-semibold text-brand-600 dark:text-brand-400">"Hitung Rekomendasi"</span>.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Format Salin Spesifikasi Rekomendasi (Sticky) */}
        <div className="xl:w-[360px] xl:flex-shrink-0">
          <div className="sticky top-4">
            <Card className="p-0 overflow-hidden shadow-lg border-indigo-200/80 dark:border-indigo-900/40">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2">
                  <ClipboardCopy className="w-4 h-4" />
                  <span className="font-bold text-sm">Format Salin Rekomendasi</span>
                </div>
                <button
                  onClick={handleCopy}
                  disabled={sortedItems.length === 0}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    sortedItems.length === 0
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-white/20 hover:bg-white/30 text-white cursor-pointer'
                  }`}
                  title="Salin Teks ke Clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="w-3.5 h-3.5" />
                      Salin Teks
                    </>
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {sortedItems.length > 0 ? (
                  <>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 dark:text-slate-400 w-16 font-medium">Produk</span>
                          <span className="text-slate-400">:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {lastCalculatedProduk || produk}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 dark:text-slate-400 w-16 font-medium">Qty</span>
                          <span className="text-slate-400">:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatNumber(lastCalculatedQty || qty)} pcs
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                          Kode :
                        </span>
                        <div className="space-y-1 font-mono text-xs max-h-[300px] overflow-y-auto pr-1">
                          {sortedItems.map(item => (
                            <div
                              key={item.kode}
                              className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                            >
                              <span className="font-bold text-brand-600 dark:text-brand-400">
                                {formatRupiah(item.hargaJual)}
                              </span>
                              <span className="text-slate-400 mx-1">:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {item.kode}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Raw Text Preview */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                        Format Teks Mentah (Siap Kirim ke Chat / WA):
                      </span>
                      <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] whitespace-pre-wrap select-all leading-relaxed max-h-[220px] overflow-y-auto border border-slate-800">
                        {generateCopyText()}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                    <Info className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p>Format salin penawaran akan muncul di sini setelah Anda menekan tombol "Hitung Rekomendasi".</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

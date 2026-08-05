import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { Perhitungan, UserSales } from '../../types/database.types';
import { useAuth } from '../../contexts/AuthContext';
import { useMasterData } from '../../hooks/useMasterData';
import { calculatePricingEngine } from '../../utils/calcEngine';
import { Save, Calculator, RefreshCw, Layers } from 'lucide-react';

interface EditPerhitunganModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: Perhitungan | null;
  onSave: (id: string, updates: Partial<Perhitungan>) => Promise<void>;
  isSaving?: boolean;
}

export const EditPerhitunganModal: React.FC<EditPerhitunganModalProps> = ({
  isOpen,
  onClose,
  calculation,
  onSave,
  isSaving = false,
}) => {
  const { user, role } = useAuth();
  const { masterProduk, modalProduk, modalLogo, margin: marginList, users } = useMasterData();

  const [sales, setSales] = useState('');
  const [produk, setProduk] = useState('');
  const [kode, setKode] = useState('');
  const [prosesLogo, setProsesLogo] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [diskon, setDiskon] = useState<number>(0);

  // Custom overrides for admin
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customModalProduk, setCustomModalProduk] = useState<number | null>(null);
  const [customModalLogo, setCustomModalLogo] = useState<number | null>(null);
  const [customMargin, setCustomMargin] = useState<number | null>(null);

  // Sync state when calculation prop opens
  useEffect(() => {
    if (calculation) {
      setSales(role === 'sales' && user?.nama ? user.nama : calculation.sales || '');
      setProduk(calculation.produk || '');
      setKode(calculation.kode || '');
      setProsesLogo(calculation.proses_logo || '');
      setQty(calculation.qty || 0);
      setDiskon(calculation.diskon || 0);
      setIsCustomMode(false);
      setCustomModalProduk(calculation.modal_produk ?? null);
      setCustomModalLogo(calculation.modal_logo ?? null);
      setCustomMargin(calculation.margin ?? null);
    }
  }, [calculation, user, role]);

  // Dynamic Dropdown Options
  const productOptions = useMemo(() => {
    const fromMaster = masterProduk.map(p => p.nama_produk);
    const fromModal = modalProduk.map(m => m.produk);
    const unique = Array.from(new Set([...fromMaster, ...fromModal])).filter(Boolean);
    if (unique.length === 0 && calculation?.produk) {
      return [{ label: calculation.produk, value: calculation.produk }];
    }
    return unique.map(p => ({ label: p, value: p }));
  }, [masterProduk, modalProduk, calculation]);

  const kodeOptions = useMemo(() => {
    if (!produk) return [];
    const prodNorm = (produk || '').toLowerCase().trim();
    const filtered = modalProduk.filter(m => (m.produk || '').toLowerCase().trim() === prodNorm);
    const unique = Array.from(new Set(filtered.map(m => m.kode || ''))).filter(Boolean);
    return unique.map(k => ({ label: k, value: k }));
  }, [produk, modalProduk]);

  const prosesLogoOptions = useMemo(() => {
    if (!produk) return [];
    const prodNorm = (produk || '').toLowerCase().trim();
    const filtered = modalLogo.filter(l => (l.produk || '').toLowerCase().trim() === prodNorm);
    let unique = Array.from(new Set(filtered.map(l => l.proses_logo))).filter(Boolean);
    if (unique.length === 0) {
      unique = Array.from(new Set(modalLogo.map(l => l.proses_logo))).filter(Boolean);
    }
    return unique.map(pl => ({ label: pl, value: pl }));
  }, [produk, modalLogo]);

  // Handle Product Change
  const handleProductChange = (newProduct: string) => {
    setProduk(newProduct);
    const prodNorm = (newProduct || '').toLowerCase().trim();
    const kodes = modalProduk.filter(m => (m.produk || '').toLowerCase().trim() === prodNorm);
    const logos = modalLogo.filter(l => (l.produk || '').toLowerCase().trim() === prodNorm);
    if (kodes.length > 0) {
      setKode(kodes[0].kode || '');
    } else {
      setKode('');
    }
    if (logos.length > 0) {
      setProsesLogo(logos[0].proses_logo || '');
    }
  };

  // Real-Time Pricing Engine Recalculation
  const pricingResult = useMemo(() => {
    return calculatePricingEngine(
      {
        produk,
        kode,
        proses_logo: prosesLogo,
        qty: qty || 1,
        diskonPersen: 0,
        customModalProduk: isCustomMode && customModalProduk !== null ? customModalProduk : undefined,
        customModalLogo: isCustomMode && customModalLogo !== null ? customModalLogo : undefined,
        customMargin: isCustomMode && customMargin !== null ? customMargin : undefined,
      },
      modalProduk,
      modalLogo,
      marginList
    );
  }, [
    produk,
    kode,
    prosesLogo,
    qty,
    isCustomMode,
    customModalProduk,
    customModalLogo,
    customMargin,
    modalProduk,
    modalLogo,
    marginList,
  ]);

  if (!calculation) return null;

  const isSalesRole = role === 'sales';
  const hargaJualUnit = pricingResult.hargaJualKotorUnit;
  const totalHargaJualKotor = hargaJualUnit * (qty || 0);
  const hargaJualNet = Math.max(0, totalHargaJualKotor - (diskon || 0));

  const handleResetToAutoCalculation = () => {
    setIsCustomMode(false);
    setCustomModalProduk(null);
    setCustomModalLogo(null);
    setCustomMargin(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculation) return;

    const updates: Partial<Perhitungan> = {
      sales,
      produk,
      kode,
      proses_logo: prosesLogo,
      qty: Math.max(1, qty),
      diskon: Math.max(0, diskon),
      harga_jual: hargaJualUnit,
      total_harga_jual: totalHargaJualKotor,
      harga_jual_net: hargaJualNet,
      modal_produk: pricingResult.modalProdukUnit,
      modal_logo: pricingResult.modalLogoUnit,
      margin: pricingResult.marginPersen,
    };

    await onSave(calculation.id, updates);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Kalkulasi Harga"
      subtitle="Perbarui produk, kuantiti, atau diskon dengan kalkulasi otomatis dari master data."
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={handleFormSubmit}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Perubahan
          </Button>
        </div>
      }
    >
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        {/* Tier badge indicator */}
        <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers className="w-4 h-4 text-amber-500" />
            Tier Skala Master Data:
          </span>
          <span className="font-bold font-mono px-2 py-0.5 bg-amber-500 text-white rounded-md">
            {pricingResult.closestTier} pcs
          </span>
        </div>

        {/* Row 1: Sales PIC & Produk Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Sales In-Charge (PIC)"
            options={users.map((u: UserSales) => ({ label: u.nama === user?.nama ? `${u.nama} (Akun Anda)` : u.nama, value: u.nama }))}
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            disabled={role === 'sales'}
          />
          <Select
            label="Pilih Produk (Master)"
            options={productOptions}
            value={produk}
            onChange={(e) => handleProductChange(e.target.value)}
            placeholder="-- Pilih Produk --"
            required
          />
        </div>

        {/* Row 2: Kode Dropdown & Proses Logo Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kodeOptions.length > 0 ? (
            <Select
              label="Kode / Model Produk"
              options={kodeOptions}
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              placeholder="-- Pilih Kode --"
            />
          ) : (
            <Input
              label="Kode / Model Produk"
              placeholder="Contoh: T-01, MUG-02"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
            />
          )}

          {prosesLogoOptions.length > 0 ? (
            <Select
              label="Proses Logo"
              options={prosesLogoOptions}
              value={prosesLogo}
              onChange={(e) => setProsesLogo(e.target.value)}
              placeholder="-- Pilih Proses Logo --"
            />
          ) : (
            <Input
              label="Proses Logo"
              placeholder="Contoh: Grafir Laser 1 Sisi"
              value={prosesLogo}
              onChange={(e) => setProsesLogo(e.target.value)}
            />
          )}
        </div>

        {/* Row 3: Qty & Diskon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Jumlah / Qty (Pcs)"
            type="number"
            min={1}
            value={qty || ''}
            onChange={(e) => setQty(Math.max(0, parseInt(e.target.value) || 0))}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diskon Global (Rp)
            </label>
            <input
              type="number"
              min={0}
              max={totalHargaJualKotor}
              value={diskon || ''}
              onChange={(e) => setDiskon(Math.min(totalHargaJualKotor, Math.max(0, parseInt(e.target.value) || 0)))}
              placeholder="0"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Modal & Margin Breakdown (Only for Admin/Owner) */}
        {!isSalesRole && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-500" />
                Komponen Modal & Margin (Akses Admin)
              </h4>
              <button
                type="button"
                onClick={handleResetToAutoCalculation}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                title="Ambil nilai standar dari master spreadsheet"
              >
                <RefreshCw className="w-3 h-3" />
                Hitung Ulang Otomatis
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Modal Produk (Rp)"
                type="number"
                min={0}
                value={isCustomMode ? (customModalProduk ?? '') : pricingResult.modalProdukUnit}
                onChange={(e) => {
                  setIsCustomMode(true);
                  setCustomModalProduk(Math.max(0, parseInt(e.target.value) || 0));
                }}
              />
              <Input
                label="Modal Logo (Rp)"
                type="number"
                min={0}
                value={isCustomMode ? (customModalLogo ?? '') : pricingResult.modalLogoUnit}
                onChange={(e) => {
                  setIsCustomMode(true);
                  setCustomModalLogo(Math.max(0, parseInt(e.target.value) || 0));
                }}
              />
              <Input
                label="Margin Target (%)"
                type="number"
                min={0}
                max={99}
                value={isCustomMode ? (customMargin ?? '') : Math.round(pricingResult.marginPersen)}
                onChange={(e) => {
                  setIsCustomMode(true);
                  setCustomMargin(Math.max(0, parseInt(e.target.value) || 0));
                }}
              />
            </div>
          </div>
        )}

        {/* Live Calculation Result Summary Card */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl border border-amber-200/80 dark:border-slate-700 flex flex-col gap-2">
          {!isSalesRole && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1.5 border-b border-amber-200/60 dark:border-slate-700/60">
              <span>Total Modal / Unit:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {formatRupiah(pricingResult.totalModalUnit)} (Margin {pricingResult.marginPersen.toFixed(1)}%)
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Harga Satuan (Kotor):</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {formatRupiah(hargaJualUnit)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Subtotal Kotor ({formatNumber(qty)} pcs):</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {formatRupiah(totalHargaJualKotor)}
            </span>
          </div>
          {diskon > 0 && (
            <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <span>Potongan Diskon:</span>
              <span className="font-mono">-{formatRupiah(diskon)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-amber-200 dark:border-slate-700 flex items-center justify-between font-bold text-sm">
            <span className="text-slate-900 dark:text-white">Grand Total Net:</span>
            <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
              {formatRupiah(hargaJualNet)}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};


import { useState, useMemo, useEffect } from 'react';
import { calculateMultiProductOrder } from '../utils/calcEngine';
import { MultiProductItem, MultiProductOrderSummary } from '../types/pricing.types';
import { useMasterData } from './useMasterData';

/**
 * Manual Calculator Item — semua nilai modal & margin diisi manual
 */
export interface ManualItem {
  id: string;
  namaProduk: string;    // Free text, tidak dari dropdown
  kode: string;          // Optional
  prosesLogo: string;    // Free text
  qty: number;
  modalProduk: number;   // Manual
  modalLogo: number;     // Manual
  marginType: 'multiplier' | 'persen'; // Mode margin
  marginValue: number;   // Multiplier (1.70) atau Persen (35)
  diskonPersen: number;
  // Calculated
  totalModal?: number;
  hargaJualUnit?: number;
  hargaJualNetUnit?: number;
  totalHargaJualKotor?: number;
  totalHargaJualNet?: number;
  keuntunganTotal?: number;
  marginPersen?: number;
}

function calcItem(item: ManualItem): ManualItem {
  const totalModal = (item.modalProduk || 0) + (item.modalLogo || 0);
  let hargaJualUnit = 0;
  let marginPersen = 0;

  if (item.marginType === 'multiplier') {
    const mult = item.marginValue || 1.5;
    hargaJualUnit = Math.ceil((totalModal * mult) / 100) * 100;
    marginPersen = mult > 0 ? Math.round(((mult - 1) / mult) * 1000) / 10 : 0;
  } else {
    const pct = item.marginValue || 25;
    const factor = 1 - pct / 100;
    hargaJualUnit = factor > 0 ? Math.ceil((totalModal / factor) / 100) * 100 : Math.ceil(totalModal * 1.35 / 100) * 100;
    marginPersen = pct;
  }

  if (totalModal === 0) hargaJualUnit = 0;

  const diskon = Math.max(0, Math.min(100, item.diskonPersen || 0));
  const diskonNominalUnit = Math.round(hargaJualUnit * (diskon / 100));
  const hargaJualNetUnit = hargaJualUnit - diskonNominalUnit;
  const qty = item.qty || 1;
  const totalHargaJualKotor = hargaJualUnit * qty;
  const totalHargaJualNet = hargaJualNetUnit * qty;
  const keuntunganTotal = totalHargaJualNet - totalModal * qty;

  return {
    ...item,
    totalModal,
    hargaJualUnit,
    hargaJualNetUnit,
    totalHargaJualKotor,
    totalHargaJualNet,
    keuntunganTotal,
    marginPersen,
  };
}

export function useManualKalkulator() {
  const { users, brands } = useMasterData();

  const [sales, setSales] = useState<string>('');
  const [namaPt, setNamaPt] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [focusedItemId, setFocusedItemId] = useState<string>('mitem-1');

  const defaultItem = (): ManualItem => ({
    id: `mitem-${Date.now()}`,
    namaProduk: '',
    kode: '',
    prosesLogo: '',
    qty: 100,
    modalProduk: 0,
    modalLogo: 0,
    marginType: 'multiplier',
    marginValue: 1.6,
    diskonPersen: 0,
  });

  const [items, setItems] = useState<ManualItem[]>([
    {
      id: 'mitem-1',
      namaProduk: '',
      kode: '',
      prosesLogo: '',
      qty: 100,
      modalProduk: 0,
      modalLogo: 0,
      marginType: 'multiplier',
      marginValue: 1.6,
      diskonPersen: 0,
    }
  ]);

  // Auto-set defaults when master loads
  useEffect(() => {
    if (!sales && users.length > 0) setSales(users[0].nama);
    if (!brand && brands.length > 0) setBrand(brands[0].nama_brand);
  }, [users, brands]);

  // Calculated items (live)
  const calculatedItems = useMemo(() => items.map(it => calcItem(it)), [items]);

  // Order Summary
  const orderSummary = useMemo(() => {
    let totalPcs = 0;
    let totalModal = 0;
    let totalHargaJualKotor = 0;
    let totalDiskon = 0;
    let totalHargaJualNet = 0;
    let totalKeuntungan = 0;

    calculatedItems.forEach(it => {
      totalPcs += it.qty;
      totalModal += (it.totalModal || 0) * it.qty;
      totalHargaJualKotor += it.totalHargaJualKotor || 0;
      totalDiskon += ((it.hargaJualUnit || 0) - (it.hargaJualNetUnit || 0)) * it.qty;
      totalHargaJualNet += it.totalHargaJualNet || 0;
      totalKeuntungan += it.keuntunganTotal || 0;
    });

    const avgMarginPersen = totalHargaJualNet > 0
      ? Math.round(((totalKeuntungan / totalHargaJualNet) * 100) * 10) / 10
      : 0;

    return {
      totalItems: calculatedItems.length,
      totalPcs,
      totalModal,
      totalHargaJualKotor,
      totalDiskon,
      totalHargaJualNet,
      totalKeuntungan,
      avgMarginPersen,
      sales,
    };
  }, [calculatedItems, sales]);

  const focusedItem = useMemo(
    () => calculatedItems.find(it => it.id === focusedItemId) || calculatedItems[0],
    [calculatedItems, focusedItemId]
  );

  const addItem = () => {
    const item = defaultItem();
    setItems(prev => [...prev, item]);
    setFocusedItemId(item.id);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(it => it.id !== id));
    if (focusedItemId === id) {
      const remaining = items.filter(it => it.id !== id);
      if (remaining.length > 0) setFocusedItemId(remaining[0].id);
    }
  };

  const duplicateItem = (id: string) => {
    const target = items.find(it => it.id === id);
    if (!target) return;
    const newId = `mitem-${Date.now()}`;
    setItems(prev => [...prev, { ...target, id: newId }]);
    setFocusedItemId(newId);
  };

  const updateItem = (id: string, partial: Partial<ManualItem>) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...partial } : it)));
  };

  return {
    items: calculatedItems,
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
  };
}

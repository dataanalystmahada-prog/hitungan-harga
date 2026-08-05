import { useState, useMemo, useEffect } from 'react';
import { MultiProductItem, MultiProductOrderSummary, QuantityTier } from '../types/pricing.types';
import { calculateMultiProductOrder } from '../utils/calcEngine';
import { useMasterData } from './useMasterData';
import { ModalProduk, ModalLogo } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';

export function useMultiKalkulator() {
  const { masterProduk, modalProduk, modalLogo, margin, users, brands } = useMasterData();
  const { user } = useAuth();

  const [sales, setSales] = useState<string>(user?.nama || '');
  const [namaPt, setNamaPt] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [focusedItemId, setFocusedItemId] = useState<string>('item-1');

  // Initial Multi-Item List
  const [items, setItems] = useState<MultiProductItem[]>([
    {
      id: 'item-1',
      produk: '',
      kode: '',
      proses_logo: '',
      qty: 0,
      diskonPersen: 0,
    }
  ]);

  // Set default initial values when master data is loaded or user changes
  useEffect(() => {
    if (user?.nama) {
      setSales(user.nama);
    } else if (!sales && users.length > 0) {
      setSales(users[0]?.nama || '');
    }

    if (masterProduk.length > 0 && (!items[0]?.produk || items[0].produk === '')) {
      const defaultProd = masterProduk[0]?.nama_produk || '';
      const prodNorm = (defaultProd || '').toLowerCase().trim();
      const kodes = modalProduk.filter(m => (m.produk || '').toLowerCase().trim() === prodNorm);
      const logos = modalLogo.filter(l => (l.produk || '').toLowerCase().trim() === prodNorm);

      setItems([
        {
          id: 'item-1',
          produk: defaultProd,
          kode: kodes.length > 0 ? (kodes[0].kode || '') : '',
          proses_logo: logos.length > 0 ? (logos[0].proses_logo || '') : '',
          qty: 0,
          diskonPersen: 0,
        }
      ]);
    }

    if (!brand && brands.length > 0) {
      setBrand(brands[0]?.nama_brand || '');
    }
  }, [user, masterProduk, modalProduk, modalLogo, users, brands]);

  // Helper: Get available Kodes for a product
  const getAvailableKodes = (productName: string): { kode: string; harga: number }[] => {
    if (!productName) return [];
    const prodNorm = (productName || '').toLowerCase().trim();
    return modalProduk
      .filter(m => (m.produk || '').toLowerCase().trim() === prodNorm)
      .map(m => ({ kode: m.kode || m.id, harga: Number(m.harga_modal) || 0 }));
  };

  // Helper: Get available Logos for a product
  const getAvailableLogos = (productName: string): string[] => {
    if (!productName) return [];
    const prodNorm = (productName || '').toLowerCase().trim();
    return Array.from(
      new Set(
        modalLogo
          .filter(l => (l.produk || '').toLowerCase().trim() === prodNorm)
          .map(l => l.proses_logo)
          .filter(Boolean)
      )
    );
  };

  // Add Item
  const addItem = () => {
    const defaultProd = masterProduk.length > 0 ? masterProduk[0].nama_produk : '';
    const kodes = getAvailableKodes(defaultProd);
    const logos = getAvailableLogos(defaultProd);

    const newItemId = `item-${Date.now()}`;
    const newItem: MultiProductItem = {
      id: newItemId,
      produk: defaultProd,
      kode: kodes.length > 0 ? kodes[0].kode : '',
      proses_logo: logos.length > 0 ? logos[0] : '',
      qty: 0,
      diskonPersen: 0,
    };

    setItems(prev => [...prev, newItem]);
    setFocusedItemId(newItemId);
  };

  // Remove Item
  const removeItem = (id: string) => {
    if (items.length <= 1) return; // Keep at least 1 item
    setItems(prev => prev.filter(it => it.id !== id));
    if (focusedItemId === id) {
      const remaining = items.filter(it => it.id !== id);
      if (remaining.length > 0) setFocusedItemId(remaining[0].id);
    }
  };

  // Duplicate Item
  const duplicateItem = (id: string) => {
    const target = items.find(it => it.id === id);
    if (!target) return;
    const duplicatedId = `item-${Date.now()}`;
    const duplicated: MultiProductItem = {
      ...target,
      id: duplicatedId
    };
    setItems(prev => [...prev, duplicated]);
    setFocusedItemId(duplicatedId);
  };

  // Update specific item field
  const updateItem = (id: string, partial: Partial<MultiProductItem>) => {
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, ...partial } : it))
    );
  };

  // Handle Product Change for an item
  const handleItemProductChange = (id: string, newProduct: string) => {
    const kodes = getAvailableKodes(newProduct);
    const logos = getAvailableLogos(newProduct);

    setItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it;
        return {
          ...it,
          produk: newProduct,
          kode: kodes.length > 0 ? kodes[0].kode : '',
          proses_logo: logos.length > 0 ? logos[0] : '',
          customModalProduk: undefined,
          customModalLogo: undefined,
          customMargin: undefined,
        };
      })
    );
  };

  // Live order summary
  const orderSummary: MultiProductOrderSummary = useMemo(() => {
    return calculateMultiProductOrder(items, sales, modalProduk, modalLogo, margin);
  }, [items, sales, modalProduk, modalLogo, margin]);

  // Focused item for detailed tier comparison
  const focusedItem = useMemo(() => {
    return orderSummary.items.find(it => it.id === focusedItemId) || orderSummary.items[0];
  }, [orderSummary, focusedItemId]);

  return {
    items: orderSummary.items,
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
  };
}

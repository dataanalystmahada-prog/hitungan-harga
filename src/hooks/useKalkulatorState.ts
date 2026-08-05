import { useState, useMemo, useEffect } from 'react';
import { CalculationInput } from '../types/pricing.types';
import { calculatePricingEngine } from '../utils/calcEngine';
import { useMasterData } from './useMasterData';

export function useKalkulatorState() {
  const { masterProduk, modalProduk, modalLogo, margin, users } = useMasterData();

  const [input, setInput] = useState<CalculationInput>({
    produk: '',
    kode: '',
    proses_logo: '',
    qty: 50,
    sales: '',
    diskonPersen: 0,
    customModalProduk: undefined,
    customModalLogo: undefined,
    customMargin: undefined,
  });

  // Auto-select initial defaults when master data loads
  useEffect(() => {
    if (!input.produk && masterProduk.length > 0) {
      const defaultProd = masterProduk[0].nama_produk;
      const foundModal = modalProduk.find(m => m.produk === defaultProd);
      const availableLogos = modalLogo.filter(l => l.produk === defaultProd);

      setInput(prev => ({
        ...prev,
        produk: defaultProd,
        kode: foundModal?.kode || '',
        proses_logo: availableLogos.length > 0 ? availableLogos[0].proses_logo : '',
      }));
    }

    if (!input.sales && users.length > 0) {
      setInput(prev => ({ ...prev, sales: users[0].nama }));
    }
  }, [masterProduk, modalProduk, modalLogo, users, input.produk, input.sales]);

  // When product changes, sync kode and default logo process
  const handleProductChange = (newProduct: string) => {
    const foundModal = modalProduk.find(m => m.produk === newProduct);
    const availableLogos = modalLogo.filter(l => l.produk === newProduct);

    setInput(prev => ({
      ...prev,
      produk: newProduct,
      kode: foundModal?.kode || '',
      proses_logo: availableLogos.length > 0 ? availableLogos[0].proses_logo : '',
      customModalProduk: undefined,
      customModalLogo: undefined,
      customMargin: undefined,
    }));
  };

  const calculationResult = useMemo(() => {
    return calculatePricingEngine(input, modalProduk, modalLogo, margin);
  }, [input, modalProduk, modalLogo, margin]);

  const availableLogos = useMemo(() => {
    if (!input.produk) return [];
    return modalLogo.filter(l => l.produk.toLowerCase() === input.produk.toLowerCase());
  }, [input.produk, modalLogo]);

  return {
    input,
    setInput,
    handleProductChange,
    calculationResult,
    availableLogos,
    masterProduk,
    users,
  };
}

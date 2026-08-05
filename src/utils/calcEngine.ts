import { ModalProduk, ModalLogo, Margin } from '../types/database.types';
import { 
  CalculationInput, 
  CalculationResult, 
  QuantityTier, 
  MultiProductItem, 
  MultiProductOrderSummary 
} from '../types/pricing.types';

export const QUANTITY_TIERS: QuantityTier[] = [12, 24, 50, 75, 100, 150, 200, 300, 500];

/**
 * Finds the appropriate pricing tier based on order quantity.
 * If qty < 12, uses 12. If qty >= 500, uses 500.
 * Otherwise selects the highest tier that is <= qty.
 */
export function findClosestTier(qty: number): QuantityTier {
  if (qty <= 12) return 12;
  if (qty >= 500) return 500;
  
  for (let i = QUANTITY_TIERS.length - 1; i >= 0; i--) {
    if (qty >= QUANTITY_TIERS[i]) {
      return QUANTITY_TIERS[i];
    }
  }
  return 12;
}

/**
 * Helper to clean numeric values from string like "Rp12.000" or "1.70"
 */
export function parseSpreadsheetNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Get tier column key (e.g. qty_100)
 */
export function getTierKey(tier: QuantityTier): keyof ModalLogo & keyof Margin {
  return `qty_${tier}` as any;
}

/**
 * Enterprise Single Product Pricing Engine
 */
export function calculatePricingEngine(
  input: CalculationInput,
  modalProdukList: ModalProduk[] = [],
  modalLogoList: ModalLogo[] = [],
  marginList: Margin[] = []
): CalculationResult {
  const tier = findClosestTier(input.qty || 12);
  const tierKey = getTierKey(tier);

  // 1. Resolve Modal Produk (matching by produk and optional kode)
  let modalProdukUnit = input.customModalProduk !== undefined ? input.customModalProduk : 0;
  if (modalProdukUnit === 0 && input.produk) {
    const inputProd = (input.produk || '').toLowerCase().trim();
    const inputKode = (input.kode || '').toLowerCase().trim();
    let found: ModalProduk | undefined;
    if (inputKode) {
      found = modalProdukList.find(
        m => (m.produk || '').toLowerCase().trim() === inputProd && 
             (m.kode || '').toLowerCase().trim() === inputKode
      );
    }
    if (!found) {
      found = modalProdukList.find(m => (m.produk || '').toLowerCase().trim() === inputProd);
    }
    if (found) {
      modalProdukUnit = parseSpreadsheetNumber(found.harga_modal);
    }
  }

  // 2. Resolve Modal Logo from Matrix
  let modalLogoUnit = input.customModalLogo !== undefined ? input.customModalLogo : 0;
  if (modalLogoUnit === 0 && input.produk && input.proses_logo) {
    const inputProd = (input.produk || '').toLowerCase().trim();
    const inputLogo = (input.proses_logo || '').toLowerCase().trim();
    const foundLogo = modalLogoList.find(
      l => (l.produk || '').toLowerCase().trim() === inputProd &&
           (l.proses_logo || '').toLowerCase().trim() === inputLogo
    );
    if (foundLogo && foundLogo[tierKey] !== undefined) {
      modalLogoUnit = parseSpreadsheetNumber(foundLogo[tierKey]);
    }
  }

  // 3. Resolve Margin % / Multiplier from Matrix
  let marginRawValue = input.customMargin !== undefined ? input.customMargin : 0;
  if (marginRawValue === 0 && input.produk) {
    const inputProd = (input.produk || '').toLowerCase().trim();
    const inputLogo = (input.proses_logo || '').toLowerCase().trim();
    // Try matching product & logo, or fallback to product only
    let foundMargin = marginList.find(
      m => (m.produk || '').toLowerCase().trim() === inputProd &&
           (m.proses_logo ? (m.proses_logo || '').toLowerCase().trim() === inputLogo : true)
    );
    if (!foundMargin) {
      foundMargin = marginList.find(m => (m.produk || '').toLowerCase().trim() === inputProd);
    }
    if (foundMargin && foundMargin[tierKey] !== undefined) {
      marginRawValue = parseSpreadsheetNumber(foundMargin[tierKey]);
    }
  }

  const totalModalUnit = modalProdukUnit + modalLogoUnit;

  // 4. Calculate Selling Price based on Multiplier vs Percentage
  let marginPersen = 25.0;
  let rawHargaJualUnit = 0;

  if (marginRawValue >= 1.05 && marginRawValue <= 5.0) {
    // Multiplier format (e.g. 1.70, 1.60, 1.54, 1.47, 1.37)
    rawHargaJualUnit = totalModalUnit * marginRawValue;
    marginPersen = Math.round(((marginRawValue - 1) / marginRawValue) * 1000) / 10;
  } else if (marginRawValue > 0 && marginRawValue < 1.0) {
    // Decimal percentage (e.g. 0.35)
    const factor = 1 - marginRawValue;
    rawHargaJualUnit = factor > 0 ? (totalModalUnit / factor) : (totalModalUnit * 1.3);
    marginPersen = Math.round(marginRawValue * 1000) / 10;
  } else if (marginRawValue >= 5.0) {
    // Percentage format (e.g. 25%, 35%, 40%)
    marginPersen = marginRawValue;
    const factor = 1 - (marginRawValue / 100);
    rawHargaJualUnit = factor > 0 ? (totalModalUnit / factor) : (totalModalUnit * 1.3);
  } else {
    // Standard default
    marginPersen = 25.0;
    rawHargaJualUnit = totalModalUnit / 0.75;
  }

  // If modal is 0, price is 0
  if (totalModalUnit === 0) {
    rawHargaJualUnit = 0;
  }

  // Round to nearest 100 for clean enterprise pricing
  const hargaJualKotorUnit = Math.ceil(rawHargaJualUnit / 100) * 100;
  const totalHargaJualKotor = hargaJualKotorUnit * (input.qty || 1);

  // Discount
  const diskonPersen = Math.max(0, Math.min(100, input.diskonPersen || 0));
  const diskonNominalUnit = Math.round(hargaJualKotorUnit * (diskonPersen / 100));
  const hargaJualNetUnit = hargaJualKotorUnit - diskonNominalUnit;
  const totalHargaJualNet = hargaJualNetUnit * (input.qty || 1);

  // Total Profit
  const keuntunganTotal = totalHargaJualNet - (totalModalUnit * (input.qty || 1));

  return {
    modalProdukUnit,
    modalLogoUnit,
    totalModalUnit,
    marginPersen,
    hargaJualKotorUnit,
    totalHargaJualKotor,
    diskonPersen,
    diskonNominalUnit,
    hargaJualNetUnit,
    totalHargaJualNet,
    keuntunganTotal,
    closestTier: tier
  };
}

/**
 * Enterprise Multi-Product Order Calculator
 */
export function calculateMultiProductOrder(
  items: MultiProductItem[],
  sales: string = 'Sales Admin',
  modalProdukList: ModalProduk[] = [],
  modalLogoList: ModalLogo[] = [],
  marginList: Margin[] = []
): MultiProductOrderSummary {
  const calculatedItems = items.map(item => {
    const calc = calculatePricingEngine(
      {
        produk: item.produk,
        kode: item.kode,
        proses_logo: item.proses_logo,
        qty: item.qty,
        sales: sales,
        diskonPersen: item.diskonPersen || 0,
        customModalProduk: item.customModalProduk,
        customModalLogo: item.customModalLogo,
        customMargin: item.customMargin
      },
      modalProdukList,
      modalLogoList,
      marginList
    );
    return {
      ...item,
      calculation: calc
    };
  });

  let totalPcs = 0;
  let totalModal = 0;
  let totalHargaJualKotor = 0;
  let totalDiskonNominal = 0;
  let totalHargaJualNet = 0;
  let totalKeuntungan = 0;

  calculatedItems.forEach(item => {
    const calc = item.calculation;
    if (calc) {
      totalPcs += item.qty;
      totalModal += calc.totalModalUnit * item.qty;
      totalHargaJualKotor += calc.totalHargaJualKotor;
      totalDiskonNominal += (calc.diskonNominalUnit * item.qty);
      totalHargaJualNet += calc.totalHargaJualNet;
      totalKeuntungan += calc.keuntunganTotal;
    }
  });

  const avgMarginPersen = totalHargaJualNet > 0
    ? Math.round(((totalKeuntungan / totalHargaJualNet) * 100) * 10) / 10
    : 0;

  return {
    items: calculatedItems,
    totalItems: calculatedItems.length,
    totalPcs,
    totalModal,
    totalHargaJualKotor,
    totalDiskonNominal,
    totalHargaJualNet,
    totalKeuntungan,
    avgMarginPersen,
    sales
  };
}

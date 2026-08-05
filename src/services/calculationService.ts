import { PerhitunganRepository } from '../repositories/perhitunganRepository';
import { MasterDataRepository } from '../repositories/masterDataRepository';
import { CalculationInput, CalculationResult } from '../types/pricing.types';
import { calculatePricingEngine } from '../utils/calcEngine';
import { Perhitungan } from '../types/database.types';
import { QueryParams, PaginatedApiResponse } from '../types/api.types';

export class CalculationService {
  /**
   * Fetch calculation records with server-side pagination & filter
   */
  public static async getCalculations(params: QueryParams): Promise<PaginatedApiResponse<Perhitungan>> {
    return PerhitunganRepository.getPaginated(params);
  }

  /**
   * Calculate live pricing by loading active master matrices
   */
  public static async calculateLive(input: CalculationInput): Promise<{
    result: CalculationResult;
    perhitunganPayload: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>;
  }> {
    const [modalProduk, modalLogo, margin] = await Promise.all([
      MasterDataRepository.getModalProduk(),
      MasterDataRepository.getModalLogo(),
      MasterDataRepository.getMargin()
    ]);

    const result = calculatePricingEngine(input, modalProduk, modalLogo, margin);

    const now = new Date();
    const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const perhitunganPayload: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'> = {
      id: `CALC-${Date.now()}`,
      tanggal: dateFormatted,
      sales: input.sales || 'Sales Admin',
      produk: input.produk,
      kode: input.kode || '',
      proses_logo: input.proses_logo,
      qty: input.qty,
      modal_produk: result.modalProdukUnit,
      modal_logo: result.modalLogoUnit,
      margin: result.marginPersen,
      harga_jual: result.hargaJualKotorUnit,
      total_harga_jual: result.totalHargaJualKotor,
      harga_jual_net: result.totalHargaJualNet,
      diskon: result.diskonPersen,
    };

    return { result, perhitunganPayload };
  }

  /**
   * Save calculation result to database
   */
  public static async saveCalculation(payload: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>): Promise<Perhitungan> {
    return PerhitunganRepository.create(payload);
  }

  /**
   * Save batch multi-product calculations to database
   */
  public static async saveBatchCalculations(payloads: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>[]): Promise<Perhitungan[]> {
    return PerhitunganRepository.createBatch(payloads);
  }

  /**
   * Update calculation record in database
   */
  public static async updateCalculation(id: string, updates: Partial<Perhitungan>): Promise<Perhitungan> {
    return PerhitunganRepository.update(id, updates);
  }

  /**
   * Delete calculation record
   */
  public static async deleteCalculation(id: string): Promise<boolean> {
    return PerhitunganRepository.delete(id);
  }

  /**
   * Delete multiple calculation records (Batch)
   */
  public static async deleteBatchCalculations(ids: string[]): Promise<boolean> {
    return PerhitunganRepository.deleteBatch(ids);
  }
}

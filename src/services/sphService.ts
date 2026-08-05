import { SPHRepository } from '../repositories/sphRepository';
import { SPH, SPHStatus } from '../types/database.types';
import { CreateSPHInput } from '../types/pricing.types';
import { QueryParams, PaginatedApiResponse } from '../types/api.types';

export class SPHService {
  public static async getSPHList(params: QueryParams): Promise<PaginatedApiResponse<SPH>> {
    return SPHRepository.getPaginated(params);
  }

  public static async createSPH(input: CreateSPHInput): Promise<SPH> {
    const now = new Date();
    const dateFormatted = input.tanggal || `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const generatedId = `SPH-${Date.now()}`;
    const brandCode = input.brand.includes('Amanah') ? 'AAI' : (input.brand.includes('Nusantara') ? 'NGE' : 'ENT');
    const noSPH = input.no_sph || `SPH/${brandCode}/${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`;

    const payload: Omit<SPH, 'created_at' | 'updated_at' | 'synced_at'> = {
      id: generatedId,
      tanggal: dateFormatted,
      brand: input.brand,
      no_sph: noSPH,
      nama_pt: input.nama_pt,
      deskripsi: input.deskripsi,
      produk: input.produk,
      qty: input.qty,
      harga_jual: input.harga_jual,
      ref_id: input.ref_id || '',
      sales: input.sales,
      status_sph: input.status_sph || 'Draft',
      keterangan: input.keterangan || '',
      diskon: input.diskon || 0,
      harga_jual_akhir: input.harga_jual_akhir,
    };

    return SPHRepository.create(payload);
  }

  public static async updateStatus(id: string, status: SPHStatus): Promise<boolean> {
    return SPHRepository.updateStatus(id, status);
  }

  public static async deleteSPH(id: string): Promise<boolean> {
    return SPHRepository.delete(id);
  }
}

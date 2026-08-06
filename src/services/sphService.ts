import { SPHRepository } from '../repositories/sphRepository';
import { SPH, SPHStatus } from '../types/database.types';
import { CreateSPHInput } from '../types/pricing.types';
import { QueryParams, PaginatedApiResponse } from '../types/api.types';

export class SPHService {
  public static async getSPHList(params: QueryParams): Promise<PaginatedApiResponse<SPH>> {
    return SPHRepository.getPaginated(params);
  }

  public static async createSPH(input: CreateSPHInput): Promise<SPH> {
    if (input.id) {
      return this.updateSPH(input.id, input);
    }

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
      status_sph: (input.status_sph as SPHStatus) || 'Draft',
      keterangan: input.keterangan || '',
      diskon: input.diskon || 0,
      ongkir: input.ongkir || 0,
      ppn: input.ppn || 0,
      is_ppn: input.is_ppn || false,
      show_diskon: input.show_diskon !== undefined ? input.show_diskon : true,
      show_ppn: input.show_ppn !== undefined ? input.show_ppn : true,
      show_ongkir: input.show_ongkir !== undefined ? input.show_ongkir : true,
      show_keterangan: input.show_keterangan !== undefined ? input.show_keterangan : true,
      harga_jual_akhir: input.harga_jual_akhir,
      items: input.items,
    };

    return SPHRepository.create(payload);
  }

  public static async updateSPH(id: string, input: Partial<CreateSPHInput>): Promise<SPH> {
    const payload: Partial<SPH> = {
      ...(input.tanggal && { tanggal: input.tanggal }),
      ...(input.brand && { brand: input.brand }),
      ...(input.no_sph && { no_sph: input.no_sph }),
      ...(input.nama_pt !== undefined && { nama_pt: input.nama_pt }),
      ...(input.deskripsi !== undefined && { deskripsi: input.deskripsi }),
      ...(input.produk && { produk: input.produk }),
      ...(input.qty !== undefined && { qty: input.qty }),
      ...(input.harga_jual !== undefined && { harga_jual: input.harga_jual }),
      ...(input.ref_id !== undefined && { ref_id: input.ref_id }),
      ...(input.sales && { sales: input.sales }),
      ...(input.status_sph && { status_sph: input.status_sph as SPHStatus }),
      ...(input.keterangan !== undefined && { keterangan: input.keterangan }),
      ...(input.diskon !== undefined && { diskon: input.diskon }),
      ...(input.ongkir !== undefined && { ongkir: input.ongkir }),
      ...(input.ppn !== undefined && { ppn: input.ppn }),
      ...(input.is_ppn !== undefined && { is_ppn: input.is_ppn }),
      ...(input.show_diskon !== undefined && { show_diskon: input.show_diskon }),
      ...(input.show_ppn !== undefined && { show_ppn: input.show_ppn }),
      ...(input.show_ongkir !== undefined && { show_ongkir: input.show_ongkir }),
      ...(input.show_keterangan !== undefined && { show_keterangan: input.show_keterangan }),
      ...(input.harga_jual_akhir !== undefined && { harga_jual_akhir: input.harga_jual_akhir }),
      ...(input.items !== undefined && { items: input.items }),
    };

    return SPHRepository.update(id, payload);
  }

  public static async updateStatus(id: string, status: SPHStatus): Promise<boolean> {
    return SPHRepository.updateStatus(id, status);
  }

  public static async deleteSPH(id: string): Promise<boolean> {
    return SPHRepository.delete(id);
  }

  public static async getNextSPHNumber(brandCode: string): Promise<string> {
    return SPHRepository.getNextSequence(brandCode, new Date());
  }
}

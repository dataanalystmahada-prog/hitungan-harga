import { BaseRepository } from './baseRepository';
import { 
  MasterProduk, ModalProduk, ModalLogo, Margin, Brand, UserSales, Divisi, Keterangan, PromptLibrary 
} from '../types/database.types';
import { 
  MOCK_MASTER_PRODUK, MOCK_MODAL_PRODUK, MOCK_MODAL_LOGO, MOCK_MARGIN, MOCK_BRANDS, MOCK_USERS, MOCK_DIVISI, MOCK_KETERANGAN, MOCK_PROMPT_LIBRARY 
} from '../services/mockData';
import { supabase, isConfigured } from '../services/supabaseClient';

export class MasterDataRepository extends BaseRepository {
  public static async getMasterProduk(): Promise<MasterProduk[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('produk').select('id, nama_produk').order('nama_produk', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_MASTER_PRODUK;
  }

  public static async getModalProduk(): Promise<ModalProduk[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('modal_produk').select('*').order('produk', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_MODAL_PRODUK;
  }

  public static async getModalLogo(): Promise<ModalLogo[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('modal_logo').select('*').order('produk', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_MODAL_LOGO;
  }

  public static async getMargin(): Promise<Margin[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('margin').select('*').order('produk', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_MARGIN;
  }

  public static async getBrands(): Promise<Brand[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('brands').select('*').order('nama_brand', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_BRANDS;
  }

  public static async getUsers(): Promise<UserSales[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('users').select('*').order('nama', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_USERS;
  }

  public static async getDivisi(): Promise<Divisi[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('divisi').select('*').order('nama_divisi', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_DIVISI;
  }

  public static async getKeterangan(): Promise<Keterangan[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('keterangan').select('*').order('id', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_KETERANGAN;
  }

  public static async getPromptLibrary(): Promise<PromptLibrary[]> {
    if (isConfigured) {
      const { data, error } = await supabase.from('prompt_library').select('*').order('judul', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_PROMPT_LIBRARY;
  }
}

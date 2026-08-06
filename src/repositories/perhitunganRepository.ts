import { BaseRepository } from './baseRepository';
import { Perhitungan } from '../types/database.types';
import { PaginatedApiResponse, QueryParams } from '../types/api.types';
import { generateMockPerhitungan } from '../services/mockData';
import { supabase, isConfigured } from '../services/supabaseClient';

const PERHITUNGAN_CACHE_KEY = 'MAHADA_PERHITUNGAN_META_CACHE';

function getLocalMetaCache(): Record<string, Partial<Perhitungan>> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PERHITUNGAN_CACHE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalMetaCache(id: string, meta: Partial<Perhitungan>) {
  try {
    if (typeof window === 'undefined') return;
    const current = getLocalMetaCache();
    current[id] = { ...(current[id] || {}), ...meta };
    localStorage.setItem(PERHITUNGAN_CACHE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save to local meta cache:', e);
  }
}

function removeLocalMetaCache(ids: string[]) {
  try {
    if (typeof window === 'undefined') return;
    const current = getLocalMetaCache();
    ids.forEach(id => delete current[id]);
    localStorage.setItem(PERHITUNGAN_CACHE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to remove from local meta cache:', e);
  }
}

export class PerhitunganRepository extends BaseRepository {
  private static cachedMock: Perhitungan[] | null = null;

  private static getMockData(): Perhitungan[] {
    if (!this.cachedMock) {
      this.cachedMock = generateMockPerhitungan();
    }
    return this.cachedMock;
  }

  /**
   * Fetch server-side paginated, searched, and filtered perhitungan records
   */
  public static async getPaginated(params: QueryParams): Promise<PaginatedApiResponse<Perhitungan>> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    const fallbackFn = async (): Promise<PaginatedApiResponse<Perhitungan>> => {
      // High-performance In-Memory mock simulation
      let list = [...this.getMockData()];

      // Search
      if (params.search && params.search.trim()) {
        const term = params.search.toLowerCase().trim();
        list = list.filter(
          item =>
            item.produk?.toLowerCase().includes(term) ||
            item.kode?.toLowerCase().includes(term) ||
            item.sales?.toLowerCase().includes(term) ||
            item.nama_pt?.toLowerCase().includes(term) ||
            item.proses_logo?.toLowerCase().includes(term)
        );
      }

      // Filters
      if (params.filters?.sales) {
        list = list.filter(item => item.sales === params.filters?.sales);
      }
      if (params.filters?.produk) {
        list = list.filter(item => item.produk === params.filters?.produk);
      }
      if (params.filters?.proses_logo) {
        list = list.filter(item => item.proses_logo === params.filters?.proses_logo);
      }
      if (params.filters?.nama_pt) {
        list = list.filter(item => item.nama_pt === params.filters?.nama_pt);
      }

      // Sorting
      const sortBy = (params.sortBy || 'created_at') as keyof Perhitungan;
      const sortOrder = params.sortOrder || 'DESC';
      list.sort((a, b) => {
        const valA = a[sortBy] ?? '';
        const valB = b[sortBy] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'ASC' ? valA - valB : valB - valA;
        }
        return sortOrder === 'ASC' 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      });

      const totalFiltered = list.length;
      const offset = (page - 1) * limit;
      const paginatedData = list.slice(offset, offset + limit);

      const totalRevenue = list.reduce((acc, curr) => acc + (curr.total_harga_jual || 0), 0);
      const avgMargin = list.length > 0 ? (list.reduce((acc, curr) => acc + (curr.margin || 0), 0) / list.length) : 0;

      return {
        data: paginatedData,
        pagination: {
          page,
          limit,
          totalRecords: this.getMockData().length,
          filteredRecords: totalFiltered,
          totalPages: Math.ceil(totalFiltered / Math.max(1, limit)),
        },
        metrics: {
          totalRevenue,
          avgMargin: Number(avgMargin.toFixed(2))
        }
      };
    };

    let result: PaginatedApiResponse<Perhitungan>;

    if (isConfigured) {
      try {
        // Direct table query directly reads all columns from PostgreSQL table
        result = await this.fetchPaginated<Perhitungan>('perhitungan', params, '*', fallbackFn);
      } catch (err) {
        // Fallback to RPC if direct table query fails
        result = await this.callRpc<Perhitungan>(
          'fn_query_perhitungan_paginated',
          {
            p_page: page,
            p_limit: limit,
            p_search: params.search || null,
            p_sales: params.filters?.sales || null,
            p_produk: params.filters?.produk || null,
            p_proses_logo: params.filters?.proses_logo || null,
            p_date_start: params.filters?.date_start || null,
            p_date_end: params.filters?.date_end || null,
            p_sort_by: params.sortBy || 'created_at',
            p_sort_order: params.sortOrder || 'DESC'
          },
          fallbackFn
        );
      }
    } else {
      result = await fallbackFn();
    }

    // Hydrate client-side metadata cache (ensures nama_pt and items are never blank)
    const localMeta = getLocalMetaCache();
    const enrichedData = (result.data || []).map(row => {
      const cached = localMeta[row.id];
      return {
        ...row,
        nama_pt: (row.nama_pt || cached?.nama_pt || '').trim(),
        items: row.items || cached?.items,
        ongkir: row.ongkir !== undefined ? row.ongkir : cached?.ongkir,
        ppn: row.ppn !== undefined ? row.ppn : cached?.ppn,
        is_ppn: row.is_ppn !== undefined ? row.is_ppn : cached?.is_ppn,
        show_diskon: row.show_diskon !== undefined ? row.show_diskon : cached?.show_diskon,
        show_ppn: row.show_ppn !== undefined ? row.show_ppn : cached?.show_ppn,
        show_ongkir: row.show_ongkir !== undefined ? row.show_ongkir : cached?.show_ongkir,
      };
    });

    const totalRevenue = enrichedData.reduce((acc, curr) => acc + (curr.total_harga_jual || 0), 0);
    const avgMargin = enrichedData.length > 0
      ? Number((enrichedData.reduce((acc, curr) => acc + (curr.margin || 0), 0) / enrichedData.length).toFixed(2))
      : 0;

    return {
      ...result,
      data: enrichedData,
      metrics: {
        totalRevenue: result.metrics?.totalRevenue ?? totalRevenue,
        avgMargin: result.metrics?.avgMargin ?? avgMargin,
      }
    };
  }

  /**
   * Filter and sanitize payload so only valid table columns are sent to Supabase
   */
  private static sanitize(record: any): Partial<Perhitungan> {
    const allowedKeys: (keyof Perhitungan)[] = [
      'id',
      'tanggal',
      'sales',
      'nama_pt',
      'produk',
      'kode',
      'proses_logo',
      'qty',
      'modal_produk',
      'modal_logo',
      'margin',
      'harga_jual',
      'total_harga_jual',
      'harga_jual_net',
      'diskon',
      'ongkir',
      'ppn',
      'is_ppn',
      'show_diskon',
      'show_ppn',
      'show_ongkir',
      'ref_id',
      'items',
      'created_at',
      'updated_at',
      'synced_at',
    ];

    const clean: any = {};
    for (const key of allowedKeys) {
      if (record[key] !== undefined) {
        clean[key] = record[key];
      }
    }
    return clean;
  }

  /**
   * Helper to strip optional columns if they do not yet exist in Supabase table
   */
  private static stripMissingColumns(record: any): any {
    const fallback = { ...record };
    delete fallback.nama_pt;
    delete fallback.items;
    delete fallback.ref_id;
    delete fallback.ongkir;
    delete fallback.ppn;
    delete fallback.is_ppn;
    delete fallback.show_diskon;
    delete fallback.show_ppn;
    delete fallback.show_ongkir;
    return fallback;
  }

  /**
   * Save a single calculation
   */
  public static async create(record: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>): Promise<Perhitungan> {
    const newRecord: Perhitungan = {
      ...(this.sanitize(record) as any),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    };

    if (newRecord.id) {
      saveLocalMetaCache(newRecord.id, {
        nama_pt: newRecord.nama_pt,
        items: newRecord.items,
        ref_id: newRecord.ref_id,
        ongkir: newRecord.ongkir,
        ppn: newRecord.ppn,
        is_ppn: newRecord.is_ppn,
        show_diskon: newRecord.show_diskon,
        show_ppn: newRecord.show_ppn,
        show_ongkir: newRecord.show_ongkir,
      });
    }

    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('perhitungan').insert(newRecord).select().single();
        if (error) throw error;
        return { ...data, nama_pt: newRecord.nama_pt || data?.nama_pt, items: newRecord.items || data?.items };
      } catch (err: any) {
        // Defensive fallback: if nama_pt or items column doesn't exist in Supabase table
        if (err.message && (err.message.includes('nama_pt') || err.message.includes('items') || err.message.includes('column'))) {
          const stripped = this.stripMissingColumns(newRecord);
          const { data, error } = await supabase.from('perhitungan').insert(stripped).select().single();
          if (error) throw error;
          return { ...data, nama_pt: newRecord.nama_pt, items: newRecord.items };
        }
        throw err;
      }
    }

    // Mock storage
    const mock = this.getMockData();
    mock.unshift(newRecord);
    return newRecord;
  }

  /**
   * Save multiple calculations at once (Batch Multi-Product)
   */
  public static async createBatch(records: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>[]): Promise<Perhitungan[]> {
    const prepared = records.map(r => ({
      ...(this.sanitize(r) as any),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    }));

    prepared.forEach(r => {
      if (r.id) {
        saveLocalMetaCache(r.id, {
          nama_pt: r.nama_pt,
          items: r.items,
          ref_id: r.ref_id,
          ongkir: r.ongkir,
          ppn: r.ppn,
          is_ppn: r.is_ppn,
          show_diskon: r.show_diskon,
          show_ppn: r.show_ppn,
          show_ongkir: r.show_ongkir,
        });
      }
    });

    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('perhitungan').insert(prepared).select();
        if (error) throw error;
        return (data || []).map((d, idx) => ({
          ...d,
          nama_pt: prepared[idx]?.nama_pt || d.nama_pt,
          items: prepared[idx]?.items || d.items,
          ongkir: prepared[idx]?.ongkir ?? d.ongkir,
          ppn: prepared[idx]?.ppn ?? d.ppn,
          is_ppn: prepared[idx]?.is_ppn ?? d.is_ppn,
          show_diskon: prepared[idx]?.show_diskon ?? d.show_diskon,
          show_ppn: prepared[idx]?.show_ppn ?? d.show_ppn,
          show_ongkir: prepared[idx]?.show_ongkir ?? d.show_ongkir,
        }));
      } catch (err: any) {
        if (err.message && (err.message.includes('nama_pt') || err.message.includes('items') || err.message.includes('column'))) {
          const strippedList = prepared.map(p => this.stripMissingColumns(p));
          const { data, error } = await supabase.from('perhitungan').insert(strippedList).select();
          if (error) throw error;
          return (data || []).map((d, idx) => ({
            ...d,
            nama_pt: prepared[idx]?.nama_pt,
            items: prepared[idx]?.items,
            ongkir: prepared[idx]?.ongkir,
            ppn: prepared[idx]?.ppn,
            is_ppn: prepared[idx]?.is_ppn,
            show_diskon: prepared[idx]?.show_diskon,
            show_ppn: prepared[idx]?.show_ppn,
            show_ongkir: prepared[idx]?.show_ongkir,
          }));
        }
        throw err;
      }
    }

    const mock = this.getMockData();
    mock.unshift(...prepared);
    return prepared;
  }

  /**
   * Update calculation record
   */
  public static async update(id: string, updates: Partial<Perhitungan>): Promise<Perhitungan> {
    const cleanUpdates = this.sanitize(updates);
    const updatedPayload = {
      ...cleanUpdates,
      updated_at: new Date().toISOString(),
    };

    saveLocalMetaCache(id, {
      nama_pt: updates.nama_pt,
      items: updates.items,
      ongkir: updates.ongkir,
      ppn: updates.ppn,
      is_ppn: updates.is_ppn,
      show_diskon: updates.show_diskon,
      show_ppn: updates.show_ppn,
      show_ongkir: updates.show_ongkir,
    });

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('perhitungan')
          .update(updatedPayload)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return {
          ...data,
          nama_pt: updates.nama_pt !== undefined ? updates.nama_pt : data?.nama_pt,
          items: updates.items !== undefined ? updates.items : data?.items,
        };
      } catch (err: any) {
        if (err.message && (err.message.includes('nama_pt') || err.message.includes('items') || err.message.includes('column'))) {
          const stripped = this.stripMissingColumns(updatedPayload);
          const { data, error } = await supabase
            .from('perhitungan')
            .update(stripped)
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return { ...data, nama_pt: updates.nama_pt, items: updates.items };
        }
        throw err;
      }
    }

    const mock = this.getMockData();
    const idx = mock.findIndex(m => m.id === id);
    if (idx !== -1) {
      mock[idx] = {
        ...mock[idx],
        ...updatedPayload,
      };
      return mock[idx];
    }
    throw new Error('Data perhitungan tidak ditemukan');
  }

  /**
   * Delete calculation
   */
  public static async delete(id: string): Promise<boolean> {
    removeLocalMetaCache([id]);
    if (isConfigured) {
      const { error } = await supabase.from('perhitungan').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const mock = this.getMockData();
    const idx = mock.findIndex(m => m.id === id);
    if (idx !== -1) mock.splice(idx, 1);
    return true;
  }

  /**
   * Batch Delete calculations
   */
  public static async deleteBatch(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) return true;
    removeLocalMetaCache(ids);
    if (isConfigured) {
      const { error } = await supabase.from('perhitungan').delete().in('id', ids);
      if (error) throw error;
      return true;
    }
    const mock = this.getMockData();
    const idSet = new Set(ids);
    const remaining = mock.filter(m => !idSet.has(m.id));
    mock.length = 0;
    mock.push(...remaining);
    return true;
  }
}

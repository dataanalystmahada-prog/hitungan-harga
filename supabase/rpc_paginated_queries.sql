-- ====================================================================
-- ENTERPRISE SUPABASE RPC STORED PROCEDURES & SCHEMA SYNC
-- Optimized for 1M+ Records Server-Side Pagination, Filtering & Search
-- ====================================================================

-- 0. SCHEMA COLUMN MIGRATIONS (Ensure all required columns exist in Supabase tables)
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS nama_pt TEXT;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS ongkir NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS ppn NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS is_ppn BOOLEAN DEFAULT false;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS show_diskon BOOLEAN DEFAULT true;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS show_ppn BOOLEAN DEFAULT true;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS show_ongkir BOOLEAN DEFAULT true;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS show_keterangan BOOLEAN DEFAULT true;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS ref_id TEXT;
ALTER TABLE public.perhitungan ADD COLUMN IF NOT EXISTS keterangan TEXT;

ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS nama_pt TEXT;
ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS ongkir NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS ppn NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS is_ppn BOOLEAN DEFAULT false;
ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS show_diskon BOOLEAN DEFAULT true;
ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS show_ppn BOOLEAN DEFAULT true;
ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS show_ongkir BOOLEAN DEFAULT true;
ALTER TABLE public.sph ADD COLUMN IF NOT EXISTS show_keterangan BOOLEAN DEFAULT true;


-- 1. SERVER-SIDE PAGINATED QUERY FOR 'PERHITUNGAN'
CREATE OR REPLACE FUNCTION public.fn_query_perhitungan_paginated(
    p_page INT DEFAULT 1,
    p_limit INT DEFAULT 20,
    p_search TEXT DEFAULT NULL,
    p_sales TEXT DEFAULT NULL,
    p_produk TEXT DEFAULT NULL,
    p_proses_logo TEXT DEFAULT NULL,
    p_date_start TEXT DEFAULT NULL,
    p_date_end TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_order TEXT DEFAULT 'DESC'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offset INT;
    v_total_records BIGINT;
    v_filtered_records BIGINT;
    v_total_revenue NUMERIC;
    v_avg_margin NUMERIC;
    v_data JSON;
    v_result JSON;
BEGIN
    -- Calculate offset with safe bounds
    v_offset := GREATEST(0, (p_page - 1) * p_limit);

    -- Base count
    SELECT COUNT(*) INTO v_total_records FROM public.perhitungan;

    -- Query data with server-side filter, search, and dynamic sorting
    WITH filtered_data AS (
        SELECT 
            p.id,
            p.tanggal,
            p.sales,
            p.nama_pt,
            p.produk,
            p.kode,
            p.proses_logo,
            p.qty,
            p.modal_produk,
            p.modal_logo,
            p.margin,
            p.harga_jual,
            p.total_harga_jual,
            p.harga_jual_net,
            p.diskon,
            p.ongkir,
            p.ppn,
            p.is_ppn,
            p.show_diskon,
            p.show_ppn,
            p.show_ongkir,
            p.show_keterangan,
            p.ref_id,
            p.keterangan,
            p.items,
            p.created_at,
            p.updated_at,
            p.synced_at
        FROM public.perhitungan p
        WHERE 
            (p_search IS NULL OR (
                p.nama_pt ILIKE '%' || p_search || '%' OR
                p.produk ILIKE '%' || p_search || '%' OR
                p.kode ILIKE '%' || p_search || '%' OR
                p.sales ILIKE '%' || p_search || '%' OR
                p.proses_logo ILIKE '%' || p_search || '%'
            ))
            AND (p_sales IS NULL OR p.sales = p_sales)
            AND (p_produk IS NULL OR p.produk = p_produk)
            AND (p_proses_logo IS NULL OR p.proses_logo = p_proses_logo)
            AND (p_date_start IS NULL OR p.created_at >= p_date_start::TIMESTAMPTZ)
            AND (p_date_end IS NULL OR p.created_at <= (p_date_end || ' 23:59:59')::TIMESTAMPTZ)
    ),
    counted_data AS (
        SELECT 
            COUNT(*) AS filter_count,
            COALESCE(SUM(total_harga_jual), 0) AS sum_revenue,
            COALESCE(AVG(margin), 0) AS mean_margin
        FROM filtered_data
    ),
    sorted_paginated AS (
        SELECT *
        FROM filtered_data
        ORDER BY
            CASE WHEN p_sort_by = 'tanggal' AND p_sort_order ILIKE 'ASC' THEN tanggal END ASC,
            CASE WHEN p_sort_by = 'tanggal' AND p_sort_order ILIKE 'DESC' THEN tanggal END DESC,
            CASE WHEN p_sort_by = 'nama_pt' AND p_sort_order ILIKE 'ASC' THEN nama_pt END ASC,
            CASE WHEN p_sort_by = 'nama_pt' AND p_sort_order ILIKE 'DESC' THEN nama_pt END DESC,
            CASE WHEN p_sort_by = 'produk' AND p_sort_order ILIKE 'ASC' THEN produk END ASC,
            CASE WHEN p_sort_by = 'produk' AND p_sort_order ILIKE 'DESC' THEN produk END DESC,
            CASE WHEN p_sort_by = 'sales' AND p_sort_order ILIKE 'ASC' THEN sales END ASC,
            CASE WHEN p_sort_by = 'sales' AND p_sort_order ILIKE 'DESC' THEN sales END DESC,
            CASE WHEN p_sort_by = 'total_harga_jual' AND p_sort_order ILIKE 'ASC' THEN total_harga_jual END ASC,
            CASE WHEN p_sort_by = 'total_harga_jual' AND p_sort_order ILIKE 'DESC' THEN total_harga_jual END DESC,
            CASE WHEN p_sort_by = 'created_at' AND p_sort_order ILIKE 'ASC' THEN created_at END ASC,
            CASE WHEN (p_sort_by IS NULL OR p_sort_by = 'created_at') AND (p_sort_order IS NULL OR p_sort_order ILIKE 'DESC') THEN created_at END DESC
        LIMIT p_limit
        OFFSET v_offset
    )
    SELECT 
        (SELECT filter_count FROM counted_data),
        (SELECT sum_revenue FROM counted_data),
        (SELECT mean_margin FROM counted_data),
        COALESCE(json_agg(row_to_json(sp.*)), '[]'::json)
    INTO 
        v_filtered_records,
        v_total_revenue,
        v_avg_margin,
        v_data
    FROM sorted_paginated sp;

    -- Build enterprise JSON response
    v_result := json_build_object(
        'data', v_data,
        'pagination', json_build_object(
            'page', p_page,
            'limit', p_limit,
            'totalRecords', v_total_records,
            'filteredRecords', COALESCE(v_filtered_records, 0),
            'totalPages', CEIL(COALESCE(v_filtered_records, 0)::NUMERIC / GREATEST(1, p_limit)::NUMERIC)
        ),
        'metrics', json_build_object(
            'totalRevenue', COALESCE(v_total_revenue, 0),
            'avgMargin', ROUND(COALESCE(v_avg_margin, 0)::NUMERIC, 2)
        )
    );

    RETURN v_result;
END;
$$;


-- 2. SERVER-SIDE PAGINATED QUERY FOR 'SPH' (SURAT PENAWARAN HARGA)
CREATE OR REPLACE FUNCTION public.fn_query_sph_paginated(
    p_page INT DEFAULT 1,
    p_limit INT DEFAULT 20,
    p_search TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_brand TEXT DEFAULT NULL,
    p_sales TEXT DEFAULT NULL,
    p_date_start TEXT DEFAULT NULL,
    p_date_end TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_order TEXT DEFAULT 'DESC'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offset INT;
    v_total_records BIGINT;
    v_filtered_records BIGINT;
    v_total_value NUMERIC;
    v_data JSON;
    v_result JSON;
BEGIN
    v_offset := GREATEST(0, (p_page - 1) * p_limit);
    SELECT COUNT(*) INTO v_total_records FROM public.sph;

    WITH filtered_sph AS (
        SELECT 
            s.id,
            s.tanggal,
            s.brand,
            s.no_sph,
            s.nama_pt,
            s.deskripsi,
            s.produk,
            s.qty,
            s.harga_jual,
            s.ref_id,
            s.sales,
            s.status_sph,
            s.keterangan,
            s.diskon,
            s.ongkir,
            s.ppn,
            s.is_ppn,
            s.show_diskon,
            s.show_ppn,
            s.show_ongkir,
            s.show_keterangan,
            s.harga_jual_akhir,
            s.items,
            s.created_at,
            s.updated_at,
            s.synced_at
        FROM public.sph s
        WHERE 
            (p_search IS NULL OR (
                s.no_sph ILIKE '%' || p_search || '%' OR
                s.nama_pt ILIKE '%' || p_search || '%' OR
                s.brand ILIKE '%' || p_search || '%' OR
                s.sales ILIKE '%' || p_search || '%' OR
                s.produk ILIKE '%' || p_search || '%'
            ))
            AND (p_status IS NULL OR s.status_sph = p_status)
            AND (p_brand IS NULL OR s.brand = p_brand)
            AND (p_sales IS NULL OR s.sales = p_sales)
            AND (p_date_start IS NULL OR s.created_at >= p_date_start::TIMESTAMPTZ)
            AND (p_date_end IS NULL OR s.created_at <= (p_date_end || ' 23:59:59')::TIMESTAMPTZ)
    ),
    counted_sph AS (
        SELECT 
            COUNT(*) AS filter_count,
            COALESCE(SUM(harga_jual_akhir), 0) AS sum_val
        FROM filtered_sph
    ),
    sorted_paginated AS (
        SELECT *
        FROM filtered_sph
        ORDER BY
            CASE WHEN p_sort_by = 'no_sph' AND p_sort_order ILIKE 'ASC' THEN no_sph END ASC,
            CASE WHEN p_sort_by = 'no_sph' AND p_sort_order ILIKE 'DESC' THEN no_sph END DESC,
            CASE WHEN p_sort_by = 'nama_pt' AND p_sort_order ILIKE 'ASC' THEN nama_pt END ASC,
            CASE WHEN p_sort_by = 'nama_pt' AND p_sort_order ILIKE 'DESC' THEN nama_pt END DESC,
            CASE WHEN p_sort_by = 'harga_jual_akhir' AND p_sort_order ILIKE 'ASC' THEN harga_jual_akhir END ASC,
            CASE WHEN p_sort_by = 'harga_jual_akhir' AND p_sort_order ILIKE 'DESC' THEN harga_jual_akhir END DESC,
            CASE WHEN (p_sort_by IS NULL OR p_sort_by = 'created_at') AND (p_sort_order IS NULL OR p_sort_order ILIKE 'DESC') THEN created_at END DESC,
            CASE WHEN p_sort_by = 'created_at' AND p_sort_order ILIKE 'ASC' THEN created_at END ASC
        LIMIT p_limit
        OFFSET v_offset
    )
    SELECT 
        (SELECT filter_count FROM counted_sph),
        (SELECT sum_val FROM counted_sph),
        COALESCE(json_agg(row_to_json(sp.*)), '[]'::json)
    INTO 
        v_filtered_records,
        v_total_value,
        v_data
    FROM sorted_paginated sp;

    v_result := json_build_object(
        'data', v_data,
        'pagination', json_build_object(
            'page', p_page,
            'limit', p_limit,
            'totalRecords', v_total_records,
            'filteredRecords', COALESCE(v_filtered_records, 0),
            'totalPages', CEIL(COALESCE(v_filtered_records, 0)::NUMERIC / GREATEST(1, p_limit)::NUMERIC)
        ),
        'metrics', json_build_object(
            'totalQuotationValue', COALESCE(v_total_value, 0)
        )
    );

    RETURN v_result;
END;
$$;


-- 3. GOOGLE APPS SCRIPT FULL MIRROR SYNC ENGINE
CREATE OR REPLACE FUNCTION public.fn_batch_upsert_from_sheet(
    p_table_name TEXT,
    p_records JSONB,
    p_sync_type TEXT DEFAULT 'MANUAL',
    p_triggered_by TEXT DEFAULT 'Google Apps Script'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_ts TIMESTAMPTZ := clock_timestamp();
    v_count INT := COALESCE(jsonb_array_length(p_records), 0);
    v_duration INT;
    v_deleted INT := 0;
    v_inserted INT := 0;
BEGIN
    IF p_table_name = 'modal_produk' THEN
        -- 1. Upsert current records from spreadsheet
        IF v_count > 0 THEN
            INSERT INTO public.modal_produk (id, produk, kode, harga_modal, updated_at, synced_at)
            SELECT 
                elem->>'id',
                COALESCE(elem->>'produk', ''),
                COALESCE(elem->>'kode', ''),
                COALESCE((elem->>'harga_modal')::NUMERIC, 0),
                now(),
                now()
            FROM jsonb_array_elements(p_records) AS elem
            ON CONFLICT (id) DO UPDATE SET
                produk = EXCLUDED.produk,
                kode = EXCLUDED.kode,
                harga_modal = EXCLUDED.harga_modal,
                updated_at = now(),
                synced_at = now();

            -- 2. Full Sync Mirror: Delete records in Supabase that no longer exist in the Spreadsheet
            DELETE FROM public.modal_produk
            WHERE id NOT IN (
                SELECT elem->>'id' 
                FROM jsonb_array_elements(p_records) AS elem
            );
            GET DIAGNOSTICS v_deleted = ROW_COUNT;
        ELSE
            -- If sheet is empty, clear table
            DELETE FROM public.modal_produk;
            GET DIAGNOSTICS v_deleted = ROW_COUNT;
        END IF;

    ELSIF p_table_name = 'modal_logo' THEN
        IF v_count > 0 THEN
            INSERT INTO public.modal_logo (id, produk, proses_logo, qty_12, qty_24, qty_50, qty_75, qty_100, qty_150, qty_200, qty_300, qty_500, updated_at, synced_at)
            SELECT 
                elem->>'id',
                COALESCE(elem->>'produk', ''),
                COALESCE(elem->>'proses_logo', ''),
                COALESCE((elem->>'qty_12')::NUMERIC, 0),
                COALESCE((elem->>'qty_24')::NUMERIC, 0),
                COALESCE((elem->>'qty_50')::NUMERIC, 0),
                COALESCE((elem->>'qty_75')::NUMERIC, 0),
                COALESCE((elem->>'qty_100')::NUMERIC, 0),
                COALESCE((elem->>'qty_150')::NUMERIC, 0),
                COALESCE((elem->>'qty_200')::NUMERIC, 0),
                COALESCE((elem->>'qty_300')::NUMERIC, 0),
                COALESCE((elem->>'qty_500')::NUMERIC, 0),
                now(),
                now()
            FROM jsonb_array_elements(p_records) AS elem
            ON CONFLICT (id) DO UPDATE SET
                produk = EXCLUDED.produk,
                proses_logo = EXCLUDED.proses_logo,
                qty_12 = EXCLUDED.qty_12,
                qty_24 = EXCLUDED.qty_24,
                qty_50 = EXCLUDED.qty_50,
                qty_75 = EXCLUDED.qty_75,
                qty_100 = EXCLUDED.qty_100,
                qty_150 = EXCLUDED.qty_150,
                qty_200 = EXCLUDED.qty_200,
                qty_300 = EXCLUDED.qty_300,
                qty_500 = EXCLUDED.qty_500,
                updated_at = now(),
                synced_at = now();

            -- Full Sync Mirror: Delete records in Supabase that no longer exist in the Spreadsheet
            DELETE FROM public.modal_logo
            WHERE id NOT IN (
                SELECT elem->>'id' 
                FROM jsonb_array_elements(p_records) AS elem
            );
            GET DIAGNOSTICS v_deleted = ROW_COUNT;
        ELSE
            DELETE FROM public.modal_logo;
            GET DIAGNOSTICS v_deleted = ROW_COUNT;
        END IF;

    ELSIF p_table_name = 'margin' THEN
        IF v_count > 0 THEN
            INSERT INTO public.margin (id, produk, proses_logo, qty_12, qty_24, qty_50, qty_75, qty_100, qty_150, qty_200, qty_300, qty_500, updated_at, synced_at)
            SELECT 
                elem->>'id',
                COALESCE(elem->>'produk', ''),
                COALESCE(elem->>'proses_logo', ''),
                COALESCE((elem->>'qty_12')::NUMERIC, 0),
                COALESCE((elem->>'qty_24')::NUMERIC, 0),
                COALESCE((elem->>'qty_50')::NUMERIC, 0),
                COALESCE((elem->>'qty_75')::NUMERIC, 0),
                COALESCE((elem->>'qty_100')::NUMERIC, 0),
                COALESCE((elem->>'qty_150')::NUMERIC, 0),
                COALESCE((elem->>'qty_200')::NUMERIC, 0),
                COALESCE((elem->>'qty_300')::NUMERIC, 0),
                COALESCE((elem->>'qty_500')::NUMERIC, 0),
                now(),
                now()
            FROM jsonb_array_elements(p_records) AS elem
            ON CONFLICT (id) DO UPDATE SET
                produk = EXCLUDED.produk,
                proses_logo = EXCLUDED.proses_logo,
                qty_12 = EXCLUDED.qty_12,
                qty_24 = EXCLUDED.qty_24,
                qty_50 = EXCLUDED.qty_50,
                qty_75 = EXCLUDED.qty_75,
                qty_100 = EXCLUDED.qty_100,
                qty_150 = EXCLUDED.qty_150,
                qty_200 = EXCLUDED.qty_200,
                qty_300 = EXCLUDED.qty_300,
                qty_500 = EXCLUDED.qty_500,
                updated_at = now(),
                synced_at = now();

            -- Full Sync Mirror: Delete records in Supabase that no longer exist in the Spreadsheet
            DELETE FROM public.margin
            WHERE id NOT IN (
                SELECT elem->>'id' 
                FROM jsonb_array_elements(p_records) AS elem
            );
            GET DIAGNOSTICS v_deleted = ROW_COUNT;
        ELSE
            DELETE FROM public.margin;
            GET DIAGNOSTICS v_deleted = ROW_COUNT;
        END IF;

    END IF;

    -- Calculate duration
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_ts))::INT;

    -- Insert Audit Sync Log
    INSERT INTO public.sync_logs (
        sheet_name, sync_type, status, records_processed, records_inserted, records_updated, records_failed, duration_ms, triggered_by
    ) VALUES (
        p_table_name, p_sync_type, 'SUCCESS', v_count, v_count, v_deleted, 0, v_duration, p_triggered_by
    );

    RETURN json_build_object(
        'success', true,
        'table', p_table_name,
        'recordsProcessed', v_count,
        'recordsDeleted', v_deleted,
        'durationMs', v_duration
    );

EXCEPTION WHEN OTHERS THEN
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_ts))::INT;
    INSERT INTO public.sync_logs (
        sheet_name, sync_type, status, records_processed, records_failed, error_message, duration_ms, triggered_by
    ) VALUES (
        p_table_name, p_sync_type, 'FAILED', v_count, v_count, SQLERRM, v_duration, p_triggered_by
    );

    RETURN json_build_object(
        'success', false,
        'table', p_table_name,
        'error', SQLERRM,
        'durationMs', v_duration
    );
END;
$$;

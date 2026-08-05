-- ====================================================================
-- ENTERPRISE SUPABASE / POSTGRESQL SCHEMA
-- High Scale Architecture (Optimized for 1,000,000+ records)
-- Compatible with Google Apps Script Sync Engine & React Frontend
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. MASTER & CONFIG TABLES

-- Table: Master Produk
CREATE TABLE IF NOT EXISTS public.produk (
    id TEXT PRIMARY KEY,
    nama_produk TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Modal Produk
CREATE TABLE IF NOT EXISTS public.modal_produk (
    id TEXT PRIMARY KEY,
    produk TEXT NOT NULL,
    kode TEXT,
    harga_modal NUMERIC(15,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Modal Logo (Quantity Tier Matrix)
CREATE TABLE IF NOT EXISTS public.modal_logo (
    id TEXT PRIMARY KEY,
    produk TEXT NOT NULL,
    proses_logo TEXT NOT NULL,
    qty_12 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    qty_24 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    qty_50 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    qty_75 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    qty_100 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    qty_150 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    qty_200 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    qty_300 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    qty_500 NUMERIC(15,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Margin (Percentage Tier Matrix)
CREATE TABLE IF NOT EXISTS public.margin (
    id TEXT PRIMARY KEY,
    produk TEXT NOT NULL,
    proses_logo TEXT NOT NULL,
    qty_12 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    qty_24 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    qty_50 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    qty_75 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    qty_100 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    qty_150 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    qty_200 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    qty_300 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    qty_500 NUMERIC(8,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Perhitungan (Core Operational Table - Scale 1M+ Records)
CREATE TABLE IF NOT EXISTS public.perhitungan (
    id TEXT PRIMARY KEY,
    tanggal TEXT,
    sales TEXT,
    produk TEXT NOT NULL,
    kode TEXT,
    proses_logo TEXT,
    qty NUMERIC(12,2) DEFAULT 0 NOT NULL,
    modal_produk NUMERIC(15,2) DEFAULT 0 NOT NULL,
    modal_logo NUMERIC(15,2) DEFAULT 0 NOT NULL,
    margin NUMERIC(8,2) DEFAULT 0 NOT NULL,
    harga_jual NUMERIC(15,2) DEFAULT 0 NOT NULL,
    total_harga_jual NUMERIC(15,2) DEFAULT 0 NOT NULL,
    harga_jual_net NUMERIC(15,2) DEFAULT 0 NOT NULL,
    diskon NUMERIC(15,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: SPH (Surat Penawaran Harga Quotations)
CREATE TABLE IF NOT EXISTS public.sph (
    id TEXT PRIMARY KEY,
    tanggal TEXT,
    brand TEXT,
    no_sph TEXT,
    nama_pt TEXT,
    deskripsi TEXT,
    produk TEXT,
    qty NUMERIC(12,2) DEFAULT 0 NOT NULL,
    harga_jual NUMERIC(15,2) DEFAULT 0 NOT NULL,
    ref_id TEXT,
    sales TEXT,
    status_sph TEXT DEFAULT 'Draft',
    keterangan TEXT,
    diskon NUMERIC(15,2) DEFAULT 0 NOT NULL,
    harga_jual_akhir NUMERIC(15,2) DEFAULT 0 NOT NULL,
    items JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Users / Sales
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'sales' NOT NULL,
    pin TEXT DEFAULT '123456' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Divisi
CREATE TABLE IF NOT EXISTS public.divisi (
    id TEXT PRIMARY KEY,
    nama_divisi TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Brands
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    nama_brand TEXT NOT NULL,
    singkatan TEXT,
    alamat TEXT,
    email TEXT,
    website TEXT,
    no_telp_kantor TEXT,
    no_telp_wa TEXT,
    sosial_media TEXT,
    rating_google_maps TEXT,
    bank TEXT,
    no_rekening TEXT,
    atas_nama TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Keterangan (Templates / Terms & Conditions)
CREATE TABLE IF NOT EXISTS public.keterangan (
    id TEXT PRIMARY KEY,
    isi_keterangan TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Prompt Library / Templates
CREATE TABLE IF NOT EXISTS public.prompt_library (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    kategori TEXT DEFAULT 'General',
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Sync Logs (Google Apps Script -> Supabase Engine Audit)
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_name TEXT NOT NULL,
    sync_type TEXT DEFAULT 'AUTO', -- 'AUTO', 'MANUAL', 'WEBHOOK'
    status TEXT NOT NULL,          -- 'SUCCESS', 'FAILED', 'PARTIAL'
    records_processed INT DEFAULT 0,
    records_inserted INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    duration_ms INT DEFAULT 0,
    error_message TEXT,
    triggered_by TEXT DEFAULT 'Google Apps Script',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 3. ENTERPRISE HIGH-PERFORMANCE INDEXES
-- Optimized for 1,000,000+ rows queries, server-side pagination & filter
-- ====================================================================

-- Indexes for 'perhitungan' table
CREATE INDEX IF NOT EXISTS idx_perhitungan_created_at_desc ON public.perhitungan (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_perhitungan_tanggal ON public.perhitungan (tanggal);
CREATE INDEX IF NOT EXISTS idx_perhitungan_sales ON public.perhitungan (sales);
CREATE INDEX IF NOT EXISTS idx_perhitungan_produk ON public.perhitungan (produk);
CREATE INDEX IF NOT EXISTS idx_perhitungan_kode ON public.perhitungan (kode);
CREATE INDEX IF NOT EXISTS idx_perhitungan_search_trgm ON public.perhitungan USING gin (
    (coalesce(produk, '') || ' ' || coalesce(kode, '') || ' ' || coalesce(sales, '')) gin_trgm_ops
);

-- Indexes for 'sph' table
CREATE INDEX IF NOT EXISTS idx_sph_created_at_desc ON public.sph (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sph_status ON public.sph (status_sph);
CREATE INDEX IF NOT EXISTS idx_sph_brand ON public.sph (brand);
CREATE INDEX IF NOT EXISTS idx_sph_sales ON public.sph (sales);
CREATE INDEX IF NOT EXISTS idx_sph_no_sph ON public.sph (no_sph);
CREATE INDEX IF NOT EXISTS idx_sph_nama_pt ON public.sph (nama_pt);
CREATE INDEX IF NOT EXISTS idx_sph_search_trgm ON public.sph USING gin (
    (coalesce(no_sph, '') || ' ' || coalesce(nama_pt, '') || ' ' || coalesce(sales, '') || ' ' || coalesce(brand, '')) gin_trgm_ops
);

-- Indexes for Master Tables
CREATE INDEX IF NOT EXISTS idx_modal_produk_produk ON public.modal_produk (produk);
CREATE INDEX IF NOT EXISTS idx_modal_logo_lookup ON public.modal_logo (produk, proses_logo);
CREATE INDEX IF NOT EXISTS idx_margin_lookup ON public.margin (produk, proses_logo);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs (created_at DESC);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modal_produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modal_logo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.margin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perhitungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sph ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keterangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for authenticated & anon clients (customizable based on auth roles)
CREATE POLICY "Public Read Access" ON public.produk FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.modal_produk FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.modal_logo FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.margin FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.perhitungan FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.sph FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.divisi FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.keterangan FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.prompt_library FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.sync_logs FOR SELECT USING (true);

-- Allow upsert/insert/update from anon/service roles
CREATE POLICY "Service Role Upsert Access" ON public.produk FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.modal_produk FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.modal_logo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.margin FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.perhitungan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.sph FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.divisi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.keterangan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.prompt_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Upsert Access" ON public.sync_logs FOR ALL USING (true) WITH CHECK (true);

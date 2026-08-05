-- ====================================================================
-- MATERIALIZED VIEWS & ANALYTICS AGGREGATIONS
-- Instant Sub-100ms KPI Response for 1,000,000+ Record Datasets
-- ====================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM public.perhitungan) AS total_perhitungan_count,
    (SELECT COALESCE(SUM(total_harga_jual), 0) FROM public.perhitungan) AS total_perhitungan_revenue,
    (SELECT COALESCE(AVG(margin), 0) FROM public.perhitungan) AS avg_overall_margin,
    (SELECT COUNT(*) FROM public.sph) AS total_sph_count,
    (SELECT COALESCE(SUM(harga_jual_akhir), 0) FROM public.sph) AS total_sph_value,
    (SELECT COUNT(*) FROM public.sph WHERE status_sph = 'Deal' OR status_sph = 'Disetujui') AS total_sph_deal,
    (SELECT COUNT(*) FROM public.produk) AS total_master_produk,
    (SELECT COUNT(*) FROM public.users) AS total_sales_users,
    (SELECT COUNT(*) FROM public.sync_logs WHERE status = 'SUCCESS' AND created_at >= now() - INTERVAL '24 hours') AS syncs_24h_success,
    timezone('utc'::text, now()) AS last_refreshed_at;

-- Unique Index to enable CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_summary_refreshed ON public.mv_dashboard_summary (last_refreshed_at);

-- Daily Revenue Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_revenue_monthly_trend AS
SELECT 
    to_char(created_at, 'YYYY-MM') AS month_key,
    to_char(created_at, 'Mon YYYY') AS month_label,
    COUNT(*) AS calculation_count,
    COALESCE(SUM(total_harga_jual), 0) AS total_revenue,
    COALESCE(AVG(margin), 0) AS avg_margin
FROM public.perhitungan
GROUP BY to_char(created_at, 'YYYY-MM'), to_char(created_at, 'Mon YYYY')
ORDER BY month_key ASC;

-- Helper procedure to refresh materialized views
CREATE OR REPLACE FUNCTION public.fn_refresh_analytics_views()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.mv_dashboard_summary;
    REFRESH MATERIALIZED VIEW public.mv_revenue_monthly_trend;
    
    RETURN json_build_object(
        'success', true,
        'refreshedAt', now()
    );
END;
$$;

import React, { useMemo, useState } from 'react';
import { useDataTable } from '../hooks/useDataTable';
import { usePerhitungan } from '../hooks/usePerhitungan';
import { useMasterData } from '../hooks/useMasterData';
import { EnterpriseDataTable } from '../components/table/EnterpriseDataTable';
import { TableColumn, FilterConfig } from '../types/table.types';
import { Perhitungan, UserSales, MasterProduk, ModalLogo } from '../types/database.types';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SPHPreviewModal } from '../components/sph/SPHPreviewModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export const PerhitunganPage: React.FC = () => {
  const { role } = useAuth();
  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    sort,
    handleSort,
    filters,
    setFilter,
    clearFilters,
    queryParams,
  } = useDataTable({ initialLimit: 20, initialSortBy: 'created_at', initialSortOrder: 'DESC' });

  const { dataList, pagination, isLoading, refetch, deleteCalculation } = usePerhitungan(queryParams);
  const { masterProduk, modalLogo, users } = useMasterData();
  const { success, error } = useToast();

  const [sphModalData, setSphModalData] = useState<{
    isOpen: boolean;
    data?: {
      produk: string;
      qty: number;
      hargaJualUnit: number;
      totalHargaJual: number;
      sales: string;
      diskon: number;
    };
  }>({ isOpen: false });

  // Filter configurations
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      key: 'sales',
      label: 'Sales In-Charge',
      type: 'select',
      options: users.map((u: UserSales) => ({ label: u.nama, value: u.nama })),
    },
    {
      key: 'produk',
      label: 'Produk',
      type: 'select',
      options: masterProduk.map((p: MasterProduk) => ({ label: p.nama_produk, value: p.nama_produk })),
    },
    {
      key: 'proses_logo',
      label: 'Proses Logo',
      type: 'select',
      options: Array.from(new Set(modalLogo.map((l: ModalLogo) => l.proses_logo))).map((logo: string) => ({
        label: logo,
        value: logo,
      })),
    },
  ], [users, masterProduk, modalLogo]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus data perhitungan ini?')) return;
    try {
      await deleteCalculation(id);
      success('Berhasil Dihapus', 'Data perhitungan berhasil dihapus.');
    } catch (err: any) {
      error('Gagal Menghapus', err.message);
    }
  };

  const handleOpenSPH = (e: React.MouseEvent, row: Perhitungan) => {
    e.stopPropagation();
    setSphModalData({
      isOpen: true,
      data: {
        produk: row.produk,
        qty: row.qty,
        hargaJualUnit: Math.round((row.harga_jual_net || row.total_harga_jual) / (row.qty || 1)),
        totalHargaJual: row.harga_jual_net || row.total_harga_jual,
        sales: row.sales || '',
        diskon: row.diskon,
      },
    });
  };

  // Table Columns
  const columns: TableColumn<Perhitungan>[] = useMemo(() => [
    {
      key: 'tanggal',
      title: 'Tanggal',
      width: 105,
      render: (row: Perhitungan) => <span className="font-mono text-xs text-slate-500">{row.tanggal}</span>,
    },
    {
      key: 'sales',
      title: 'Sales',
      width: 130,
      render: (row: Perhitungan) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.sales}</span>,
    },
    {
      key: 'produk',
      title: 'Produk',
      width: 220,
      render: (row: Perhitungan) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{row.produk}</p>
          {row.kode && <span className="text-[10px] font-mono text-slate-400">Kode: {row.kode}</span>}
        </div>
      ),
    },
    {
      key: 'proses_logo',
      title: 'Proses Logo',
      width: 180,
      render: (row: Perhitungan) => (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.proses_logo || '-'}
        </span>
      ),
    },
    {
      key: 'qty',
      title: 'Qty',
      align: 'center',
      width: 80,
      render: (row: Perhitungan) => <span className="font-mono font-bold">{formatNumber(row.qty)}</span>,
    },
    ...(role !== 'sales' ? [
      {
        key: 'modal_produk',
        title: 'Modal Unit',
        align: 'right',
        width: 110,
        render: (row: Perhitungan) => <span className="font-mono text-slate-500">{formatRupiah(row.modal_produk)}</span>,
      },
      {
        key: 'modal_logo',
        title: 'Modal Logo',
        align: 'right',
        width: 110,
        render: (row: Perhitungan) => <span className="font-mono text-slate-500">{formatRupiah(row.modal_logo)}</span>,
      },
    ] : [] as TableColumn<Perhitungan>[]),
    {
      key: 'margin',
      title: 'Margin',
      align: 'center',
      width: 90,
      render: (row: Perhitungan) => (
        <span className="font-bold text-amber-600 dark:text-amber-400">
          {formatPercent(row.margin)}
        </span>
      ),
    },
    {
      key: 'total_harga_jual',
      title: 'Total Kotor',
      align: 'right',
      width: 130,
      render: (row: Perhitungan) => <span className="font-mono">{formatRupiah(row.total_harga_jual)}</span>,
    },
    {
      key: 'diskon',
      title: 'Diskon (Rp)',
      align: 'right',
      width: 100,
      render: (row: Perhitungan) => (
        <span className={row.diskon > 0 ? 'text-rose-500 font-bold font-mono' : 'text-slate-400 font-mono'}>
          {row.diskon > 0 ? `-${formatRupiah(row.diskon)}` : '-'}
        </span>
      ),
    },
    {
      key: 'harga_jual_net',
      title: 'Total Net Jual',
      align: 'right',
      width: 140,
      render: (row: Perhitungan) => (
        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatRupiah(row.harga_jual_net)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Aksi',
      align: 'center',
      sortable: false,
      hideable: false,
      width: 100,
      render: (row: Perhitungan) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => handleOpenSPH(e, row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Buat SPH dari hitungan ini"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
          </button>
          <button
            onClick={(e) => handleDelete(e, row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Hapus record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [role]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Database Perhitungan Harga
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Semua histori hitungan tersinkronisasi di Supabase dengan pagination server-side.
          </p>
        </div>

        <Link to="/kalkulator">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Hitung Harga Baru
          </Button>
        </Link>
      </div>

      {/* Enterprise Data Table */}
      <EnterpriseDataTable
        columns={columns}
        data={dataList}
        totalRecords={pagination?.totalRecords || 0}
        filteredRecords={pagination?.filteredRecords || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari produk, kode, sales, proses logo..."
        sort={sort}
        onSortChange={handleSort}
        filters={filters}
        filterConfigs={filterConfigs}
        onSetFilter={setFilter}
        onClearFilters={clearFilters}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        exportFileName="data_perhitungan_harga"
        enableVirtualization={true}
      />

      {/* SPH Modal */}
      {sphModalData.isOpen && (
        <SPHPreviewModal
          isOpen={sphModalData.isOpen}
          onClose={() => setSphModalData({ isOpen: false })}
          defaultData={sphModalData.data}
        />
      )}
    </div>
  );
};

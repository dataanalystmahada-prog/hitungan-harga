import React, { useMemo, useState } from 'react';
import { useDataTable } from '../hooks/useDataTable';
import { useSPH } from '../hooks/useSPH';
import { useMasterData } from '../hooks/useMasterData';
import { EnterpriseDataTable } from '../components/table/EnterpriseDataTable';
import { TableColumn, FilterConfig } from '../types/table.types';
import { SPH, SPHStatus, Brand, UserSales } from '../types/database.types';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Plus, Printer, Trash2 } from 'lucide-react';
import { SPHPreviewModal } from '../components/sph/SPHPreviewModal';
import { useToast } from '../contexts/ToastContext';

const ALL_STATUSES: SPHStatus[] = ['Draft', 'Dikirim', 'Negosiasi', 'Deal', 'Disetujui', 'Ditolak'];

export const SPHPage: React.FC = () => {
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

  const { dataList, pagination, isLoading, refetch, updateStatus, deleteSPH } = useSPH(queryParams);
  const { brands, users } = useMasterData();
  const { success, error } = useToast();

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    row?: SPH;
  }>({ isOpen: false });

  // Filter configurations
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      key: 'status',
      label: 'Status Penawaran',
      type: 'select',
      options: ALL_STATUSES.map(st => ({ label: st, value: st })),
    },
    {
      key: 'brand',
      label: 'Brand Perusahaan',
      type: 'select',
      options: brands.map((b: Brand) => ({ label: b.nama_brand, value: b.nama_brand })),
    },
    {
      key: 'sales',
      label: 'Sales PIC',
      type: 'select',
      options: users.map((u: UserSales) => ({ label: u.nama, value: u.nama })),
    },
  ], [brands, users]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    const newStatus = e.target.value as SPHStatus;
    try {
      await updateStatus({ id, status: newStatus });
      success('Status Diperbarui', `Status SPH berhasil diubah menjadi ${newStatus}.`);
    } catch (err: any) {
      error('Gagal Mengubah Status', err.message);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Hapus dokumen penawaran SPH ini?')) return;
    try {
      await deleteSPH(id);
      success('SPH Dihapus', 'Dokumen SPH berhasil dihapus.');
    } catch (err: any) {
      error('Gagal Menghapus', err.message);
    }
  };

  const handleOpenPrintPreview = (e: React.MouseEvent, row: SPH) => {
    e.stopPropagation();
    setPreviewModal({ isOpen: true, row });
  };

  const columns: TableColumn<SPH>[] = useMemo(() => [
    {
      key: 'tanggal',
      title: 'Tanggal',
      width: 105,
      render: (row: SPH) => <span className="font-mono text-xs text-slate-500">{row.tanggal}</span>,
    },
    {
      key: 'no_sph',
      title: 'Nomor SPH',
      width: 180,
      render: (row: SPH) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
          {row.no_sph}
        </span>
      ),
    },
    {
      key: 'nama_pt',
      title: 'Klien / Perusahaan',
      width: 220,
      render: (row: SPH) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{row.nama_pt}</p>
          <p className="text-[10px] text-slate-400 truncate max-w-xs">{row.deskripsi}</p>
        </div>
      ),
    },
    {
      key: 'brand',
      title: 'Brand Kop',
      width: 160,
      render: (row: SPH) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.brand}
        </span>
      ),
    },
    {
      key: 'qty',
      title: 'Qty',
      align: 'center',
      width: 80,
      render: (row: SPH) => <span className="font-mono">{formatNumber(row.qty)} pcs</span>,
    },
    {
      key: 'harga_jual_akhir',
      title: 'Total Penawaran',
      align: 'right',
      width: 150,
      render: (row: SPH) => (
        <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">
          {formatRupiah(row.harga_jual_akhir)}
        </span>
      ),
    },
    {
      key: 'sales',
      title: 'Sales PIC',
      width: 130,
      render: (row: SPH) => <span className="text-xs text-slate-600 dark:text-slate-400">{row.sales}</span>,
    },
    {
      key: 'status_sph',
      title: 'Status',
      align: 'center',
      width: 130,
      render: (row: SPH) => (
        <select
          value={row.status_sph}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleStatusChange(e, row.id)}
          className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer outline-none transition-colors ${
            row.status_sph === 'Deal' || row.status_sph === 'Disetujui'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
              : row.status_sph === 'Negosiasi'
              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
              : row.status_sph === 'Dikirim'
              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
              : row.status_sph === 'Ditolak'
              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {ALL_STATUSES.map(st => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      title: 'Aksi',
      align: 'center',
      sortable: false,
      hideable: false,
      width: 100,
      render: (row: SPH) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => handleOpenPrintPreview(e, row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Lihat & Cetak SPH"
          >
            <Printer className="w-4 h-4 text-brand-600" />
          </button>
          <button
            onClick={(e) => handleDelete(e, row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Hapus SPH"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Surat Penawaran Harga (SPH)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola dokumen penawaran harga resmi perusahaan yang terhubung langsung ke database Supabase.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setPreviewModal({ isOpen: true })}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Buat SPH Baru
        </Button>
      </div>

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
        searchPlaceholder="Cari nomor SPH, nama PT, sales, brand..."
        sort={sort}
        onSortChange={handleSort}
        filters={filters}
        filterConfigs={filterConfigs}
        onSetFilter={setFilter}
        onClearFilters={clearFilters}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        exportFileName="data_sph_penawaran"
      />

      {previewModal.isOpen && (
        <SPHPreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false })}
          defaultData={
            previewModal.row
              ? {
                  produk: previewModal.row.produk,
                  qty: previewModal.row.qty,
                  hargaJualUnit: previewModal.row.harga_jual,
                  totalHargaJual: previewModal.row.harga_jual_akhir,
                  sales: previewModal.row.sales,
                  diskon: previewModal.row.diskon,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

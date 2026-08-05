import React, { useMemo, useState } from 'react';
import { useDataTable } from '../hooks/useDataTable';
import { usePerhitungan } from '../hooks/usePerhitungan';
import { useMasterData } from '../hooks/useMasterData';
import { EnterpriseDataTable } from '../components/table/EnterpriseDataTable';
import { TableColumn, FilterConfig } from '../types/table.types';
import { Perhitungan, UserSales, MasterProduk, ModalLogo } from '../types/database.types';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Plus, Trash2, FileText, CheckSquare, Layers, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SPHPreviewModal } from '../components/sph/SPHPreviewModal';
import { EditPerhitunganModal } from '../components/perhitungan/EditPerhitunganModal';
import { SPHItemDetail } from '../types/pricing.types';
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

  const {
    dataList,
    pagination,
    isLoading,
    refetch,
    deleteCalculation,
    updateCalculation,
    isUpdating,
  } = usePerhitungan(queryParams);
  const { masterProduk, modalLogo, users } = useMasterData();
  const { success, error } = useToast();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editModalData, setEditModalData] = useState<{
    isOpen: boolean;
    calculation: Perhitungan | null;
  }>({ isOpen: false, calculation: null });

  const [sphModalData, setSphModalData] = useState<{
    isOpen: boolean;
    data?: {
      no_sph?: string;
      tanggal?: string;
      produk?: string;
      kode?: string;
      proses_logo?: string;
      deskripsi?: string;
      keterangan?: string;
      qty?: number;
      hargaJualUnit?: number;
      totalHargaJual?: number;
      sales?: string;
      diskon?: number;
      namaPt?: string;
      brand?: string;
      items?: SPHItemDetail[];
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

  const toggleSelectRow = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === dataList.length && dataList.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(dataList.map(item => item.id)));
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus data perhitungan ini?')) return;
    try {
      await deleteCalculation(id);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      success('Berhasil Dihapus', 'Data perhitungan berhasil dihapus.');
    } catch (err: any) {
      error('Gagal Menghapus', err.message);
    }
  };

  // Helper to extract or parse multi-line items from Perhitungan
  const parsePerhitunganItems = (row: Perhitungan): SPHItemDetail[] => {
    if (row.items && Array.isArray(row.items) && row.items.length > 0) {
      return row.items;
    }

    const prodStr = row.produk || '';
    if (prodStr.includes(',')) {
      const parts = prodStr.split(',').map(p => p.trim()).filter(Boolean);
      const kodes = (row.kode || '').split(',').map(k => k.trim());
      const logos = (row.proses_logo || '').split(',').map(l => l.trim());

      return parts.map((part, idx) => {
        const match = part.match(/^(.*?)\s*\((\d+)\s*pcs\)$/i);
        const prodName = match ? match[1].trim() : part;
        const prodQty = match ? parseInt(match[2], 10) : Math.max(1, Math.round((row.qty || 1) / parts.length));
        const unitPrice = row.harga_jual || Math.round((row.total_harga_jual || 0) / (row.qty || 1));

        return {
          produk: prodName,
          kode: kodes[idx] || kodes[0] || '',
          proses_logo: logos[idx] || logos[0] || '',
          qty: prodQty,
          hargaJualUnit: unitPrice,
          totalHargaJual: unitPrice * prodQty,
          diskon: 0,
        };
      });
    }

    return [
      {
        produk: row.produk || '',
        kode: row.kode || '',
        proses_logo: row.proses_logo || '',
        qty: row.qty || 0,
        hargaJualUnit: row.harga_jual || 0,
        totalHargaJual: row.total_harga_jual || ((row.harga_jual || 0) * (row.qty || 0)),
        diskon: row.diskon || 0,
      }
    ];
  };

  // Open SPH for multiple selected rows
  const handleOpenSPHSelected = () => {
    const selectedRows = dataList.filter(item => selectedIds.has(item.id));
    if (selectedRows.length === 0) return;

    const sphLineItems: SPHItemDetail[] = selectedRows.flatMap(row => parsePerhitunganItems(row));
    const totalDiskon = selectedRows.reduce((acc, row) => acc + (row.diskon || 0), 0);
    const commonSales = selectedRows[0]?.sales || '';

    setSphModalData({
      isOpen: true,
      data: {
        sales: commonSales,
        diskon: totalDiskon,
        items: sphLineItems,
        deskripsi: sphLineItems.length > 1
          ? `Paket Penawaran Khusus (${sphLineItems.length} Macam Produk)`
          : undefined,
      },
    });
  };

  // Open SPH from a single row
  const handleOpenSPH = (e: React.MouseEvent, row: Perhitungan) => {
    e.stopPropagation();

    const sphLineItems: SPHItemDetail[] = parsePerhitunganItems(row);

    setSphModalData({
      isOpen: true,
      data: {
        sales: row.sales || '',
        diskon: row.diskon || 0,
        items: sphLineItems,
        produk: row.produk,
        qty: row.qty,
        hargaJualUnit: row.harga_jual,
        totalHargaJual: row.total_harga_jual,
        deskripsi: sphLineItems.length > 1
          ? `Paket Penawaran Khusus (${sphLineItems.length} Macam Produk)`
          : undefined,
      },
    });
  };

  const handleEdit = (e: React.MouseEvent, row: Perhitungan) => {
    e.stopPropagation();
    setEditModalData({
      isOpen: true,
      calculation: row,
    });
  };

  const handleSaveEdit = async (id: string, updates: Partial<Perhitungan>) => {
    try {
      await updateCalculation({ id, updates });
      success('Perhitungan Diperbarui', 'Data perhitungan berhasil disimpan dan diperbarui.');
      refetch();
    } catch (err: any) {
      error('Gagal Memperbarui', err.message || 'Terjadi kesalahan saat memperbarui data perhitungan.');
    }
  };

  // Table Columns
  const columns: TableColumn<Perhitungan>[] = useMemo(() => [
    {
      key: 'select' as any,
      title: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={dataList.length > 0 && selectedIds.size === dataList.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
            title="Pilih Semua"
          />
        </div>
      ),
      width: 48,
      align: 'center',
      sortable: false,
      hideable: false,
      render: (row: Perhitungan) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedIds.has(row.id)}
            onChange={(e) => toggleSelectRow(row.id, e)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </div>
      ),
    },
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
    ...(role !== 'sales' ? ([
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
    ] as TableColumn<Perhitungan>[]) : []),
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
      width: 120,
      render: (row: Perhitungan) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => handleOpenSPH(e, row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            title="Buat SPH dari hitungan ini"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
          </button>
          <button
            onClick={(e) => handleEdit(e, row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
            title="Edit data perhitungan"
          >
            <Pencil className="w-4 h-4 text-amber-500" />
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
  ], [role, selectedIds, dataList]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Database Perhitungan Harga
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih satu atau beberapa produk (centang kotak) untuk langsung membuat Surat Penawaran Harga (SPH) multi-item.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenSPHSelected}
              leftIcon={<Layers className="w-4 h-4" />}
            >
              Buat SPH ({selectedIds.size} Produk Terpilih)
            </Button>
          )}
          <Link to="/kalkulator">
            <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Hitung Harga Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Floating Batch Selection Notification */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-xl text-xs text-brand-900 dark:text-brand-200">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>
              <b>{selectedIds.size} produk</b> dipilih untuk pembuatan Surat Penawaran Harga multi-baris.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="xs"
              onClick={handleOpenSPHSelected}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              Generate SPH Multi-Item
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelectedIds(new Set())}
            >
              Batal Pilih
            </Button>
          </div>
        </div>
      )}

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

      {/* Edit Perhitungan Modal */}
      {editModalData.isOpen && (
        <EditPerhitunganModal
          isOpen={editModalData.isOpen}
          onClose={() => setEditModalData({ isOpen: false, calculation: null })}
          calculation={editModalData.calculation}
          onSave={handleSaveEdit}
          isSaving={isUpdating}
        />
      )}
    </div>
  );
};

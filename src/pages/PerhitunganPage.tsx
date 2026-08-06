import React, { useMemo, useState } from 'react';
import { useDataTable } from '../hooks/useDataTable';
import { usePerhitungan } from '../hooks/usePerhitungan';
import { useMasterData } from '../hooks/useMasterData';
import { EnterpriseDataTable } from '../components/table/EnterpriseDataTable';
import { TableColumn, FilterConfig } from '../types/table.types';
import { Perhitungan, UserSales, MasterProduk, ModalLogo } from '../types/database.types';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
  Plus,
  Trash2,
  FileText,
  CheckSquare,
  Layers,
  Pencil,
  Building2,
  Calendar,
  User,
  Calculator,
  TrendingUp,
  DollarSign,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
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
    metrics,
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
    sourceCalculationIds?: string[];
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
      sourceCalculationIds?: string[];
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
    const totalOngkir = selectedRows.reduce((acc, row) => acc + (row.ongkir || 0), 0);
    const hasPpn = selectedRows.some(row => row.is_ppn === true || (row.ppn !== undefined && row.ppn > 0));
    const totalPpn = selectedRows.reduce((acc, row) => acc + (row.ppn || 0), 0);
    const showDiskon = selectedRows.some(row => row.show_diskon !== false);
    const showPpn = selectedRows.some(row => row.show_ppn !== false);
    const showOngkir = selectedRows.some(row => row.show_ongkir !== false);
    const showKeterangan = selectedRows.some(row => row.show_keterangan !== false);
    const commonKeterangan = selectedRows.find(r => (r as any).keterangan)?.keterangan || '';

    const commonSales = selectedRows[0]?.sales || '';
    const commonNamaPt = selectedRows.find(r => r.nama_pt)?.nama_pt || '';
    const selectedIdsArray = Array.from(selectedIds);

    setSphModalData({
      isOpen: true,
      sourceCalculationIds: selectedIdsArray,
      data: {
        sales: commonSales,
        namaPt: commonNamaPt,
        diskon: totalDiskon,
        ongkir: totalOngkir,
        is_ppn: hasPpn,
        ppn: totalPpn,
        show_diskon: showDiskon,
        show_ppn: showPpn,
        show_ongkir: showOngkir,
        show_keterangan: showKeterangan,
        keterangan: commonKeterangan,
        items: sphLineItems,
        sourceCalculationIds: selectedIdsArray,
      },
    });
  };

  // Open SPH from a single row
  const handleOpenSPH = (e: React.MouseEvent, row: Perhitungan) => {
    e.stopPropagation();

    const sphLineItems: SPHItemDetail[] = parsePerhitunganItems(row);

    setSphModalData({
      isOpen: true,
      sourceCalculationIds: [row.id],
      data: {
        sales: row.sales || '',
        namaPt: row.nama_pt || '',
        diskon: row.diskon || 0,
        ongkir: row.ongkir || 0,
        is_ppn: row.is_ppn !== undefined ? row.is_ppn : ((row.ppn !== undefined && row.ppn > 0) || false),
        ppn: row.ppn || 0,
        show_diskon: row.show_diskon !== undefined ? row.show_diskon : true,
        show_ppn: row.show_ppn !== undefined ? row.show_ppn : true,
        show_ongkir: row.show_ongkir !== undefined ? row.show_ongkir : true,
        show_keterangan: row.show_keterangan !== undefined ? row.show_keterangan : true,
        keterangan: (row as any).keterangan || '',
        items: sphLineItems,
        produk: row.produk,
        qty: row.qty,
        hargaJualUnit: row.harga_jual,
        totalHargaJual: row.total_harga_jual,
        sourceCalculationIds: [row.id],
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
      width: 44,
      minWidth: 44,
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
      width: 115,
      minWidth: 110,
      render: (row: Perhitungan) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
          <span>{row.tanggal || '-'}</span>
        </div>
      ),
    },
    {
      key: 'nama_pt',
      title: 'Nama Klien',
      width: 200,
      minWidth: 180,
      render: (row: Perhitungan) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs" title={row.nama_pt || 'Non-PT / Umum'}>
              {row.nama_pt || <span className="text-slate-400 font-normal italic">Non-PT / Umum</span>}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'sales',
      title: 'Sales PIC',
      width: 140,
      minWidth: 130,
      render: (row: Perhitungan) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
            {(row.sales || 'S').charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs truncate max-w-[100px]">
            {row.sales || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'produk',
      title: 'Produk & Model',
      width: 230,
      minWidth: 200,
      render: (row: Perhitungan) => (
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-1" title={row.produk}>
            {row.produk}
          </p>
          {row.kode && row.kode !== '-' && (
            <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-500 w-fit">
              Kode: {row.kode}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'proses_logo',
      title: 'Proses Logo',
      width: 150,
      minWidth: 120,
      render: (row: Perhitungan) => (
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-xs max-w-[135px] truncate"
          title={row.proses_logo || '-'}
        >
          <span className="truncate">{row.proses_logo || '-'}</span>
        </span>
      ),
    },
    {
      key: 'qty',
      title: 'Qty',
      align: 'center',
      width: 95,
      minWidth: 85,
      render: (row: Perhitungan) => (
        <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
          {formatNumber(row.qty)} <span className="text-[10px] font-normal text-slate-400">pcs</span>
        </div>
      ),
    },
    ...(role !== 'sales' ? ([
      {
        key: 'modal_produk',
        title: 'Modal Unit',
        align: 'right',
        width: 120,
        minWidth: 110,
        render: (row: Perhitungan) => <span className="font-mono text-xs text-slate-500 whitespace-nowrap">{formatRupiah(row.modal_produk)}</span>,
      },
      {
        key: 'modal_logo',
        title: 'Modal Logo',
        align: 'right',
        width: 120,
        minWidth: 110,
        render: (row: Perhitungan) => <span className="font-mono text-xs text-slate-500 whitespace-nowrap">{formatRupiah(row.modal_logo)}</span>,
      },
    ] as TableColumn<Perhitungan>[]) : []),
    {
      key: 'margin',
      title: 'Margin',
      align: 'center',
      width: 95,
      minWidth: 90,
      render: (row: Perhitungan) => {
        const m = row.margin || 0;
        const colorClass = m >= 30 
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60'
          : m >= 20 
          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60'
          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60';
        return (
          <span className={`inline-block px-2 py-0.5 rounded-md font-mono text-xs font-bold border whitespace-nowrap ${colorClass}`}>
            {formatPercent(m)}
          </span>
        );
      },
    },
    {
      key: 'total_harga_jual',
      title: 'Total Kotor',
      align: 'right',
      width: 135,
      minWidth: 125,
      render: (row: Perhitungan) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatRupiah(row.total_harga_jual)}</span>,
    },
    {
      key: 'diskon',
      title: 'Diskon',
      align: 'right',
      width: 105,
      minWidth: 95,
      render: (row: Perhitungan) => (
        <span className={`font-mono text-xs whitespace-nowrap ${row.diskon > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
          {row.diskon > 0 ? `-${formatRupiah(row.diskon)}` : '-'}
        </span>
      ),
    },
    {
      key: 'harga_jual_net',
      title: 'Total Net Jual',
      align: 'right',
      width: 145,
      minWidth: 135,
      render: (row: Perhitungan) => (
        <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
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
      width: 130,
      minWidth: 120,
      render: (row: Perhitungan) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => handleOpenSPH(e, row)}
            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all shadow-sm active:scale-95"
            title="Buat SPH (otomatis hapus dari daftar setelah simpan)"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleEdit(e, row)}
            className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-all shadow-sm active:scale-95"
            title="Edit data perhitungan"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleDelete(e, row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all shadow-sm active:scale-95"
            title="Hapus record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [role, selectedIds, dataList]);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-600" />
            Database Perhitungan Harga
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar kalkulasi harga aktif. Centang baris untuk membuat SPH, data akan otomatis dipindahkan ke SPH setelah disimpan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenSPHSelected}
              leftIcon={<Layers className="w-3.5 h-3.5" />}
            >
              Buat SPH ({selectedIds.size} Item)
            </Button>
          )}
          <Link to="/kalkulator">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Hitung Harga Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Card className="p-2.5 sm:p-3 flex items-center gap-2.5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-400">Total Hitungan Aktif</p>
            <p className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatNumber(pagination?.totalRecords || dataList.length)}
            </p>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3 flex items-center gap-2.5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-400">Total Estimasi Net</p>
            <p className="text-sm sm:text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatRupiah(metrics?.totalRevenue || dataList.reduce((acc, c) => acc + (c.harga_jual_net || c.total_harga_jual || 0), 0))}
            </p>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3 flex items-center gap-2.5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-400">Rata-rata Margin</p>
            <p className="text-sm sm:text-base font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatPercent(metrics?.avgMargin || (dataList.length > 0 ? dataList.reduce((a, b) => a + (b.margin || 0), 0) / dataList.length : 0))}
            </p>
          </div>
        </Card>

        <Card className={`p-2.5 sm:p-3 flex items-center gap-2.5 border transition-colors ${
          selectedIds.size > 0 
            ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-300 dark:border-brand-800' 
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}>
          <div className={`p-2 rounded-lg ${
            selectedIds.size > 0 
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-400">Item Terpilih SPH</p>
            <p className={`text-sm sm:text-base font-bold font-mono ${selectedIds.size > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
              {selectedIds.size} <span className="text-[10px] font-normal">item</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Floating Batch Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-brand-600 to-indigo-700 text-white rounded-xl shadow-lg shadow-brand-600/20 animate-fade-in text-xs">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              <b>{selectedIds.size} produk terpilih</b> siap digabungkan menjadi 1 berkas Surat Penawaran Harga (SPH).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenSPHSelected}
              className="bg-white text-brand-700 hover:bg-slate-100 border-transparent font-bold"
              leftIcon={<FileText className="w-3.5 h-3.5 text-brand-700" />}
            >
              Generate SPH Sekarang
            </Button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-white/80 hover:text-white text-xs underline ml-2 cursor-pointer"
            >
              Batal
            </button>
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
        searchPlaceholder="Cari nama klien, produk, kode, sales, proses logo..."
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
          sourceCalculationIds={sphModalData.sourceCalculationIds}
          onSaveSuccess={() => {
            setSelectedIds(new Set());
            refetch();
          }}
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

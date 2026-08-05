import React, { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableColumn, FilterConfig, SortState } from '../../types/table.types';
import { TableToolbar } from './TableToolbar';
import { TableFilterDrawer } from './TableFilterDrawer';
import { TablePagination } from './TablePagination';
import { ColumnVisibilityModal } from './ColumnVisibilityModal';
import { ArrowUp, ArrowDown, ArrowUpDown, Database } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';
import { useToast } from '../../contexts/ToastContext';

export interface EnterpriseDataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  totalRecords: number;
  filteredRecords: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder?: string;
  sort: SortState;
  onSortChange: (column: string) => void;
  filters?: Record<string, any>;
  filterConfigs?: FilterConfig[];
  onSetFilter?: (key: string, value: any) => void;
  onClearFilters?: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  exportFileName?: string;
  toolbarActions?: React.ReactNode;
  enableVirtualization?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function EnterpriseDataTable<T extends { id?: string | number }>({
  columns,
  data,
  totalRecords,
  filteredRecords,
  page,
  limit,
  onPageChange,
  onLimitChange,
  search,
  onSearchChange,
  searchPlaceholder,
  sort,
  onSortChange,
  filters = {},
  filterConfigs = [],
  onSetFilter,
  onClearFilters,
  isLoading = false,
  onRefresh,
  exportFileName = 'data_export',
  toolbarActions,
  enableVirtualization = false,
  emptyMessage = 'Tidak ada data yang ditemukan.',
  onRowClick,
}: EnterpriseDataTableProps<T>) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const { success, error } = useToast();

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: prev[key] !== undefined ? !prev[key] : false,
    }));
  };

  // Filter columns based on visibility preferences
  const activeColumns = useMemo(() => {
    return columns.filter(c => visibleColumns[c.key as string] !== false);
  }, [columns, visibleColumns]);

  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(k => filters[k] !== undefined && filters[k] !== null && filters[k] !== '').length;
  }, [filters]);

  // Virtual Scrolling setup
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52, // Estimated row height in px
    overscan: 10,
    enabled: enableVirtualization && data.length > 30,
  });

  const handleExportExcel = () => {
    try {
      exportToExcel(data, activeColumns, exportFileName);
      success('Export Excel Berhasil', `File ${exportFileName}.xlsx siap diunduh.`);
    } catch (err: any) {
      error('Export Gagal', err.message);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(data, activeColumns, exportFileName);
      success('Export CSV Berhasil', `File ${exportFileName}.csv siap diunduh.`);
    } catch (err: any) {
      error('Export Gagal', err.message);
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        hasFilters={filterConfigs.length > 0}
        activeFilterCount={activeFilterCount}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(prev => !prev)}
        onOpenColumnVisibility={() => setIsColumnModalOpen(true)}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onRefresh={onRefresh}
        isLoading={isLoading}
        actions={toolbarActions}
      />

      {/* Filter Drawer */}
      {filterConfigs.length > 0 && onSetFilter && onClearFilters && (
        <TableFilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filterConfigs={filterConfigs}
          filterValues={filters}
          onSetFilter={onSetFilter}
          onClearFilters={onClearFilters}
        />
      )}

      {/* Table Container */}
      <div
        ref={tableContainerRef}
        className="relative overflow-x-auto overflow-y-auto max-h-[620px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
      >
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-20 bg-slate-100/95 dark:bg-slate-850/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px] select-none">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center text-slate-400">#</th>
              {activeColumns.map(col => {
                const isSorted = sort.column === col.key;
                return (
                  <th
                    key={String(col.key)}
                    style={{ width: col.width }}
                    onClick={() => col.sortable !== false && onSortChange(String(col.key))}
                    className={`py-3.5 px-4 transition-colors ${
                      col.sortable !== false ? 'cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800' : ''
                    } ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${
                      col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{col.title}</span>
                      {col.sortable !== false && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sort.order === 'ASC' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
            {isLoading && data.length === 0 ? (
              // Loading Skeleton
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  <td className="py-4 px-4 text-center">
                    <Skeleton className="h-4 w-4 mx-auto" />
                  </td>
                  {activeColumns.map((col, cIdx) => (
                    <td key={cIdx} className="py-4 px-4">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={activeColumns.length + 1} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <Database className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{emptyMessage}</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Cobalah sesuaikan kata kunci pencarian atau bersihkan filter yang aktif.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Virtualized or Standard Rendering
              data.map((row, idx) => {
                const rowNumber = (page - 1) * limit + idx + 1;
                return (
                  <tr
                    key={row.id ? String(row.id) : idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center text-xs font-mono text-slate-400 select-none">
                      {rowNumber}
                    </td>
                    {activeColumns.map(col => {
                      const val = (row as any)[col.key];
                      return (
                        <td
                          key={String(col.key)}
                          className={`py-3 px-4 ${
                            col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {col.render ? col.render(row, idx) : (val !== undefined && val !== null ? String(val) : '-')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <TablePagination
        page={page}
        limit={limit}
        totalRecords={totalRecords}
        filteredRecords={filteredRecords}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        isLoading={isLoading}
      />

      {/* Column Visibility Modal */}
      <ColumnVisibilityModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={columns}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumnVisibility}
      />
    </div>
  );
}

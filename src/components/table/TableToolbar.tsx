import React from 'react';
import { Search, Filter, SlidersHorizontal, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

export interface TableToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder?: string;
  hasFilters?: boolean;
  activeFilterCount?: number;
  isFilterOpen?: boolean;
  onToggleFilter?: () => void;
  onOpenColumnVisibility?: () => void;
  onExportExcel?: () => void;
  onExportCSV?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  actions?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Cari data secara server-side...',
  hasFilters = true,
  activeFilterCount = 0,
  isFilterOpen = false,
  onToggleFilter,
  onOpenColumnVisibility,
  onExportExcel,
  onExportCSV,
  onRefresh,
  isLoading = false,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
      {/* Left: Server-side Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-150"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <RefreshCw className="w-3 h-3 text-brand-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {hasFilters && onToggleFilter && (
          <Button
            variant={isFilterOpen || activeFilterCount > 0 ? 'primary' : 'outline'}
            size="sm"
            onClick={onToggleFilter}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
          >
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white text-brand-700 font-extrabold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}

        {onOpenColumnVisibility && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenColumnVisibility}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            title="Pengaturan Kolom"
          >
            Kolom
          </Button>
        )}

        {/* Export Excel */}
        {onExportExcel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            title="Export ke Excel (.xlsx)"
          >
            Excel
          </Button>
        )}

        {/* Export CSV */}
        {onExportCSV && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            title="Export ke CSV"
          >
            CSV
          </Button>
        )}

        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        )}

        {actions && <div className="flex items-center gap-2 ml-1">{actions}</div>}
      </div>
    </div>
  );
};

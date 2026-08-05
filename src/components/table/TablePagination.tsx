import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export interface TablePaginationProps {
  page: number;
  limit: number;
  totalRecords: number;
  filteredRecords: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  limit,
  totalRecords,
  filteredRecords,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(filteredRecords / limit));
  const startItem = filteredRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, filteredRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400">
      {/* Left: Records summary */}
      <div className="flex items-center gap-3">
        <span>
          Menampilkan <span className="font-semibold text-slate-900 dark:text-slate-100">{formatNumber(startItem)}</span> - <span className="font-semibold text-slate-900 dark:text-slate-100">{formatNumber(endItem)}</span> dari <span className="font-semibold text-slate-900 dark:text-slate-100">{formatNumber(filteredRecords)}</span> data
          {filteredRecords !== totalRecords && (
            <span className="text-slate-400 ml-1">(difilter dari total {formatNumber(totalRecords)})</span>
          )}
        </span>

        {/* Page size selector */}
        <div className="flex items-center gap-1.5 ml-2">
          <span>Baris:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            {pageSizeOptions.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || isLoading}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg">
          Halaman {formatNumber(page)} / {formatNumber(totalPages)}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
          title="Halaman Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || isLoading}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

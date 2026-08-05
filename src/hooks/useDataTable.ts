import { useState, useMemo, useCallback } from 'react';
import { SortState, SortOrder, PaginationState } from '../types/table.types';
import { useDebounce } from './useDebounce';

interface UseDataTableOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSortBy?: string;
  initialSortOrder?: SortOrder;
  initialFilters?: Record<string, any>;
  debounceMs?: number;
}

export function useDataTable(options: UseDataTableOptions = {}) {
  const [page, setPage] = useState<number>(options.initialPage || 1);
  const [limit, setLimit] = useState<number>(options.initialLimit || 20);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, options.debounceMs || 300);

  const [sort, setSort] = useState<SortState>({
    column: options.initialSortBy || 'created_at',
    order: options.initialSortOrder || 'DESC',
  });

  const [filters, setFilters] = useState<Record<string, any>>(options.initialFilters || {});
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

  const handleSort = useCallback((column: string) => {
    setSort(prev => {
      if (prev.column === column) {
        return {
          column,
          order: prev.order === 'ASC' ? 'DESC' : 'ASC',
        };
      }
      return {
        column,
        order: 'ASC',
      };
    });
    setPage(1); // Reset to page 1 on sort change
  }, []);

  const handleSetFilter = useCallback((key: string, value: any) => {
    setFilters(prev => {
      const next = { ...prev };
      if (value === undefined || value === null || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setPage(1); // Reset to page 1 on filter change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearch('');
    setPage(1);
  }, []);

  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: prev[columnKey] !== undefined ? !prev[columnKey] : false,
    }));
  }, []);

  const queryParams = useMemo(() => ({
    page,
    limit,
    search: debouncedSearch,
    sortBy: sort.column,
    sortOrder: sort.order,
    filters,
  }), [page, limit, debouncedSearch, sort.column, sort.order, filters]);

  return {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
    sort,
    setSort,
    handleSort,
    filters,
    setFilter: handleSetFilter,
    clearFilters: handleClearFilters,
    visibleColumns,
    toggleColumnVisibility,
    queryParams,
  };
}

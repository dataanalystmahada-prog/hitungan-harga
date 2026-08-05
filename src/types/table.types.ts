import React from 'react';

export type SortOrder = 'ASC' | 'DESC';

export interface SortState {
  column: string;
  order: SortOrder;
}

export interface PaginationState {
  page: number;
  limit: number;
  totalRecords: number;
  filteredRecords: number;
  totalPages: number;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'number-range';
  options?: FilterOption[];
  placeholder?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  render?: (row: T, index: number) => React.ReactNode;
  exportValue?: (row: T) => string | number;
  hideable?: boolean;
  defaultHidden?: boolean;
}

export interface DataTableFilterValues {
  search?: string;
  [key: string]: any;
}

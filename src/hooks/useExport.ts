import { useState, useCallback } from 'react';
import { TableColumn } from '../types/table.types';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';
import { useToast } from '../contexts/ToastContext';

export function useExport<T>() {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error } = useToast();

  const handleExportExcel = useCallback((data: T[], columns: TableColumn<T>[], fileName: string) => {
    try {
      setIsExporting(true);
      exportToExcel(data, columns, fileName);
      success('Export Excel Berhasil', `File ${fileName}.xlsx berhasil diunduh.`);
    } catch (err: any) {
      error('Export Gagal', err.message || 'Gagal mengekspor data ke Excel.');
    } finally {
      setIsExporting(false);
    }
  }, [success, error]);

  const handleExportCSV = useCallback((data: T[], columns: TableColumn<T>[], fileName: string) => {
    try {
      setIsExporting(true);
      exportToCSV(data, columns, fileName);
      success('Export CSV Berhasil', `File ${fileName}.csv berhasil diunduh.`);
    } catch (err: any) {
      error('Export Gagal', err.message || 'Gagal mengekspor data ke CSV.');
    } finally {
      setIsExporting(false);
    }
  }, [success, error]);

  return {
    isExporting,
    exportToExcel: handleExportExcel,
    exportToCSV: handleExportCSV,
  };
}

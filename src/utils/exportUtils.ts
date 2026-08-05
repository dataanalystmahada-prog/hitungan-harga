import * as XLSX from 'xlsx';
import { TableColumn } from '../types/table.types';

/**
 * Enterprise Excel (XLSX) Export Utility
 */
export function exportToExcel<T>(
  data: T[],
  columns: TableColumn<T>[],
  fileName: string = 'export_data'
) {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  // Filter out hidden/non-exportable columns
  const exportableCols = columns.filter(c => c.key !== 'actions');

  // Map rows to clean export objects with user-friendly headers
  const exportRows = data.map((row, idx) => {
    const item: Record<string, any> = { 'No': idx + 1 };
    exportableCols.forEach(col => {
      if (col.exportValue) {
        item[col.title] = col.exportValue(row);
      } else {
        const val = (row as any)[col.key];
        item[col.title] = val !== undefined && val !== null ? val : '';
      }
    });
    return item;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  
  // Set automatic column widths
  const colWidths = exportableCols.map(col => ({
    wch: Math.max(col.title.length + 4, 15)
  }));
  colWidths.unshift({ wch: 6 }); // 'No' column width
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
}

/**
 * Enterprise CSV Export Utility
 */
export function exportToCSV<T>(
  data: T[],
  columns: TableColumn<T>[],
  fileName: string = 'export_data'
) {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const exportableCols = columns.filter(c => c.key !== 'actions');
  const headers = ['No', ...exportableCols.map(c => `"${c.title.replace(/"/g, '""')}"`)].join(',');

  const rows = data.map((row, idx) => {
    const values: (string | number)[] = [idx + 1];
    exportableCols.forEach(col => {
      let rawVal: any = col.exportValue ? col.exportValue(row) : (row as any)[col.key];
      if (rawVal === undefined || rawVal === null) rawVal = '';
      const strVal = String(rawVal).replace(/"/g, '""');
      values.push(`"${strVal}"`);
    });
    return values.join(',');
  });

  const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${fileName}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

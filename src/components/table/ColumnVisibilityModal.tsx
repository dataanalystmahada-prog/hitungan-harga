import React from 'react';
import { Modal } from '../common/Modal';
import { TableColumn } from '../../types/table.types';
import { Check } from 'lucide-react';
import { Button } from '../common/Button';

export interface ColumnVisibilityModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  columns: TableColumn<T>[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (columnKey: string) => void;
}

export function ColumnVisibilityModal<T>({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onToggleColumn,
}: ColumnVisibilityModalProps<T>) {
  const hideableCols = columns.filter(c => c.hideable !== false && c.key !== 'actions' && c.key !== 'select');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Kolom Tabel"
      subtitle="Pilih kolom yang ingin ditampilkan atau disembunyikan pada tabel."
      maxWidth="md"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Selesai
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {hideableCols.map(col => {
          const isVisible = visibleColumns[col.key as string] !== false;
          return (
            <label
              key={String(col.key)}
              onClick={() => onToggleColumn(String(col.key))}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer select-none transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  isVisible
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 bg-transparent'
                }`}
              >
                {isVisible && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{col.title}</span>
            </label>
          );
        })}
      </div>
    </Modal>
  );
}

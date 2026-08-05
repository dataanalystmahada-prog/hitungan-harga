import React from 'react';
import { FilterConfig } from '../../types/table.types';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { RotateCcw, X } from 'lucide-react';

export interface TableFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterConfigs: FilterConfig[];
  filterValues: Record<string, any>;
  onSetFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export const TableFilterDrawer: React.FC<TableFilterDrawerProps> = ({
  isOpen,
  onClose,
  filterConfigs,
  filterValues,
  onSetFilter,
  onClearFilters,
}) => {
  if (!isOpen) return null;

  const activeCount = Object.keys(filterValues).filter(k => filterValues[k]).length;

  return (
    <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Filter Server-Side Lanjutan
          </h4>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500 text-white">
              {activeCount} Aktif
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={onClearFilters}
            >
              Reset Filter
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filterConfigs.map(cfg => {
          if (cfg.type === 'select') {
            return (
              <Select
                key={cfg.key}
                label={cfg.label}
                placeholder={`Semua ${cfg.label}`}
                options={cfg.options || []}
                value={filterValues[cfg.key] || ''}
                onChange={(e) => onSetFilter(cfg.key, e.target.value)}
              />
            );
          }
          if (cfg.type === 'text') {
            return (
              <Input
                key={cfg.key}
                label={cfg.label}
                placeholder={cfg.placeholder || `Cari ${cfg.label}...`}
                value={filterValues[cfg.key] || ''}
                onChange={(e) => onSetFilter(cfg.key, e.target.value)}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

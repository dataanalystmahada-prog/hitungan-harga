import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { ChevronDown, Check, X, Search, PlusCircle } from 'lucide-react';

export interface SearchableOption {
  label: string;
  value: string;
  sublabel?: string;
  badge?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  label?: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  allowCustom?: boolean;
  sortAlphabetically?: boolean;
  emptyMessage?: string;
  id?: string;
}

/**
 * Highlight matching text portions based on search query
 */
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }

  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (tokens.length === 0) {
    return <span>{text}</span>;
  }

  try {
    const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) => {
          const isMatch = regex.test(part);
          return isMatch ? (
            <span
              key={index}
              className="bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold px-0.5 rounded"
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </span>
    );
  } catch {
    return <span>{text}</span>;
  }
};

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Ketik atau pilih varian...',
  disabled = false,
  error,
  helperText,
  className,
  allowCustom = true,
  sortAlphabetically = true,
  emptyMessage = 'Tidak ada pilihan yang cocok',
  id,
}) => {
  const generatedId = useId();
  const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : generatedId);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Dynamic floating position for portal
  const [dropdownPos, setDropdownPos] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    width: number;
    maxHeight: number;
    openUp: boolean;
  }>({
    left: 0,
    width: 280,
    maxHeight: 260,
    openUp: false,
  });

  const itemNoun = label?.toLowerCase().includes('produk') ? 'produk' : 'varian';

  // 1. Deduplicate & sort options alphabetically (A-Z)
  const sortedOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: SearchableOption[] = [];

    for (const opt of options) {
      const trimmedVal = String(opt.value ?? '').trim();
      const trimmedLabel = String(opt.label ?? trimmedVal).trim();
      if (!trimmedVal && !trimmedLabel) continue;

      const key = `${trimmedVal}___${trimmedLabel}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          ...opt,
          label: trimmedLabel || trimmedVal,
          value: trimmedVal,
        });
      }
    }

    if (sortAlphabetically) {
      list.sort((a, b) =>
        a.label.localeCompare(b.label, 'id', { numeric: true, sensitivity: 'base' })
      );
    }

    return list;
  }, [options, sortAlphabetically]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    const valTrimmed = (value ?? '').trim().toLowerCase();
    if (!valTrimmed) {
      return sortedOptions.find(opt => opt.value === '');
    }
    return sortedOptions.find(
      opt => opt.value.toLowerCase().trim() === valTrimmed || opt.label.toLowerCase().trim() === valTrimmed
    );
  }, [sortedOptions, value]);

  // Display value for the input when dropdown is closed
  const currentDisplayLabel = selectedOption ? selectedOption.label : (value || '');

  // 2. Filter options based on user typing
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedOptions;

    const tokens = q.split(/\s+/).filter(Boolean);
    return sortedOptions.filter(opt => {
      const lbl = opt.label.toLowerCase();
      const sub = (opt.sublabel || '').toLowerCase();
      const val = opt.value.toLowerCase();
      return tokens.every(token => lbl.includes(token) || sub.includes(token) || val.includes(token));
    });
  }, [sortedOptions, searchQuery]);

  // Check if current search query matches an existing option exactly
  const exactMatchExists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return sortedOptions.some(
      opt => opt.label.toLowerCase().trim() === q || opt.value.toLowerCase().trim() === q
    );
  }, [sortedOptions, searchQuery]);

  // Should we show the custom value option
  const showCustomOption = allowCustom && searchQuery.trim().length > 0 && !exactMatchExists;

  // Total selectable items count for keyboard navigation
  const totalItems = filteredOptions.length + (showCustomOption ? 1 : 0);

  // Position calculation for portal floating dropdown
  const updateDropdownPosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If space below is tight (< 220px) and there's more space above, open upwards!
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;

    // Calculate max height based on available space in chosen direction
    const availableSpace = openUp ? spaceAbove - 24 : spaceBelow - 24;
    const maxHeight = Math.max(140, Math.min(280, availableSpace));

    // Ensure dropdown stays horizontally inside the viewport
    const targetWidth = Math.max(rect.width, 280);
    let left = rect.left;
    if (left + targetWidth > viewportWidth - 12) {
      left = Math.max(12, viewportWidth - targetWidth - 12);
    }

    setDropdownPos({
      left,
      width: targetWidth,
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? viewportHeight - rect.top + 6 : undefined,
      maxHeight,
      openUp,
    });
  };

  // Update position when opened or when scrolling/resizing
  useEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();

    const handleScrollOrResize = () => {
      updateDropdownPosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Close dropdown on click outside (handles both container and portal)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInput = containerRef.current && containerRef.current.contains(target);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      if (!clickedInput && !clickedDropdown) {
        handleCloseDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset highlighted index when filtered items change
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(filteredOptions.length > 0 ? 0 : showCustomOption ? 0 : -1);
    }
  }, [filteredOptions, showCustomOption, isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const element = listRef.current.children[highlightedIndex] as HTMLElement;
      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleOpenDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery('');
  };

  const handleCloseDropdown = () => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    handleCloseDropdown();
    inputRef.current?.blur();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    inputRef.current?.focus();
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        handleOpenDropdown();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1 >= totalItems ? 0 : prev + 1));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 < 0 ? totalItems - 1 : prev - 1));
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex].value);
          } else if (showCustomOption) {
            handleSelect(searchQuery.trim());
          }
        } else if (filteredOptions.length > 0) {
          handleSelect(filteredOptions[0].value);
        } else if (showCustomOption) {
          handleSelect(searchQuery.trim());
        }
        break;

      case 'Escape':
        e.preventDefault();
        handleCloseDropdown();
        break;

      case 'Tab':
        handleCloseDropdown();
        break;
    }
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-1 relative">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>{label}</span>
          {isOpen && (
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
              Ketik untuk memfilter
            </span>
          )}
        </label>
      )}

      {/* Input container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={selectId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          disabled={disabled}
          autoComplete="off"
          value={isOpen ? searchQuery : currentDisplayLabel}
          placeholder={isOpen ? (currentDisplayLabel || placeholder) : placeholder}
          onClick={handleOpenDropdown}
          onFocus={handleOpenDropdown}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setSearchQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 pr-14 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-150 cursor-pointer',
            disabled && 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed',
            error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
            className
          )}
        />

        {/* Right action icons */}
        <div className="absolute right-2 flex items-center gap-1">
          {/* Clear button */}
          {(searchQuery || value) && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={handleClear}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Hapus pilihan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Dropdown toggle chevron */}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              if (isOpen) {
                handleCloseDropdown();
              } else {
                handleOpenDropdown();
                inputRef.current?.focus();
              }
            }}
            className={cn(
              'p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            title="Buka daftar pilihan"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Portal Dropdown Menu - Never covered by sticky bars or cards */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              left: `${dropdownPos.left}px`,
              top: dropdownPos.top !== undefined ? `${dropdownPos.top}px` : undefined,
              bottom: dropdownPos.bottom !== undefined ? `${dropdownPos.bottom}px` : undefined,
              width: `${dropdownPos.width}px`,
              zIndex: 99999,
            }}
            className={cn(
              'rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden flex flex-col',
              dropdownPos.openUp ? 'animate-in fade-in-0 slide-in-from-bottom-2 duration-150' : 'animate-in fade-in-0 slide-in-from-top-2 duration-150'
            )}
          >
            {/* Header Info: Alphabetical & count indicator */}
            <div className="px-3 py-1.5 bg-slate-50/95 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
              <span className="flex items-center gap-1.5">
                <Search className="w-3 h-3 text-slate-400" />
                {searchQuery.trim() ? (
                  <span>Hasil: <b>{filteredOptions.length}</b> {itemNoun}</span>
                ) : (
                  <span>Total: <b>{filteredOptions.length}</b> {itemNoun}</span>
                )}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[9px] border border-indigo-200/60 dark:border-indigo-800/60 tracking-wider">
                A — Z
              </span>
            </div>

            {/* Scrollable Options List */}
            <div
              ref={listRef}
              style={{ maxHeight: `${dropdownPos.maxHeight}px` }}
              className="overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50 py-1"
            >
              {/* Filtered Options */}
              {filteredOptions.map((opt, idx) => {
                const isSelected = selectedOption?.value === opt.value;
                const isHighlighted = highlightedIndex === idx;

                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'px-3 py-2 flex items-center justify-between text-xs cursor-pointer select-none transition-colors duration-100',
                      isSelected
                        ? 'bg-brand-50/80 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-medium'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                      </div>
                      <span className="truncate">
                        <HighlightMatch text={opt.label} query={searchQuery} />
                      </span>
                    </div>

                    {/* Sublabel (e.g. price / badge) */}
                    {opt.sublabel && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Custom typed value option */}
              {showCustomOption && (
                <div
                  role="option"
                  onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                  onClick={() => handleSelect(searchQuery.trim())}
                  className={cn(
                    'px-3 py-2 flex items-center gap-2 text-xs cursor-pointer select-none border-t border-dashed border-slate-200 dark:border-slate-700 transition-colors',
                    highlightedIndex === filteredOptions.length
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
                  )}
                >
                  <PlusCircle className="w-4 h-4 shrink-0 text-indigo-500" />
                  <span className="truncate">
                    Gunakan baru: <b className="font-semibold underline">"{searchQuery.trim()}"</b>
                  </span>
                </div>
              )}

              {/* Empty state */}
              {filteredOptions.length === 0 && !showCustomOption && (
                <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col items-center gap-1">
                  <Search className="w-5 h-5 text-slate-300 dark:text-slate-600 mb-1" />
                  <span>{emptyMessage}</span>
                  {searchQuery && (
                    <span className="text-[11px] text-slate-400 italic">
                      "{searchQuery}"
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
      {!error && helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

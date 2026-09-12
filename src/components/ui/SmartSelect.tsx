'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, Plus, X, Loader2 } from 'lucide-react';

export interface SmartSelectItem {
  id: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  metadata?: any;
}

export interface SmartSelectProps {
  items: SmartSelectItem[];
  value: string;
  onChange: (id: string, item?: SmartSelectItem) => void;
  placeholder?: string;
  headerTitle?: string;
  onCreateNew?: (query: string) => void;
  onPlusClick?: () => void;
  showPlusButton?: boolean;
  plusButtonTitle?: string;
  createItemLabel?: (query: string) => string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  itemTypeLabel?: string;
  normalizeText?: (text: string) => string;
  className?: string;
}

const defaultNormalize = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function SmartSelect({
  items,
  value,
  onChange,
  placeholder = 'Search or select...',
  headerTitle = 'ITEMS',
  onCreateNew,
  onPlusClick,
  showPlusButton = false,
  plusButtonTitle = 'Add New',
  createItemLabel,
  disabled = false,
  loading = false,
  error,
  itemTypeLabel = 'item',
  normalizeText = defaultNormalize,
  className = ''
}: SmartSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    return items.find(item => item.id === value || item.label.toLowerCase() === value.toLowerCase());
  }, [items, value]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter(item => {
      const matchLabel = item.label.toLowerCase().includes(query);
      const matchSub = item.subLabel ? item.subLabel.toLowerCase().includes(query) : false;
      return matchLabel || matchSub;
    });
  }, [items, searchQuery]);

  // Check if query matches any existing item (normalized duplicate check)
  const normalizedQuery = useMemo(() => {
    return normalizeText(searchQuery);
  }, [searchQuery, normalizeText]);

  const exactNormalizedMatch = useMemo(() => {
    if (!normalizedQuery) return null;
    return items.find(item => normalizeText(item.label) === normalizedQuery);
  }, [items, normalizedQuery, normalizeText]);

  // Should we show the "+ Create new" option?
  const canCreate = Boolean(
    onCreateNew &&
    searchQuery.trim().length > 0 &&
    !exactNormalizedMatch
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalOptions = filteredItems.length + (canCreate ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.max(1, totalOptions));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + totalOptions) % Math.max(1, totalOptions));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex < filteredItems.length) {
        const item = filteredItems[highlightedIndex];
        if (item) {
          onChange(item.id, item);
          setIsOpen(false);
        }
      } else if (canCreate && onCreateNew) {
        onCreateNew(searchQuery.trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelectItem = (item: SmartSelectItem) => {
    onChange(item.id, item);
    setIsOpen(false);
  };

  const handleCreateNewClick = () => {
    if (onCreateNew && searchQuery.trim()) {
      onCreateNew(searchQuery.trim());
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex items-center space-x-2">
        {/* Main Selector Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(prev => !prev)}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border transition-all text-left group ${
            error
              ? 'border-rose-500/60 focus:border-rose-500'
              : isOpen
              ? 'border-purple-500 ring-1 ring-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
              : 'border-white/10 hover:border-white/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center space-x-2 truncate flex-1 min-w-0 pr-2">
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" />
            ) : selectedItem ? (
              <>
                {selectedItem.icon && (
                  <span className="shrink-0 flex items-center text-slate-300">
                    {selectedItem.icon}
                  </span>
                )}
                <div className="truncate">
                  <span className="text-slate-100 font-medium">
                    {selectedItem.label}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-slate-300 transition-colors" />
                <span className="text-slate-400 truncate">{placeholder}</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {selectedItem && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                title="Clear selection"
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-purple-400' : 'group-hover:text-slate-300'
              }`}
            />
          </div>
        </button>

        {/* Beside Plus Button */}
        {showPlusButton && onPlusClick && (
          <button
            type="button"
            disabled={disabled}
            onClick={onPlusClick}
            title={plusButtonTitle}
            className="shrink-0 p-2.5 rounded-xl bg-[#1A1D22] border border-white/10 hover:border-purple-500/50 hover:bg-purple-600/10 text-slate-300 hover:text-purple-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-[300] rounded-xl bg-[#14161A] border border-white/15 shadow-2xl overflow-hidden backdrop-blur-md"
            style={{ maxHeight: '320px' }}
          >
            {/* Search Input Header */}
            <div className="p-2 border-b border-white/10 bg-[#171A21]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Type to search or add ${itemTypeLabel}...`}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1A1D22] border border-white/10 rounded-lg text-slate-100 placeholder-slate-400 outline-none focus:border-purple-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 p-1 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Header Title / Stats */}
            <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-[#14161A] border-b border-white/5 flex items-center justify-between">
              <span>{headerTitle}</span>
              <span>{filteredItems.length} available</span>
            </div>

            {/* List Container */}
            <div
              ref={listRef}
              className="max-h-52 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10"
            >
              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Loading {itemTypeLabel}s...</span>
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const isSelected = selectedItem?.id === item.id || selectedItem?.label === item.label;
                  const isHighlighted = idx === highlightedIndex;
                  const isNormalizedMatch = exactNormalizedMatch?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isHighlighted ? 'bg-purple-600/15 text-purple-100' : 'hover:bg-white/5 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate flex-1 pr-2">
                        {item.icon ? (
                          <div className="shrink-0 text-slate-300">{item.icon}</div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-semibold shrink-0">
                            {item.label.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-medium text-slate-100 truncate flex items-center space-x-1.5">
                            <span className="truncate">{item.label}</span>
                            {isNormalizedMatch && searchQuery.trim() && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30 shrink-0">
                                Existing
                              </span>
                            )}
                          </div>
                          {item.subLabel && (
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                              {item.subLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-xs text-slate-400">
                  No {itemTypeLabel}s found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            {/* Bottom: Create New Option */}
            {canCreate && (
              <div className="p-1.5 border-t border-white/10 bg-[#171A21]/90">
                <button
                  type="button"
                  onClick={handleCreateNewClick}
                  onMouseEnter={() => setHighlightedIndex(filteredItems.length)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 text-left transition-colors ${
                    highlightedIndex === filteredItems.length
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-300 hover:bg-purple-600/20 bg-purple-600/10'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {createItemLabel
                      ? createItemLabel(searchQuery.trim())
                      : `+ Create "${searchQuery.trim()}" as new ${itemTypeLabel}`}
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

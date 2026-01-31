'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Column definition
export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortKey?: (row: T) => string | number | Date;
  className?: string;
  headerClassName?: string;
}

// Sort direction
export type SortDirection = 'asc' | 'desc' | null;

// Table props
export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  className?: string;
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (row: T) => string;
  // Pagination
  paginate?: boolean;
  pageSize?: number;
  // Loading state
  loading?: boolean;
  loadingRows?: number;
  // Empty state
  emptyState?: React.ReactNode;
  // Row interaction
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  // Header extras
  headerActions?: React.ReactNode;
}

interface SortState {
  key: string | null;
  direction: SortDirection;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  className,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys,
  paginate = false,
  pageSize = 10,
  loading = false,
  loadingRows = 5,
  emptyState,
  onRowClick,
  rowClassName,
  headerActions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortState, setSortState] = React.useState<SortState>({
    key: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = React.useState(1);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchQuery || !searchKeys) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      const searchableText = searchKeys(row).toLowerCase();
      return searchableText.includes(query);
    });
  }, [data, searchQuery, searchKeys]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortState.key || !sortState.direction) return filteredData;

    const column = columns.find((c) => c.key === sortState.key);
    if (!column || !column.sortable) return filteredData;

    const sortFn = column.sortKey || column.accessor;
    
    return [...filteredData].sort((a, b) => {
      const aVal = sortFn(a);
      const bVal = sortFn(b);
      
      // Handle various types
      let comparison = 0;
      if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortState.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortState, columns]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!paginate) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, paginate, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Reset page when search/sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortState]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    setSortState((prev) => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  };

  const renderSortIcon = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return null;

    if (sortState.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-slate-500" />;
    }
    if (sortState.direction === 'asc') {
      return <ChevronUp className="w-4 h-4 text-emerald-400" />;
    }
    return <ChevronDown className="w-4 h-4 text-emerald-400" />;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden', className)}>
        {/* Header skeleton */}
        {(searchable || headerActions) && (
          <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-700/50">
            {searchable && <Skeleton className="h-10 w-64" />}
            {headerActions && <Skeleton className="h-10 w-32" />}
          </div>
        )}
        
        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={i} className="border-b border-slate-700/30 last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden', className)}>
      {/* Header with search and actions */}
      {(searchable || headerActions) && (
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-700/50">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  'pl-10 pr-10 h-10 rounded-xl',
                  'bg-slate-900/50 border-slate-700/50',
                  'text-white placeholder-slate-500',
                  'focus-visible:ring-emerald-500/50'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          {headerActions}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-900/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400',
                    col.sortable && 'cursor-pointer hover:text-white transition-colors select-none',
                    col.headerClassName
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.header}</span>
                    {renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  {emptyState || (
                    <div className="text-slate-400">
                      {searchQuery ? 'No results found' : 'No data available'}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-slate-700/30 last:border-0',
                    'hover:bg-slate-700/20 transition-colors',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row)
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-sm text-slate-300', col.className)}>
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginate && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-900/30">
          <div className="text-sm text-slate-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'h-8 w-8 p-0',
                      currentPage === page && 'bg-emerald-500 hover:bg-emerald-600'
                    )}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple table for when you just need basic styling
interface SimpleTableProps {
  children: React.ReactNode;
  className?: string;
}

export function SimpleTable({ children, className }: SimpleTableProps) {
  return (
    <div className={cn('rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children, className }: SimpleTableProps) {
  return (
    <thead className={cn('border-b border-slate-700/50 bg-slate-900/30', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: SimpleTableProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ 
  children, 
  className,
  onClick,
}: SimpleTableProps & { onClick?: () => void }) {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        'border-b border-slate-700/30 last:border-0',
        'hover:bg-slate-700/20 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: SimpleTableProps) {
  return (
    <th className={cn(
      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400',
      className
    )}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: SimpleTableProps) {
  return (
    <td className={cn('px-4 py-3 text-sm text-slate-300', className)}>
      {children}
    </td>
  );
}

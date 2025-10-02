'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import AdminCheckbox from './AdminCheckbox';
import AdminButton from './AdminButton';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectRows?: (rows: Set<string>) => void;
  pagination?: PaginationProps;
  sortable?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  getRowId?: (row: T, index: number) => string;
}

export default function AdminTable<T>({
  columns,
  data,
  loading = false,
  emptyState,
  selectable = false,
  selectedRows = new Set(),
  onSelectRows,
  pagination,
  sortable = false,
  sortColumn,
  sortDirection,
  onSort,
  getRowId = (row: T, index: number) => String(index),
}: AdminTableProps<T>) {
  const handleSelectAll = () => {
    if (!onSelectRows) return;
    
    if (selectedRows.size === data.length) {
      onSelectRows(new Set());
    } else {
      const allIds = new Set(data.map((row, index) => getRowId(row, index)));
      onSelectRows(allIds);
    }
  };

  const handleSelectRow = (rowId: string) => {
    if (!onSelectRows) return;
    
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    onSelectRows(newSelected);
  };

  const handleSort = (columnKey: string) => {
    if (!sortable || !onSort) return;
    
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left w-12">
                  <AdminCheckbox
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider',
                    column.sortable && sortable && 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-300',
                    column.width
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortable && (
                      <div className="flex flex-col">
                        <ChevronUpIcon
                          className={cn(
                            'w-3 h-3 -mb-1',
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-brand-primary-600'
                              : 'text-slate-400'
                          )}
                        />
                        <ChevronDownIcon
                          className={cn(
                            'w-3 h-3',
                            sortColumn === column.key && sortDirection === 'desc'
                              ? 'text-brand-primary-600'
                              : 'text-slate-400'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {data.map((row, index) => {
              const rowId = getRowId(row, index);
              return (
                <tr
                  key={rowId}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AdminCheckbox
                        checked={selectedRows.has(rowId)}
                        onChange={() => handleSelectRow(rowId)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100"
                    >
                      {column.render
                        ? column.render(row)
                        : String((row as any)[column.key] || '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <AdminButton
              size="sm"
              variant="secondary"
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Previous
            </AdminButton>
            <AdminButton
              size="sm"
              variant="secondary"
              disabled={
                pagination.currentPage * pagination.pageSize >= pagination.totalItems
              }
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Next
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
}

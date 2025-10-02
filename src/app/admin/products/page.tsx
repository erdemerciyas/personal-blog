'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { AdminLayoutNew } from '@/components/admin/layout';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTable,
  AdminBadge,
  AdminEmptyState,
  AdminSearchInput,
  type Column,
  type PaginationProps,
} from '@/components/admin/ui';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

type AdminListProduct = {
  _id: string;
  title: string;
  condition: 'new' | 'used';
  stock: number;
  coverImage?: string;
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminListProduct[]>([]);
  const [q, setQ] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('created');
  const [cats, setCats] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch('/api/admin/product-categories')
      .then((r) => r.json())
      .then((d) => setCats((d.items as Array<{ _id: string; name: string }>) || []))
      .catch(() => setCats([]));
  }, []);

  // Reload products
  const reload = useCallback(async () => {
    const sp = new URLSearchParams({
      q,
      condition,
      category,
      sort,
      page: String(page),
      limit: String(limit),
    });
    setLoading(true);
    try {
      const d = await fetch(`/api/admin/products?${sp.toString()}`).then((r) => r.json());
      setItems(d.items || []);
      setTotal(d.total || 0);
      setSelectedRows(new Set());
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [q, condition, category, sort, page, limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  const selectedIds = useMemo(() => Array.from(selectedRows), [selectedRows]);

  // Bulk actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`${selectedIds.length} ürünü silmek istediğinize emin misiniz?`)) return;
    }

    try {
      await fetch('/api/admin/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      await reload();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Delete single product
  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      await reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Filter options
  const conditionOptions = [
    { value: '', label: 'Durum (hepsi)' },
    { value: 'new', label: 'Sıfır' },
    { value: 'used', label: 'İkinci El' },
  ];

  const sortOptions = [
    { value: 'created', label: 'Yeni Eklenen' },
    { value: 'priceAsc', label: 'Fiyat Artan' },
    { value: 'priceDesc', label: 'Fiyat Azalan' },
  ];

  const categoryOptions = [
    { value: '', label: 'Kategori (hepsi)' },
    ...cats.map((c) => ({ value: c._id, label: c.name })),
  ];

  const limitOptions = [
    { value: '10', label: '10 / sayfa' },
    { value: '20', label: '20 / sayfa' },
    { value: '50', label: '50 / sayfa' },
  ];

  // Table columns
  const columns: Column<AdminListProduct>[] = [
    {
      key: 'coverImage',
      label: 'Görsel',
      width: '80px',
      render: (product) => (
        <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <Image
            src={product.coverImage || '/placeholder.png'}
            alt={product.title}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Başlık',
      sortable: true,
      render: (product) => (
        <div className="font-medium text-slate-900 dark:text-slate-100">{product.title}</div>
      ),
    },
    {
      key: 'condition',
      label: 'Durum',
      sortable: true,
      render: (product) => (
        <AdminBadge variant={product.condition === 'new' ? 'success' : 'warning'} size="sm">
          {product.condition === 'new' ? 'Sıfır' : 'İkinci El'}
        </AdminBadge>
      ),
    },
    {
      key: 'stock',
      label: 'Stok',
      sortable: true,
      render: (product) => (
        <span className="text-slate-700 dark:text-slate-300">{product.stock}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksiyon',
      width: '180px',
      render: (product) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/edit/${product._id}`}>
            <AdminButton variant="secondary" size="sm" icon={PencilIcon}>
              Düzenle
            </AdminButton>
          </Link>
          <AdminButton
            variant="danger"
            size="sm"
            icon={TrashIcon}
            onClick={() => handleDelete(product._id)}
          >
            Sil
          </AdminButton>
        </div>
      ),
    },
  ];

  // Pagination props
  const paginationProps: PaginationProps = {
    currentPage: page,
    totalItems: total,
    pageSize: limit,
    onPageChange: setPage,
  };

  return (
    <AdminLayoutNew
      title="Ürünler"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Ürün Yönetimi', href: '/admin/products' },
        { label: 'Tüm Ürünler' },
      ]}
      actions={
        <Link href="/admin/products/new">
          <AdminButton variant="primary" icon={PlusIcon}>
            Yeni Ürün
          </AdminButton>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <AdminCard padding="md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <AdminSearchInput
                placeholder="Ürün ara..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                loading={loading}
              />
            </div>
            <AdminSelect
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
              options={conditionOptions}
            />
            <AdminSelect
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              options={categoryOptions}
            />
            <AdminSelect
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              options={sortOptions}
            />
          </div>
        </AdminCard>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <AdminCard padding="sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedIds.length} ürün seçildi
              </span>
              <div className="flex items-center gap-2">
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  Aktif Yap
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Pasif Yap
                </AdminButton>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Sil
                </AdminButton>
              </div>
            </div>
          </AdminCard>
        )}

        {/* Table */}
        <AdminTable
          columns={columns}
          data={items}
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          pagination={paginationProps}
          emptyState={
            <AdminEmptyState
              title="Ürün bulunamadı"
              description={
                q || condition || category
                  ? 'Arama kriterlerinize uygun ürün bulunamadı. Filtreleri temizleyip tekrar deneyin.'
                  : 'Henüz hiç ürün eklenmemiş. İlk ürününüzü ekleyerek başlayın.'
              }
              action={
                q || condition || category ? {
                  label: 'Filtreleri Temizle',
                  onClick: () => {
                    setQ('');
                    setCondition('');
                    setCategory('');
                    setPage(1);
                  }
                } : undefined
              }
            />
          }
        />

        {/* Page Size Selector */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Toplam {total} ürün
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-400">Sayfa başına:</span>
            <AdminSelect
              value={String(limit)}
              onChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
              options={limitOptions}
            />
          </div>
        </div>
      </div>
    </AdminLayoutNew>
  );
}

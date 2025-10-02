'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminBadge } from '@/components/admin/ui';
import { DocumentTextIcon, PencilIcon, Bars3Icon } from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DynamicPage {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  showInNavigation: boolean;
  order: number;
  type: 'dynamic';
}

interface StaticPage {
  pageId: string;
  title: string;
  path: string;
  isActive: boolean;
  showInNavigation: boolean;
  order: number;
  type: 'static';
}

type PageItem = DynamicPage | StaticPage;

// Sortable item component
function SortablePageItem({ page, onToggleActive, onToggleVisibility, saving }: {
  page: PageItem;
  onToggleActive: () => void;
  onToggleVisibility: () => void;
  saving: string | null;
}) {
  const isStatic = page.type === 'static';
  const isActive = isStatic ? (page as StaticPage).isActive : (page as DynamicPage).isPublished;
  const pageUrl = isStatic ? (page as StaticPage).path : `/${(page as DynamicPage).slug}`;
  const pageKey = isStatic ? (page as StaticPage).pageId : (page as DynamicPage)._id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pageKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
        isDragging ? 'z-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          title="Sürükle"
        >
          <Bars3Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </button>

        {/* Page Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">{page.title}</h3>
            <AdminBadge variant={isStatic ? 'warning' : 'success'} size="sm">
              {isStatic ? 'Sistem' : 'Özel'}
            </AdminBadge>
            {page.showInNavigation && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                (Sıra: {page.order})
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{pageUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Active/Passive Toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleActive();
            }}
            disabled={saving === pageKey}
            className="relative cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Tıkla: ${isActive ? 'Pasif yap' : 'Aktif yap'}`}
          >
            <AdminBadge variant={isActive ? 'success' : 'neutral'} size="sm">
              {saving === pageKey ? '...' : isActive ? '✓ Aktif' : '✗ Pasif'}
            </AdminBadge>
          </button>

          {/* Visibility Toggle - Click to show/hide in nav menu */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleVisibility();
            }}
            disabled={saving === pageKey}
            className="relative cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Tıkla: ${page.showInNavigation ? 'Nav menüden gizle' : 'Nav menüde göster'}`}
          >
            <AdminBadge variant={page.showInNavigation ? 'info' : 'neutral'} size="sm">
              {saving === pageKey ? '...' : page.showInNavigation ? '👁 Göster' : '🔒 Gizle'}
            </AdminBadge>
          </button>

          {/* Edit Button (only for dynamic pages) */}
          {!isStatic && (
            <Link href={`/admin/pages/edit/${(page as DynamicPage)._id}`}>
              <AdminButton variant="secondary" size="sm" icon={PencilIcon}>
                Düzenle
              </AdminButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagesManagement() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadPages = async () => {
    try {
      const [dynamicRes, staticRes] = await Promise.all([
        fetch('/api/admin/pages'),
        fetch('/api/admin/page-settings')
      ]);

      const dynamicPages = dynamicRes.ok ? await dynamicRes.json() : [];
      const staticPages = staticRes.ok ? await staticRes.json() : [];

      const allPages: PageItem[] = [
        ...staticPages.map((p: any) => ({ ...p, type: 'static' as const })),
        ...dynamicPages.map((p: any) => ({ ...p, type: 'dynamic' as const }))
      ].sort((a, b) => a.order - b.order);

      setPages(allPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sayfalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = pages.findIndex(p => 
      p.type === 'static' ? (p as StaticPage).pageId === active.id : (p as DynamicPage)._id === active.id
    );
    const newIndex = pages.findIndex(p => 
      p.type === 'static' ? (p as StaticPage).pageId === over.id : (p as DynamicPage)._id === over.id
    );

    const newPages = arrayMove(pages, oldIndex, newIndex);
    
    // Update order numbers
    const updatedPages = newPages.map((page, index) => ({
      ...page,
      order: index
    }));

    setPages(updatedPages);
    setReordering(true);

    try {
      // Update orders in backend
      const staticUpdates = updatedPages
        .filter(p => p.type === 'static')
        .map(p => ({
          pageId: (p as StaticPage).pageId,
          order: p.order
        }));

      const dynamicUpdates = updatedPages
        .filter(p => p.type === 'dynamic')
        .map(p => ({
          _id: (p as DynamicPage)._id,
          order: p.order
        }));

      await Promise.all([
        staticUpdates.length > 0 && fetch('/api/admin/page-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staticUpdates)
        }),
        ...dynamicUpdates.map(update =>
          fetch(`/api/admin/pages/${update._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: update.order })
          })
        )
      ]);

      window.dispatchEvent(new Event('pageSettingsChanged'));
    } catch (err) {
      setError('Sıralama kaydedilemedi');
      await loadPages(); // Reload on error
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <AdminLayoutNew
        title="Sayfa Yönetimi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Sayfalar' }
        ]}
      >
        <AdminCard title="Sayfalar" padding="md">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Yükleniyor...</p>
          </div>
        </AdminCard>
      </AdminLayoutNew>
    );
  }

  return (
    <AdminLayoutNew
      title="Sayfa Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Sayfalar' }
      ]}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      <AdminCard 
        title={`Tüm Sayfalar (${pages.length})${reordering ? ' - Sıralama kaydediliyor...' : ''}`}
        padding="none"
      >
        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Henüz sayfa yok
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Sistem sayfaları otomatik olarak yüklenecektir.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Bars3Icon className="w-4 h-4" />
                Sayfaları sürükleyerek nav menü sırasını değiştirebilirsiniz
              </p>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pages.map(p => p.type === 'static' ? (p as StaticPage).pageId : (p as DynamicPage)._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {pages.map(page => {
                    const isStatic = page.type === 'static';
                    const pageKey = isStatic ? (page as StaticPage).pageId : (page as DynamicPage)._id;

                    const handleToggleVisibility = async () => {
                      setSaving(pageKey);
                      const newValue = !page.showInNavigation;
                      
                      try {
                        if (isStatic) {
                          const staticPage = page as StaticPage;
                          const response = await fetch('/api/admin/page-settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              pageId: staticPage.pageId,
                              showInNavigation: newValue
                            })
                          });
                          
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Güncelleme başarısız');
                          }
                        } else {
                          const dynamicPage = page as DynamicPage;
                          const response = await fetch(`/api/admin/pages/${dynamicPage._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              showInNavigation: newValue
                            })
                          });
                          
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || 'Güncelleme başarısız');
                          }
                        }
                        
                        await loadPages();
                        window.dispatchEvent(new Event('pageSettingsChanged'));
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Görünürlük değiştirilemedi');
                      } finally {
                        setSaving(null);
                      }
                    };

                    const handleToggleActive = async () => {
                      setSaving(pageKey);
                      const isActive = isStatic ? (page as StaticPage).isActive : (page as DynamicPage).isPublished;
                      const newValue = !isActive;
                      
                      try {
                        if (isStatic) {
                          const staticPage = page as StaticPage;
                          const response = await fetch('/api/admin/page-settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              pageId: staticPage.pageId,
                              isActive: newValue
                            })
                          });
                          
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Güncelleme başarısız');
                          }
                        } else {
                          const dynamicPage = page as DynamicPage;
                          const response = await fetch(`/api/admin/pages/${dynamicPage._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              isPublished: newValue
                            })
                          });
                          
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || 'Güncelleme başarısız');
                          }
                        }
                        
                        await loadPages();
                        window.dispatchEvent(new Event('pageSettingsChanged'));
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Durum değiştirilemedi');
                      } finally {
                        setSaving(null);
                      }
                    };

                    return (
                      <SortablePageItem
                        key={pageKey}
                        page={page}
                        onToggleActive={handleToggleActive}
                        onToggleVisibility={handleToggleVisibility}
                        saving={saving}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </AdminCard>
    </AdminLayoutNew>
  );
}

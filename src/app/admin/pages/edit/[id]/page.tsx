'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminCheckbox, AdminAlert, AdminSpinner } from '@/components/admin/ui';
import { CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: false,
    showInNavigation: false,
    order: 999
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`/api/admin/pages/${params.id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Sayfa bulunamadı'))
      .then(data => {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          isPublished: data.isPublished || false,
          showInNavigation: data.showInNavigation || false,
          order: data.order || 999
        });
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    console.log('Saving page with data:', formData);

    try {
      const response = await fetch(`/api/admin/pages/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Save failed:', data);
        throw new Error(data.error || 'Sayfa güncellenemedi');
      }

      const savedData = await response.json();
      console.log('Page saved successfully:', savedData);

      setSuccess('Sayfa başarıyla güncellendi!');
      
      // Trigger navigation refresh
      window.dispatchEvent(new Event('pageSettingsChanged'));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) return;

    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/pages/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Sayfa silinemedi');
      }

      router.push('/admin/pages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayoutNew title="Sayfa Düzenle">
        <div className="flex justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  return (
    <AdminLayoutNew
      title="Sayfa Düzenle"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Sayfalar', href: '/admin/pages' },
        { label: 'Düzenle' }
      ]}
      actions={
        <div className="flex gap-3">
          <AdminButton
            variant="danger"
            icon={TrashIcon}
            onClick={handleDelete}
            loading={deleting}
          >
            Sil
          </AdminButton>
          <AdminButton
            variant="secondary"
            icon={XMarkIcon}
            onClick={() => router.push('/admin/pages')}
          >
            İptal
          </AdminButton>
          <AdminButton
            variant="primary"
            icon={CheckIcon}
            onClick={handleSubmit}
            loading={saving}
          >
            Kaydet
          </AdminButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <AdminAlert variant="error" onClose={() => setError('')}>
            {error}
          </AdminAlert>
        )}

        {success && (
          <AdminAlert variant="success" onClose={() => setSuccess('')}>
            {success}
          </AdminAlert>
        )}

        <AdminCard title="Temel Bilgiler" padding="md">
          <div className="space-y-4">
            <AdminInput
              label="Sayfa Başlığı"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Örn: Hakkımızda"
            />

            <AdminInput
              label="Slug (URL)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              placeholder="hakkimizda"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">URL'de görünecek kısım</p>

            <AdminTextarea
              label="Özet"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Sayfa hakkında kısa bir açıklama..."
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">Maksimum 500 karakter</p>

            <AdminTextarea
              label="İçerik"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              required
              placeholder="Sayfa içeriğini buraya yazın..."
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">HTML ve Markdown desteklenir</p>
          </div>
        </AdminCard>

        <AdminCard title="SEO Ayarları" padding="md">
          <div className="space-y-4">
            <AdminInput
              label="Meta Başlık"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              placeholder="SEO için özel başlık (opsiyonel)"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">Maksimum 60 karakter</p>

            <AdminTextarea
              label="Meta Açıklama"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              rows={3}
              placeholder="Arama motorları için açıklama (opsiyonel)"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">Maksimum 160 karakter</p>
          </div>
        </AdminCard>

        <AdminCard title="Yayın Ayarları" padding="md">
          <div className="space-y-6">
            {/* Publish Toggle */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => {
                  console.log('Publish checkbox changed:', e.target.checked);
                  setFormData({ ...formData, isPublished: e.target.checked });
                }}
                className="w-5 h-5 mt-1 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="isPublished" className="font-medium text-slate-900 dark:text-white cursor-pointer">
                  Sayfayı yayınla (Canlıya al)
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {formData.isPublished 
                    ? '✓ Sayfa sitede görünür olacak' 
                    : '✗ Sayfa taslak olarak kalacak (sadece admin görebilir)'}
                </p>
              </div>
            </div>
            
            {/* Navigation Toggle */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <input
                type="checkbox"
                id="showInNavigation"
                checked={formData.showInNavigation}
                onChange={(e) => {
                  console.log('Navigation checkbox changed:', e.target.checked);
                  setFormData({ ...formData, showInNavigation: e.target.checked });
                }}
                className="w-5 h-5 mt-1 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="showInNavigation" className="font-medium text-slate-900 dark:text-white cursor-pointer">
                  Navigasyon menüsünde göster
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {formData.showInNavigation 
                    ? '✓ Sayfa nav menüde görünecek' 
                    : '✗ Sayfa sadece direkt link ile erişilebilir'}
                </p>
              </div>
            </div>

            {/* Menu Order */}
            <div>
              <AdminInput
                label="Menü Sırası"
                type="number"
                value={formData.order.toString()}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 999 })}
                placeholder="999"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Küçük sayı = Önce görünür (0, 1, 2, 3...). Varsayılan: 999 (en sonda)
              </p>
            </div>
          </div>
        </AdminCard>
      </form>
    </AdminLayoutNew>
  );
}

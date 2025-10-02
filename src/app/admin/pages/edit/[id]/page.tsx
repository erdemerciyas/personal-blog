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
    isPublished: false
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
          isPublished: data.isPublished || false
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

    try {
      const response = await fetch(`/api/admin/pages/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Sayfa güncellenemedi');
      }

      setSuccess('Sayfa başarıyla güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
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
              helpText="URL'de görünecek kısım"
            />

            <AdminTextarea
              label="Özet"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Sayfa hakkında kısa bir açıklama..."
              helpText="Maksimum 500 karakter"
            />

            <AdminTextarea
              label="İçerik"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              required
              placeholder="Sayfa içeriğini buraya yazın..."
              helpText="HTML ve Markdown desteklenir"
            />
          </div>
        </AdminCard>

        <AdminCard title="SEO Ayarları" padding="md">
          <div className="space-y-4">
            <AdminInput
              label="Meta Başlık"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              placeholder="SEO için özel başlık (opsiyonel)"
              helpText="Maksimum 60 karakter"
            />

            <AdminTextarea
              label="Meta Açıklama"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              rows={3}
              placeholder="Arama motorları için açıklama (opsiyonel)"
              helpText="Maksimum 160 karakter"
            />
          </div>
        </AdminCard>

        <AdminCard title="Yayın Ayarları" padding="md">
          <AdminCheckbox
            label="Sayfayı yayınla"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
            helpText="Yayınlanan sayfalar sitede görünür olacaktır"
          />
        </AdminCard>
      </form>
    </AdminLayoutNew>
  );
}

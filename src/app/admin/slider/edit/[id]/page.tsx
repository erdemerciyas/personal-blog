'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminAlert, AdminSpinner } from '@/components/admin/ui';
import MediaPicker from '@/components/admin/MediaPicker';
import { CheckIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function EditSliderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
    order: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/slider/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setFormData({
            title: data.title || '',
            subtitle: data.subtitle || '',
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            buttonText: data.buttonText || '',
            buttonLink: data.buttonLink || '',
            isActive: data.isActive ?? true,
            order: data.order || 0,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Slider yüklenemedi');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/slider/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Slider başarıyla güncellendi!');
        setTimeout(() => router.push('/admin/slider'), 1500);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Slider güncellenemedi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayoutNew
        title="Slider Düzenle"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Slider', href: '/admin/slider' },
          { label: 'Düzenle' },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  return (
    <AdminLayoutNew
      title="Slider Düzenle"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Slider', href: '/admin/slider' },
        { label: 'Düzenle' },
      ]}
      actions={
        <div className="flex gap-3">
          <AdminButton
            variant="secondary"
            icon={XMarkIcon}
            onClick={() => router.push('/admin/slider')}
          >
            İptal
          </AdminButton>
          <AdminButton
            variant="primary"
            icon={CheckIcon}
            onClick={handleSubmit}
            loading={saving}
          >
            Güncelle
          </AdminButton>
        </div>
      }
    >
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminCard title="Temel Bilgiler" padding="md">
          <div className="space-y-4">
            <AdminInput
              label="Başlık"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Slider başlığı"
            />

            <AdminInput
              label="Alt Başlık"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Slider alt başlığı"
            />

            <AdminTextarea
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Slider açıklaması (opsiyonel)"
            />

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Görsel <span className="text-red-500">*</span>
              </label>
              
              {/* Media Picker Button */}
              <div>
                <AdminButton
                  type="button"
                  variant="primary"
                  icon={PhotoIcon}
                  onClick={() => setShowMediaPicker(true)}
                  className="w-full sm:w-auto"
                >
                  Medya Kütüphanesinden Seç
                </AdminButton>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  veya Görsel URL'si girin:
                </label>
                <AdminInput
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  placeholder="https://example.com/image.jpg"
                  helperText=""
                />
              </div>
            </div>

            {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Önizleme:
                </p>
                <div className="w-full h-48 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </AdminCard>

        <AdminCard title="Buton Ayarları" padding="md">
          <div className="space-y-4">
            <AdminInput
              label="Buton Metni"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              placeholder="Daha Fazla Bilgi"
            />

            <AdminInput
              label="Buton Linki"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              placeholder="/hakkimizda"
            />
          </div>
        </AdminCard>

        <AdminCard title="Ayarlar" padding="md">
          <div className="space-y-4">
            <AdminInput
              label="Sıra"
              type="number"
              value={formData.order.toString()}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              helperText="Küçük sayı önce gösterilir"
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Aktif (Sitede göster)
              </label>
            </div>
          </div>
        </AdminCard>
      </form>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => setFormData({ ...formData, imageUrl: url })}
        selectedUrl={formData.imageUrl}
        context="slider"
      />
    </AdminLayoutNew>
  );
}

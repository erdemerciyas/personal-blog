'use client';

import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Language {
  _id: string;
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  isDefault: boolean;
  isActive: boolean;
  direction: 'ltr' | 'rtl';
}

const EMPTY_FORM = {
  code: '',
  label: '',
  nativeLabel: '',
  flag: '🌐',
  isDefault: false,
  isActive: true,
  direction: 'ltr' as 'ltr' | 'rtl',
};

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  useEffect(() => { fetchLanguages(); }, []);

  async function fetchLanguages() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/languages');
      const json = await res.json();
      if (json.success) setLanguages(json.data);
    } catch {
      setError('Diller yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
    setError('');
    setSuccess('');
  }

  function openEdit(lang: Language) {
    setForm({
      code: lang.code,
      label: lang.label,
      nativeLabel: lang.nativeLabel,
      flag: lang.flag,
      isDefault: lang.isDefault,
      isActive: lang.isActive,
      direction: lang.direction,
    });
    setEditId(lang._id);
    setShowForm(true);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = editId
        ? `/api/admin/languages/${editId}`
        : '/api/admin/languages';
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? 'Bir hata oluştu.');
      } else {
        setSuccess(editId ? 'Dil güncellendi.' : 'Dil eklendi.');
        setShowForm(false);
        fetchLanguages();
      }
    } catch {
      setError('Sunucu hatası.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, isDefault: boolean) {
    if (isDefault) {
      setError('Varsayılan dil silinemez.');
      return;
    }
    if (!confirm('Bu dili silmek istediğinizden emin misiniz?')) return;

    const res = await fetch(`/api/admin/languages/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      fetchLanguages();
    } else {
      setError(json.error ?? 'Silinemedi.');
    }
  }

  async function toggleActive(lang: Language) {
    await fetch(`/api/admin/languages/${lang._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !lang.isActive }),
    });
    fetchLanguages();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dil Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Aktif dilleri ve varsayılan dili buradan yönetebilirsiniz.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Dil Ekle
        </button>
      </div>

      {/* Messages */}
      {error   && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <h2 className="font-semibold text-slate-800">
            {editId ? 'Dili Düzenle' : 'Yeni Dil Ekle'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dil Kodu *</label>
              <input
                required
                disabled={!!editId}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="tr, es, en..."
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bayrak Emojisi</label>
              <input
                value={form.flag}
                onChange={(e) => setForm({ ...form, flag: e.target.value })}
                placeholder="🇹🇷"
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dil Adı (TR) *</label>
              <input
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Türkçe"
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Yerel Ad *</label>
              <input
                required
                value={form.nativeLabel}
                onChange={(e) => setForm({ ...form, nativeLabel: e.target.value })}
                placeholder="Türkçe"
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Yazı Yönü</label>
              <select
                value={form.direction}
                onChange={(e) => setForm({ ...form, direction: e.target.value as 'ltr' | 'rtl' })}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ltr">Soldan sağa (LTR)</option>
                <option value="rtl">Sağdan sola (RTL)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Varsayılan dil
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Aktif
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Ekle'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Language list */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : languages.length === 0 ? (
          <div className="py-12 text-center">
            <GlobeAltIcon className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Henüz dil eklenmemiş.</p>
            <button onClick={openNew} className="mt-3 text-sm font-medium text-emerald-600 hover:underline">
              İlk dili ekle
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Dil', 'Kod', 'Yön', 'Durum', 'İşlemler'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {languages.map((lang) => (
                <tr key={lang._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{lang.label}</p>
                        <p className="text-xs text-slate-400">{lang.nativeLabel}</p>
                      </div>
                      {lang.isDefault && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircleIcon className="h-3 w-3" />
                          Varsayılan
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">{lang.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 uppercase">{lang.direction}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(lang)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        lang.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {lang.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(lang)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Düzenle"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lang._id, lang.isDefault)}
                        disabled={lang.isDefault}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

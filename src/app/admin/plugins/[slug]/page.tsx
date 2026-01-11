/**
 * Plugin Configuration Page
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Plugin {
  _id: string;
  name: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  type: 'built-in' | 'custom';
  dependencies: string[];
  config?: Record<string, any>;
}

export default function PluginSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params?.slug as string;

  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchPlugin();
  }, [slug]);

  const fetchPlugin = async () => {
    try {
      setLoading(true);
      setError(null);
      // URL contains ID, so fetch by ID
      const response = await fetch(`/api/admin/plugins/${slug}`);
      const data = await response.json();

      if (data.success) {
        setPlugin(data.data);
        setSettings(data.data.config || {});
      } else {
        setError(data.error || 'Plugin bulunamadı');
      }
    } catch (error) {
      console.error('Error fetching plugin:', error);
      setError('Plugin yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!plugin) return;

    setError(null);
    try {
      setSaving(true);

      const response = await fetch(`/api/admin/plugins/${plugin._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: settings }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.error || 'Ayarlar kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!session?.user || !plugin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{plugin.name}</h1>
          <p className="text-base text-slate-600 mt-1">{plugin.description}</p>
          <p className="text-sm text-slate-500 mt-2">
            v{plugin.version} • {plugin.author}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {plugin.isActive && (
            <div className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-medium">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Aktif
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Ayarlar başarıyla kaydedildi!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Cog6ToothIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Eklenti Ayarları</h2>
            <p className="text-sm text-slate-500">Eklenti yapılandırmasını yönetin</p>
          </div>
        </div>

        {/* Dynamic Settings Form */}
        {Object.keys(settings).length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
            <Cog6ToothIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Bu eklenti için yapılandırılabilir ayar bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(settings).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-slate-700 mb-2">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                </label>
                {typeof value === 'boolean' ? (
                  <div className="flex items-center">
                    <input
                      id={key}
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-0"
                      disabled={saving}
                    />
                    <span className="ml-2 text-sm text-slate-600">
                      {value ? 'Etkin' : 'Devre dışı'}
                    </span>
                  </div>
                ) : typeof value === 'number' ? (
                  <input
                    id={key}
                    type="number"
                    value={value as number}
                    onChange={(e) => handleSettingChange(key, parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={saving}
                  />
                ) : typeof value === 'string' ? (
                  value.length > 100 ? (
                    <textarea
                      id={key}
                      value={value as string}
                      onChange={(e) => handleSettingChange(key, e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      disabled={saving}
                    />
                  ) : (
                    <input
                      id={key}
                      type="text"
                      value={value as string}
                      onChange={(e) => handleSettingChange(key, e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      disabled={saving}
                    />
                  )
                ) : (
                  <input
                    id={key}
                    type="text"
                    value={String(value)}
                    onChange={(e) => handleSettingChange(key, e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={saving}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        {Object.keys(settings).length > 0 && (
          <div className="flex justify-end pt-6 border-t border-slate-200/60">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-8 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Ayarları Kaydet</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Plugin Info */}
      {plugin.dependencies.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <InformationCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Bağımlılıklar</h2>
              <p className="text-sm text-slate-500">Bu eklentinin gerektirdiği bileşenler</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {plugin.dependencies.map((dep) => (
              <span
                key={dep}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Link
          href="/admin/plugins"
          className="flex items-center space-x-2 px-6 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Eklentilere Dön</span>
        </Link>
      </div>
    </div>
  );
}

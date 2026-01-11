/**
 * Theme Customization Page
 * Customize theme colors, fonts, layout, hero, buttons, cards, and more
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActiveTheme } from '@/providers/ActiveThemeProvider';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  Cog6ToothIcon,
  XMarkIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  CubeIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

// --- Interfaces ---

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background?: string;
    text?: string;
    textLight?: string;
    white?: string;
    black?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };
  typography?: {
    fonts?: {
      heading?: string;
      body?: string;
      button?: string;
      nav?: string;
    };
    sizes?: {
      h1?: string;
      h2?: string;
      h3?: string;
      h4?: string;
      h5?: string;
      h6?: string;
      body?: string;
      small?: string;
      tiny?: string;
    };
    weights?: {
      light?: string;
      normal?: string;
      medium?: string;
      semibold?: string;
      bold?: string;
      extrabold?: string;
    };
    lineHeights?: {
      tight?: string;
      normal?: string;
      relaxed?: string;
      loose?: string;
    };
  };
  hero?: {
    enabled?: boolean;
    height?: string;
    minHeight?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    overlay?: {
      enabled?: boolean;
      color?: string;
      opacity?: number;
    };
    title?: {
      text?: string;
      color?: string;
      fontSize?: string;
      fontWeight?: string;
      lineHeight?: string;
      marginBottom?: string;
      textShadow?: string;
    };
    subtitle?: {
      text?: string;
      color?: string;
      fontSize?: string;
      fontWeight?: string;
      lineHeight?: string;
      marginBottom?: string;
    };
    buttons?: {
      primary?: any;
      secondary?: any;
    };
    alignment?: 'left' | 'center' | 'right';
    animation?: {
      enabled?: boolean;
      type?: string;
      duration?: string;
    };
  };
  buttons?: {
    primary?: any;
    secondary?: any;
    tertiary?: any;
  };
  cards?: any;
  navigation?: any;
  spacing?: any;
  borderRadius?: any;
  shadows?: any;
  forms?: any;
  layout?: {
    maxWidth?: number;
    sidebar?: boolean;
    headerStyle?: string;
    footerStyle?: string;
    containerPadding?: string;
    sectionPadding?: string;
  };
  features?: {
    heroSlider?: boolean;
    portfolioGrid?: boolean;
    blogList?: boolean;
    contactForm?: boolean;
  };
  transitions?: any;
  fonts?: {
    heading?: string;
    body?: string;
  };
  footer?: any;
}

interface Theme {
  _id: string;
  name: string;
  slug: string;
  config: ThemeConfig;
}

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito'
];

const HEADER_STYLES = ['fixed', 'static', 'sticky'];
const FOOTER_STYLES = ['simple', 'complex', 'minimal'];

export default function ThemeCustomizePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { refreshTheme } = useActiveTheme();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');

  // Default config state
  const [config, setConfig] = useState<ThemeConfig>({
    colors: {
      primary: '#0066ff',
      secondary: '#a855f7',
      accent: '#0066ff',
      background: '#f5f5f0',
      text: '#1e293b',
      textLight: '#64748b',
      white: '#ffffff',
      black: '#0f172a',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    typography: {
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        button: 'Inter',
        nav: 'Inter',
      },
      sizes: {
        h1: '3rem',
        h2: '2.5rem',
        h3: '2rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem',
        body: '1rem',
        small: '0.875rem',
        tiny: '0.75rem',
      },
      weights: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      lineHeights: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },
    },
    hero: {},
    buttons: {},
    cards: {},
    navigation: {},
    forms: {},
    layout: {}
  } as ThemeConfig);

  const fetchTheme = useCallback(async () => {
    if (!params?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/themes/${params?.id}`);
      const data = await response.json();

      if (data.success) {
        setTheme(data.data);
        setConfig(data.data.config);
      } else {
        alert(data.error || 'Tema yüklenemedi');
        router.push('/admin/themes');
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
      alert('Tema yüklenemedi');
      router.push('/admin/themes');
    } finally {
      setLoading(false);
    }
  }, [params?.id, router]);

  const handleConfigChange = (section: string, subsection: string | null, key: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };

      if (subsection) {
        (newConfig as any)[section] = {
          ...(prev as any)[section],
          [subsection]: {
            ...((prev as any)[section]?.[subsection]),
            [key]: value
          }
        };
      } else {
        (newConfig as any)[section] = {
          ...(prev as any)[section],
          [key]: value
        };
      }

      return newConfig;
    });
    setHasChanges(true);
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
    setHasChanges(true);
  };

  const saveCustomization = async () => {
    if (!params?.id) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/themes/${params?.id}/customize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Tema kişiselleştirmesi başarıyla kaydedildi');
        setHasChanges(false);
        setTheme(data.data);
        await refreshTheme();
      } else {
        alert(data.error || 'Kayıt başarısız');
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      alert('Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!confirm('Varsayılan ayarlara dönmek istediğinize emin misiniz?')) {
      return;
    }

    if (theme) {
      setConfig(theme.config);
      setHasChanges(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchTheme();
    }
  }, [params?.id, fetchTheme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
          <p className="text-lg font-medium text-slate-600">Loading theme...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'colors', label: 'Renkler', icon: PaintBrushIcon },
    { id: 'typography', label: 'Tipografi', icon: AdjustmentsHorizontalIcon },
    { id: 'hero', label: 'Alt Sayfa Hero', icon: PhotoIcon },
    { id: 'footer', label: 'Footer', icon: CubeIcon },
    { id: 'buttons', label: 'Butonlar', icon: CubeIcon },
    { id: 'cards', label: 'Kartlar', icon: CubeIcon },
    { id: 'navigation', label: 'Navigasyon', icon: CubeIcon },
    { id: 'spacing', label: 'Boşluklar', icon: AdjustmentsHorizontalIcon },
    { id: 'forms', label: 'Formlar', icon: CubeIcon },
    { id: 'layout', label: 'Düzen', icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* --- LEFT SIDEBAR (Navigation) --- */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-20">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => router.push(`/admin/themes`)}
            className="flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Temalara Dön
          </button>
        </div>

        {/* Tabs List */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <button
            onClick={saveCustomization}
            disabled={saving || !hasChanges}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-all ${hasChanges
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {saving ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Kaydet
              </>
            )}
          </button>

          {hasChanges && (
            <button
              onClick={resetToDefault}
              className="w-full flex items-center justify-center px-4 py-2 text-slate-600 hover:text-red-600 text-sm font-medium transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Geri Al
            </button>
          )}
        </div>
      </div>

      {/* --- CENTER PANEL (Main Content) --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <p className="text-slate-500 mt-1">
            {theme?.name} ayarlarını düzenliyorsunuz.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8 pb-10">
            {/* TABS PLACEHOLDER - Will be replaced progressively */}
            {activeTab === 'colors' && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Temel Renkler</h3>
                <div className="space-y-4">
                  {[
                    { key: 'primary', label: 'Birincil Renk', desc: 'Ana butonlar ve vurgular için' },
                    { key: 'secondary', label: 'İkincil Renk', desc: 'Yan vurgular ve ikincil butonlar' },
                    { key: 'accent', label: 'Vurgu Rengi', desc: 'Özel alanlar ve dikkat çekici öğeler' },
                    { key: 'background', label: 'Arkaplan Rengi', desc: 'Sayfa genel arkaplanı' },
                    { key: 'text', label: 'Metin Rengi', desc: 'Genel metin rengi' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">{label}</label>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                          <input
                            type="color"
                            value={config.colors[key as keyof typeof config.colors] || '#000000'}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 cursor-pointer border-none"
                          />
                        </div>
                        <input
                          type="text"
                          value={config.colors[key as keyof typeof config.colors] || ''}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6">
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Font Ailesi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Başlık Fontu</label>
                      <select
                        value={config.typography?.fonts?.heading || 'Inter'}
                        onChange={(e) => handleConfigChange('typography', 'fonts', 'heading', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Gövde Fontu</label>
                      <select
                        value={config.typography?.fonts?.body || 'Inter'}
                        onChange={(e) => handleConfigChange('typography', 'fonts', 'body', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Font Boyutları</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small'].map((tag) => (
                      <div key={tag}>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">{tag}</label>
                        <input
                          type="text"
                          value={config.typography?.sizes?.[tag as keyof typeof config.typography.sizes] || ''}
                          onChange={(e) => handleConfigChange('typography', 'sizes', tag, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="1rem"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-indigo-900">Alt Sayfa Hero (Subpage Hero)</h3>
                    <p className="text-sm text-indigo-700">Alt sayfaların üst görsel alanını özelleştirin (Ana sayfa hariç)</p>
                  </div>
                  <button
                    onClick={() => handleConfigChange('hero', null, 'enabled', !config.hero?.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.hero?.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.hero?.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {config.hero?.enabled && (
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Başlık Metni</label>
                      <input
                        type="text"
                        value={config.hero?.title?.text || ''}
                        onChange={(e) => handleConfigChange('hero', 'title', 'text', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Alt Başlık</label>
                      <textarea
                        rows={2}
                        value={config.hero?.subtitle?.text || ''}
                        onChange={(e) => handleConfigChange('hero', 'subtitle', 'text', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Başlık Rengi</label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                            <input
                              type="color"
                              value={config.hero?.title?.color || '#ffffff'}
                              onChange={(e) => handleConfigChange('hero', 'title', 'color', e.target.value)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 cursor-pointer border-none"
                            />
                          </div>
                          <input
                            type="text"
                            value={config.hero?.title?.color || '#ffffff'}
                            onChange={(e) => handleConfigChange('hero', 'title', 'color', e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Alt Başlık Rengi</label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                            <input
                              type="color"
                              value={config.hero?.subtitle?.color || '#e2e8f0'}
                              onChange={(e) => handleConfigChange('hero', 'subtitle', 'color', e.target.value)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 cursor-pointer border-none"
                            />
                          </div>
                          <input
                            type="text"
                            value={config.hero?.subtitle?.color || '#e2e8f0'}
                            onChange={(e) => handleConfigChange('hero', 'subtitle', 'color', e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Hizalama</label>
                        <select
                          value={config.hero?.alignment || 'center'}
                          onChange={(e) => handleConfigChange('hero', null, 'alignment', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          <option value="left">Sol</option>
                          <option value="center">Orta</option>
                          <option value="right">Sağ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Arkaplan Rengi (Gradient)</label>
                        <input
                          type="text"
                          value={config.hero?.backgroundColor || ''}
                          onChange={(e) => handleConfigChange('hero', null, 'backgroundColor', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs"
                          placeholder="linear-gradient(...)"
                        />
                      </div>
                    </div>

                    {/* Hero Buttons Customization */}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3 block">Hero Butonları</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Primary Button */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 block mb-2">Ana Buton</span>
                          <div className="space-y-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Arkaplan</label>
                              <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded overflow-hidden border border-slate-200">
                                  <input type="color" value={config.hero?.buttons?.primary?.backgroundColor || '#ffffff'} onChange={(e) => handleConfigChange('hero', 'buttons', 'primary', { ...config.hero?.buttons?.primary, backgroundColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" />
                                </div>
                                <input type="text" value={config.hero?.buttons?.primary?.backgroundColor || '#ffffff'} onChange={(e) => handleConfigChange('hero', 'buttons', 'primary', { ...config.hero?.buttons?.primary, backgroundColor: e.target.value })} className="flex-1 text-xs py-1 px-2 border rounded" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Metin Rengi</label>
                              <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded overflow-hidden border border-slate-200">
                                  <input type="color" value={config.hero?.buttons?.primary?.textColor || '#000000'} onChange={(e) => handleConfigChange('hero', 'buttons', 'primary', { ...config.hero?.buttons?.primary, textColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" />
                                </div>
                                <input type="text" value={config.hero?.buttons?.primary?.textColor || '#000000'} onChange={(e) => handleConfigChange('hero', 'buttons', 'primary', { ...config.hero?.buttons?.primary, textColor: e.target.value })} className="flex-1 text-xs py-1 px-2 border rounded" />
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Secondary Button */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 block mb-2">İkincil Buton</span>
                          <div className="space-y-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Arkaplan</label>
                              <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded overflow-hidden border border-slate-200">
                                  <input type="color" value={config.hero?.buttons?.secondary?.backgroundColor || 'transparent'} onChange={(e) => handleConfigChange('hero', 'buttons', 'secondary', { ...config.hero?.buttons?.secondary, backgroundColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" />
                                </div>
                                <input type="text" value={config.hero?.buttons?.secondary?.backgroundColor || 'transparent'} onChange={(e) => handleConfigChange('hero', 'buttons', 'secondary', { ...config.hero?.buttons?.secondary, backgroundColor: e.target.value })} className="flex-1 text-xs py-1 px-2 border rounded" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Metin Rengi</label>
                              <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded overflow-hidden border border-slate-200">
                                  <input type="color" value={config.hero?.buttons?.secondary?.textColor || '#ffffff'} onChange={(e) => handleConfigChange('hero', 'buttons', 'secondary', { ...config.hero?.buttons?.secondary, textColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" />
                                </div>
                                <input type="text" value={config.hero?.buttons?.secondary?.textColor || '#ffffff'} onChange={(e) => handleConfigChange('hero', 'buttons', 'secondary', { ...config.hero?.buttons?.secondary, textColor: e.target.value })} className="flex-1 text-xs py-1 px-2 border rounded" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Overlay (Katman) Ayarları</h4>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center h-5">
                          <input
                            id="hero-overlay-enabled"
                            type="checkbox"
                            checked={config.hero?.overlay?.enabled ?? true}
                            onChange={(e) => handleConfigChange('hero', 'overlay', 'enabled', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                        <label htmlFor="hero-overlay-enabled" className="text-sm text-slate-600">Overlay Aktif</label>
                      </div>

                      {config.hero?.overlay?.enabled !== false && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Overlay Rengi</label>
                            <div className="flex items-center gap-2">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                                <input
                                  type="color"
                                  value={config.hero?.overlay?.color || '#000000'}
                                  onChange={(e) => handleConfigChange('hero', 'overlay', 'color', e.target.value)}
                                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 cursor-pointer border-none"
                                />
                              </div>
                              <input
                                type="text"
                                value={config.hero?.overlay?.color || '#000000'}
                                onChange={(e) => handleConfigChange('hero', 'overlay', 'color', e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Opaklık (0 - 1)</label>
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={config.hero?.overlay?.opacity ?? 0.4}
                              onChange={(e) => handleConfigChange('hero', 'overlay', 'opacity', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {activeTab === 'footer' && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Footer Ayarları</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Backgrounds */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-slate-900">Arkaplanlar</h4>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Ana Arkaplan Rengi</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                          <input type="color" value={(config.footer as any)?.backgroundColor || '#0f1b26'} onChange={(e) => handleConfigChange('footer', null, 'backgroundColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                        </div>
                        <input type="text" value={(config.footer as any)?.backgroundColor || '#0f1b26'} onChange={(e) => handleConfigChange('footer', null, 'backgroundColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Alt Bar Arkaplanı (Varsa)</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                          <input type="color" value={(config.footer as any)?.bottomBackgroundColor || 'transparent'} onChange={(e) => handleConfigChange('footer', null, 'bottomBackgroundColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                        </div>
                        <input type="text" value={(config.footer as any)?.bottomBackgroundColor || 'transparent'} onChange={(e) => handleConfigChange('footer', null, 'bottomBackgroundColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Kenarlık Rengi (Border)</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                          <input type="color" value={(config.footer as any)?.borderColor || '#ffffff'} onChange={(e) => handleConfigChange('footer', null, 'borderColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                        </div>
                        <input type="text" value={(config.footer as any)?.borderColor || ''} onChange={(e) => handleConfigChange('footer', null, 'borderColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-slate-900">Metin Renkleri</h4>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Başlık Rengi</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                          <input type="color" value={(config.footer as any)?.headingColor || '#ffffff'} onChange={(e) => handleConfigChange('footer', null, 'headingColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                        </div>
                        <input type="text" value={(config.footer as any)?.headingColor || '#ffffff'} onChange={(e) => handleConfigChange('footer', null, 'headingColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Açıklama Yazısı Rengi</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                          <input type="color" value={(config.footer as any)?.descriptionColor || '#cbd5e1'} onChange={(e) => handleConfigChange('footer', null, 'descriptionColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                        </div>
                        <input type="text" value={(config.footer as any)?.descriptionColor || '#cbd5e1'} onChange={(e) => handleConfigChange('footer', null, 'descriptionColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Vurgu Rengi (İkonlar / Noktalar)</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                          <input type="color" value={(config.footer as any)?.accentColor || '#3B82F6'} onChange={(e) => handleConfigChange('footer', null, 'accentColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                        </div>
                        <input type="text" value={(config.footer as any)?.accentColor || '#3B82F6'} onChange={(e) => handleConfigChange('footer', null, 'accentColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Genel Metin Rengi (Alt Kısım vb.)</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                          <input type="color" value={(config.footer as any)?.textColor || '#94a3b8'} onChange={(e) => handleConfigChange('footer', null, 'textColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                        </div>
                        <input type="text" value={(config.footer as any)?.textColor || '#94a3b8'} onChange={(e) => handleConfigChange('footer', null, 'textColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="space-y-4 md:col-span-2 border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-medium text-slate-900">Bağlantılar (Linkler)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Link Rengi</label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                            <input type="color" value={(config.footer as any)?.linkColor || '#cbd5e1'} onChange={(e) => handleConfigChange('footer', null, 'linkColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                          </div>
                          <input type="text" value={(config.footer as any)?.linkColor || '#cbd5e1'} onChange={(e) => handleConfigChange('footer', null, 'linkColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Link Hover Rengi</label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                            <input type="color" value={(config.footer as any)?.linkHoverColor || '#ffffff'} onChange={(e) => handleConfigChange('footer', null, 'linkHoverColor', e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                          </div>
                          <input type="text" value={(config.footer as any)?.linkHoverColor || '#ffffff'} onChange={(e) => handleConfigChange('footer', null, 'linkHoverColor', e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'buttons' && (
              <div className="space-y-6">
                {/* Primary Button */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Birincil Buton</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Border Radius</label>
                      <input type="text" value={config.buttons?.primary?.borderRadius || ''} onChange={(e) => handleConfigChange('buttons', 'primary', 'borderRadius', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="0.5rem" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Font Weight</label>
                      <input type="text" value={config.buttons?.primary?.fontWeight || ''} onChange={(e) => handleConfigChange('buttons', 'primary', 'fontWeight', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="600" />
                    </div>
                  </div>
                </section>
                {/* Secondary Button */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">İkincil Buton</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Border Radius</label>
                      <input type="text" value={config.buttons?.secondary?.borderRadius || ''} onChange={(e) => handleConfigChange('buttons', 'secondary', 'borderRadius', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="0.5rem" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Font Weight</label>
                      <input type="text" value={config.buttons?.secondary?.fontWeight || ''} onChange={(e) => handleConfigChange('buttons', 'secondary', 'fontWeight', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="500" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'cards' && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Kart Görünümü</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'borderRadius', label: 'Köşe Yuvarlaklığı' },
                    { key: 'padding', label: 'İç Boşluk (Padding)' },
                    { key: 'backgroundColor', label: 'Arkaplan Rengi', type: 'color' },
                    { key: 'borderColor', label: 'Kenarlık Rengi', type: 'color' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                      {type === 'color' ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                            <input type="color" value={(config.cards as any)?.[key] || ''} onChange={(e) => handleConfigChange('cards', null, key, e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                          </div>
                          <input type="text" value={(config.cards as any)?.[key] || ''} onChange={(e) => handleConfigChange('cards', null, key, e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                      ) : (
                        <input type="text" value={(config.cards as any)?.[key] || ''} onChange={(e) => handleConfigChange('cards', null, key, e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'navigation' && (
              <div className="space-y-6">
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">Menü Konteyneri</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">Sticky (Sabit)</span>
                      <button
                        onClick={() => handleConfigChange('navigation', null, 'sticky', !config.navigation?.sticky)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.navigation?.sticky ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.navigation?.sticky ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'backgroundColor', label: 'Arkaplan Rengi', type: 'color' },
                      { key: 'textColor', label: 'Metin Rengi', type: 'color' },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                            <input type="color" value={(config.navigation as any)?.[key] || ''} onChange={(e) => handleConfigChange('navigation', null, key, e.target.value)} className="absolute inset-0 w-[150%] h-[150%] cursor-pointer" />
                          </div>
                          <input type="text" value={(config.navigation as any)?.[key] || ''} onChange={(e) => handleConfigChange('navigation', null, key, e.target.value)} className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'spacing' && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Boşluk Ölçeği</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'xs', label: 'XS (Çok Küçük)' },
                    { key: 'sm', label: 'SM (Küçük)' },
                    { key: 'md', label: 'MD (Orta)' },
                    { key: 'lg', label: 'LG (Büyük)' },
                    { key: 'xl', label: 'XL (Çok Büyük)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={config.spacing?.[key as keyof typeof config.spacing] || ''}
                        onChange={(e) => handleConfigChange('spacing', null, key, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="1rem"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'forms' && (
              <div className="space-y-6">
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Input Alanları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'backgroundColor', label: 'Arkaplan Rengi', type: 'color' },
                      { key: 'borderColor', label: 'Kenarlık Rengi', type: 'color' },
                      { key: 'color', label: 'Metin Rengi', type: 'color' },
                      { key: 'borderRadius', label: 'Köşe Yarıçapı', type: 'text' },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                        {type === 'color' ? (
                          <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-inset">
                              <input
                                type="color"
                                value={(config.forms?.input as any)?.[key] || ''}
                                onChange={(e) => handleConfigChange('forms', 'input', key, e.target.value)}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 cursor-pointer border-none"
                              />
                            </div>
                            <input
                              type="text"
                              value={(config.forms?.input as any)?.[key] || ''}
                              onChange={(e) => handleConfigChange('forms', 'input', key, e.target.value)}
                              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={(config.forms?.input as any)?.[key] || ''}
                            onChange={(e) => handleConfigChange('forms', 'input', key, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'layout' && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Kapsayıcı Ayarları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Max Genişlik (px)</label>
                      <input
                        type="number"
                        value={config.layout?.maxWidth || 1280}
                        onChange={(e) => handleConfigChange('layout', null, 'maxWidth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Container Padding</label>
                      <input
                        type="text"
                        value={config.layout?.containerPadding || ''}
                        onChange={(e) => handleConfigChange('layout', null, 'containerPadding', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDEBAR (Preview) --- */}
      <div className="w-96 bg-slate-50 border-l border-slate-200 hidden xl:flex flex-col flex-shrink-0 z-10">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-slate-800 flex items-center">
            <ComputerDesktopIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Canlı Önizleme
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Preview Blocks */}

          {/* Theme Identity */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Renk Paleti</h4>
            <div className="flex -space-x-2">
              {['primary', 'secondary', 'accent'].map(k => (
                <div
                  key={k}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: config.colors[k as keyof typeof config.colors] }}
                  title={k}
                />
              ))}
            </div>
          </div>

          {/* Typography Preview */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <h1 style={{
                fontFamily: config.typography?.fonts?.heading,
                color: config.colors.text,
                fontSize: '1.75rem',
                fontWeight: 700,
                lineHeight: 1.2
              }}>
                Başlık
              </h1>
              <p className="mt-2" style={{
                fontFamily: config.typography?.fonts?.body,
                color: config.colors.textLight,
                fontSize: '0.9rem',
                lineHeight: 1.6
              }}>
                Bu bir paragraf örneğidir. Tipografi ve renk ayarlarını buradan görebilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button style={{
                backgroundColor: config.colors.primary,
                color: config.colors.white,
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>Primary</button>
              <button style={{
                backgroundColor: 'transparent',
                border: `1px solid ${config.colors.primary}`,
                color: config.colors.primary,
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>Outline</button>
            </div>
          </div>

          {/* Hero Small Preview */}
          {config.hero?.enabled && (
            <div
              className="rounded-xl overflow-hidden aspect-video relative flex flex-col items-center justify-center text-center p-4 shadow-sm group"
              style={{ background: config.hero?.backgroundColor || '#eee' }}
            >
              {/* Preview Overlay */}
              {config.hero?.overlay?.enabled !== false && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    backgroundColor: config.hero?.overlay?.color || '#000000',
                    opacity: config.hero?.overlay?.opacity ?? 0.4
                  }}
                />
              )}

              <div className="relative z-10 p-2">
                <h3 style={{
                  color: config.hero?.title?.color,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  textShadow: config.hero?.overlay?.enabled ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                }}>
                  {config.hero?.title?.text}
                </h3>
                <p style={{
                  color: config.hero?.subtitle?.color,
                  fontSize: '0.6rem', // Scaled down for preview
                  lineHeight: 1.4
                }}>
                  {config.hero?.subtitle?.text}
                </p>
              </div>
            </div>
          )}

          {/* Components Preview */}
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium">Link Stili</span>
              <a href="#" style={{ color: config.colors.primary, textDecoration: 'underline' }}>Örnek Link</a>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Input</label>
              <input
                type="text"
                disabled
                placeholder="Input görünümü..."
                className="w-full px-3 py-2 border rounded-md text-sm"
                style={{
                  borderColor: config.forms?.input?.borderColor || '#e2e8f0',
                  borderRadius: config.forms?.input?.borderRadius || '0.375rem'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

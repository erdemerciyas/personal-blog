'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PuzzlePieceIcon,
  PlusIcon,
  StarIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Plugin {
  _id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isActive: boolean;
  isBuiltIn: boolean;
  icon?: string;
  category: string;
}

export default function AdminPluginsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    loadPlugins();
  }, [status, session, router]);

  const loadPlugins = async () => {
    try {
      const response = await fetch('/api/admin/plugins');
      if (response.ok) {
        const data = await response.json();
        // Handle response format { success: true, data: [...] } or direct array [...]
        const pluginsArray = Array.isArray(data) ? data : (data.data || []);
        setPlugins(pluginsArray);
      }
    } catch (error) {
      console.error('Error loading plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (pluginId: string) => {
    try {
      const response = await fetch(`/api/admin/plugins/${pluginId}/toggle`, {
        method: 'POST',
      });

      if (response.ok) {
        setPlugins(plugins.map(plugin => {
          if (plugin._id === pluginId) {
            return { ...plugin, isActive: !plugin.isActive };
          }
          return plugin;
        }));
      }
    } catch (error) {
      console.error('Error toggling plugin:', error);
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    if (filter === 'active') return plugin.isActive;
    if (filter === 'inactive') return !plugin.isActive;
    return true;
  });

  const builtInPlugins = filteredPlugins.filter(p => p.isBuiltIn);
  const customPlugins = filteredPlugins.filter(p => !p.isBuiltIn);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Loading plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plugins</h1>
          <p className="text-slate-500 mt-1">Extend your site functionality</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          All ({plugins.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'active'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Active ({plugins.filter(p => p.isActive).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'inactive'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Inactive ({plugins.filter(p => !p.isActive).length})
        </button>
      </div>

      {/* Built-in Plugins */}
      {builtInPlugins.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Built-in Plugins</h2>
          <div className="space-y-4">
            {builtInPlugins.map((plugin) => (
              <div
                key={plugin._id}
                className="flex items-start justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <PuzzlePieceIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-base font-semibold text-slate-900">
                        {plugin.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                        Built-in
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{plugin.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>v{plugin.version}</span>
                      <span>by {plugin.author}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(plugin._id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${plugin.isActive
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                  {plugin.isActive ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="w-4 h-4" />
                      <span>Inactive</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Plugins */}
      {customPlugins.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Custom Plugins</h2>
          <div className="space-y-4">
            {customPlugins.map((plugin) => (
              <div
                key={plugin._id}
                className="flex items-start justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <PuzzlePieceIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {plugin.name}
                      </h3>
                      {plugin.isActive && (
                        <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{plugin.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>v{plugin.version}</span>
                      <span>by {plugin.author}</span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                        {plugin.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/plugins/${plugin._id}`}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="View Details"
                  >
                    <InformationCircleIcon className="w-5 h-5 text-slate-600" />
                  </Link>
                  <button
                    onClick={() => handleToggle(plugin._id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${plugin.isActive
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                  >
                    {plugin.isActive ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XMarkIcon className="w-4 h-4" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPlugins.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <PuzzlePieceIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No plugins found</h3>
          <p className="text-slate-500">
            {filter === 'all'
              ? 'Install plugins to extend your site functionality'
              : `No ${filter} plugins available`
            }
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <InformationCircleIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">About Plugins</h3>
            <p className="text-sm text-slate-600">
              Plugins extend the functionality of your site. Built-in plugins come pre-installed and cannot be removed.
              Custom plugins can be installed and managed separately. Only active plugins will affect your site's behavior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CloudArrowDownIcon,
  CheckIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Update {
  _id: string;
  version: string;
  title: string;
  description: string;
  type: 'major' | 'minor' | 'patch';
  status: 'available' | 'installed' | 'failed';
  releaseDate: string;
  size: number;
}

export default function AdminUpdatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadUpdates();
  }, [status, router]);

  const loadUpdates = async () => {
    try {
      const response = await fetch('/api/admin/updates');
      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
      }
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/admin/updates/check', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.updatesAvailable) {
          setUpdates(data.updates);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleInstallUpdate = async (updateId: string) => {
    try {
      const response = await fetch(`/api/admin/updates/${updateId}/install`, {
        method: 'POST',
      });

      if (response.ok) {
        setUpdates(updates.map(u => 
          u._id === updateId ? { ...u, status: 'installed' } : u
        ));
      }
    } catch (error) {
      console.error('Error installing update:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'minor':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'patch':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return CloudArrowDownIcon;
      case 'installed':
        return CheckIcon;
      case 'failed':
        return ExclamationTriangleIcon;
      default:
        return ShieldCheckIcon;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Loading updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Updates</h1>
          <p className="text-slate-500 mt-1">Keep your system up to date</p>
        </div>
        <button
          onClick={handleCheckForUpdates}
          disabled={checking}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              <span>Checking...</span>
            </>
          ) : (
            <>
              <CloudArrowDownIcon className="w-5 h-5 mr-2" />
              Check for Updates
            </>
          )}
        </button>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
            <p className="text-sm text-slate-600">
              Your system is running the latest version
            </p>
          </div>
        </div>
      </div>

      {/* Available Updates */}
      {updates.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Available Updates</h2>
            <p className="text-sm text-slate-500">
              {updates.length} update(s) available for installation
            </p>
          </div>
          <div className="divide-y divide-slate-200">
            {updates.map((update) => (
              <div
                key={update._id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(update.type)}`}>
                      {update.status === 'available' && (
                        <CloudArrowDownIcon className="w-6 h-6 text-white" />
                      )}
                      {update.status === 'installed' && (
                        <CheckIcon className="w-6 h-6 text-white" />
                      )}
                      {update.status === 'failed' && (
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {update.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(update.type)}`}>
                          {update.type}
                        </span>
                        <span className="text-sm text-slate-500">
                          v{update.version}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <span>{formatFileSize(update.size)}</span>
                    <span>•</span>
                    <span>{formatDate(update.releaseDate)}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  {update.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>Released {formatDate(update.releaseDate)}</span>
                  </div>
                  {update.status === 'available' && (
                    <button
                      onClick={() => handleInstallUpdate(update._id)}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
                    >
                      Install Update
                    </button>
                  )}
                  {update.status === 'installed' && (
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium">
                      Installed
                    </span>
                  )}
                  {update.status === 'failed' && (
                    <button
                      onClick={() => handleInstallUpdate(update._id)}
                      className="px-6 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                    >
                      Retry Installation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Updates Available */}
      {updates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <ShieldCheckIcon className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Updates Available</h3>
          <p className="text-slate-500 mb-6">
            Your system is up to date with the latest version
          </p>
          <button
            onClick={handleCheckForUpdates}
            disabled={checking}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                Check for Updates
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

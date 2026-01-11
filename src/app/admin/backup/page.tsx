'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArchiveBoxIcon,
  CloudArrowDownIcon,
  TrashIcon,
  ClockIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface Backup {
  _id: string;
  name: string;
  size: number;
  createdAt: string;
}

export default function AdminBackupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadBackups();
  }, [status, router]);

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/backup');
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreatingBackup(true);
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
      });

      if (response.ok) {
        loadBackups();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDelete = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;

    try {
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBackups(backups.filter(backup => backup._id !== backupId));
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Loading backups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Backup & Restore</h1>
          <p className="text-slate-500 mt-1">Manage your site backups</p>
        </div>
        <button
          onClick={createBackup}
          disabled={creatingBackup}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creatingBackup ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <ArchiveBoxIcon className="w-5 h-5 mr-2" />
              Create Backup
            </>
          )}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <ArchiveBoxIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">About Backups</h3>
            <p className="text-sm text-slate-600">
              Backups allow you to save snapshots of your site data. You can create manual backups or restore from existing backups. 
              Keep your backups secure and consider downloading them for offline storage.
            </p>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {backups.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {backups.map((backup) => (
              <div
                key={backup._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <DocumentIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {backup.name}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                      <span>{formatFileSize(backup.size)}</span>
                      <span className="flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {formatDate(backup.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-indigo-100 rounded-lg transition-colors" title="Download">
                    <CloudArrowDownIcon className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(backup._id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ArchiveBoxIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No backups found</h3>
            <p className="text-slate-500 mb-6">
              Create your first backup to secure your site data
            </p>
            <button
              onClick={createBackup}
              disabled={creatingBackup}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
            >
              <ArchiveBoxIcon className="w-5 h-5 mr-2" />
              Create Backup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

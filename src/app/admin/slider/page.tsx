'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  PhotoIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface SliderItem {
  _id: string;
  title: string;
  image: string;
  link?: string;
  description: string;
  order: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function AdminSliderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadSliders();
  }, [status, router]);

  const loadSliders = async () => {
    try {
      const response = await fetch('/api/admin/slider');
      if (response.ok) {
        const data = await response.json();
        setSliders(data);
      }
    } catch (error) {
      console.error('Error loading sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sliderId: string) => {
    if (!confirm('Are you sure you want to delete this slider?')) return;

    try {
      const response = await fetch(`/api/admin/slider/${sliderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSliders(sliders.filter(slider => slider._id !== sliderId));
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
    }
  };

  const handleToggleStatus = async (sliderId: string) => {
    try {
      const slider = sliders.find(s => s._id === sliderId);
      if (!slider) return;

      const response = await fetch(`/api/admin/slider/${sliderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: slider.status === 'active' ? 'inactive' : 'active' }),
      });

      if (response.ok) {
        setSliders(sliders.map(s =>
          s._id === sliderId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
        ));
      }
    } catch (error) {
      console.error('Error toggling slider status:', error);
    }
  };

  const handleReorder = async (sliderId: string, direction: 'up' | 'down') => {
    const index = sliders.findIndex(s => s._id === sliderId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sliders.length) return;

    const newSliders = [...sliders];
    const moved = newSliders.splice(index, 1)[0];
    newSliders.splice(newIndex, 0, moved);

    try {
      await fetch('/api/admin/slider/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sliders: newSliders.map(s => s._id) }),
      });
      setSliders(newSliders);
    } catch (error) {
      console.error('Error reordering sliders:', error);
    }
  };

  const filteredSliders = sliders.filter(slider => {
    const matchesSearch = slider.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || slider.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Loading sliders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Slider</h1>
          <p className="text-slate-500 mt-1">Manage your homepage slider</p>
        </div>
        <button
          onClick={() => router.push('/admin/slider/new')}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Slider
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sliders..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              All ({sliders.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'active'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Active ({sliders.filter(s => s.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'inactive'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Inactive ({sliders.filter(s => s.status === 'inactive').length})
            </button>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSliders.map((slider, index) => (
          <div
            key={slider._id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image */}
            <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-violet-100">
              {slider.image ? (
                <img
                  src={slider.image}
                  alt={slider.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="w-16 h-16 text-indigo-300" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${slider.status === 'active'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-500 text-white'
                  }`}>
                  {slider.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {slider.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {slider.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Order: {slider.order + 1}
                </span>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleReorder(slider._id, 'up')}
                    disabled={index === 0}
                    className="p-2 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUpIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleReorder(slider._id, 'down')}
                    disabled={index === filteredSliders.length - 1}
                    className="p-2 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDownIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(slider._id)}
                    className={`p-2 rounded-lg transition-colors ${slider.status === 'active'
                        ? 'bg-amber-100 hover:bg-amber-200'
                        : 'bg-emerald-100 hover:bg-emerald-200'
                      }`}
                    title={slider.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <EyeIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/slider/${slider._id}/edit`)}
                    className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(slider._id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSliders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <PhotoIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No sliders found</h3>
          <p className="text-slate-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add your first slider to showcase on homepage'
            }
          </p>
        </div>
      )}
    </div>
  );
}

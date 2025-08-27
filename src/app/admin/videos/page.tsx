'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Video {
  _id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  type: 'short' | 'normal';
  status: 'visible' | 'hidden';
  tags: string[];
}

export default function AdminVideosPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [newVideo, setNewVideo] = useState({
    videoId: '',
    title: '',
    description: '',
    thumbnail: '',
    type: 'normal' as 'short' | 'normal',
    status: 'visible' as 'visible' | 'hidden',
    tags: [] as string[]
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadVideos();
  }, [status, router]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/videos');
      if (response.ok) {
        const data = await response.json();
        console.log("Videos data:", data);
        setVideos(data);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Videolar yüklenirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Videos load error:', error);
      setMessage({ type: 'error', text: 'Videolar yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVideo = async (updatedVideo: Video) => {
    try {
      // Validate required fields
      if (!updatedVideo.title) {
        setMessage({ type: 'error', text: 'Başlık zorunludur.' });
        return;
      }

      const response = await fetch(`/api/admin/videos/${updatedVideo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedVideo),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Video başarıyla güncellendi!' });
        setShowEditModal(false);
        setSelectedVideo(null);
        loadVideos();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Video güncellenirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Update video error:', error);
      setMessage({ type: 'error', text: 'Video güncellenirken hata oluştu.' });
    }
  };

  const handleAddVideo = async () => {
    // Validate required fields
    if (!newVideo.videoId || !newVideo.title) {
      setMessage({ type: 'error', text: 'Video ID ve başlık zorunludur.' });
      return;
    }

    try {
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVideo),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Video başarıyla eklendi!' });
        setShowAddModal(false);
        setNewVideo({
          videoId: '',
          title: '',
          description: '',
          thumbnail: '',
          type: 'normal',
          status: 'visible',
          tags: []
        });
        loadVideos();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Video eklenirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Add video error:', error);
      setMessage({ type: 'error', text: 'Video eklenirken hata oluştu.' });
    }
  };

  const toggleVideoVisibility = async (videoId: string, currentStatus: 'visible' | 'hidden') => {
    try {
      console.log("Toggling video visibility", { videoId, currentStatus });
      const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
      console.log("New status", { newStatus });
      
      // Find the video in our local state
      const video = videos.find(v => v.videoId === videoId);
      if (!video) {
        setMessage({ type: 'error', text: 'Video bulunamadı.' });
        return;
      }
      
      // If the video doesn't have an _id (not saved in database yet), save it first
      if (!video._id) {
        // Create the video in the database
        const createResponse = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId: video.videoId,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            publishedAt: video.publishedAt,
            type: video.type,
            status: newStatus,
            tags: video.tags
          }),
        });
        
        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(error.message || 'Video oluşturulurken hata oluştu.');
        }
        
        // Reload videos to get the new _id
        await loadVideos();
      } else {
        // Video exists in database, update its status
        const response = await fetch(`/api/admin/videos/${video._id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        
        console.log("API response", { status: response.status, ok: response.ok });

        if (!response.ok) {
          const errorText = await response.text();
          console.log("API error response", { errorText });
          try {
            const error = JSON.parse(errorText);
            throw new Error(error.message || 'Durum değiştirilirken hata oluştu.');
          } catch {
            throw new Error('Durum değiştirilirken hata oluştu.');
          }
        }
      }
      
      setMessage({ 
        type: 'success', 
        text: `Video ${newStatus === 'visible' ? 'görünür yapıldı' : 'gizlendi'}!` 
      });
      loadVideos();
    } catch (error) {
      console.error('Toggle visibility error:', error);
      setMessage({ type: 'error', text: error.message || 'Durum değiştirilirken hata oluştu.' });
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary-600"></div>
            <p className="text-lg text-slate-700">Videolar yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Video Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Video Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-brand-primary-50 border-brand-primary-200 text-brand-primary-900' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Video Yönetimi</h1>
            <p className="text-slate-600 mt-1">YouTube videolarını yönetin</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-brand-primary-700 hover:bg-brand-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Yeni Video</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Video ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
            />
          </div>
        </div>

        {/* Videos List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              YouTube Videoları ({filteredVideos.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Yayın Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredVideos.map((video) => (
                  <tr key={video._id || video.videoId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            className="h-16 w-24 object-cover rounded"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 line-clamp-2 max-w-md">
                            {video.title}
                          </div>
                          <div className="text-sm text-slate-500 line-clamp-1 max-w-md">
                            {video.description}
                          </div>
                          {video.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {video.tags.slice(0, 3).map((tag) => (
                                <span 
                                  key={`${video._id}-tag-${tag}`} 
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {video.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{video.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.type === 'short' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {video.type === 'short' ? 'Short' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.status === 'visible' 
                          ? 'bg-brand-primary-100 text-brand-primary-900' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {video.status === 'visible' ? 'Görünür' : 'Gizli'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(video.publishedAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedVideo(video);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Düzenle"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleVideoVisibility(video.videoId, video.status)}
                          className={`${video.status === 'visible' ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'} p-1 rounded`}
                          title={video.status === 'visible' ? 'Gizle' : 'Göster'}
                        >
                          {video.status === 'visible' ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="YouTube'da İzle"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <svg 
                  className="mx-auto h-12 w-12 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">Video bulunamadı</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Aramanızla eşleşen bir video bulunamadı.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Yeni Video Ekle</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setNewVideo({
                    videoId: '',
                    title: '',
                    description: '',
                    thumbnail: '',
                    type: 'normal',
                    status: 'visible',
                    tags: []
                  });
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">YouTube Video ID *</label>
                <input
                  type="text"
                  value={newVideo.videoId}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, videoId: e.target.value }))}
                  placeholder="YouTube URL'sindeki video ID'si (örn: dQw4w9WgXcQ)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Küçük Resim URL</label>
                <input
                  type="text"
                  value={newVideo.thumbnail}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
                  <select
                    value={newVideo.type}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, type: e.target.value as 'short' | 'normal' }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                  >
                    <option value="normal">Normal</option>
                    <option value="short">Short</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
                  <select
                    value={newVideo.status}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, status: e.target.value as 'visible' | 'hidden' }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                  >
                    <option value="visible">Görünür</option>
                    <option value="hidden">Gizli</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Etiketler</label>
                <input
                  type="text"
                  value={newVideo.tags.join(', ')}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) }))}
                  placeholder="Etiketleri virgülle ayırın"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewVideo({
                    videoId: '',
                    title: '',
                    description: '',
                    thumbnail: '',
                    type: 'normal',
                    status: 'visible',
                    tags: []
                  });
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddVideo}
                className="px-4 py-2 bg-brand-primary-700 hover:bg-brand-primary-800 text-white rounded-lg transition-colors"
              >
                Video Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Video Düzenle</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVideo(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={selectedVideo.thumbnail} 
                  alt={selectedVideo.title} 
                  className="h-48 object-cover rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
                <input
                  type="text"
                  value={selectedVideo.title || ''}
                  onChange={(e) => setSelectedVideo(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                <textarea
                  value={selectedVideo.description || ''}
                  onChange={(e) => setSelectedVideo(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
                  <select
                    value={selectedVideo.type}
                    onChange={(e) => setSelectedVideo(prev => prev ? { ...prev, type: e.target.value as 'short' | 'normal' } : null)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                  >
                    <option value="normal">Normal</option>
                    <option value="short">Short</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
                  <select
                    value={selectedVideo.status}
                    onChange={(e) => setSelectedVideo(prev => prev ? { ...prev, status: e.target.value as 'visible' | 'hidden' } : null)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                  >
                    <option value="visible">Görünür</option>
                    <option value="hidden">Gizli</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Etiketler</label>
                <input
                  type="text"
                  value={selectedVideo.tags.join(', ') || ''}
                  onChange={(e) => setSelectedVideo(prev => prev ? { ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) } : null)}
                  placeholder="Etiketleri virgülle ayırın"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVideo(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => selectedVideo && handleUpdateVideo(selectedVideo)}
                className="px-4 py-2 bg-brand-primary-700 hover:bg-brand-primary-800 text-white rounded-lg transition-colors"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
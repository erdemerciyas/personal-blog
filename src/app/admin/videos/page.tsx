'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon
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
  channelId?: string;
  channelName?: string;
  channelUrl?: string;
}

export default function AdminVideosPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [contentInput, setContentInput] = useState('');
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

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

  const addContent = async () => {
    if (!contentInput.trim()) {
      setMessage({ type: 'error', text: 'Video linki gereklidir.' });
      return;
    }

    setIsAddingContent(true);
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: contentInput.trim()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        let message = `${result.videosAdded} video eklendi`;
        if (result.videosSkipped > 0) {
          message += `, ${result.videosSkipped} video zaten mevcuttu`;
        }
        
        setMessage({ type: 'success', text: message });
        setContentInput('');
        loadVideos();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Video eklenirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Add content error:', error);
      setMessage({ type: 'error', text: 'Video eklenirken hata oluştu.' });
    } finally {
      setIsAddingContent(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: result.message });
        loadVideos();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Video silinirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Delete video error:', error);
      setMessage({ type: 'error', text: 'Video silinirken hata oluştu.' });
    }
  };

  const bulkDeleteVideos = async () => {
    if (selectedVideos.size === 0) {
      setMessage({ type: 'error', text: 'Silinecek video seçin.' });
      return;
    }

    if (!confirm(`${selectedVideos.size} videoyu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/videos/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          videoIds: Array.from(selectedVideos)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: result.message });
        setSelectedVideos(new Set());
        loadVideos();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Videolar silinirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      setMessage({ type: 'error', text: 'Videolar silinirken hata oluştu.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const selectAllVideos = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(filteredVideos.map(v => v._id)));
    }
  };

  const handleUpdateVideo = async (updatedVideo: Video) => {
    try {
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

  const toggleVideoVisibility = async (videoId: string, currentStatus: 'visible' | 'hidden') => {
    try {
      const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
      const video = videos.find(v => v.videoId === videoId);
      
      if (!video) {
        setMessage({ type: 'error', text: 'Video bulunamadı.' });
        return;
      }
      
      if (video._id) {
        const response = await fetch(`/api/admin/videos/${video._id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
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
      const errorMessage = error instanceof Error ? error.message : 'Durum değiştirilirken hata oluştu.';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (video.channelName && video.channelName.toLowerCase().includes(searchTerm.toLowerCase()))
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
        </div>

        {/* Video Ekleme Alanı */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Video Ekle</h3>
          <div className="space-y-4">
            <textarea
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              placeholder="YouTube video linklerini girin:&#10;&#10;• Tek video: https://www.youtube.com/watch?v=VIDEO_ID&#10;• Çoklu video (her satıra bir tane):&#10;  https://www.youtube.com/watch?v=VIDEO_ID_1&#10;  https://www.youtube.com/watch?v=VIDEO_ID_2&#10;  https://www.youtube.com/watch?v=VIDEO_ID_3&#10;&#10;Video bilgileri otomatik olarak alınacak."
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
              disabled={isAddingContent}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Desteklenen: YouTube video linkleri (tek veya çoklu)
              </div>
              <button
                onClick={addContent}
                disabled={isAddingContent || !contentInput.trim()}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{isAddingContent ? 'Ekleniyor...' : 'Video Ekle'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Video ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
              />
            </div>
            
            {selectedVideos.size > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-600">
                  {selectedVideos.size} video seçili
                </span>
                <button
                  onClick={bulkDeleteVideos}
                  disabled={isDeleting}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>{isDeleting ? 'Siliniyor...' : 'Seçilenleri Sil'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Videos List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Videolar ({filteredVideos.length})
              </h2>
              {filteredVideos.length > 0 && (
                <button
                  onClick={selectAllVideos}
                  className="text-sm text-brand-primary-600 hover:text-brand-primary-700"
                >
                  {selectedVideos.size === filteredVideos.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedVideos.size === filteredVideos.length && filteredVideos.length > 0}
                      onChange={selectAllVideos}
                      className="rounded border-slate-300 text-brand-primary-600 focus:ring-brand-primary-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kanal
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
                      <input
                        type="checkbox"
                        checked={selectedVideos.has(video._id)}
                        onChange={() => toggleVideoSelection(video._id)}
                        className="rounded border-slate-300 text-brand-primary-600 focus:ring-brand-primary-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24">
                          {/* Using img element for thumbnail preview - no Image component available */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      {video.channelName ? (
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">{video.channelName}</div>
                          {video.channelId && (
                            <div className="text-slate-500 text-xs">{video.channelId}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
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
                        <button
                          onClick={() => deleteVideo(video._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Sil"
                        >
                          <TrashIcon className="w-4 h-4" />
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
                  Henüz video eklenmemiş veya arama kriterlerinize uygun video yok.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                <input
                  type="text"
                  value={selectedVideo.title}
                  onChange={(e) => setSelectedVideo({...selectedVideo, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                <textarea
                  value={selectedVideo.description}
                  onChange={(e) => setSelectedVideo({...selectedVideo, description: e.target.value})}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
                <select
                  value={selectedVideo.type}
                  onChange={(e) => setSelectedVideo({...selectedVideo, type: e.target.value as 'short' | 'normal'})}
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
                  onChange={(e) => setSelectedVideo({...selectedVideo, status: e.target.value as 'visible' | 'hidden'})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                >
                  <option value="visible">Görünür</option>
                  <option value="hidden">Gizli</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Etiketler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={selectedVideo.tags.join(', ')}
                  onChange={(e) => setSelectedVideo({...selectedVideo, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVideo(null);
                  }}
                  className="px-4 py-2 text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleUpdateVideo(selectedVideo)}
                  className="px-4 py-2 bg-brand-primary-600 hover:bg-brand-primary-700 text-white rounded-lg transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { PageLoader } from '../../../components/AdminLoader';
import ModelViewer from '../../../components/3DModelViewer';
import { 
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CubeIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Model3D {
  publicId: string;
  url: string;
  name: string;
  format: string;
  size: number;
  uploadedAt: string;
}

export default function ModelsManagement() {
  const { status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchModels();
    }
  }, [status, router]);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/3dmodels/list');
      if (!response.ok) throw new Error('Modeller getirilemedi');
      
      const result = await response.json();
      setModels(result.data || []);
    } catch (err) {
      setError('Modeller yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya formatı kontrolü
    const allowedFormats = ['stl', 'obj', 'gltf', 'glb'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      setError('Desteklenmeyen dosya formatı. Sadece STL, OBJ, GLTF, GLB dosyaları kabul edilir.');
      return;
    }

    // Dosya boyutu kontrolü (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Dosya boyutu 50MB\'dan büyük olamaz');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/3dmodels/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yükleme başarısız');
      }

      await fetchModels();
      
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme sırasında bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId: string, name: string) => {
    if (!confirm(`"${name}" modelini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/3dmodels/delete?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Silme işlemi başarısız oldu');
      
      setModels(prev => prev.filter(model => model.publicId !== publicId));
    } catch (err) {
      setError('Silme işlemi sırasında bir hata oluştu');
      console.error(err);
    }
  };

  const handleDownload = async (model: Model3D) => {
    try {
      const response = await fetch(`/api/3dmodels/download?url=${encodeURIComponent(model.url)}&filename=${encodeURIComponent(model.name)}`);
      
      if (!response.ok) {
        throw new Error('İndirme başarısız');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = model.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('İndirme hatası:', error);
      setError('İndirme sırasında bir hata oluştu');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <PageLoader text="3D Modeller yükleniyor..." />
      </AdminLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayout 
      title="3D Model Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: '3D Model Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600">3D modellerinizi yükleyin ve yönetin</p>
            <div className="flex items-center space-x-4 text-sm text-slate-500 mt-2">
              <span>Toplam: {models.length} model</span>
              <span>•</span>
              <span>Desteklenen formatlar: STL, OBJ, GLTF, GLB</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj,.gltf,.glb"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Yükleniyor...</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  <span>Model Yükle</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Upload Info */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl">
          <div className="flex items-start space-x-3">
            <CubeIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">3D Model Yükleme Bilgileri:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Desteklenen formatlar: STL, OBJ, GLTF, GLB</li>
                <li>• Maksimum dosya boyutu: 50MB</li>
                <li>• GLTF/GLB formatları için canlı önizleme mevcuttur</li>
                <li>• STL/OBJ formatları sadece indirilebilir</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Models List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <CubeIcon className="w-6 h-6" />
              <span>3D Modeller</span>
            </h3>
          </div>
          
          <div className="divide-y divide-slate-200">
            {models.length === 0 ? (
              <div className="p-12 text-center">
                <CubeIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">Henüz 3D model yüklenmemiş</p>
                <p className="text-slate-500 mt-2">İlk modelinizi yüklemek için &quot;Model Yükle&quot; butonuna tıklayın</p>
              </div>
            ) : (
              models.map((model) => (
                <div key={model.publicId} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center">
                        <CubeIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">{model.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                          <span className="uppercase font-medium">{model.format}</span>
                          <span>•</span>
                          <span>{formatFileSize(model.size)}</span>
                          <span>•</span>
                          <span>{new Date(model.uploadedAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {(model.format === 'gltf' || model.format === 'glb') && (
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setIsViewerOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="3D Önizleme"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDownload(model)}
                        className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="İndir"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(model.publicId, model.name)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3D Model Viewer Modal */}
      {isViewerOpen && selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedModel.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedModel.format.toUpperCase()} • {formatFileSize(selectedModel.size)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(selectedModel)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>İndir</span>
                </button>
                <button
                  onClick={() => setIsViewerOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 3D Viewer */}
            <div className="p-4">
              <ModelViewer 
                modelUrl={selectedModel.url} 
                format={selectedModel.format}
                className="h-96"
              />
            </div>

            {/* Model Bilgileri */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Format:</span>
                  <p className="font-medium uppercase">{selectedModel.format}</p>
                </div>
                <div>
                  <span className="text-gray-500">Boyut:</span>
                  <p className="font-medium">{formatFileSize(selectedModel.size)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Yüklenme:</span>
                  <p className="font-medium">
                    {new Date(selectedModel.uploadedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Public ID:</span>
                  <p className="font-medium text-xs break-all">{selectedModel.publicId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
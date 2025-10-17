'use client';

import { motion } from 'framer-motion';
import { 
  CubeIcon, 
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface Model3D {
  _id: string;
  name: string;
  url: string;
  format: 'stl' | 'obj' | 'gltf' | 'glb';
  size: number;
  uploadedAt: string;
  downloadable?: boolean;
  publicId: string;
}

interface Portfolio3DFilesProps {
  models3D: Model3D[];
}

export default function Portfolio3DFiles({ models3D }: Portfolio3DFilesProps) {

  const getFileTypeColor = (format: string) => {
    switch (format.toLowerCase()) {
      case 'stl':
        return 'bg-purple-100 text-purple-700';
      case 'obj':
        return 'bg-green-100 text-green-700';
      case 'gltf':
      case 'glb':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDownload = async (model: Model3D) => {
    try {
      // Download API'sini kullan
      const response = await fetch(`/api/3dmodels/download/${model._id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'İndirme başarısız');
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
      console.error('Download error:', error);
      alert(error instanceof Error ? error.message : 'İndirme sırasında hata oluştu');
    }
  };

  if (!models3D || models3D.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <div className="flex items-center mb-3">
        <CubeIcon className="w-4 h-4 text-brand-primary-600 mr-2" />
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          3D Model Dosyaları ({models3D.length})
        </h3>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {models3D.map((model, index) => (
          <motion.div
            key={model._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-center justify-between py-2 px-3 hover:bg-slate-50 transition-colors duration-200 ${
              index !== models3D.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            {/* Sol taraf - Dosya bilgileri */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Format badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getFileTypeColor(model.format)}`}>
                {model.format.toUpperCase()}
              </div>
              
              {/* Dosya adı ve durum */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {model.name}
                  </h4>
                  {model.downloadable && (
                    <span className="text-xs text-green-600 font-medium whitespace-nowrap">İndirilebilir</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sağ taraf - İndirme ikonu */}
            <div className="flex-shrink-0">
              {model.downloadable ? (
                <button
                  onClick={() => handleDownload(model)}
                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200"
                  title="Dosyayı İndir"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
              ) : (
                <div 
                  className="p-1 text-slate-300 cursor-not-allowed"
                  title="Bu model indirmeye kapalı"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bilgi mesajı */}
      {models3D.some(model => !model.downloadable) && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <span className="font-medium">Bilgi:</span> Bazı 3D model dosyaları indirmeye kapalı olabilir.
          </p>
        </div>
      )}
    </motion.div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { CubeIcon } from '@heroicons/react/24/outline';

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
            key={`model-${model._id || index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center py-2 px-3 hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100 last:border-b-0"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Format badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getFileTypeColor(model.format)}`}>
                {model.format.toUpperCase()}
              </div>

              {/* Dosya adı */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 truncate">
                  {model.name}
                </h4>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
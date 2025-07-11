import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const UniversalLoader: React.FC<{ text?: string }> = ({ text = 'Yükleniyor...' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <SparklesIcon className="w-8 h-8 text-teal-400 opacity-80" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold text-slate-800">{text}</p>
      </div>
    </div>
  </div>
);

export default UniversalLoader; 
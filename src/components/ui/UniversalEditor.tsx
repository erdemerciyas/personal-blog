'use client';

import React, { useState } from 'react';
import ModernEditor from '../admin/ModernEditor';
import SafeHtmlRenderer from '../common/SafeHtmlRenderer';
import {
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface UniversalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowImages?: boolean;
  allowTables?: boolean;
  allowCodeBlocks?: boolean;
}

const UniversalEditor: React.FC<UniversalEditorProps> = ({
  value,
  onChange,
  placeholder = 'İçeriğinizi buraya yazın...',
  className = '',
  minHeight = '300px',
  maxHeight = '600px',
  disabled = false,
  showPreview = true,
  allowImages = true,
  allowTables = true,
  allowCodeBlocks = true
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Kopyalama fonksiyonu
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isPreview && showPreview) {
    return (
      <div className="space-y-4">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Önizleme</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyToClipboard}
              title="HTML Kopyala"
              className="p-2 rounded-lg transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-600" />
              ) : (
                <DocumentDuplicateIcon className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-brand-primary-100 text-brand-primary-800 border border-brand-primary-200"
            >
              <PencilIcon className="w-4 h-4" />
              Düzenle
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
          <SafeHtmlRenderer 
            html={value}
            className={`p-6 ${className}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      {showPreview && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">İçerik Editörü</h3>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <EyeIcon className="w-4 h-4" />
            Önizle
          </button>
        </div>
      )}

      {/* Modern Editor */}
      <div onKeyDown={(e) => {
        // Form submit'i engelle
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          e.stopPropagation();
        }
      }}>
        <ModernEditor
          content={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          minHeight={minHeight}
          maxHeight={maxHeight}
          readOnly={disabled}
          allowImages={allowImages}
          allowTables={allowTables}
          allowCodeBlocks={allowCodeBlocks}
        />
      </div>
    </div>
  );
};

export default UniversalEditor;
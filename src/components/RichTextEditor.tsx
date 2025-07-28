'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';

// MD Editor'ı dinamik olarak yükle
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  )
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  required?: boolean;
  height?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'İçerik yazınız...',
  className = '',
  disabled = false,
  maxLength,
  required = false,
  height = 300
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [textLength, setTextLength] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Güvenli HTML sanitization
  const sanitizeHtml = (html: string): string => {
    if (typeof window === 'undefined') return html;
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'a', 'span'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button', 'iframe'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
      ADD_ATTR: ['target'],
      ADD_DATA_URI_TAGS: [],
      WHOLE_DOCUMENT: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false
    });
  };

  // Metin uzunluğunu hesapla
  const calculateTextLength = (html: string): number => {
    if (typeof window === 'undefined') return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.length || 0;
  };

  const handleChange = (val?: string) => {
    const newValue = val || '';
    const sanitizedValue = sanitizeHtml(newValue);
    const length = calculateTextLength(sanitizedValue);
    
    setTextLength(length);
    
    // Maksimum uzunluk kontrolü
    if (maxLength && length > maxLength) {
      return;
    }
    
    onChange(sanitizedValue);
  };

  useEffect(() => {
    if (value) {
      setTextLength(calculateTextLength(value));
    }
  }, [value]);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="relative">
        <MDEditor
          value={value}
          onChange={handleChange}
          height={height}
          data-color-mode="light"
          preview="edit"
          hideToolbar={disabled}
          visibleDragBar={false}
        />
        
        {/* Karakter sayacı */}
        {maxLength && (
          <div className="flex justify-between items-center mt-2 text-sm">
            <div className="text-gray-500">
              Markdown desteklenir
            </div>
            <div className={`font-medium ${
              textLength > maxLength * 0.9 
                ? textLength > maxLength 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
                : 'text-gray-500'
            }`}>
              {textLength}{maxLength ? `/${maxLength}` : ''}
            </div>
          </div>
        )}
        
        {/* Hata mesajı */}
        {required && !value && (
          <div className="text-red-600 text-sm mt-1">
            Bu alan zorunludur
          </div>
        )}
        
        {maxLength && textLength > maxLength && (
          <div className="text-red-600 text-sm mt-1">
            Maksimum {maxLength} karakter kullanabilirsiniz
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .w-md-editor {
          background-color: white !important;
        }
        .w-md-editor-text-container {
          font-size: 14px !important;
        }
        .w-md-editor-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          line-height: 1.6 !important;
        }
        .w-md-editor-text-container .w-md-editor-text-area {
          font-size: 14px !important;
          color: #374151 !important;
        }
        .w-md-editor-text-container .w-md-editor-text-area::placeholder {
          color: #9CA3AF !important;
        }
      `}</style>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';

// Güvenli markdown editor - react-quill yerine
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
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'İçerik yazınız...',
  className = '',
  disabled = false,
  maxLength,
  required = false
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Markdown editor ayarları
  const editorOptions = {
    hideToolbar: false,
    visibleDragBar: false,
    height: 300,
  };

  // Güvenli HTML sanitization
  const sanitizeHtml = (html: string): string => {
    if (typeof window === 'undefined') return html;
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'a', 'span'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button', 'iframe'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
      ADD_ATTR: ['target'],
      ALLOW_DATA_ATTR: false,
    });
  };

  const handleChange = (content: string) => {
    if (maxLength && content.length > maxLength) {
      return;
    }
    
    // Güvenlik: İçeriği sanitize et
    const sanitizedContent = sanitizeHtml(content);
    onChange(sanitizedContent);
  };

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <MDEditor
        value={value}
        onChange={(val) => handleChange(val || '')}
        data-color-mode="light"
        height={editorOptions.height}
        visibleDragBar={editorOptions.visibleDragBar}
        hideToolbar={editorOptions.hideToolbar}
        preview="edit"
      />
      
      {/* Karakter sayacı */}
      {maxLength && (
        <div className="flex justify-end mt-2">
          <span className={`text-sm ${
            value.length > maxLength * 0.9 ? 'text-red-600' : 'text-slate-500'
          }`}>
            {value.length} / {maxLength}
          </span>
        </div>
      )}
      
      {/* Zorunlu alan uyarısı */}
      {required && !value.trim() && (
        <div className="text-red-600 text-sm mt-1">
          Bu alan zorunludur
        </div>
      )}

      <style jsx global>{`
        .rich-text-editor .w-md-editor {
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
        }
        
        .rich-text-editor .w-md-editor-text-textarea,
        .rich-text-editor .w-md-editor-text {
          font-family: inherit !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }
        
        .rich-text-editor .w-md-editor-toolbar {
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        
        .rich-text-editor .w-md-editor-toolbar button {
          color: #64748b;
        }
        
        .rich-text-editor .w-md-editor-toolbar button:hover {
          color: #059669;
          background-color: #f0fdf4;
        }
      `}</style>
    </div>
  );
} 
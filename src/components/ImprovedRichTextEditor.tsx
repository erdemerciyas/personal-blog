'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';

// React Quill'i dinamik olarak yükle
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  )
});

// Quill CSS'ini dinamik olarak yükle
const QuillCSS = dynamic(() => import('react-quill/dist/quill.snow.css'), {
  ssr: false
});

interface ImprovedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  required?: boolean;
  height?: number;
}

export default function ImprovedRichTextEditor({
  value,
  onChange,
  placeholder = 'İçerik yazınız...',
  className = '',
  disabled = false,
  maxLength,
  required = false,
  height = 300
}: ImprovedRichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [textLength, setTextLength] = useState(0);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quill modülleri ve formatları
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link'
  ];

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
      ALLOW_DATA_ATTR: false,
    });
  };

  // Metin uzunluğunu hesapla
  const calculateTextLength = (html: string): number => {
    if (typeof window === 'undefined') return 0;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.length || 0;
  };

  const handleChange = (content: string) => {
    const textLen = calculateTextLength(content);
    
    if (maxLength && textLen > maxLength) {
      return;
    }
    
    setTextLength(textLen);
    
    // Güvenlik: İçeriği sanitize et
    const sanitizedContent = sanitizeHtml(content);
    onChange(sanitizedContent);
  };

  // İlk yüklemede metin uzunluğunu hesapla
  useEffect(() => {
    if (mounted && value) {
      setTextLength(calculateTextLength(value));
    }
  }, [mounted, value]);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`improved-rich-text-editor ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={disabled}
        modules={modules}
        formats={formats}
        style={{ height: `${height}px` }}
      />
      
      {/* Karakter sayacı */}
      {maxLength && (
        <div className="flex justify-end mt-2">
          <span className={`text-sm ${
            textLength > maxLength * 0.9 ? 'text-red-600' : 'text-slate-500'
          }`}>
            {textLength} / {maxLength}
          </span>
        </div>
      )}
      
      {/* Zorunlu alan uyarısı */}
      {required && textLength === 0 && (
        <div className="text-red-600 text-sm mt-1">
          Bu alan zorunludur
        </div>
      )}

      <style jsx global>{`
        .improved-rich-text-editor .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          border-top: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .improved-rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          border-bottom: none;
          background-color: #f8fafc;
        }
        
        .improved-rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #64748b;
        }
        
        .improved-rich-text-editor .ql-toolbar .ql-fill {
          fill: #64748b;
        }
        
        .improved-rich-text-editor .ql-toolbar button:hover .ql-stroke {
          stroke: #059669;
        }
        
        .improved-rich-text-editor .ql-toolbar button:hover .ql-fill {
          fill: #059669;
        }
        
        .improved-rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #059669;
        }
        
        .improved-rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #059669;
        }
        
        .improved-rich-text-editor .ql-editor {
          min-height: ${height - 42}px;
          padding: 12px 15px;
        }
        
        .improved-rich-text-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        
        .improved-rich-text-editor .ql-editor h1 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .improved-rich-text-editor .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .improved-rich-text-editor .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .improved-rich-text-editor .ql-editor p {
          margin-bottom: 1rem;
        }
        
        .improved-rich-text-editor .ql-editor ul,
        .improved-rich-text-editor .ql-editor ol {
          margin-bottom: 1rem;
        }
        
        .improved-rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #14b8a6;
          padding-left: 1rem;
          margin: 1rem 0;
          background-color: #f0fdfa;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .improved-rich-text-editor .ql-editor code {
          background-color: #f1f5f9;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        
        .improved-rich-text-editor .ql-editor pre {
          background-color: #1e293b;
          color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        
        .improved-rich-text-editor .ql-editor a {
          color: #14b8a6;
        }
        
        .improved-rich-text-editor .ql-editor a:hover {
          color: #0f766e;
        }
      `}</style>
    </div>
  );
}
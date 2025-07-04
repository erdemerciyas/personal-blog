'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dinamik import ile ReactQuill'i yükleme (SSR problemi için)
const ReactQuill = dynamic(() => import('react-quill'), {
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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  const handleChange = (content: string) => {
    if (maxLength && content.length > maxLength) {
      return;
    }
    onChange(content);
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
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          minHeight: '200px'
        }}
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
        .rich-text-editor .ql-container {
          min-height: 200px;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .rich-text-editor .ql-editor {
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
          padding: 12px 16px;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
        
        .rich-text-editor .ql-toolbar button:hover {
          color: #059669;
        }
        
        .rich-text-editor .ql-toolbar button.ql-active {
          color: #059669;
        }
        
        .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          color: #059669;
        }
        
        .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-color: #d1d5db;
        }
      `}</style>
    </div>
  );
} 
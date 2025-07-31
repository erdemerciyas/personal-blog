'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
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
  mode?: 'text' | 'markdown';
  showPreview?: boolean;
  rows?: number;
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon: Icon, 
  title, 
  onClick, 
  isActive = false, 
  disabled = false 
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-teal-100 text-teal-700 border border-teal-200'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const UniversalEditor: React.FC<UniversalEditorProps> = ({
  value,
  onChange,
  placeholder = 'İçeriğinizi buraya yazın...',
  className = '',
  minHeight = '200px',
  maxHeight = '500px',
  disabled = false,
  mode = 'text',
  showPreview = true
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Güvenli metin temizleme fonksiyonu
  const sanitizeText = useCallback((text: string): string => {
    // XSS koruması için tehlikeli karakterleri temizle
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Script taglarını kaldır
      .replace(/javascript:/gi, '') // JavaScript protokolünü kaldır
      .replace(/on\w+\s*=/gi, '') // Event handler'ları kaldır
      .replace(/data:/gi, '') // Data URL'lerini kaldır
      .trim();
  }, []);

  // Metin ekleme fonksiyonu (güvenli)
  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef.current || disabled) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    // Güvenlik kontrolü
    const safeBefore = sanitizeText(before);
    const safeAfter = sanitizeText(after);
    const safeText = sanitizeText(textToInsert);
    
    const newValue = 
      value.substring(0, start) + 
      safeBefore + safeText + safeAfter + 
      value.substring(end);
    
    onChange(newValue);

    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + safeBefore.length + safeText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, onChange, disabled, sanitizeText]);

  // Toolbar aksiyonları
  const actions = useMemo(() => ({
    bold: () => {
      if (mode === 'markdown') {
        insertText('**', '**', 'kalın metin');
      } else {
        insertText('<strong>', '</strong>', 'kalın metin');
      }
    },
    italic: () => {
      if (mode === 'markdown') {
        insertText('*', '*', 'italik metin');
      } else {
        insertText('<em>', '</em>', 'italik metin');
      }
    },
    bulletList: () => {
      if (mode === 'markdown') {
        insertText('\n- ', '', 'liste öğesi');
      } else {
        insertText('\n<li>', '</li>', 'liste öğesi');
      }
    },
    numberedList: () => {
      insertText('\n1. ', '', 'liste öğesi');
    },
    link: () => {
      if (mode === 'markdown') {
        insertText('[', '](https://)', 'link metni');
      } else {
        insertText('<a href="https://">', '</a>', 'link metni');
      }
    }
  }), [mode, insertText]);

  // Güvenli HTML render (sadece temel formatlar)
  const renderSafeHTML = useCallback((text: string): string => {
    if (mode === 'markdown') {
      return text
        // Başlıklar
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Kalın ve italik
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Listeler
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // Linkler (güvenli)
        .replace(/\[([^\]]*)\]\(([^)]*)\)/g, (match, text, url) => {
          // URL güvenlik kontrolü
          const safeUrl = url.replace(/javascript:/gi, '').replace(/data:/gi, '');
          return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        })
        // Satır sonları
        .replace(/\n/g, '<br>');
    } else {
      // Text modunda HTML'i olduğu gibi bırak ama güvenli hale getir
      return text
        // Paragrafları düzgün formatla
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => {
          // Eğer zaten HTML tag'ları varsa olduğu gibi bırak
          if (paragraph.includes('<') && paragraph.includes('>')) {
            return paragraph;
          }
          // Yoksa paragraf tag'ı ekle
          return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
    }
  }, [mode]);

  // Kopyalama fonksiyonu
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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
  }, [value]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          actions.bold();
          break;
        case 'i':
          e.preventDefault();
          actions.italic();
          break;
        case 'k':
          e.preventDefault();
          actions.link();
          break;
      }
    }

    // Tab desteği
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: Girinti kaldır
        const lines = value.split('\n');
        const startLine = value.substring(0, start).split('\n').length - 1;
        const endLine = value.substring(0, end).split('\n').length - 1;

        for (let i = startLine; i <= endLine; i++) {
          if (lines[i].startsWith('  ')) {
            lines[i] = lines[i].substring(2);
          }
        }

        const newValue = lines.join('\n');
        onChange(newValue);
      } else {
        // Tab: Girinti ekle
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(start + 2, start + 2);
          }
        }, 0);
      }
    }
  }, [disabled, actions, value, onChange]);

  // Input değişikliği
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = sanitizeText(e.target.value);
    onChange(newValue);
  }, [onChange, sanitizeText]);

  // Önizleme render
  const renderPreview = () => (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-700">
        Önizleme
      </div>
      <div
        className={`p-4 prose prose-slate max-w-none ${className}`}
        style={{ minHeight, maxHeight, overflowY: 'auto' }}
        dangerouslySetInnerHTML={{ __html: renderSafeHTML(value) }}
      />
    </div>
  );

  // Editör render
  const renderEditor = () => (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={BoldIcon}
            title="Kalın (Ctrl+B)"
            onClick={actions.bold}
            disabled={disabled}
          />
          <ToolbarButton
            icon={ItalicIcon}
            title="İtalik (Ctrl+I)"
            onClick={actions.italic}
            disabled={disabled}
          />
          
          <div className="w-px h-6 bg-slate-300 mx-2" />
          
          <ToolbarButton
            icon={ListBulletIcon}
            title="Madde İşaretli Liste"
            onClick={actions.bulletList}
            disabled={disabled}
          />
          <ToolbarButton
            icon={NumberedListIcon}
            title="Numaralı Liste"
            onClick={actions.numberedList}
            disabled={disabled}
          />
          
          <div className="w-px h-6 bg-slate-300 mx-2" />
          
          <ToolbarButton
            icon={LinkIcon}
            title="Link (Ctrl+K)"
            onClick={actions.link}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyToClipboard}
            title="Kopyala"
            className="p-2 rounded-lg transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-600" />
            ) : (
              <DocumentDuplicateIcon className="w-4 h-4" />
            )}
          </button>

          {showPreview && (
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isPreview
                  ? 'bg-teal-100 text-teal-700 border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isPreview ? (
                <>
                  <PencilIcon className="w-4 h-4" />
                  Düzenle
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4" />
                  Önizle
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-4 resize-none focus:outline-none font-mono text-sm ${className}`}
        style={{ 
          minHeight, 
          maxHeight,
          opacity: disabled ? 0.6 : 1
        }}
        spellCheck={false}
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
        <div>
          {value.length} karakter • {mode === 'markdown' ? 'Markdown' : 'HTML'} modu
        </div>
        <div className="flex items-center gap-4">
          <span>Ctrl+B: Kalın</span>
          <span>Ctrl+I: İtalik</span>
          <span>Tab: Girinti</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {isPreview && showPreview ? renderPreview() : renderEditor()}
    </div>
  );
};

export default UniversalEditor;
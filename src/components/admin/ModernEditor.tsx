'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { createLowlight } from 'lowlight';
import { useCallback, useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CommandLineIcon,
  LinkIcon,
  PhotoIcon,
  ListBulletIcon,
  NumberedListIcon,
  ChatBubbleLeftIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  PaintBrushIcon,
  PaintBrushIcon as HighlightIcon,
  TableCellsIcon,
  EyeIcon,
  CodeBracketIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import MediaBrowser from '../MediaBrowser';

// Syntax highlighting için dil desteği
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import php from 'highlight.js/lib/languages/php';

// Lowlight instance oluştur
const lowlight = createLowlight();

// Dilleri kaydet
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('css', css);
lowlight.register('html', html);
lowlight.register('json', json);
lowlight.register('python', python);
lowlight.register('php', php);

interface ModernEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
  allowImages?: boolean;
  allowTables?: boolean;
  allowCodeBlocks?: boolean;
}

const ModernEditor: React.FC<ModernEditorProps> = ({
  content,
  onChange,
  placeholder = 'İçeriğinizi yazın...',
  className = '',
  minHeight = '200px',
  maxHeight = '600px',
  readOnly = false,
  showToolbar = true,
  allowImages = true,
  allowTables = true,
  allowCodeBlocks = true
}) => {
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Güvenli HTML temizleme
  const sanitizeContent = useCallback((html: string) => {
    if (typeof window === 'undefined') return html; // SSR'da temizleme yapma
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div',
        'mark'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'style', 'class',
        'colspan', 'rowspan',
        'data-*'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
  }, []);

  // Editör konfigürasyonu
  const extensions = [
    StarterKit.configure({
      codeBlock: false, // Lowlight ile değiştireceğiz
    }),
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    ...(allowImages ? [
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      })
    ] : []),
    ...(allowCodeBlocks ? [
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      })
    ] : []),
    ...(allowTables ? [
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ] : []),
  ];

  const editor = useEditor({
    extensions,
    content: content || '',
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const sanitizedHtml = sanitizeContent(html);
      onChange(sanitizedHtml);
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none ${className}`,
        style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`,
      },
      handleKeyDown: (view, event) => {
        // Form submit'i engelle - Enter tuşu ile form submit olmasın
        if (event.key === 'Enter') {
          // Sadece normal Enter'ı engelle, Shift+Enter'a izin ver
          if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
            // Normal Enter - yeni satır oluştur ama form submit etme
            return false; // TipTap'in kendi Enter handling'ini kullan
          }
        }
        return false;
      },
    },
  });

  // Toolbar fonksiyonları
  const addImage = useCallback((url: string) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  if (!isMounted || !editor) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-slate-200 rounded-t-lg mb-2"></div>
        <div className="h-48 bg-slate-100 rounded-b-lg"></div>
      </div>
    );
  }

  return (
    <div 
      className="border border-slate-300 rounded-lg overflow-hidden bg-white tiptap-editor-container"
      onKeyDown={(e) => {
        // Form submit'i engelle
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <div className="border-b border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-1">
            
            {/* Undo/Redo */}
            <div className="flex items-center border-r border-slate-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Geri Al"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="İleri Al"
              >
                <ArrowUturnRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Text Formatting */}
            <div className="flex items-center border-r border-slate-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Kalın"
              >
                <BoldIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="İtalik"
              >
                <ItalicIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Altı Çizili"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Üstü Çizili"
              >
                <StrikethroughIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('highlight') ? 'bg-yellow-100 text-yellow-700' : ''}`}
                title="Vurgula"
              >
                <HighlightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center border-r border-slate-300 pr-2 mr-2">
              <select
                onChange={(e) => {
                  const level = parseInt(e.target.value);
                  if (level === 0) {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                  }
                }}
                value={
                  editor.isActive('heading', { level: 1 }) ? 1 :
                  editor.isActive('heading', { level: 2 }) ? 2 :
                  editor.isActive('heading', { level: 3 }) ? 3 :
                  editor.isActive('heading', { level: 4 }) ? 4 :
                  editor.isActive('heading', { level: 5 }) ? 5 :
                  editor.isActive('heading', { level: 6 }) ? 6 : 0
                }
                className="px-2 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100"
              >
                <option value={0}>Paragraf</option>
                <option value={1}>Başlık 1</option>
                <option value={2}>Başlık 2</option>
                <option value={3}>Başlık 3</option>
                <option value={4}>Başlık 4</option>
                <option value={5}>Başlık 5</option>
                <option value={6}>Başlık 6</option>
              </select>
            </div>

            {/* Text Alignment */}
            <div className="flex items-center border-r border-slate-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Sola Hizala"
              >
                <Bars3BottomLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Ortala"
              >
                <Bars3Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Sağa Hizala"
              >
                <Bars3BottomRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center border-r border-slate-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Madde İşaretli Liste"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Numaralı Liste"
              >
                <NumberedListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Alıntı"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Code */}
            <div className="flex items-center border-r border-slate-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('code') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Satır İçi Kod"
              >
                <CommandLineIcon className="w-4 h-4" />
              </button>
              {allowCodeBlocks && (
                <button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : ''}`}
                  title="Kod Bloğu"
                >
                  <CodeBracketIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Media & Links */}
            <div className="flex items-center border-r border-slate-300 pr-2 mr-2">
              <button
                onClick={setLink}
                className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('link') ? 'bg-blue-100 text-blue-700' : ''}`}
                title="Link Ekle"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              {allowImages && (
                <button
                  onClick={() => setShowMediaBrowser(true)}
                  className="p-2 rounded hover:bg-slate-200"
                  title="Resim Ekle"
                >
                  <PhotoIcon className="w-4 h-4" />
                </button>
              )}
              {allowTables && (
                <button
                  onClick={addTable}
                  className="p-2 rounded hover:bg-slate-200"
                  title="Tablo Ekle"
                >
                  <TableCellsIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Preview */}
            <div className="flex items-center">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded hover:bg-slate-200 ${showPreview ? 'bg-green-100 text-green-700' : ''}`}
                title="Önizleme"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        {showPreview ? (
          <div 
            className="p-4 w-full max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeContent(editor.getHTML()) }}
          />
        ) : (
          <div className="relative">
            <EditorContent 
              editor={editor} 
              className="min-h-[200px]"
              style={{ minHeight, maxHeight }}
              data-placeholder={placeholder}
            />
            {/* Placeholder */}
            {editor.isEmpty && !readOnly && (
              <div className="absolute top-4 left-4 text-slate-400 pointer-events-none z-10">
                {placeholder}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Browser */}
      {showMediaBrowser && (
        <MediaBrowser
          isOpen={showMediaBrowser}
          onClose={() => setShowMediaBrowser(false)}
          onSelect={(url) => {
            if (typeof url === 'string') {
              addImage(url);
            }
            setShowMediaBrowser(false);
          }}
          onUploadNew={() => {
            // Handle upload new
            setShowMediaBrowser(false);
          }}
          title="Resim Seç"
          allowedTypes={['image/']}
        />
      )}
    </div>
  );
};

export default ModernEditor;
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import { NewsItem, AIMetadataGenerationResponse } from '@/types/news';
import { logger } from '@/core/lib/logger';
import {
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NewsFormProps {
  initialData?: NewsItem;
  onSubmit?: (data: NewsItem) => Promise<void>;
  isLoading?: boolean;
}

/**
 * News Form Component for Admin Panel
 * Supports multilingual content (TR/ES), WYSIWYG editor, image upload, and AI metadata generation
 */
export default function NewsForm({ initialData, onSubmit, isLoading = false }: NewsFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'tr' | 'es'>('tr');
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    translations: {
      tr: {
        title: initialData?.translations.tr.title || '',
        content: initialData?.translations.tr.content || '',
        excerpt: initialData?.translations.tr.excerpt || '',
        metaDescription: initialData?.translations.tr.metaDescription || '',
        keywords: initialData?.translations.tr.keywords || [],
      },
      es: {
        title: initialData?.translations.es.title || '',
        content: initialData?.translations.es.content || '',
        excerpt: initialData?.translations.es.excerpt || '',
        metaDescription: initialData?.translations.es.metaDescription || '',
        keywords: initialData?.translations.es.keywords || [],
      },
    },
    featuredImage: {
      url: initialData?.featuredImage.url || '',
      altText: initialData?.featuredImage.altText || '',
      cloudinaryPublicId: initialData?.featuredImage.cloudinaryPublicId || '',
    },
    tags: initialData?.tags || [],
    relatedPortfolioIds: initialData?.relatedPortfolioIds || [],
    relatedNewsIds: initialData?.relatedNewsIds || [],
    status: (initialData?.status || 'draft') as 'draft' | 'published',
  });

  // Shared extensions configuration
  const extensions = [
    StarterKit.configure({
      link: false, // Disable link from StarterKit to avoid duplication
    }),
    Link.configure({
      openOnClick: false,
    }),
    TiptapImage,
  ];

  // TipTap Editor for Turkish
  const editorTr = useEditor({
    extensions,
    content: formData.translations.tr.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          tr: {
            ...prev.translations.tr,
            content: editor.getHTML(),
          },
        },
      }));
    },
  });

  // TipTap Editor for Spanish
  const editorEs = useEditor({
    extensions,
    content: formData.translations.es.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          es: {
            ...prev.translations.es,
            content: editor.getHTML(),
          },
        },
      }));
    },
  });

  const currentEditor = activeLanguage === 'tr' ? editorTr : editorEs;

  // Handle image upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);

      // Create FormData for upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('pageContext', 'news');

      console.log('Uploading file:', file.name, file.type, file.size);

      // Upload to /api/admin/upload
      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('Upload response status:', uploadRes.status);

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        console.error('Upload error:', errorData);
        throw new Error(errorData.error || 'Resim yüklenemedi');
      }

      const uploadData = await uploadRes.json();
      console.log('Upload success:', uploadData);

      setFormData((prev) => ({
        ...prev,
        featuredImage: {
          url: uploadData.url,
          altText: file.name.replace(/\.[^/.]+$/, ''),
          cloudinaryPublicId: uploadData.publicId,
        },
      }));

      setSuccess('Resim başarıyla yüklendi');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      console.error('Upload error caught:', errorMessage);
      logger.error('Resim yükleme hatası', 'NEWS_FORM', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  }, []);

  // Generate metadata with AI
  const handleGenerateMetadata = useCallback(async () => {
    try {
      setGeneratingMetadata(true);
      setError(null);

      const content = formData.translations[activeLanguage].content;
      if (!content || content.length < 100) {
        setError('Content must be at least 100 characters to generate metadata');
        return;
      }

      const response = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          language: activeLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate metadata');
      }

      const { data: metadata } = (await response.json()) as { data: AIMetadataGenerationResponse };

      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [activeLanguage]: {
            ...prev.translations[activeLanguage],
            title: metadata.title,
            metaDescription: metadata.metaDescription,
            excerpt: metadata.excerpt,
            keywords: metadata.keywords,
          },
        },
      }));

      setSuccess('Metadata generated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error generating metadata', 'NEWS_FORM', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setGeneratingMetadata(false);
    }
  }, [formData.translations, activeLanguage]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Only send translations that have content
      const translations: any = {};

      if (formData.translations.tr.title || formData.translations.tr.content) {
        translations.tr = formData.translations.tr;
      }

      if (formData.translations.es.title || formData.translations.es.content) {
        translations.es = formData.translations.es;
      }

      const cleanedData = {
        ...formData,
        translations,
      };

      console.log('Submitting form data:', JSON.stringify(cleanedData, null, 2));

      const url = initialData ? `/api/news/${initialData._id}` : '/api/news';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save news article');
      }

      const { data: savedNews } = await response.json();

      if (onSubmit) {
        await onSubmit(savedNews);
      }

      setSuccess(initialData ? 'News article updated successfully' : 'News article created successfully');
      setTimeout(() => {
        router.push('/admin/news');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error saving news article', 'NEWS_FORM', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const translation = formData.translations[activeLanguage];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start space-x-3">
          <XMarkIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Hata</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start space-x-3">
          <CheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Başarılı</p>
            <p className="text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Language Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {(['tr', 'es'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLanguage(lang)}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${activeLanguage === lang
                  ? 'bg-brand-primary-50 text-brand-primary-800 border-b-2 border-brand-primary-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              {lang === 'tr' ? 'Türkçe' : 'Español'}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Image */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Öne Çıkan Resim</h3>

        {formData.featuredImage.url && (
          <div className="mb-4">
            <div className="relative w-full h-64 rounded-xl overflow-hidden bg-slate-100">
              <Image
                src={formData.featuredImage.url}
                alt={formData.featuredImage.altText}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resim Dosyası
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary-700 file:text-white hover:file:bg-brand-primary-800 disabled:opacity-50"
            />
            <p className="text-xs text-slate-500 mt-2">JPG, PNG veya WebP • Maksimum 5MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Alt Metin
            </label>
            <input
              type="text"
              placeholder="Resim açıklaması (SEO için önemli)"
              value={formData.featuredImage.altText}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  featuredImage: {
                    ...prev.featuredImage,
                    altText: e.target.value,
                  },
                }))
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Başlık</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={translation.title}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                translations: {
                  ...prev.translations,
                  [activeLanguage]: {
                    ...prev.translations[activeLanguage],
                    title: e.target.value,
                  },
                },
              }))
            }
            placeholder="Makale başlığını girin"
            maxLength={200}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500">{translation.title.length}/200 karakter</p>
        </div>
      </div>

      {/* Content Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">İçerik</h3>

        {/* Editor Toolbar */}
        <div className="flex gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200 mb-2">
          <button
            type="button"
            onClick={() => currentEditor?.chain().focus().toggleBold().run()}
            className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 font-semibold text-sm"
            title="Kalın"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => currentEditor?.chain().focus().toggleItalic().run()}
            className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 italic text-sm"
            title="İtalik"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => currentEditor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 font-semibold text-sm"
            title="Başlık"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => currentEditor?.chain().focus().toggleBulletList().run()}
            className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 text-sm"
            title="Liste"
          >
            •
          </button>
        </div>

        {/* Editor */}
        <EditorContent
          editor={currentEditor}
          className="w-full min-h-96 p-4 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary-500 prose prose-sm max-w-none"
        />
      </div>

      {/* Excerpt */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Özet</h3>
        <div className="space-y-2">
          <textarea
            value={translation.excerpt}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                translations: {
                  ...prev.translations,
                  [activeLanguage]: {
                    ...prev.translations[activeLanguage],
                    excerpt: e.target.value,
                  },
                },
              }))
            }
            placeholder="Makalenin kısa özeti"
            maxLength={150}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500">{translation.excerpt.length}/150 karakter</p>
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">SEO Metadata</h3>
          <button
            type="button"
            onClick={handleGenerateMetadata}
            disabled={generatingMetadata || loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{generatingMetadata ? 'Oluşturuluyor...' : 'AI ile Oluştur'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Meta Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Meta Açıklaması</label>
            <textarea
              value={translation.metaDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    [activeLanguage]: {
                      ...prev.translations[activeLanguage],
                      metaDescription: e.target.value,
                    },
                  },
                }))
              }
              placeholder="SEO meta açıklaması"
              maxLength={160}
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500">{translation.metaDescription.length}/160 karakter</p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Anahtar Kelimeler</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {translation.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-brand-primary-100 text-brand-primary-800 rounded-full text-sm flex items-center gap-2 border border-brand-primary-200"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        translations: {
                          ...prev.translations,
                          [activeLanguage]: {
                            ...prev.translations[activeLanguage],
                            keywords: translation.keywords.filter((_, i) => i !== index),
                          },
                        },
                      }))
                    }
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Anahtar kelime yazıp Enter tuşuna basın"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const keyword = e.currentTarget.value.trim();
                  if (keyword && translation.keywords.length < 10) {
                    setFormData((prev) => ({
                      ...prev,
                      translations: {
                        ...prev.translations,
                        [activeLanguage]: {
                          ...prev.translations[activeLanguage],
                          keywords: [...translation.keywords, keyword],
                        },
                      },
                    }));
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500">{translation.keywords.length}/10 anahtar kelime</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Etiketler</h3>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 text-slate-900 rounded-full text-sm flex items-center gap-2 border border-slate-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: prev.tags.filter((_, i) => i !== index),
                    }))
                  }
                  className="hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Etiket yazıp Enter tuşuna basın"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const tag = e.currentTarget.value.trim();
                if (tag && !formData.tags.includes(tag)) {
                  setFormData((prev) => ({
                    ...prev,
                    tags: [...prev.tags, tag],
                  }));
                  e.currentTarget.value = '';
                }
              }
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Durum</h3>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as 'draft' | 'published',
            }))
          }
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
        >
          <option value="draft">Taslak</option>
          <option value="published">Yayınlandı</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="flex-1 px-6 py-3 bg-brand-primary-700 hover:bg-brand-primary-800 disabled:bg-slate-300 text-white rounded-lg transition-all font-semibold flex items-center justify-center space-x-2"
        >
          <CheckIcon className="w-5 h-5" />
          <span>{loading ? 'Kaydediliyor...' : initialData ? 'Makaleyi Güncelle' : 'Makale Oluştur'}</span>
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all font-semibold flex items-center space-x-2"
        >
          <XMarkIcon className="w-5 h-5" />
          <span>İptal</span>
        </button>
      </div>
    </form>
  );
}

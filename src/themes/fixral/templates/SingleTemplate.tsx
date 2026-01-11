/**
 * Fixral Single Template
 */

import React from 'react';
import NextImage from 'next/image';

interface SingleTemplateProps {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  category?: string;
}

export default function SingleTemplate({
  title,
  content,
  excerpt,
  featuredImage,
  author,
  createdAt,
  updatedAt,
  tags = [],
  category,
}: SingleTemplateProps) {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4">
      {/* Featured Image */}
      {featuredImage && (
        <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
          <NextImage
            src={featuredImage}
            alt={title || 'Featured image'}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {category && (
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{
              backgroundColor: 'var(--brand-primary-100)',
              color: 'var(--brand-primary-700)'
            }}
          >
            {category}
          </span>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        {excerpt && (
          <p className="text-xl text-gray-600 mb-6">{excerpt}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          {author && (
            <span>
              <span className="font-medium">Yazar:</span> {author}
            </span>
          )}
          {createdAt && (
            <span>
              <span className="font-medium">Yayınlanma:</span>{' '}
              {new Date(createdAt).toLocaleDateString('tr-TR')}
            </span>
          )}
          {updatedAt && (
            <span>
              <span className="font-medium">Güncelleme:</span>{' '}
              {new Date(updatedAt).toLocaleDateString('tr-TR')}
            </span>
          )}
        </div>
      </header>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-gray-600">İçerik bulunamadı.</p>
        )}
      </div>
    </article>
  );
}

/**
 * Default Blog Template
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogItem {
  id: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  slug: string;
  createdAt?: string;
  author?: string;
}

interface BlogTemplateProps {
  posts?: BlogItem[];
  title?: string;
}

export default function BlogTemplate({
  posts = [],
  title = 'Blog',
}: BlogTemplateProps) {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 text-lg">
          Son yazılar ve güncellemeler
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.featuredImage && (
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-brand-primary-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  {post.author && <span>{post.author}</span>}
                  {post.createdAt && (
                    <span>
                      {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Henüz blog yazısı yok</p>
        </div>
      )}
    </div>
  );
}

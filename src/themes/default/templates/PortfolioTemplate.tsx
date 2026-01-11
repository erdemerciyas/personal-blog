/**
 * Default Portfolio Template
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  category?: string;
  technologies?: string[];
}

interface PortfolioTemplateProps {
  items?: PortfolioItem[];
  title?: string;
}

export default function PortfolioTemplate({
  items = [],
  title = 'Portfolyo',
}: PortfolioTemplateProps) {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Başarıyla tamamladığımız projelerden bazı örnekler
        </p>
      </header>

      {/* Portfolio Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
            >
              {/* Image */}
              <div className="relative h-64 bg-gray-200 overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary-900 to-brand-primary-700">
                    <span className="text-white text-4xl font-bold">
                      {item.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {item.category && (
                  <span className="inline-block px-3 py-1 bg-brand-primary-100 text-brand-primary-700 rounded-full text-xs font-medium mb-3">
                    {item.category}
                  </span>
                )}
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Technologies */}
                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.technologies.slice(0, 4).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {item.technologies.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{item.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* View Details Button */}
                <Link
                  href={`/portfolio/${item.slug}`}
                  className="inline-flex items-center text-brand-primary-600 hover:text-brand-primary-700 font-medium transition-colors"
                >
                  Detayları Gör
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Henüz proje eklenmemiş</p>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';

interface NewsCarouselProps {
  language: 'tr' | 'es';
  limit?: number;
  autoplay?: boolean;
  className?: string;
}

/**
 * News Carousel Component
 * Displays featured news articles in a responsive carousel
 * - Mobile: 1 slide per view
 * - Tablet: 2 slides per view
 * - Desktop: 3 slides per view
 */
export default function NewsCarousel({
  language,
  limit = 6,
  autoplay = true,
  className = '',
}: NewsCarouselProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, limit]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/news?status=published&limit=${limit}&sortBy=publishedAt&sortOrder=desc`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();

      if (data.success && data.data?.items) {
        setNews(data.data.items);
      } else {
        throw new Error(data.error || 'Failed to fetch news');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error fetching news for carousel', 'NEWS_CAROUSEL', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full bg-gray-100 rounded-lg ${className}`}>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fixral-primary"></div>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className={`w-full bg-gray-100 rounded-lg ${className}`}>
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-600">
            {error ? `Error: ${error}` : 'No news articles available'}
          </p>
        </div>
      </div>
    );
  }

  const getTranslation = (item: NewsItem) => {
    return item.translations[language] || item.translations.tr;
  };

  const getNewsUrl = (slug: string) => {
    return language === 'tr' ? `/tr/haberler/${slug}` : `/es/noticias/${slug}`;
  };

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={autoplay ? { delay: 5000, disableOnInteraction: false } : false}
        a11y={{
          enabled: true,
          prevSlideMessage: language === 'tr' ? 'Önceki haber' : 'Noticia anterior',
          nextSlideMessage: language === 'tr' ? 'Sonraki haber' : 'Siguiente noticia',
          firstSlideMessage: language === 'tr' ? 'İlk haber' : 'Primera noticia',
          lastSlideMessage: language === 'tr' ? 'Son haber' : 'Última noticia',
          paginationBulletMessage: language === 'tr' ? 'Haber {{index}}' : 'Noticia {{index}}',
        }}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
        }}
        className="news-carousel"
      >
        {news.map((item) => {
          const translation = getTranslation(item);
          const newsUrl = getNewsUrl(item.slug);

          return (
            <SwiperSlide key={item._id}>
              <Link href={newsUrl} className="block h-full">
                <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative w-full h-48 overflow-hidden bg-gray-200">
                    <Image
                      src={item.featuredImage.url}
                      alt={item.featuredImage.altText}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      priority={false}
                      loading="lazy"
                    />
                  </div>

                  {/* Content Container */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-fixral-primary transition-colors">
                      {translation.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                      {translation.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                      <time dateTime={new Date(item.publishedAt || item.createdAt).toISOString()}>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString(
                          language === 'tr' ? 'tr-TR' : 'es-ES',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </time>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <span className="text-fixral-primary font-medium">
                          {item.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Styles */}
      <style jsx>{`
        :global(.news-carousel .swiper-button-next),
        :global(.news-carousel .swiper-button-prev) {
          color: #003450;
          background-color: rgba(255, 255, 255, 0.9);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        :global(.news-carousel .swiper-button-next:hover),
        :global(.news-carousel .swiper-button-prev:hover) {
          background-color: #003450;
          color: white;
        }

        :global(.news-carousel .swiper-button-next::after),
        :global(.news-carousel .swiper-button-prev::after) {
          font-size: 20px;
        }

        :global(.news-carousel .swiper-pagination-bullet) {
          background-color: #003450;
          opacity: 0.5;
        }

        :global(.news-carousel .swiper-pagination-bullet-active) {
          background-color: #003450;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

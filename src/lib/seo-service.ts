import connectDB from './mongoose';
import News from '@/models/News';
import { logger } from '@/core/lib/logger';

/**
 * SEO Service
 * Handles sitemap generation, schema markup, and SEO optimization
 */

/**
 * Generate sitemap entries for news articles
 */
export async function generateNewsSitemapEntries(): Promise<
  Array<{
    url: string;
    lastmod: string;
    changefreq: string;
    priority: number;
  }>
> {
  try {
    await connectDB();

    const articles = await News.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .lean();

    const entries = articles.flatMap((article: any) => [
      {
        url: `https://www.fixral.com/tr/haberler/${article.slug}`,
        lastmod: new Date(article.updatedAt || article.publishedAt).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        url: `https://www.fixral.com/es/noticias/${article.slug}`,
        lastmod: new Date(article.updatedAt || article.publishedAt).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8,
      },
    ]);

    logger.info('Generated sitemap entries for news', 'SEO_SERVICE', {
      count: entries.length,
    });

    return entries;
  } catch (error) {
    logger.error('Error generating sitemap entries', 'SEO_SERVICE', { error });
    return [];
  }
}

/**
 * Generate XML sitemap for news articles
 */
export async function generateNewsSitemap(): Promise<string> {
  try {
    const entries = await generateNewsSitemapEntries();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
        .map(
          (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
        )
        .join('\n')}
</urlset>`;

    return xml;
  } catch (error) {
    logger.error('Error generating sitemap', 'SEO_SERVICE', { error });
    return '';
  }
}

/**
 * Generate JSON-LD NewsArticle schema
 */
export function generateNewsArticleSchema(article: any, language: 'tr' | 'es' = 'tr') {
  const translation = article.translations[language];

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: translation.title,
    description: translation.metaDescription,
    image: article.featuredImage.url,
    datePublished: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author.name,
      email: article.author.email,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Fixral',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.fixral.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.fixral.com/${language === 'tr' ? 'tr/haberler' : 'es/noticias'}/${article.slug}`,
    },
    keywords: translation.keywords.join(', '),
  };
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(article: any, language: 'tr' | 'es' = 'tr') {
  const translation = article.translations[language];
  const url = `https://www.fixral.com/${language === 'tr' ? 'tr/haberler' : 'es/noticias'}/${article.slug}`;

  return {
    'og:title': translation.title,
    'og:description': translation.metaDescription,
    'og:image': article.featuredImage.url,
    'og:url': url,
    'og:type': 'article',
    'og:site_name': 'Fixral',
    'article:published_time': article.publishedAt?.toISOString() || article.createdAt.toISOString(),
    'article:modified_time': article.updatedAt.toISOString(),
    'article:author': article.author.name,
    'article:tag': translation.keywords.join(', '),
  };
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(article: any, language: 'tr' | 'es' = 'tr') {
  const translation = article.translations[language];

  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': translation.title,
    'twitter:description': translation.metaDescription,
    'twitter:image': article.featuredImage.url,
    'twitter:site': '@fixral',
  };
}

/**
 * Calculate SEO score for an article
 */
export function calculateSEOScore(article: any, language: 'tr' | 'es' = 'tr'): number {
  const translation = article.translations[language];
  let score = 0;

  // Title (max 20 points)
  if (translation.title && translation.title.length >= 30 && translation.title.length <= 60) {
    score += 20;
  } else if (translation.title && translation.title.length > 0) {
    score += 10;
  }

  // Meta description (max 20 points)
  if (
    translation.metaDescription &&
    translation.metaDescription.length >= 120 &&
    translation.metaDescription.length <= 160
  ) {
    score += 20;
  } else if (translation.metaDescription && translation.metaDescription.length > 0) {
    score += 10;
  }

  // Content length (max 20 points)
  const contentLength = translation.content?.length || 0;
  if (contentLength >= 1000) {
    score += 20;
  } else if (contentLength >= 500) {
    score += 10;
  }

  // Keywords (max 15 points)
  if (translation.keywords && translation.keywords.length >= 5 && translation.keywords.length <= 10) {
    score += 15;
  } else if (translation.keywords && translation.keywords.length > 0) {
    score += 8;
  }

  // Featured image (max 15 points)
  if (article.featuredImage && article.featuredImage.url && article.featuredImage.altText) {
    score += 15;
  } else if (article.featuredImage && article.featuredImage.url) {
    score += 8;
  }

  // Excerpt (max 10 points)
  if (translation.excerpt && translation.excerpt.length > 0) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Get SEO recommendations for an article
 */
export function getSEORecommendations(article: any, language: 'tr' | 'es' = 'tr'): string[] {
  const translation = article.translations[language];
  const recommendations: string[] = [];

  // Title recommendations
  if (!translation.title) {
    recommendations.push('Add a title for the article');
  } else if (translation.title.length < 30) {
    recommendations.push('Title is too short (minimum 30 characters)');
  } else if (translation.title.length > 60) {
    recommendations.push('Title is too long (maximum 60 characters)');
  }

  // Meta description recommendations
  if (!translation.metaDescription) {
    recommendations.push('Add a meta description');
  } else if (translation.metaDescription.length < 120) {
    recommendations.push('Meta description is too short (minimum 120 characters)');
  } else if (translation.metaDescription.length > 160) {
    recommendations.push('Meta description is too long (maximum 160 characters)');
  }

  // Content recommendations
  const contentLength = translation.content?.length || 0;
  if (contentLength < 500) {
    recommendations.push('Content is too short (minimum 500 characters recommended)');
  }

  // Keywords recommendations
  if (!translation.keywords || translation.keywords.length === 0) {
    recommendations.push('Add keywords for better SEO');
  } else if (translation.keywords.length < 5) {
    recommendations.push('Add more keywords (minimum 5 recommended)');
  }

  // Featured image recommendations
  if (!article.featuredImage || !article.featuredImage.url) {
    recommendations.push('Add a featured image');
  } else if (!article.featuredImage.altText) {
    recommendations.push('Add alt text to the featured image');
  }

  // Excerpt recommendations
  if (!translation.excerpt) {
    recommendations.push('Add an excerpt for better preview');
  }

  return recommendations;
}


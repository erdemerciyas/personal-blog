import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import { NewsItem } from '@/types/news';
import { logger } from '@/lib/logger';
import PageHero from '@/components/common/PageHero';

interface PageProps {
  params: {
    lang: string;
    slug: string;
  };
}

/**
 * Generate metadata for news article detail page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    await connectDB();

    const news = (await News.findOne({ slug: params.slug }).lean()) as unknown as NewsItem | null;

    if (!news || news.status !== 'published') {
      return {
        title: 'Not Found',
        description: 'The requested news article was not found.',
      };
    }

    const translation = news.translations.tr;

    return {
      title: translation.title,
      description: translation.metaDescription,
      keywords: translation.keywords,
      openGraph: {
        title: translation.title,
        description: translation.metaDescription,
        type: 'article',
        url: `https://fixral.com/tr/haberler/${news.slug}`,
        images: [
          {
            url: news.featuredImage.url,
            width: 1200,
            height: 630,
            alt: news.featuredImage.altText,
          },
        ],
        publishedTime: news.publishedAt?.toISOString(),
        authors: [news.author.name],
      },
      twitter: {
        card: 'summary_large_image',
        title: translation.title,
        description: translation.metaDescription,
        images: [news.featuredImage.url],
      },
    };
  } catch (error) {
    logger.error('Error generating metadata for news detail', 'NEWS_DETAIL', { error });
    return {
      title: 'News Article',
      description: 'Read the latest news article',
    };
  }
}

/**
 * Generate static params for news articles
 */
export async function generateStaticParams() {
  try {
    await connectDB();

    const news = await News.find({ status: 'published' })
      .select('slug')
      .lean()
      .limit(100);

    return news.map((item: any) => ({
      lang: 'tr',
      slug: item.slug,
    }));
  } catch (error) {
    logger.error('Error generating static params for news', 'NEWS_DETAIL', { error });
    return [];
  }
}

/**
 * Revalidate news detail pages every hour
 * This ensures content updates are reflected without full rebuild
 */
export const revalidate = 3600; // 1 hour

/**
 * News Detail Page Component
 */
export default async function NewsDetailPage({ params }: PageProps) {
  try {
    await connectDB();

    const news = (await News.findOne({ slug: params.slug })
      .populate('relatedPortfolioIds', 'title slug coverImage')
      .populate('relatedNewsIds', 'slug translations featuredImage')
      .lean()) as NewsItem | null;

    if (!news || news.status !== 'published') {
      notFound();
    }

    const translation = news.translations.tr;

    // Generate JSON-LD schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: translation.title,
      description: translation.metaDescription,
      image: news.featuredImage.url,
      datePublished: news.publishedAt?.toISOString() || news.createdAt.toISOString(),
      dateModified: news.updatedAt.toISOString(),
      author: {
        '@type': 'Person',
        name: news.author.name,
        email: news.author.email,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fixral',
        logo: {
          '@type': 'ImageObject',
          url: 'https://fixral.com/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://fixral.com/tr/haberler/${news.slug}`,
      },
    };

    return (
      <div className="min-h-screen bg-slate-50">
        <PageHero
          title={translation.title}
          backgroundGradient="bg-gradient-primary"
          showButton={false}
          variant="compact"
        />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">

          {/* Custom Breadcrumb matching site style */}
          <nav className="mb-6 rounded-2xl border border-slate-200 bg-white/80 shadow-sm px-4 py-3 text-sm text-slate-600">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={`/${params.lang}`} className="hover:text-fixral-primary transition-colors flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117.414 11H16v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5H3.293a1 1 0 01-1.414-1.414l7-7z" clipRule="evenodd" />
                  </svg>
                  <span>Ana Sayfa</span>
                </Link>
              </li>
              <li className="text-slate-300">/</li>
              <li>
                <Link href={`/${params.lang}/haberler`} className="hover:text-fixral-primary transition-colors">
                  Haberler
                </Link>
              </li>
              <li className="text-slate-300">/</li>
              <li className="font-medium text-slate-900 line-clamp-1 max-w-[200px] sm:max-w-md">{translation.title}</li>
            </ol>
          </nav>

          {/* Feature Image - Clean Layout */}
          {news.featuredImage?.url && (
            <div className="relative w-full mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-slate-100" style={{ aspectRatio: '16/9' }}>
              <Image
                src={news.featuredImage.url}
                alt={news.featuredImage.altText || translation.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

            {/* Main Content - Left Column */}
            <main className="lg:col-span-7 space-y-6">

              {/* Article Card */}
              <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                  {/* Meta Header */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
                    {news.tags && news.tags.length > 0 && (
                      <span className="px-3 py-1 bg-fixral-primary/10 text-fixral-primary rounded-full font-medium text-xs uppercase tracking-wider">
                        {news.tags[0]}
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                      </svg>
                      <time dateTime={new Date(news.publishedAt || news.createdAt).toISOString()}>
                        {new Date(news.publishedAt || news.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  </div>

                  {/* Excerpt */}
                  {translation.excerpt && (
                    <div className="text-lg md:text-xl text-slate-600 italic border-l-4 border-fixral-primary pl-4 mb-8">
                      {translation.excerpt}
                    </div>
                  )}

                  {/* HTML Content */}
                  <div className="prose prose-lg prose-slate max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: translation.content }} />
                  </div>
                </div>
              </article>

              {/* Related Portfolio (if any) */}
              {news.relatedPortfolioIds && news.relatedPortfolioIds.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">İlgili Projeler</h2>
                    <div className="h-px bg-slate-200 flex-grow"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(news.relatedPortfolioIds as any[]).map((portfolio) => (
                      <Link
                        key={portfolio._id}
                        href={`/portfolio/${portfolio.slug}`}
                        className="group relative h-48 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                      >
                        <Image
                          src={portfolio.coverImage}
                          alt={portfolio.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 w-full">
                          <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-fixral-secondary transition-colors">
                            {portfolio.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

            </main>

            {/* Sidebar - Right Column */}
            <aside className="lg:col-span-3 space-y-6">

              {/* Author Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Yazar</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-fixral-primary/10 rounded-full flex items-center justify-center text-fixral-primary font-bold text-xl">
                    {news.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{news.author.name}</div>
                    <div className="text-xs text-slate-500">İçerik Editörü</div>
                  </div>
                </div>
              </div>

              {/* Tags Cloud */}
              {news.tags && news.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Konular</h3>
                  <div className="flex flex-wrap gap-2">
                    {news.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm transition-colors cursor-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Bu Haberi Paylaş</h3>
                <div className="flex justify-center gap-4">
                  <a
                    href={`https://twitter.com/intent/tweet?url=https://fixral.com/tr/haberler/${news.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#1DA1F2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=https://fixral.com/tr/haberler/${news.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#4267B2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=https://fixral.com/tr/haberler/${news.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#0077b5] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                </div>
              </div>

              {/* Related News Sticky */}
              {news.relatedNewsIds && news.relatedNewsIds.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">İlginizi Çekebilir</h3>
                  <div className="space-y-4">
                    {(news.relatedNewsIds as any[]).map((relatedNews) => (
                      <Link key={relatedNews._id} href={`/tr/haberler/${relatedNews.slug}`} className="flex gap-3 group">
                        <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={relatedNews.featuredImage.url}
                            alt={relatedNews.featuredImage.altText || ''}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 group-hover:text-fixral-primary line-clamp-2 leading-snug">
                            {relatedNews.translations.tr.title}
                          </h4>
                          <div className="text-xs text-slate-500 mt-1">Okumaya başla →</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </aside>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Error rendering news detail page', 'NEWS_DETAIL', { error });
    notFound();
  }
}

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import { NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';
import PageHero from '@/components/common/PageHero';

interface PageProps {
  params: {
    lang: string;
  };
  searchParams: {
    page?: string;
    search?: string;
    tag?: string;
  };
}

export const metadata: Metadata = {
  title: 'Haberler | Fixral',
  description: 'Fixral\'dan en son haberler ve duyuruları okuyun',
  openGraph: {
    title: 'Haberler | Fixral',
    description: 'Fixral\'dan en son haberler ve duyuruları okuyun',
    type: 'website',
    url: 'https://www.fixral.com/tr/haberler',
  },
};

const ITEMS_PER_PAGE = 12;

export default async function NewsListPage({ searchParams }: PageProps) {
  try {
    await connectDB();

    const page = Math.max(1, parseInt(searchParams.page || '1'));
    const search = searchParams.search || '';
    const tag = searchParams.tag || '';

    // Build query
    const query: any = { status: 'published' };

    if (search) {
      query.$or = [
        { 'translations.tr.title': { $regex: search, $options: 'i' } },
        { 'translations.tr.content': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    // Get total count
    const total = await News.countDocuments(query);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Fetch articles
    const articles = (await News.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .lean()) as NewsItem[];

    // Get all tags for filter
    const allTags = await News.distinct('tags', { status: 'published' });

    return (
      <div className="min-h-screen bg-slate-50">
        <PageHero
          title="Haberler & Duyurular"
          description="Fixral'dan en son haberler, şirket duyuruları ve sektör güncellemelerini buradan takip edebilirsiniz."
          showButton={false}
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">

          {/* Breadcrumb */}
          <nav className="mb-8 rounded-2xl border border-slate-200 bg-white/80 shadow-sm px-4 py-3 text-sm text-slate-600">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/tr" className="hover:text-fixral-primary transition-colors flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117.414 11H16v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5H3.293a1 1 0 01-1.414-1.414l7-7z" clipRule="evenodd" />
                  </svg>
                  <span>Ana Sayfa</span>
                </Link>
              </li>
              <li className="text-slate-300">/</li>
              <li className="font-medium text-slate-900">Haberler</li>
            </ol>
          </nav>

          {/* Search and Filters */}
          <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">

            {/* Search */}
            <form className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-fixral-primary transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                placeholder="Haberlerde ara..."
                defaultValue={search}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fixral-primary focus:border-transparent transition-all"
              />
            </form>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <Link
                  href="/tr/haberler"
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!tag
                    ? 'bg-fixral-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                >
                  Tümü
                </Link>
                {allTags.map((t) => (
                  <Link
                    key={t}
                    href={`/tr/haberler?tag=${encodeURIComponent(t)}`}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tag === t
                      ? 'bg-fixral-primary text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Results Info */}
          {(search || tag) && (
            <div className="mb-6 text-sm text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fixral-primary"></span>
              {search && <span>"{search}" için</span>}
              {tag && <span>"{tag}" etiketinde</span>}
              <strong>{total} sonuç bulundu</strong>
            </div>
          )}

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {articles.map((article) => {
                  const translation = article.translations.tr;
                  return (
                    <Link
                      key={article._id}
                      href={`/tr/haberler/${article.slug}`}
                      className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                        <Image
                          src={article.featuredImage.url}
                          alt={article.featuredImage.altText || translation.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Date Overlay */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                            'tr-TR',
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-fixral-primary bg-fixral-primary/5 px-2 py-1 rounded">
                              {article.tags[0]}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-fixral-primary transition-colors leading-tight">
                          {translation.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-slate-500 line-clamp-3 mb-4 flex-grow text-sm leading-relaxed">
                          {translation.excerpt}
                        </p>

                        {/* Footer */}
                        <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between text-sm">
                          <span className="font-medium text-fixral-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                            Devamını Oku
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/tr/haberler?page=${page - 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-fixral-primary hover:text-fixral-primary transition-all shadow-sm"
                    >
                      ← Önceki
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/tr/haberler?page=${p}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all shadow-sm ${p === page
                        ? 'bg-fixral-primary text-white shadow-md'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-fixral-primary hover:text-fixral-primary'
                        }`}
                    >
                      {p}
                    </Link>
                  ))}

                  {page < totalPages && (
                    <Link
                      href={`/tr/haberler?page=${page + 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-fixral-primary hover:text-fixral-primary transition-all shadow-sm"
                    >
                      Sonraki →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Sonuç Bulunamadı</h3>
              <p className="text-slate-500 mb-6">Aradığınız kriterlere uygun haber bulunamadı.</p>
              <Link
                href="/tr/haberler"
                className="inline-flex items-center px-4 py-2 bg-fixral-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
              >
                Tüm Haberleri Göster
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Error rendering news list page', 'NEWS_LIST', { error });
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Haberler</h1>
        <p className="text-red-600">Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }
}


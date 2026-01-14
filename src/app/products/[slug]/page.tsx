import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import FixralCard from '@/components/ui/FixralCard';
import TiltHover from '@/components/TiltHover';
import sanitizeHtml from 'sanitize-html';
import { appConfig, config } from '@/core/lib/config';
const PageHero = dynamic(() => import('@/components/common/PageHero'), { ssr: false });
// Avoid importing client-only image component in server page
import { ApprovedReviews, ProductReviewForm } from './ReviewClient';
const ProductGallery = dynamic(() => import('./GalleryClient'), { ssr: false });
import Breadcrumbs from '@/components/Breadcrumbs';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import ProductJsonLd from '@/components/seo/ProductJsonLd';
import {
  SparklesIcon,
  CubeIcon,
  ShoppingCartIcon,
  StarIcon,
  TagIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
const FavoriteButton = dynamic(() => import('./FavoriteButton'), { ssr: false });
import ProductClientWrapper from './ProductClientWrapper';
import AskQuestionButton from './AskQuestionButton';


async function getProduct(slug: string) {
  const base = process.env.NEXTAUTH_URL || '';
  const res = await fetch(`${base}/api/products/slug/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function getRelatedProducts(categorySlug?: string, currentSlug?: string) {
  if (!categorySlug) return [] as Array<{ _id: string; slug: string; coverImage: string; title: string; price?: number; currency?: string; condition: 'new' | 'used' }>;
  const base = process.env.NEXTAUTH_URL || '';
  const res = await fetch(`${base}/api/products?categorySlug=${encodeURIComponent(categorySlug)}&limit=4`, { next: { revalidate: 60 } });
  if (!res.ok) return [] as Array<{ _id: string; slug: string; coverImage: string; title: string; price?: number; currency?: string; condition: 'new' | 'used' }>;
  const data = await res.json();
  const items = (data.items || []) as Array<{ _id: string; slug: string; coverImage: string; title: string; price?: number; currency?: string; condition: 'new' | 'used' }>;
  return items.filter((p) => p.slug !== currentSlug).slice(0, 3);
}

async function getPageSettings(pageId: string) {
  const base = process.env.NEXTAUTH_URL || '';
  try {
    const res = await fetch(`${base}/api/admin/page-settings/${pageId}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();
  const pageSettings = await getPageSettings('product-detail');
  const buttonText = pageSettings?.buttonText || 'Detaylara İn';
  const buttonLink = pageSettings?.buttonLink || '#product-detail';
  const baseDesc = `${product.condition === 'new' ? 'Sıfır ürün' : 'İkinci el ürün'}${product.price ? ` • ${product.price} ${product.currency}` : ''}`;
  const description = pageSettings?.description ? `${baseDesc} • ${pageSettings.description}` : baseDesc;
  const firstCategorySlug = Array.isArray(product.categoryIds) && product.categoryIds.length > 0 ? (product.categoryIds[0]?.slug as string | undefined) : undefined;
  const related = await getRelatedProducts(firstCategorySlug, product.slug as string);
  const baseUrl = (config.app.url || process.env.NEXTAUTH_URL || '').replace(/\/$/, '');

  // Fetch all categories to build tree
  let allCats: any[] = [];
  try {
    const cRes = await fetch(`${baseUrl}/api/product-categories`, { next: { revalidate: 300 } });
    if (cRes.ok) {
      const cData = await cRes.json();
      allCats = Array.isArray(cData.items) ? cData.items : [];
    }
  } catch (e) { console.error(e); }

  let breadcrumbItems = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Ürünler', href: '/products' }
  ];

  if (product.categoryIds && product.categoryIds.length > 0) {
    // Assuming categoryIds[0] is the main leaf category
    // Note: product.categoryIds elements might be just objects from product fetch, containing name/slug but maybe not parent (if not deeply populated)
    // But we have 'allCats' which has parent info.
    // Let's find the current category in allCats using ID
    const leafId = typeof product.categoryIds[0] === 'string' ? product.categoryIds[0] : product.categoryIds[0]._id;

    const path: { label: string; href: string }[] = [];
    let curr = allCats.find(c => String(c._id) === String(leafId));

    // Fallback if not found in allCats (maybe inactive?) but present in product
    if (!curr && typeof product.categoryIds[0] === 'object') {
      const c = product.categoryIds[0];
      path.push({ label: c.name, href: `/products?categorySlug=${c.slug}` });
    } else {
      while (curr) {
        path.unshift({ label: curr.name, href: `/products?category=${curr._id}` });
        if (!curr.parent) break;
        curr = allCats.find(c => String(c._id) === String(curr.parent));
      }
    }
    breadcrumbItems = [...breadcrumbItems, ...path];
  }

  breadcrumbItems.push({ label: product.title, href: `/products/${product.slug}` });

  return (
    <ProductClientWrapper product={{ _id: product._id as string, name: product.title, slug: product.slug as string }}>
      <main className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-primary pt-32 pb-20 text-white">
          <div className="container-main">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">{product.title}</h1>
            <div className="text-brand-primary-200 text-lg flex items-center gap-2 text-white">
              <span>{product.condition === 'new' ? 'Sıfır Ürün' : 'İkinci El'}</span>
              <span>•</span>
              <span>Kodu: {product.slug}</span>
            </div>
          </div>
        </div>

        {/* Breadcrumbs under Hero */}
        <section className="mt-8 relative z-10 px-4">
          <div className="container-main">
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/20 px-4 py-2 inline-block">
              <Breadcrumbs items={breadcrumbItems} />
            </div>
          </div>
        </section>

        {/* JSON-LD: Breadcrumbs */}
        <BreadcrumbsJsonLd
          items={breadcrumbItems.map(item => ({ name: item.label, item: item.href }))}
        />
        {/* JSON-LD: Product */}
        <ProductJsonLd
          name={product.title}
          description={description}
          url={`${baseUrl}/products/${product.slug}`}
          images={[product.coverImage, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean)}
          condition={product.condition}
          aggregateRating={product.ratingCount > 0 ? { ratingValue: Number(product.ratingAverage || 0), reviewCount: Number(product.ratingCount) } : undefined}
          offers={typeof product.price === 'number' && product.currency ? {
            price: Number(product.price),
            priceCurrency: String(product.currency),
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${baseUrl}/products/${product.slug}`,
          } : undefined}
          baseUrl={baseUrl}
        />

        <div className="container-main py-12" id="product-detail">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Left Column: Gallery, Desc, Reviews (7 cols) */}
            <div className="lg:col-span-8 space-y-12">

              {/* Gallery */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
                <ProductGallery cover={product.coverImage} images={product.images || []} title={product.title} />
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <DocumentArrowDownIcon className="w-6 h-6 text-brand-primary-600" />
                  <h2 className="text-xl font-bold text-slate-900">Ürün Açıklaması</h2>
                </div>

                <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-brand-primary-600">
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(product.description, {
                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'figure', 'figcaption']),
                        allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'title', 'width', 'height', 'loading'], a: ['href', 'title', 'target', 'rel'] },
                        transformTags: { img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true), a: sanitizeHtml.simpleTransform('a', { rel: 'noreferrer noopener' }, true) },
                      })
                    }}
                  />
                </div>
              </div>

              {/* Technical Specs */}
              {Array.isArray(product.attributes) && product.attributes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <CubeIcon className="w-6 h-6 text-brand-primary-600" />
                    <h2 className="text-xl font-bold text-slate-900">Teknik Özellikler</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.attributes.map((attr: { key: string; value: string }, idx: number) => (
                      <div key={`${attr.key}-${idx}`} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg">
                        <div className="text-sm font-medium text-slate-500">{attr.key}</div>
                        <div className="text-sm font-bold text-slate-800">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div id="reviews" className="scroll-mt-24">
                <ApprovedReviews productId={product._id as string} />
                <div className="mt-8">
                  <ProductReviewForm productId={product._id as string} />
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Sidebar (5 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="lg:sticky lg:top-24 space-y-6">

                {/* Main Info Card */}
                <div className="card-glass p-6 md:p-8 relative overflow-hidden ring-1 ring-black/5">

                  {/* Rating */}
                  {product.ratingCount > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(product.ratingAverage) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-slate-600">({product.ratingCount} değerlendirme)</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    {product.price ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-brand-primary-900">{product.price}</span>
                        <span className="text-xl font-medium text-slate-600">{product.currency}</span>
                      </div>
                    ) : (
                      <span className="text-2xl font-medium text-slate-400">Fiyat Teklifi Alın</span>
                    )}
                    {typeof product.price === 'number' && product.price >= Number((appConfig as { freeShippingThreshold?: number })?.freeShippingThreshold ?? 1500) && (
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        <TagIcon className="w-3.5 h-3.5" />
                        Ücretsiz Kargo
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <Link
                      href={`/products/${product.slug}/order`}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-primary-900/10 transition-all active:scale-[0.98] ${product.stock > 0
                        ? 'bg-brand-primary-900 text-white hover:bg-brand-primary-800'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      <ShoppingCartIcon className="w-6 h-6" />
                      {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                    </Link>

                    <div className="flex gap-3">
                      <FavoriteButton productId={product._id as string} />
                      <AskQuestionButton />
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                        <CubeIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 leading-tight">Orjinal Ürün</div>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                        <SparklesIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 leading-tight">Güvenli Ödeme</div>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto bg-purple-50 rounded-full flex items-center justify-center mb-2">
                        <TagIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 leading-tight">Uzman Desteği</div>
                    </div>
                  </div>

                </div>

                {/* Meta Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">

                  {/* Categories */}
                  {Array.isArray(product.categoryIds) && product.categoryIds.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategoriler</div>
                      <div className="flex flex-wrap gap-2">
                        {product.categoryIds.map((c: { _id?: string; slug: string; name: string }) => (
                          <a key={c._id || c.slug} href={`/products?categorySlug=${c.slug}`} className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-brand-primary-50 hover:text-brand-primary-700 border border-slate-100">
                            {c.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  {Array.isArray(product.colors) && product.colors.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Renk Seçenekleri</div>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((clr: string) => {
                          const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clr);
                          return (
                            <span key={clr} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium text-slate-700 bg-white shadow-sm">
                              {isHex && <span className="inline-block w-3 h-3 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: clr }} />}
                              {clr}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mevcut Ölçüler</div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((sz: string) => (
                          <span key={sz} className="px-3 py-1.5 rounded-lg border text-xs font-medium bg-white shadow-sm text-slate-700">
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {Array.isArray(product.attachments) && product.attachments.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dökümanlar</div>
                      <ul className="space-y-2">
                        {product.attachments.map((a: { url: string; type: string; name?: string }, i: number) => (
                          <li key={`${a.url}-${i}`}>
                            <a href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-brand-primary-600 hover:text-brand-primary-800 hover:underline">
                              <DocumentArrowDownIcon className="w-4 h-4" />
                              {a.name || 'Dosyayı İndir'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="py-20 bg-white border-t border-gray-100">
            <div className="container-main">
              <div className="section-header">
                <h2 className="section-title">İlginizi Çekebilir</h2>
                <p className="section-subtitle">Bu ürüne bakanlar bunları da inceledi</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {related.map((p) => (
                  <TiltHover key={p._id} className="[transform-style:preserve-3d]">
                    <FixralCard className="overflow-hidden group h-full" variant="default">
                      <Link href={`/products/${p.slug}`} className="block h-full">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.coverImage} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute top-3 left-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${p.condition === 'new' ? 'bg-white/90 text-emerald-700' : 'bg-white/90 text-amber-700'}`}>
                              {p.condition === 'new' ? 'Sıfır' : 'İkinci El'}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-brand-primary-700 transition-colors">{p.title}</h3>
                          {typeof p.price === 'number' && (
                            <div className="text-xl font-bold text-brand-primary-600 mb-4">{p.price} {p.currency}</div>
                          )}
                          <div className="w-full py-2.5 rounded-lg border-2 border-slate-100 text-slate-600 font-bold text-sm text-center group-hover:border-brand-primary-600 group-hover:bg-brand-primary-600 group-hover:text-white transition-all">
                            Ürünü İncele
                          </div>
                        </div>
                      </Link>
                    </FixralCard>
                  </TiltHover>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </ProductClientWrapper>
  );
}

// Client components moved to ReviewClient.tsx



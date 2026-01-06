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

  return (
    <main className="space-y-6" id="main-content">
      <PageHero
        title={product.title}
        description={description}
        buttonText={buttonText}
        buttonLink={buttonLink}
        variant="compact"
      />
      {/* Breadcrumbs under Hero */}
      <section className="py-1">
        <div className="container mx-auto px-4">
          <Breadcrumbs />
        </div>
      </section>
      {/* JSON-LD: Breadcrumbs */}
      <BreadcrumbsJsonLd
        items={[
          { name: 'Anasayfa', item: '/' },
          { name: 'Ürünler', item: '/products' },
          { name: product.title, item: `/products/${params.slug}` },
        ]}
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
      <div className="container mx-auto p-6 space-y-6" id="product-detail">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <ProductGallery cover={product.coverImage} images={product.images || []} title={product.title} />
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.title}</h1>
              {product.ratingCount > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(product.ratingAverage) ? 'text-amber-400' : 'text-slate-300'}`} />
                  ))}
                  <span className="text-sm text-slate-600">{product.ratingAverage.toFixed(1)} / 5 • {product.ratingCount} oy</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-emerald-600" />
                {product.condition === 'new' ? 'Sıfır' : 'İkinci El'}
              </div>
              <div className="flex items-center gap-2">
                <CubeIcon className="w-4 h-4 text-emerald-600" />
                Stok: {product.stock}
              </div>
              {typeof product.price === 'number' && product.price >= Number((appConfig as { freeShippingThreshold?: number })?.freeShippingThreshold ?? 1500) && (
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-emerald-600" />
                  Ücretsiz Kargo
                </div>
              )}
            </div>

            {product.price ? (
              <div className="flex items-center gap-2 text-3xl font-bold text-emerald-600">
                <TagIcon className="w-6 h-6 text-emerald-500" />
                {product.price} {product.currency}
              </div>
            ) : null}

            {Array.isArray(product.categoryIds) && product.categoryIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.categoryIds.map((c: { _id?: string; slug: string; name: string }) => (
                  <a key={c._id || c.slug} href={`/products?categorySlug=${c.slug}`} className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200">
                    {c.name}
                  </a>
                ))}
              </div>
            )}

            {/* Colors */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div className="pt-2">
                <div className="text-xs text-slate-500 mb-1">Renkler</div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((clr: string) => {
                    const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clr);
                    return (
                      <span key={clr} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm text-slate-700 bg-white">
                        {isHex && <span className="inline-block w-3 h-3 rounded-full border" style={{ backgroundColor: clr }} />}
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
                <div className="text-xs text-slate-500 mb-1">Ölçüler</div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz: string) => (
                    <span key={sz} className="px-3 py-1 rounded-md border text-sm bg-white">
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Link href={`/products/${product.slug}/order`} className={`inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md ${product.stock > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border pointer-events-none opacity-60'}`}>
                <ShoppingCartIcon className="w-5 h-5" />
                {product.stock > 0 ? 'Sipariş Ver' : 'Stokta Yok'}
              </Link>
              <FavoriteButton productId={product._id as string} />
            </div>
          </div>
        </div>
        {/* Açıklama ve yan bilgi kartları */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="space-y-6">
            <div className="rounded-xl border bg-white shadow-sm p-5">
              <div className="text-lg font-semibold mb-3">Ürün Açıklaması</div>
              <div className="prose max-w-none prose-slate">
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
            <div id="reviews">
              <ApprovedReviews productId={product._id as string} />
              <ProductReviewForm productId={product._id as string} />
            </div>
          </div>
          <div className="space-y-4">
            {Array.isArray(product.attachments) && product.attachments.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm p-4">
                <div className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                  <DocumentArrowDownIcon className="w-4 h-4 text-emerald-600" />
                  İndirilebilir Dosyalar
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {product.attachments.map((a: { url: string; type: string; name?: string }, i: number) => (
                    <li key={`${a.url}-${i}`} className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                        {a.name || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <div className="text-sm font-semibold">Teslimat</div>
              <div className="text-sm text-slate-600 mt-1">Siparişler 1-3 iş günü içinde kargolanır.</div>
            </div>
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <div className="text-sm font-semibold">İade</div>
              <div className="text-sm text-slate-600 mt-1">14 gün içinde kolay iade.</div>
            </div>
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <div className="text-sm font-semibold">Destek</div>
              <div className="text-sm text-slate-600 mt-1">7/24 müşteri desteği.</div>
            </div>
          </div>
        </div>


        {/* Özellikler / Açıklama */}
        {Array.isArray(product.attributes) && product.attributes.length > 0 && (
          <div className="rounded-xl border bg-white shadow-sm p-5">
            <div className="text-lg font-semibold mb-3">Teknik Özellikler</div>
            <div className="grid md:grid-cols-2 gap-3">
              {product.attributes.map((attr: { key: string; value: string }, idx: number) => (
                <div key={`${attr.key}-${idx}`} className="flex items-center justify-between gap-4 py-2 border-b last:border-b-0">
                  <div className="text-sm text-slate-500">{attr.key}</div>
                  <div className="text-sm font-medium text-slate-800">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
      {/* Sticky mobile action bar */}
      {product.price ? (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-xl font-bold text-emerald-600">{product.price} {product.currency}</div>
            <Link href={`/products/${product.slug}/order`} className={`px-5 py-2.5 rounded-md ${product.stock > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-500 pointer-events-none'}`}>{product.stock > 0 ? 'Sipariş Ver' : 'Stokta Yok'}</Link>
          </div>
        </div>
      ) : null}
      {/* Related */}
      {related.length > 0 && (
        <div className="container mx-auto p-6 space-y-4">
          <div className="text-lg font-semibold">Benzer Ürünler</div>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((p) => (
              <TiltHover key={p._id} className="[transform-style:preserve-3d]">
                <FixralCard className="overflow-hidden" variant="default">
                  <Link href={`/products/${p.slug}`} className="block group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.coverImage} alt={p.title} loading="lazy" className="w-full h-48 object-cover rounded-md transition-transform group-hover:scale-[1.02]" />
                    <div className="mt-3 font-medium text-slate-900 line-clamp-2 min-h-[2.75rem]">{p.title}</div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${p.condition === 'new' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{p.condition === 'new' ? 'Sıfır' : 'İkinci El'}</span>
                    </div>
                    {typeof p.price === 'number' && (
                      <div className="mt-2 text-emerald-700 font-semibold">{p.price} {p.currency}</div>
                    )}
                    <div className="mt-3">
                      <span className="inline-flex items-center justify-center h-9 px-4 rounded-md border text-sm text-slate-700 group-hover:border-emerald-600 group-hover:text-emerald-700">Detaya Git</span>
                    </div>
                  </Link>
                </FixralCard>
              </TiltHover>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

// Client components moved to ReviewClient.tsx



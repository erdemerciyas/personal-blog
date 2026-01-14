import Link from 'next/link';
import NextImage from 'next/image';
import { notFound } from 'next/navigation';
import { config } from '@/core/lib/config';
import dynamic from 'next/dynamic';
import FixralCard from '@/components/ui/FixralCard';
import TiltHover from '@/components/TiltHover';
const PageHero = dynamic(() => import('@/components/common/PageHero'), { ssr: false });
import { StarIcon } from '@heroicons/react/24/outline';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import Pagination from '@/components/ui/Pagination';
import ProductSidebar from '@/components/products/ProductSidebar';
import SearchInput from '@/components/ui/SearchInput';
import SortSelect from '@/components/ui/SortSelect';
import PriceRangeFilter from '@/components/ui/PriceRangeFilter';

async function getData(searchParams: Record<string, string>) {
  const qs = new URLSearchParams(searchParams as Record<string, string>).toString();
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/products?${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error('Products API error:', res.status, res.statusText);
      return { items: [], total: 0, limit: 12 };
    }
    return await res.json();
  } catch (error) {
    console.error('Products fetch error:', error);
    return { items: [], total: 0, limit: 12 };
  }
}

async function getPageSettings(pageId: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/admin/page-settings/${pageId}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const page = Number(searchParams?.page || '1');
  const condition = searchParams?.condition || '';
  const category = searchParams?.category || '';
  const q = searchParams?.q || '';
  const priceMin = searchParams?.priceMin || '';
  const priceMax = searchParams?.priceMax || '';
  const ratingMin = searchParams?.ratingMin || '';
  const inStock = searchParams?.inStock || '';
  const freeShipping = searchParams?.freeShipping || '';
  let cats: Array<{ _id?: string; name: string }> = [];
  try {
    const catRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/product-categories`, { next: { revalidate: 300 } });
    if (catRes.ok) {
      const catData = await catRes.json();
      cats = Array.isArray(catData.items) ? catData.items : [];
    }
  } catch (error) {
    console.error('Categories fetch error:', error);
    cats = [];
  }
  const sort = (searchParams?.sort || '') as 'priceAsc' | 'priceDesc' | '';
  const view = (searchParams?.view || 'grid') as 'grid' | 'list';
  const data = await getData({ page: String(page), condition, category, q, sort, priceMin, priceMax, ratingMin, inStock, freeShipping });
  const { items = [], total = 0, limit = 12 } = data || {};

  // Fetch recommended products if no items found
  let recommendedItems: any[] = [];
  if (items.length === 0) {
    const recData = await getData({ limit: '4', sort: 'priceDesc' });
    recommendedItems = recData?.items || [];
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageSettings = await getPageSettings('products');
  const pageIsActive = pageSettings?.isActive !== false;
  if (!pageIsActive) return notFound();
  const heroTitle = pageSettings?.title || 'Ürünler';
  const heroDesc = pageSettings?.description || 'Sıfır ve ikinci el ürünlerimizi keşfedin. Özellik, stok ve fiyat bilgileriyle filtreleyerek size uygun ürünü bulun.';
  const heroButtonText = pageSettings?.buttonText || 'Ürünlere Göz At';
  const heroButtonLink = pageSettings?.buttonLink || '#product-list';

  // Build Breadcrumbs
  let breadcrumbItems = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Ürünler', href: '/products' }
  ];

  if (category && cats.length > 0) {
    const path: { label: string; href: string }[] = [];
    let curr = cats.find(c => String(c._id) === category);
    while (curr) {
      path.unshift({ label: curr.name, href: `/products?category=${curr._id}` });
      // Find parent
      // @ts-expect-error -- Parent ID might be ObjectId or string
      const parentId = curr.parent;
      if (!parentId) break;
      curr = cats.find(c => String(c._id) === String(parentId));
    }
    breadcrumbItems = [...breadcrumbItems, ...path];
  }

  // Pre-define renderProductCard to reuse it
  const renderProductCard = (p: any, isRecommended = false) => {
    const hasFreeShipping = typeof p.price === 'number' && p.price >= (config.app.freeShippingThreshold || 1500);
    return (
      <TiltHover key={p._id} className="[transform-style:preserve-3d]">
        <FixralCard className={`overflow-hidden ${isRecommended ? 'border-amber-200 ring-1 ring-amber-100' : ''}`} variant="default">
          <Link href={`/products/${p.slug}`} className="block group">
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden rounded-t-lg">
              <NextImage src={p.coverImage} alt={p.title} fill className="object-cover transition-transform group-hover:scale-[1.02]" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              {p.stock <= 0 && (
                <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-red-600 text-white z-10">Stokta Yok</span>
              )}
              {isRecommended && (
                <span className="absolute top-2 right-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400 text-white shadow-sm z-10">Önerilen</span>
              )}
            </div>
            <div className="mt-3 font-medium text-slate-900 line-clamp-2 min-h-[2.75rem]">{p.title}</div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${p.condition === 'new' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{p.condition === 'new' ? 'Sıfır' : 'İkinci El'}</span>
              {typeof p.ratingAverage === 'number' && p.ratingCount ? (
                <span className="text-slate-500">{p.ratingAverage.toFixed(1)} / 5 • {p.ratingCount}</span>
              ) : (
                <span className="text-slate-400">Yeni</span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              {typeof p.price === 'number' ? (
                <div className="text-emerald-700 font-semibold">{p.price} {p.currency}</div>
              ) : <span />}
              {hasFreeShipping && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Ücretsiz Kargo</span>}
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center justify-center h-9 px-4 rounded-md border text-sm text-slate-700 group-hover:border-emerald-600 group-hover:text-emerald-700">Detaya Git</span>
            </div>
          </Link>
        </FixralCard>
      </TiltHover>
    );
  };

  return (
    <main className="space-y-6" id="main-content">
      <PageHero
        title={heroTitle}
        description={heroDesc}
        buttonText={heroButtonText}
        buttonLink={heroButtonLink}
        showButton={true}
      />
      {/* Breadcrumbs under Hero */}
      <section className="py-1">
        <div className="container mx-auto px-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </section>
      {/* JSON-LD: Breadcrumbs for Products list */}
      <BreadcrumbsJsonLd
        items={breadcrumbItems.map(b => ({ name: b.label, item: b.href }))}
      />
      <div className="container mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="rounded-xl border bg-white shadow-sm p-3 md:p-4 flex items-center gap-3">
          <SearchInput />
        </div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-[260px_1fr]" id="product-list">
          {/* Sidebar filters (links) */}
          <aside className="hidden md:block">
            <ProductSidebar
              categories={cats}
              currentCategory={category}
              currentCondition={condition}
              priceMin={priceMin}
              priceMax={priceMax}
              baseUrl="/products"
              searchParams={{ q, sort, view }}
            />

          </aside>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center gap-4">
                <span>Toplam {total} ürün bulundu</span>
                <SortSelect />
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const baseParams = new URLSearchParams({ q, condition, category, sort, priceMin, priceMax, page: String(page) });
                  const gridParams = new URLSearchParams(baseParams); gridParams.set('view', 'grid');
                  const listParams = new URLSearchParams(baseParams); listParams.set('view', 'list');
                  return (
                    <>
                      <Link href={`/products?${gridParams.toString()}`} className={`px-3 py-1 rounded border ${view === 'grid' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700'}`}>Grid</Link>
                      <Link href={`/products?${listParams.toString()}`} className={`px-3 py-1 rounded border ${view === 'list' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700'}`}>Liste</Link>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className={view === 'grid' ? 'mt-4 grid gap-6 md:grid-cols-3' : 'mt-4 space-y-4'}>
              {items.map((p: any) => {
                if (view === 'list') {
                  const sp = new URLSearchParams({ q, condition, category, sort, priceMin, priceMax, ratingMin, inStock, freeShipping, view });
                  return (
                    <FixralCard key={p._id} className="p-4" variant="default">
                      <div className="grid md:grid-cols-[180px_1fr_auto] gap-4 items-center">
                        <div className="relative h-40 w-full rounded-md overflow-hidden">
                          <NextImage src={p.coverImage} alt={p.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 200px" />
                          {p.stock <= 0 && (
                            <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-red-600 text-white">Stokta Yok</span>
                          )}
                        </div>
                        <div>
                          <Link href={`/products/${p.slug}`} className="block group">
                            <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2">{p.title}</div>
                          </Link>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${p.condition === 'new' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{p.condition === 'new' ? 'Sıfır' : 'İkinci El'}</span>
                            <span className="text-slate-500">Stok: {p.stock}</span>
                            {typeof p.ratingAverage === 'number' && p.ratingCount ? (
                              <span className="text-slate-500">{p.ratingAverage.toFixed(1)} / 5 • {p.ratingCount}</span>
                            ) : null}
                            {typeof p.price === 'number' && p.price >= (config.app.freeShippingThreshold || 1500) && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Ücretsiz Kargo</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          {typeof p.price === 'number' && (
                            <div className="text-lg font-semibold text-emerald-700">{p.price} {p.currency}</div>
                          )}
                          <Link href={`/products/${p.slug}?${sp.toString()}`} className="inline-flex items-center justify-center h-9 px-4 rounded-md border mt-2 text-sm text-slate-700 hover:border-emerald-600 hover:text-emerald-700">Detaya Git</Link>
                        </div>
                      </div>
                    </FixralCard>
                  );
                }
                return renderProductCard(p);
              })}
              {items.length === 0 && (
                <div className="col-span-12 py-12 text-center">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 text-4xl">🤷‍♂️</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Aradığınız kriterlere uygun ürün bulunamadı.</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">Farklı anahtar kelimeler deneyebilir veya filtreleri temizleyebilirsiniz.</p>

                  <Link href="/products" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition mb-12">
                    Filtreleri Temizle
                  </Link>

                  {recommendedItems.length > 0 && (
                    <div className="mt-8 border-t border-slate-100 pt-8">
                      <h4 className="text-xl font-bold text-slate-900 mb-6 text-left flex items-center gap-2">
                        <StarIcon className="w-6 h-6 text-amber-500" />
                        Sizin İçin Seçtiklerimiz
                      </h4>
                      <div className="grid gap-6 md:grid-cols-3 text-left">
                        {recommendedItems.map(rp => renderProductCard(rp, true))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                createPageUrl={(p) => {
                  const sp = new URLSearchParams({
                    page: String(p),
                    condition,
                    category,
                    q,
                    sort,
                    priceMin,
                    priceMax,
                    view,
                    ratingMin,
                    inStock,
                    freeShipping
                  });
                  return `/products?${sp.toString()}`;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main >
  );
}



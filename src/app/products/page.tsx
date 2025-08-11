import Link from 'next/link';
import { notFound } from 'next/navigation';
import { config } from '@/lib/config';
import dynamic from 'next/dynamic';
import FixralCard from '@/components/ui/FixralCard';
import TiltHover from '@/components/TiltHover';
const PageHero = dynamic(() => import('@/components/common/PageHero'), { ssr: false });
import { Squares2X2Icon, AdjustmentsHorizontalIcon, StarIcon, CurrencyDollarIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

async function getData(searchParams: Record<string, string>) {
  const qs = new URLSearchParams(searchParams as Record<string, string>).toString();
  const base = process.env.NEXTAUTH_URL || '';
  const res = await fetch(`${base}/api/products?${qs}`, { next: { revalidate: 60 } });
  return res.json();
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
  const catRes = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/product-categories`, { next: { revalidate: 300 } });
  const catData = await catRes.json().catch(() => ({ items: [] }));
  const cats = Array.isArray(catData.items) ? catData.items : [];
  const sort = (searchParams?.sort || '') as 'priceAsc'|'priceDesc'|'';
  const view = (searchParams?.view || 'grid') as 'grid' | 'list';
  const { items = [], total = 0, limit = 12 }: { items: Array<{ _id: string; slug: string; coverImage: string; title: string; condition: 'new'|'used'; stock: number; price?: number; currency?: string; ratingAverage?: number; ratingCount?: number }>; total: number; limit: number } = await getData({ page: String(page), condition, category, q, sort, priceMin, priceMax, ratingMin, inStock, freeShipping });
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageSettings = await getPageSettings('products');
  const pageIsActive = pageSettings?.isActive !== false;
  if (!pageIsActive) return notFound();
  const heroTitle = pageSettings?.title || 'Ürünler';
  const heroDesc = pageSettings?.description || 'Sıfır ve ikinci el ürünlerimizi keşfedin. Özellik, stok ve fiyat bilgileriyle filtreleyerek size uygun ürünü bulun.';
  const heroButtonText = pageSettings?.buttonText || 'Ürünlere Göz At';
  const heroButtonLink = pageSettings?.buttonLink || '#product-list';

  return (
    <div className="space-y-6">
      <PageHero 
        title={heroTitle}
        description={heroDesc}
        badge="Ürün Kataloğu"
        buttonText={heroButtonText}
        buttonLink={heroButtonLink}
        variant="compact"
        minHeightVh={33}
      />
      <div className="container mx-auto p-6 space-y-6">
      {/* Filters */}
      <form className="rounded-xl border bg-white shadow-sm p-3 md:p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input name="q" defaultValue={q} placeholder="Ürün ara..." className="input-field w-full pl-10" />
        </div>
        {/* Seçili filtreleri koru */}
        <input type="hidden" name="condition" value={condition} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="priceMin" value={priceMin} />
        <input type="hidden" name="priceMax" value={priceMax} />
        <input type="hidden" name="ratingMin" value={ratingMin} />
        <input type="hidden" name="inStock" value={inStock} />
        <input type="hidden" name="freeShipping" value={freeShipping} />
        <input type="hidden" name="view" value={view} />
        <button type="submit" className="btn-primary inline-flex items-center gap-2 h-10 px-4 rounded-md whitespace-nowrap">
          <MagnifyingGlassIcon className="w-5 h-5" />
          Ara
        </button>
      </form>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-[260px_1fr]" id="product-list">
        {/* Sidebar filters (links) */}
        <aside className="hidden md:block">
          <div className="rounded-xl border bg-white p-4 space-y-5 sticky top-24">
            <div>
              <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Squares2X2Icon className="w-4 h-4 text-emerald-600" /> Kategoriler</div>
              <div className="space-y-1 text-sm">
                {(() => {
                  const base = { q, condition, sort, priceMin, priceMax, view } as Record<string, string>;
                  return [
                    <Link key="all" href={`/products?${new URLSearchParams({ ...base, page: '1' }).toString()}`} className={`block px-2 py-1 rounded ${!category ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>Tümü</Link>,
                    ...cats.map((c: { _id?: string; name: string }) => {
                      const sp = new URLSearchParams({ ...base, category: String(c._id || '') , page: '1' });
                      const active = category === String(c._id || '');
                      return <Link key={String(c._id)} href={`/products?${sp.toString()}`} className={`block px-2 py-1 rounded ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>{c.name}</Link>;
                    })
                  ];
                })()}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2 flex items-center gap-2"><AdjustmentsHorizontalIcon className="w-4 h-4 text-emerald-600" /> Durum</div>
              <div className="space-y-1 text-sm">
                {(() => {
                  const base = { q, category, sort, priceMin, priceMax, view } as Record<string, string>;
                  const all = new URLSearchParams({ ...base, condition: '', page: '1' }).toString();
                  const nw = new URLSearchParams({ ...base, condition: 'new', page: '1' }).toString();
                  const usd = new URLSearchParams({ ...base, condition: 'used', page: '1' }).toString();
                  return (
                    <>
                      <Link href={`/products?${all}`} className={`block px-2 py-1 rounded ${!condition ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>Hepsi</Link>
                      <Link href={`/products?${nw}`} className={`block px-2 py-1 rounded ${condition==='new' ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>Sıfır</Link>
                      <Link href={`/products?${usd}`} className={`block px-2 py-1 rounded ${condition==='used' ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>İkinci El</Link>
                    </>
                  );
                })()}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2 flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4 text-emerald-600" /> Hızlı Fiyat</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { min: '0', max: '500' },
                  { min: '500', max: '1000' },
                  { min: '1000', max: '5000' },
                  { min: '5000', max: '' },
                ].map((r) => {
                  const sp = new URLSearchParams({ q, condition, category, sort, priceMin: r.min, priceMax: r.max, ratingMin, inStock, freeShipping, view, page: '1' });
                  const label = r.max ? `${r.min}-${r.max}` : `${r.min}+`;
                  return <Link key={`${r.min}-${r.max || 'up'}`} href={`/products?${sp.toString()}`} className="px-2 py-1 rounded border text-center hover:bg-slate-50">{label}</Link>;
                })}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2 flex items-center gap-2"><StarIcon className="w-4 h-4 text-emerald-600" /> Puan</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {[4,3,2,1].map((r)=>{
                  const sp = new URLSearchParams({ q, condition, category, sort, priceMin, priceMax, ratingMin: String(r), inStock, freeShipping, view, page: '1' });
                  const active = ratingMin === String(r);
                  return <Link key={r} href={`/products?${sp.toString()}`} className={`px-2 py-1 rounded border ${active? 'bg-amber-50 text-amber-800 border-amber-200':'hover:bg-slate-50'}`}>{r}+</Link>;
                })}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-600" /> Hızlı Filtre</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {(() => {
                  const base = { q, condition, category, sort, priceMin, priceMax, ratingMin, view, page: '1' } as Record<string, string>;
                  const stockSp = new URLSearchParams({ ...base, inStock: inStock==='true' ? '' : 'true' });
                  const freeSp = new URLSearchParams({ ...base, freeShipping: freeShipping==='true' ? '' : 'true' });
                  return (
                    <>
                      <Link href={`/products?${stockSp.toString()}`} className={`px-2 py-1 rounded border ${inStock==='true' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'hover:bg-slate-50'}`}>Stokta Olan</Link>
                      <Link href={`/products?${freeSp.toString()}`} className={`px-2 py-1 rounded border ${freeShipping==='true' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'hover:bg-slate-50'}`}>Ücretsiz Kargo</Link>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>Toplam {total} ürün bulundu</div>
            <div className="flex items-center gap-2">
              {(() => {
                const baseParams = new URLSearchParams({ q, condition, category, sort, priceMin, priceMax, page: String(page) });
                const gridParams = new URLSearchParams(baseParams); gridParams.set('view', 'grid');
                const listParams = new URLSearchParams(baseParams); listParams.set('view', 'list');
                return (
                  <>
                    <Link href={`/products?${gridParams.toString()}`} className={`px-3 py-1 rounded border ${view==='grid'?'bg-emerald-600 text-white border-emerald-600':'bg-white text-slate-700'}`}>Grid</Link>
                    <Link href={`/products?${listParams.toString()}`} className={`px-3 py-1 rounded border ${view==='list'?'bg-emerald-600 text-white border-emerald-600':'bg-white text-slate-700'}`}>Liste</Link>
                  </>
                );
              })()}
            </div>
          </div>

          <div className={view==='grid' ? 'mt-4 grid gap-6 md:grid-cols-3' : 'mt-4 space-y-4'}>
        {items.map((p: { _id: string; slug: string; coverImage: string; title: string; condition: 'new'|'used'; stock: number; price?: number; currency?: string; ratingAverage?: number; ratingCount?: number }) => {
          const hasFreeShipping = typeof p.price === 'number' && p.price >= (config.app.freeShippingThreshold || 1500);
          if (view === 'list') {
            const sp = new URLSearchParams({ q, condition, category, sort, priceMin, priceMax, ratingMin, inStock, freeShipping, view });
            return (
              <FixralCard key={p._id} className="p-4" variant="default">
                <div className="grid md:grid-cols-[180px_1fr_auto] gap-4 items-center">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.coverImage} alt={p.title} loading="lazy" className="w-full h-40 object-cover rounded-md" />
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
                      {hasFreeShipping && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Ücretsiz Kargo</span>}
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
          return (
          <TiltHover key={p._id} className="[transform-style:preserve-3d]">
            <FixralCard className="overflow-hidden" variant="default">
                <Link href={`/products/${p.slug}`} className="block group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.coverImage} alt={p.title} loading="lazy" className="w-full h-56 object-cover rounded-md transition-transform group-hover:scale-[1.02]" />
                  {p.stock <= 0 && (
                    <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-red-600 text-white">Stokta Yok</span>
                  )}
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
        })}
        {items.length === 0 && <div className="text-sm text-gray-500">Kayıt bulunamadı</div>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const sp = new URLSearchParams({ page: String(p), condition, category, q, sort, priceMin, priceMax, view });
            return (
              <Link key={p} href={`/products?${sp.toString()}`} className={`px-3 py-2 rounded border ${p === page ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700'}`}>
                {p}
              </Link>
            );
          })}
        </div>
      )}
        </div>
      </div>
      </div>
    </div>
  );
}



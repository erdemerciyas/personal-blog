import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import Breadcrumbs from '@/components/Breadcrumbs';
import sanitizeHtml from 'sanitize-html';
const PageHero = dynamic(() => import('@/components/common/PageHero'), { ssr: false });

async function getProduct(slug: string) {
  const base = process.env.NEXTAUTH_URL || '';
  const res = await fetch(`${base}/api/products/slug/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

const OrderFormClient = dynamic(() => import('./OrderFormClient'), { ssr: false });

export default async function OrderPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();

  return (
    <main className="space-y-6" id="main-content">
      <PageHero
        title={"Ürünler"}
        description={`${product.title} için sipariş oluşturun. Ürün bilgilerini kontrol edin ve formu doldurun.`}
        badge="Sipariş"
        buttonText="Ürün Sayfasına Dön"
        buttonLink={`/products/${product.slug}`}
        variant="compact"
        minHeightVh={33}
      />
      <div className="container mx-auto p-6 space-y-6">
        <Breadcrumbs />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sipariş Ver</h1>
          <p className="text-slate-600">Lütfen aşağıdaki bilgileri doldurarak siparişinizi tamamlayın.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Sol sütun: Ürün bilgileri ve detay */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-white shadow-sm p-5 space-y-3">
              <div className="text-lg font-semibold">Ürün Bilgileri</div>
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.coverImage} alt={product.title} className="w-24 h-24 object-cover rounded-md border" />
                <div className="space-y-1">
                  <div className="font-medium">{product.title}</div>
                  {product.price ? (
                    <div className="text-emerald-700 font-semibold">{product.price} {product.currency}</div>
                  ) : null}
                  <div className="text-sm text-slate-600">Stok: {product.stock}</div>
                </div>
              </div>
            </div>

            {/* Ürün Detayı */}
            <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
              <div className="text-lg font-semibold">Ürün Detayı</div>
              {/* Kategoriler */}
              {Array.isArray(product.categoryIds) && product.categoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.categoryIds.map((c: { _id?: string; slug: string; name: string }) => (
                    <a key={c._id || c.slug} href={`/products?categorySlug=${c.slug}`} className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200">
                      {c.name}
                    </a>
                  ))}
                </div>
              )}
              {/* Açıklama */}
              {product.description && (
                <div className="prose max-w-none prose-slate">
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description, {
                      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','h1','h2','h3','figure','figcaption']),
                      allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src','alt','title','width','height','loading'], a: ['href','title','target','rel'] },
                      transformTags: { img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true), a: sanitizeHtml.simpleTransform('a', { rel: 'noreferrer noopener' }, true) },
                    }) }}
                  />
                </div>
              )}
              {/* Renkler */}
              {Array.isArray(product.colors) && product.colors.length > 0 && (
                <div>
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
              {/* Ölçüler */}
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Ölçüler</div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz: string) => (
                      <span key={sz} className="px-3 py-1 rounded-md border text-sm bg-white">{sz}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Teknik Özellikler */}
              {Array.isArray(product.attributes) && product.attributes.length > 0 && (
                <div>
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
          </div>

          {/* Sağ sütun: Sipariş formu */}
          <div className="space-y-6">
            <OrderFormClient product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}



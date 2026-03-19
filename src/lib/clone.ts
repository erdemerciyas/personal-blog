/**
 * Content Cloning Utility
 *
 * Mevcut içerikleri kopyalayarak "Kopya — <başlık>" adıyla yeni taslak oluşturur.
 * News, Portfolio, Product, Page desteklenir.
 *
 * Kullanım:
 *   const newDoc = await cloneContent('news', '6641abc...');
 */

import connectDB from '@/lib/mongoose';

export type CloneableType = 'news' | 'portfolio' | 'product' | 'page';

interface CloneResult {
  success: boolean;
  id?: string;
  slug?: string;
  error?: string;
}

/**
 * Verilen tip ve ID'ye göre içeriği klonlar.
 * Slug benzersizliği için timestamp eklenir.
 * Status her zaman 'draft' olarak ayarlanır.
 */
export async function cloneContent(
  type: CloneableType,
  id: string
): Promise<CloneResult> {
  await connectDB();

  switch (type) {
    case 'news':    return cloneNews(id);
    case 'portfolio': return clonePortfolio(id);
    case 'product': return cloneProduct(id);
    default:
      return { success: false, error: `Bilinmeyen içerik tipi: ${type}` };
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────

async function cloneNews(id: string): Promise<CloneResult> {
  const NewsModel = (await import('@/models/News')).default;
  const original = await NewsModel.findById(id).lean();
  if (!original) return { success: false, error: 'Haber bulunamadı.' };

  const ts = Date.now();
  const doc = original as Record<string, unknown>;

  const cloned = new NewsModel({
    ...doc,
    _id: undefined,
    slug: `${doc.slug}-kopya-${ts}`,
    status: 'draft',
    publishedAt: null,
    views: 0,
    createdAt: undefined,
    updatedAt: undefined,
    // translations başlıklarına "Kopya — " prefix
    translations: prefixTranslationTitles(doc.translations as Record<string, { title?: string }> | undefined),
  });

  await cloned.save();
  return { success: true, id: String(cloned._id), slug: cloned.slug };
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

async function clonePortfolio(id: string): Promise<CloneResult> {
  const PortfolioModel = (await import('@/models/Portfolio')).default;
  const original = await PortfolioModel.findById(id).lean();
  if (!original) return { success: false, error: 'Portfolyo bulunamadı.' };

  const ts = Date.now();
  const doc = original as Record<string, unknown>;

  const cloned = new PortfolioModel({
    ...doc,
    _id: undefined,
    title: `Kopya — ${doc.title}`,
    slug: `${doc.slug}-kopya-${ts}`,
    status: 'draft',
    createdAt: undefined,
    updatedAt: undefined,
  });

  await cloned.save();
  return { success: true, id: String(cloned._id), slug: cloned.slug };
}

// ─── Product ──────────────────────────────────────────────────────────────────

async function cloneProduct(id: string): Promise<CloneResult> {
  const ProductModel = (await import('@/models/Product')).default;
  const original = await ProductModel.findById(id).lean();
  if (!original) return { success: false, error: 'Ürün bulunamadı.' };

  const ts = Date.now();
  const doc = original as Record<string, unknown>;

  const cloned = new ProductModel({
    ...doc,
    _id: undefined,
    title: `Kopya — ${doc.title}`,
    slug: `${doc.slug}-kopya-${ts}`,
    status: 'draft',
    reviews: [],
    createdAt: undefined,
    updatedAt: undefined,
  });

  await cloned.save();
  return { success: true, id: String(cloned._id), slug: cloned.slug };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prefixTranslationTitles(
  translations?: Record<string, { title?: string }>
): Record<string, { title?: string }> | undefined {
  if (!translations) return undefined;
  const result: Record<string, { title?: string }> = {};
  for (const [lang, t] of Object.entries(translations)) {
    result[lang] = {
      ...t,
      title: t.title ? `Kopya — ${t.title}` : t.title,
    };
  }
  return result;
}

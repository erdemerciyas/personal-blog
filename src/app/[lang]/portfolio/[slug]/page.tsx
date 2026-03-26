import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongoose';
import Portfolio from '@/models/Portfolio';
import '@/models/Category';
import { PortfolioItem } from '@/types/portfolio';
import { SITE_URL, getPortfolioAlternates, generateOgImages } from '@/lib/seo-utils';
import PortfolioDetailClient from './PortfolioDetailClient';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string; lang: string }>;
}

async function getPortfolioItem(slug: string): Promise<PortfolioItem | null> {
  await connectDB();
  const item = await Portfolio.findOne({ slug, isActive: true })
    .populate('categoryIds', 'name slug')
    .lean();
  if (!item) return null;
  return JSON.parse(JSON.stringify(item)) as PortfolioItem;
}

async function getRelatedProjects(currentSlug: string): Promise<PortfolioItem[]> {
  await connectDB();
  const items = await Portfolio.find({ slug: { $ne: currentSlug }, isActive: true })
    .limit(3)
    .lean();
  return JSON.parse(JSON.stringify(items)) as PortfolioItem[];
}

export async function generateStaticParams() {
  try {
    await connectDB();
    const items = await Portfolio.find({ isActive: true }).select('slug').lean();
    const langs = ['tr', 'es'];
    return items.flatMap(item => langs.map(lang => ({ lang, slug: (item as { slug: string }).slug })));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioItem(slug);

  if (!item) {
    return { title: 'Not Found' };
  }

  const ogImages = item.coverImage
    ? [{ url: item.coverImage, width: 1200, height: 630, alt: item.title }]
    : generateOgImages(undefined, item.title);

  return {
    title: `${item.title} | Fixral Portfolyo`,
    description: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 160),
    alternates: getPortfolioAlternates(slug),
    openGraph: {
      title: `${item.title} | Fixral Portfolyo`,
      description: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 160),
      url: `${SITE_URL}/tr/portfolio/${slug}`,
      type: 'article',
      images: ogImages,
    },
  };
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { slug, lang } = await params;
  const [portfolioItem, relatedProjects] = await Promise.all([
    getPortfolioItem(slug),
    getRelatedProjects(slug),
  ]);

  if (!portfolioItem) {
    notFound();
  }

  return (
    <PortfolioDetailClient
      portfolioItem={portfolioItem}
      relatedProjects={relatedProjects}
      slug={slug}
      lang={lang || 'tr'}
    />
  );
}

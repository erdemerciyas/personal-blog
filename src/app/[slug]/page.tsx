import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongoose';
import Page from '@/models/Page';

interface PageProps {
  params: {
    slug: string;
  };
}

interface PageData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
}

async function getPage(slug: string): Promise<PageData | null> {
  try {
    await connectDB();
    const page = await Page.findOne({ slug, isPublished: true }).lean();
    return page as PageData | null;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPage(params.slug);

  if (!page) {
    return {
      title: 'Sayfa Bulunamadı',
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt || '',
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const page = await getPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {page.title}
            </h1>
            {page.excerpt && (
              <p className="text-xl text-slate-600 dark:text-slate-300">
                {page.excerpt}
              </p>
            )}
          </header>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-a:text-blue-600 dark:prose-a:text-blue-400
              prose-strong:text-slate-900 dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </div>
  );
}

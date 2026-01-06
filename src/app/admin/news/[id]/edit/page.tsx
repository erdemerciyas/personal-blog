import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import dynamicImport from 'next/dynamic';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import { NewsItem } from '@/types/news';
import AdminLayout from '@/components/admin/AdminLayout';
import { logger } from '@/core/lib/logger';

const NewsForm = dynamicImport(() => import('@/components/admin/NewsForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700"></div>
    </div>
  )
});

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Haberi Düzenle | Admin',
  description: 'Haber makalesi içeriğini ve meta verilerini güncelleyin',
};

export default async function EditNewsPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  try {
    await connectDB();

    const news = (await News.findById(params.id).lean()) as unknown as NewsItem;

    if (!news) {
      notFound();
    }

    return (
      <AdminLayout
        title="Haberi Düzenle"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Haber Yönetimi', href: '/admin/news' },
          { label: 'Haberi Düzenle' }
        ]}
      >
        <div className="space-y-6">
          <NewsForm initialData={news} />
        </div>
      </AdminLayout>
    );
  } catch (error) {
    logger.error('Error loading news article for editing', 'EDIT_NEWS', { error });
    notFound();
  }
}

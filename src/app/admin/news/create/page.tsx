import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/admin/AdminLayout';

const NewsForm = dynamic(() => import('@/components/admin/NewsForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700"></div>
    </div>
  )
});

export const metadata: Metadata = {
  title: 'Yeni Haber Oluştur | Admin',
  description: 'Yeni bir haber makalesi oluşturun',
};

export default async function CreateNewsPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  return (
    <AdminLayout
      title="Yeni Haber Oluştur"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Haber Yönetimi', href: '/admin/news' },
        { label: 'Yeni Haber Oluştur' }
      ]}
    >
      <div className="space-y-6">
        <NewsForm />
      </div>
    </AdminLayout>
  );
}

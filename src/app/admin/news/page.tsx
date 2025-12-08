import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import AdminLayout from '@/components/admin/AdminLayout';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NewsList = dynamicImport(() => import('@/components/admin/NewsList'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700"></div>
    </div>
  )
});

export const metadata: Metadata = {
  title: 'Haber Yönetimi | Admin',
  description: 'Haber makalelerini yönetin',
};

export default async function NewsManagementPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  return (
    <AdminLayout
      title="Haber Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Haber Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        <NewsList />
      </div>
    </AdminLayout>
  );
}

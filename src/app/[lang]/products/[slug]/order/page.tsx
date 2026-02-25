import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import OrderForm from './OrderForm';

const PageHero = dynamic(() => import('@/components/common/PageHero'), { ssr: false });

async function getProduct(slug: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/products/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching product for order:', error);
    return null;
  }
}

export default async function OrderPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <PageHero
        title="Siparişi Tamamla"
        description={`${product.name} için sipariş detaylarınızı giriniz.`}
      />
      <div className="container-main pt-8">
        <OrderForm product={product} />
      </div>
    </main>
  );
}

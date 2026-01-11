'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductForm from '@/components/admin/ProductForm';

export default function AdminProductEditPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { status } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    if (status === 'authenticated') {
      fetchProduct();
    }
  }, [status, params.id, router]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        router.push('/admin/products');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-slate-200 rounded-full border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ürünü Düzenle</h1>
        <p className="text-slate-500">{product.title} ürününü düzenliyorsunuz.</p>
      </div>
      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}

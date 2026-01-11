'use client';

import ProductForm from '@/components/admin/ProductForm';

export default function AdminProductNewPage() {
  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Yeni Ürün Ekle</h1>
        <p className="text-slate-500">Mağazanıza yeni bir ürün ekleyin.</p>
      </div>
      <ProductForm />
    </div>
  );
}

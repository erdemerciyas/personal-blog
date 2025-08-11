'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductSummary {
  _id: string;
  slug: string;
  title: string;
  coverImage?: string;
  price?: number;
  currency?: string;
  stock?: number;
}

export default function OrderFormClient({ product }: { product: ProductSummary }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    note: '',
    quantity: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!form.address.trim()) {
        throw new Error('Adres zorunludur.');
      }
      if ((!form.email || !form.email.trim()) && (!form.phone || !form.phone.trim())) {
        throw new Error('E-posta veya telefon alanından en az birini doldurmalısınız.');
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          productSlug: product.slug,
          productTitle: product.title,
          productPrice: product.price,
          productCurrency: product.currency,
          quantity: form.quantity,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          note: form.note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Sipariş gönderilemedi');

      setSuccess('Siparişiniz onaylandı! E-posta ile bilgilendirme gönderildi.');

      setTimeout(() => {
        router.replace(`/products/${product.slug}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-white shadow-sm p-5 space-y-5">
      <div className="text-lg font-semibold">Alıcı Bilgileri</div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-slate-600" htmlFor="name">Ad Soyad</label>
          <input id="name" name="name" required className="w-full rounded-md border px-3 py-2" value={form.name} onChange={onChange} />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-600" htmlFor="email">E-posta (opsiyonel)</label>
          <input id="email" name="email" type="email" className="w-full rounded-md border px-3 py-2" value={form.email} onChange={onChange} />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-600" htmlFor="phone">Telefon (e-posta yoksa zorunlu)</label>
          <input id="phone" name="phone" className="w-full rounded-md border px-3 py-2" value={form.phone} onChange={onChange} />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-600" htmlFor="quantity">Adet</label>
          <input id="quantity" name="quantity" type="number" min={1} max={Math.max(1, product.stock || 99)} className="w-full rounded-md border px-3 py-2" value={form.quantity} onChange={onChange} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm text-slate-600" htmlFor="address">Adres</label>
          <textarea id="address" name="address" required rows={4} className="w-full rounded-md border px-3 py-2" value={form.address} onChange={onChange} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm text-slate-600" htmlFor="note">Not (opsiyonel)</label>
          <textarea id="note" name="note" rows={3} className="w-full rounded-md border px-3 py-2" value={form.note} onChange={onChange} />
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : <div className="text-xs text-slate-500">Adres zorunludur. E-posta veya telefon bilgisinden en az birini giriniz.</div>}
      {success ? <div className="text-sm text-emerald-700 font-medium">{success}</div> : null}

      <div className="flex items-center justify-end">
        <button type="submit" disabled={submitting} className={`inline-flex items-center justify-center h-11 px-6 rounded-md ${submitting ? 'bg-slate-300 text-slate-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
          {submitting ? 'Gönderiliyor...' : 'Sipariş Ver'}
        </button>
      </div>
    </form>
  );
}



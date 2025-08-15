'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Product = { _id: string; slug: string; title: string; coverImage: string; price?: number; currency?: string };

export default function FavoritesPage() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('favProducts');
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (ids.length === 0) return;
      fetch(`/api/products?ids=${ids.join(',')}`)
        .then((r) => r.json())
        .then((d) => setItems(d.items || []))
        .catch(() => setItems([]));
    } catch {
      setItems([]);
    }
  }, []);

  return (
    <main className="container mx-auto p-6 space-y-6" id="main-content">
      <h1 className="text-2xl font-bold">Favorilerim</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((p) => (
          <div key={p._id} className="border rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.coverImage} alt={p.title} className="w-full h-44 object-cover" />
            <div className="p-3">
              <Link href={`/products/${p.slug}`} className="font-medium hover:underline">{p.title}</Link>
              {typeof p.price === 'number' && (
                <div className="text-emerald-700 font-semibold mt-1">{p.price} {p.currency}</div>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-500">Henüz favori ürün yok.</div>}
      </div>
    </main>
  );
}



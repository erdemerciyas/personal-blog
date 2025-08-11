'use client';
import React, { useEffect, useState } from 'react';

type ReviewItem = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

export function ApprovedReviews({ productId }: { productId: string }) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((d) => { if (mounted) setItems((d.items as ReviewItem[]) || []); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [productId]);

  if (loading) return <div className="mt-8 text-sm text-gray-500">Yorumlar yükleniyor...</div>;
  if (!items.length) return <div className="mt-8 text-sm text-gray-500">Henüz yorum yok</div>;

  return (
    <div className="mt-8 space-y-3">
      <div className="font-medium">Onaylı Yorumlar</div>
      {items.map((r) => (
        <div key={r._id} className="rounded-xl border bg-white shadow-sm p-4">
          <div className="text-sm text-slate-600">Puan: {r.rating} • {new Date(r.createdAt).toLocaleString('tr-TR')}</div>
          {r.comment && <div className="text-sm mt-1 text-slate-800">{r.comment}</div>}
        </div>
      ))}
    </div>
  );
}

export function ProductReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle'|'sending'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [csrf, setCsrf] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    fetch('/api/csrf', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (mounted) setCsrf(d.token as string); })
      .catch(() => setCsrf(''));
    return () => { mounted = false; };
  }, []);

  async function submit() {
    setState('sending');
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf, 'x-requested-with': 'XMLHttpRequest' },
      body: JSON.stringify({ rating, comment })
    });
    if (res.ok) {
      setState('success');
      setMessage('Yorum alındı, onay bekliyor');
      setComment('');
    } else {
      const data = await res.json().catch(() => ({}));
      setState('error');
      setMessage((data as { error?: string })?.error || 'Gönderim hatası');
    }
  }

  return (
    <div className="mt-8 rounded-xl border bg-white shadow-sm p-5 space-y-4">
      <div className="text-lg font-semibold">Yorum Yap</div>
      {message && <div className={`text-sm ${state === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>{message}</div>}
      <div className="flex items-center gap-4">
        <label className="text-sm">Puan</label>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${rating >= n ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-300 text-slate-600'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <textarea placeholder="Yorumunuz (opsiyonel)" value={comment} onChange={(e) => setComment(e.target.value)} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
      <div>
        <button onClick={submit} disabled={state==='sending'} className="px-5 py-2.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">Gönder</button>
      </div>
    </div>
  );
}



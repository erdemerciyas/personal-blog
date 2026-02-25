'use client';

import React, { useEffect, useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function FavoriteButton({ productId }: { productId: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('favProducts');
      if (!raw) return;
      const ids: string[] = JSON.parse(raw);
      setFav(ids.includes(productId));
    } catch {
      /* noop */
    }
  }, [productId]);

  function toggle() {
    try {
      const raw = localStorage.getItem('favProducts');
      const ids: string[] = raw ? JSON.parse(raw) : [];
      let next: string[];
      if (ids.includes(productId)) next = ids.filter((id) => id !== productId);
      else next = [...ids, productId];
      localStorage.setItem('favProducts', JSON.stringify(next));
      setFav(next.includes(productId));
    } catch {
      /* noop */
    }
  }

  return (
    <button
      type="button"
      aria-label={fav ? 'Favorilerden kaldır' : 'Favorilere ekle'}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-md border ${fav ? 'border-rose-500 text-rose-600' : 'border-slate-300 text-slate-700'} hover:bg-slate-50 transition`}
      onClick={toggle}
      title={fav ? 'Favorilerden kaldır' : 'Favorilere ekle'}
    >
      {fav ? <HeartSolid className="w-5 h-5" /> : <HeartOutline className="w-5 h-5" />}
    </button>
  );
}



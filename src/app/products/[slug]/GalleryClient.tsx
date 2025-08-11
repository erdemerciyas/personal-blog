'use client';

import React, { useMemo, useState } from 'react';

type Props = {
  cover: string;
  images?: string[];
  title: string;
};

export default function ProductGallery({ cover, images = [], title }: Props) {
  const gallery = useMemo(() => [cover, ...images.filter((u) => u && u !== cover)], [cover, images]);
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={gallery[active] || cover}
        alt={title}
        className="w-full h-96 object-cover rounded-xl shadow-sm border"
      />
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((u, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${u}-${idx}`}
              src={u}
              alt={`${title} ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={`h-16 w-20 object-cover rounded border cursor-pointer transition-transform ${
                active === idx ? 'ring-2 ring-emerald-500 scale-95' : 'hover:scale-95'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}



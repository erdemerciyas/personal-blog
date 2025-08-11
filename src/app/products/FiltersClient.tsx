'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Category = { _id?: string; slug?: string; name: string };

interface FiltersClientProps {
  categories: Category[];
  initialCategory: string; // comma separated ids
}

export default function FiltersClient({ categories, initialCategory }: FiltersClientProps) {
  const initiallySelected = useMemo(() => (initialCategory ? initialCategory.split(',').filter(Boolean) : []), [initialCategory]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(initiallySelected);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.category-multiselect')) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      {/* Hidden inputs for form submit */}
      <input type="hidden" name="category" value={selected.join(',')} />

      {/* Category multiselect */}
      <div className="category-multiselect relative">
        <button type="button" onClick={() => setOpen(!open)} className="w-full select-field text-left">
          {selected.length === 0 ? 'Kategori' : `${selected.length} kategori seçili`}
        </button>
        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-64 overflow-auto">
            <div className="p-2 space-y-1 text-sm">
              {categories.map((c) => {
                const id = (c._id || c.slug) as string;
                const checked = selected.includes(id);
                return (
                  <label key={id} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelected((prev) => (e.target.checked ? [...prev, id] : prev.filter((x) => x !== id)));
                      }}
                    />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* No price range sliders here to keep a clean, single-row layout */}
    </>
  );
}



'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function PriceRangeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [min, setMin] = useState(searchParams.get('priceMin') || '');
    const [max, setMax] = useState(searchParams.get('priceMax') || '');

    const applyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());

        if (min) params.set('priceMin', min);
        else params.delete('priceMin');

        if (max) params.set('priceMax', max);
        else params.delete('priceMax');

        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div>
            <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                Fiyat Aralığı
            </div>
            <form onSubmit={applyFilter} className="space-y-2">
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="Min"
                        value={min}
                        onChange={(e) => setMin(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                        min="0"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={max}
                        onChange={(e) => setMax(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                        min="0"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-1 text-sm bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors"
                >
                    Uygula
                </button>
            </form>
        </div>
    );
}

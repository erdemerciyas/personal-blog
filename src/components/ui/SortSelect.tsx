'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'dateDesc';

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', e.target.value);
        params.set('page', '1'); // Reset pagination
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:inline-block">Sırala:</span>
            <select
                value={currentSort}
                onChange={handleSortChange}
                className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md cursor-pointer"
                aria-label="Sıralama Seçenekleri"
            >
                <option value="dateDesc">En Yeniler</option>
                <option value="dateAsc">En Eskiler</option>
                <option value="priceAsc">Fiyat (Artan)</option>
                <option value="priceDesc">Fiyat (Azalan)</option>
            </select>
        </div>
    );
}

'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(searchParams.get('q') || '');
    const [isPending, startTransition] = useTransition();
    const [isTyping, setIsTyping] = useState(false);

    // Sync internal state if URL param changes externally
    useEffect(() => {
        setValue(searchParams.get('q') || '');
    }, [searchParams]);

    const updateSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        // Always reset to page 1 on new search
        params.set('page', '1');

        startTransition(() => {
            router.replace(`/products?${params.toString()}`, { scroll: false });
        });
    }, [router, searchParams]);

    useEffect(() => {
        // Determine if we should debounce
        const timeoutId = setTimeout(() => {
            if (value !== (searchParams.get('q') || '')) {
                updateSearch(value);
            }
            setIsTyping(false);
        }, 400); // 400ms debounce

        return () => clearTimeout(timeoutId);
    }, [value, updateSearch, searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        setIsTyping(true);
    };

    const isLoading = isTyping || isPending;

    return (
        <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                ) : (
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                )}
            </div>
            <input
                type="text"
                name="q"
                value={value}
                onChange={handleChange}
                placeholder="Ürün ara... (örn: filament, 3d yazıcı)"
                className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            />
        </div>
    );
}

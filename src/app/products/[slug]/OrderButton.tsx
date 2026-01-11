'use client';

import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useProductContext } from './ProductClientWrapper';

interface OrderButtonProps {
    stock: number;
}

export default function OrderButton({ stock }: OrderButtonProps) {
    const { openOrderModal } = useProductContext();

    return (
        <button
            onClick={openOrderModal}
            disabled={stock <= 0}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-primary-900/10 transition-all active:scale-[0.98] ${stock > 0
                ? 'bg-brand-primary-900 text-white hover:bg-brand-primary-800'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
        >
            <ShoppingCartIcon className="w-6 h-6" />
            {stock > 0 ? 'Sipariş Ver' : 'Stokta Yok'}
        </button>
    );
}

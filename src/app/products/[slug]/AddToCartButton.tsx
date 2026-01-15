'use client';

import { useState } from 'react';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

interface AddToCartButtonProps {
    product: {
        _id: string;
        title: string;
        price: number;
        coverImage: string;
        slug: string;
        stock: number;
    };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart, loading } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = async () => {
        if (product.stock <= 0) return;
        setIsAdding(true);
        try {
            await addToCart(product._id, 1);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        } catch (error) {
            console.error('Failed to add to cart', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdding || loading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-primary-900/10 transition-all active:scale-[0.98] ${product.stock > 0
                    ? isAdded
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-brand-primary-900 text-white hover:bg-brand-primary-800'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
        >
            {isAdded ? (
                <CheckIcon className="w-6 h-6" />
            ) : (
                <ShoppingCartIcon className="w-6 h-6" />
            )}

            {product.stock <= 0
                ? 'Stokta Yok'
                : isAdded
                    ? 'Sepete Eklendi!'
                    : isAdding
                        ? 'Ekleniyor...'
                        : 'Sepete Ekle'}
        </button>
    );
}

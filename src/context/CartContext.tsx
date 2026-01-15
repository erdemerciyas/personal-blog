'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface CartItem {
    product: {
        _id: string;
        title: string;
        price: number;
        coverImage: string;
        slug: string;
        stock: number;
    };
    quantity: number;
    attributes?: Record<string, string>;
    price?: number;
}

interface Cart {
    _id?: string;
    cartId?: string;
    items: CartItem[];
    totalPrice?: number; // Calculated on client usually, or server
}

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    addToCart: (productId: string, quantity: number, attributes?: Record<string, string>) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Helper to get Guest Cart ID
    const getGuestCartId = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('guestCartId');
        }
        return null;
    };

    const setGuestCartId = (id: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('guestCartId', id);
            // Also set cookie for server-side access if needed (optional for now as we send it in body/query)
            document.cookie = `guestCartId=${id}; path=/; max-age=2592000`; // 30 days
        }
    };

    const fetchCart = async () => {
        try {
            setLoading(true);
            const guestId = getGuestCartId();
            let url = '/api/cart';

            if (guestId && !session) {
                url += `?cartId=${guestId}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Failed to fetch cart', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Fetch & Sync on Session Change
    useEffect(() => {
        fetchCart();
    }, [session, status]);

    const addToCart = async (productId: string, quantity: number, attributes?: Record<string, string>) => {
        try {
            const guestId = getGuestCartId();
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    quantity,
                    attributes,
                    cartId: guestId
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
                if (data.cartId && !session) {
                    setGuestCartId(data.cartId);
                }
                // Optional: Show toast
            } else {
                console.error('Add to cart failed');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const removeFromCart = async (itemId: string) => {
        try {
            const guestId = getGuestCartId();
            // Assume itemId is ProductId for now based on API implementation
            let url = `/api/cart/${itemId}`;
            if (!session && guestId) {
                url += `?cartId=${guestId}`;
            }

            const res = await fetch(url, {
                method: 'DELETE',
            });

            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        try {
            const guestId = getGuestCartId();
            const res = await fetch(`/api/cart/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity,
                    cartId: guestId
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    const cartTotal = cart?.items?.reduce((acc, item) => {
        // Use live product price if populated, fallback to snapshot price
        const price = item.product?.price ?? item.price ?? 0;
        return acc + (price * item.quantity);
    }, 0) || 0;

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

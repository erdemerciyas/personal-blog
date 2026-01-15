import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Cart from '@/models/Cart';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { itemId: string } }
) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const { quantity, cartId } = await req.json(); // cartId optional if guest

        if (!quantity || quantity < 1) {
            return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
        }

        const { itemId } = params;

        const query = session?.user?.id
            ? { userId: session.user.id }
            : { cartId: cartId };

        // Find cart and update the specific item's quantity
        const cart = await Cart.findOne(query);

        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        // Logic to find item. Note: itemId here acts as the Product ID in the array mainly, 
        // unless we strictly use subdocument _id. 
        // For simplicity, let's assume valid implementation passes ProductId as itemId 
        // or we search by matching subdocument _id if frontend sends that.

        // Case 1: itemId is Product ID (simpler URL: /api/cart/product_id_123)
        const itemIndex = cart.items.findIndex((item: any) => item.product.toString() === itemId);

        // Case 2: itemId is Subdocument ID
        if (itemIndex === -1) {
            // Try to find by _id of the item subdocument
            // Note: Schema needs _id: true (default) for this to work perfectly, 
            // but our CartItemSchema had { _id: false } in previous step?
            // Let's check Cart model.
        }

        // Fix: In Cart.ts I set { _id: false } for CartItemSchema! 
        // So we MUST use Product ID or index identification.
        // Proceed assuming itemId is Product ID.

        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        return NextResponse.json(updatedCart, { status: 200 });

    } catch (error) {
        console.error('Cart Item PATCH Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { itemId: string } }
) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        // We might need cartId from query param for guests since DELETE usually manages body differently or lacks it in some clients
        // But Next.js Request body works in DELETE too. Let's try getting cartId from URL search params for DELETE to be standard safe.
        const cartId = req.nextUrl.searchParams.get('cartId');

        const { itemId } = params;

        const query = session?.user?.id
            ? { userId: session.user.id }
            : { cartId: cartId };

        if (!query.userId && !query.cartId) {
            return NextResponse.json({ error: 'Cart identifier missing' }, { status: 400 });
        }

        const cart = await Cart.findOne(query);

        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        // Filter out the item (assuming itemId is Product ID)
        cart.items = cart.items.filter((item: any) => item.product.toString() !== itemId);

        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        return NextResponse.json(updatedCart, { status: 200 });

    } catch (error) {
        console.error('Cart Item DELETE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

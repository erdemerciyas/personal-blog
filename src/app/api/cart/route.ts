import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Cart from '@/models/Cart';
import Product from '@/models/Product'; // To validate price/stock
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        let cart;
        const cartId = req.nextUrl.searchParams.get('cartId');

        if (session?.user?.id) {
            // Fetch by User ID
            cart = await Cart.findOne({ userId: session.user.id }).populate('items.product');
            // If user has a cart, merge logic could happen here, but for now just return it
        } else if (cartId) {
            // Fetch by Guest Cart ID
            cart = await Cart.findOne({ cartId }).populate('items.product');
        }

        if (!cart) {
            return NextResponse.json({ items: [] }, { status: 200 });
        }

        return NextResponse.json(cart, { status: 200 });
    } catch (error) {
        console.error('Cart GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { productId, quantity, attributes } = body;
        let { cartId } = body; // Can be passed from client for guests

        if (!productId || !quantity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate cartId for new guest sessions if not provided
        if (!cartId && !session?.user?.id) {
            cartId = crypto.randomUUID();
        }

        // Find valid product to ensure price/stock conformity
        // Note: In a real app we check stock here
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Determine query for finding existing cart
        const query = session?.user?.id
            ? { userId: session.user.id }
            : { cartId: cartId };

        let cart = await Cart.findOne(query);

        if (!cart) {
            // Create new Cart
            cart = new Cart({
                ...query,
                items: [{
                    product: productId,
                    quantity,
                    attributes,
                    price: product.price // Snapshot price
                }],
            });
        } else {
            // Check if item exists
            const itemIndex = cart.items.findIndex((item: any) =>
                item.product.toString() === productId
                // && JSON.stringify(item.attributes) === JSON.stringify(attributes) // Simplified attribute match
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    attributes,
                    price: product.price
                });
            }
        }

        await cart.save();
        // Re-fetch to populate
        const updatedCart = await Cart.findById(cart._id).populate('items.product');

        // Return cartId so client can store it in cookie if needed
        return NextResponse.json({ cart: updatedCart, cartId: cartId }, { status: 200 });

    } catch (error) {
        console.error('Cart POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

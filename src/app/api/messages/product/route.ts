import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';

// POST /api/messages/product - Yeni ürün sorusu oluştur
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, message, productId, productName } = body;

        if (!name || !email || !message || !productId) {
            return NextResponse.json(
                { error: 'Lütfen zorunlu alanları doldurun.' },
                { status: 400 }
            );
        }

        await connectDB();

        // Ürünün varlığını kontrol et
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: 'Ürün bulunamadı.' },
                { status: 404 }
            );
        }

        const newMessage = await Message.create({
            name,
            email,
            phone,
            subject: `Ürün Sorusu: ${productName || product.title}`, // Otomatik konu
            message,
            type: 'product_question',
            productId,
            productName: productName || product.title,
            status: 'new',
            isRead: false
        });

        return NextResponse.json(
            { message: 'Sorunuz başarıyla iletildi.', data: newMessage },
            { status: 201 }
        );

    } catch (error) {
        console.error('Mesaj oluşturma hatası:', error);
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}

// GET /api/messages/product?productId=... - Ürüne ait mesajları getir (Admin Only)
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        await connectDB();

        const messages = await Message.find({ productId }).sort({ createdAt: -1 });

        return NextResponse.json({ items: messages });

    } catch (error) {
        console.error('Mesajları getirme hatası:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

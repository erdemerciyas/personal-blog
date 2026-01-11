import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { sendOrderEmail } from '@/lib/email';

// GET /api/orders - Fetch all orders (Admin only effectively)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(req: NextRequest) {
  try {
    console.log('1. Connecting to DB...');
    await connectDB();
    console.log('2. Parsing body...');
    const body = await req.json();
    const { productId, customerName, customerEmail, customerPhone, customerAddress, note, quantity, price, selectedOptions } = body;
    console.log('3. Body parsed. ProductID:', productId, 'Price:', price, 'Qty:', quantity);

    // Validate Product
    const product = await Product.findById(productId);
    if (!product) {
      console.error('Product not found for ID:', productId);
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    console.log('4. Product found:', product.title, 'DB Price:', product.price);

    const finalPrice = Number(price) || product.price || 0;
    console.log('5. Final Price to save:', finalPrice);

    // Create Order
    console.log('6. Creating order document...');
    const order = await Order.create({
      product: productId,
      productName: product.title,
      productSlug: product.slug,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      note,
      quantity: quantity || 1,
      price: finalPrice,
      selectedOptions: selectedOptions || [],
      status: 'new'
    });
    console.log('6. Order created:', order._id, 'Saved Price:', order.price);

    // 5. Send Emails
    let emailStatus = { admin: false, customer: false };

    // 1. To Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER || 'admin@example.com';
    try {
      emailStatus.admin = await sendOrderEmail({
        to: adminEmail,
        subject: `Yeni Sipariş: ${product.title}`,
        order,
        isAdmin: true
      });
    } catch (e) {
      console.error('Failed to send admin email:', e);
    }

    // 2. To Customer
    try {
      emailStatus.customer = await sendOrderEmail({
        to: customerEmail,
        subject: 'Siparişiniz Alındı - Fixral 3D',
        order,
        isAdmin: false
      });
    } catch (e) {
      console.error('Failed to send customer email:', e);
    }

    return NextResponse.json({ success: true, data: order, emailStatus }, { status: 201 });

  } catch (error: any) {
    console.error('CRITICAL Error in POST /api/orders:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create order',
      details: error.toString()
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { sendOrderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// GET /api/orders
// Supports ?deleted=true for Trash view (default false)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const showDeleted = url.searchParams.get('deleted') === 'true';

    console.log('GET /api/orders query:', {
      url: req.url,
      deletedParam: url.searchParams.get('deleted'),
      showDeleted
    });

    // 1. Lazy Cleanup: Delete orders soft-deleted > 10 days ago
    // Using $exists: true ensures we only target actually deleted items
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    Order.deleteMany({
      deletedAt: { $exists: true, $ne: null, $lt: tenDaysAgo }
    }).then(res => {
      if (res.deletedCount > 0) console.log(`Lazy cleanup deleted ${res.deletedCount} orders`);
    }).catch(err =>
      console.error('Lazy cleanup error:', err)
    );

    // 2. Filter Orders
    const filter = showDeleted
      ? { deletedAt: { $exists: true, $ne: null } } // Trash: Must exist and not be null
      : { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }; // Active: Null or Missing

    console.log('Mongo Filter:', JSON.stringify(filter));

    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    // Get trash count for badge
    const trashCount = await Order.countDocuments({ deletedAt: { $exists: true, $ne: null } });

    const totalPages = Math.ceil(total / limit);

    console.log(`Found ${orders.length} orders for deleted=${showDeleted} (Page ${page}/${totalPages})`);
    return NextResponse.json({
      success: true,
      data: orders,
      trashCount,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    }, { status: 200 });
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
    const emailStatus = { admin: false, customer: false };

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

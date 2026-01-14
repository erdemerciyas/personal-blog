import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import slugify from 'slugify';

export const GET = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const condition = searchParams.get('condition'); // new|used
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') as 'created' | 'priceAsc' | 'priceDesc' | null;
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');

  const status = searchParams.get('status');
  const stock = searchParams.get('stock');

  // Regex search for title instead of text search for better partial matching
  const filter: Record<string, unknown> = q
    ? { title: { $regex: q, $options: 'i' } }
    : {};

  if (condition) (filter as any).condition = condition;
  if (category) (filter as any).categoryIds = category;

  // Status Filter
  if (status === 'published') (filter as any).isActive = true;
  if (status === 'draft') (filter as any).isActive = false;

  // Stock Filter
  if (stock === 'in_stock') (filter as any).stock = { $gt: 0 };
  if (stock === 'out_of_stock') (filter as any).stock = { $lte: 0 };

  let sortSpec: Record<string, 1 | -1>;
  if (!sort || sort === 'created') {
    sortSpec = { createdAt: -1 };
  } else if (sort === 'priceAsc') {
    sortSpec = { price: 1 };
  } else {
    sortSpec = { price: -1 };
  }
  const items = await Product.find(filter).sort(sortSpec).skip((page - 1) * limit).limit(limit);
  const total = await Product.countDocuments(filter);
  return NextResponse.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
});

export const POST = withSecurity({
  ...SecurityConfigs.admin,
  validateInput: false // Product descriptions contain HTML, so we skip trusted admin input validation
})(async (req: NextRequest) => {
  await connectDB();
  const body = await req.json();
  if (!body.title || !body.coverImage || !body.description)
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });

  // Normalize arrays
  body.images = Array.isArray(body.images) ? body.images : [];
  body.attachments = Array.isArray(body.attachments) ? body.attachments : [];
  body.categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds : [];
  body.colors = Array.isArray(body.colors) ? body.colors : [];
  body.sizes = Array.isArray(body.sizes) ? body.sizes : [];
  body.attributes = Array.isArray(body.attributes) ? body.attributes : [];

  // Ensure slug exists for validation. Model also guards in pre-validate
  if (!body.slug && body.title) {
    body.slug = slugify(body.title, { lower: true, strict: true });
  }

  // Sanitize numeric fields to prevent CastErrors
  if (body.price === '' || body.price === null) delete body.price;

  try {
    const product = await Product.create(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Product create error:', error);

    // Duplicate Key Error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bu isimde veya URL\'de bir ürün zaten mevcut. Lütfen başlığı değiştirin.' },
        { status: 409 }
      );
    }

    // Validation Error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json(
        { error: `Doğrulama hatası: ${messages.join(', ')}` },
        { status: 400 }
      );
    }

    // Cast Error (Invalid ID or Number)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: `Geçersiz veri formatı: ${error.path} alanı hatalı.` },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Ürün oluşturulurken beklenmedik bir hata oluştu.' }, { status: 500 });
  }
});



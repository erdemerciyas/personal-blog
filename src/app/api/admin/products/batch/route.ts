import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';

// Batch operations: { action: 'activate'|'deactivate'|'delete', ids: string[] }
export const POST = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const { action, ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  switch (action) {
    case 'activate': {
      const r = await Product.updateMany({ _id: { $in: ids } }, { isActive: true });
      return NextResponse.json({ success: true, modified: r.modifiedCount });
    }
    case 'deactivate': {
      const r = await Product.updateMany({ _id: { $in: ids } }, { isActive: false });
      return NextResponse.json({ success: true, modified: r.modifiedCount });
    }
    case 'delete': {
      const r = await Product.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ success: true, deleted: r.deletedCount });
    }
    default:
      return NextResponse.json({ error: 'Geçersiz aksiyon' }, { status: 400 });
  }
});



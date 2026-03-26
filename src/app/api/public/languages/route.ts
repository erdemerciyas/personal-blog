import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Language from '@/models/Language';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const languages = await Language.find({ isActive: true })
      .select('code label nativeLabel flag isDefault direction')
      .sort({ isDefault: -1, label: 1 })
      .lean();

    return NextResponse.json({ success: true, data: languages });
  } catch (error) {
    console.error('Public languages GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Diller yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Language from '@/models/Language';

// GET /api/admin/languages
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 });
  }

  await connectDB();
  const languages = await Language.find().sort({ isDefault: -1, label: 1 }).lean();
  return NextResponse.json({ success: true, data: languages });
}

// POST /api/admin/languages
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 });
  }

  await connectDB();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const { code, label, nativeLabel, flag, isDefault, direction } = body;

  if (!code || !label || !nativeLabel) {
    return NextResponse.json(
      { success: false, error: 'code, label ve nativeLabel zorunludur.' },
      { status: 422 }
    );
  }

  const exists = await Language.findOne({ code });
  if (exists) {
    return NextResponse.json(
      { success: false, error: `"${code}" kodu zaten kullanımda.` },
      { status: 409 }
    );
  }

  const language = new Language({ code, label, nativeLabel, flag, isDefault, direction });
  await language.save();

  return NextResponse.json({ success: true, data: language }, { status: 201 });
}

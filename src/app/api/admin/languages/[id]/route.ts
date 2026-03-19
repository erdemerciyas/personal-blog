import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Language from '@/models/Language';

// PATCH /api/admin/languages/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const language = await Language.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!language) {
    return NextResponse.json({ success: false, error: 'Dil bulunamadı.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: language });
}

// DELETE /api/admin/languages/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;

  const language = await Language.findById(id);
  if (!language) {
    return NextResponse.json({ success: false, error: 'Dil bulunamadı.' }, { status: 404 });
  }

  if (language.isDefault) {
    return NextResponse.json(
      { success: false, error: 'Varsayılan dil silinemez.' },
      { status: 409 }
    );
  }

  await language.deleteOne();
  return NextResponse.json({ success: true });
}

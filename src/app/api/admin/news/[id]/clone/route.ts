import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloneContent } from '@/lib/clone';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 });
  }

  const { id } = await params;
  const result = await cloneContent('news', id);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { id: result.id, slug: result.slug } }, { status: 201 });
}

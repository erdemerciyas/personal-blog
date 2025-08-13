import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';

// Development-only admin password reset endpoint
// Usage: POST /api/admin/reset-admin-password
// Body: { email?: string, newPassword: string }
// Security: Only enabled when NODE_ENV !== 'production'

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    await connectDB();

    const { email, newPassword } = await request.json();
    const targetEmail = (email as string) || process.env.ADMIN_EMAIL || 'extremeecu34@gmail.com';

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Geçerli bir yeni şifre sağlayın (min 6 karakter)' }, { status: 400 });
    }

    const admin = await User.findOne({ email: targetEmail });
    if (!admin) {
      return NextResponse.json({ error: 'Admin kullanıcısı bulunamadı' }, { status: 404 });
    }

    // DİKKAT: Şifreyi burada hashlemiyoruz. User şemasındaki pre('save') tek kez hashleyecek.
    admin.password = newPassword;
    // Rolü koru (her ihtimale karşı)
    if (!admin.role) admin.role = 'admin';
    await admin.save();

    return NextResponse.json({ success: true, message: 'Admin şifresi güncellendi', email: targetEmail });
  } catch (error) {
    console.error('Reset admin password error:', error);
    return NextResponse.json({ error: 'Şifre sıfırlama hatası' }, { status: 500 });
  }
}

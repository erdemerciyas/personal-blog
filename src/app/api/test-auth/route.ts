import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🧪 Test Auth - Email:', email);
    console.log('🧪 Test Auth - Password length:', password?.length);
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Find user
    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? { email: user.email, role: user.role, hasPassword: !!user.password } : 'Not found');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        debug: { email, userExists: false }
      });
    }
    
    // Test password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValidPassword);
    
    return NextResponse.json({
      success: isValidPassword,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
      debug: {
        email,
        userExists: true,
        passwordValid: isValidPassword,
        passwordLength: password.length,
        hashedPasswordLength: user.password.length
      }
    });
    
  } catch (error) {
    console.error('❌ Test Auth Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      MONGODB_URI: process.env.MONGODB_URI ? `✅ Set (${process.env.MONGODB_URI.substring(0, 20)}...)` : '❌ Missing',
    },
    message: 'Environment variables check'
  });
} 
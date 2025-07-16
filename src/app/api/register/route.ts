import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');

    // Sabit kullanıcı bilgileri
    const email = 'erdem.erciyas@gmail.com';
    const password = '6026341';
    const name = 'Erdem';

    // Check if user already exists
    console.log('Checking if user exists...');
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with admin role
    console.log('Creating user...');
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin'
    });

    console.log('User created successfully:', user);
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET metodu ile de kullanıcı oluşturulabilir
export async function GET() {
  return POST();
} 
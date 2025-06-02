import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Debug için environment variables kontrolü
console.log('🔍 NextAuth Environment Variables Check:', {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing',
  NODE_ENV: process.env.NODE_ENV || '❌ Missing',
  MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 
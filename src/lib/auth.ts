import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongoose';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface Credentials {
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Credentials | undefined): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          console.log('🔐 Auth attempt for:', credentials.email);
          await connectDB();
          
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            console.log('❌ User not found:', credentials.email);
            return null;
          }

          console.log('👤 User found:', { email: user.email, role: user.role });

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', credentials.email);
            return null;
          }

          console.log('✅ Login successful for:', credentials.email);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
      },
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as User).role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Production'da doğru redirect için
      const redirectUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
      console.log('🔄 Redirect:', { url, baseUrl, redirectUrl });
      
      // Login sonrası admin dashboard'a yönlendir
      if (url === '/admin/login' || url === baseUrl) {
        return `${baseUrl}/admin/dashboard`;
      }
      
      return redirectUrl.startsWith(baseUrl) ? redirectUrl : baseUrl;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}; 
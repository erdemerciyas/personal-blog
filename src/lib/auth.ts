import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongoose';
import User from '../models/User';
import bcrypt from 'bcryptjs';

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
      id: 'credentials',
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
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 NextAuth Redirect:', { url, baseUrl });
      
      // Login başarılı ise dashboard'a yönlendir
      if (url === '/admin/login' || url === baseUrl || url === '/') {
        return `${baseUrl}/admin/dashboard`;
      }
      
      // URL baseUrl ile başlıyorsa o URL'e git
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Relative URL ise baseUrl'e ekle
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Varsayılan olarak dashboard'a yönlendir
      return `${baseUrl}/admin/dashboard`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 
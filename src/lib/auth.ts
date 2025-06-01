import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        securityHash: { label: 'Security Hash', type: 'text' },
        securityAnswer: { label: 'Security Answer', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gerekli');
        }

        // Security question kontrolü
        if (!credentials?.securityHash || !credentials?.securityAnswer) {
          throw new Error('Güvenlik sorusu doğrulaması gerekli');
        }

        // Server-side security question doğrulaması
        try {
          const securityResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify-captcha`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              answer: credentials.securityAnswer,
              hash: credentials.securityHash 
            }),
          });

          if (!securityResponse.ok) {
            const errorData = await securityResponse.json();
            console.error('Güvenlik doğrulama hatası:', errorData);
            throw new Error('Güvenlik doğrulaması başarısız');
          }

          const securityResult = await securityResponse.json();
          console.log('Güvenlik doğrulama başarılı:', securityResult);
        } catch (error) {
          console.error('Güvenlik doğrulama sırasında hata:', error);
          throw new Error('Güvenlik doğrulaması başarısız');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('Kullanıcı bulunamadı');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Geçersiz şifre');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
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
        token.role = user.role;
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
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 
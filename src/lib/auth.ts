import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Security validation function - internal use
async function validateSecurityAnswer(answer: string, hash: string): Promise<boolean> {
  try {
    if (!answer || !hash) return false;

    // Hash'i çöz
    let questionData: any;
    try {
      const decodedData = Buffer.from(hash, 'base64').toString('utf-8');
      questionData = JSON.parse(decodedData);
    } catch (error) {
      return false;
    }

    // Zaman aşımı kontrolü (5 dakika)
    const now = Date.now();
    if (now - questionData.timestamp > 5 * 60 * 1000) {
      return false;
    }

    // Cevabı kontrol et
    const userAnswer = answer.toString().toLowerCase().trim();
    const correctAnswer = questionData.answer.toLowerCase().trim();
    const alternatives = questionData.alternatives || [];

    return userAnswer === correctAnswer || 
           alternatives.some((alt: string) => alt.toLowerCase() === userAnswer);
  } catch (error) {
    console.error('Security validation error:', error);
    return false;
  }
}

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

        // Security question kontrolü - internal validation
        if (!credentials?.securityHash || !credentials?.securityAnswer) {
          throw new Error('Güvenlik sorusu doğrulaması gerekli');
        }

        // Internal security validation - no external fetch
        const isSecurityValid = await validateSecurityAnswer(
          credentials.securityAnswer,
          credentials.securityHash
        );

        if (!isSecurityValid) {
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
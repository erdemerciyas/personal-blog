import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongoose';
import UserModel from '../models/User';
import bcrypt from 'bcryptjs';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

// @ts-ignore
interface Credentials {
  email?: string;
  password?: string;
}

// Vercel'de `VERCEL_URL` varsa onu kullan, yoksa env'den al.
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXTAUTH_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Credentials | undefined): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Input validation and sanitization
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return null;
        }

        // Password length check
        if (password.length < 6 || password.length > 128) {
          return null;
        }

        try {
          await connectDB();
          
          // Add timing attack protection
          const startTime = Date.now();
          
          const user = await UserModel.findOne({ email: email });

          if (!user) {
            // Constant time delay to prevent user enumeration
            await bcrypt.compare(password, '$2a$12$dummy.hash.to.prevent.timing.attacks');
            const elapsed = Date.now() - startTime;
            if (elapsed < 100) {
              await new Promise(resolve => setTimeout(resolve, 100 - elapsed));
            }
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            // Log failed login attempt
            console.warn('Failed login attempt:', {
              email: email,
              timestamp: new Date().toISOString(),
              ip: 'unknown' // Will be logged by middleware
            });
            
            const elapsed = Date.now() - startTime;
            if (elapsed < 100) {
              await new Promise(resolve => setTimeout(resolve, 100 - elapsed));
            }
            return null;
          }

          // Log successful login
          console.info('Successful login:', {
            userId: user._id.toString(),
            email: email,
            role: user.role,
            timestamp: new Date().toISOString()
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          // Don't reveal internal errors to client
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours (reduced from 30 days for security)
    updateAge: 60 * 60, // 1 hour (reduced from 24 hours)
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours (reduced from 30 days)
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict', // Changed from 'lax' to 'strict' for better security
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Add additional security options
        ...(process.env.NODE_ENV === 'production' && {
          domain: new URL(process.env.NEXTAUTH_URL || '').hostname,
        }),
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
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
        token.role = (user as AuthUser).role;
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        session.user.email = token.email as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const finalBaseUrl = vercelUrl || baseUrl;
      
      // Login veya ana sayfadan geliyorsa her zaman dashboard'a yönlendir.
      if (url.startsWith('/admin/login') || url === finalBaseUrl) {
        return `${finalBaseUrl}/admin/dashboard`;
      }
      // Göreceli bir URL ise tam adrese çevir.
      else if (url.startsWith('/')) {
        return new URL(url, finalBaseUrl).toString();
      }
      // Zaten tam bir URL ise dokunma.
      return url;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 
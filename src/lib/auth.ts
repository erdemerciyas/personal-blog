import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongoose';
import UserModel from '../models/User';
import bcrypt from 'bcryptjs';
import { SecurityEvents } from './security-audit';

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

// Console hatalarını önlemek için URL validation
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return vercelUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Credentials | undefined, req: any): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Input validation and sanitization
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;
        
        // Get client IP and user agent for security logging
        const clientIP = req?.headers?.['x-forwarded-for'] || 
                        req?.headers?.['x-real-ip'] || 
                        req?.connection?.remoteAddress || 
                        'unknown';
        const userAgent = req?.headers?.['user-agent'] || 'unknown';

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return null;
        }

        // Password length check (minimum 6 characters for security)
        if (password.length < 6 || password.length > 128) {
          return null;
        }

        try {
          await connectDB();
          
          // Log login attempt
          try {
            SecurityEvents.loginAttempt(clientIP, email, userAgent);
          } catch (secError) {
            console.log('⚠️ Security logging error:', secError);
          }
          
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
            
            // Log failed login - user not found
            try {
              SecurityEvents.loginFailure(clientIP, email, userAgent, 'user_not_found');
            } catch (secError) {
              console.log('⚠️ Security logging error:', secError);
            }
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            // Log failed login attempt
            try {
              SecurityEvents.loginFailure(clientIP, email, userAgent, 'invalid_password');
            } catch (secError) {
              console.log('⚠️ Security logging error:', secError);
            }
            
            const elapsed = Date.now() - startTime;
            if (elapsed < 100) {
              await new Promise(resolve => setTimeout(resolve, 100 - elapsed));
            }
            return null;
          }

          // Log successful login
          try {
            SecurityEvents.loginSuccess(clientIP, email, userAgent);
          } catch (secError) {
            console.log('⚠️ Security logging error:', secError);
          }

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
    maxAge: 8 * 60 * 60, // 8 hours (reduced for better security)
    updateAge: 30 * 60, // 30 minutes (more frequent updates)
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours (reduced for better security)
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax', // Vercel için 'lax' daha uygun
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax', // Vercel için 'lax' daha uygun
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax', // Vercel için 'lax' daha uygun
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
      const finalBaseUrl = getBaseUrl();
      
      console.log('🔄 NextAuth redirect:', { url, baseUrl, finalBaseUrl });
      
      // Eğer callbackUrl dashboard ise direkt oraya git
      if (url.includes('/admin/dashboard')) {
        return `${finalBaseUrl}/admin/dashboard`;
      }
      
      // Login sayfasından geliyorsa dashboard'a yönlendir
      if (url.includes('/admin/login') || url === finalBaseUrl || url === baseUrl) {
        return `${finalBaseUrl}/admin/dashboard`;
      }
      
      // Göreceli URL ise tam adrese çevir
      if (url.startsWith('/')) {
        return `${finalBaseUrl}${url}`;
      }
      
      // Güvenlik kontrolü - sadece kendi domain'imize redirect
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(finalBaseUrl);
        
        if (urlObj.hostname === baseUrlObj.hostname) {
          return url;
        } else {
          // Farklı domain ise dashboard'a yönlendir
          return `${finalBaseUrl}/admin/dashboard`;
        }
      } catch (error) {
        console.error('Redirect URL parse error:', error);
        return `${finalBaseUrl}/admin/dashboard`;
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 
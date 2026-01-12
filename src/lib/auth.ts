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
  image?: string;
}

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
        password: { label: 'Password', type: 'password' },
        code: { label: '2FA Code', type: 'text' }
      },
      async authorize(credentials: Record<string, string> | undefined, req: { headers?: Record<string, string | string[] | undefined>; connection?: { remoteAddress?: string } } | undefined): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gereklidir.');
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;
        const code = credentials.code;

        // ... (logging parts omitted for brevity, keeping simple flow)

        await connectDB();
        // Explicitly select 2fa fields as they might be hidden/excluded
        const user = await UserModel.findOne({ email }).select('+password +twoFactorSecret +isTwoFactorEnabled');

        if (!user) {
          // Dummy check for timing
          await bcrypt.compare(password, '$2a$12$dummy.hash.to.prevent.timing.attacks');
          throw new Error('Kullanıcı bulunamadı.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Hatalı şifre.');
        }

        // 2FA Logic
        if (user.isTwoFactorEnabled) {
          if (!code) {
            // Determine if we should throw a specific error for UI to catch
            throw new Error('2FA_REQUIRED');
          }

          // Import reliable authenticator wrapper
          const { authenticator } = await import('@/lib/otp');

          if (!user.twoFactorSecret) {
            // Weird state: enabled but no secret. Allow login but warn? Or block? 
            // Block is safer.
            throw new Error('2FA Setup Error. Contact admin.');
          }

          const isValid = authenticator.check(code, user.twoFactorSecret);
          if (!isValid) {
            throw new Error('INVALID_2FA');
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        };
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 hours for better security
    updateAge: 15 * 60, // 15 minutes (more frequent updates)
  },
  jwt: {
    maxAge: 2 * 60 * 60, // 2 hours for better security
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict', // Güvenlik için 'strict' kullan
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'strict', // Güvenlik için 'strict' kullan
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'strict', // Güvenlik için 'strict' kullan
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as AuthUser).role;
        token.id = user.id;
        token.email = user.email;
        token.picture = (user as any).image;
      }

      // Support for client-side update() call
      if (trigger === "update" && session?.user) {
        if (session.user.image) token.picture = session.user.image;
        if (session.user.name) token.name = session.user.name;
        if (session.user.email) token.email = session.user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as unknown as { role?: string; id?: string }).role = token.role as string | undefined;
        (session.user as unknown as { role?: string; id?: string }).id = token.id as string | undefined;
        session.user.email = token.email as string;
        session.user.image = token.picture;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const finalBaseUrl = getBaseUrl();

      // Redirect logging removed for security

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
      } catch {
        // Redirect URL parse error - silently handle
        return `${finalBaseUrl}/admin/dashboard`;
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Debug mode disabled for security
}; 
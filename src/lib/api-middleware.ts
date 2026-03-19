/**
 * Composable API Middleware
 *
 * Mevcut jwt-middleware.ts, rate-limit.ts, validation.ts dosyalarının üzerine
 * zincirleme kullanım için sarmalayıcı fonksiyonlar sağlar.
 *
 * Kullanım örneği:
 *
 *   export const POST = compose(
 *     withAuth(['admin', 'editor']),
 *     withRateLimit('API_MODERATE'),
 *     withValidation(myZodSchema),
 *     async (req) => {
 *       const body = (req as any).validatedBody;
 *       ...
 *     }
 *   );
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ApiHandler = (req: NextRequest, ctx?: Record<string, unknown>) => Promise<NextResponse>;
export type Middleware = (handler: ApiHandler) => ApiHandler;

export type UserRole = 'admin' | 'editor' | 'user';

/** Standard API response shape */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

// ─── Response helpers ─────────────────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200, meta?: ApiResponse['meta']): NextResponse {
  const body: ApiResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

export function apiError(message: string, status = 400): NextResponse {
  const body: ApiResponse = { success: false, error: message };
  return NextResponse.json(body, { status });
}

export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return apiSuccess(data, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

// ─── Middleware factories ─────────────────────────────────────────────────────

/**
 * withAuth — next-auth session kontrolü + rol denetimi
 *
 * @param roles  İzin verilen roller. Boş dizi = sadece giriş yapılmış olsun.
 */
export function withAuth(roles: UserRole[] = []): Middleware {
  return (handler) => async (req, ctx) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return apiError('Oturum açılmamış.', 401);
    }

    const userRole = (session.user as { role?: string }).role as UserRole | undefined;

    if (roles.length > 0 && userRole && !roles.includes(userRole)) {
      return apiError('Bu işlem için yetkiniz bulunmuyor.', 403);
    }

    // Role'ü request'e ekle — sonraki middleware/handler okuyabilir
    (req as NextRequest & { user: { role?: string; email?: string | null } }).user = {
      role:  userRole,
      email: session.user.email,
    };

    return handler(req, ctx);
  };
}

/**
 * withAdminAuth — admin rolü gerektiren kısa yol
 */
export const withAdminAuth = withAuth(['admin']);

/**
 * withEditorAuth — admin veya editor rolü gerektiren kısa yol
 */
export const withEditorAuth = withAuth(['admin', 'editor']);

/**
 * withRateLimit — mevcut rate-limit-utils üzerine zincir
 *
 * @param limitKey  rate-limit-utils içindeki anahtar (örn. 'API_MODERATE')
 */
export function withRateLimit(limitKey: string = 'API_MODERATE'): Middleware {
  return (handler) => async (req, ctx) => {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';

    const result = rateLimit(ip, limitKey as keyof typeof RATE_LIMITS);

    if (!result.allowed) {
      return NextResponse.json(
        { success: false, error: 'Çok fazla istek. Lütfen bekleyin.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    return handler(req, ctx);
  };
}

/**
 * withValidation — Zod şema validasyonu
 * Başarılı parse sonucu `(req as any).validatedBody` üzerinden erişilebilir.
 *
 * @param schema  Zod şeması — sadece `.safeParse()` metodu gerekli
 */
export function withValidation(schema: { safeParse: (data: unknown) => { success: boolean; data?: unknown; error?: { flatten: () => unknown } } }): Middleware {
  return (handler) => async (req, ctx) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError('Geçersiz JSON formatı.', 400);
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası.', details: result.error?.flatten() },
        { status: 422 }
      );
    }

    (req as NextRequest & { validatedBody: unknown }).validatedBody = result.data;
    return handler(req, ctx);
  };
}

// ─── compose — birden fazla middleware'i zincirleme ──────────────────────────

/**
 * compose(...middlewares)(handler)
 *
 * Sağdan sola uygulama: ilk middleware en dışta çalışır.
 *
 * @example
 * export const POST = compose(
 *   withAuth(['admin']),
 *   withRateLimit('API_STRICT'),
 * )(myHandler);
 */
export function compose(...middlewares: Middleware[]): (handler: ApiHandler) => ApiHandler {
  return (handler) =>
    middlewares.reduceRight((acc, mw) => mw(acc), handler);
}

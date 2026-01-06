import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '../../../lib/mongoose';

import { logger } from '@/core/lib/logger';
import { createError, asyncHandler } from '../../../lib/errorHandler';
import { cache, CacheKeys, CacheTTL, cacheHelpers } from '../../../lib/cache';
import { withSecurity, SecurityConfigs } from '../../../lib/security-middleware';

import Service from '../../../models/Service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/services - Tüm servisleri getir
export const GET = asyncHandler(async (req: Request) => {
  const startTime = Date.now();
  logger.apiRequest('GET', '/api/services');
  logger.debug('Services GET handler invoked', 'API', { method: req.method });

  // Try to get from cache first
  const cached = cache.get(CacheKeys.SERVICES);
  if (cached) {
    logger.debug('Services retrieved from cache', 'API');
    return NextResponse.json(cached);
  }

  await connectDB();
  const services = await Service.find({})
    .sort({ createdAt: -1 });

  // Cache the results
  cache.set(CacheKeys.SERVICES, services, CacheTTL.MEDIUM);

  const duration = Date.now() - startTime;
  logger.apiResponse('GET', '/api/services', 200, duration);
  logger.debug('Services retrieved from database', 'API', { count: services.length });

  return NextResponse.json(services);
});

// POST /api/services - Yeni servis ekle
export const POST = withSecurity(SecurityConfigs.admin)(asyncHandler(async (request: Request) => {
  const startTime = Date.now();
  logger.apiRequest('POST', '/api/services');

  const body = await request.json();

  // Validate required fields
  if (!body.title || !body.description) {
    throw createError.validation('Başlık ve açıklama alanları zorunludur', {
      missingFields: [
        ...(!body.title ? ['title'] : []),
        ...(!body.description ? ['description'] : [])
      ]
    });
  }

  // Validate field lengths
  if (body.title.length > 200) {
    throw createError.validation('Başlık çok uzun (maksimum 200 karakter)');
  }

  if (body.description.length > 2000) {
    throw createError.validation('Açıklama çok uzun (maksimum 2000 karakter)');
  }

  await connectDB();

  // Use a default image if none provided
  const imageUrl = body.image || 'https://placehold.co/600x400/cccccc/000000?text=Service+Image';

  const session = await getServerSession();
  const serviceData = {
    title: body.title.trim(),
    description: body.description.trim(),
    image: imageUrl,
    features: body.features || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: session?.user?.email
  };

  try {
    const newService = new Service(serviceData);
    await newService.save();

    // Invalidate services cache
    cacheHelpers.invalidateContentCaches();

    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/services', 201, duration);
    logger.info('Service created successfully', 'API', {
      serviceId: newService._id,
      title: body.title
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      // Duplicate key error
      throw createError.validation('Bu başlıkta bir servis zaten mevcut');
    }
    throw createError.database('Servis oluşturulurken veritabanı hatası oluştu');
  }
}));
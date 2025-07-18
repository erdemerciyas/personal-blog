import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../lib/mongoose';
import { authOptions } from '../../../lib/auth';

import { logger } from '../../../lib/logger';
import { createError, asyncHandler } from '../../../lib/errorHandler';
import { cache, CacheKeys, CacheTTL, cacheHelpers } from '../../../lib/cache';

import Service from '../../../models/Service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/services - Tüm servisleri getir
export const GET = asyncHandler(async () => {
  const startTime = Date.now();
  logger.apiRequest('GET', '/api/services');

  // Try to get from cache first
  const cached = cache.get(CacheKeys.SERVICES);
  if (cached) {
    logger.debug('Services retrieved from cache', 'API');
    return NextResponse.json(cached);
  }

  await connectToDatabase();
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
export const POST = asyncHandler(async (request: Request) => {
  const startTime = Date.now();
  logger.apiRequest('POST', '/api/services');

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw createError.unauthorized('Bu işlem için yetkiniz yok');
  }

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

  const { db } = await connectToDatabase();

  const imageUrl = body.image || '';

  const serviceData = {
    title: body.title.trim(),
    description: body.description.trim(),
    image: imageUrl,
    features: body.features || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: session.user.email
  };

  try {
    const newService = new Service(serviceData);
    const result = await newService.save();
    
    // Invalidate services cache
    cacheHelpers.invalidateContentCaches();
    
    
    
    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/services', 201, duration);
    logger.info('Service created successfully', 'API', { 
      serviceId: newService._id,
      title: body.title 
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      throw createError.validation('Bu başlıkta bir servis zaten mevcut');
    }
    throw createError.database('Servis oluşturulurken veritabanı hatası oluştu');
  }
});
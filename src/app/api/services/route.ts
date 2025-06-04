import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../lib/mongoose';
import { authOptions } from '../../../lib/auth';
import { generateAIImage } from '../../../lib/aiImageGenerator';
import { logger } from '../../../lib/logger';
import { createError, handleApiError, asyncHandler } from '../../../lib/errorHandler';
import { cache, CacheKeys, CacheTTL, cacheHelpers } from '../../../lib/cache';

// GET /api/services - Tüm servisleri getir
export const GET = asyncHandler(async (request: Request) => {
  const startTime = Date.now();
  logger.apiRequest('GET', '/api/services');

  // Try to get from cache first
  const cached = cache.get(CacheKeys.SERVICES);
  if (cached) {
    logger.debug('Services retrieved from cache', 'API');
    return NextResponse.json(cached);
  }

  const { db } = await connectToDatabase();
  const services = await db.collection('services')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

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

  let imageUrl = body.image;
  
  // If no image provided, generate one with AI
  if (!imageUrl || imageUrl.trim() === '') {
    logger.debug('Generating AI image for service', 'API', { title: body.title });
    try {
      imageUrl = await generateAIImage(body.title);
      logger.info('AI image generated successfully', 'API', { title: body.title, imageUrl });
    } catch (error) {
      logger.warn('AI image generation failed, using fallback', 'API', { title: body.title }, error as Error);
      // AI generation failed, will use fallback image from generateAIImage function
    }
  }

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
    const result = await db.collection('services').insertOne(serviceData);
    
    // Invalidate services cache
    cacheHelpers.invalidateContentCaches();
    
    const newService = { ...serviceData, _id: result.insertedId };
    
    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/services', 201, duration);
    logger.info('Service created successfully', 'API', { 
      serviceId: result.insertedId,
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
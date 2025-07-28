import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import FooterSettings from '../../../../models/FooterSettings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Footer ayarlarını getir
export async function GET() {
  try {
    console.log('🔄 Footer settings GET request started');
    await connectDB();
    console.log('✅ Database connected');
    
    const settings = await FooterSettings.getSingleton();
    console.log('✅ Footer settings retrieved:', settings ? 'Found' : 'Not found');
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('❌ Footer settings fetch error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        message: 'Footer ayarları alınamadı',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// PUT: Footer ayarlarını güncelle  
export async function PUT(request: Request) {
  try {
    console.log('🔄 Footer settings PUT request started');
    
    // Sadece admin kullanıcılar güncelleyebilir
    console.log('🔐 Checking session...');
    const session = await getServerSession(authOptions);
    console.log('Session result:', session ? 'Found' : 'Not found');
    
    if (!session) {
      console.log('❌ No session found, returning 401');
      return NextResponse.json(
        { message: 'Yetki gerekli' },
        { status: 401 }
      );
    }

    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    
    console.log('📥 Reading request body...');
    const updateData = await request.json();
    console.log('📝 Update data received:', JSON.stringify(updateData, null, 2));
    
    // Validate required fields
    if (!updateData || typeof updateData !== 'object') {
      console.log('❌ Invalid update data');
      return NextResponse.json(
        { message: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Finding existing settings...');
    let settings = await FooterSettings.findOne();
    console.log('Existing settings:', settings ? 'Found' : 'Not found');
    
    if (!settings) {
      console.log('📄 Creating new footer settings');
      try {
        settings = new FooterSettings(updateData);
        console.log('✅ New settings created');
      } catch (createError) {
        console.error('❌ Error creating new settings:', createError);
        throw createError;
      }
    } else {
      console.log('📝 Updating existing footer settings');
      try {
        // Deep merge for nested objects
        const mergeDeep = (target: any, source: any) => {
          for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              if (!target[key]) target[key] = {};
              mergeDeep(target[key], source[key]);
            } else {
              target[key] = source[key];
            }
          }
        };
        
        mergeDeep(settings, updateData);
        console.log('✅ Settings merged successfully');
      } catch (mergeError) {
        console.error('❌ Error merging settings:', mergeError);
        throw mergeError;
      }
    }
    
    console.log('💾 Saving settings to database...');
    try {
      await settings.save();
      console.log('✅ Footer settings saved successfully');
    } catch (saveError) {
      console.error('❌ Error saving settings:', saveError);
      throw saveError;
    }
    
    return NextResponse.json(
      { 
        message: 'Footer ayarları başarıyla güncellendi',
        settings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Footer settings update error:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { 
            message: 'Veri doğrulama hatası',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 400 }
        );
      }
      
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        return NextResponse.json(
          { 
            message: 'Veritabanı hatası',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        message: 'Footer ayarları güncellenemedi',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// POST: Footer ayarlarını sıfırla (varsayılan değerlere döndür)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Yetki gerekli' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Mevcut ayarları sil ve yenilerini oluştur
    await FooterSettings.deleteMany({});
    const newSettings = await FooterSettings.create({});
    
    return NextResponse.json(
      { 
        message: 'Footer ayarları varsayılan değerlere sıfırlandı',
        settings: newSettings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Footer settings reset error:', error);
    return NextResponse.json(
      { message: 'Footer ayarları sıfırlanamadı' },
      { status: 500 }
    );
  }
}
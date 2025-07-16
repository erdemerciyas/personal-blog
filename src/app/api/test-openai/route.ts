import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import OpenAI from 'openai';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    // Auth kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    console.log('🔑 Testing OpenAI API key...');

    // Basit bir test prompt ile test et
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: "A simple blue circle",
      n: 1,
      size: "256x256",
      response_format: "url"
    });

    console.log('✅ OpenAI API test successful');

    return NextResponse.json({
      success: true,
      message: 'OpenAI API çalışıyor',
      imageUrl: response.data?.[0]?.url,
      organization: response.data && response.data.length > 0 ? 'OK' : 'No data'
    });

  } catch (error) {
    console.error('❌ OpenAI API test failed:', error);
    
    let errorMessage = 'OpenAI API test başarısız';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'OpenAI API key geçersiz veya yetkisiz';
        statusCode = 401;
      } else if (error.message.includes('insufficient_quota') || error.message.includes('billing')) {
        errorMessage = 'OpenAI hesabında yetersiz kredi';
        statusCode = 402;
      } else if (error.message.includes('rate_limit')) {
        errorMessage = 'Rate limit aşıldı';
        statusCode = 429;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
        success: false
      },
      { status: statusCode }
    );
  }
} 
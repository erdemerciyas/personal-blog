import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongoose';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { generateAIImage } from '@/lib/aiImageGenerator';

// GET /api/services - Tüm servisleri getir
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const services = await db.collection('services').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(services);
  } catch (error) {
    console.error('Servisler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Servisler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/services - Yeni servis ekle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { db } = await connectToDatabase();

    let imageUrl = body.image;
    
    // If no image provided, generate one with AI
    if (!imageUrl || imageUrl.trim() === '') {
      console.log(`Generating AI image for service: ${body.title}`);
      try {
        imageUrl = await generateAIImage(body.title, body.description);
        console.log(`AI image generated successfully: ${imageUrl}`);
      } catch (error) {
        console.error('AI image generation failed, using fallback:', error);
        // AI generation failed, will use fallback image from generateAIImage function
      }
    }

    const serviceData = {
      ...body,
      image: imageUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('services').insertOne(serviceData);
    return NextResponse.json({ ...serviceData, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Servis eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Servis eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
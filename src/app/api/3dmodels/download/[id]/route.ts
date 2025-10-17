import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongoose';
import Portfolio from '../../../../../models/Portfolio';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Model'i portfolio içinde bul
    const portfolio = await Portfolio.findOne({ 'models3D._id': params.id });
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Model bulunamadı' },
        { status: 404 }
      );
    }

    const model = portfolio.models3D.find((m: any) => m._id.toString() === params.id);
    if (!model) {
      return NextResponse.json(
        { error: 'Model bulunamadı' },
        { status: 404 }
      );
    }

    // Model'in downloadable durumunu kontrol et
    if (!model.downloadable) {
      return NextResponse.json(
        { error: 'Bu model indirmeye kapalı' },
        { status: 403 }
      );
    }

    // Model dosyasını fetch et
    const response = await fetch(model.url);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Model dosyası indirilemedi' },
        { status: 500 }
      );
    }

    const buffer = await response.arrayBuffer();
    
    // Content-Type'ı belirle
    let contentType = 'application/octet-stream';
    switch (model.format.toLowerCase()) {
      case 'stl':
        contentType = 'application/sla';
        break;
      case 'obj':
        contentType = 'application/x-tgif';
        break;
      case 'gltf':
        contentType = 'model/gltf+json';
        break;
      case 'glb':
        contentType = 'model/gltf-binary';
        break;
    }

    // Download response'u döndür
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${model.name}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('3D model download error:', error);
    return NextResponse.json(
      { error: 'Dosya indirme hatası' },
      { status: 500 }
    );
  }
}
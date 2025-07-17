import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import About from '../../../../models/About';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    
    let about = await About.findOne();
    
    // If no about data exists, create default data
    if (!about) {
      about = new About({
        heroTitle: 'Merhaba, Ben [Adınız]',
        heroSubtitle: 'Mühendis & 3D Tarama Uzmanı',
        heroDescription: 'Teknoloji ve mühendislik alanında uzmanlaşmış, 3D tarama ve modelleme konularında deneyimli bir profesyonelim.',
        storyTitle: 'Hikayem',
        storyParagraphs: [
          'Mühendislik alanında yılların verdiği deneyimle, teknolojinin sınırlarını zorlayan projeler üzerinde çalışıyorum.',
          '3D tarama ve modelleme teknolojilerinde uzmanlaşarak, müşterilerime en kaliteli hizmeti sunmayı hedefliyorum.'
        ],
        skills: ['3D Tarama', 'CAD Modelleme', 'Proje Yönetimi', 'Teknik Analiz'],
        experience: [
          {
            title: 'Kıdemli Mühendis',
            company: 'Teknoloji Şirketi',
            period: '2020 - Günümüz',
            description: '3D tarama projeleri yönetimi ve teknik danışmanlık hizmetleri.'
          }
        ],
        achievements: [
          '50+ başarılı proje tamamlandı',
          'Sektörde 10+ yıl deneyim',
          'Müşteri memnuniyeti %98'
        ],
        values: [
          {
            text: 'Kalite ve mükemmellik odaklı çalışma',
            iconName: 'SparklesIcon'
          },
          {
            text: 'Müşteri memnuniyeti önceliği',
            iconName: 'CheckIcon'
          }
        ],
        contactTitle: 'Benimle İletişime Geçin',
        contactDescription: 'Projeleriniz hakkında konuşmak için benimle iletişime geçebilirsiniz.',
        contactEmail: 'info@example.com',
        contactPhone: '+90 555 000 00 00',
        contactLocation: 'İstanbul, Türkiye'
      });
      
      await about.save();
    }

    return NextResponse.json(about);
  } catch (error) {
    console.error('About fetch error:', error);
    return NextResponse.json(
      { message: 'Hakkımda verileri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const data = await request.json();

    await connectDB();

    let about = await About.findOne();
    
    if (about) {
      // Update existing
      about = await About.findByIdAndUpdate(about._id, data, { new: true });
    } else {
      // Create new
      about = new About(data);
      await about.save();
    }

    return NextResponse.json(about);
  } catch (error) {
    console.error('About update error:', error);
    return NextResponse.json(
      { message: 'Hakkımda verileri güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
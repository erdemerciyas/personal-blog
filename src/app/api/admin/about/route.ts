import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import About from '../../../../models/About';

// GET /api/admin/about - Get about page content
export async function GET() {
  try {
    await connectDB();
    
    // Get active about record
    let about = await About.findOne({ isActive: true });
    
    // If no record exists, create default one
    if (!about) {
      about = await About.create({
        heroTitle: 'Merhaba, Ben Erdem Erciyas',
        heroSubtitle: 'Developer & Mühendis',
        heroDescription: 'Full-Stack Developer ve Mühendis olarak modern teknolojiler ve yaratıcı çözümlerle projelerinizi hayata geçiriyorum. Hem yazılım hem de mühendislik alanında uzmanım.',
        storyTitle: 'Hikayem',
        storyParagraphs: [
          'Merhaba! Ben Erdem Erciyas, hem yazılım geliştirme hem de mühendislik alanında tutkuyla çalışan bir profesyonelim. 2016 yılından beri teknoloji ve mühendislik projelerinde aktif olarak yer alıyorum.',
          'Modern web teknolojileri ile mühendislik çözümlerini bir araya getirerek, hem dijital hem de fiziksel dünyada yenilikçi projeler geliştiriyorum. Özellikle 3D tasarım, tersine mühendislik ve web uygulamaları konularında uzmanım.',
          'Erciyas Engineering şirketini kurarak, müşterilerime kaliteli ve modern çözümler sunmaya devam ediyorum. Her proje benim için yeni bir öğrenme fırsatı ve yaratıcılık serüveni.'
        ],
        skills: [
          'Next.js & React',
          'TypeScript',
          'Node.js',
          'MongoDB',
          'Tailwind CSS',
          '3D Tasarım',
          'CAD Yazılımları',
          'Mühendislik Çözümleri',
          'Full-Stack Development',
          'UI/UX Design'
        ],
        experience: [
          {
            title: 'Full Stack Developer & Mühendis',
            company: 'Erciyas Engineering',
            period: '2020 - Günümüz',
            description: 'Şirket kurucusu ve lead developer olarak modern web uygulamaları ve mühendislik çözümleri geliştiriyorum.'
          },
          {
            title: 'Senior Software Developer',
            company: 'Teknoloji Şirketleri',
            period: '2018 - 2020',
            description: 'Kurumsal projelerde full-stack geliştirme ve takım liderliği.'
          },
          {
            title: 'Mühendislik Uzmanı',
            company: 'Çeşitli Projeler',
            period: '2016 - 2018',
            description: '3D tasarım, tersine mühendislik ve prototipleme projeleri.'
          }
        ],
        achievements: [
          '50+ Başarılı Proje',
          '100+ Memnun Müşteri',
          '5+ Yıl Deneyim',
          'Modern Teknoloji Stack'
        ],
        values: [
          { text: 'Yenilikçi Çözümler', iconName: 'SparklesIcon' },
          { text: 'Müşteri Memnuniyeti', iconName: 'HeartIcon' },
          { text: 'Kaliteli Çalışma', iconName: 'TrophyIcon' },
          { text: 'Sürekli Öğrenme', iconName: 'AcademicCapIcon' }
        ],
        contactTitle: 'Birlikte Çalışalım',
        contactDescription: 'Yeni bir proje mi planlıyorsunuz? Teknoloji ve mühendislik çözümleri için benimle iletişime geçin.',
        contactEmail: 'erdem@erciyasengineering.com',
        contactPhone: '+90 (555) 123 45 67',
        contactLocation: 'Ankara, Türkiye',
        isActive: true
      });
    }
    
    return NextResponse.json(about);
  } catch (error) {
    console.error('About content fetch error:', error);
    return NextResponse.json(
      { error: 'Hakkımda içeriği getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/about - Update about page content
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkiniz bulunmuyor' },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectDB();
    
    // Find and update active about record
    const about = await About.findOneAndUpdate(
      { isActive: true },
      {
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        heroDescription: data.heroDescription,
        storyTitle: data.storyTitle,
        storyParagraphs: data.storyParagraphs,
        skills: data.skills,
        experience: data.experience,
        achievements: data.achievements,
        values: data.values,
        contactTitle: data.contactTitle,
        contactDescription: data.contactDescription,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        contactLocation: data.contactLocation
      },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      message: 'Hakkımda sayfası başarıyla güncellendi',
      about
    });
    
  } catch (error) {
    console.error('About update error:', error);
    return NextResponse.json(
      { error: 'Hakkımda sayfası güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
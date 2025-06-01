import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './conf.env' });

// Şema tanımlamaları
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
});

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  features: [String],
  createdAt: Date,
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  images: [String],
  technologies: [String],
  completionDate: Date,
  client: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in conf.env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Admin kullanıcısı oluştur
    const hashedPassword = await hash('admin123', 12);
    await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      },
      { upsert: true }
    );

    // Örnek hizmetler
    const services = [
      {
        title: '3D Modelleme ve Tasarım',
        description: 'Endüstriyel ürünler için profesyonel 3D modelleme ve tasarım hizmetleri',
        icon: 'Cube',
        features: [
          'CAD/CAM tasarımları',
          'Tersine mühendislik',
          'Prototip geliştirme',
          'Teknik çizimler',
        ],
        createdAt: new Date(),
      },
      {
        title: 'Yapısal Analiz',
        description: 'Sonlu elemanlar analizi ile yapısal dayanım ve optimizasyon çalışmaları',
        icon: 'ChartBar',
        features: [
          'Statik analiz',
          'Dinamik analiz',
          'Termal analiz',
          'Yorulma analizi',
        ],
        createdAt: new Date(),
      },
      {
        title: 'Otomasyon Sistemleri',
        description: 'Endüstriyel süreçler için özel otomasyon çözümleri',
        icon: 'Cog',
        features: [
          'PLC programlama',
          'SCADA sistemleri',
          'Robot programlama',
          'IoT entegrasyonu',
        ],
        createdAt: new Date(),
      },
    ];

    // Örnek projeler
    const projects = [
      {
        title: 'Otomotiv Parça Optimizasyonu',
        description: 'Hafifletme çalışması ile maliyet optimizasyonu sağlandı',
        category: 'Otomotiv',
        images: ['project1.jpg'],
        technologies: ['CATIA V5', 'ANSYS', 'Solidworks'],
        completionDate: new Date('2024-01-15'),
        client: 'ABC Otomotiv',
      },
      {
        title: 'Endüstriyel Robot Entegrasyonu',
        description: 'Üretim hattı için robot programlama ve entegrasyon',
        category: 'Otomasyon',
        images: ['project2.jpg'],
        technologies: ['ABB RobotStudio', 'PLC', 'SCADA'],
        completionDate: new Date('2024-02-20'),
        client: 'XYZ Üretim',
      },
      {
        title: 'Medikal İmplant Tasarımı',
        description: 'Özel üretim medikal implant tasarımı ve analizi',
        category: 'Medikal',
        images: ['project3.jpg'],
        technologies: ['3D Tarama', 'Geomagic', 'ANSYS'],
        completionDate: new Date('2024-03-10'),
        client: 'Medikal Teknoloji Ltd.',
      },
    ];

    // Verileri ekle
    await Service.deleteMany({}); // Mevcut hizmetleri temizle
    await Service.insertMany(services);

    await Project.deleteMany({}); // Mevcut projeleri temizle
    await Project.insertMany(projects);

    console.log('Örnek veriler başarıyla eklendi');
    console.log('Admin kullanıcısı:');
    console.log('Email: admin@example.com');
    console.log('Şifre: admin123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

seedData(); 
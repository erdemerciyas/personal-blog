const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const sampleServices = [
  {
    title: "Web Tasarım & Geliştirme",
    description: "Modern, responsive ve SEO uyumlu web siteleri tasarımı ve geliştirilmesi. React, Next.js ve modern web teknolojileri kullanılarak projelerinizi hayata geçiriyorum.",
    icon: "🌐",
    features: [
      "Responsive tasarım",
      "SEO optimizasyonu", 
      "Hızlı yüklenme",
      "Modern UI/UX",
      "Mobil uyumlu",
      "Cross-browser desteği"
    ],
    price: {
      type: "project",
      currency: "TRY",
      note: "Proje kapsamına göre"
    },
    category: "Web Development",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "E-Ticaret Çözümleri",
    description: "Güvenli, hızlı ve kullanıcı dostu e-ticaret platformları. Ödeme sistemi entegrasyonu, stok yönetimi ve admin paneli ile komple çözümler.",
    icon: "🛒",
    features: [
      "Güvenli ödeme sistemi",
      "Stok yönetimi",
      "Sipariş takibi",
      "Admin paneli",
      "Çoklu ödeme seçeneği",
      "Mobil uygulamalı"
    ],
    price: {
      type: "project", 
      currency: "TRY",
      note: "15.000₺'den başlayan fiyatlar"
    },
    category: "E-Commerce",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Mobil Uygulama Geliştirme",
    description: "iOS ve Android platformları için native ve cross-platform mobil uygulamalar. React Native ve Flutter teknolojileri ile hızlı ve etkili çözümler.",
    icon: "📱",
    features: [
      "iOS ve Android desteği",
      "Native performans", 
      "Push notification",
      "Offline çalışma",
      "App Store optimizasyonu",
      "Bakım ve destek"
    ],
    price: {
      type: "project",
      currency: "TRY", 
      note: "25.000₺'den başlayan fiyatlar"
    },
    category: "Mobile Development",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "API Geliştirme & Entegrasyon",
    description: "RESTful API'ler, GraphQL servisleri ve üçüncü parti sistem entegrasyonları. Güvenli, ölçeklenebilir ve dokümantasyonlu API çözümleri.",
    icon: "🔌",
    features: [
      "RESTful API tasarımı",
      "GraphQL desteği",
      "Güvenlik protokolleri",
      "API dokümantasyonu",
      "Rate limiting",
      "Monitoring ve analytics"
    ],
    price: {
      type: "hourly",
      amount: 500,
      currency: "TRY"
    },
    category: "Backend Development", 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Database Tasarımı & Optimizasyon",
    description: "MongoDB, PostgreSQL ve MySQL database tasarımı, optimizasyonu ve yönetimi. Performans iyileştirme ve veri migrasyonu hizmetleri.",
    icon: "🗄️",
    features: [
      "Database schema tasarımı",
      "Performans optimizasyonu",
      "Veri migrasyonu",
      "Backup stratejileri",
      "İndeksleme",
      "Query optimizasyonu"
    ],
    price: {
      type: "hourly", 
      amount: 400,
      currency: "TRY"
    },
    category: "Database",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "DevOps & Cloud Çözümleri",
    description: "AWS, Azure ve Google Cloud platformlarında uygulama deployment'ı, CI/CD pipeline kurulumu ve cloud mimarisi tasarımı.",
    icon: "☁️",
    features: [
      "Cloud deployment",
      "CI/CD pipeline",
      "Docker konteynerizasyon",
      "Kubernetes orchestration",
      "Monitoring setup",
      "Security konfigürasyonu"
    ],
    price: {
      type: "project",
      currency: "TRY",
      note: "Proje büyüklüğüne göre"
    },
    category: "DevOps",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function addSampleServices() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db();
    const servicesCollection = db.collection('services');
    
    // Mevcut servisleri kontrol et
    const existingCount = await servicesCollection.countDocuments();
    console.log(`📊 Mevcut hizmet sayısı: ${existingCount}`);
    
    if (existingCount === 0) {
      // Örnek servisleri ekle
      const result = await servicesCollection.insertMany(sampleServices);
      console.log(`🎉 ${result.insertedCount} örnek hizmet başarıyla eklendi!`);
      
      // Eklenen servisleri listele
      console.log('\n📋 Eklenen hizmetler:');
      sampleServices.forEach((service, index) => {
        console.log(`${index + 1}. ${service.title} (${service.category})`);
      });
    } else {
      console.log('ℹ️ Veritabanında zaten hizmetler mevcut, yeni hizmet eklenmedi.');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔐 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
addSampleServices(); 
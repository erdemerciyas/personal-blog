const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// MongoDB bağlantı URL'i
const MONGODB_URI = process.env.MONGODB_URI;

// Varsayılan placeholder resimler
const DEFAULT_IMAGES = {
  portfolio: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
  service: 'https://images.unsplash.com/photo-1581093450029-9dda7351f304?w=800&h=600&fit=crop&crop=center'
};

// Cloudinary URL'sinin geçerli olup olmadığını kontrol et
async function checkCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return false;
  }
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.log(`❌ URL kontrol hatası: ${url}`);
    return false;
  }
}

// Portfolio koleksiyonundaki geçersiz URL'leri temizle
async function cleanPortfolioUrls(db) {
  console.log('🔍 Portfolio koleksiyonu kontrol ediliyor...');
  
  const portfolioCollection = db.collection('portfolios');
  const portfolios = await portfolioCollection.find({}).toArray();
  
  let updatedCount = 0;
  
  for (const portfolio of portfolios) {
    let needsUpdate = false;
    const updates = {};
    
    // Cover image kontrol et
    if (portfolio.coverImage && portfolio.coverImage.includes('cloudinary.com')) {
      const isValid = await checkCloudinaryUrl(portfolio.coverImage);
      if (!isValid) {
        console.log(`❌ Geçersiz cover image: ${portfolio.title} - ${portfolio.coverImage}`);
        updates.coverImage = DEFAULT_IMAGES.portfolio;
        needsUpdate = true;
      }
    }
    
    // Detail images kontrol et
    if (portfolio.images && portfolio.images.length > 0) {
      const validImages = [];
      let hasInvalidImages = false;
      
      for (const image of portfolio.images) {
        if (image && image.includes('cloudinary.com')) {
          const isValid = await checkCloudinaryUrl(image);
          if (isValid) {
            validImages.push(image);
          } else {
            console.log(`❌ Geçersiz detail image: ${portfolio.title} - ${image}`);
            hasInvalidImages = true;
          }
        } else if (image && !image.includes('cloudinary.com')) {
          validImages.push(image);
        }
      }
      
      if (hasInvalidImages) {
        // Geçerli resimler varsa onları kullan, yoksa varsayılan resim ekle
        if (validImages.length === 0) {
          validImages.push(DEFAULT_IMAGES.portfolio);
        }
        updates.images = validImages;
        needsUpdate = true;
      }
    }
    
    // Güncelleme gerekiyorsa
    if (needsUpdate) {
      await portfolioCollection.updateOne(
        { _id: portfolio._id },
        { 
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );
      updatedCount++;
      console.log(`✅ Portfolio güncellendi: ${portfolio.title}`);
    }
  }
  
  console.log(`📊 Portfolio: ${updatedCount} öğe güncellendi`);
  return updatedCount;
}

// Services koleksiyonundaki geçersiz URL'leri temizle
async function cleanServiceUrls(db) {
  console.log('🔍 Services koleksiyonu kontrol ediliyor...');
  
  const servicesCollection = db.collection('services');
  const services = await servicesCollection.find({}).toArray();
  
  let updatedCount = 0;
  
  for (const service of services) {
    let needsUpdate = false;
    const updates = {};
    
    // Service image kontrol et
    if (service.image && service.image.includes('cloudinary.com')) {
      const isValid = await checkCloudinaryUrl(service.image);
      if (!isValid) {
        console.log(`❌ Geçersiz service image: ${service.title} - ${service.image}`);
        updates.image = DEFAULT_IMAGES.service;
        needsUpdate = true;
      }
    }
    
    // Güncelleme gerekiyorsa
    if (needsUpdate) {
      await servicesCollection.updateOne(
        { _id: service._id },
        { 
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );
      updatedCount++;
      console.log(`✅ Service güncellendi: ${service.title}`);
    }
  }
  
  console.log(`📊 Services: ${updatedCount} öğe güncellendi`);
  return updatedCount;
}

// Ana fonksiyon
async function cleanInvalidUrls() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db();
    
    // Portfolio ve Services koleksiyonlarını temizle
    const portfolioUpdates = await cleanPortfolioUrls(db);
    const serviceUpdates = await cleanServiceUrls(db);
    
    console.log('\n🎉 Temizleme işlemi tamamlandı!');
    console.log(`📈 Toplam güncellenen öğe: ${portfolioUpdates + serviceUpdates}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
cleanInvalidUrls(); 
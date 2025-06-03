const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkServices() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const db = client.db();
    const servicesCollection = db.collection('services');
    
    // Tüm servisleri getir
    const allServices = await servicesCollection.find({}).toArray();
    console.log(`📊 Toplam hizmet sayısı: ${allServices.length}`);
    
    // Aktif servisleri say
    const activeServices = allServices.filter(service => service.isActive);
    console.log(`✅ Aktif hizmet sayısı: ${activeServices.length}`);
    
    // Pasif servisleri say
    const inactiveServices = allServices.filter(service => !service.isActive);
    console.log(`❌ Pasif hizmet sayısı: ${inactiveServices.length}`);
    
    console.log('\n📋 Tüm hizmetler:');
    allServices.forEach((service, index) => {
      const status = service.isActive ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${service.title} (${service.category || 'Kategori yok'})`);
    });
    
    // Eğer tüm hizmetler pasifse, hepsini aktif yap
    if (allServices.length > 0 && activeServices.length === 0) {
      console.log('\n🔄 Tüm hizmetler pasif durumda, aktif hale getiriliyor...');
      const updateResult = await servicesCollection.updateMany(
        {},
        { $set: { isActive: true } }
      );
      console.log(`✅ ${updateResult.modifiedCount} hizmet aktif hale getirildi!`);
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔐 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
checkServices(); 
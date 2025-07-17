const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB bağlantı URL'si
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-blog';

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function updateAdmin() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Yeni admin bilgileri
    const newAdminData = {
      name: 'Erdem Erciyas',
      email: 'erdemerciyas@gmail.com',
      password: '6026341',
      role: 'admin'
    };

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newAdminData.password, salt);

    // Mevcut admin kullanıcısını güncelle veya yeni oluştur
    const updatedAdmin = await User.findOneAndUpdate(
      { role: 'admin' }, // Admin rolündeki kullanıcıyı bul
      {
        name: newAdminData.name,
        email: newAdminData.email,
        password: hashedPassword,
        role: newAdminData.role
      },
      { 
        upsert: true, // Yoksa oluştur
        new: true // Güncellenmiş versiyonu döndür
      }
    );

    console.log('✅ Admin kullanıcısı başarıyla güncellendi!');
    console.log('👤 İsim:', newAdminData.name);
    console.log('📧 Email:', newAdminData.email);
    console.log('🔑 Şifre:', newAdminData.password);
    console.log('🆔 ID:', updatedAdmin._id);

    // Şifre testini yap
    const isPasswordValid = await bcrypt.compare(newAdminData.password, updatedAdmin.password);
    console.log('🔐 Şifre testi:', isPasswordValid ? '✅ Doğru' : '❌ Yanlış');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

updateAdmin();
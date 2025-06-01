// Function to generate appropriate image based on service title
export function generateServiceImage(title: string): string {
  const titleLower = title.toLowerCase();
  
  // Common technology/service keywords and their corresponding Unsplash images
  const imageMap: { [key: string]: string } = {
    // 3D & Engineering
    '3d': 'https://images.unsplash.com/photo-1581093450029-9dda7351f304?w=800&h=600&fit=crop&crop=center',
    'tarama': 'https://images.unsplash.com/photo-1581093450029-9dda7351f304?w=800&h=600&fit=crop&crop=center',
    'modelleme': 'https://images.unsplash.com/photo-1581093450029-9dda7351f304?w=800&h=600&fit=crop&crop=center',
    'tersine': 'https://images.unsplash.com/photo-1517077304055-6e89abbf0920?w=800&h=600&fit=crop&crop=center',
    'mühendislik': 'https://images.unsplash.com/photo-1517077304055-6e89abbf0920?w=800&h=600&fit=crop&crop=center',
    'baskı': 'https://images.unsplash.com/photo-1600717535275-0b319a00a8e3?w=800&h=600&fit=crop&crop=center',
    'prototip': 'https://images.unsplash.com/photo-1600717535275-0b319a00a8e3?w=800&h=600&fit=crop&crop=center',
    'imalat': 'https://images.unsplash.com/photo-1565087313905-4bb8b2b3e98c?w=800&h=600&fit=crop&crop=center',
    
    // Web & Software
    'web': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop&crop=center',
    'website': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop&crop=center',
    'yazılım': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center',
    'uygulama': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&crop=center',
    'mobil': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&crop=center',
    'app': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&crop=center',
    
    // Design & Creative
    'tasarım': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=center',
    'grafik': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=center',
    'logo': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop&crop=center',
    'ui': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=center',
    'ux': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=center',
    
    // Business & Consulting
    'danışmanlık': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center',
    'strateji': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center',
    'analiz': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    'proje': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center',
    'yönetim': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center',
    
    // Technology & AI
    'yapay': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center',
    'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center',
    'zeka': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center',
    'otomasyon': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    'robot': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    
    // Marketing & Digital
    'pazarlama': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    'dijital': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    'sosyal': 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&h=600&fit=crop&crop=center',
    'medya': 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&h=600&fit=crop&crop=center',
    
    // Education & Training
    'eğitim': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&crop=center',
    'kurs': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&crop=center',
    'öğretim': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&crop=center',
    'workshop': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&crop=center',
    
    // Security & Network
    'güvenlik': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&crop=center',
    'ağ': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=center',
    'network': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=center',
    'siber': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&crop=center',
    
    // Data & Analytics
    'veri': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    'rapor': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    'istatistik': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    
    // Additional common service terms
    'hizmet': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop&crop=center',
    'servis': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop&crop=center',
    'çözüm': 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop&crop=center',
    'destek': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop&crop=center',
    'bakım': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&crop=center',
    'kurulum': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&crop=center',
    'optimizasyon': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    'test': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center'
  };
  
  // Find matching keyword in title
  for (const [keyword, imageUrl] of Object.entries(imageMap)) {
    if (titleLower.includes(keyword)) {
      return imageUrl;
    }
  }
  
  // Default fallback images for different categories
  const fallbackImages = [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&crop=center', // Technology
    'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop&crop=center', // Business
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center', // Office
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center', // Projects
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center'  // Digital
  ];
  
  // Return a random fallback image based on title hash for consistency
  const titleHash = titleLower.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
  return fallbackImages[titleHash % fallbackImages.length];
} 
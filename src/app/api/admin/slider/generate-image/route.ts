import { NextResponse } from 'next/server';

// POST /api/admin/slider/generate-image - AI ile resim üret
export async function POST(request: Request) {
  try {
    const { prompt, count = 1, provider = 'unsplash' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt gereklidir' }, { status: 400 });
    }

    let images = [];

    switch (provider) {
      case 'unsplash':
        // Unsplash benzeri rastgele profesyonel görseller
        images = Array.from({ length: count }, (_, i) => ({
          id: Date.now() + i,
          url: `https://picsum.photos/1920/1080?random=${Date.now() + i}`,
          title: `Generated Image ${i + 1}`,
          description: prompt,
          provider: 'unsplash'
        }));
        break;

      case 'openai':
        return NextResponse.json({ 
          error: 'OpenAI integration not available' 
        }, { status: 501 });

      case 'custom':
        // Özel görsel servisi (gelecekte)
        images = [{
          id: Date.now(),
          url: `https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1920&h=1080&fit=crop&crop=center`,
          title: 'Custom Generated Image',
          description: prompt,
          provider: 'custom'
        }];
        break;

      default:
        return NextResponse.json({ 
          error: 'Geçersiz sağlayıcı' 
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      images,
      provider,
      prompt,
      count: images.length
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ 
      error: 'Görsel oluşturma sırasında hata oluştu' 
    }, { status: 500 });
  }
}

// Sadece POST metodunu destekle
export async function GET() {
  return NextResponse.json({ message: 'Generate Image API is working' });
}

// OpenAI DALL-E 3 generation - DISABLED for deployment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateWithOpenAI(prompt: string, count: number) {
  console.log('⚠️ OpenAI integration disabled for deployment, using fallback images');
  return null;
}

// Professional images generator for better quality demo images
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateProfessionalImages(prompt: string, count: number) {
  // Keywords to category mapping for better image selection
  const keywordCategories = {
    '3d': 'technology/architecture',
    'teknoloji': 'technology/computer', 
    'mühendislik': 'engineering/industrial',
    'tasarım': 'design/creative',
    'endüstri': 'industrial/manufacturing',
    'modern': 'architecture/modern',
    'gelecek': 'future/sci-fi',
    'iş': 'business/office',
    'proje': 'construction/project'
  };

  // Find best category based on prompt
  let category = 'technology';
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [keyword, cat] of Object.entries(keywordCategories)) {
    if (lowerPrompt.includes(keyword)) {
      category = cat;
      break;
    }
  }

  // Use better image sources for professional look
  const baseSources = [
    `https://source.unsplash.com/1920x1080/?${category}`,
    `https://picsum.photos/1920/1080?random=`,
    `https://source.unsplash.com/1920x1080/?business,technology`,
    `https://source.unsplash.com/1920x1080/?modern,architecture`
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const timestamp = Date.now() + index * 1000;
    const sourceIndex = index % baseSources.length;
    
    return {
      id: `professional-${timestamp}-${index}`,
      url: baseSources[sourceIndex] + (baseSources[sourceIndex].includes('picsum') ? timestamp : ''),
      thumb: `https://picsum.photos/400/300?random=${timestamp}`,
      description: `${prompt} - Professional Image ${index + 1}`,
      photographer: 'Professional Source',
      source: 'professional-demo',
      downloadUrl: baseSources[sourceIndex] + (baseSources[sourceIndex].includes('picsum') ? timestamp : '')
    };
  });
} 
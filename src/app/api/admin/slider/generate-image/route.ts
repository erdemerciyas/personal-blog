import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/admin/slider/generate-image - AI ile resim üret
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prompt, provider = 'imagen3', count = 4 } = body;

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Geçerli bir prompt giriniz (en az 3 karakter)' },
        { status: 400 }
      );
    }

    let results = [];

    switch (provider) {
      case 'imagen3':
        try {
          console.log('🎨 Generating images with Google Imagen 3 for:', prompt);
          
          // Check if we have Google Cloud credentials
          const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;
          const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
          
          if (googleApiKey && projectId) {
            // Google Vertex AI Imagen 3 API call
            const imagenResponse = await fetch(
              `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${googleApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  instances: [
                    {
                      prompt: `Professional high-quality slider image for website: ${prompt}. Style: modern, clean, corporate, high-resolution`,
                    }
                  ],
                  parameters: {
                    sampleCount: Math.min(count, 4), // Imagen 3 supports up to 4 images per request
                    aspectRatio: "16:9", // Perfect for sliders
                    safetyFilterLevel: "block_some",
                    personGeneration: "dont_allow"
                  }
                })
              }
            );

            if (imagenResponse.ok) {
              const imagenData = await imagenResponse.json();
              if (imagenData.predictions && imagenData.predictions.length > 0) {
                console.log('✅ Generated', imagenData.predictions.length, 'images with Imagen 3');
                results = imagenData.predictions.map((prediction: any, index: number) => ({
                  id: `imagen3-${Date.now()}-${index}`,
                  url: `data:image/jpeg;base64,${prediction.bytesBase64Encoded}`,
                  thumb: `data:image/jpeg;base64,${prediction.bytesBase64Encoded}`,
                  description: `${prompt} - AI Generated with Imagen 3`,
                  photographer: 'Google Imagen 3',
                  source: 'imagen3',
                  downloadUrl: `data:image/jpeg;base64,${prediction.bytesBase64Encoded}`
                }));
              } else {
                console.log('⚠️ No Imagen 3 results, using fallback');
                results = await generateWithOpenAI(prompt, count) || generateProfessionalImages(prompt, count);
              }
            } else {
              console.error('❌ Imagen 3 API error:', imagenResponse.status);
              results = await generateWithOpenAI(prompt, count) || generateProfessionalImages(prompt, count);
            }
          } else {
            console.log('⚠️ No Google Cloud credentials, trying OpenAI');
            results = await generateWithOpenAI(prompt, count) || generateProfessionalImages(prompt, count);
          }
        } catch (error) {
          console.error('❌ Imagen 3 error:', error);
          results = await generateWithOpenAI(prompt, count) || generateProfessionalImages(prompt, count);
        }
        break;

      case 'openai':
        results = await generateWithOpenAI(prompt, count) || generateProfessionalImages(prompt, count);
        break;

      case 'unsplash':
        try {
          // Check if we have Unsplash API key
          const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
          
          if (unsplashKey && unsplashKey !== 'demo-key') {
            console.log('🔍 Searching Unsplash for:', prompt);
            
            // Unsplash API kullanarak resim arama
            const unsplashResponse = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt)}&per_page=${count}&orientation=landscape&order_by=relevant`,
              {
                headers: {
                  'Authorization': `Client-ID ${unsplashKey}`
                }
              }
            );

            if (unsplashResponse.ok) {
              const unsplashData = await unsplashResponse.json();
              if (unsplashData.results && unsplashData.results.length > 0) {
                console.log('✅ Found', unsplashData.results.length, 'Unsplash images');
                results = unsplashData.results.map((photo: any) => ({
                  id: photo.id,
                  url: photo.urls.regular,
                  thumb: photo.urls.thumb,
                  description: photo.alt_description || photo.description || `${prompt} - Professional Image`,
                  photographer: photo.user.name,
                  source: 'unsplash',
                  downloadUrl: photo.links.download
                }));
              } else {
                console.log('⚠️ No Unsplash results found, using professional demo images');
                results = generateProfessionalImages(prompt, count);
              }
            } else {
              console.error('❌ Unsplash API error:', unsplashResponse.status);
              results = generateProfessionalImages(prompt, count);
            }
          } else {
            console.log('⚠️ No Unsplash API key, using professional demo images');
            results = generateProfessionalImages(prompt, count);
          }
        } catch (error) {
          console.error('❌ Unsplash API error:', error);
          results = generateProfessionalImages(prompt, count);
        }
        break;

      default:
        results = generateProfessionalImages(prompt, count);
    }

    console.log('🎯 Generated', results.length, 'images for prompt:', prompt);

    return NextResponse.json({
      prompt,
      provider,
      count: results.length,
      images: results
    });

  } catch (error) {
    console.error('❌ Error generating images:', error);
    return NextResponse.json(
      { error: 'Resim üretilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// OpenAI DALL-E 3 generation - DISABLED for deployment
async function generateWithOpenAI(prompt: string, count: number) {
  console.log('⚠️ OpenAI integration disabled for deployment, using fallback images');
  return null;
}

// Professional images generator for better quality demo images
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
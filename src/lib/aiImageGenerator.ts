import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIImage(title: string, description?: string): Promise<string> {
  try {
    // Create a detailed prompt based on the service title and description
    let prompt = `Create a professional, modern, high-quality image for a service titled "${title}".`;
    
    if (description) {
      prompt += ` The service is described as: "${description.slice(0, 200)}".`;
    }
    
    // Add style guidelines
    prompt += ` The image should be:
    - Professional and business-oriented
    - Clean and modern design
    - Suitable for a technology/engineering company website
    - High contrast and visually appealing
    - No text or writing in the image
    - Focus on relevant technology, tools, or concepts
    - 16:9 aspect ratio
    - Bright and engaging colors`;

    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    // Return the generated image URL
    if (response.data && response.data[0] && response.data[0].url) {
      return response.data[0].url;
    } else {
      throw new Error('No image URL received from OpenAI');
    }
  } catch (error) {
    console.error('AI image generation failed:', error);
    
    // Fallback to a default tech image if AI generation fails
    return generateFallbackImage(title);
  }
}

// Fallback function that returns a relevant tech image from Unsplash
function generateFallbackImage(title: string): string {
  const titleLower = title.toLowerCase();
  
  // Technology-focused keywords and their corresponding images
  const techImageMap: { [key: string]: string } = {
    // AI & Technology
    'yapay': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center',
    'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center',
    'zeka': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center',
    'teknoloji': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&crop=center',
    
    // 3D & Engineering
    '3d': 'https://images.unsplash.com/photo-1581093450029-9dda7351f304?w=800&h=600&fit=crop&crop=center',
    'tarama': 'https://images.unsplash.com/photo-1581093450029-9dda7351f304?w=800&h=600&fit=crop&crop=center',
    'modelleme': 'https://images.unsplash.com/photo-1581093450029-9dda7351f304?w=800&h=600&fit=crop&crop=center',
    'mühendislik': 'https://images.unsplash.com/photo-1517077304055-6e89abbf0920?w=800&h=600&fit=crop&crop=center',
    'baskı': 'https://images.unsplash.com/photo-1600717535275-0b319a00a8e3?w=800&h=600&fit=crop&crop=center',
    'prototip': 'https://images.unsplash.com/photo-1600717535275-0b319a00a8e3?w=800&h=600&fit=crop&crop=center',
    
    // Software & Web
    'yazılım': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center',
    'web': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop&crop=center',
    'uygulama': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&crop=center',
    'mobil': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&crop=center',
    
    // Design & Creative
    'tasarım': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=center',
    'grafik': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=center',
    'ui': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=center',
    'ux': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=center',
    
    // Business & Consulting
    'danışmanlık': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center',
    'analiz': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    'veri': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
  };
  
  // Find matching keyword
  for (const [keyword, imageUrl] of Object.entries(techImageMap)) {
    if (titleLower.includes(keyword)) {
      return imageUrl;
    }
  }
  
  // Default technology image
  return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&crop=center';
} 
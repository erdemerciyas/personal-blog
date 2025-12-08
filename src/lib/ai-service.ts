import { logger } from './logger';
import { AIMetadataGenerationRequest, AIMetadataGenerationResponse, Language } from '@/types/news';

/**
 * AI Service for metadata generation
 * Uses OpenAI API for intelligent content generation
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generate metadata from content using AI
 */
export async function generateMetadata(
  request: AIMetadataGenerationRequest
): Promise<AIMetadataGenerationResponse> {
  if (!OPENAI_API_KEY) {
    logger.error('OpenAI API key not configured', 'AI_SERVICE');
    throw new Error('AI service not configured');
  }

  try {
    const { content, language } = request;

    // Validate input
    if (!content || content.length < 100) {
      throw new Error('Content must be at least 100 characters');
    }

    if (content.length > 5000) {
      throw new Error('Content must not exceed 5000 characters');
    }

    // Prepare prompts based on language
    const prompts = getPrompts(language);

    // Generate title
    const title = await generateWithAI(
      `${prompts.titlePrompt}\n\nContent:\n${content}`,
      'title'
    );

    // Generate meta description
    const metaDescription = await generateWithAI(
      `${prompts.descriptionPrompt}\n\nContent:\n${content}`,
      'description'
    );

    // Generate excerpt
    const excerpt = await generateWithAI(
      `${prompts.excerptPrompt}\n\nContent:\n${content}`,
      'excerpt'
    );

    // Generate keywords
    const keywordsText = await generateWithAI(
      `${prompts.keywordsPrompt}\n\nContent:\n${content}`,
      'keywords'
    );

    const keywords = parseKeywords(keywordsText);

    logger.info('Metadata generated successfully', 'AI_SERVICE', {
      language,
      contentLength: content.length,
    });

    return {
      title: title.trim(),
      metaDescription: metaDescription.trim().slice(0, 160),
      excerpt: excerpt.trim().slice(0, 150),
      keywords,
    };
  } catch (error) {
    logger.error('Error generating metadata', 'AI_SERVICE', { error });
    throw error;
  }
}

/**
 * Call OpenAI API
 */
async function generateWithAI(prompt: string, type: string): Promise<string> {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates SEO-optimized content metadata.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('OpenAI API error', 'AI_SERVICE', { error, type });
      throw new Error(`OpenAI API error: ${error.error?.message}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return content;
  } catch (error) {
    logger.error('Error calling OpenAI API', 'AI_SERVICE', { error, type });
    throw error;
  }
}

/**
 * Get language-specific prompts
 */
function getPrompts(language: Language) {
  if (language === 'tr') {
    return {
      titlePrompt:
        'Aşağıdaki içeriğin başlığını oluştur. Başlık 3-200 karakter arasında olmalı, SEO uyumlu ve çekici olmalı. Sadece başlığı döndür, başka bir şey yazma.',
      descriptionPrompt:
        'Aşağıdaki içeriğin meta açıklamasını oluştur. Açıklama 160 karakterden az olmalı, SEO uyumlu ve içeriği özetlemeli. Sadece açıklamayı döndür.',
      excerptPrompt:
        'Aşağıdaki içeriğin kısa özetini oluştur. Özet 150 karakterden az olmalı ve içeriğin ana noktasını vurgulayabilir. Sadece özeti döndür.',
      keywordsPrompt:
        'Aşağıdaki içeriğin en önemli 5-10 anahtar kelimesini çıkar. Anahtar kelimeleri virgülle ayırarak döndür. Sadece anahtar kelimeleri döndür.',
    };
  } else {
    return {
      titlePrompt:
        'Create a title for the following content. The title should be between 3-200 characters, SEO-friendly and engaging. Return only the title, nothing else.',
      descriptionPrompt:
        'Create a meta description for the following content. The description should be less than 160 characters, SEO-friendly and summarize the content. Return only the description.',
      excerptPrompt:
        'Create a brief summary of the following content. The summary should be less than 150 characters and highlight the main points. Return only the summary.',
      keywordsPrompt:
        'Extract the 5-10 most important keywords from the following content. Return keywords separated by commas. Return only the keywords.',
    };
  }
}

/**
 * Parse keywords from AI response
 */
function parseKeywords(text: string): string[] {
  return text
    .split(',')
    .map((keyword) => keyword.trim().toLowerCase())
    .filter((keyword) => keyword.length > 0 && keyword.length < 50)
    .slice(0, 10);
}

/**
 * Generate alt text for images
 */
export async function generateAltText(
  filename: string,
  context?: string
): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      // Fallback: generate from filename
      return filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
    }

    const prompt = context
      ? `Generate a descriptive alt text for an image in the context of: "${context}". The alt text should be concise (under 125 characters) and descriptive. Return only the alt text.`
      : `Generate a descriptive alt text for an image with filename: "${filename}". The alt text should be concise (under 125 characters) and descriptive. Return only the alt text.`;

    const altText = await generateWithAI(prompt, 'alt-text');
    return altText.trim().slice(0, 125);
  } catch (error) {
    logger.warn('Error generating alt text with AI, using fallback', 'AI_SERVICE', { error });
    // Fallback to filename-based generation
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  }
}

/**
 * Validate metadata constraints
 */
export function validateMetadata(metadata: AIMetadataGenerationResponse): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.length < 3 || metadata.title.length > 200) {
    errors.push('Title must be between 3 and 200 characters');
  }

  if (!metadata.metaDescription || metadata.metaDescription.length > 160) {
    errors.push('Meta description must not exceed 160 characters');
  }

  if (!metadata.excerpt || metadata.excerpt.length > 150) {
    errors.push('Excerpt must not exceed 150 characters');
  }

  if (!metadata.keywords || metadata.keywords.length === 0 || metadata.keywords.length > 10) {
    errors.push('Keywords must be between 1 and 10 items');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

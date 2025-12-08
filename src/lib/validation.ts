import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Server-side DOMPurify setup
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as Window & typeof globalThis);

// Input validation schemas
export const ValidationSchemas = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]{2,50}$/,
  phone: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  mongoId: /^[0-9a-fA-F]{24}$/,
};

// Validation functions
export class Validator {
  static isEmail(email: string): boolean {
    return ValidationSchemas.email.test(email.trim());
  }

  static isStrongPassword(password: string): boolean {
    return ValidationSchemas.password.test(password);
  }

  static isValidName(name: string): boolean {
    return ValidationSchemas.name.test(name.trim());
  }

  static isValidPhone(phone: string): boolean {
    return ValidationSchemas.phone.test(phone.replace(/\s/g, ''));
  }

  static isValidUrl(url: string): boolean {
    return ValidationSchemas.url.test(url.trim());
  }

  static isValidSlug(slug: string): boolean {
    return ValidationSchemas.slug.test(slug.trim());
  }

  static isValidMongoId(id: string): boolean {
    return ValidationSchemas.mongoId.test(id.trim());
  }

  static isValidLength(text: string, min: number, max: number): boolean {
    const length = text.trim().length;
    return length >= min && length <= max;
  }

  static containsOnlyAllowedChars(text: string, allowedPattern: RegExp): boolean {
    return allowedPattern.test(text);
  }
}

// Sanitization functions
export class Sanitizer {
  static sanitizeHtml(html: string, allowedTags?: string[]): string {
    const defaultAllowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const tags = allowedTags || defaultAllowedTags;

    return purify.sanitize(html, {
      ALLOWED_TAGS: tags,
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
    });
  }

  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .slice(0, 10000); // Limit length
  }

  static sanitizeEmail(email: string): string {
    return email
      .trim()
      .toLowerCase()
      .replace(/[^\w@.-]/g, '') // Only allow word chars, @, ., -
      .slice(0, 254); // RFC 5321 limit
  }

  static sanitizeUrl(url: string): string {
    const sanitized = url.trim();

    // Only allow http/https protocols
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      return '';
    }

    try {
      const urlObj = new URL(sanitized);
      // Block dangerous protocols and localhost
      if (['javascript:', 'data:', 'vbscript:', 'file:'].some(proto =>
        urlObj.protocol.toLowerCase().includes(proto))) {
        return '';
      }

      // Block localhost and private IPs in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = urlObj.hostname.toLowerCase();
        if (hostname === 'localhost' ||
          hostname.startsWith('127.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
          return '';
        }
      }

      return urlObj.toString();
    } catch {
      return '';
    }
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .trim()
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .slice(0, 255); // Limit filename length
  }
}

// Request validation middleware
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'mongoId';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  allowedValues?: unknown[];
}

export class RequestValidator {
  static validate(data: Record<string, unknown>, rules: ValidationRule[]): { isValid: boolean; errors: string[]; sanitizedData: Record<string, unknown> } {
    const errors: string[] = [];
    const sanitizedData: Record<string, unknown> = {};

    for (const rule of rules) {
      const value = data[rule.field];

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip validation if field is not required and empty
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      let processedValue = value;

      // Type validation and sanitization
      switch (rule.type) {
        case 'email':
          if (!Validator.isEmail(String(value))) {
            errors.push(`${rule.field} must be a valid email`);
          }
          processedValue = rule.sanitize ? Sanitizer.sanitizeEmail(String(value)) : value;
          break;

        case 'url':
          if (!Validator.isValidUrl(String(value))) {
            errors.push(`${rule.field} must be a valid URL`);
          }
          processedValue = rule.sanitize ? Sanitizer.sanitizeUrl(String(value)) : value;
          break;

        case 'mongoId':
          if (!Validator.isValidMongoId(String(value))) {
            errors.push(`${rule.field} must be a valid ID`);
          }
          break;

        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${rule.field} must be a string`);
          }
          processedValue = rule.sanitize ? Sanitizer.sanitizeText(String(value)) : value;
          break;

        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${rule.field} must be a number`);
          }
          processedValue = Number(value);
          break;

        case 'boolean':
          processedValue = Boolean(value);
          break;
      }

      // Length validation
      if (rule.minLength && typeof processedValue === 'string' && processedValue.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
      }

      if (rule.maxLength && typeof processedValue === 'string' && processedValue.length > rule.maxLength) {
        errors.push(`${rule.field} must be no more than ${rule.maxLength} characters`);
      }

      // Pattern validation
      if (rule.pattern && typeof processedValue === 'string' && !rule.pattern.test(processedValue)) {
        errors.push(`${rule.field} format is invalid`);
      }

      // Allowed values validation
      if (rule.allowedValues && !rule.allowedValues.includes(processedValue)) {
        errors.push(`${rule.field} must be one of: ${rule.allowedValues.join(', ')}`);
      }

      sanitizedData[rule.field] = processedValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }
}

// Common validation rules
export const CommonValidationRules = {
  user: {
    create: [
      { field: 'name', required: true, type: 'string' as const, minLength: 2, maxLength: 50, sanitize: true },
      { field: 'email', required: true, type: 'email' as const, sanitize: true },
      { field: 'password', required: true, type: 'string' as const, minLength: 8, maxLength: 128 },
      { field: 'role', required: false, type: 'string' as const, allowedValues: ['admin', 'user'] }
    ],
    update: [
      { field: 'name', required: false, type: 'string' as const, minLength: 2, maxLength: 50, sanitize: true },
      { field: 'email', required: false, type: 'email' as const, sanitize: true },
      { field: 'role', required: false, type: 'string' as const, allowedValues: ['admin', 'user'] }
    ]
  },

  contact: [
    { field: 'name', required: true, type: 'string' as const, minLength: 2, maxLength: 100, sanitize: true },
    { field: 'email', required: true, type: 'email' as const, sanitize: true },
    { field: 'subject', required: true, type: 'string' as const, minLength: 5, maxLength: 200, sanitize: true },
    { field: 'message', required: true, type: 'string' as const, minLength: 10, maxLength: 2000, sanitize: true }
  ],

  portfolio: {
    create: [
      { field: 'title', required: true, type: 'string' as const, minLength: 3, maxLength: 200, sanitize: true },
      { field: 'description', required: true, type: 'string' as const, minLength: 10, maxLength: 5000, sanitize: true },
      { field: 'client', required: true, type: 'string' as const, minLength: 2, maxLength: 100, sanitize: true },
      { field: 'coverImage', required: true, type: 'url' as const, sanitize: true },
      { field: 'categoryId', required: false, type: 'mongoId' as const }
    ]
  },

  service: {
    create: [
      { field: 'title', required: true, type: 'string' as const, minLength: 3, maxLength: 200, sanitize: true },
      { field: 'description', required: true, type: 'string' as const, minLength: 10, maxLength: 5000, sanitize: true },
      { field: 'image', required: true, type: 'url' as const, sanitize: true }
    ]
  }
};

// News validation functions
export function validateNewsInput(data: any): { valid: boolean; error?: string } {
  if (!data) {
    return { valid: false, error: 'Request body is required' };
  }

  // Validate translations
  if (!data.translations || typeof data.translations !== 'object') {
    return { valid: false, error: 'Translations object is required' };
  }

  // At least one language must be provided with complete data
  const languages = ['tr', 'es'];
  let hasAtLeastOneLanguage = false;

  for (const lang of languages) {
    const translation = data.translations[lang];

    // Skip if translation is not provided or empty
    if (!translation || typeof translation !== 'object') {
      continue;
    }

    // Check if this language has at least title and content
    const hasTitle = translation.title && typeof translation.title === 'string' && translation.title.trim().length > 0;
    const hasContent = translation.content && typeof translation.content === 'string' && translation.content.trim().length > 0;

    if (hasTitle && hasContent) {
      hasAtLeastOneLanguage = true;
    }

    // Validate only if translation fields are provided
    if (translation.title && typeof translation.title !== 'string') {
      return { valid: false, error: `${lang.toUpperCase()} title must be a string` };
    }

    if (translation.title && translation.title.trim().length > 0 && (translation.title.length < 3 || translation.title.length > 200)) {
      return { valid: false, error: `${lang.toUpperCase()} title must be between 3 and 200 characters` };
    }

    if (translation.content && typeof translation.content !== 'string') {
      return { valid: false, error: `${lang.toUpperCase()} content must be a string` };
    }

    if (translation.content && translation.content.trim().length > 0) {
      // Strip HTML tags for length validation
      const plainText = translation.content.replace(/<[^>]*>/g, '').trim();
      if (plainText.length < 100) {
        return { valid: false, error: `${lang.toUpperCase()} content must be at least 100 characters` };
      }
    }

    if (translation.excerpt && typeof translation.excerpt !== 'string') {
      return { valid: false, error: `${lang.toUpperCase()} excerpt must be a string` };
    }

    if (translation.excerpt && translation.excerpt.length > 150) {
      return { valid: false, error: `${lang.toUpperCase()} excerpt must not exceed 150 characters` };
    }

    if (translation.metaDescription && typeof translation.metaDescription !== 'string') {
      return { valid: false, error: `${lang.toUpperCase()} meta description must be a string` };
    }

    if (translation.metaDescription && translation.metaDescription.length > 160) {
      return { valid: false, error: `${lang.toUpperCase()} meta description must not exceed 160 characters` };
    }

    if (translation.keywords && !Array.isArray(translation.keywords)) {
      return { valid: false, error: `${lang.toUpperCase()} keywords must be an array` };
    }

    if (translation.keywords && translation.keywords.length > 10) {
      return { valid: false, error: `${lang.toUpperCase()} keywords must not exceed 10 items` };
    }
  }

  if (!hasAtLeastOneLanguage) {
    return { valid: false, error: 'At least one language translation with title and content is required' };
  }

  // Validate featuredImage only if publishing
  if (data.status === 'published') {
    if (!data.featuredImage || typeof data.featuredImage !== 'object') {
      return { valid: false, error: 'Featured image is required for publishing' };
    }

    if (!data.featuredImage.url || typeof data.featuredImage.url !== 'string') {
      return { valid: false, error: 'Featured image URL is required for publishing' };
    }

    if (!data.featuredImage.altText || typeof data.featuredImage.altText !== 'string') {
      return { valid: false, error: 'Featured image alt text is required for publishing' };
    }

    if (!data.featuredImage.cloudinaryPublicId || typeof data.featuredImage.cloudinaryPublicId !== 'string') {
      return { valid: false, error: 'Cloudinary public ID is required for publishing' };
    }
  }

  // Validate optional fields
  if (data.tags && !Array.isArray(data.tags)) {
    return { valid: false, error: 'Tags must be an array' };
  }

  if (data.relatedPortfolioIds && !Array.isArray(data.relatedPortfolioIds)) {
    return { valid: false, error: 'Related portfolio IDs must be an array' };
  }

  if (data.relatedNewsIds && !Array.isArray(data.relatedNewsIds)) {
    return { valid: false, error: 'Related news IDs must be an array' };
  }

  return { valid: true };
}

export function validateNewsUpdateInput(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  // Validate translations if provided
  if (data.translations) {
    if (typeof data.translations !== 'object') {
      return { valid: false, error: 'Translations must be an object' };
    }

    const languages = ['tr', 'es'];
    for (const lang of languages) {
      const translation = data.translations[lang];

      if (!translation) continue;

      if (translation.title && (translation.title.length < 3 || translation.title.length > 200)) {
        return { valid: false, error: `${lang.toUpperCase()} title must be between 3 and 200 characters` };
      }

      if (translation.content) {
        // Strip HTML tags for length validation
        const plainText = translation.content.replace(/<[^>]*>/g, '').trim();
        if (plainText.length < 100) {
          return { valid: false, error: `${lang.toUpperCase()} content must be at least 100 characters` };
        }
      }

      if (translation.excerpt && translation.excerpt.length > 150) {
        return { valid: false, error: `${lang.toUpperCase()} excerpt must not exceed 150 characters` };
      }

      if (translation.metaDescription && translation.metaDescription.length > 160) {
        return { valid: false, error: `${lang.toUpperCase()} meta description must not exceed 160 characters` };
      }

      if (translation.keywords && !Array.isArray(translation.keywords)) {
        return { valid: false, error: `${lang.toUpperCase()} keywords must be an array` };
      }

      if (translation.keywords && translation.keywords.length > 10) {
        return { valid: false, error: `${lang.toUpperCase()} keywords must not exceed 10 items` };
      }
    }
  }

  // Validate status if provided
  if (data.status && !['draft', 'published'].includes(data.status)) {
    return { valid: false, error: 'Status must be either "draft" or "published"' };
  }

  // Validate featured image if provided
  if (data.featuredImage) {
    if (typeof data.featuredImage !== 'object') {
      return { valid: false, error: 'Featured image must be an object' };
    }

    if (data.featuredImage.url && typeof data.featuredImage.url !== 'string') {
      return { valid: false, error: 'Featured image URL must be a string' };
    }

    if (data.featuredImage.altText && typeof data.featuredImage.altText !== 'string') {
      return { valid: false, error: 'Featured image alt text must be a string' };
    }
  }

  // Validate optional arrays
  if (data.tags && !Array.isArray(data.tags)) {
    return { valid: false, error: 'Tags must be an array' };
  }

  if (data.relatedPortfolioIds && !Array.isArray(data.relatedPortfolioIds)) {
    return { valid: false, error: 'Related portfolio IDs must be an array' };
  }

  if (data.relatedNewsIds && !Array.isArray(data.relatedNewsIds)) {
    return { valid: false, error: 'Related news IDs must be an array' };
  }

  return { valid: true };
}
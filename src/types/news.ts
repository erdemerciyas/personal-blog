/**
 * News Module Type Definitions
 */

export type Language = 'tr' | 'es';

export interface NewsTranslation {
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
}

export interface NewsTranslations {
  tr: NewsTranslation;
  es: NewsTranslation;
}

export interface FeaturedImage {
  url: string;
  altText: string;
  cloudinaryPublicId: string;
}

export interface NewsAuthor {
  id: string;
  name: string;
  email: string;
}

export interface NewsItem {
  _id?: string;
  slug: string;
  status: 'draft' | 'published';
  translations: NewsTranslations;
  featuredImage: FeaturedImage;
  relatedPortfolioIds: string[];
  relatedNewsIds: string[];
  tags: string[];
  author: NewsAuthor;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CreateNewsInput {
  translations: NewsTranslations;
  featuredImage: FeaturedImage;
  status?: 'draft' | 'published';
  tags?: string[];
  relatedPortfolioIds?: string[];
  relatedNewsIds?: string[];
}

export interface UpdateNewsInput {
  translations?: Partial<NewsTranslations>;
  featuredImage?: Partial<FeaturedImage>;
  status?: 'draft' | 'published';
  tags?: string[];
  relatedPortfolioIds?: string[];
  relatedNewsIds?: string[];
}

export interface NewsListQuery {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'publishedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface NewsListResponse {
  items: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  uploadPreset: string;
}

export interface AIMetadataGenerationRequest {
  content: string;
  language: Language;
}

export interface AIMetadataGenerationResponse {
  title: string;
  metaDescription: string;
  excerpt: string;
  keywords: string[];
}

export interface BulkActionRequest {
  ids: string[];
  action: 'publish' | 'unpublish' | 'delete';
}

export interface BulkActionResponse {
  success: boolean;
  updated: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

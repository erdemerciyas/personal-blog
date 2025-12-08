# Design Document - News Module

## Overview

The News Module is a comprehensive content management system designed to enable administrators to create, manage, and publish multilingual news articles with advanced features including AI-assisted metadata generation, Cloudinary image integration, SEO optimization, and responsive frontend presentation. The system is built on Next.js 14 with TypeScript, MongoDB for data persistence, and integrates with OpenAI for intelligent content generation.

The module provides:
- **Admin Interface**: CRUD operations for news management with multilingual support
- **Frontend Components**: Responsive carousel and detail pages with SEO optimization
- **AI Integration**: Automated metadata, keyword, and excerpt generation
- **Content Relationships**: Linking news to portfolio items and other content
- **Multilingual Support**: Turkish and Spanish language routing and content management
- **Performance Optimization**: ISR caching, image optimization via Cloudinary, and efficient database queries

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  • Homepage News Carousel (Embla/Swiper)                    │
│  • News Detail Pages (/tr/haberler/[slug])                  │
│  • Language Routing (/es/noticias/[slug])                   │
│  • SEO Meta Tags & JSON-LD Schema                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    API Layer                                 │
├─────────────────────────────────────────────────────────────┤
│  • POST /api/news (Create)                                  │
│  • GET /api/news (List with pagination)                     │
│  • GET /api/news/:slug (Detail)                             │
│  • PUT /api/news/:id (Update)                               │
│  • DELETE /api/news/:id (Delete)                            │
│  • POST /api/news/bulk-action (Bulk operations)             │
│  • POST /api/ai/generate-metadata (AI generation)           │
│  • POST /api/admin/upload (Image upload via Cloudinary)     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Business Logic Layer                        │
├─────────────────────────────────────────────────────────────┤
│  • News Service (CRUD, validation, relationships)           │
│  • AI Service (Metadata generation, keyword extraction)     │
│  • Image Service (Cloudinary integration, optimization)     │
│  • SEO Service (Sitemap generation, schema markup)          │
│  • Cache Service (ISR revalidation, data caching)           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Data Layer                                 │
├─────────────────────────────────────────────────────────────┤
│  • MongoDB News Collection                                  │
│  • Mongoose Schema & Validation                             │
│  • Database Indexes (slug, status, createdAt)               │
│  • Relationship Management (Portfolio, References)          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Create News**: Admin → Form → Validation → AI Generation (optional) → Cloudinary Upload → MongoDB → ISR Revalidation
2. **Read News**: Frontend → API → MongoDB Query → Cache (60s) → Response
3. **Update News**: Admin → Form → Validation → MongoDB Update → ISR Revalidation
4. **Delete News**: Admin → Confirmation → MongoDB Delete → Sitemap Update → ISR Revalidation

## Components and Interfaces

### Frontend Components

#### 1. NewsCarousel Component
```typescript
interface NewsCarouselProps {
  language: 'tr' | 'es';
  limit?: number;
  autoplay?: boolean;
}

// Features:
// - Responsive (1 slide mobile, 3 slides desktop)
// - Lazy-loaded images via Cloudinary
// - Touch/swipe navigation
// - Keyboard navigation
// - Accessibility (ARIA labels)
```

#### 2. NewsDetailPage Component
```typescript
interface NewsDetailPageProps {
  slug: string;
  language: 'tr' | 'es';
}

// Features:
// - Server-side rendering
// - SEO meta tags
// - JSON-LD NewsArticle schema
// - Related news/portfolio display
// - Social sharing buttons
```

#### 3. NewsListPage Component
```typescript
interface NewsListPageProps {
  language: 'tr' | 'es';
  page?: number;
  limit?: number;
}

// Features:
// - Pagination
// - Search/filter
// - Language switching
```

### Admin Components

#### 1. NewsForm Component
```typescript
interface NewsFormProps {
  initialData?: NewsItem;
  onSubmit: (data: NewsItem) => Promise<void>;
  isLoading?: boolean;
}

// Features:
// - Multilingual input (TR/ES)
// - WYSIWYG editor (TipTap)
// - Cloudinary image upload
// - AI metadata generation
// - Related content selector
// - Status management (draft/published)
```

#### 2. NewsList Component
```typescript
interface NewsListProps {
  language?: 'tr' | 'es';
  page?: number;
}

// Features:
// - Pagination
// - Search
// - Filters (status, date range)
// - Bulk selection
// - Bulk actions (publish, delete)
```

### API Interfaces

#### News Item Schema
```typescript
interface NewsItem {
  _id: ObjectId;
  slug: string;
  status: 'draft' | 'published';
  translations: {
    tr: {
      title: string;
      content: string;
      excerpt: string;
      metaDescription: string;
      keywords: string[];
    };
    es: {
      title: string;
      content: string;
      excerpt: string;
      metaDescription: string;
      keywords: string[];
    };
  };
  featuredImage: {
    url: string;
    altText: string;
    cloudinaryPublicId: string;
  };
  relatedPortfolioIds: ObjectId[];
  relatedNewsIds: ObjectId[];
  tags: string[];
  author: {
    id: ObjectId;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

#### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Data Models

### MongoDB News Schema

```typescript
const newsSchema = new Schema({
  slug: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true,
  },
  translations: {
    tr: {
      title: { type: String, required: true },
      content: { type: String, required: true },
      excerpt: { type: String, required: true },
      metaDescription: { type: String, required: true },
      keywords: [String],
    },
    es: {
      title: { type: String, required: true },
      content: { type: String, required: true },
      excerpt: { type: String, required: true },
      metaDescription: { type: String, required: true },
      keywords: [String],
    },
  },
  featuredImage: {
    url: { type: String, required: true },
    altText: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
  },
  relatedPortfolioIds: [
    { type: Schema.Types.ObjectId, ref: 'Portfolio' }
  ],
  relatedNewsIds: [
    { type: Schema.Types.ObjectId, ref: 'News' }
  ],
  tags: [String],
  author: {
    id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
});

// Indexes for performance
newsSchema.index({ slug: 1 });
newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ createdAt: -1 });
newsSchema.index({ tags: 1 });
```

### Relationships

- **News → Portfolio**: One-to-many relationship via `relatedPortfolioIds`
- **News → News**: Many-to-many relationship via `relatedNewsIds`
- **News → User**: Many-to-one relationship via `author.id`

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Multilingual Content Acceptance
*For any* news article creation request with valid Turkish and Spanish content, the system should accept and store both language versions separately in the database.
**Validates: Requirements 1.2**

### Property 2: Slug Generation and Uniqueness
*For any* news article with a title, the system should generate a URL-friendly slug from the title, and the slug should be unique across all news articles in the database.
**Validates: Requirements 1.3**

### Property 3: Creation Timestamp Preservation
*For any* news article that is edited, the system should preserve the original `createdAt` timestamp while updating the `updatedAt` timestamp.
**Validates: Requirements 1.4**

### Property 4: Deletion and Access Prevention
*For any* deleted news article, the system should remove it from the database and return a 404 error when attempting to access its detail page.
**Validates: Requirements 1.5**

### Property 5: Cloudinary URL Storage
*For any* image uploaded through the admin panel, the system should send it to Cloudinary and store the returned public URL in the news article.
**Validates: Requirements 2.1**

### Property 6: Image Format Validation
*For any* file upload attempt, the system should only accept JPEG, PNG, and WebP formats and reject all other file types.
**Validates: Requirements 2.3**

### Property 7: File Size Enforcement
*For any* image upload, the system should reject files larger than 5MB and only accept files within the size limit.
**Validates: Requirements 2.4**

### Property 8: Alt Text Generation
*For any* image stored in a news article, the system should generate and store alternative text for accessibility purposes.
**Validates: Requirements 2.5**

### Property 9: AI Metadata Generation
*For any* news content provided to the AI service, the system should generate a meta description of 160 characters or fewer, optimized for search engines.
**Validates: Requirements 3.2**

### Property 10: Keyword Extraction
*For any* news article content, the system should extract relevant keywords and populate the keywords field with extracted terms.
**Validates: Requirements 3.3**

### Property 11: Excerpt Generation
*For any* AI-generated excerpt, the system should produce a summary of 150 characters or fewer.
**Validates: Requirements 3.4**

### Property 12: Carousel Item Display
*For any* published news article, the system should display it in the homepage carousel with images, titles, and excerpts in a responsive layout.
**Validates: Requirements 4.2**

### Property 13: Mobile Carousel Navigation
*For any* carousel viewed on mobile devices, the system should display one article per slide with touch-swipe navigation.
**Validates: Requirements 4.3**

### Property 14: Desktop Carousel Navigation
*For any* carousel viewed on desktop devices, the system should display multiple articles per slide with arrow navigation controls.
**Validates: Requirements 4.4**

### Property 15: Carousel Navigation to Detail
*For any* article clicked in the carousel, the system should navigate to the article's detail page with the correct language context.
**Validates: Requirements 4.5**

### Property 16: HTML Semantic Structure
*For any* news article detail page, the system should render with proper HTML semantic structure including H1 tags and meta tags.
**Validates: Requirements 5.1**

### Property 17: Open Graph Meta Tags
*For any* news article detail page, the system should include Open Graph meta tags with article title, description, and image for social media sharing.
**Validates: Requirements 5.2**

### Property 18: JSON-LD NewsArticle Schema
*For any* news article detail page, the system should include valid JSON-LD NewsArticle schema with article metadata, author, publication date, and image.
**Validates: Requirements 5.3**

### Property 19: Language-Specific Content Display
*For any* news article detail page accessed in a specific language, the system should display the article content in that language.
**Validates: Requirements 5.4**

### Property 20: Related Content Display
*For any* news article with related portfolio items or news articles, the system should display them on the article detail page.
**Validates: Requirements 5.5**

### Property 21: Content Relationship Storage
*For any* relationship established between a news article and portfolio items, the system should store the relationship in the database and display it on both detail pages.
**Validates: Requirements 6.2, 6.3, 6.4**

### Property 22: Referential Integrity
*For any* content deletion, the system should maintain referential integrity by cleaning up related relationships and preventing broken links.
**Validates: Requirements 6.5**

### Property 23: Turkish Language Routing
*For any* request to /tr/haberler, the system should display the news listing page in Turkish.
**Validates: Requirements 7.1**

### Property 24: Spanish Language Routing
*For any* request to /es/noticias, the system should display the news listing page in Spanish.
**Validates: Requirements 7.2**

### Property 25: Language-Specific Detail Pages
*For any* news article accessed via language-specific URLs (/tr/haberler/[slug] or /es/noticias/[slug]), the system should display the correct language version.
**Validates: Requirements 7.3, 7.4**

### Property 26: Language Switching
*For any* language switch action, the system should redirect to the corresponding language-specific URL while maintaining the article context.
**Validates: Requirements 7.5**

### Property 27: Sitemap Update on Publish
*For any* published news article, the system should automatically update the sitemap.xml to include the new article URL.
**Validates: Requirements 8.1**

### Property 28: Sitemap Update on Unpublish
*For any* unpublished or deleted news article, the system should remove it from the sitemap.xml.
**Validates: Requirements 8.2**

### Property 29: ISR Revalidation on Publish
*For any* published news article, the system should trigger ISR revalidation to update the homepage carousel cache.
**Validates: Requirements 8.3**

### Property 30: Cache Headers
*For any* news article detail page, the system should serve the page with proper cache headers (max-age, revalidate timing).
**Validates: Requirements 8.4**

### Property 31: Homepage Carousel Cache
*For any* homepage load, the system should cache the news carousel data for 60 seconds before revalidating from the database.
**Validates: Requirements 8.5**

### Property 32: Draft Status Default
*For any* newly created news article, the system should default the status to "draft" and prevent public access.
**Validates: Requirements 9.1**

### Property 33: Published Status Access
*For any* article with "published" status, the system should make it publicly accessible and update the publication timestamp.
**Validates: Requirements 9.2**

### Property 34: Draft Status Visibility
*For any* article changed to "draft" status, the system should remove it from public view and carousel displays.
**Validates: Requirements 9.3**

### Property 35: Draft Article Access Prevention
*For any* draft article accessed directly by a visitor, the system should return a 404 error and prevent unauthorized access.
**Validates: Requirements 9.5**

### Property 36: Bulk Publish Operation
*For any* bulk publish action on multiple selected articles, the system should update the status of all selected articles to "published".
**Validates: Requirements 10.3**

### Property 37: Bulk Delete Operation
*For any* bulk delete action on multiple selected articles, the system should remove all selected articles from the database.
**Validates: Requirements 10.4**

## Error Handling

### API Error Responses

```typescript
// 400 Bad Request - Validation Error
{
  success: false,
  error: "Validation failed: title is required",
  data: {
    field: "title",
    message: "Title is required for both languages"
  }
}

// 401 Unauthorized
{
  success: false,
  error: "Authentication required"
}

// 403 Forbidden
{
  success: false,
  error: "Insufficient permissions to perform this action"
}

// 404 Not Found
{
  success: false,
  error: "News article not found"
}

// 409 Conflict - Duplicate Slug
{
  success: false,
  error: "A news article with this slug already exists"
}

// 500 Internal Server Error
{
  success: false,
  error: "An unexpected error occurred"
}
```

### Validation Rules

- **Title**: Required, 3-200 characters, unique per language
- **Content**: Required, minimum 100 characters
- **Excerpt**: Required, maximum 150 characters
- **Meta Description**: Required, maximum 160 characters
- **Keywords**: Array of strings, maximum 10 keywords
- **Slug**: Auto-generated from title, URL-friendly, unique
- **Status**: Must be 'draft' or 'published'
- **Featured Image**: Required, valid Cloudinary URL
- **Alt Text**: Required, descriptive text for accessibility

## Testing Strategy

### Unit Testing

Unit tests verify specific examples, edge cases, and error conditions:

- **News Model Tests**: Validation, slug generation, timestamp handling
- **API Route Tests**: Request/response handling, authentication, authorization
- **Service Tests**: Business logic, data transformation, error handling
- **Utility Tests**: Slug generation, content sanitization, metadata extraction

### Property-Based Testing

Property-based tests verify universal properties that should hold across all inputs:

- **Multilingual Content**: Generate random Turkish/Spanish content and verify storage
- **Slug Uniqueness**: Generate multiple articles and verify slug uniqueness
- **Image Validation**: Generate various file types/sizes and verify validation
- **Metadata Generation**: Generate random content and verify metadata constraints
- **Language Routing**: Generate random language codes and verify routing
- **Status Management**: Generate status changes and verify visibility
- **Bulk Operations**: Generate random article selections and verify bulk actions

### E2E Testing (Playwright)

End-to-end tests verify complete user workflows:

- **Admin Workflow**: Create → Edit → Publish → Delete
- **Frontend Workflow**: Homepage carousel → Click article → Read detail → Share
- **Language Switching**: Navigate between TR/ES versions
- **Image Upload**: Upload image → Verify Cloudinary integration
- **AI Generation**: Generate metadata → Review → Apply

### Testing Configuration

```typescript
// Jest Configuration
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// Property-Based Testing Library
// Use fast-check for JavaScript/TypeScript
// Minimum 100 iterations per property test
// Tag each test with: **Feature: news-module, Property X: [description]**
```


# Implementation Plan - News Module

## Phase 1: Backend Infrastructure & Data Model

- [x] 1. Set up News module structure and database schema
  - Create `src/models/News.ts` with Mongoose schema
  - Define multilingual translations structure (TR/ES)
  - Add database indexes for performance (slug, status, createdAt)
  - Create `src/types/news.ts` for TypeScript interfaces
  - _Requirements: 1.2, 1.3, 8.1_

- [ ]* 1.1 Write property test for multilingual content storage
  - **Feature: news-module, Property 1: Multilingual Content Acceptance**
  - **Validates: Requirements 1.2**

- [ ]* 1.2 Write property test for slug generation and uniqueness
  - **Feature: news-module, Property 2: Slug Generation and Uniqueness**
  - **Validates: Requirements 1.3**

- [x] 2. Implement News API endpoints (CRUD operations)
  - Create `src/app/api/news/route.ts` for GET (list) and POST (create)
  - Create `src/app/api/news/[id]/route.ts` for GET (detail), PUT (update), DELETE
  - Implement pagination and filtering
  - Add authentication middleware (NextAuth)
  - Add input validation and error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 2.1 Write property test for CRUD operations
  - **Feature: news-module, Property 3: Creation Timestamp Preservation**
  - **Validates: Requirements 1.4**

- [ ]* 2.2 Write property test for deletion and access prevention
  - **Feature: news-module, Property 4: Deletion and Access Prevention**
  - **Validates: Requirements 1.5**

- [x] 3. Implement Cloudinary integration for image uploads
  - Use existing `/api/admin/upload` endpoint for Cloudinary integration
  - Implement image validation (format, size) in NewsForm component
  - Add alt text generation and management
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 3.1 Write property test for image format validation
  - **Feature: news-module, Property 6: Image Format Validation**
  - **Validates: Requirements 2.3**

- [ ]* 3.2 Write property test for file size enforcement
  - **Feature: news-module, Property 7: File Size Enforcement**
  - **Validates: Requirements 2.4**

- [ ]* 3.3 Write property test for alt text generation
  - **Feature: news-module, Property 8: Alt Text Generation**
  - **Validates: Requirements 2.5**

- [x] 4. Implement AI metadata generation service
  - Create `src/lib/ai-service.ts` for OpenAI integration
  - Create `src/app/api/ai/generate-metadata.ts` endpoint
  - Implement metadata generation (title, description, keywords, excerpt)
  - Add constraint validation (160 chars for description, 150 for excerpt)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.1 Write property test for metadata generation constraints
  - **Feature: news-module, Property 9: AI Metadata Generation**
  - **Validates: Requirements 3.2**

- [ ]* 4.2 Write property test for keyword extraction
  - **Feature: news-module, Property 10: Keyword Extraction**
  - **Validates: Requirements 3.3**

- [ ]* 4.3 Write property test for excerpt generation
  - **Feature: news-module, Property 11: Excerpt Generation**
  - **Validates: Requirements 3.4**

- [x] 5. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Frontend Components & Pages

- [x] 6. Create News Carousel component for homepage
  - Create `src/components/NewsCarousel.tsx` with Embla/Swiper
  - Implement responsive layout (1 slide mobile, 3 slides desktop)
  - Add lazy-loading for images via Cloudinary
  - Implement touch/swipe and keyboard navigation
  - Add accessibility features (ARIA labels)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 6.1 Write property test for carousel item display
  - **Feature: news-module, Property 12: Carousel Item Display**
  - **Validates: Requirements 4.2**

- [ ]* 6.2 Write property test for mobile carousel navigation
  - **Feature: news-module, Property 13: Mobile Carousel Navigation**
  - **Validates: Requirements 4.3**

- [ ]* 6.3 Write property test for desktop carousel navigation
  - **Feature: news-module, Property 14: Desktop Carousel Navigation**
  - **Validates: Requirements 4.4**

- [ ]* 6.4 Write property test for carousel navigation to detail
  - **Feature: news-module, Property 15: Carousel Navigation to Detail**
  - **Validates: Requirements 4.5**

- [x] 7. Create News Detail page with SEO optimization
  - Create `src/app/[lang]/haberler/[slug]/page.tsx` (Turkish)
  - Create `src/app/[lang]/noticias/[slug]/page.tsx` (Spanish)
  - Implement server-side rendering with metadata generation
  - Add Open Graph meta tags for social sharing
  - Add JSON-LD NewsArticle schema
  - Display related news and portfolio items
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 7.1 Write property test for HTML semantic structure
  - **Feature: news-module, Property 16: HTML Semantic Structure**
  - **Validates: Requirements 5.1**

- [ ]* 7.2 Write property test for Open Graph meta tags
  - **Feature: news-module, Property 17: Open Graph Meta Tags**
  - **Validates: Requirements 5.2**

- [ ]* 7.3 Write property test for JSON-LD schema
  - **Feature: news-module, Property 18: JSON-LD NewsArticle Schema**
  - **Validates: Requirements 5.3**

- [ ]* 7.4 Write property test for language-specific content
  - **Feature: news-module, Property 19: Language-Specific Content Display**
  - **Validates: Requirements 5.4**

- [ ]* 7.5 Write property test for related content display
  - **Feature: news-module, Property 20: Related Content Display**
  - **Validates: Requirements 5.5**

- [x] 8. Create News Listing page with language routing
  - Create `src/app/[lang]/haberler/page.tsx` (Turkish listing)
  - Create `src/app/[lang]/noticias/page.tsx` (Spanish listing)
  - Implement pagination and search/filter
  - Add language switching functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 8.1 Write property test for Turkish language routing
  - **Feature: news-module, Property 23: Turkish Language Routing**
  - **Validates: Requirements 7.1**

- [ ]* 8.2 Write property test for Spanish language routing
  - **Feature: news-module, Property 24: Spanish Language Routing**
  - **Validates: Requirements 7.2**

- [ ]* 8.3 Write property test for language-specific detail pages
  - **Feature: news-module, Property 25: Language-Specific Detail Pages**
  - **Validates: Requirements 7.3, 7.4**

- [ ]* 8.4 Write property test for language switching
  - **Feature: news-module, Property 26: Language Switching**
  - **Validates: Requirements 7.5**

- [x] 9. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Admin Panel & CMS

- [x] 10. Create News Form component for admin panel
  - Create `src/components/admin/NewsForm.tsx`
  - Implement multilingual input fields (TR/ES)
  - Integrate TipTap WYSIWYG editor for content
  - Add Cloudinary image upload with preview
  - Add AI metadata generation button
  - Implement related content selector (portfolio items)
  - Add status management (draft/published)
  - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2_

- [x] 11. Create News List component for admin panel
  - Create `src/components/admin/NewsList.tsx`
  - Implement pagination and search
  - Add filters (status, date range)
  - Add bulk selection with checkboxes
  - Implement bulk actions (publish, unpublish, delete)
  - _Requirements: 1.1, 9.4, 10.1, 10.2, 10.3, 10.4_

- [ ]* 11.1 Write property test for bulk publish operation
  - **Feature: news-module, Property 36: Bulk Publish Operation**
  - **Validates: Requirements 10.3**

- [ ]* 11.2 Write property test for bulk delete operation
  - **Feature: news-module, Property 37: Bulk Delete Operation**
  - **Validates: Requirements 10.4**

- [x] 12. Create admin pages for news management
  - Create `src/app/admin/news/page.tsx` (news list)
  - Create `src/app/admin/news/create/page.tsx` (create form)
  - Create `src/app/admin/news/[id]/edit/page.tsx` (edit form)
  - Add authentication and authorization checks
  - _Requirements: 1.1, 2.1, 3.1, 6.1_

- [x] 13. Implement bulk operations API endpoint
  - Create `src/app/api/news/bulk-action/route.ts`
  - Implement bulk publish, unpublish, delete operations
  - Add transaction support for data consistency
  - _Requirements: 10.3, 10.4, 10.5_

- [x] 14. Checkpoint - Ensure all admin panel tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Content Relationships & SEO

- [x] 15. Implement content relationship management
  - Create `src/lib/relationship-service.ts`
  - Implement bidirectional relationships (news ↔ portfolio)
  - Add referential integrity checks
  - Implement cascade delete for related content
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 15.1 Write property test for content relationship storage
  - **Feature: news-module, Property 21: Content Relationship Storage**
  - **Validates: Requirements 6.2, 6.3, 6.4**

- [ ]* 15.2 Write property test for referential integrity
  - **Feature: news-module, Property 22: Referential Integrity**
  - **Validates: Requirements 6.5**

- [x] 16. Implement SEO and sitemap generation
  - Create `src/lib/seo-service.ts` for sitemap generation
  - Create `src/app/api/sitemap/route.ts` endpoint
  - Implement automatic sitemap updates on publish/unpublish
  - Add JSON-LD schema generation utilities
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 16.1 Write property test for sitemap update on publish
  - **Feature: news-module, Property 27: Sitemap Update on Publish**
  - **Validates: Requirements 8.1**

- [ ]* 16.2 Write property test for sitemap update on unpublish
  - **Feature: news-module, Property 28: Sitemap Update on Unpublish**
  - **Validates: Requirements 8.2**

- [ ]* 16.3 Write property test for ISR revalidation
  - **Feature: news-module, Property 29: ISR Revalidation on Publish**
  - **Validates: Requirements 8.3**

- [x] 17. Implement caching and performance optimization
  - Create `src/lib/news-cache-service.ts` for ISR management
  - Implement cache headers for news detail pages
  - Implement 60-second cache for homepage carousel
  - Add revalidation triggers on content changes
  - _Requirements: 8.4, 8.5_

- [ ]* 17.1 Write property test for cache headers
  - **Feature: news-module, Property 30: Cache Headers**
  - **Validates: Requirements 8.4**

- [ ]* 17.2 Write property test for homepage carousel cache
  - **Feature: news-module, Property 31: Homepage Carousel Cache**
  - **Validates: Requirements 8.5**

- [x] 18. Implement status management and access control
  - Create `src/lib/status-service.ts` for status management
  - Implement draft/published status logic
  - Add access control for draft articles
  - Implement publication timestamp management
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ]* 18.1 Write property test for draft status default
  - **Feature: news-module, Property 32: Draft Status Default**
  - **Validates: Requirements 9.1**

- [ ]* 18.2 Write property test for published status access
  - **Feature: news-module, Property 33: Published Status Access**
  - **Validates: Requirements 9.2**

- [ ]* 18.3 Write property test for draft status visibility
  - **Feature: news-module, Property 34: Draft Status Visibility**
  - **Validates: Requirements 9.3**

- [ ]* 18.4 Write property test for draft article access prevention
  - **Feature: news-module, Property 35: Draft Article Access Prevention**
  - **Validates: Requirements 9.5**

- [x] 19. Checkpoint - Ensure all SEO and relationship tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Spanish Language Support

- [ ] 20. Create Spanish news listing and detail pages
  - Create `src/app/[lang]/noticias/page.tsx` (Spanish listing)
  - Create `src/app/[lang]/noticias/[slug]/page.tsx` (Spanish detail)
  - Implement pagination and search/filter for Spanish
  - Add language-specific metadata and Open Graph tags
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 20.1 Write property test for Spanish language routing
  - **Feature: news-module, Property 24: Spanish Language Routing**
  - **Validates: Requirements 7.2**

- [ ]* 20.2 Write property test for Spanish detail pages
  - **Feature: news-module, Property 25: Language-Specific Detail Pages**
  - **Validates: Requirements 7.3, 7.4**

## Phase 6: Testing & Quality Assurance

- [ ] 21. Write comprehensive unit tests
  - Test News model validation and methods
  - Test API route handlers and middleware
  - Test service layer functions
  - Test utility functions (slug generation, sanitization)
  - Achieve 70%+ code coverage
  - _Requirements: All_

- [ ]* 21.1 Write unit tests for News model
  - Test multilingual content validation
  - Test slug generation and uniqueness
  - Test status transitions
  - Test timestamp management

- [ ]* 21.2 Write unit tests for API routes
  - Test CRUD operations
  - Test authentication and authorization
  - Test pagination and filtering
  - Test error handling

- [ ]* 21.3 Write unit tests for services
  - Test AI metadata generation
  - Test relationship management
  - Test status management
  - Test SEO utilities

- [ ] 22. Write E2E tests with Playwright
  - Test admin workflow (create → edit → publish → delete)
  - Test frontend workflow (carousel → detail → share)
  - Test language switching and routing
  - Test image upload and Cloudinary integration
  - Test AI metadata generation
  - _Requirements: All_

- [ ]* 22.1 Write E2E test for admin workflow
  - Create news article with multilingual content
  - Upload featured image
  - Generate AI metadata
  - Publish and verify visibility

- [ ]* 22.2 Write E2E test for frontend workflow
  - Navigate carousel
  - Click article to detail page
  - Verify content display
  - Test social sharing

- [ ]* 22.3 Write E2E test for language switching
  - Switch between Turkish and Spanish
  - Verify correct content displays
  - Verify URL routing

- [ ] 23. Perform accessibility testing
  - Run Axe accessibility tests on all pages
  - Verify ARIA labels and semantic HTML
  - Test keyboard navigation
  - Test screen reader compatibility
  - _Requirements: 4.1, 5.1, 6.1_

- [ ]* 23.1 Verify carousel accessibility
  - Test keyboard navigation
  - Verify ARIA labels
  - Test screen reader compatibility

- [ ]* 23.2 Verify detail page accessibility
  - Test semantic HTML structure
  - Verify heading hierarchy
  - Test keyboard navigation

- [ ] 24. Perform SEO testing
  - Run Lighthouse SEO audit
  - Verify meta tags and JSON-LD schema
  - Test sitemap generation
  - Verify Open Graph tags
  - _Requirements: 5.1, 5.2, 5.3, 8.1, 8.2_

- [ ]* 24.1 Verify meta tags and schema
  - Check Open Graph tags
  - Verify JSON-LD NewsArticle schema
  - Test Twitter Card tags

- [ ]* 24.2 Verify sitemap generation
  - Check sitemap includes all published articles
  - Verify language-specific URLs
  - Test sitemap updates on publish/unpublish

- [ ] 25. Perform performance testing
  - Test image optimization and Cloudinary delivery
  - Test cache effectiveness
  - Test ISR revalidation timing
  - Verify bundle size impact
  - _Requirements: 4.1, 8.4, 8.5_

- [ ]* 25.1 Test image optimization
  - Verify Cloudinary transformations
  - Test responsive image delivery
  - Check image loading performance

- [ ]* 25.2 Test cache effectiveness
  - Verify cache headers
  - Test ISR revalidation
  - Monitor cache hit rates

- [x] 26. Checkpoint - All tests passing, ready for production
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Deployment & Documentation

- [x] 27. Set up environment variables for production
  - Configure MONGODB_URI for production database
  - Configure NEXTAUTH_SECRET for authentication
  - Configure CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
  - Configure OPENAI_API_KEY for AI service
  - _Requirements: All_

- [x] 28. Deploy to Vercel staging environment
  - Deploy to Vercel preview environment
  - Run smoke tests on staging
  - Verify all features work in staging
  - _Requirements: All_

- [x] 29. Create deployment documentation
  - Document environment variable setup
  - Document database migration steps
  - Document rollback procedures
  - Document monitoring and alerting
  - _Requirements: All_

- [x] 30. Create user documentation
  - Document admin panel usage
  - Document content creation workflow
  - Document AI metadata generation
  - Document image upload process
  - _Requirements: 1.1, 2.1, 3.1, 6.1_

- [x] 31. Final production deployment
  - Deploy to Vercel production
  - Verify all features work in production
  - Monitor error rates and performance
  - _Requirements: All_


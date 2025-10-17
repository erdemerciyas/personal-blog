'use client';

import { schemaMarkupGenerator, SchemaMarkup } from '@/lib/schema-markup';

interface StructuredDataProps {
  type: 'organization' | 'person' | 'website' | 'blogPosting' | 'product' | 'service' | 'breadcrumb' | 'faq' | 'video' | 'contactPage' | 'aboutPage' | 'creativeWork';
  data: Record<string, unknown>;
}

/**
 * Structured Data Component
 * Renders JSON-LD schema markup for SEO
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  let schema: SchemaMarkup | null = null;

  switch (type) {
    case 'organization':
      schema = schemaMarkupGenerator.generateOrganizationSchema();
      break;

    case 'person':
      schema = schemaMarkupGenerator.generatePersonSchema(
        data.name as string,
        data.email as string,
        data.image as string | undefined
      );
      break;

    case 'website':
      schema = schemaMarkupGenerator.generateWebsiteSchema();
      break;

    case 'blogPosting':
      schema = schemaMarkupGenerator.generateBlogPostingSchema(
        data.title as string,
        data.description as string,
        data.image as string,
        data.datePublished as string,
        data.dateModified as string,
        data.author as string,
        data.url as string
      );
      break;

    case 'product':
      schema = schemaMarkupGenerator.generateProductSchema(
        data.name as string,
        data.description as string,
        data.image as string,
        data.price as number,
        data.currency as string | undefined,
        data.rating as number | undefined,
        data.reviewCount as number | undefined
      );
      break;

    case 'service':
      schema = schemaMarkupGenerator.generateServiceSchema(
        data.name as string,
        data.description as string,
        data.image as string,
        data.provider as string,
        data.areaServed as string[] | undefined
      );
      break;

    case 'breadcrumb':
      schema = schemaMarkupGenerator.generateBreadcrumbSchema(
        data.items as Array<{ name: string; url: string }>
      );
      break;

    case 'faq':
      schema = schemaMarkupGenerator.generateFAQSchema(
        data.faqs as Array<{ question: string; answer: string }>
      );
      break;

    case 'video':
      schema = schemaMarkupGenerator.generateVideoSchema(
        data.name as string,
        data.description as string,
        data.thumbnailUrl as string,
        data.uploadDate as string,
        data.duration as string,
        data.contentUrl as string | undefined,
        data.embedUrl as string | undefined
      );
      break;

    case 'contactPage':
      schema = schemaMarkupGenerator.generateContactPageSchema();
      break;

    case 'aboutPage':
      schema = schemaMarkupGenerator.generateAboutPageSchema(
        data.description as string,
        data.image as string | undefined
      );
      break;

    case 'creativeWork':
      schema = schemaMarkupGenerator.generateCreativeWorkSchema(
        data.name as string,
        data.description as string,
        data.image as string,
        data.url as string,
        data.dateCreated as string,
        data.creator as string,
        data.keywords as string[]
      );
      break;

    default:
      return null;
  }

  if (!schema) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

/**
 * Multiple Structured Data Component
 */
export function MultipleStructuredData({
  schemas,
}: {
  schemas: Array<{ type: StructuredDataProps['type']; data: Record<string, unknown> }>;
}) {
  return (
    <>
      {schemas.map((item, index) => (
        <StructuredData key={index} type={item.type} data={item.data} />
      ))}
    </>
  );
}

/**
 * Breadcrumb Structured Data Component
 */
export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return <StructuredData type="breadcrumb" data={{ items }} />;
}

/**
 * FAQ Structured Data Component
 */
export function FAQStructuredData({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  return <StructuredData type="faq" data={{ faqs }} />;
}

/**
 * Product Structured Data Component
 */
export function ProductStructuredData({
  name,
  description,
  image,
  price,
  currency,
  rating,
  reviewCount,
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
}) {
  return (
    <StructuredData
      type="product"
      data={{
        name,
        description,
        image,
        price,
        currency,
        rating,
        reviewCount,
      }}
    />
  );
}

/**
 * BlogPosting Structured Data Component
 */
export function BlogPostingStructuredData({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
}: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: string;
  url: string;
}) {
  return (
    <StructuredData
      type="blogPosting"
      data={{
        title,
        description,
        image,
        datePublished,
        dateModified,
        author,
        url,
      }}
    />
  );
}

/**
 * Video Structured Data Component
 */
export function VideoStructuredData({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl?: string;
  embedUrl?: string;
}) {
  return (
    <StructuredData
      type="video"
      data={{
        name,
        description,
        thumbnailUrl,
        uploadDate,
        duration,
        contentUrl,
        embedUrl,
      }}
    />
  );
}

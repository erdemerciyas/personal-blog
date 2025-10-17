/**
 * Schema.org structured data markup generator
 * Provides JSON-LD schemas for SEO optimization
 */

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

class SchemaMarkupGenerator {
  private baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fixral.com';
  private siteName = 'Fixral';
  private siteDescription = 'Modern Portfolio & Blog Platform';

  /**
   * Generate Organization schema
   */
  generateOrganizationSchema(): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.siteName,
      url: this.baseUrl,
      logo: `${this.baseUrl}/logo.png`,
      description: this.siteDescription,
      sameAs: [
        'https://www.facebook.com/fixral',
        'https://www.twitter.com/fixral',
        'https://www.linkedin.com/company/fixral',
        'https://www.github.com/erdemerciyas',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+90-555-123-4567',
        contactType: 'Customer Service',
        email: 'info@fixral.com',
      },
    };
  }

  /**
   * Generate Person schema (for author/owner)
   */
  generatePersonSchema(name: string, email: string, image?: string): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      email,
      url: this.baseUrl,
      ...(image && { image }),
      sameAs: [
        'https://www.linkedin.com/in/erdemerciyas',
        'https://www.github.com/erdemerciyas',
        'https://www.twitter.com/erdemerciyas',
      ],
    };
  }

  /**
   * Generate WebSite schema
   */
  generateWebsiteSchema(): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.baseUrl,
      description: this.siteDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.baseUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  }

  /**
   * Generate BlogPosting schema
   */
  generateBlogPostingSchema(
    title: string,
    description: string,
    image: string,
    datePublished: string,
    dateModified: string,
    author: string,
    url: string
  ): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      image,
      datePublished,
      dateModified,
      author: {
        '@type': 'Person',
        name: author,
      },
      url,
      mainEntity: {
        '@type': 'Article',
        headline: title,
        description,
        image,
        datePublished,
        dateModified,
        author: {
          '@type': 'Person',
          name: author,
        },
      },
    };
  }

  /**
   * Generate CreativeWork schema (for portfolio items)
   */
  generateCreativeWorkSchema(
    name: string,
    description: string,
    image: string,
    url: string,
    dateCreated: string,
    creator: string,
    keywords: string[]
  ): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name,
      description,
      image,
      url,
      dateCreated,
      creator: {
        '@type': 'Person',
        name: creator,
      },
      keywords: keywords.join(', '),
    };
  }

  /**
   * Generate Product schema
   */
  generateProductSchema(
    name: string,
    description: string,
    image: string,
    price: number,
    currency: string = 'USD',
    rating?: number,
    reviewCount?: number
  ): SchemaMarkup {
    const schema: SchemaMarkup = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image,
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
      },
    };

    if (rating && reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: rating.toString(),
        reviewCount: reviewCount.toString(),
      };
    }

    return schema;
  }

  /**
   * Generate Service schema
   */
  generateServiceSchema(
    name: string,
    description: string,
    image: string,
    provider: string,
    areaServed: string[] = ['US', 'TR']
  ): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name,
      description,
      image,
      provider: {
        '@type': 'Organization',
        name: provider,
      },
      areaServed: areaServed.map(area => ({
        '@type': 'Country',
        name: area,
      })),
    };
  }

  /**
   * Generate LocalBusiness schema
   */
  generateLocalBusinessSchema(
    name: string,
    address: string,
    telephone: string,
    email: string,
    businessType: string = 'ProfessionalService'
  ): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': businessType,
      name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressCountry: 'TR',
      },
      telephone,
      email,
      url: this.baseUrl,
    };
  }

  /**
   * Generate BreadcrumbList schema
   */
  generateBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
  ): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  /**
   * Generate FAQPage schema
   */
  generateFAQSchema(
    faqs: Array<{ question: string; answer: string }>
  ): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  /**
   * Generate VideoObject schema
   */
  generateVideoSchema(
    name: string,
    description: string,
    thumbnailUrl: string,
    uploadDate: string,
    duration: string,
    contentUrl?: string,
    embedUrl?: string
  ): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name,
      description,
      thumbnailUrl,
      uploadDate,
      duration,
      ...(contentUrl && { contentUrl }),
      ...(embedUrl && { embedUrl }),
    };
  }

  /**
   * Generate Event schema
   */
  generateEventSchema(
    name: string,
    description: string,
    startDate: string,
    endDate: string,
    location: string,
    image?: string
  ): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name,
      description,
      startDate,
      endDate,
      location: {
        '@type': 'Place',
        name: location,
      },
      ...(image && { image }),
    };
  }

  /**
   * Generate ContactPage schema
   */
  generateContactPageSchema(): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact',
      url: `${this.baseUrl}/contact`,
      mainEntity: {
        '@type': 'Organization',
        name: this.siteName,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+90-555-123-4567',
          contactType: 'Customer Service',
          email: 'info@fixral.com',
        },
      },
    };
  }

  /**
   * Generate AboutPage schema
   */
  generateAboutPageSchema(description: string, image?: string): SchemaMarkup {
    return {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About',
      url: `${this.baseUrl}/about`,
      description,
      mainEntity: {
        '@type': 'Person',
        name: 'Erdem Erciyas',
        description,
        ...(image && { image }),
        url: this.baseUrl,
      },
    };
  }

  /**
   * Convert schema to JSON-LD script tag
   */
  toJsonLd(schema: SchemaMarkup): string {
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }

  /**
   * Generate multiple schemas
   */
  generateMultipleSchemas(schemas: SchemaMarkup[]): string {
    return schemas.map(schema => this.toJsonLd(schema)).join('\n');
  }
}

export const schemaMarkupGenerator = new SchemaMarkupGenerator();

/**
 * React component for rendering schema markup
 */
export function SchemaMarkup({ schema }: { schema: SchemaMarkup }) {
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
 * Multiple schemas component
 */
export function MultipleSchemaMarkup({ schemas }: { schemas: SchemaMarkup[] }) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}

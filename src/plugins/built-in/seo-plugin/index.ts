/**
 * SEO Plugin - Built-in plugin for SEO optimization
 */

export async function init(hookSystem: any) {
  console.log('[SEO Plugin] Initializing SEO plugin...');

  // Hook into page metadata generation
  hookSystem.addFilter('page:meta', (meta: any, page: any) => {
    console.log('[SEO Plugin] Filtering page metadata');
    
    return {
      ...meta,
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || page.description,
      keywords: page.seoKeywords || [],
      openGraph: {
        ...meta.openGraph,
        type: page.seoOgType || 'website',
        title: page.seoOgTitle || page.title,
        description: page.seoOgDescription || page.excerpt || page.description,
        images: page.seoOgImage ? [page.seoOgImage] : meta.openGraph?.images,
      },
      twitter: {
        ...meta.twitter,
        card: page.seoTwitterCard || 'summary_large_image',
        title: page.seoTwitterTitle || page.title,
        description: page.seoTwitterDescription || page.excerpt || page.description,
        images: page.seoTwitterImage ? [page.seoTwitterImage] : meta.twitter?.images,
      },
    };
  }, 10, 'seo-plugin');

  // Hook into page head for schema markup
  hookSystem.addFilter('page:head', (head: any[], page: any) => {
    console.log('[SEO Plugin] Adding schema markup');
    
    const schema = generateSchemaMarkup(page);
    const schemaJson = JSON.stringify(schema);
    
    return [
      ...head,
      {
        type: 'script',
        props: {
          key: 'seo-schema',
          type: 'application/ld+json',
          dangerouslySetInnerHTML: { __html: schemaJson },
        },
      },
    ];
  }, 10, 'seo-plugin');

  // Hook into content for SEO optimization
  hookSystem.addFilter('page:content', (content: string, page: any) => {
    console.log('[SEO Plugin] Optimizing content');
    
    // Add structured data to content
    let optimizedContent = content;
    
    // Add canonical URL if not present
    if (!optimizedContent.includes('rel="canonical"') && page.url) {
      optimizedContent = `<link rel="canonical" href="${page.url}" />` + optimizedContent;
    }
    
    return optimizedContent;
  }, 10, 'seo-plugin');

  console.log('[SEO Plugin] SEO plugin initialized successfully');
}

/**
 * Generate JSON-LD schema markup
 */
function generateSchemaMarkup(page: any) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.excerpt || page.description,
    url: page.url,
  };

  // Add article schema for blog posts
  if (page.type === 'post' || page.type === 'news') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.title,
      description: page.excerpt || page.description,
      image: page.featuredImage,
      author: {
        '@type': 'Person',
        name: page.author || 'Fixral',
      },
      datePublished: page.createdAt,
      dateModified: page.updatedAt,
      publisher: {
        '@type': 'Organization',
        name: 'Fixral',
        logo: {
          '@type': 'ImageObject',
          url: page.logo || '/favicon.svg',
        },
      },
    };
  }

  // Add product schema for products
  if (page.type === 'product') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: page.title,
      description: page.description,
      image: page.images?.[0] || page.featuredImage,
      offers: {
        '@type': 'Offer',
        price: page.price,
        priceCurrency: page.currency || 'TRY',
        availability: page.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };
  }

  return baseSchema;
}

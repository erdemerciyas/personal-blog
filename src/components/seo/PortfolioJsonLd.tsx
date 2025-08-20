import Script from 'next/script';

interface PortfolioJsonLdProps {
  name: string;
  description?: string;
  url: string;
  images?: string[];
  authorName?: string;
  authorType?: 'Person' | 'Organization';
  datePublished?: string;
  baseUrl?: string;
}

// Adds CreativeWork JSON-LD for portfolio/project detail pages
export default function PortfolioJsonLd({
  name,
  description,
  url,
  images = [],
  authorName = 'Erdem Erciyas',
  authorType = 'Organization',
  datePublished,
  baseUrl,
}: PortfolioJsonLdProps) {
  const toAbs = (u: string) => {
    if (!u) return u;
    if (u.startsWith('http')) return u;
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  const normalizedImages = images.map(toAbs).filter(Boolean);

  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    url,
  };

  if (description) json.description = description as unknown as string;
  if (normalizedImages.length > 0) json.image = normalizedImages as unknown as string[];
  if (authorName) json.author = { '@type': authorType, name: authorName } as unknown as Record<string, unknown>;
  if (datePublished) json.datePublished = datePublished as unknown as string;

  return (
    <Script id="ld-creativework" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(json)}
    </Script>
  );
}

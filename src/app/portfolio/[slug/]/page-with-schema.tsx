'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StructuredData } from '@/components/seo/StructuredData';
import { schemaMarkupGenerator } from '@/lib/schema-markup';

/**
 * Portfolio Item Page with Schema Markup
 * Demonstrates CreativeWork schema for portfolio projects
 */
export default function PortfolioItemPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`/api/portfolio/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setPortfolio(data);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [slug]);

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  if (!portfolio) {
    return <div className="p-8">Portföy öğesi bulunamadı</div>;
  }

  // Generate CreativeWork schema for portfolio item
  const creativeWorkSchema = schemaMarkupGenerator.generateCreativeWorkSchema(
    portfolio.title,
    portfolio.description,
    portfolio.coverImage,
    `https://www.fixral.com/portfolio/${portfolio.slug}`,
    portfolio.completionDate,
    'Erdem Erciyas',
    portfolio.technologies || []
  );

  // Generate breadcrumb schema
  const breadcrumbItems = [
    { name: 'Home', url: 'https://www.fixral.com' },
    { name: 'Portfolio', url: 'https://www.fixral.com/portfolio' },
    { name: portfolio.title, url: `https://www.fixral.com/portfolio/${portfolio.slug}` },
  ];

  return (
    <>
      {/* Schema Markup */}
      <StructuredData type="creativeWork" data={creativeWorkSchema} />
      <StructuredData
        type="breadcrumb"
        data={{ items: breadcrumbItems }}
      />

      {/* Page Content */}
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">{portfolio.title}</h1>
        <p className="text-gray-600 mb-8">{portfolio.description}</p>

        {portfolio.coverImage && (
          <img
            src={portfolio.coverImage}
            alt={portfolio.title}
            className="w-full h-auto rounded-lg mb-8"
          />
        )}

        {portfolio.technologies && portfolio.technologies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Kullanılan Teknolojiler</h2>
            <div className="flex flex-wrap gap-2">
              {portfolio.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {portfolio.images && portfolio.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Proje Görselleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`${portfolio.title} - Görsel ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

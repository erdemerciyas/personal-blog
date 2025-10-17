import { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { schemaMarkupGenerator } from '@/lib/schema-markup';

export const metadata: Metadata = {
  title: 'Portfolio | Fixral',
  description: 'Tamamladığım projeler ve portföy örnekleri',
  openGraph: {
    title: 'Portfolio | Fixral',
    description: 'Tamamladığım projeler ve portföy örnekleri',
    type: 'website',
    url: 'https://www.fixral.com/portfolio',
  },
};

/**
 * Portfolio Layout with Schema Markup
 * Demonstrates integration of structured data
 */
export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate breadcrumb schema
  const breadcrumbItems = [
    { name: 'Home', url: 'https://www.fixral.com' },
    { name: 'Portfolio', url: 'https://www.fixral.com/portfolio' },
  ];

  // Generate organization schema
  const organizationSchema = schemaMarkupGenerator.generateOrganizationSchema();

  // Generate website schema
  const websiteSchema = schemaMarkupGenerator.generateWebsiteSchema();

  return (
    <>
      {/* Schema Markup */}
      <StructuredData type="organization" data={organizationSchema} />
      <StructuredData type="website" data={websiteSchema} />
      <StructuredData
        type="breadcrumb"
        data={{ items: breadcrumbItems }}
      />

      {/* Page Content */}
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {children}
      </div>
    </>
  );
}

import { getSliderItems, getPortfolioItems, getServices } from '@/lib/data';
import { ThemeRegistry } from '@/themes/ThemeRegistry';
import connectDB from '@/lib/mongoose';
import Theme from '@/models/Theme';

export const revalidate = 3600; // ISR for 1 hour

export default async function HomePage() {
  await connectDB();
  const activeThemeRecord = await Theme.findOne({ isActive: true }).lean() as any;
  const activeThemeFolder = activeThemeRecord?.slug || 'default';

  // Fetch data in parallel
  const [sliderItems, portfolioItems, services] = await Promise.all([
    getSliderItems(),
    getPortfolioItems(6),
    getServices(6)
  ]);

  const TemplateComponent = ThemeRegistry.getTemplate(activeThemeFolder, 'HomeTemplate');

  return (
    <TemplateComponent
      sliderItems={sliderItems}
      portfolioItems={portfolioItems}
      services={services}
    />
  );
}

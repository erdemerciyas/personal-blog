/**
 * Seed script to initialize plugins and themes in the database
 * Run this script to populate the database with default plugins and themes
 */

import mongoose from 'mongoose';
import Plugin from '../src/models/Plugin';
import Theme from '../src/models/Theme';
import connectDB from '../src/lib/mongoose';

async function seedPlugins() {
  console.log('🔌 Seeding plugins...');

  const seoPlugin = {
    name: 'SEO Plugin',
    slug: 'seo-plugin',
    version: '1.0.0',
    author: 'Fixral',
    description: 'SEO optimizasyonu için meta etiketleri, Open Graph ve schema markup ekler',
    isActive: false,
    type: 'built-in' as const,
    config: {
      enableSchemaMarkup: true,
      enableOpenGraph: true,
      enableTwitterCards: true,
    },
    hooks: [
      {
        name: 'page:meta',
        callback: 'filterPageMeta',
        priority: 10,
      },
      {
        name: 'page:head',
        callback: 'addSchemaMarkup',
        priority: 10,
      },
      {
        name: 'page:content',
        callback: 'optimizeContent',
        priority: 10,
      },
    ],
    components: [],
    dependencies: [],
  };

  const analyticsPlugin = {
    name: 'Analytics Plugin',
    slug: 'analytics-plugin',
    version: '1.0.0',
    author: 'Fixral',
    description: 'Google Analytics ve diğer analiz araçlarını entegre eder',
    isActive: false,
    type: 'built-in' as const,
    config: {
      googleAnalyticsId: '',
      enablePageViewTracking: true,
      enableEventTracking: true,
    },
    hooks: [
      {
        name: 'page:loaded',
        callback: 'trackPageView',
        priority: 10,
      },
    ],
    components: [
      {
        id: 'analytics-widget',
        type: 'widget' as const,
        component: 'components/AnalyticsWidget',
        name: 'Analytics Widget',
        description: 'Analytics verilerini gösteren widget',
      },
    ],
    dependencies: [],
  };

  const socialSharePlugin = {
    name: 'Social Share Plugin',
    slug: 'social-share-plugin',
    version: '1.0.0',
    author: 'Fixral',
    description: 'Sosyal medya paylaşım butonları ekler',
    isActive: false,
    type: 'built-in' as const,
    config: {
      platforms: ['facebook', 'twitter', 'linkedin', 'whatsapp'],
      showIcons: true,
      showCount: false,
    },
    hooks: [
      {
        name: 'page:content',
        callback: 'addShareButtons',
        priority: 20,
      },
    ],
    components: [
      {
        id: 'share-buttons',
        type: 'widget' as const,
        component: 'components/ShareButtons',
        name: 'Social Share Buttons',
        description: 'Sosyal medya paylaşım butonları',
      },
    ],
    dependencies: [],
  };

  const plugins = [seoPlugin, analyticsPlugin, socialSharePlugin];

  for (const pluginData of plugins) {
    try {
      const existingPlugin = await Plugin.findOne({ slug: pluginData.slug });
      if (existingPlugin) {
        console.log(`  ✓ Plugin already exists: ${pluginData.name}`);
        continue;
      }

      await Plugin.create(pluginData);
      console.log(`  ✓ Created plugin: ${pluginData.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to create plugin ${pluginData.name}:`, error);
    }
  }

  console.log('✅ Plugins seeded successfully\n');
}

async function seedThemes() {
  console.log('🎨 Seeding themes...');

  const defaultTheme = {
    name: 'Default Theme',
    slug: 'default',
    version: '1.0.0',
    author: 'Fixral',
    description: 'Modern ve responsive varsayılan tema',
    thumbnail: '/themes/default/thumbnail.png',
    isActive: true,
    config: {
      colors: {
        primary: '#003450',
        secondary: '#3A506B',
        accent: '#003450',
        background: '#F8F9FA',
        text: '#3D3D3D',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      layout: {
        maxWidth: 1280,
        sidebar: false,
        headerStyle: 'fixed' as const,
        footerStyle: 'simple' as const,
      },
      features: {
        heroSlider: true,
        portfolioGrid: true,
        blogList: true,
        contactForm: true,
      },
    },
    templates: [
      {
        id: 'home-default',
        name: 'Default Home',
        type: 'home' as const,
        component: 'templates/HomeTemplate',
        screenshot: '/themes/default/screenshots/home.png',
        description: 'Ana sayfa için varsayılan şablon',
      },
      {
        id: 'page-default',
        name: 'Default Page',
        type: 'page' as const,
        component: 'templates/PageTemplate',
        screenshot: '/themes/default/screenshots/page.png',
        description: 'Standart sayfa şablonu',
      },
      {
        id: 'blog-default',
        name: 'Blog List',
        type: 'archive' as const,
        component: 'templates/BlogTemplate',
        screenshot: '/themes/default/screenshots/blog.png',
        description: 'Blog listesi için şablon',
      },
      {
        id: 'single-default',
        name: 'Single Post',
        type: 'single' as const,
        component: 'templates/SingleTemplate',
        screenshot: '/themes/default/screenshots/single.png',
        description: 'Tekil blog yazısı için şablon',
      },
      {
        id: 'portfolio-default',
        name: 'Portfolio Grid',
        type: 'archive' as const,
        component: 'templates/PortfolioTemplate',
        screenshot: '/themes/default/screenshots/portfolio.png',
        description: 'Portfolyo grid şablonu',
      },
    ],
  };

  try {
    const existingTheme = await Theme.findOne({ slug: defaultTheme.slug });
    if (existingTheme) {
      console.log('  ✓ Theme already exists: Default Theme');
    } else {
      await Theme.create(defaultTheme);
      console.log('  ✓ Created theme: Default Theme');
    }
  } catch (error) {
    console.error('  ✗ Failed to create theme Default Theme:', error);
  }

  console.log('✅ Themes seeded successfully\n');
}

async function main() {
  try {
    console.log('🚀 Starting seed process...\n');

    await connectDB();

    await seedPlugins();
    await seedThemes();

    console.log('✨ Seed process completed successfully!');
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed script
main();

/**
 * API Route to Seed Plugins and Themes
 * This route initializes the database with default plugins and themes
 */

import { NextRequest, NextResponse } from 'next/server';
import Plugin from '../../../../models/Plugin';
import Theme from '../../../../models/Theme';
import connectDB from '../../../../lib/mongoose';

async function seedPlugins() {
  console.log('🔌 Seeding plugins...');

  const seoPlugin = {
    name: 'SEO Manager',
    slug: 'seo-plugin',
    version: '1.1.0',
    author: 'Fixral',
    description: 'Tüm SEO ayarlarını, meta etiketlerini ve schema yapılarını yönetin.',
    isActive: false, // User will activate it
    type: 'built-in' as const,
    config: {
      metaTitleSuffix: ' | Fixral',
      globalMetaDescription: '',
      globalKeywords: [],
      enableSchemaMarkup: true,
      enableOpenGraph: true,
      enableTwitterCards: true,
    },
    hooks: [],
    components: [],
    dependencies: [],
  };

  const analyticsPlugin = {
    name: 'Analytics Manager',
    slug: 'analytics-plugin',
    version: '1.1.0',
    author: 'Fixral',
    description: 'Google Analytics, Tag Manager ve Verification kodlarını yönetin.',
    isActive: false,
    type: 'built-in' as const,
    config: {
      googleAnalyticsId: '',
      googleTagManagerId: '',
      googleSiteVerification: '',
      enablePageViewTracking: true,
    },
    hooks: [],
    components: [],
    dependencies: [],
  };

  const socialMediaPlugin = {
    name: 'Social Media Manager',
    slug: 'social-media-plugin', // Renamed from social-share
    version: '1.1.0',
    author: 'Fixral',
    description: 'Sosyal medya profillerini ve paylaşım ayarlarını yönetin.',
    isActive: false,
    type: 'built-in' as const,
    config: {
      // Profile Links
      twitter: '',
      instagram: '',
      linkedin: '',
      github: '',
      facebook: '',
      youtube: '',
      // Sharing Settings
      enableSharing: true,
      showShareCount: false,
    },
    hooks: [],
    components: [],
    dependencies: [],
  };

  const plugins = [seoPlugin, analyticsPlugin, socialMediaPlugin];
  const results: { name: string; status: string; message?: string }[] = [];

  for (const pluginData of plugins) {
    try {
      // Upsert logic: Update if exists, Create if not.
      const updated = await Plugin.findOneAndUpdate(
        { slug: pluginData.slug },
        {
          $set: {
            name: pluginData.name,
            description: pluginData.description,
            version: pluginData.version,
            type: pluginData.type
          },
          $setOnInsert: {
            config: pluginData.config,
            isActive: false
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (updated) {
        let configChanged = false;
        const currentConfig = updated.config || {};
        for (const [key, value] of Object.entries(pluginData.config)) {
          if (currentConfig[key] === undefined) {
            currentConfig[key] = value;
            configChanged = true;
          }
        }
        if (configChanged) {
          updated.config = currentConfig;
          updated.markModified('config');
          await updated.save();
          results.push({ name: pluginData.name, status: 'updated', message: 'Schema migrated' });
        } else {
          results.push({ name: pluginData.name, status: 'exists', message: 'Verified' });
        }
      }

    } catch (error) {
      console.error(`Failed to seed/update plugin ${pluginData.name}:`, error);
      results.push({ name: pluginData.name, status: 'error', message: String(error) });
    }
  }

  return results;
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
    isActive: false, // Will be set to true only if no other theme is active
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

  const results: { name: string; status: string; message?: string }[] = [];

  // Seed Default Theme
  try {
    const existingDefaultTheme = await Theme.findOne({ slug: defaultTheme.slug });
    if (existingDefaultTheme) {
      results.push({ name: defaultTheme.name, status: 'exists', message: 'Already exists' });
    } else {
      // Check if there is any active theme
      const activeTheme = await Theme.findOne({ isActive: true });
      if (!activeTheme) {
        defaultTheme.isActive = true;
      }

      await Theme.create(defaultTheme);
      results.push({ name: defaultTheme.name, status: 'created', message: 'Created successfully' });
    }
  } catch (error) {
    console.error('Failed to create theme Default Theme:', error);
    results.push({ name: defaultTheme.name, status: 'error', message: String(error) });
  }

  // Seed Fixral Theme
  const fixralTheme = {
    name: 'Fixral Theme',
    slug: 'fixral',
    version: '1.0.0',
    author: 'Fixral',
    description: 'Fixral için özel tasarlanmış modern ve responsive tema',
    thumbnail: '/themes/fixral/thumbnail.png',
    isActive: false,
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
        id: 'home-fixral',
        name: 'Fixral Home',
        type: 'home' as const,
        component: 'templates/HomeTemplate',
        screenshot: '/themes/fixral/screenshots/home.png',
        description: 'Fixral ana sayfa şablonu',
      },
      {
        id: 'page-fixral',
        name: 'Fixral Page',
        type: 'page' as const,
        component: 'templates/PageTemplate',
        screenshot: '/themes/fixral/screenshots/page.png',
        description: 'Fixral standart sayfa şablonu',
      },
      {
        id: 'blog-fixral',
        name: 'Fixral Blog List',
        type: 'archive' as const,
        component: 'templates/BlogTemplate',
        screenshot: '/themes/fixral/screenshots/blog.png',
        description: 'Fixral blog listesi şablonu',
      },
      {
        id: 'single-fixral',
        name: 'Fixral Single Post',
        type: 'single' as const,
        component: 'templates/SingleTemplate',
        screenshot: '/themes/fixral/screenshots/single.png',
        description: 'Fixral tekil blog yazısı şablonu',
      },
      {
        id: 'portfolio-fixral',
        name: 'Fixral Portfolio Grid',
        type: 'archive' as const,
        component: 'templates/PortfolioTemplate',
        screenshot: '/themes/fixral/screenshots/portfolio.png',
        description: 'Fixral portfolyo grid şablonu',
      },
    ],
  };

  try {
    const existingFixralTheme = await Theme.findOne({ slug: fixralTheme.slug });
    if (existingFixralTheme) {
      results.push({ name: fixralTheme.name, status: 'exists', message: 'Already exists' });
    } else {
      await Theme.create(fixralTheme);
      results.push({ name: fixralTheme.name, status: 'created', message: 'Created successfully' });
    }
  } catch (error) {
    console.error('Failed to create theme Fixral Theme:', error);
    results.push({ name: fixralTheme.name, status: 'error', message: String(error) });
  }

  return results;
}

// POST /api/admin/seed-plugins-themes - Seed plugins and themes
export async function POST(_request: NextRequest) {
  try {
    await connectDB();

    // Seed plugins
    const pluginResults = await seedPlugins();

    // Seed themes
    const themeResults = await seedThemes();

    return NextResponse.json({
      success: true,
      data: {
        plugins: pluginResults,
        themes: themeResults,
      },
      message: 'Plugins and themes seeded successfully',
    });
  } catch (error) {
    console.error('Error seeding plugins and themes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed plugins and themes' },
      { status: 500 }
    );
  }
}

// GET /api/admin/seed-plugins-themes - Check if seeding is needed
export async function GET() {
  try {
    await connectDB();

    const pluginCount = await Plugin.countDocuments();
    const themeCount = await Theme.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        pluginCount,
        themeCount,
        needsSeeding: pluginCount === 0 || themeCount === 0,
      },
    });
  } catch (error) {
    console.error('Error checking seeding status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check seeding status' },
      { status: 500 }
    );
  }
}

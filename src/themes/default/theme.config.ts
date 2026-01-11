/**
 * Default Theme Configuration
 */

import { ITheme } from '../../models/Theme';

export const defaultThemeConfig: Partial<ITheme> = {
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
      headerStyle: 'fixed',
      footerStyle: 'simple',
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
      type: 'home',
      component: 'templates/HomeTemplate',
      screenshot: '/themes/default/screenshots/home.png',
      description: 'Ana sayfa için varsayılan şablon',
    },
    {
      id: 'page-default',
      name: 'Default Page',
      type: 'page',
      component: 'templates/PageTemplate',
      screenshot: '/themes/default/screenshots/page.png',
      description: 'Standart sayfa şablonu',
    },
    {
      id: 'blog-default',
      name: 'Blog List',
      type: 'archive',
      component: 'templates/BlogTemplate',
      screenshot: '/themes/default/screenshots/blog.png',
      description: 'Blog listesi için şablon',
    },
    {
      id: 'single-default',
      name: 'Single Post',
      type: 'single',
      component: 'templates/SingleTemplate',
      screenshot: '/themes/default/screenshots/single.png',
      description: 'Tekil blog yazısı için şablon',
    },
    {
      id: 'portfolio-default',
      name: 'Portfolio Grid',
      type: 'archive',
      component: 'templates/PortfolioTemplate',
      screenshot: '/themes/default/screenshots/portfolio.png',
      description: 'Portfolyo grid şablonu',
    },
  ],
};

export default defaultThemeConfig;

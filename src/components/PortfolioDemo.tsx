'use client';

import React from 'react';
import { ProjectSummary, PortfolioItem, Category } from '@/types/portfolio';
import PortfolioShowcase from './PortfolioShowcase';

// Demo data
const demoCategories: Category[] = [
  { _id: '1', name: 'Web Tasarım', slug: 'web-tasarim' },
  { _id: '2', name: 'Mobil Uygulama', slug: 'mobil-uygulama' },
  { _id: '3', name: 'E-ticaret', slug: 'e-ticaret' },
  { _id: '4', name: 'Kurumsal', slug: 'kurumsal' },
];

const demoProjects: PortfolioItem[] = [
  {
    _id: '1',
    title: 'Modern E-ticaret Platformu',
    slug: 'modern-e-ticaret-platformu',
    description: 'Next.js ve Stripe entegrasyonu ile geliştirilmiş modern e-ticaret platformu. Responsive tasarım, ödeme sistemi ve admin paneli içerir.',
    categories: [demoCategories[2]],
    client: 'TechStore',
    completionDate: '2024-01-15',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'MongoDB'],
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    images: [],
    featured: true,
    order: 1,
  },
  {
    _id: '2',
    title: 'Kurumsal Web Sitesi',
    slug: 'kurumsal-web-sitesi',
    description: 'React ve Node.js ile geliştirilmiş kurumsal web sitesi. SEO optimizasyonu, içerik yönetim sistemi ve çoklu dil desteği.',
    categories: [demoCategories[3]],
    client: 'ABC Şirketi',
    completionDate: '2023-12-20',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    images: [],
    featured: false,
    order: 2,
  },
  {
    _id: '3',
    title: 'Mobil Fitness Uygulaması',
    slug: 'mobil-fitness-uygulamasi',
    description: 'React Native ile geliştirilmiş fitness takip uygulaması. Antrenman planları, beslenme takibi ve sosyal özellikler içerir.',
    categories: [demoCategories[1]],
    client: 'FitLife',
    completionDate: '2024-02-10',
    technologies: ['React Native', 'Firebase', 'Redux'],
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    images: [],
    featured: true,
    order: 3,
  },
  {
    _id: '4',
    title: 'Portfolio Web Sitesi',
    slug: 'portfolio-web-sitesi',
    description: 'Sanatçılar için özel tasarlanmış portfolio web sitesi. Galeri sistemi, iletişim formu ve admin paneli ile birlikte.',
    categories: [demoCategories[0]],
    client: 'Sanat Atölyesi',
    completionDate: '2023-11-30',
    technologies: ['Vue.js', 'Nuxt.js', 'Strapi'],
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    images: [],
    featured: false,
    order: 4,
  },
  {
    _id: '5',
    title: 'Restoran Rezervasyon Sistemi',
    slug: 'restoran-rezervasyon-sistemi',
    description: 'Restoranlar için geliştirilmiş online rezervasyon sistemi. Masa yönetimi, menü gösterimi ve müşteri takip sistemi.',
    categories: [demoCategories[2]],
    client: 'Lezzet Durağı',
    completionDate: '2024-03-05',
    technologies: ['Angular', 'Express.js', 'MySQL'],
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    images: [],
    featured: true,
    order: 5,
  },
  {
    _id: '6',
    title: 'Eğitim Platformu',
    slug: 'egitim-platformu',
    description: 'Online eğitim platformu. Video dersleri, quiz sistemi, öğrenci takibi ve sertifika sistemi ile kapsamlı bir LMS çözümü.',
    categories: [demoCategories[0]],
    client: 'EduTech',
    completionDate: '2023-10-15',
    technologies: ['Django', 'Python', 'PostgreSQL', 'Redis'],
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    images: [],
    featured: false,
    order: 6,
  },
];

const PortfolioDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container-main py-16">
        <PortfolioShowcase
          projects={demoProjects}
          categories={demoCategories}
          title="Projelerim"
          subtitle="Gerçekleştirdiğim web tasarım, mobil uygulama ve e-ticaret projelerini keşfedin"
          showSearch={true}
          showFilter={true}
          showAnimation={true}
        />
      </div>
    </div>
  );
};

export default PortfolioDemo;
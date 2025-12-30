# FIXRAL - Personal Blog & Portfolio Platform

A modern, full-featured personal blog and portfolio platform built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS.

**Creator:** FIXRAL  
**Email:** fixral3d@gmail.com  
**Last Updated:** December 30, 2025

## 🎯 Features

### Core Functionality
- **Blog System** - Full-featured blog with categories, tags, and search
- **Portfolio Management** - Showcase projects with images, 3D models, and detailed descriptions
- **Product Catalog** - E-commerce ready product management with reviews
- **Video Gallery** - YouTube integration with video management
- **Contact System** - Email-based contact form with validation
- **Admin Dashboard** - Comprehensive admin panel for content management

### Technical Features
- **Authentication** - NextAuth.js with secure session management
- **Database** - MongoDB with Mongoose ODM
- **File Storage** - Cloudinary integration for image/media management
- **3D Models** - Support for STL, OBJ, GLTF, GLB formats
- **SEO Optimization** - JSON-LD structured data, sitemaps, robots.txt
- **Performance** - Image optimization, caching strategies, lazy loading
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Accessibility** - WCAG AAA compliance with semantic HTML

### Advanced Features
- **Real-time Updates** - Redis caching for performance
- **Email Notifications** - Nodemailer integration
- **API Documentation** - Swagger/OpenAPI integration
- **Monitoring** - Performance tracking and health checks
- **PWA Support** - Progressive Web App capabilities
- **Dark Mode** - Theme switching with context API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB instance
- Cloudinary account (for media storage)
- SMTP credentials (for email)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd personal-blog

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Configure .env.local with your credentials:
# - MONGODB_URI
# - NEXTAUTH_SECRET
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET
# - SMTP credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
npm run deploy
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── portfolio/         # Portfolio pages
│   ├── blog/              # Blog pages
│   └── ...
├── components/            # React components
│   ├── portfolio/         # Portfolio components
│   ├── blog/              # Blog components
│   └── ui/                # UI components
├── lib/                   # Utilities & helpers
├── models/                # MongoDB schemas
├── types/                 # TypeScript types
├── hooks/                 # Custom React hooks
└── context/               # React context
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests

# Performance
npm run perf:check       # Profile build
npm run build:analyze    # Bundle analysis

# Deployment
npm run deploy           # Deploy to Vercel (production)
npm run deploy:preview   # Deploy preview
```

## 🔐 Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Media Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# API Keys
YOUTUBE_API_KEY=your-youtube-api-key
```

## 📦 Dependencies

### Core
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Database & Auth
- **MongoDB** - Database
- **Mongoose** - ODM
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing

### Media & Storage
- **Cloudinary** - Image/media hosting
- **Sharp** - Image optimization
- **Three.js** - 3D model rendering

### UI & Animation
- **Framer Motion** - Animations
- **Heroicons** - Icon library
- **Swiper** - Carousel component

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Playwright** - E2E testing

## 🎨 Design System

### Colors
- **Primary** - Brand color (customizable)
- **Secondary** - Accent color
- **Neutral** - Grays for text/backgrounds
- **Status** - Success, warning, error colors

### Typography
- **Display** - Large headings
- **Body** - Regular text
- **Mono** - Code blocks

### Components
- Buttons, inputs, cards, modals
- Navigation, breadcrumbs, pagination
- Forms, galleries, carousels
- Alerts, toasts, tooltips

## 🔄 Recent Updates (v3.3.0)

### Portfolio System Improvements
- ✅ Fixed portfolio detail page navigation
- ✅ Resolved infinite render loops
- ✅ Fixed hydration mismatches
- ✅ Improved image loading and positioning
- ✅ Enhanced 3D model support
- ✅ Optimized media gallery
- ✅ Fixed ESLint warnings
- ✅ Improved performance and caching

### Bug Fixes
- Portfolio cards now properly navigate to detail pages
- Image position issues resolved in media gallery
- Console warnings cleaned up
- Build pipeline optimized

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📊 Performance

- **Lighthouse Score** - 90+
- **Core Web Vitals** - All green
- **Bundle Size** - Optimized with code splitting
- **Image Optimization** - Automatic with Next.js Image

## 🔒 Security

- CSRF protection
- XSS prevention with DOMPurify
- SQL injection prevention (MongoDB)
- Rate limiting on API endpoints
- Secure password hashing
- HTTPS enforced in production

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📧 Support

For support, email fixral3d@gmail.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for utility-first styling
- MongoDB for reliable database
- All open-source contributors

---

**Creator:** FIXRAL (fixral3d@gmail.com)  
**Last Updated:** December 30, 2025  
**Version:** 3.3.0  
**Status:** Production Ready ✅

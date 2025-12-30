# Modern Portfolio & Blog Platform with 3D Model Support

[![Next.js](https://img.shields.io/badge/Next.js-14.2.33-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-003450?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-003450?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.160.1-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?style=for-the-badge&logo=vercel)](https://www.fixral.com)

[![Security](https://img.shields.io/badge/Security-Hardened-003450?style=for-the-badge&logo=shield)](SECURITY.md)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![ESLint](https://img.shields.io/badge/ESLint-Passing-075985?style=for-the-badge&logo=eslint)](https://eslint.org/)
[![TypeScript Check](https://img.shields.io/badge/TypeScript-Strict-0066cc?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-Active-2ea44f?style=for-the-badge&logo=github-actions)](https://github.com/erdemerciyas/personal-blog/actions)
[![Code Quality](https://img.shields.io/badge/Code_Quality-Optimized-075985?style=for-the-badge&logo=codeclimate)](https://github.com/erdemerciyas/personal-blog)

Modern, secure, and performant personal blog and portfolio platform with advanced 3D model support, built with Next.js 14, TypeScript, MongoDB, Three.js, and Tailwind CSS.

## 🚀 Live Demo

**[Live Site](https://www.fixral.com)** | **[Admin Panel](https://www.fixral.com/admin)** | **[API Health](https://www.fixral.com/api/health)**

> **Status**: **LIVE** | **Last Deploy**: 2025-12-30 | **Version**: v3.2.0 | **Build**: **OPTIMIZED**

## ✨ Features

### 🎨 Modern UI/UX
- **Responsive Design**: Perfect appearance on all devices
- **Dark/Light Mode**: Automatic theme support
- **Smooth Animations**: Fluid animations with Framer Motion
- **Accessibility Ready**: WCAG 2.1 AA compliant
- **Seamless Page Transitions**: Smooth fade transitions between pages
- **Intelligent Prefetching**: Predictive page loading on hover/focus
- **Layout Shift Prevention**: Stable layouts with sensible defaults
- **Responsive Navigation**: Professional header with mobile menu

### 🎨 Navigation System
- **Unified Navigation**: Consistent navigation across all pages
- **Transparent Headers**: Hero sections with transparent headers
- **Smooth Transitions**: 400ms fade transitions between pages
- **Prefetch Strategy**: Intelligent prefetching on hover/focus
- **Mobile Optimization**: Touch-friendly mobile menu with auto-close
- **Keyboard Navigation**: Full keyboard accessibility support
- **Responsive Design**: Adapts perfectly to all screen sizes

### 📊 Portfolio Management
- **Dynamic Portfolio**: Random project showcase
- **Advanced Filtering**: Category, technology, and date filters
- **Lightbox Gallery**: Full-screen image gallery with 3D model support
- **3D Model Integration**: STL, OBJ, GLTF, GLB file support
- **Interactive 3D Viewer**: Real-time 3D model preview with orbit controls
- **3D Model Downloads**: Secure file sharing with admin permissions
- **SEO Optimized**: Slug-based URL structure
- **Unified Hero Sections**: Consistent hero styling across all pages
- **Proportional Layouts**: Non-full-screen hero sections for better proportions

### 🛡️ Security Features
- **Rate Limiting**: API endpoint protection
- **CSRF Protection**: Cross-site request forgery protection
- **XSS Prevention**: HTML sanitization
- **Security Headers**: Comprehensive security headers
- **Input Validation**: Validation on all inputs

### ⚡ Performance Optimizations
- **Server-Side Rendering**: Fast page loading
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Code splitting and tree shaking
- **Client-Side Caching**: Smart API caching system
- **Lazy Loading**: On-demand loading
- **Seamless Transitions**: 400ms fade transitions with no white flash
- **Prefetch Strategy**: Intelligent page prefetching on hover/focus
- **Layout Stability**: Prevents cumulative layout shift (CLS)
- **Progress Feedback**: Visual loading bar with realistic progress

### 🎯 3D Model System
- **Multi-Format Support**: STL, OBJ, GLTF, GLB files
- **Live 3D Preview**: Interactive model viewer with React Three Fiber
- **Orbit Controls**: Rotate, zoom, and pan 3D models
- **Model Gallery**: Integrated with portfolio image gallery
- **Download Management**: Admin-controlled file sharing
- **Cloudinary Integration**: Secure cloud storage for 3D files

### 📰 News Management
- **Multilingual News**: Turkish and Spanish support
- **Admin CMS**: Full CRUD operations with WYSIWYG editor
- **AI Metadata Generation**: Automatic title, description, keywords
- **Cloudinary Integration**: Optimized image management
- **SEO Optimized**: JSON-LD schema, Open Graph tags
- **Responsive Carousel**: Featured news on homepage
- **Content Relationships**: Link news to portfolio items
- **Status Management**: Draft/Published workflow

### 📹 Video Management
- **YouTube Integration**: Simple video addition
- **Auto Metadata Fetch**: Video metadata retrieval
- **Bulk Operations**: Multi-video management
- **Modern Admin Panel**: User-friendly interface

### 📈 Monitoring & Analytics
- **Real-time Monitoring**: System health monitoring
- **Performance Metrics**: Detailed performance metrics
- **Error Tracking**: Comprehensive error catching
- **Health Check API**: System status endpoint

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Three.js**: 3D graphics library
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful helpers for React Three Fiber
- **Framer Motion**: Animations
- **Heroicons**: Modern icons

### Backend
- **Next.js API Routes**: Serverless functions
- **MongoDB**: NoSQL database
- **Mongoose**: ODM
- **NextAuth.js**: Authentication
- **Cloudinary**: Media management

### DevOps & Deployment
- **Vercel**: Hosting platform
- **GitHub Actions**: CI/CD
- **ESLint & Prettier**: Code quality
- **Husky**: Git hooks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/erdemerciyas/personal-blog.git
cd personal-blog
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the [.env.example](file:///c%3A/Users/erdem/Personal-Blog/.env.example) file to [.env.local](file:///c%3A/Users/erdem/Personal-Blog/.env.local):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/personal-blog

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Admin User
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME=Your Name
ADMIN_DEFAULT_PASSWORD=SecurePassword123!

# Mail Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🎯 3D Model Features

### Supported Formats
- **STL**: Stereolithography files with custom material rendering
- **OBJ**: Wavefront OBJ files with automatic material assignment
- **GLTF/GLB**: Full-featured 3D scenes with materials and animations

### Interactive Viewer
- **Orbit Controls**: Mouse/touch controls for rotation and zoom
- **Auto-centering**: Automatic model positioning and scaling
- **Material Rendering**: Format-specific material assignments
- **Performance Optimized**: Lazy loading and efficient rendering

### Admin Management
- **Drag & Drop Upload**: Easy file upload interface
- **Preview System**: Real-time 3D preview in admin panel
- **Download Permissions**: Granular control over file access
- **Cloud Storage**: Secure Cloudinary integration

### Portfolio Integration
- **Unified Gallery**: 3D models integrated with image gallery
- **Lightbox Support**: Full-screen 3D model viewing
- **Responsive Design**: Works on all devices and screen sizes
- **SEO Friendly**: Proper metadata and structured data

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin panel pages
│   │   └── models/        # 3D model management
│   ├── api/               # API routes
│   │   └── 3dmodels/      # 3D model API endpoints
│   ├── portfolio/         # Portfolio pages
│   └── ...
├── components/            # React components
│   ├── common/           # Common components
│   ├── portfolio/        # Portfolio components
│   │   └── PortfolioMediaGallery.tsx  # 3D + Image gallery
│   ├── admin/            # Admin components
│   ├── 3DModelViewer.tsx # 3D model viewer component
│   └── ModelGallery.tsx  # 3D model gallery
├── lib/                  # Utility functions
├── models/               # MongoDB models
├── types/                # TypeScript types
└── hooks/                # Custom React hooks
```

## 🔒 Security

### Security Level: **HIGH**

- **Rate Limiting**: API endpoint protection
- **CSRF Protection**: Cross-site request forgery protection
- **XSS Prevention**: HTML sanitization
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Input Validation**: Validation on all inputs
- **Authentication**: Secure authentication with NextAuth.js

## ⚡ Performance

### Bundle Sizes (Production)
- **Homepage**: 6.88 kB (109 kB First Load)
- **Portfolio**: 7.19 kB (158 kB First Load)
- **Portfolio Detail**: 11.8 kB (406 kB First Load)
- **Shared JS**: 87.8 kB (optimized)
- **Total Pages**: 77 static pages
- **Performance Score**: 92% (Excellent)

## 🚀 Deployment

### Production Deployment (Vercel)

**Current Status**: **LIVE** on Vercel  
**Deployment URL**: https://www.fixral.com  
**Last Deploy**: 2025-12-28  
**Build Time**: ~45 seconds  
**CI/CD Status**: ✅ Automated with GitHub Actions  

#### Quick Deploy
```bash
# Manual deployment (recommended)
npm run deploy

# Alternative deployment
vercel --prod
```

## 📝 Scripts

### Development
```bash
npm run dev              # Development server with hot reload
npm run build            # Production build with optimizations
npm run start            # Production server
npm run clean            # Clean build artifacts
npm run format           # Format code with Prettier
```

### Quality
```bash
npm run lint             # ESLint static analysis
npm run lint:fix         # ESLint auto-fix issues
npm run type-check       # TypeScript strict type checking
```

### Security & Performance
```bash
npm run security:check   # npm audit for vulnerabilities
npm run security:test    # Audit with moderate severity
npm run perf:check       # Performance profiling
npm run perf:analyze     # Build analysis
```

### Deployment
```bash
npm run deploy           # Deploy to production (Vercel)
npm run deploy:preview   # Deploy to preview (Vercel)
```

## 📚 Documentation

- [LICENSE](LICENSE) - MIT License
- [README.md](README.md) - This file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## 🚪 Code Quality & Standards

### ESLint & Code Style
- **ESLint Configuration**: Extends `next/core-web-vitals` and `next/typescript`
- **Prettier Integration**: Automatic code formatting
- **Strict Type Checking**: Full TypeScript strict mode enabled
- **No Unused Variables**: Enforced via ESLint rules
- **Accessibility**: WCAG 2.1 AA compliance

### Build & Type Safety
```bash
# Pre-commit checks
npm run type-check  # Verify TypeScript
npm run lint        # Check code style
npm run build       # Build verification
```

### Security Practices
- **Dependency Audits**: Regular npm audit checks
- **CSRF Protection**: Built-in with NextAuth.js
- **XSS Prevention**: HTML sanitization enabled
- **Security Headers**: Comprehensive CSP and headers
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Strict schema validation

## 🔄 GitHub Actions & CI/CD

### Automated Workflows
The project includes GitHub Actions workflows for:
- **Build Verification**: Checks TypeScript compilation
- **Lint & Format**: Ensures code quality standards
- **Type Safety**: Validates TypeScript strict mode
- **Security**: Runs npm audit for vulnerabilities

### Local Pre-commit Setup
Husky git hooks are configured to:
1. Run ESLint before commit
2. Validate TypeScript
3. Check for security issues

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Erdem Erciyas**
- Website: [fixral.com](https://www.fixral.com)
- GitHub: [@erdemerciyas](https://github.com/erdemerciyas)
- Email: info@fixral.com

---

⭐ If you like this project, please consider giving it a star!
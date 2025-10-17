# Modern Portfolio & Blog Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.33-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-003450?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-003450?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?style=for-the-badge&logo=vercel)](https://www.fixral.com)

[![Security](https://img.shields.io/badge/Security-Hardened-003450?style=for-the-badge&logo=shield)](SECURITY.md)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-075985?style=for-the-badge&logo=github-actions)](https://github.com/erdemerciyas/personal-blog/actions)
[![Code Quality](https://img.shields.io/badge/Code_Quality-Optimized-075985?style=for-the-badge&logo=codeclimate)](https://github.com/erdemerciyas/personal-blog)

Modern, secure, and performant personal blog and portfolio platform built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS.

## 🚀 Live Demo

**[Live Site](https://www.fixral.com)** | **[Admin Panel](https://www.fixral.com/admin)** | **[API Health](https://www.fixral.com/api/health)**

> **Status**: **LIVE** | **Last Deploy**: 2025-10-17 | **Version**: v2.6.0 | **CI/CD Pipeline**: **OPTIMIZED**

## ✨ Features

### 🎨 Modern UI/UX
- **Responsive Design**: Perfect appearance on all devices
- **Dark/Light Mode**: Automatic theme support
- **Smooth Animations**: Fluid animations with Framer Motion
- **Accessibility Ready**: WCAG 2.1 AA compliant

### 📊 Portfolio Management
- **Dynamic Portfolio**: Random project showcase
- **Advanced Filtering**: Category, technology, and date filters
- **Lightbox Gallery**: Full-screen image gallery
- **SEO Optimized**: Slug-based URL structure

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

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── portfolio/         # Portfolio pages
│   └── ...
├── components/            # React components
│   ├── common/           # Common components
│   ├── portfolio/        # Portfolio components
│   └── admin/            # Admin components
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
- **Homepage**: 9.18 kB (159 kB First Load)
- **Portfolio**: 7.42 kB (164 kB First Load)
- **Shared JS**: 87.3 kB (optimized)
- **Performance Score**: 92% (Excellent)

## 🚀 Deployment

### Production Deployment (Vercel)

**Current Status**: **LIVE** on Vercel  
**Deployment URL**: https://www.fixral.com  
**Last Deploy**: 2025-10-17  
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
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
```

### Quality & Testing
```bash
npm run lint             # ESLint check
npm run lint:fix         # ESLint fix
npm run type-check       # TypeScript check
npm run test:config      # Configuration test
```

### Deployment
```bash
npm run deploy           # Deploy to production
npm run security:check   # Security audit
npm run perf:check       # Performance test
```

## 📚 Documentation

- [CHANGELOG.md](CHANGELOG.md) - Detailed change history
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
- [SECURITY.md](SECURITY.md) - Security policies
- [LICENSE](LICENSE) - MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Erdem Erciyas**
- Website: [fixral.com](https://www.fixral.com)
- GitHub: [@erdemerciyas](https://github.com/erdemerciyas)
- Email: info@fixral.com

---

⭐ If you like this project, please consider giving it a star!
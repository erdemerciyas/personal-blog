# FIXRAL 3D - Advanced CMS & E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Version](https://img.shields.io/badge/Version-4.3.0-blue?style=for-the-badge)]()
[![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)]()

**Fixral 3D** is a production-grade, full-stack Content Management System (CMS) and E-Commerce platform built with Next.js 14 (App Router).

Designed specifically for 3D printing services, engineering portfolios, and digital product sales, its modular architecture also makes it an excellent fit for any corporate portfolio or agency website.

---

## Table of Contents

- [Key Features](#key-features)
- [Architecture](#architecture)
- [Design System](#design-system)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Security](#security)
- [Changelog](#changelog)
- [License](#license)

---

## Key Features

### Modular Architecture
- **Theme System (ThemeRegistry):** Dynamically loads the active theme from the database via `src/themes/`, no page-level changes needed for new themes.
- **Plugin System (PluginRegistry):** Event-driven server-side initialization of SEO, Analytics, and other plugins via `PluginManager`.
- **Full i18n Support:** All public pages operate under `[lang]` dynamic segments with Turkish and Spanish locale support via `next-intl`.
- **Server-Side Data Fetching:** Portfolio, services, and homepage data fetched directly in Server Components for zero client-side latency.

### E-Commerce Engine
- **Product Management:** Rich product listings with variations (color, size), categories, and tags.
- **Dynamic Cart:** Zustand-powered cart with real-time stock validation and price calculation.
- **Checkout Flow:** Complete order flow with address selection, payment, and order tracking.
- **Email Notifications:** Nodemailer-based order status updates and contact form responses.

### Portfolio & 3D Visualization
- **3D Model Viewer:** In-browser GLB/GLTF/STL model support via `@react-three/fiber`.
- **Advanced Showcase:** Dynamic masonry layouts, filtering, sorting, and search capabilities.
- **Services Module:** Dedicated page structures for Reverse Engineering, 3D Scanning, and more.

### Admin Panel
- **Full CMS:** Blog, News, Sliders, Page Settings, and complete content management.
- **Message Center:** Direct replies to contact forms and project applications from the panel.
- **Media Management:** Drag-and-drop image uploads via Cloudinary integration.
- **Security:** Role-based access control with NextAuth.js; Middleware and SSR protection.

### SEO & Performance
- **ISR Caching:** Incremental Static Regeneration for minimum TTFB and maximum SEO scores.
- **Dynamic Sitemap & Robots.txt:** Auto-generated from MongoDB with up-to-date links.
- **Canonical URL Management:** Independent canonical URL generation per page.
- **Hreflang Tags:** Proper multi-language SEO with hreflang alternate links.

---

## Architecture

```
Next.js 14 App Router
├── Server Components (SSR data fetching)
├── Client Components (interactive UI)
├── API Routes (public/ + admin/ separation)
├── Middleware (auth, i18n, rate limiting)
├── Theme Registry (dynamic theme loading)
└── Plugin Registry (event-driven plugins)
```

### Key Architectural Decisions
- **API Separation:** `api/public/` for unauthenticated endpoints, `api/admin/` for protected ones
- **Layout System:** Semantic HTML layouts with `AdminLayout` and `PublicLayout` wrappers
- **Page Templates:** Reusable `AdminListTemplate`, `AdminFormTemplate`, `PublicListTemplate`, `PublicDetailTemplate`
- **Component Strategy:** CVA (Class Variance Authority) based atomic components coexisting with legacy Fixral-prefixed components

---

## Design System

### Token-Based Architecture

The project uses a layered design token system:

| Layer | File | Purpose |
|-------|------|---------|
| CSS Variables | `src/app/globals.css` | `:root` color variables with `.dark` overrides |
| Tailwind Tokens | `tailwind.config.js` | Semantic color/shadow/spacing/z-index tokens |
| TypeScript Tokens | `src/styles/tokens.ts` | Runtime token access for JS logic |
| Utility | `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |

### UI Component Library

All CVA-based components live under `src/components/ui/`:

| Component | Variants | Description |
|-----------|----------|-------------|
| `Button` | primary, secondary, ghost, danger, outline, link | Sizes: xs, sm, md, lg, xl, icon |
| `Input` | default, error, success | Sizes: sm, md, lg. Supports label, hint, icons |
| `Card` | Polymorphic `as` prop | Renders as div, article, section, or li |
| `Badge` | default, primary, success, warning, danger, info, outline | Inline status indicators |
| `Alert` | default, success, warning, danger, info | With title and icon support |
| `Skeleton` | text, circle, rect | Loading placeholder with lines prop |
| `PageHeader` | - | Semantic `<header>` + `<hgroup>` |
| `DataTable` | - | Generic typed columns, sorting, empty state |
| `FormSection` | - | Semantic `<fieldset>` + `<legend>` |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14.2 (React 18 + App Router) |
| **Language** | TypeScript 5.6 |
| **Styling** | Tailwind CSS 3.4, CVA, tailwind-merge |
| **Animation** | Framer Motion |
| **Icons** | Heroicons |
| **Database** | MongoDB (Mongoose ODM) |
| **3D Graphics** | Three.js, React Three Fiber |
| **Authentication** | NextAuth.js |
| **Media** | Cloudinary |
| **i18n** | next-intl |
| **Email** | Nodemailer |
| **Testing** | Jest, Testing Library |
| **Linting** | ESLint, jsx-a11y, Prettier |
| **CI/CD** | GitHub Actions, Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── [lang]/              # i18n public pages (tr, es)
│   │   ├── page.tsx         # Homepage
│   │   ├── products/        # Product catalog & detail
│   │   ├── portfolio/       # Portfolio showcase
│   │   ├── services/        # Services listing
│   │   ├── haberler/        # News (Turkish)
│   │   ├── noticias/        # News (Spanish)
│   │   ├── contact/         # Contact form
│   │   └── cart/            # Shopping cart
│   ├── admin/               # Admin panel pages
│   │   ├── dashboard/       # Admin dashboard
│   │   ├── news/            # News management
│   │   ├── portfolio/       # Portfolio management
│   │   ├── products/        # Product management
│   │   ├── services/        # Service management
│   │   ├── categories/      # Category management
│   │   ├── models/          # 3D model management
│   │   └── languages/       # Language management
│   ├── api/
│   │   ├── public/          # Unauthenticated API routes
│   │   └── admin/           # Protected API routes
│   ├── globals.css          # CSS variables & global styles
│   └── layout.tsx           # Root layout with skip-to-content
├── components/
│   ├── ui/                  # Design system components (CVA)
│   ├── layouts/             # Layout system (Admin/Public)
│   ├── home/                # Homepage components
│   ├── portfolio/           # Portfolio components
│   └── admin/               # Admin-specific components
├── themes/
│   ├── default/             # Default theme templates
│   └── fixral/              # Fixral theme templates
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities, API helpers, services
├── models/                  # Mongoose models
├── types/                   # TypeScript type definitions
├── styles/                  # Design tokens (tokens.ts)
├── i18n/                    # Internationalization config
├── plugins/                 # Plugin system (PluginManager)
└── core/                    # Core utilities
```

---

## Getting Started

### Prerequisites
- **Node.js** v20 or higher (recommended)
- **npm** v9+
- **MongoDB** connection URI (local or Atlas)
- **Cloudinary** account (for image uploads)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/erdemerciyas/personal-blog.git
cd personal-blog

# 2. Install dependencies
npm install

# 3. Create .env.local (see Environment Variables section)
cp .env.example .env.local

# 4. Start development server
npm run dev
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database
MONGODB_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/fixral

# NextAuth Security
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_complex_secret_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=yyy

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app_password
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint (includes jsx-a11y) |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run type-check` | TypeScript type checking |
| `npm run clean` | Remove .next and out directories |
| `npm run format` | Format code with Prettier |
| `npm run deploy` | Deploy to Vercel (production) |
| `npm run deploy:preview` | Deploy preview to Vercel |

---

## Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

Ensure all environment variables are configured in the Vercel dashboard. If using MongoDB Atlas, configure Network Access appropriately.

### CI/CD Pipeline

The project includes a GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`):

1. **Code Quality** - ESLint, TypeScript type-checking, security audit
2. **Build** - Production build with environment fallbacks
3. **Deploy** - Automatic deployment to Vercel on `main` branch push

Required GitHub Secrets for deployment:
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `NEXTAUTH_SECRET` - NextAuth secret key
- `MONGODB_URI` - MongoDB connection string

### Manual Build

```bash
npm run lint          # Code quality check
npm run type-check    # TypeScript validation
npm run build         # Production build
npm start             # Start production server
```

---

## Security

- **Data Validation:** Zod schemas on all API endpoints
- **XSS Protection:** DOM-reflected data is sanitized
- **CSRF Protection:** Token-based form security
- **Middleware Security:** IP blocking, rate limiting, and authorization checks
- **Content Security:** Semantic HTML with proper ARIA attributes for accessibility

---

## Changelog

### v4.3.0 - Project Cleanup & CI/CD Optimization
- Removed stray build artifacts and nested `.next` directories
- Removed temporary migration scripts (`fix2.js`, `fix3.js`, `move-*.js`, `fix-api-imports.js`)
- Removed dead code (`route-enhanced.ts`) and redundant admin `tsconfig.json`
- Cleaned up `.kiro/` tooling directory and `SKILL.md`
- Updated `.gitignore` with comprehensive patterns
- Simplified CI/CD pipeline: removed redundant build steps (bundle analysis in quality job, duplicate performance build)
- Added `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` support in deploy job
- Aligned version numbers across `package.json` and `README.md`
- Updated Node.js prerequisite to v20

### v4.2.0 - Dynamic Site Settings & SEO
- Fixed `SiteSettings` model mismatch between admin and public API
- Dynamic `<title>` and `<meta description>` from database
- New `logoText` field in `SiteSettings` for brand name in navigation
- Force-dynamic rendering on root layout for latest DB values
- Dynamic JSON-LD structured data from database

### v4.1.0 - Modern Navigation & Icon Management
- Desktop nav redesign with framer-motion sliding active indicator
- Mobile nav slide-in drawer with headlessui Dialog
- Admin icon picker for page editor with visual Heroicons grid
- Removed unused `DynamicHeader`, `DynamicDesktopNav`, `DynamicMobileNav` components

### v4.0.0 - UI/UX Architecture Refactor
- Token-based design system (CSS variables, Tailwind config, TypeScript tokens)
- CVA-powered atomic components: Button, Input, Card, Badge, Alert, Skeleton
- Full semantic HTML migration with `ELEMENT_GUIDE.md`
- `AdminLayout` / `PublicLayout` with reusable page templates
- `DataTable` component with generic typed columns
- Removed 16 orphan files and hardcoded hex colors
- ESLint `jsx-a11y/recommended` enforcement

### v3.7.0 - Modular Architecture
- Full i18n integration with `[lang]` dynamic segments
- API endpoints separated into `public/` and `admin/`
- Plugin and Theme Registry systems
- SSR migration for portfolio pages

---

## License

This project is licensed for personal / closed-source use. Rights may not be copied or distributed without permission.

**Developer:** Erdem Erciyas

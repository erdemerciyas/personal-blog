# FIXRAL 3D - Advanced CMS & E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Version](https://img.shields.io/badge/Version-4.2.0-blue?style=for-the-badge)]()
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

### Token-Based Architecture (v4.0.0)

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

### Semantic HTML Standards

The project enforces semantic HTML via ESLint `jsx-a11y` rules and an [ELEMENT_GUIDE.md](ELEMENT_GUIDE.md):

- All layouts use proper landmarks (`<main>`, `<header>`, `<nav>`, `<aside>`, `<footer>`)
- Card grids use `<ul>/<li>` patterns
- Navigation elements carry `aria-label` attributes
- Skip-to-content links on all layouts
- Heading hierarchy enforced (`h1` > `h2` > `h3`, no skipping)
- Z-index uses semantic tokens (`z-dropdown`, `z-modal`, `z-tooltip`)

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (React 18 + App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, CVA, tailwind-merge |
| **Animation** | Framer Motion |
| **Icons** | Heroicons |
| **Database** | MongoDB (Mongoose ODM) |
| **3D Graphics** | Three.js, React Three Fiber |
| **Authentication** | NextAuth.js |
| **Validation** | React Hook Form, Zod |
| **Media** | Cloudinary |
| **i18n** | next-intl |
| **Email** | Nodemailer |
| **Testing** | Jest |
| **Linting** | ESLint, jsx-a11y, Prettier |

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
│   │   ├── Button/          # Button with variants
│   │   ├── Input/           # Input with states
│   │   ├── Card/            # Polymorphic card
│   │   ├── Badge/           # Status badges
│   │   ├── Alert/           # Alert messages
│   │   ├── Skeleton/        # Loading skeletons
│   │   ├── PageHeader/      # Semantic page header
│   │   ├── DataTable/       # Generic data table
│   │   └── FormSection/     # Fieldset-based form section
│   ├── layouts/             # Layout system
│   │   ├── AdminLayout/     # Admin sidebar, topbar, breadcrumb
│   │   ├── PublicLayout/    # Public navbar, footer, container
│   │   └── templates/       # Page templates (Admin/Public List/Form/Detail)
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
└── middleware.ts            # Auth, i18n, rate limiting middleware
```

---

## Getting Started

### Prerequisites
- **Node.js** v18.17.0 or higher
- **npm** or **yarn**
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
| `npm run deploy` | Deploy to Vercel (production) |
| `npm run deploy:preview` | Deploy preview to Vercel |

---

## Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

Ensure all environment variables are configured in the Vercel dashboard. If using MongoDB Atlas, configure Network Access appropriately.

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

### v4.2.0 - Dynamic Site Settings & SEO

#### Site Settings → Frontend Sync
- **Fixed model mismatch:** Admin panel saves to `SiteSettings` model; public API (`/api/public/settings`) now reads from the same model instead of the legacy `Settings` model
- **Dynamic metadata:** `<title>` and `<meta description>` are now pulled from database (`siteName` → title, `slogan` → description) instead of hardcoded values
- **Removed hardcoded strings:** Cleaned up "FIXRAL Blog", "Fixral — Dijital Çözümler ve Hizmetler", and `config.app.name` references in layout, JSON-LD, and page metadata

#### Logo Text Feature
- **New `logoText` field:** Added to `SiteSettings` model — a short brand name displayed next to the logo in navigation
- **Admin UI:** "Logo Kelimesi" input added under Logo & Görseller section with descriptive helper texts for Site Adı (title) and Slogan (meta description)
- **Responsive display:** `logoText` visible on both mobile and desktop header, and as mobile nav drawer title

#### Layout & SEO Fixes
- **Force-dynamic rendering:** Re-enabled `export const dynamic = 'force-dynamic'` on root layout so metadata always reflects latest DB values
- **Invalid URL fix:** Added fallback for `config.app.url` when `NEXTAUTH_URL` env var is not set (prevents crash in catch block)
- **Dynamic JSON-LD:** Organization and WebSite structured data now use `siteName` and `siteUrl` from database

### v4.1.0 - Modern Navigation & Icon Management

#### Navigation Redesign
- **Desktop Nav:** Clean text+icon links with framer-motion `layoutId` sliding active indicator
- **Mobile Nav:** Slide-in drawer from right (replaced dropdown) with headlessui Dialog for focus trap, scroll lock, and ESC-to-close
- **Staggered animations:** Mobile nav links animate in sequence with framer-motion
- **Refined actions cluster:** Account & cart buttons separated by border divider, cart badge with spring scale animation
- **CTA button:** Polished hover lift and active scale effects
- **Transparent/solid header:** Smooth scroll transition preserved with cleaner styling

#### Admin Icon Management
- **Icon picker in page editor:** Visual grid of 15 Heroicons in the "Sayfa Düzenle" modal
- **Icon display in page list:** Selected icon shown in page list items (replaces generic document icon)
- **Icon removal:** "Yok" option to clear icon from a page
- **`availableIcons` export:** Centralized icon list in `src/lib/icons.ts` for reuse

#### Code Cleanup
- Removed unused `DynamicHeader`, `DynamicDesktopNav`, `DynamicMobileNav` components (-623 lines)
- New `MobileNavLink` component for encapsulated stagger animation logic
- Simplified Header.tsx: removed inline mobile cart button (moved to drawer)

### v4.0.0 - UI/UX Architecture Refactor

#### Design System Foundation
- Token-based design system with CSS variables, Tailwind config, and TypeScript tokens
- CVA-powered atomic components: Button, Input, Card, Badge, Alert, Skeleton
- `cn()` utility (clsx + tailwind-merge) for class composition
- Dark mode support via CSS variable overrides

#### Semantic HTML & Accessibility
- Full DOM audit and semantic HTML migration across all pages
- `ELEMENT_GUIDE.md` documenting landmark, heading, and ARIA conventions
- All card grids converted to `<ul>/<li>` patterns (admin, public, themes)
- Skip-to-content links on all layouts
- `aria-label` on all `<nav>` elements; `aria-expanded` on toggle buttons
- Pagination elements wrapped in `<nav aria-label="...">`
- ESLint `jsx-a11y/recommended` enforcement with heading, role, and anchor rules

#### Layout & Template System
- `AdminLayout` (sidebar, topbar, breadcrumb) with semantic landmarks
- `PublicLayout` with container size variants
- 4 reusable page templates: AdminList, AdminForm, PublicList, PublicDetail
- `PageHeader` using `<header>` + `<hgroup>`, `FormSection` using `<fieldset>` + `<legend>`
- Polymorphic `Card` component with `as` prop (div/article/section/li)

#### UI Patterns
- `DataTable` component with generic typed columns, sorting, and loading states
- Social media color tokens (twitter, facebook, linkedin)
- Semantic z-index tokens (dropdown, sticky, fixed, modal, popover, tooltip)
- PR template with UI/Semantic HTML checklist

#### Code Cleanup
- Removed 16 orphan files (unused hooks, libs, layouts, backup files, UI stubs)
- Removed hardcoded hex colors in favor of Tailwind tokens
- Removed redundant `role="list"` attributes across 9 files
- Cleaned up barrel exports in `ui/index.ts`
- All inline styles verified as legitimate dynamic usage (65 instances)

#### Theme Integration
- Default and Fixral theme templates updated with semantic HTML
- Blog templates: `<div>` grids migrated to `<ul>/<li>`
- Single templates: tag lists migrated to `<ul>/<li>`
- Portfolio templates already use `ModernProjectGrid` with `motion.ul`

### v3.7.0 - Modular Architecture

- Full i18n integration with `[lang]` dynamic segments
- API endpoints separated into `public/` and `admin/`
- Plugin and Theme Registry systems
- SSR migration for portfolio pages
- Glassmorphism navigation design
- Performance fixes (removed 30s header polling, fixed navigation loops)

---

## License

This project is licensed for personal / closed-source use. Rights may not be copied or distributed without permission.

**Developer:** Erdem Erciyas

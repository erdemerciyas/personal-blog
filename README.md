# FIXRAL - Advanced Personal CMS & Portfolio Platform

![Status](https://img.shields.io/badge/status-production--ready-success)
![Version](https://img.shields.io/badge/version-3.5.2-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Fixral** is a state-of-the-art, production-ready Content Management System (CMS) designed specifically for personal branding, professional portfolios, and integrated e-commerce. Built on the robust **Next.js 14** framework, it delivers high performance, exceptional SEO, and a seamless user experience.

This platform is not just a template; it is a fully extensible application engine featuring a powerful admin dashboard, a dynamic plugin system, and a flexible theme engine, making it suitable for developers, designers, and creators who need a professional online presence.

---

## 🌟 Key Features

### 🏢 Core Architecture
*   **Next.js 14 App Router**: Leverages React Server Components (RSC) for lightning-fast page loads and optimal SEO performance.
*   **Modular Plugin Architecture**: Easily extend functionality through a structured `src/plugins` system. Includes built-in plugins for advanced SEO and analytics.
*   **Dynamic Theme Engine**: Switch and customize themes instantly. The system supports full UI customization (colors, typography, spacing) directly from the admin panel without touching code.
*   **Middleware Security**: Intelligent edge-based security handling rate limiting, request validation, and route protection.

### 📦 Content Management (Admin Panel)
The heart of Fixral is its comprehensive Admin Dashboard, designed for ease of use and power:

*   **Dashboard Analytics**: Visual usage statistics, recent activity feeds, and system health monitoring.
*   **E-Commerce Capabilities**:
    *   **Product Management**: Full catalog control with categories, variants, and inventory tracking.
    *   **Order System**: Manage orders, customer details, and status workflows.
    *   **Reviews**: Moderation system for user-generated product reviews.
*   **Portfolio Engine**: specialized showcase for projects with support for high-resolution images, videos, and **interactive 3D models (GLB/GLTF/STL)**.
*   **Content Modules**:
    *   **Blog/News**: robust rich-text editor, categorization, and tagging.
    *   **Services**: Structured service listings.
    *   **Pages**: Dynamic page creation and management.
*   **Media Library**: Integrated **Cloudinary** media management for optimized asset delivery, handling uploads, transformations, and organization.

### ⚙️ System & DevOps
*   **Enterprise Backup**: One-click full system backup (Database + Media) to portable archives.
*   **Security First**: Built-in protection against common web vulnerabilities, secure authentication via NextAuth.js, and rigorous input validation.
*   **GitHub Integration**: (Optional) Admin panel integration for triggering updates or managing repository state.
*   **Automated SEO**: Dynamic sitemap generation, structured data (JSON-LD) injection, and meta-tag management.

---

## 🛠 Technology Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (React 18)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Framer Motion (Animations)
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: NextAuth.js
*   **State Management**: React Context + Custom Hooks
*   **Media**: Cloudinary
*   **Validation**: Zod / Validator.js
*   **Icons**: Heroicons, React Icons

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   **Node.js**: v18.17 or higher
*   **MongoDB**: Local instance or MongoDB Atlas URI
*   **Cloudinary Account**: For media storage

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/erdemerciyas/personal-blog.git

# Navigate to directory
cd personal-blog

# Install dependencies
npm install
```

### 2. Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Connection
MONGODB_URI=mongodb://localhost:27017/fixral-cms

# Authentication Credentials (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secure-secret-key

# Cloudinary (Media Assets)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email_user
SMTP_PASS=your_email_password
```

### 3. Running the Application

```bash
# Start Development Server
npm run dev
# Access at http://localhost:3000

# Build for Production
npm run build

# Start Production Server
npm start
```

---

## 🏗️ Project Structure

The codebase is organized for scalability:

```
src/
├── app/                 # Next.js 14 App Router (Pages & API)
│   ├── (public)/        # Public website routes
│   ├── admin/           # Admin dashboard routes
│   └── api/             # Backend API endpoints
├── components/          # React Components
│   ├── admin/           # Admin-specific UI components
│   └── ui/              # Shared Design System components
├── core/                # Core Application Logic
│   ├── plugins/         # Plugin system loader
│   └── theme/           # Theme engine logic
├── lib/                 # Shared Utilities (DB, Auth, Helpers)
├── models/              # MongoDB Data Schemas (Mongoose)
├── hooks/               # Custom React Hooks
└── types/               # TypeScript Definitions
```

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

**Developed by FIXRAL Team**

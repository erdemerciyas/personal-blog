# FIXRAL - Enterprise Personal CMS

![Status](https://img.shields.io/badge/status-production--ready-success)
![Version](https://img.shields.io/badge/version-3.5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**FIXRAL** is an advanced, production-grade Content Management System (CMS) tailored for personal branding, portfolios, and e-commerce. Built with the latest **Next.js 14** stack, it offers a robust admin dashboard, extensive content modeling, and a high-performance frontend.

---

## 🌟 Key Features

### 🏢 Core Architecture
- **Next.js 14 App Router**: Utilizing the latest React Server Components (RSC) for superior performance and SEO.
- **Plugin System**: Modular architecture allowing feature extension via `src/plugins` (Includes SEO plugin by default).
- **Theme Engine**: Support for multiple themes with a built-in "Fixral" and "Default" theme system.
- **Middleware Security**: Custom middleware for intelligent rate limiting, admin route protection, and suspicious activity blocking.

### 📦 Content Management (Admin Panel)
- **Dashboard Analytics**: Real-time overview with **Dynamic Activity Feeds** (New Users, Messages, Content updates).
- **Theme Engine**: Advanced customization including **Typography Colors**, Fonts, and Spacing via the admin panel.
- **Dynamic Modules**:
    - **Products**: Complete e-commerce catalog with categories, reviews, and order management.
    - **Portfolio**: Showcase projects with rich media support (Images, Videos, 3D Models).
    - **News/Blog**: Full-featured blog engine with categories and rich text editing.
    - **Services**: Service listing management.
- **Media Library**: Integrated Cloudinary support for optimizing and managing assets.
- **3D Model Viewer**: Native support for **GLB, GLTF, and STL** files, perfect for industrial or creative portfolios.

### ⚙️ System & DevOps
- **Backup & Restore**: Enterprise-level backup system capable of exporting all 24+ data models and media assets to a portable ZIP file.
- **GitHub Updates**: Integrated efficient system updates directly from the admin panel connected to GitHub.
- **SEO Optimization**: Automatic sitemap generation, structured data (JSON-LD), and dynamic meta tags.

---

## 🏗️ Project Structure

The project follows a scalable feature-first architecture:

```
src/
├── app/                 # Next.js 14 App Router
│   ├── (public)/        # Public facing pages (Products, Portfolio, Blog)
│   ├── admin/           # Secured Admin Dashboard
│   └── api/             # Backend API Routes (REST)
├── components/          # React Components
│   ├── admin/           # Dashboard specific components
│   └── ui/              # Reusable UI kit
├── core/                # Core engines (Theme, Plugin systems)
├── lib/                 # Utilities (DB, Auth, Helpers)
├── models/              # Mongoose Data Models (24+ Schemas)
├── plugins/             # Plugin modules
└── themes/              # Theme definitions (Fixral, Default)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17 or higher
- **MongoDB**: A running instance (Local or Atlas)
- **Cloudinary**: API keys for media management

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/erdemerciyas/personal-blog.git

# Navigate to project
cd personal-blog

# Install dependencies
npm install
```

### 2. Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/fixral-cms

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this

# Cloudinary (Media)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
```

### 3. Running the App

```bash
# Development Server
npm run dev

# Production Build
npm run build
npm start
```

---

## 🛠️ Usage Scripts

We provide several utility scripts for maintenance and testing:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with auto-cleanup |
| `npm run build` | Compiles the application for production |
| `npm run start` | Runs the compiled production build |
| `npm run clean` | Removes `.next` and `out` directories |
| `npm run lint` | Runs ESLint for code quality |
| `npm run type-check` | Runs TypeScript validation |
| `npm audit` | Checks for security vulnerabilities |

---

## 🤝 Contributing & Extension

**Fixral CMS** is designed to be extensible.

- **Adding Plugins**: Create a new directory in `src/plugins/` and implement the `Plugin` interface.
- **Creating Themes**: Define a new theme config in `src/themes/` and register it in the admin panel.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed by FIXRAL Team**

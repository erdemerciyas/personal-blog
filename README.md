# FIXRAL - Personal Blog & Portfolio CMS

**Advanced Personal Blog & Portfolio Platform** built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS.
Designed for high performance, ease of use, and complete content management.

![Status](https://img.shields.io/badge/status-production--ready-success)
![Version](https://img.shields.io/badge/version-3.3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## � Key Features (v3.3.0)

### 🛡️ System & Security
- **Full Site Backup & Restore**: One-click export of ALL site data (19+ models) including images/media into a ZIP archive. Intelligent restoration engine handles deduplication and media recovery.
- **GitHub-Integrated Updates**: Admin panel checks your GitHub repository for new releases and allows one-click system updates (`git pull` based).
- **Authentication**: Secure NextAuth.js implementation with role-based access control (Admin/User).

### 📝 Content Management
- **Dashboard**: Comprehensive stats, charts, and management tools.
- **Dynamic Content**: Manage Portfolio, Blogs, Products, Services, Sliders, and Settings directly from the UI.
- **Media Manager**: Cloudinary integration for seamless image optimization and storage.
- **3D Model Support**: Native support for uploading and displaying 3D models (GLB/GLTF/STL) with an interactive 3D viewer.

### ⚡ Technical Excellence
- **Tech Stack**: Next.js 14 (App Router), TypeScript, MongoDB (Mongoose), Tailwind CSS.
- **Performance**: Redis caching layer, optimized images (Next/Image), and code splitting.
- **SEO Ready**: Auto-generated sitemaps, JSON-LD schemas, and meta tag management.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js 18+
- MongoDB Database
- Cloudinary Account
- SMTP Server (for emails)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/erdemerciyas/personal-blog.git
cd personal-blog

# Install dependencies
npm install

# Setup Environment
cp .env.example .env.local
# Edit .env.local with your DB and API keys
```

### 3. Usage

```bash
# Start Development Server
npm run dev

# Build for Production
npm run build && npm start
```

---

## 🛠️ Admin Features

### Backup & Export
Navigate to `Admin > Backup`.
- **Export**: Choose to download just data (JSON) or full media archives (ZIP).
- **Import**: Upload a previously generated backup to restore the entire site or migrating to a new server.

### System Updates
Navigate to `Admin > Updates`.
- The system automatically checks `erdemerciyas/personal-blog` for new releases.
- Click "Update Now" to pull the latest code changes directly from GitHub.

---

## 🧪 Development

### Scripts
- `npm run dev`: Dev server
- `npm run build`: Production build
- `npm run lint`: Run ESLint
- `npm run test:e2e`: Run Playwright tests

### Folder Structure
- `src/app`: Next.js App Router pages
- `src/components`: UI components (Admin, Blog, Portfolio)
- `src/models`: Mongoose schemas (19+ data models)
- `src/lib`: Utilities (DB, Auth, Cloudinary)

---

## 🤝 Support & License

**Creator:** FIXRAL (fixral3d@gmail.com)  
**License:** MIT  

For detailed cloning and white-labeling instructions, see [PROJECT_CLONE_GUIDE.md](./PROJECT_CLONE_GUIDE.md).

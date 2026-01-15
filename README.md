# FIXRAL 3D - Advanced CMS & E-commerce Platform

![Fixral Banner](https://via.placeholder.com/1200x400.png?text=FIXRAL+CMS+%26+PORTFOLIO)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()

**Fixral 3D** is a production-grade, full-stack CMS and E-commerce platform built with Next.js 14 (App Router). It is designed specifically for 3D printing services, engineering portfolios, and digital product sales, but its modular architecture makes it suitable for any professional portfolio or agency website.

Unifying **Content Management**, **E-commerce**, and **3D Visualization**, Fixral provides a comprehensive solution for modern web presence.

---

## 🌟 Key Features

### 🛒 Advanced E-Commerce Engine
*   **Product Management**: Create rich product listings with multiple variants, categories, and tags.
*   **Dynamic Cart System**: Persistent shopping cart with real-time stock validation and price calculation.
*   **Checkout Flow**: Integrated order processing system ready for payment gateway integration (Iyzico structure prepared).
*   **Order Management**: Detailed admin view for order tracking, status updates (Preparing, Shipped, etc.), and customer notifications.
*   **Email Notifications**: Automated transactional emails for orders, status updates, and replies using Nodemailer.

### 🎨 Portfolio & 3D Visualization
*   **3D Model Viewer**: Built-in support for interactive 3D models (GLB/GLTF/STL) using `@react-three/fiber` and `@react-three/drei`. Users can rotate, zoom, and inspect models directly in the browser.
*   **Project Showcase**: High-fidelity portfolio pages with masonry layouts, detailed descriptions, and gallery support.
*   **Services Module**: Dedicated sections for offering services like "Reverse Engineering", "3D Scanning", etc.

### ⚡ Powerful Admin Dashboard
*   **CMS Capability**: Manage all site content including Blogs (Rich Text Editor), News, Slides, and Pages.
*   **Message Center**: A centralized inbox for contact forms, project applications, and product questions. Includes **Direct Reply** functionality and email integration.
*   **Resource Management**: Drag-and-drop file uploads (Cloudinary), Backup & Restore system, and SEO settings control.
*   **Analytics**: Dashboard overview of site performance, recent orders, and messages.

### 🛡️ Security & Performance
*   **Authentication**: Secure role-based access control (Admin/User) using **NextAuth.js**.
*   **Database**: Robust data modeling with **MongoDB** & Mongoose.
*   **Media Optimization**: Automatic image optimization and delivery via Cloudinary.
*   **SEO Optimized**: Server-Side Rendering (SSR), dynamic metadata, sitemaps, and JSON-LD structure for maximum search engine visibility.

---

## 🛠 Technology Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (React 18, App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Headless UI, Heroicons
*   **Animations:** Framer Motion
*   **Database:** MongoDB (Mongoose ODM)
*   **3D Graphics:** Three.js, React Three Fiber
*   **Authentication:** NextAuth.js
*   **Forms & Validation:** React Hook Form, Zod
*   **Media Storage:** Cloudinary
*   **Email:** Nodemailer (SMTP)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

*   **Node.js**: v18.17.0 or higher
*   **npm** or **yarn**
*   **MongoDB**: A running instance (Local or Atlas)
*   **Cloudinary Account**: For media asset management

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/erdemerciyas/personal-blog.git
    cd personal-blog
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env.local` file in the root directory and populate it with your credentials:

    ```bash
    # Database
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/fixral-db

    # NextAuth (Authentication)
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_super_secret_key_openssl_rand_base64_32

    # Cloudinary (Media)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # SMTP (Email Service)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@example.com
    SMTP_PASS=your_app_specific_password
    
    # Admin Seed (Optional - for initial setup)
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=securepassword
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to see the application.

---

## 📦 Deployment

The application is optimized for deployment on **Vercel**, but can be deployed to any containerized environment (Docker, VPS).

### Building for Production

To create an optimized production build:

```bash
npm run build
```

This command generates static pages, optimizes assets, and prepares the serverless functions.

### Start Production Server

```bash
npm start
```

---

## 🧪 Quality Assurance

This project maintains high code quality standards:

*   **Linting:** `npm run lint` - Ensures code style consistency.
*   **Type Checking:** `npm run type-check` - Validates TypeScript types.
*   **Security Audit:** `npm run security:check` - Scans for vulnerabilities.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed by Erdem Erciyas**

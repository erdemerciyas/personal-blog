export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ProjectDetail {
  title: string;
  category: string;
  client: string;
  date: string;
  description: string;
  challenge: string;
  solution: string;
  images: ProjectImage[];
}

export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Model3D {
  _id: string;
  url: string;
  name: string;
  format: 'stl' | 'obj' | 'gltf' | 'glb';
  size: number;
  downloadable: boolean;
  publicId: string;
  uploadedAt: string;
}

export interface PortfolioItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  // Geriye uyumluluk için eski alanları koruyoruz
  categoryId?: Category;
  category?: Category;
  // Yeni çoklu kategori desteği
  categoryIds?: Category[];
  categories?: Category[];
  client: string;
  completionDate: string;
  technologies: string[];
  coverImage: string;
  images?: string[];
  projectUrl?: string;
  githubUrl?: string;
  // 3D Model desteği
  models3D?: Model3D[];
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectDetails = {
  [key: string]: ProjectDetail;
} 
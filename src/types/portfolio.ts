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

export interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: Category;
  client: string;
  completionDate: string;
  technologies: string[];
  coverImage: string;
  images?: string[];
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectDetails = {
  [key: string]: ProjectDetail;
} 
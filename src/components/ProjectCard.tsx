import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProjectSummary } from '@/types/portfolio';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import HTMLContent from './HTMLContent';

interface ProjectCardProps {
  project: ProjectSummary;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const parent = e.currentTarget.parentElement;
    if (parent) {
      parent.classList.add('bg-gradient-to-br', 'from-teal-100', 'to-blue-100');
      const fallback = document.createElement('div');
      fallback.className = 'flex flex-col items-center justify-center h-full text-teal-600';
      fallback.innerHTML = `
        <div class="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <span class="text-sm font-medium">${project.category}</span>
      `;
      parent.appendChild(fallback);
    }
  };

  return (
    <Link href={`/portfolio/${project.slug}`} legacyBehavior>
      <a className="card group block overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="relative w-full h-64 overflow-hidden rounded-t-xl">
          <Image 
            src={project.coverImage || '/images/projects/default-project.jpg'}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors duration-200 line-clamp-2">
            {project.title}
          </h3>
          {project.description && (
            <HTMLContent 
              content={project.description} 
              className="text-sm text-slate-600 mb-4 line-clamp-2"
              truncate={140} // yaklaşık 2 satır için karakter limiti
            />
          )}
          <div className="flex items-center justify-end text-sm font-semibold text-teal-500 group-hover:text-teal-600 transition-colors duration-200">
            Detayları Gör
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300" />
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ProjectCard; 
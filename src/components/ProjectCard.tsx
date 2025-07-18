import React from 'react';
import { ProjectSummary } from '@/types/portfolio';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import HTMLContent from './HTMLContent';
import { CardImage } from './OptimizedImage';
import { CardLink } from './SmartLink';

interface ProjectCardProps {
  project: ProjectSummary;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <CardLink 
      href={`/portfolio/${project.slug}`}
      className="card group block overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      <div className="relative w-full h-64 overflow-hidden rounded-t-xl bg-slate-200">
        <CardImage 
          src={project.coverImage || 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop&crop=center'}
          alt={project.title}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300 z-10"></div>
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
    </CardLink>
  );
};

export default ProjectCard; 
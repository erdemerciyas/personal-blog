import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProjectSummary } from '@/types/portfolio';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface ProjectCardProps {
  project: ProjectSummary;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/portfolio/${project.id}`} legacyBehavior>
      <a className="card group block overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="relative w-full h-64 overflow-hidden rounded-t-xl">
          <Image 
            src={project.coverImage || 'https://via.placeholder.com/400x300?text=Proje+G%C3%B6rseli'}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-teal-600 transition-colors duration-200 line-clamp-2">
            {project.title}
          </h3>
          <div className="flex items-center justify-end text-sm font-semibold text-teal-500 group-hover:text-teal-600 transition-colors duration-200">
            Detayları Gör
            <ArrowRightIcon className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ProjectCard; 
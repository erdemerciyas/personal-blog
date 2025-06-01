import React from 'react';
import { ProjectSummary } from '@/types/portfolio';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: ProjectSummary[];
  limit?: number; 
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, limit }) => {
  const displayedProjects = limit ? projects.slice(0, limit) : projects;

  if (!displayedProjects || displayedProjects.length === 0) {
    return <p className="text-center text-slate-500 py-10">Henüz proje bulunmuyor.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {displayedProjects.map((project) => (
        <ProjectCard key={project.id || project.title} project={project} />
      ))}
    </div>
  );
};

export default ProjectGrid; 
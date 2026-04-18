import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  index: number;
  key?: string | number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Link
      to={`/work/${project.id}`}
      className="group relative block w-full border-b border-border py-16 md:py-24 overflow-hidden bg-bg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 z-10">
          <span className="text-[10px] md:text-xs font-sans tracking-[0.4em] text-muted uppercase">
            0{index + 1} / {project.category}
          </span>
          <h2 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter group-hover:italic transition-all duration-700 ease-out">
            {project.title}
          </h2>
        </div>
        
        <div className="relative w-full md:w-[30vw] aspect-video overflow-hidden rounded-sm opacity-0 group-hover:opacity-100 translate-y-10 group-hover:translate-y-0 transition-all duration-700 ease-out z-0 bg-muted/5">
          <video
            src={project.video}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
          />
        </div>

        <div className="flex flex-col items-start md:items-end gap-1 text-xs font-sans tracking-[0.2em] text-muted uppercase z-10">
          <span>{project.year}</span>
          <span>{project.client}</span>
        </div>
      </div>
    </Link>
  );
}

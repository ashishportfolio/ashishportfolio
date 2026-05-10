import { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import { supabase } from '../lib/supabase';
import { Project } from '../types';
import { isVideo } from '../lib/utils';

export default function Work() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('year', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg">
        <div className="font-display text-4xl animate-pulse tracking-tighter">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pt-12 md:pt-16 lg:pt-20 pb-10 md:pb-12 lg:pb-16 px-6 md:px-[8%] bg-bg overflow-x-hidden text-center lg:text-left">
      <div className="mb-6 md:mb-8 lg:mb-12 w-full">
        <Reveal type="text" className="text-4xl md:text-[5.5vw] font-display font-medium leading-[1.1] tracking-tighter text-center lg:text-left">
          Project Index
        </Reveal>
      </div>

      <div className="flex flex-col gap-6 md:gap-12 lg:gap-20">
        {projects.map((project, i) => (
          <div key={project.id} className="project-scene relative">
            <ProjectCard project={project} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

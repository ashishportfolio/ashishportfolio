import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomCursor from '../components/CustomCursor';
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
        <div className="font-display text-4xl animate-pulse tracking-tighter">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-40 pb-10 lg:pb-20 bg-bg overflow-x-hidden text-center lg:text-left">
      <CustomCursor />
      <div className="px-5 md:px-11 mb-12 lg:mb-32 w-full">
        <Reveal type="text" className="text-6xl md:text-[8vw] font-display font-medium leading-[0.8] uppercase text-center lg:text-left">
          PROJECT <br /> <span className="font-serif italic font-normal">INDEX</span>
        </Reveal>
      </div>

      <div className="flex flex-col gap-12 lg:gap-32">
        {projects.map((project) => {
          console.log(`Work project ${project.title} media:`, { image: project.image, video: project.video });
          return (
            <section 
              key={project.id} 
              className="project-scene relative flex flex-col items-center px-5 md:px-11"
            >
              <div className="w-full">
                <Reveal type="image">
                  <Link 
                    to={`/work/${project.slug}`}
                    className="project-image-container relative group block overflow-hidden w-full aspect-[16/9] md:aspect-[21/9]"
                    data-project-id={project.id}
                    data-project-video={project.hover_video || project.video}
                  >
                    {/* Main Media (Hybrid Image or Video) */}
                    <div className="w-full h-full transition-all duration-500">
                      {isVideo(project.image) ? (
                        <video 
                          src={project.image}
                          autoPlay muted loop playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ease-out"
                        />
                      ) : project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ease-out"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                           <span className="text-xs uppercase tracking-widest text-muted">No Media</span>
                        </div>
                      )}
                    </div>


                  </Link>
                </Reveal>
                
                <div className="mt-12 flex flex-col gap-4 w-full">
                  <Reveal type="text" className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tighter">
                    {project.title}
                  </Reveal>
                  <Reveal type="fade" delay={0.2}>
                    <p className="text-muted text-[10px] md:text-xs leading-relaxed w-full uppercase tracking-[0.2em] font-medium">
                      {project.overview || project.description}
                    </p>
                  </Reveal>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

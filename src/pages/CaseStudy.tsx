import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ImageReveal from '../components/ImageReveal';
import CustomCursor from '../components/CustomCursor';
import Reveal from '../components/Reveal';
import { supabase } from '../lib/supabase';
import { Project } from '../types';
import { isVideo } from '../lib/utils';

export default function CaseStudy() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [nextProject, setNextProject] = useState<{ slug: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectData() {
      setIsLoading(true);
      try {
        // Fetch specific project by slug directly for freshness
        const { data: currentProject, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .single();

        if (projectError) throw projectError;

        if (currentProject) {
          setProject(currentProject);
          
          // Fetch all projects just to determine the "Next Project"
          const { data: allProjects } = await supabase
            .from('projects')
            .select('slug, title')
            .order('year', { ascending: false });

          if (allProjects) {
            const currentIndex = allProjects.findIndex(p => p.slug === slug);
            const next = allProjects[(currentIndex + 1) % allProjects.length];
            setNextProject({ slug: next.slug, title: next.title });
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg">
        <div className="font-display text-4xl animate-pulse tracking-tighter">LOADING...</div>
      </div>
    );
  }

  if (!project) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-bg gap-8">
      <div className="text-4xl font-display uppercase">Project not found</div>
      <Link to="/work" className="font-label border-b border-fg pb-1">Back to Work</Link>
    </div>
  );

  return (
    <div className="w-full pb-20 bg-bg overflow-x-hidden">
      <CustomCursor />
      {/* Hero */}
      <section className="relative min-h-[80vh] w-full overflow-hidden flex flex-col items-center justify-center pt-32 text-center">
        <div className="w-full px-5 md:px-11">
          <Reveal type="text" className="text-5xl md:text-[6vw] font-display font-medium leading-[0.9] mb-12 uppercase tracking-tight text-center">
            {project.title}
          </Reveal>
          <Reveal type="pixel">
            <div className="w-full aspect-[21/9] overflow-hidden rounded-sm bg-muted/10 relative group">
              {/* Primary Video takes precedence if hybrid, but we use isVideo logic for flexibility */}
              {project.video ? (
                <video 
                  src={project.video}
                  autoPlay muted loop playsInline
                  className="w-full h-full object-cover hover:scale-105 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
              ) : project.image ? (
                isVideo(project.image) ? (
                  <video 
                    src={project.image}
                    autoPlay muted loop playsInline
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-1000 scale-105 group-hover:scale-100"
                  />
                ) : (
                  <ImageReveal
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full hover:scale-105 transition-all duration-1000 scale-105 group-hover:scale-100"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted uppercase tracking-widest text-xs">No Showcase Media</div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Info Grid */}
      <section className="px-5 md:px-11 py-8 lg:py-20 w-full grid grid-cols-2 md:grid-cols-4 gap-12 border-b border-border text-center lg:text-left">
        <Reveal type="fade" className="flex flex-col gap-2">
          <span className="font-label">Client</span>
          <span className="text-sm font-display tracking-tight uppercase font-medium">{project.client || "TBC"}</span>
        </Reveal>
        <Reveal type="fade" delay={0.1} className="flex flex-col gap-2">
          <span className="font-label">Role</span>
          <span className="text-sm font-display tracking-tight uppercase font-medium">{project.role || "Lead Designer"}</span>
        </Reveal>
        <Reveal type="fade" delay={0.2} className="flex flex-col gap-2">
          <span className="font-label">Year</span>
          <span className="text-sm font-display tracking-tight uppercase font-medium">{project.year || "2026"}</span>
        </Reveal>
        <Reveal type="fade" delay={0.3} className="flex flex-col gap-2">
          <span className="font-label">Deliverables</span>
          <span className="text-sm font-display tracking-tight uppercase font-medium">{project.category || "Digital Experience"}</span>
        </Reveal>
      </section>

      {/* Multi-Section Case Study Details */}
      <section className="pt-8 pb-4 lg:pt-40 lg:pb-20 bg-bg">
        <div className="w-full px-5 md:px-11 space-y-12 lg:space-y-40">
          {[
            { 
              title: "PROJECT OVERVIEW", 
              content: project.overview, 
              image: project.image_overview,
              number: "01"
            },
            { 
              title: "THE CHALLENGE", 
              content: project.challenge, 
              image: project.image_challenge,
              number: "02"
            },
            { 
              title: "OUR APPROACH", 
              content: project.approach, 
              image: project.image_approach,
              number: "03"
            },
            { 
              title: "EXECUTION", 
              content: project.execution, 
              image: project.image_execution,
              number: "04"
            },
            { 
              title: "THE OUTCOME", 
              content: project.outcome, 
              image: project.image_outcome,
              number: "05"
            }
          ].map((section, idx) => (section.content && (
            <div key={idx} className="space-y-16 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="w-full flex flex-col items-center lg:items-start">
                <div className="w-full md:w-[85%] lg:w-[70%] space-y-10 flex flex-col items-center lg:items-start">
                  <Reveal type="fade">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-sans tracking-[0.4em] text-muted uppercase">Section {section.number}</span>
                      <div className="w-8 h-[1px] bg-border opacity-30" />
                      <span className="text-[10px] font-serif italic tracking-[0.3em] text-fg opacity-60 uppercase">{section.title}</span>
                    </div>
                  </Reveal>
                  <Reveal type="text" className="text-xl md:text-3xl font-display font-medium leading-[1.2] tracking-tight">
                    {section.content}
                  </Reveal>
                </div>
                {/* Empty column for balance if no image besides, but we want image below usually or staggered */}
              </div>
              
              {section.image && (
                <Reveal type="pixel" className="w-full">
                  <div className="aspect-video md:aspect-[21/9] overflow-hidden rounded-[2px] bg-muted/5 border border-border/10">
                    {isVideo(section.image) ? (
                      <video 
                        src={section.image} 
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-1000"
                      />
                    ) : (
                      <img 
                        src={section.image} 
                        alt={section.title}
                        className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-1000"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </Reveal>
              )}
            </div>
          )))}

          {/* Fallback Video if exist and no images */}
          {project.video && !project.image_overview && (
            <Reveal type="pixel" className="aspect-video w-full overflow-hidden rounded-sm bg-muted/10">
              <video
                src={project.video}
                autoPlay muted loop playsInline
                className="w-full h-full object-cover"
              />
            </Reveal>
          )}


        </div>
      </section>

      {/* Next Project */}
      {nextProject && (
        <section className="mt-20 border-t border-border pt-20 px-5 md:px-11 text-center">
          <Reveal type="fade">
            <span className="font-label mb-8 block !tracking-[0.5em]">Next Project</span>
          </Reveal>
          <Link to={`/work/${nextProject.slug}`} className="group inline-block">
            <Reveal type="text" className="text-5xl md:text-[6.5vw] font-display font-medium leading-[0.9] hover:font-serif hover:italic transition-all duration-500 uppercase tracking-tight">
              {nextProject.title}
            </Reveal>
          </Link>
        </section>
      )}
    </div>
  );
}

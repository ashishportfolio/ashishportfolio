import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import ImageReveal from '../components/ImageReveal';
import Button from '../components/Button';
import Reveal from '../components/Reveal';
import { supabase } from '../lib/supabase';
import { Project } from '../types';
import { isVideo } from '../lib/utils';
import VideoPlayer from '../components/VideoPlayer';

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
      <Button to="/work">Back to Work</Button>
    </div>
  );

  return (
    <div className="w-full pb-20 bg-white overflow-x-hidden text-black font-sans">
      
      {/* 1. CINEMATIC FULL-WIDTH HEADER */}
      <section className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden bg-black group">
        {/* Background Media */}
        <div className="absolute inset-0 z-0">
          {project.case_study_banner && isVideo(project.case_study_banner) ? (
            <video 
              src={project.case_study_banner}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover opacity-60"
            />
          ) : project.case_study_banner ? (
            <img 
              src={project.case_study_banner} 
              alt={project.title}
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
          ) : project.video || (project.image && isVideo(project.image)) ? (
            <video 
              src={project.video || project.image}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover opacity-60"
            />
          ) : project.image ? (
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full w-full px-6 md:px-[7.2%] flex flex-col justify-end pb-12 md:pb-20">
          {/* Top Metadata Tags */}
          <div className="absolute top-12 left-6 right-6 md:left-[7.2%] md:right-[7.2%] flex flex-wrap items-center justify-between gap-4">
            <Reveal type="fade" className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-white">
              <span className="w-3.5 h-3.5 flex items-center justify-center bg-[#FF4D00] rounded-[2px]">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v10z"/></svg>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest">{project.year || '2026'} Release</span>
            </Reveal>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {[
                { label: 'Client', value: project.client },
                { label: 'Role', value: project.role || 'Design Lead' },
                { label: 'Services', value: project.category }
              ].map((item, idx) => item.value && (
                <div key={item.label}>
                  <Reveal type="fade" delay={0.1 * (idx + 1)}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white">
                      <span className="text-[7px] uppercase tracking-tighter opacity-50">{item.label}</span>
                      <span className="text-[9px] font-bold tracking-widest">{item.value.split(',')[0].trim()}</span>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <Reveal type="text" className="text-4xl md:text-[5.5vw] font-display font-medium text-white tracking-tighter leading-[1.1] mb-6">
              {project.title}
            </Reveal>

            <Reveal type="fade" delay={0.3} className="max-w-2xl">
              <p className="text-white/70 text-sm md:text-xl font-medium leading-[1.6] tracking-tight">
                {project.overview}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 right-6 md:right-16 text-white/40 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>
      </section>

      {/* 3. CASE STUDY CONTENT */}
      <section className="py-8 md:py-16 bg-white overflow-hidden">
        <div className="px-6 md:px-[7.2%] space-y-10 md:space-y-24">
          
          {/* Lead Intro / Overview - Tightened further */}
          {project.show_directive !== false && (
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start border-b border-black/5 pb-8 md:pb-12">
              <div className="w-full">
                <Reveal type="text" className="text-xl md:text-2xl font-display font-medium text-black/80 leading-[1.4] tracking-tight w-full text-justify">
                  {project.longDescription}
                </Reveal>
              </div>
            </div>
          )}

          {/* Staggered Sections - Even tighter vertical gaps */}
          {[
            { 
              title: "Overview", 
              content: project.overview, 
              image: project.image_overview,
              show: project.show_overview
            },
            { 
              title: "The Challenge", 
              content: project.challenge, 
              image: project.image_challenge,
              show: project.show_challenge
            },
            { 
              title: "Our Approach", 
              content: project.approach, 
              image: project.image_approach,
              show: project.show_approach
            },
            { 
              title: "Execution", 
              content: project.execution, 
              image: project.image_execution,
              show: project.show_execution
            },
            { 
              title: "Outcome", 
              content: project.outcome, 
              image: project.image_outcome,
              show: project.show_outcome
            }
          ].map((section, idx) => (
            <div key={idx} className="space-y-4 md:space-y-8">
              {/* Media First */}
              {section.image && (
                <Reveal type="pixel" className="w-full">
                  <div className="aspect-[16/9] overflow-hidden rounded-[14px] md:rounded-[32px] bg-[#f4f4f4]">
                    {isVideo(section.image) ? (
                      <VideoPlayer 
                        src={section.image} 
                        className="w-full h-full"
                      />
                    ) : (
                      <img 
                        src={section.image} 
                        alt={section.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </Reveal>
              )}

              {/* Text Second - Closer to image */}
              {section.show !== false && section.content && (
                <div className="w-full">
                  <Reveal type="text" className="text-lg md:text-xl font-display font-medium text-black leading-[1.5] tracking-tight w-full text-justify">
                    {section.content}
                  </Reveal>
                </div>
              )}
            </div>
          ))}

        </div>
      </section>

      {/* 4. NEXT PROJECT */}
      {nextProject && (
        <motion.section 
          initial={{ backgroundPosition: '0% 50%' }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="py-10 md:py-14 bg-gradient-to-r from-[#FFF5EF] via-[#FFEBDD] to-[#FFF5EF] bg-[length:200%_200%] rounded-[40px] mx-6 md:mx-[8%] flex flex-col items-center text-center shadow-sm"
        >
          <Reveal type="fade">
            <span className="text-[8px] font-bold text-black/30 capitalize tracking-[0.3em] mb-6 block">Next Story</span>
          </Reveal>
          <Link to={`/work/${nextProject.slug}`} className="group relative overflow-hidden">
            <Reveal type="text" className="text-4xl md:text-[5.5vw] font-display font-medium text-black tracking-tighter leading-[1.1] group-hover:italic transition-all duration-500">
              {nextProject.title}
            </Reveal>
            <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
               <div className="w-12 h-12 bg-[#FF4D00] rounded-full flex items-center justify-center text-white rotate-45">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
               </div>
            </div>
          </Link>
        </motion.section>
      )}
    </div>
  );
}

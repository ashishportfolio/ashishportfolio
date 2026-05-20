import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import { supabase } from '../lib/supabase';
import { Project, AboutContent } from '../types';
import { isVideo } from '../lib/utils';
import { ArrowDown } from 'lucide-react';
import { useSiteContext } from '../context/SiteContext';

export default function Work() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { siteContent } = useSiteContext();

  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, abRes] = await Promise.all([
          supabase.from('projects').select('*').order('year', { ascending: false }),
          supabase.from('about_content').select('*').maybeSingle()
        ]);

        if (pRes.error) throw pRes.error;
        setProjects(pRes.data || []);
        if (abRes.data) setAboutData(abRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg">
        <div className="font-display text-4xl animate-pulse tracking-tighter">Loading...</div>
      </div>
    );
  }

  const rawHeading = siteContent['work_hero_heading'] || "Portfolio*";

  return (
    <div className="bg-bg overflow-x-hidden">
      {/* FULL WIDTH HERO BANNER */}
      <section className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden flex flex-col justify-end">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src={siteContent['work_hero_bg'] || aboutData?.work_hero_bg || "https://images.unsplash.com/photo-1549494396-857ae899cc35?q=80&w=2670&auto=format&fit=crop"} 
            alt="Portfolio Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full px-6 md:px-[6%] pb-8 md:pb-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-10">
            {/* Left side: Heading */}
            <div className="space-y-2 md:space-y-4">
              <Reveal type="fade" delay={0.1}>
                <span className="text-[11px] md:text-[13px] font-display font-bold uppercase tracking-[0.3em] text-white/60">
                   {siteContent['work_hero_label'] || "©2026"}
                </span>
              </Reveal>
              <Reveal type="text" delay={0.2} multiplier={1.2}>
                <h1 className="text-[44px] sm:text-[64px] md:text-[12vw] font-display font-medium leading-[0.9] tracking-[-0.04em] text-white italic">
                  {rawHeading.endsWith('*') ? (
                    <>
                      {rawHeading.slice(0, -1)}
                      <span className="text-[#FF4D00] not-italic ml-2">*</span>
                    </>
                  ) : (
                    rawHeading
                  )}
                </h1>
              </Reveal>
            </div>

            {/* Right side: Description & Scroll */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-12 max-w-2xl lg:mb-4">
              <Reveal type="fade" delay={0.4} className="max-w-[400px]">
                <p className="text-xs sm:text-sm md:text-[16px] font-serif font-normal text-white/60 leading-relaxed text-left">
                  {siteContent['work_hero_paragraph'] || "From brand identity and art direction to cinematic AI production, each project reflects a commitment to functional innovation and visual storytelling."}
                </p>
              </Reveal>
              <Reveal type="fade" delay={0.6} className="hidden sm:block">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 text-white/60">
                  <ArrowDown size={18} />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS GRID SECTION */}
      <div className="pt-8 sm:pt-16 pb-10 sm:pb-16 px-6 md:px-[7.2%]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-0 md:px-0 relative z-10 max-w-[1500px] mx-auto">
        {projects.map((project, i) => (
          <div key={project.id} className="project-scene relative">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  </div>
);
}

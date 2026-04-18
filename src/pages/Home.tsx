import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../data/projects';
import Hero from '../components/Hero';
import CustomCursor from '../components/CustomCursor';
import Reveal from '../components/Reveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { Project, ArchiveMedia, AboutContent } from '../types';
import { isVideo } from '../lib/utils';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [archiveMedia, setArchiveMedia] = useState<ArchiveMedia[]>([]);
  const [clientLogos, setClientLogos] = useState<any[]>([]);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: pData } = await supabase.from('projects').select('*').eq('is_featured', true).order('year', { ascending: false });
        const { data: aData } = await supabase.from('archive_media').select('*').order('order_index', { ascending: true });
        const { data: lData } = await supabase.from('client_logos').select('*').order('order_index', { ascending: true });
        const { data: abData } = await supabase.from('about_content').select('*').single();

        setFeaturedProjects(pData || []);
        setArchiveMedia(aData || []);
        setClientLogos(lData || []);
        setAboutData(abData || null);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    
    // Ensure scroll starts at top
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // 1. Background Flash (Isolated to Projects Section)
      gsap.to('#work-bg-flash', {
        opacity: 0.05,
        duration: 0.1,
        repeat: 1,
        yoyo: true,
        scrollTrigger: {
          trigger: '.featured-works-section',
          start: 'top center',
          toggleActions: 'play none none reverse'
        }
      });
      // 2. Archive Horizontal Scroll removed for looping marquee
    });

    // Refresh ScrollTrigger as heights might change after media load
    const refresh = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);
    
    const intervals = [500, 2000, 5000].map(ms => setTimeout(refresh, ms));

    return () => {
      ctx.revert();
      window.removeEventListener('load', refresh);
      intervals.forEach(clearTimeout);
    };
  }, [isLoading, featuredProjects, archiveMedia]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg">
        <div className="font-display text-2xl md:text-5xl animate-pulse tracking-tighter uppercase font-medium">AshishGuptaa / Loading</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-bg overflow-x-hidden selection:bg-fg selection:text-bg">
      <CustomCursor />
      <Hero />

      {/* 1. MISSION / ABOUT BRIEF */}
      <section className="relative z-10 py-16 lg:py-40 px-5 md:px-11 border-t border-border bg-bg">
        <div className="w-full">
          <Reveal multiplier={1.8} type="fade" className="flex items-center gap-4 mb-16">
            <span className="text-[10px] font-sans tracking-[0.4em] text-muted uppercase">Art Direction / Digital Design</span>
            <div className="flex-1 h-[1px] bg-border" />
          </Reveal>
          
          <div className="w-full">
            <Reveal multiplier={1.8} type="glitch" className="text-4xl md:text-[5vw] font-display font-medium leading-[0.85] uppercase tracking-tight">
              Crafting clear, <br /> high-impact <span className="font-serif italic text-muted opacity-40">digital</span> <br /> experiences for <br /> ambitious brands.
            </Reveal>
          </div>

          <div className="mt-20 flex flex-col md:flex-row justify-between items-end gap-12">
            <Reveal multiplier={1.8} type="fade" delay={0.4} className="max-w-2xl">
              <p className="text-xl md:text-2xl leading-snug text-muted font-display font-medium">
                I blend strategy, design, and systems thinking to build products that scale — and stand out. Every pixel is intentional, every interaction is a narrative.
              </p>
            </Reveal>
            <Reveal multiplier={1.8} type="fade" delay={0.6}>
              <Link to="/about" className="group flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">The Profile</span>
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-fg group-hover:border-fg transition-all duration-500">
                   <div className="w-2 h-2 bg-fg rounded-full group-hover:bg-bg transition-colors" />
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. SERVICES GRID */}
      <section className="relative z-10 py-16 lg:py-40 px-5 md:px-11 bg-fg text-bg overflow-hidden translate-y-[-1px]">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-32 items-end">
            <Reveal multiplier={1.8} type="glitch" className="text-4xl md:text-[5.5vw] font-display font-medium leading-[0.82] uppercase tracking-tight">
              TURNING VISION <br /> INTO <span className="font-serif italic text-muted opacity-40">PRODUCT.</span>
            </Reveal>
            <Reveal multiplier={1.8} type="fade" className="max-w-xs md:pb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 leading-relaxed font-bold">
                Partnering with creative founders to launch digital entities that disrupt categories and define cultures.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            {SERVICES.map((service, i) => (
              <div key={service.title} className="space-y-10 group">
                <Reveal multiplier={1.8} type="fade" delay={i * 0.1}>
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] tracking-[0.4em] opacity-40 uppercase font-bold">Core 0{i+1} — {service.title}</span>
                    <div className="h-[1px] bg-bg/20 w-full group-hover:bg-bg transition-all duration-500" />
                  </div>
                  <ul className="space-y-4 mt-8">
                    {service.items.map((item) => (
                      <li key={item} className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tighter hover:pl-4 transition-all duration-500 cursor-default opacity-80 hover:opacity-100">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SELECTED WORKS */}
      <section className="featured-works-section relative z-10 py-16 lg:py-40 border-t border-border bg-bg">
        <div className="absolute inset-0 bg-fg pointer-events-none opacity-0 z-0" id="work-bg-flash" />
        
        <div className="w-full px-5 md:px-11 mb-12 lg:mb-32 flex justify-between items-end relative z-10">
          <div className="max-w-4xl">
            <Reveal multiplier={2.34} type="fade" className="mb-6 block">
              <span className="text-[10px] uppercase tracking-[0.4em] text-muted block">Case Studies / Volume 01</span>
            </Reveal>
            <Reveal multiplier={2.34} type="text" className="leading-[0.8] text-6xl md:text-[7vw] font-display font-medium uppercase tracking-tighter">
              FEATURED <span className="font-serif italic font-normal text-muted opacity-40">PROJECTS</span>
            </Reveal>
          </div>
        </div>
        
        <div className="flex flex-col gap-20 relative z-10">
          {featuredProjects.map((project) => (
            <div key={project.id} className="project-scene relative px-5 md:px-11">
               <div className="w-full">
                 <Reveal multiplier={2.34} type="image" className="w-full h-full">
                   <Link 
                     to={`/work/${project.slug}`}
                     className="relative group block overflow-hidden w-full aspect-[16/11] md:aspect-[21/11] rounded-[2px] bg-muted/10 border border-border/5"
                      data-project-id={project.id}
                      data-project-video={project.hover_video || project.video}
                   >
                      {/* Main Media (Hybrid Image or Video) */}
                      <div className="w-full h-full transition-all duration-500">
                         {isVideo(project.image) ? (
                           <video src={project.image} autoPlay muted loop playsInline className="w-full h-full object-cover brightness-90 group-hover:brightness-105 group-hover:scale-[1.03] transition-all duration-1000 ease-out" />
                         ) : (
                           <img src={project.image} alt={project.title} className="w-full h-full object-cover brightness-90 group-hover:brightness-105 group-hover:scale-[1.03] transition-all duration-1000 ease-out" referrerPolicy="no-referrer" />
                         )}
                      </div>


                     
                     <div className="absolute inset-8 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                       <span className="text-[10px] uppercase font-bold tracking-[0.3em] bg-bg px-4 py-2 text-fg">View Identity</span>
                       <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-white mix-blend-difference">IND / {project.year}</span>
                     </div>
                   </Link>
                 </Reveal>

                 <div className="mt-12 flex flex-col md:flex-row justify-between items-start gap-12 w-full">
                   <div className="max-w-2xl">
                     <Reveal multiplier={2.34} type="text" className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tighter mb-4">{project.title}</Reveal>
                     <Reveal multiplier={2.34} type="fade" delay={0.2}>
                       <p className="text-muted text-[10px] md:text-xs leading-relaxed max-w-xl uppercase tracking-[0.2em] font-medium">
                         {project.overview || project.description}
                       </p>
                     </Reveal>
                   </div>
                   <div className="pt-2 flex flex-wrap gap-3">
                     <Reveal multiplier={2.34} type="fade" delay={0.3} className="flex gap-2 flex-wrap">
                       {project.category.split(',').map(tag => (
                         <span key={tag} className="px-4 py-1.5 border border-border text-[9px] uppercase font-bold tracking-widest text-muted rounded-full">
                           {tag.trim()}
                         </span>
                       ))}
                     </Reveal>
                   </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHIVE BENTO LOOP SECTION */}
      {archiveMedia.length > 0 && (
        <section className="relative z-20 bg-bg border-t border-border pt-8 lg:pt-20 pb-16 lg:pb-40 overflow-hidden text-center lg:text-left">
          <div className="w-full px-5 md:px-11 mb-8 lg:mb-20 relative z-10">
            <Reveal multiplier={2.34} type="fade" className="mb-6 block">
              <span className="text-[10px] uppercase tracking-[0.4em] text-muted block">Visual Repository / Motion & Still</span>
            </Reveal>
            <Reveal multiplier={2.34} type="text" className="leading-[0.8] text-6xl md:text-[7vw] font-display font-medium uppercase tracking-tighter">
              THE <span className="font-serif italic font-normal text-muted opacity-40">ARCHIVE</span>
            </Reveal>
          </div>

          <div className="flex whitespace-nowrap group">
            <div className="flex animate-marquee-fast shrink-0 items-end gap-4">
              {[...archiveMedia, ...archiveMedia].map((media, i) => {
                // Uniform width, varied heights like a bar chart aligned to bottom
                const heights = ['h-[60vh]', 'h-[35vh]', 'h-[45vh]', 'h-[25vh]', 'h-[50vh]', 'h-[40vh]'];
                const heightClass = heights[i % heights.length];
                
                return (
                  <div 
                    key={`${media.id}-${i}`} 
                    className={`w-[30vw] md:w-[25vw] ${heightClass} min-h-[200px] flex-shrink-0 transition-all duration-700 hover:scale-[1.02]`}
                  >
                    <Reveal multiplier={2.34} type="image" className="w-full h-full">
                      <div className="w-full h-full group overflow-hidden bg-muted/10 border border-border/5 rounded-[2px]">
                        {isVideo(media.image) ? (
                          <video src={media.image} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        ) : (
                          <img src={media.image} alt="Archive" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. CLIENT PARTNERS */}
      <section className="relative z-10 py-8 lg:py-20 bg-bg border-t border-border overflow-hidden">
        <div className="w-full px-5 md:px-11 mb-12 text-center">
           <Reveal multiplier={1.8} type="glitch" className="text-[10px] uppercase tracking-[0.5em] font-bold">Trusted <span className="font-serif italic text-muted opacity-40">Partners</span></Reveal>
        </div>

        {clientLogos.length > 0 ? (
          <div className="flex whitespace-nowrap overflow-hidden group border-y border-border/10 py-16">
            <div className="flex animate-marquee shrink-0 items-center">
              {[...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos].map((logo, i) => (
                <div key={`${logo.id}-${i}`} className="flex items-center mx-24 justify-center">
                  {logo.logo ? (
                    <img 
                      src={logo.logo} 
                      alt={logo.name} 
                      className="h-8 md:h-12 w-auto object-contain transition-all duration-500 grayscale brightness-0 opacity-100 hover:opacity-70 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl md:text-4xl font-display font-medium uppercase tracking-tighter hover:opacity-100 transition-all cursor-default">
                      {logo.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 md:px-12 text-center py-20 border border-dashed border-border mx-6 md:mx-12 rounded-lg">
             <span className="text-[10px] uppercase tracking-widest text-muted opacity-30 italic">Populate client record in CMS to activate the carousel.</span>
          </div>
        )}
      </section>

      {/* 6. FINAL ACTION SECTION */}
      <section className="relative z-10 py-24 lg:py-60 px-5 md:px-11 bg-fg text-bg overflow-hidden translate-y-[-1px]">
        {/* Floating Portrait with Glitch */}
        {aboutData?.connect_image && (
          <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[35vw] max-w-[400px] z-0 opacity-40 mix-blend-screen pointer-events-none">
            <div className="animate-float">
              <div className="animate-glitch-cinematic">
                <img 
                  src={aboutData.connect_image} 
                  alt="Connect Portrait" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        )}

        <div className="w-full text-center relative z-10">
          <Reveal multiplier={1.8} type="fade" className="text-[10px] uppercase tracking-[0.5em] opacity-40 mb-12 block">Ready?</Reveal>
          
          <Reveal multiplier={1.8} type="glitch" className="text-6xl md:text-[8vw] font-display font-medium tracking-tighter leading-[0.8] uppercase mb-40">
            Let's build <br /> <span className="font-serif italic font-normal lowercase tracking-wide">something</span> <br /> <span className="text-muted opacity-40">iconic</span>
          </Reveal>
          
          <div className="flex flex-col md:flex-row justify-between items-center lg:items-end gap-12 text-center lg:text-left">
            <Reveal multiplier={1.8} type="fade" className="space-y-4">
              <span className="text-[10px] font-sans tracking-[0.3em] opacity-40 uppercase">Collaboration</span>
              <p className="text-3xl font-display uppercase tracking-tighter">Available for <br /> global projects</p>
            </Reveal>
            
            <Reveal multiplier={1.8} type="fade" delay={0.3} className="space-y-6">
              <span className="text-[10px] font-sans tracking-[0.3em] opacity-40 uppercase">Direct Briefs</span>
              <div className="space-y-2">
                <a href="mailto:hello@ashishguptaa.com" className="text-3xl md:text-[5vw] font-display uppercase tracking-tighter border-b-2 border-bg/40 hover:border-bg transition-all duration-500 block">
                  hello@ashishguptaa.com
                </a>
                <a href="tel:+918866138571" className="text-xl md:text-[2vw] font-display uppercase tracking-tighter opacity-60 hover:opacity-100 transition-all duration-500 block">
                  +91-88661 38571
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      
      {/* NO LOCAL FOOTER HERE - WE USE THE GLOBAL ONE IN APP.TSX */}
    </div>
  );
}

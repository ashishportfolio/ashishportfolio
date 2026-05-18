import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../data/projects';
import Hero from '../components/Hero';
import Button from '../components/Button';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import ProcessSection from '../components/ProcessSection';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { Project, ArchiveMedia, AboutContent } from '../types';
import { isVideo } from '../lib/utils';
import { useBooking } from '../context/BookingContext';
import { useSiteContext } from '../context/SiteContext';

gsap.registerPlugin(ScrollTrigger);

interface ServiceProps {
  title: string;
  description: string;
  items: string[];
}

interface ServiceCardProps {
  service: ServiceProps;
  index: number;
  key?: string;
}

function ServiceCard({ service }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative p-7 md:p-10 rounded-[20px] border border-white/10 bg-[#0f0f0f] overflow-hidden group transition-all duration-500 hover:border-white/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
        <h3 className="text-xl md:text-2xl font-display capitalize tracking-tighter">{service.title}</h3>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full lg:w-auto flex items-center justify-between lg:justify-center gap-4 bg-transparent border border-white/20 hover:border-white px-6 py-2.5 lg:py-2 rounded-full transition-all duration-300 group/btn"
        >
          <span className="text-[11px] capitalize font-bold tracking-widest">{isExpanded ? 'Hide Details' : 'View Services'}</span>
          <div className={`w-4 h-4 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
             <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
             </svg>
          </div>
        </button>
      </div>

      <p className="text-xs md:text-sm opacity-50 font-sans font-medium leading-[1.6] max-w-2xl mb-0">
        {service.description}
      </p>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="pt-8 mt-8 border-t border-white/5">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4">
              {service.items.map((item, idx) => (
                <div key={item} className="flex items-center gap-3 group/item">
                   <span className="text-[8px] opacity-20 font-bold">0{idx + 1}</span>
                   <span className="text-[10px] md:text-[11px] capitalize tracking-wide opacity-60 group-hover/item:opacity-100 transition-opacity font-bold">{item}</span>
                </div>
              ))}
           </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { openBookingModal } = useBooking();
  const { siteContent } = useSiteContext();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [archiveMedia, setArchiveMedia] = useState<ArchiveMedia[]>([]);
  const [clientLogos, setClientLogos] = useState<any[]>([]);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllServices, setShowAllServices] = useState(false);

  const initialServices = SERVICES.slice(0, 4);
  const remainingServices = SERVICES.slice(4);

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
        <div className="font-display text-xl md:text-3xl animate-pulse tracking-tighter normal-case font-medium">Ashish Guptaa &nbsp; / &nbsp; Art Director</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-bg overflow-x-hidden selection:bg-fg selection:text-bg">
      <Hero />

      {/* 1. MISSION / ABOUT BRIEF - UPDATED TO MATCH DESIGN */}
      <section className="relative z-10 py-10 lg:py-14 px-6 md:px-[8%] bg-bg overflow-hidden">
        <div className="w-full relative z-10">
          <Reveal multiplier={1.8} type="text" className="w-full block text-xl md:text-[3.04vw] font-display font-medium leading-[1.1] tracking-tighter mb-8 lg:mb-12">
            {siteContent['profile_title'] || aboutData?.profile_title || "Ashish Guptaa is an Ex-Ogilvy Art Director, Brand Identity Designer, and AI Visual Storyteller from India, with 7+ years of professional experience and over 10 years of creative practice."}
          </Reveal>
          
          <div className="mb-10 lg:mb-16 flex flex-col md:flex-row items-center justify-between gap-12">
            <Reveal multiplier={1.8} type="fade">
              <Button onClick={openBookingModal}>Book A Call</Button>
            </Reveal>

            {/* Small image on the right side logic */}
            {(siteContent['profile_section_image'] || aboutData?.profile_section_image) && (
              <Reveal multiplier={1.8} type="image" className="w-[10vw] min-w-[120px] aspect-video">
                <img 
                   src={siteContent['profile_section_image'] || aboutData?.profile_section_image} 
                   className="w-full h-full object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-1000" 
                   alt="Profile Accent"
                   referrerPolicy="no-referrer"
                />
              </Reveal>
            )}
          </div>
        </div>

        {/* Decorative subtle circle accent to match the mockup background */}
        <div className="absolute -left-[10%] top-[40%] w-[40vw] h-[40vw] rounded-full bg-slate-100 opacity-30 blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* 2. SERVICES GRID - UPDATED TO NEW DESIGN */}
      <section className="relative z-10 py-10 lg:py-14 px-6 md:px-[8%] bg-fg text-bg overflow-hidden translate-y-[-1px]">
        {/* Futuristic Background Animation - Updated for high visibility */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-100">
          <motion.div 
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -60, 60, 0],
              scale: [1, 1.4, 0.8, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-[-30%] left-[-20%] w-[120%] h-[120%] bg-[#00A3FF] blur-[200px] rounded-full opacity-50"
          />
          <motion.div 
            animate={{
              x: [0, -120, 120, 0],
              y: [0, 80, -80, 0],
              scale: [1, 0.7, 1.3, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-[-40%] right-[-20%] w-[130%] h-[130%] bg-[#FF7A00] blur-[250px] rounded-full opacity-40"
          />
          <motion.div 
            animate={{
              opacity: [0.15, 0.4, 0.15]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:50px_50px]"
          />
          {/* Third accent blob */}
          <motion.div 
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              x: [0, 50, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#FF00D6] blur-[100px] rounded-full opacity-20"
          />
        </div>

        <div className="w-full relative z-10" id="services-grid">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 min-h-[60vh]">
            {/* Left Content */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div>
                <Reveal multiplier={1.5} type="text" className="text-2xl md:text-[3.2vw] font-display font-medium leading-[1.1] tracking-tighter mb-6">
                  What Gets Created
                </Reveal>
                <Reveal multiplier={1.5} type="fade" delay={0.2}>
                   <p className="text-xs md:text-sm text-bg font-sans font-normal max-w-sm opacity-90 leading-[1.6]">
                     Visual work built with story, strategy, craft, and art direction - made for brands, campaigns, films, products, music, and AI-led storytelling.
                   </p>
                </Reveal>
              </div>

              <div className="mt-16">
                <Reveal multiplier={1.5} type="fade" delay={0.4}>
                  <Button to="/services">
                    Explore Services
                  </Button>
                </Reveal>
              </div>
            </div>

            {/* Right Cards Stack */}
            <div className="lg:col-span-7 lg:col-start-6 flex flex-col gap-5">
              {initialServices.map((service, i) => (
                <ServiceCard key={service.title} service={service} index={i} />
              ))}

              <AnimatePresence>
                {showAllServices && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-5 overflow-hidden"
                  >
                    {remainingServices.map((service, i) => (
                      <ServiceCard key={service.title} service={service} index={i + 4} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {SERVICES.length > 4 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="pt-4 flex justify-center lg:justify-start"
                >
                  <button 
                    onClick={() => {
                        setShowAllServices(!showAllServices);
                        if(showAllServices) {
                          // Optional: scroll back to services top if closing
                          document.getElementById('services-grid')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    className="group relative flex items-center gap-4 bg-transparent border border-white/20 hover:border-white px-10 py-4 rounded-full transition-all duration-500 overflow-hidden"
                  >
                    <span className="relative z-10 text-[11px] uppercase font-bold tracking-[0.2em] group-hover:text-fg transition-colors duration-500">
                      {showAllServices ? 'Show Less' : 'View All Services'}
                    </span>
                    <div className={`relative z-10 w-5 h-5 rounded-full bg-white text-bg flex items-center justify-center transition-transform duration-700 ${showAllServices ? 'rotate-180' : ''}`}>
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                       </svg>
                    </div>
                    <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProcessSection />

      {/* 3. SELECTED WORKS */}
      <section className="featured-works-section relative z-10 py-10 lg:py-14 bg-bg">
        <div className="absolute inset-0 bg-fg pointer-events-none opacity-0 z-0" id="work-bg-flash" />
        
        <div className="w-full px-6 md:px-[8%] mb-8 lg:mb-12 flex justify-between items-end relative z-10">
          <div className="w-full">
            <Reveal multiplier={2.34} type="fade" className="mb-3 block">
              <span className="text-[9px] capitalize tracking-[0.2em] text-muted block">Case Studies / Volume 01</span>
            </Reveal>
            <Reveal multiplier={2.34} type="text" className="text-2xl md:text-[3.5vw] font-display font-medium tracking-tighter leading-[1.1]">
              Featured Projects
            </Reveal>
          </div>
        </div>
        
        <div className="flex flex-col gap-6 md:gap-10 relative z-10 px-6 md:px-[8%]">
          {featuredProjects.map((project, i) => (
            <div key={project.id} className="project-scene relative">
              <ProjectCard project={project} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ARCHIVE BENTO LOOP SECTION */}
      {archiveMedia.length > 0 && (
        <section className="relative z-20 bg-bg py-10 lg:py-14 overflow-hidden text-center lg:text-left">
          <div className="w-full px-6 md:px-[8%] mb-8 lg:mb-10 relative z-10">
            <Reveal multiplier={2.34} type="fade" className="mb-3 block">
              <span className="text-[9px] capitalize tracking-[0.2em] text-muted block">Visual Repository / Motion & Still</span>
            </Reveal>
            <Reveal multiplier={2.34} type="text" className="text-2xl md:text-[3.5vw] font-display font-medium tracking-tighter leading-[1.1]">
              The Archive
            </Reveal>
          </div>

          <div className="flex whitespace-nowrap group">
            <div className="flex animate-marquee-fast shrink-0 items-center gap-6">
              {[...archiveMedia, ...archiveMedia].map((media, i) => {
                return (
                  <div 
                    key={`${media.id}-${i}`} 
                    className="w-[25vw] md:w-[20vw] h-[30vh] md:h-[40vh] flex-shrink-0 transition-all duration-700 hover:scale-[1.02]"
                  >
                    <Reveal multiplier={2.34} type="image" className="w-full h-full">
                      <div className="w-full h-full group overflow-hidden bg-muted/10 border border-border/5 rounded-[12px] md:rounded-[22px]">
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
      <section className="relative z-10 py-10 lg:py-14 bg-bg overflow-hidden">
        <div className="w-full px-6 md:px-[8%] mb-8 text-center lg:text-left">
           <Reveal multiplier={1.8} type="fade" className="text-[9px] capitalize tracking-[0.5em] font-bold text-muted">Trusted Partners</Reveal>
        </div>

        {clientLogos.length > 0 ? (
          <div className="flex whitespace-nowrap overflow-hidden group border-y border-border/10 py-12">
            <div className="flex animate-marquee shrink-0 items-center">
              {[...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos].map((logo, i) => (
                <div key={`${logo.id}-${i}`} className="flex items-center mx-20 justify-center">
                  {logo.logo ? (
                    <img 
                      src={logo.logo} 
                      alt={logo.name} 
                      className="h-7 md:h-10 w-auto object-contain transition-all duration-500 grayscale opacity-100 hover:opacity-70"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xl md:text-3xl font-display font-medium capitalize tracking-tighter hover:opacity-100 transition-all cursor-default">
                      {logo.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 md:px-12 text-center py-16 border border-dashed border-border mx-6 md:mx-12 rounded-lg">
             <span className="text-[9px] capitalize tracking-widest text-muted opacity-30 italic">Populate client record in CMS to activate the carousel.</span>
          </div>
        )}
      </section>
      {/* 6. FINAL ACTION SECTION - UPDATED TO MINIMAL CENTERED DESIGN */}
      <section className="relative z-10 py-12 lg:py-16 px-6 md:px-[8%] bg-bg text-fg overflow-hidden border-t border-border">
        <div className="w-full relative z-10 mx-auto flex flex-col items-center text-center">
          <Reveal multiplier={1.5} type="fade" className="block mb-6">
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-muted capitalize">Let's build something collective</span>
          </Reveal>
          
          <Reveal multiplier={1.5} type="text" delay={0.2} className="mb-10 lg:mb-12">
            <h2 className="text-3xl md:text-[4.5vw] font-display font-medium tracking-tighter leading-[1.1] mb-4">
              Have a perspective? <br />
              Let's make it real.
            </h2>
          </Reveal>
          
          <Reveal multiplier={1.5} type="fade" delay={0.3} className="mb-12">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <a 
                href={`mailto:${siteContent['contact_email'] || 'hello@ashishguptaa.com'}`}
                className="text-sm md:text-base font-sans font-medium hover:opacity-60 transition-opacity border-b border-fg/20 pb-0.5"
              >
                {siteContent['contact_email'] || 'hello@ashishguptaa.com'}
              </a>
              <a 
                href={`tel:${siteContent['contact_phone'] || '+918866138571'}`}
                className="text-sm md:text-base font-sans font-medium hover:opacity-60 transition-opacity border-b border-fg/20 pb-0.5"
              >
                {siteContent['contact_phone'] || '+91 88661 38571'}
              </a>
            </div>
          </Reveal>
          
          <Reveal multiplier={1.5} type="fade" delay={0.5}>
            <Button onClick={openBookingModal}>Book A Call</Button>
          </Reveal>
        </div>
      </section>
      
      {/* NO LOCAL FOOTER HERE - WE USE THE GLOBAL ONE IN APP.TSX */}
    </div>
  );
}

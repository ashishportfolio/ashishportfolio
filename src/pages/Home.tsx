import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../data/projects';
import { Mail, Phone, Linkedin, Layers, ArrowRight } from 'lucide-react';
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-4">
        <h3 className="text-lg md:text-xl font-display font-bold capitalize tracking-tighter">{service.title}</h3>
        
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

function Counter({ value, suffix = "", duration = 2 }: { value: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = gsap.to({ val: 0 }, {
      val: value,
      duration: duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: node,
        start: "top 90%",
      },
      onUpdate: function() {
        setCount(Math.floor(this.targets()[0].val));
      }
    });

    return () => controls.kill();
  }, [value, duration]);

  return <span ref={nodeRef}>{count}{suffix}</span>;
}

export default function Home() {
  const { openBookingModal } = useBooking();
  const { siteContent } = useSiteContext();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [archiveMedia, setArchiveMedia] = useState<ArchiveMedia[]>([]);
  const [clientLogos, setClientLogos] = useState<any[]>([
    { id: 1, name: 'Cactus', logo: null },
    { id: 2, name: 'Manila.', logo: null },
    { id: 3, name: 'Oslo.', logo: null },
    { id: 4, name: 'Basel', logo: null },
    { id: 5, name: 'Cactus', logo: null }
  ]);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllServices, setShowAllServices] = useState(false);
  const [homeFormData, setHomeFormData] = useState({
    name: '',
    email: '',
    subject: 'Brand Identity',
    message: ''
  });
  const [isHomeSubmitting, setIsHomeSubmitting] = useState(false);
  const [homeSubmitted, setHomeSubmitted] = useState(false);

  const handleHomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsHomeSubmitting(true);

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name: homeFormData.name,
            email: homeFormData.email,
            subject: homeFormData.subject,
            message: homeFormData.message
          }
        ]);

      if (error) throw error;

      // Send email notification
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contact',
            data: {
              name: homeFormData.name,
              email: homeFormData.email,
              subject: homeFormData.subject,
              message: homeFormData.message
            }
          })
        });
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
      }

      setHomeSubmitted(true);
      setHomeFormData({ name: '', email: '', subject: 'Brand Identity', message: '' });
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      if (typeof window !== 'undefined') {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setIsHomeSubmitting(false);
    }
  };

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
        if (lData && lData.length > 0) {
          setClientLogos(lData);
        }
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

      {/* 2. MISSION / ABOUT BRIEF - EXACT MATCH TO DESIGN ATTACHED */}
      <section className="relative z-10 py-10 md:py-14 lg:py-20 px-6 md:px-[7.2%] bg-bg overflow-hidden border-b border-border">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[30%_1fr] md:gap-4">
            {/* Left Column: Intro Label */}
            <div className="flex items-start pt-2 mb-6 md:mb-0">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-[#FF3333] rounded-sm" />
                <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-fg">Hey, Just An Intro</span>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex flex-col">
              {/* Headline */}
              <Reveal multiplier={1.5} type="text">
                <h2 className="text-[17px] sm:text-[23px] md:text-[2.8vw] font-display font-medium leading-[1.1] tracking-tighter text-fg mb-4 md:mb-6">
                  {siteContent['home_profile_headline'] || aboutData?.profile_headline || "An Ex-Ogilvy Art Director and AI Visual Storyteller based in India, passionate about creating immersive visual worlds. From brand identity design to cinematic filmmaking and AI-led execution."}
                </h2>
              </Reveal>

              {/* Get in touch button - Aligned and using global Button component */}
              <div className="flex justify-start mb-8 md:mb-16 lg:mb-24">
                 <Reveal multiplier={1.5} type="fade">
                   <Button onClick={openBookingModal}>Get in touch</Button>
                 </Reveal>
              </div>

              {/* Two Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-6 md:gap-y-10 border-t border-border pt-6 md:pt-10">
                  <div className="flex flex-col gap-1.5">
                    <Reveal multiplier={1.5} type="fade">
                      <h3 className="text-[12px] md:text-[14px] font-bold text-fg tracking-tight">{siteContent['home_col1_title'] || "Bringing Ideas to Life"}</h3>
                    </Reveal>
                    <Reveal multiplier={1.5} type="fade" delay={0.2}>
                      <p className="text-[12px] md:text-[13px] text-muted font-sans font-normal leading-[1.8] max-w-[400px]">
                        {siteContent['home_col1_desc'] || "Every vision begins as a story. I bridge the gap between abstract concepts and immersive visual systems, utilizing high-end art direction and AI-led execution to create cinematic worlds that resonate with clarity and emotion."}
                      </p>
                    </Reveal>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Reveal multiplier={1.5} type="fade">
                      <h3 className="text-[12px] md:text-[14px] font-bold text-fg tracking-tight">{siteContent['home_col2_title'] || "Collaborate with Me"}</h3>
                    </Reveal>
                    <Reveal multiplier={1.5} type="fade" delay={0.2}>
                      <p className="text-[12px] md:text-[13px] text-muted font-sans font-normal leading-[1.8] max-w-[400px]">
                        {siteContent['home_col2_desc'] || "I partner with brands and agencies to define their future visual landscapes. Whether it's a global campaign, a brand identity system, or an AI-filmmaking experimental project, we build work that stays ahead of the curve."}
                      </p>
                    </Reveal>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative subtle circle accent */}
        <div className="absolute -left-[10%] top-[40%] w-[40vw] h-[40vw] rounded-full bg-slate-100 opacity-30 blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* 2. SERVICES SECTION - UPDATED TO NEW DESIGN */}
      <section className="relative z-10 py-10 md:py-14 lg:py-20 px-6 md:px-[7.2%] bg-[#F5F5F5] overflow-hidden border-b border-border">
        {/* Top bar logic */}
        <div className="max-w-[1400px] mx-auto mb-8 md:mb-16 flex justify-between items-center text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-[#FF3333] rounded-sm" />
             <span>Premium Services</span>
          </div>
          <div className="hidden md:block text-fg opacity-60">
             (CQ® — 03)
          </div>
          <div className="opacity-60 font-sans">
             ©{new Date().getFullYear()}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Left Content */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <Reveal multiplier={1.5} type="text">
                  <h2 className="text-[26px] sm:text-[39px] md:text-[4.4vw] font-display font-bold leading-[0.95] tracking-tighter text-fg mb-3 md:mb-5">
                    {siteContent['home_services_heading'] || "Pro Services"}
                  </h2>
                </Reveal>
                <Reveal multiplier={1.5} type="fade" delay={0.2}>
                   <p className="text-xs md:text-sm text-muted font-sans font-normal max-w-sm leading-[1.6] mb-6 md:mb-10">
                     {siteContent['services_intro'] || "Visual work built with story, strategy, craft, and art direction — made for brands, campaigns, films, products, music, and AI-led storytelling."}
                   </p>
                </Reveal>

                <div className="space-y-3 mb-6 md:mb-12 py-4 md:py-8 border-t border-border">
                   {[
                     "+ Campaign Excellence",
                     "+ AI-led Innovation",
                     "+ Visual Storytelling"
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <span className="text-sm md:text-base font-bold text-fg tracking-tight">{item}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div>
                <Reveal multiplier={1.5} type="fade" delay={0.4}>
                  <Button to="/services" className="group">
                    Explore all services
                  </Button>
                </Reveal>
              </div>
            </div>

              {/* Right Cards Stack */}
            <div className="lg:col-span-7 flex flex-col gap-3 md:gap-4">
              {[
                { title: siteContent['home_service_0_title'] || 'Brand Identity Design', category: siteContent['home_service_0_category'] || 'Identity Systems' },
                { title: siteContent['home_service_1_title'] || 'Campaign Art Direction', category: siteContent['home_service_1_category'] || 'Shoot Direction' },
                { title: siteContent['home_service_2_title'] || 'Storytelling Key Visuals', category: siteContent['home_service_2_category'] || 'Hero Visuals' },
                { title: siteContent['home_service_3_title'] || 'AI Art Direction', category: siteContent['home_service_3_category'] || 'AI Visuals' }
              ].map((service, i) => (
                <div key={i}>
                  <Reveal multiplier={1.5} type="fade" delay={i * 0.1}>
                    <div className="group bg-[#EAEAEA] hover:bg-fg transition-all duration-500 rounded-[8px] md:rounded-[12px] p-4 pr-6 md:pr-10 border border-border/10 flex items-center justify-between overflow-hidden cursor-default">
                      <div className="flex items-center gap-5 md:gap-8">
                        {/* Thumbnail */}
                        <div className="w-[70px] md:w-[120px] aspect-[4/3] rounded-[6px] md:rounded-[10px] overflow-hidden bg-[#F2F2F2] flex-shrink-0">
                           <img 
                             src={siteContent[`service_image_${i}`] || `https://picsum.photos/400/300?random=${i + 10}`} 
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             alt={service.title}
                             referrerPolicy="no-referrer"
                           />
                        </div>
                        <div>
                          <h3 className="text-[13px] md:text-[19px] font-bold text-fg group-hover:text-bg transition-colors tracking-tight mb-1">{service.title}</h3>
                          <span className="text-[10px] md:text-[12px] text-muted group-hover:text-bg/60 transition-colors uppercase font-bold tracking-widest">{service.category}</span>
                        </div>
                      </div>

                      {/* Level Dots */}
                      <div className="flex gap-1.5">
                         {[...Array(4)].map((_, dotIdx) => (
                           <div 
                             key={dotIdx} 
                             className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${dotIdx <= i + 1 ? 'bg-[#FF3333]' : 'bg-border group-hover:bg-bg/20'}`} 
                           />
                         ))}
                      </div>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProcessSection />

      {/* 3. SELECTED WORKS */}
      <section className="featured-works-section relative z-10 py-10 md:py-14 lg:py-20 bg-bg border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 md:px-[7.2%] mb-8 md:mb-16 lg:mb-20">
          {/* Top Bar */}
          <div className="flex justify-between items-center text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-[#999] mb-8 md:mb-16 lg:mb-20">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 bg-[#FF3333] rounded-sm" />
               <span>Featured Works</span>
            </div>
            <div className="opacity-60 font-sans">
               ©{new Date().getFullYear()}
            </div>
          </div>

          {/* Center Content */}
          <div className="text-center flex flex-col items-center mb-8 md:mb-16 lg:mb-20">
             <Reveal multiplier={1.5} type="text">
                <h2 className="text-[26px] sm:text-[39px] md:text-[4.8vw] font-display font-bold leading-[0.95] tracking-tighter text-fg mb-4 md:mb-6">
                   {siteContent['home_portfolio_title'] || "Featured Portfolio"}
                </h2>
             </Reveal>

             <Reveal multiplier={1.5} type="fade" delay={0.2}>
                <p className="text-sm md:text-base text-muted font-sans font-normal max-w-2xl leading-relaxed mb-6 md:mb-12">
                   {siteContent['home_portfolio_desc'] || "Explore a collection of high-quality, innovative designs crafted to elevate brands and captivate audiences. Each project reflects our commitment to creativity and excellence."}
                </p>
             </Reveal>

             <Reveal multiplier={1.5} type="fade" delay={0.3}>
                <Button to="/work">
                   View Portfolio
                </Button>
             </Reveal>

             {/* Partner Logos Marquee */}
             <div className="mt-8 md:mt-16 pt-8 md:pt-16 border-t border-border w-full overflow-hidden relative">
                <span className="text-[11px] md:text-[12px] font-bold text-muted uppercase tracking-[0.2em] block mb-6 md:mb-12">CLIENT'S I WORKED WITH</span>
                
                <div className="relative w-full overflow-hidden group">
                   {/* Gradient Masks */}
                   <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-bg via-bg/80 to-transparent z-10 pointer-events-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-bg via-bg/80 to-transparent z-10 pointer-events-none" />
 
                   <div className="flex w-max animate-marquee shrink-0 items-center">
                      {[...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos].map((logo, i) => (
                        <div key={`${logo.id}-${i}`} className="flex items-center px-10 md:px-16 justify-center">
                          {logo.logo ? (
                            <img 
                              src={logo.logo} 
                              alt={logo.name} 
                              className="h-6 md:h-8 w-auto object-contain transition-all duration-500 grayscale opacity-40 hover:opacity-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-base md:text-lg font-display font-medium uppercase tracking-widest text-fg/40 hover:text-fg/100 transition-all cursor-default">
                              {logo.name}
                            </span>
                          )}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-4 md:px-[7.2%] relative z-10 max-w-[1500px] mx-auto">
          {featuredProjects.map((project) => (
             <div key={project.id}>
                <ProjectCard project={project} />
             </div>
          ))}
        </div>
      </section>

      {/* STATS & FACTS SECTION - NEW */}
      <section className="relative z-10 py-10 md:py-14 lg:py-20 px-6 md:px-[7.2%] bg-bg overflow-hidden border-b border-border">
        {/* Top bar logic */}
        <div className="max-w-[1400px] mx-auto mb-8 md:mb-16 flex justify-between items-center text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-[#FF3333] rounded-sm" />
             <span>Stats & Facts</span>
          </div>
          <div className="opacity-60 font-sans">
             ©{new Date().getFullYear()}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start mb-8 md:mb-16">
            <div className="md:col-start-5 md:col-span-8">
               <Reveal multiplier={1.5} type="text">
                  <h2 className="text-[17px] sm:text-[23px] md:text-[2.5vw] font-display font-medium leading-[1.15] tracking-tighter text-fg">
                    {siteContent['home_stats_title'] || "I bridge the gap between cinematic storytelling and functional design. Each milestone represents a commitment to clarity, emotion, and strategic intent."}
                  </h2>
               </Reveal>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {/* Stat 1 */}
            <div className="flex flex-col items-center text-center border-t border-border pt-6 md:pt-8">
               <Reveal multiplier={1.5} type="fade">
                  <div className="text-[44px] md:text-[5.5vw] font-display font-bold leading-none tracking-tighter text-fg mb-4 md:mb-8">
                    <Counter value={parseInt(siteContent['home_stat_1_val']) || 7} suffix={siteContent['home_stat_1_suffix'] || "+"} />
                  </div>
               </Reveal>
               <Reveal multiplier={1.5} type="fade" delay={0.2}>
                  <h3 className="text-[11px] md:text-[14px] font-bold text-fg mb-1 uppercase tracking-tight">{siteContent['home_stat_1_title'] || "Years Experience"}</h3>
                  <p className="text-[10px] md:text-[13px] text-muted font-sans font-normal leading-relaxed opacity-60">
                     {siteContent['home_stat_1_desc'] || "In the creative industry field."}
                  </p>
               </Reveal>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center text-center border-t border-border pt-6 md:pt-8">
               <Reveal multiplier={1.5} type="fade">
                  <div className="text-[44px] md:text-[5.5vw] font-display font-bold leading-none tracking-tighter text-fg mb-4 md:mb-8">
                    <Counter value={parseInt(siteContent['home_stat_2_val']) || 60} suffix={siteContent['home_stat_2_suffix'] || "+"} />
                  </div>
               </Reveal>
               <Reveal multiplier={1.5} type="fade" delay={0.2}>
                  <h3 className="text-[11px] md:text-[14px] font-bold text-fg mb-1 uppercase tracking-tight">{siteContent['home_stat_2_title'] || "Projects Done"}</h3>
                  <p className="text-[10px] md:text-[13px] text-muted font-sans font-normal leading-relaxed opacity-60">
                     {siteContent['home_stat_2_desc'] || "Around worldwide in last seven years."}
                  </p>
               </Reveal>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center text-center border-t border-border pt-6 md:pt-8">
               <Reveal multiplier={1.5} type="fade">
                  <div className="text-[44px] md:text-[5.5vw] font-display font-bold leading-none tracking-tighter text-fg mb-4 md:mb-8">
                    <Counter value={parseInt(siteContent['home_stat_3_val']) || 200} suffix={siteContent['home_stat_3_suffix'] || "%"} />
                  </div>
               </Reveal>
               <Reveal multiplier={1.5} type="fade" delay={0.2}>
                  <h3 className="text-[11px] md:text-[14px] font-bold text-fg mb-1 uppercase tracking-tight">{siteContent['home_stat_3_title'] || "Satisfied Clients"}</h3>
                  <p className="text-[10px] md:text-[13px] text-muted font-sans font-normal leading-relaxed opacity-60">
                     {siteContent['home_stat_3_desc'] || "With a great experience and results."}
                  </p>
               </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHIVE BENTO LOOP SECTION */}
      {archiveMedia.length > 0 && (
        <section className="relative z-20 bg-bg py-10 md:py-14 lg:py-20 overflow-hidden text-center">
          <div className="w-full px-6 md:px-[7.2%] mb-8 lg:mb-10 relative z-10">
            <Reveal multiplier={2.34} type="fade" className="mb-2 block">
              <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-muted block">Visual Repository / Motion & Still</span>
            </Reveal>
            <Reveal multiplier={2.34} type="text" className="text-xl md:text-[2.8vw] font-display font-bold tracking-tighter leading-[1.1]">
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

      {/* FINAL ACTION SECTION - UPDATED DESIGN */}
      <section className="relative z-10 py-4 lg:py-10 px-4 md:px-[4%] bg-bg overflow-hidden">
        <div className="relative w-full rounded-[24px] md:rounded-[32px] overflow-hidden min-h-[300px] md:min-h-[380px] flex flex-col justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={siteContent['home_cta_bg'] || aboutData?.contact_bg || "https://images.unsplash.com/photo-1549494396-857ae899cc35?q=80&w=2670&auto=format&fit=crop"} 
              alt="Contact Background"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center px-6 md:px-[10%] py-6 md:py-12 gap-8 md:gap-16">
            {/* Left Column: Headline */}
            <div className="flex flex-col justify-center">
              <Reveal multiplier={1.2} type="text">
                <h2 className="text-[24px] sm:text-[32px] md:text-[4.5vw] font-display font-medium leading-[1.1] tracking-tighter text-white mb-2 md:mb-4">
                  {siteContent['home_cta_heading'] || "Get In Touch"}
                </h2>
              </Reveal>
              <Reveal multiplier={1.2} type="fade" delay={0.2}>
                <p className="text-xs md:text-[15px] font-sans font-normal text-white/70 max-w-sm leading-relaxed mb-4 lg:mb-0">
                  {siteContent['home_cta_desc'] || "Have a vision you want to bring to life? Let's bridge the gap between cinematic storytelling and functional design."}
                </p>
              </Reveal>
            </div>

            {/* Right Column: Contact Form Card */}
            <div className="flex justify-center lg:justify-end">
              <Reveal multiplier={1.2} type="fade" delay={0.4} className="w-full max-w-[460px]">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[24px] border border-white/10 p-6 md:p-8 shadow-2xl">
                  <div className="flex justify-center mb-6">
                    <span className="font-display text-[10px] md:text-[11px] font-bold text-white/50 tracking-[0.3em] uppercase">Contact</span>
                  </div>

                  {homeSubmitted ? (
                    <div className="py-12 text-center">
                      <h3 className="text-xl font-display font-medium text-white mb-4 italic uppercase">Message Sent</h3>
                      <p className="text-sm text-white/60 mb-8">Thank you for Reaching Out. I'll get back to you shortly.</p>
                      <button 
                        onClick={() => setHomeSubmitted(false)}
                        className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D00] border-b border-[#FF4D00] pb-1"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-3.5" onSubmit={handleHomeSubmit}>
                      <div className="space-y-1">
                        <label className="text-[10px] font-sans font-bold text-white/60 uppercase ml-1 tracking-wider">Name</label>
                        <input 
                          required
                          type="text" 
                          value={homeFormData.name}
                          onChange={e => setHomeFormData({...homeFormData, name: e.target.value})}
                          placeholder="Jane Smith" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-sans font-bold text-white/60 uppercase ml-1 tracking-wider">Email Address</label>
                        <input 
                          required
                          type="email" 
                          value={homeFormData.email}
                          onChange={e => setHomeFormData({...homeFormData, email: e.target.value})}
                          placeholder="jane@framer.com" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-sans font-bold text-white/60 uppercase ml-1 tracking-wider">Project Type</label>
                        <select 
                          value={homeFormData.subject}
                          onChange={e => setHomeFormData({...homeFormData, subject: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                        >
                          <option value="Brand Identity" className="bg-[#111]">Brand Identity</option>
                          <option value="Art Direction" className="bg-[#111]">Art Direction</option>
                          <option value="AI Production" className="bg-[#111]">AI Production</option>
                          <option value="Other" className="bg-[#111]">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-sans font-bold text-white/60 uppercase ml-1 tracking-wider">Message</label>
                        <textarea 
                          required
                          value={homeFormData.message}
                          onChange={e => setHomeFormData({...homeFormData, message: e.target.value})}
                          placeholder="Tell me about your project..." 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors min-h-[85px]"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isHomeSubmitting}
                        className="w-full bg-white text-black font-display text-[11px] md:text-[12px] font-bold py-3 md:py-3.5 rounded-full hover:bg-[#FF4D00] hover:text-white transition-all uppercase mt-2 tracking-widest shadow-xl shadow-black/20 disabled:opacity-50"
                      >
                        {isHomeSubmitting ? 'Sending...' : 'Submit Request'}
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
      
      {/* NO LOCAL FOOTER HERE - WE USE THE GLOBAL ONE IN APP.TSX */}
    </div>
  );
}

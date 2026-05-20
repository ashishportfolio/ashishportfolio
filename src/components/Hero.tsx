import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { AboutContent } from '../types';

export default function Hero() {
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      const { data: abData } = await supabase.from('about_content').select('*').single();
      const { data: sData } = await supabase.from('site_content').select('*');
      
      if (abData) setAboutData(abData);
      if (sData) {
        const contentMap: Record<string, string> = {};
        sData.forEach((item: any) => contentMap[item.key] = item.value);
        setSiteContent(contentMap);
      }
    }
    fetchData();
  }, []);

  const heroImage = siteContent['hero_center_image'] || aboutData?.image;

  return (
    <section className="relative h-[82vh] sm:h-[85vh] md:h-[88vh] lg:h-screen min-h-[580px] sm:min-h-[660px] md:min-h-[750px] lg:min-h-0 w-full bg-white p-4 md:p-6 overflow-hidden">
      {/* Grey Rounded Container - Scale down corner radius on mobile */}
      <div className="absolute inset-x-4 top-4 sm:top-8 bottom-4 sm:bottom-6 bg-[#EAEAEA] rounded-[32px] md:rounded-[64px] pointer-events-none" />

      {/* Image Layer - Styled for Bottom on Mobile/Tablet and Center on Desktop */}
      <div className="absolute inset-x-4 bottom-4 sm:bottom-6 top-[45%] sm:top-[42%] md:top-[40%] lg:top-8 flex justify-center items-end pointer-events-none z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative w-full h-full flex items-end justify-center pointer-events-auto max-w-[1700px] lg:translate-x-20"
        >
          {heroImage ? (
            <img 
              src={heroImage} 
              alt="Ashish Guptaa" 
              className="w-auto h-full max-h-full object-contain object-bottom grayscale hover:grayscale-0 transition-all duration-1000 select-none block"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-24 sm:h-32 bg-muted/5 animate-pulse flex items-center justify-center rounded-2xl">
              <span className="text-[10px] uppercase tracking-widest text-muted">Awaiting Main Portrait...</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Text Layer - Shifted slightly down on mobile, top-aligned on mobile/tablet and centered on desktop */}
      <div className="absolute inset-x-4 top-4 sm:top-8 bottom-[45%] sm:bottom-[42%] md:bottom-[40%] lg:bottom-6 flex items-start lg:items-center justify-center z-20 pointer-events-none pt-[55px] sm:pt-[75px] md:pt-[100px] lg:pt-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 px-[6%] md:px-[7.2%] pointer-events-auto items-center">
          {/* Left Heading */}
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.5vw] font-display font-bold tracking-tighter leading-[0.85] text-fg mb-3 sm:mb-4">
                {siteContent['hero_heading'] || "Ashish Guptaa"}
              </h1>
              <p className="text-[10px] sm:text-[11px] lg:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-fg opacity-90">
                {siteContent['hero_sub_copy'] || "Ex-Ogilvy Art Director | Brand Designer | AI Visual Storyteller"}
              </p>
            </motion.div>
          </div>

          <div className="hidden lg:block" /> {/* Spacer for portrait */}

          {/* Right Column: Description for both mobile and tablet */}
          <div className="flex flex-col justify-center items-center lg:items-end text-center lg:text-left max-lg:mt-3 sm:max-lg:mt-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="max-w-[280px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[320px] opacity-80"
            >
              <p className="text-[11px] sm:text-[12.5px] md:text-[13.5px] lg:text-[14px] font-sans leading-[1.6] text-muted font-normal">
                {siteContent['hero_paragraph'] || "For brands, founders, agencies, and filmmakers looking to turn ideas into strong visual stories. From identity design and campaign art direction to AI visuals, product imagery, music videos, and cinematic storytelling - let’s build something remarkable."}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

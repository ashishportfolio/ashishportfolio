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
    <section className="relative h-[85vh] md:h-screen w-full bg-white flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Grey Rounded Container - Scale down corner radius on mobile */}
      <div className="absolute inset-x-4 top-8 bottom-6 bg-[#EAEAEA] rounded-[32px] md:rounded-[64px] pointer-events-none" />

      {/* Image Layer - Adjusted for mobile position */}
      <div className="absolute inset-x-4 top-8 bottom-6 flex justify-center items-end pointer-events-none z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative w-full h-full flex items-end justify-center pointer-events-auto max-w-[1700px] md:translate-x-20"
        >
          {heroImage ? (
            <img 
              src={heroImage} 
              alt="Ashish Guptaa" 
              className="w-auto h-[45vh] md:h-full max-h-full object-contain object-bottom grayscale hover:grayscale-0 transition-all duration-1000 select-none block"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-48 md:h-64 bg-muted/5 animate-pulse flex items-center justify-center rounded-2xl">
              <span className="text-[10px] uppercase tracking-widest text-muted">Awaiting Main Portrait...</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Text Layer - Repositioned for mobile to avoid overlap */}
      <div className="absolute inset-0 flex items-start md:items-center justify-center z-20 pointer-events-none py-24 md:py-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 px-[6%] md:px-[8%] pointer-events-auto items-center">
          {/* Left Heading */}
          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left md:pl-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl md:text-[4.5vw] font-display font-bold tracking-tighter leading-[0.85] text-fg mb-3">
                Ashish Guptaa
              </h1>
              <p className="text-[10px] md:text-[11px] font-sans font-bold tracking-[0.1em] text-fg opacity-90">
                Ex-Ogilvy Art Director | Brand Designer | AI Visual Storyteller
              </p>
            </motion.div>
          </div>

          <div className="hidden lg:block" /> {/* Spacer for portrait */}

          {/* Right Column: Description */}
          <div className="flex flex-col justify-center items-center md:items-end text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="max-w-[240px] md:max-w-[280px] opacity-80"
            >
              <p className="text-[10px] md:text-[12px] font-sans leading-[1.6] text-muted font-normal">
                For brands, founders, agencies, and filmmakers looking to turn ideas into strong visual stories.
                From identity design and campaign art direction to AI visuals, product imagery, music videos,
                and cinematic storytelling - let’s build something remarkable.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

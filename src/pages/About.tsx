import { useEffect, useState } from 'react';
import ImageReveal from '../components/ImageReveal';
import CustomCursor from '../components/CustomCursor';
import Reveal from '../components/Reveal';
import { supabase } from '../lib/supabase';
import { AboutContent, ClientLogo, SiteContent } from '../types';

export default function About() {
  const [aboutMedia, setAboutMedia] = useState<AboutContent | null>(null);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const { data: aboutData } = await supabase.from('about_content').select('*').single();
        if (aboutData) setAboutMedia(aboutData);

        const { data: logosData } = await supabase.from('client_logos').select('*').order('order_index', { ascending: true });
        if (logosData) setLogos(logosData);

        const { data: sData } = await supabase.from('site_content').select('*');
        if (sData) {
          const contentMap: Record<string, string> = {};
          sData.forEach((item: SiteContent) => contentMap[item.key] = item.value);
          setSiteContent(contentMap);
        }
      } catch (err) {
        console.error('Error fetching about data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAboutData();
  }, []);

  return (
    <div className="pt-16 lg:pt-40 pb-10 lg:pb-20 px-5 md:px-11 bg-bg overflow-x-hidden text-center lg:text-left">
      <CustomCursor />
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          <div className="space-y-12 flex flex-col items-center lg:items-start">
            <Reveal type="fade">
              <span className="text-[10px] font-sans tracking-[0.4em] text-muted uppercase block">
                {siteContent['about_title'] || "Art Director / Digital Designer"}
              </span>
            </Reveal>
            <Reveal type="text" className="text-5xl md:text-[6vw] font-display font-medium leading-[1] uppercase">
              AshishGuptaa <br />
              ART DIRECTOR <br />
              <span className="font-serif italic font-normal">& BRAND DESIGNER</span>
            </Reveal>
            <Reveal type="fade" delay={0.3}>
              <p className="max-w-xl text-muted">
                {siteContent['about_description'] || "Focused on Brand Perception, Visual Identity & AI-led Creative Production. I blend strategy, design, and systems thinking to build products that scale—and stand out."}
              </p>
            </Reveal>
          </div>

          <Reveal type="image">
            {aboutMedia?.image ? (
              <ImageReveal
                src={aboutMedia.image}
                alt="AshishGuptaa"
                className="aspect-[3/4]"
              />
            ) : (
              <div className="aspect-[3/4] bg-muted/20 flex items-center justify-center border border-border">
                <span className="text-[10px] uppercase tracking-widest text-muted">No Image Set</span>
              </div>
            )}
          </Reveal>
        </div>

        {/* Clients */}
        <section className="mt-8 lg:mt-20 pt-8 lg:pt-20 border-t border-border">
          <div className="w-full mb-12">
            <Reveal type="glitch" className="text-[10px] uppercase tracking-[0.5em] font-bold">Trusted <span className="font-serif italic text-muted opacity-40">Partners ({logos.length.toString().padStart(2, '0')})</span></Reveal>
          </div>
          
          {logos.length > 0 ? (
            <div className="flex whitespace-nowrap overflow-hidden group border-y border-border/10 py-16">
              <div className="flex animate-marquee shrink-0 items-center">
                {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
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
            <div className="py-20 text-center border border-dashed border-border w-full">
              <span className="text-[10px] uppercase tracking-widest text-muted">Partnering with ambitious brands globally...</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

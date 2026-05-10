import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageReveal from '../components/ImageReveal';
import Button from '../components/Button';
import Reveal from '../components/Reveal';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../lib/supabase';
import { AboutContent, ClientLogo, SiteContent } from '../types';

export default function About() {
  const { openBookingModal } = useBooking();
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
    <div className="pt-24 lg:pt-32 pb-12 lg:pb-16 px-6 md:px-[8%] bg-bg overflow-x-hidden text-center lg:text-left">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-7 space-y-8 flex flex-col items-center lg:items-start">
            <Reveal type="fade">
              <span className="text-[9px] font-sans tracking-[0.3em] text-muted capitalize block">
                {siteContent['about_title'] || "Art Director / Digital Designer"}
              </span>
            </Reveal>
            <Reveal type="text" className="text-3xl md:text-[3.8vw] font-display font-medium leading-[1.1] tracking-tighter">
              Ashish Guptaa <br />
              Art Director <br />
              & Brand Designer
            </Reveal>
            <Reveal type="fade" delay={0.3}>
              <p className="max-w-lg text-xs md:text-sm text-muted">
                {siteContent['about_description'] || "Focused on Brand Perception, Visual Identity & AI-led Creative Production. I blend strategy, design, and systems thinking to build products that scale—and stand out."}
              </p>
            </Reveal>
          </div>

          <div className="md:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[400px]">
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
          </div>
        </div>

        {/* Clients */}
        <section className="mt-12 lg:mt-16 pt-12 lg:pt-16 border-t border-border">
          <div className="w-full mb-10">
            <Reveal type="glitch" className="text-[10px] uppercase tracking-[0.5em] font-bold">Trusted Partners ({logos.length.toString().padStart(2, '0')})</Reveal>
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

        {/* Let's build something collective section */}
        <section className="relative z-10 py-12 lg:py-16 px-0 bg-bg text-fg overflow-hidden border-t border-border mt-16 lg:mt-24">
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
                  href="tel:+918866138571"
                  className="text-sm md:text-base font-sans font-medium hover:opacity-60 transition-opacity border-b border-fg/20 pb-0.5"
                >
                  +91 88661 38571
                </a>
              </div>
            </Reveal>
            
            <Reveal multiplier={1.5} type="fade" delay={0.5}>
              <Button onClick={openBookingModal}>Book A Call</Button>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { HeroMedia } from '../types';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [media, setMedia] = useState<HeroMedia[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const loopTl = useRef<gsap.core.Timeline | null>(null);
  const textTl = useRef<gsap.core.Timeline | null>(null);

  const PHRASES = [
    { first: "Art", second: "Direction" },
    { first: "Brand", second: "Identity" },
    { first: "AI", second: "Filmmaking" }
  ];

  useEffect(() => {
    async function fetchHeroMedia() {
      const { data, error } = await supabase
        .from('hero_media')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (!error && data) {
        setMedia(data);
      }
    }
    fetchHeroMedia();
  }, []);

  useEffect(() => {
    if (media.length === 0) return;

    // Reset visibility
    mediaRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0 });
    });

    // 1. DYNAMIC IMAGE SEQUENCE LOOP
    // This loop should handle any number of images added in CMS
    if (media.length > 1) {
      if (loopTl.current) loopTl.current.kill();
      
      loopTl.current = gsap.timeline({ repeat: -1 });
      
      media.forEach((_, i) => {
        const nextIndex = (i + 1) % media.length;
        
        loopTl.current!.to(mediaRefs.current[i], {
          opacity: 0,
          duration: 0.1, 
          ease: 'none',
          delay: 0.5, // Faster change (Total 0.6s per frame)
        });
        
        loopTl.current!.to(mediaRefs.current[nextIndex], {
          opacity: 1,
          duration: 0.1,
          ease: 'none',
          onStart: () => setActiveIndex(nextIndex),
        }, '<');
      });
    }

    // 2. TEXT FLASHING LOOP
    if (textTl.current) textTl.current.kill();
    textTl.current = gsap.timeline({ repeat: -1 });
    
    PHRASES.forEach((phrase, i) => {
      textTl.current!
        .set(textRef.current, { 
          innerHTML: `<span class="font-sans font-bold">${phrase.first}</span> <span class="font-serif italic font-normal text-muted opacity-60">${phrase.second}</span>` 
        })
        .fromTo(textRef.current, 
          { opacity: 0, scale: 1.1, filter: 'blur(5px) brightness(1.5)' },
          { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)', duration: 0.05, ease: 'power4.out' }
        )
        .to({}, { duration: 0.7 }) 
        .to(textRef.current, {
          opacity: 0,
          scale: 0.95,
          filter: 'blur(5px) brightness(1.5)',
          duration: 0.05,
          ease: 'power4.in'
        });
    });

    // 3. SCROLL INTERACTION (SQUARE DISCLOSURE)
    const ctx = gsap.context(() => {
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            if (self.progress > 0.05) {
              loopTl.current?.pause();
              textTl.current?.pause();
            } else {
              loopTl.current?.play();
              textTl.current?.play();
            }
          }
        }
      });

      mainTl.fromTo('.hero-image-container', 
        { 
          clipPath: 'inset(10% 10% 10% 10%)',
          borderRadius: '2px',
          width: window.innerWidth < 1024 ? '85vw' : '65vw',
          height: window.innerWidth < 1024 ? '60vh' : '75vh',
          scale: 0.9,
          x: window.innerWidth < 1024 ? 0 : -180,
          y: window.innerWidth < 1024 ? -50 : -40
        },
        { 
          clipPath: 'inset(0% 0% 0% 0%)',
          borderRadius: '0px',
          width: '100vw',
          height: '100vh',
          scale: 1,
          x: 0,
          y: 0,
          ease: 'power2.inOut' 
        },
        0
      );
      
      mainTl.fromTo('.hero-content-overlay', 
        {
          x: window.innerWidth < 1024 ? 0 : 60,
          opacity: 1,
          y: 0,
          scale: 1
        },
        {
          opacity: 0,
          y: -100,
          scale: 0.9,
          x: 0,
          ease: 'power2.inOut'
        }, 
        0.2
      );
    });

    return () => {
      ctx.revert();
      loopTl.current?.kill();
      textTl.current?.kill();
    };
  }, [media]);

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full overflow-hidden bg-bg"
    >
      {/* Decorative Lines */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="hero-line absolute h-[1px] bg-fg/10 w-full"
            style={{ top: `${20 * (i + 1)}%`, left: '-100vw' }}
          />
        ))}
      </div>

      {/* Media Stack */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="hero-image-container relative w-[65vw] h-[75vh] overflow-hidden rounded-sm transition-all duration-300">
          {media.length > 0 ? (
            media.map((item, i) => (
              <div
                key={item.id}
                ref={(el) => (mediaRefs.current[i] = el)}
                className="absolute inset-0 opacity-0 pointer-events-none"
              >
                {item.video ? (
                  <video
                    src={item.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.image}
                    alt={`Hero Frame ${i}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-muted/20 animate-pulse flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-muted">Initialising Media...</span>
            </div>
          )}
        </div>
      </div>

      {/* Text Overlay */}
      <div className="hero-content-overlay absolute left-1/2 -translate-x-1/2 bottom-[18%] w-screen flex flex-col items-center justify-end z-20 pointer-events-none overflow-visible">
        <h1 
          ref={textRef}
          className="text-[14vw] md:text-[10vw] font-display font-medium leading-[0.8] tracking-tighter text-fg text-center uppercase animate-glitch-shaky whitespace-nowrap min-w-max px-20"
        >
          <span className="font-sans font-bold">{PHRASES[0].first}</span> <span className="font-serif italic font-normal text-muted opacity-60">{PHRASES[0].second}</span>
        </h1>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-20 transition-opacity">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-fg origin-top animate-hero-scroll-line" />
        </div>
      </div>
    </section>
  );
}

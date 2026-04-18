import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  type?: 'text' | 'image' | 'fade' | 'liquid' | 'pixel' | 'glitch' | 'blob';
  delay?: number;
  duration?: number;
  className?: string;
  scrub?: boolean | number;
  multiplier?: number;
}

export default function Reveal({ 
  children, 
  type = 'fade', 
  delay = 0, 
  duration = 1.2,
  className = '',
  scrub = false,
  multiplier = 1
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let animation: gsap.core.Tween | gsap.core.Timeline;

    if (type === 'text') {
      const spans = el.querySelectorAll('span');
      gsap.set(spans, { y: '100%' });
      animation = gsap.to(spans, {
        y: 0,
        duration: 1.2 * multiplier,
        delay,
        ease: 'expo.out',
        stagger: 0.05 * multiplier,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    } else if (type === 'glitch') {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
        }
      });

      tl.fromTo(el, 
        { opacity: 0, filter: 'brightness(2) contrast(200%) blur(10px)', skewX: 30 },
        { opacity: 1, filter: 'brightness(1) contrast(100%) blur(0px)', skewX: 0, duration: 0.1, delay }
      )
      .to(el, {
        x: () => (Math.random() - 0.5) * 15,
        y: () => (Math.random() - 0.5) * 5,
        skewX: () => (Math.random() - 0.5) * 20,
        duration: 0.04,
        repeat: 8,
        yoyo: true,
        ease: 'steps(2)'
      })
      .to(el, { x: 0, y: 0, skewX: 0, duration: 0.05 });
      
      animation = tl;
    } else if (type === 'pixel') {
      const blocks = gridRef.current?.querySelectorAll('.pixel-block');
      if (blocks) {
        gsap.set(blocks, { opacity: 1 });
        animation = gsap.to(blocks, {
          opacity: 0,
          scale: 0.1,
          duration: 1.2 * multiplier,
          stagger: {
            grid: [16, 16],
            from: "random",
            amount: 1.5 * multiplier
          },
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        });
      }
    } else if (type === 'blob') {
      animation = gsap.fromTo(el, 
        { clipPath: 'circle(0% at 50% 50%)' },
        {
          clipPath: 'circle(150% at 50% 50%)',
          duration: 2.2,
          ease: 'expo.out',
          delay,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );
    } else if (type === 'liquid') {
      if (scrub) {
        // Scrubbed liquid reveal - ultra fast response
        gsap.set(el, { clipPath: 'circle(0% at 50% 50%)' });
        animation = gsap.to(el, {
          clipPath: 'circle(150% at 50% 50%)',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 98%',
            end: 'top 40%', // Even shorter distance for ultra fast reveal
            scrub: scrub === true ? 0.02 : scrub, // Minimal smoothing for instant feel
          }
        });
      } else {
        animation = gsap.to(el, {
          onStart: () => el.classList.add('active'),
          duration: 0.8 * multiplier, // Faster duration for non-scrubbed
          scrollTrigger: {
            trigger: el,
            start: 'top 95%',
          }
        });
      }
    } else if (type === 'image') {
      gsap.set(el, { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' });
      animation = gsap.to(el, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 1.6 * multiplier,
        ease: 'expo.out',
        delay,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    } else {
      animation = gsap.fromTo(el, 
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2 * multiplier,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
          }
        }
      );
    }

    return () => {
      if (animation) animation.kill();
    };
  }, [type, delay, duration]);

  return (
    <div 
      ref={elementRef} 
      className={`relative ${type === 'text' ? 'reveal-text' : type === 'image' ? 'reveal-image' : type === 'liquid' ? 'reveal-liquid' : ''} ${className}`}
    >
      {type === 'pixel' && (
        <div 
          ref={gridRef}
          className="absolute inset-0 z-20 grid grid-cols-[repeat(16,1fr)] grid-rows-[repeat(16,1fr)] pointer-events-none"
        >
          {[...Array(256)].map((_, i) => (
            <div key={i} className="pixel-block bg-bg w-full h-full" />
          ))}
        </div>
      )}
      {type === 'text' && typeof children === 'string' ? (
        children.split(' ').map((word, i) => (
          <span key={i} className="mr-[0.2em]">{word}</span>
        ))
      ) : (
        children
      )}
    </div>
  );
}

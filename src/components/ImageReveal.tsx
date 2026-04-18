import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
}

export default function ImageReveal({ src, alt, className, delay = 0 }: ImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imgRef.current) return;

    const ctx = gsap.context(() => {
      // Water spreading effect using circle clip-path
      gsap.fromTo(
        containerRef.current,
        {
          clipPath: 'circle(0% at 50% 50%)',
        },
        {
          clipPath: 'circle(150% at 50% 50%)',
          duration: 2.2,
          ease: 'expo.out',
          delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Subtle scale down for cinematic feel
      gsap.fromTo(
        imgRef.current,
        {
          scale: 1.15,
        },
        {
          scale: 1,
          duration: 3.2,
          ease: 'expo.out',
          delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

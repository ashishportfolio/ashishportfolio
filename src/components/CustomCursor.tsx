import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.12,
        ease: 'power2.out',
      });
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: 'power3.out',
      });
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle project video hover
      const projectCard = target.closest('[data-project-video]');
      if (projectCard) {
        const video = projectCard.getAttribute('data-project-video');
        setHoveredProject(projectCard.getAttribute('data-project-id'));
        setVideoSrc(video);
      } else {
        setHoveredProject(null);
        setVideoSrc(null);
      }

      // Handle interactive element scaling
      const interactive = target.closest('a, button, [role="button"], input, select, textarea');
      if (interactive) {
        gsap.to(cursor, {
          scale: 3,
          backgroundColor: 'white',
          mixBlendMode: 'difference',
          duration: 0.3
        });
      } else {
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: '#FF4D00',
          mixBlendMode: 'normal',
          duration: 0.3
        });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
    };
  }, []);

  return (
    <>
      {/* Main Dot */}
      <div
        ref={cursorRef}
        className="hidden lg:block fixed top-0 left-0 w-[10.5px] h-[10.5px] bg-[#FF4D00] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      />
      
      {/* Follower / Video Preview Container */}
      <div
        ref={followerRef}
        className="hidden lg:block fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
      >
        <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${hoveredProject ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          {/* Floating Video Preview - Wider aspect ratio, no border, no shadow */}
          <div className="w-80 aspect-video bg-bg overflow-hidden rounded-sm ml-8 mt-8">
            {videoSrc && (
              <video
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

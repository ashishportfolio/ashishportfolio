import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { Project } from '../types';
import { isVideo } from '../lib/utils';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Mouse Follow Logic for Floating Video
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 400 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Offset by a bit to center the mouse better
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // Helper to convert to Camel Case (actually Start Case / Title Case as in mockup)
  const toCamelCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative w-full bg-[#f4f4f4] rounded-[24px] md:rounded-[36px] p-2 cursor-pointer mb-8 ${isHovered ? 'z-50' : 'z-auto'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={() => navigate(`/work/${project.slug}`)}
    >
      {/* Image/Video Container */}
      <div className="relative aspect-[21/7] w-full overflow-hidden rounded-[18px] md:rounded-[28px] bg-slate-200">
        {/* Base Layer: Image (or video if that's the primary content) */}
        {isVideo(project.image) ? (
          <video
            src={project.image}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        ) : (
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Top Right Arrow - Like in mockup */}
        <div className={`absolute top-6 right-6 w-10 h-10 rounded-full bg-[#FF4D00] z-20 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>
      </div>

      {/* Hover Floating Video Box - Follows Mouse - Moved outside overflow-hidden container */}
      {(project.hover_video || project.video) && (
        <motion.div 
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25 
          }}
          className="pointer-events-none absolute top-0 left-0 z-[100] w-[180px] md:w-[280px] aspect-video bg-[#000] rounded-xl overflow-hidden shadow-2xl border-4 border-white"
        >
          <video
            src={project.hover_video || project.video}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Footer Area - Tightened for mobile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-5 md:px-8 py-4 md:py-6 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Status Dots - Hidden on mobile */}
          <div className="hidden md:flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FF4D00]" />
            <div className="w-2 h-2 rounded-full bg-black/10" />
            <div className="w-2 h-2 rounded-full bg-black/10" />
            <div className="w-2 h-2 rounded-full bg-black/10" />
          </div>

          <div className="flex flex-col">
            <h3 className="text-base md:text-xl font-display font-bold text-black tracking-tight leading-[1.1] mb-1">
              {toCamelCase(project.title)}
            </h3>
            <span className="text-[9px] md:text-[11px] font-sans font-medium text-black/40">
              {project.year}
            </span>
          </div>
        </div>

        {/* Tags Pills - Compact on mobile */}
        <div className="flex gap-1.5 md:gap-2">
          {project.category.split(',').slice(0, 2).map((tag) => (
            <div key={tag} className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-black/5 border border-black/5 text-[7px] md:text-[9px] font-sans font-bold text-black/60 capitalize tracking-[0.15em] md:tracking-widest whitespace-nowrap">
              {tag.trim()}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

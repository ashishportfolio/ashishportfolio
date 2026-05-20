import React from 'react';
import { motion } from 'motion/react';
import { 
  Lightbulb, 
  BookOpen, 
  Compass, 
  Palette, 
  FileCheck, 
  Send,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import Reveal from './Reveal';

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Thought",
    description: "Every project begins with the core idea — the brand, audience, category, message, emotion, and reason the work needs to exist.",
    icon: Lightbulb
  },
  {
    number: "02",
    title: "Story",
    description: "The idea is shaped into a story people can feel. This is where the work moves beyond decoration and starts building emotional, cultural, or human connection.",
    icon: BookOpen
  },
  {
    number: "03",
    title: "Direction",
    description: "The story becomes a visual language through mood, typography, colour, composition, lighting, references, styling, framing, and image treatment.",
    icon: Compass
  },
  {
    number: "04",
    title: "Creation",
    description: "The direction becomes a key visual, logo, identity system, campaign visual, AI product shoot, movie poster, music key art, brand film, music video, or complete visual system.",
    icon: Palette
  },
  {
    number: "05",
    title: "Refinement",
    description: "The work is sharpened until every visual choice feels clear, intentional, ownable, and connected to the idea.",
    icon: FileCheck
  },
  {
    number: "06",
    title: "Delivery",
    description: "The final output is built to travel across social media, websites, packaging, campaigns, print, pitch decks, films, music releases, and brand communication.",
    icon: Send
  }
];

interface ProcessSectionProps {
  disablePadding?: boolean;
}

export default function ProcessSection({ disablePadding = false }: ProcessSectionProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.78;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className={`relative z-10 py-10 md:py-14 lg:py-20 ${disablePadding ? '' : 'px-6 md:px-[7.2%]'} bg-[#F5F5F5] overflow-hidden border-b border-border`}>
      {/* Top bar logic */}
      <div className="max-w-[1400px] mx-auto mb-16 flex justify-between items-center text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
        <div className="flex items-center gap-3">
           <div className="w-2.5 h-2.5 bg-[#FF3333] rounded-sm" />
           <span>Approach Style</span>
        </div>
        <div className="hidden md:block text-fg opacity-60">
           (CQ® — 02)
         </div>
        <div className="opacity-60 font-sans">
           ©{new Date().getFullYear()}
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className={`max-w-[1400px] mx-auto overflow-x-auto lg:overflow-visible no-scrollbar scroll-smooth ${disablePadding ? '' : '-mx-6 px-6 md:-mx-[7.2%] md:px-[7.2%] lg:mx-0 lg:px-0'}`}
      >
        <div className="flex lg:grid lg:grid-cols-3 gap-6 pb-6 lg:pb-0 snap-x snap-mandatory">
          {PROCESS_STEPS.map((step, index) => (
            <div 
              key={step.title}
              className="w-[76vw] sm:w-[45vw] md:w-[38vw] lg:w-auto shrink-0 snap-start"
            >
              <Reveal multiplier={1.5} type="fade" delay={index * 0.1}>
                <div className="group bg-[#EAEAEA] hover:bg-white transition-all duration-500 rounded-[12px] md:rounded-[20px] p-8 md:p-10 h-full border border-border/10 flex flex-col justify-between cursor-default min-h-[320px] md:min-h-[400px]">
                  <div>
                    <div className="flex justify-between items-start mb-16 md:mb-24">
                       <span className="text-[24px] md:text-[32px] font-display font-medium text-fg">{step.number}</span>
                       
                       {/* Progress Dots */}
                       <div className="flex gap-1.5 pt-2">
                          {[...Array(3)].map((_, dotIdx) => (
                            <div 
                              key={dotIdx} 
                              className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${dotIdx <= (index % 3) ? 'bg-[#FF3333]' : 'bg-border/40 group-hover:bg-border'}`} 
                            />
                          ))}
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-[#FF3333] rounded-sm" />
                          <h3 className="text-[12px] md:text-[14px] font-bold text-fg tracking-tight uppercase">{step.title}</h3>
                       </div>
                      
                       <p className="text-[12px] md:text-[14px] text-muted leading-relaxed font-sans font-normal opacity-80 group-hover:opacity-100 transition-opacity">
                        {step.description}
                       </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Navigation Arrows for mobile/tablet */}
      <div className="flex lg:hidden justify-center items-center gap-4 mt-6">
        <button 
          onClick={() => handleScroll('left')}
          className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center text-fg hover:bg-neutral-50 active:scale-95 transition-all outline-none"
          style={{ cursor: 'pointer' }}
          aria-label="Scroll left"
        >
          <ArrowLeft size={16} />
        </button>
        <button 
          onClick={() => handleScroll('right')}
          className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center text-fg hover:bg-neutral-50 active:scale-95 transition-all outline-none"
          style={{ cursor: 'pointer' }}
          aria-label="Scroll right"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

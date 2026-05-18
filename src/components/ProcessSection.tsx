import React from 'react';
import { motion } from 'motion/react';
import { 
  Lightbulb, 
  BookOpen, 
  Compass, 
  Palette, 
  FileCheck, 
  Send 
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
  return (
    <section className={`py-14 lg:py-20 ${disablePadding ? '' : 'px-6 md:px-[8%]'} bg-bg border-y border-border/50`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 lg:mb-24">
          <Reveal type="text" className="text-3xl md:text-[3.5vw] font-display font-medium tracking-tighter leading-tight mb-6">
            How the Work Takes Shape
          </Reveal>
          <Reveal type="fade" delay={0.2}>
            <p className="text-sm md:text-base text-muted font-sans font-normal max-w-2xl leading-relaxed">
              Every project moves from thought to story, from story to direction, and from direction to a visual system that can live across real brand touchpoints.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 lg:gap-y-20">
          {PROCESS_STEPS.map((step, index) => (
            <motion.div 
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="flex flex-col group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <motion.div 
                    animate={{ 
                      rotateY: [0, 360],
                      y: [0, -4, 0] 
                    }}
                    transition={{ 
                      rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
                      y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{ perspective: 1000 }}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-white/40 transition-colors duration-500 overflow-hidden relative"
                  >
                    <step.icon className="w-4 h-4 text-fg group-hover:scale-110 transition-transform duration-500" />
                    <motion.div 
                      className="absolute inset-x-0 bottom-0 h-[1px] bg-white opacity-20"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                    />
                  </motion.div>
                </div>
              </div>
              
              <h4 className="text-lg md:text-xl font-display font-medium tracking-tight mb-4 group-hover:translate-x-1 transition-transform duration-500">
                {step.title}
              </h4>
              <p className="text-xs md:text-sm text-muted/80 leading-relaxed font-sans font-normal">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

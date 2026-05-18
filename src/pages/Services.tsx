import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Reveal from '../components/Reveal';
import { useBooking } from '../context/BookingContext';
import { useSiteContext } from '../context/SiteContext';
import { SERVICES } from '../data/projects';

const DEFAULT_IMAGES: Record<string, string> = {
  'Brand Identity Design': "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
  'Campaign Art Direction': "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
  'Storytelling-led Key Visual Design': "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  'AI Art Direction': "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
  'AI Filmmaking': "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
  'Movie Poster & Music Key Art Design': "https://images.unsplash.com/photo-1588693951525-68995a9478f7?q=80&w=800&auto=format&fit=crop",
  'Product Photography & Visualization': "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop"
};

const IMAGE_KEYS: Record<string, string> = {
  'Brand Identity Design': 'service_image_brand',
  'Campaign Art Direction': 'service_image_art',
  'Storytelling-led Key Visual Design': 'service_image_storytelling',
  'AI Art Direction': 'service_image_ai',
  'AI Filmmaking': 'service_image_ai_film',
  'Movie Poster & Music Key Art Design': 'service_image_movie',
  'Product Photography & Visualization': 'service_image_product'
};

export default function Services() {
  const { openBookingModal } = useBooking();
  const { siteContent, isLoading } = useSiteContext();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg font-display uppercase tracking-tighter text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full bg-bg text-fg font-sans selection:bg-fg selection:text-bg pb-12 md:pb-16 lg:pb-20 overflow-x-hidden relative">
      
      {/* 0. TOP BANNER - MOVED TO ABSOLUTE TOP */}
      {siteContent['services_banner_active'] === 'true' && (siteContent['services_banner_text'] || siteContent['services_banner_image']) && (
        <div className="w-full relative z-50">
          <Reveal type="fade">
            {siteContent['services_banner_link'] ? (
              <a 
                href={siteContent['services_banner_link']}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-[60px] md:h-[72px] lg:h-[84px] bg-fg text-bg overflow-hidden relative group transition-transform hover:scale-[1.005]"
              >
                {siteContent['services_banner_image'] ? (
                  <div className="absolute inset-0 z-0">
                    <img src={siteContent['services_banner_image']} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-fg/80 via-transparent to-fg/80" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[#FF4D00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center px-5">
                  <motion.div 
                    animate={siteContent['services_banner_text']?.length > 40 ? { x: [0, -500] } : {}}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="whitespace-nowrap flex gap-10"
                  >
                    <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                      {siteContent['services_banner_text']}
                    </p>
                    {siteContent['services_banner_text']?.length > 40 && (
                      <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                        {siteContent['services_banner_text']}
                      </p>
                    )}
                  </motion.div>
                </div>
              </a>
            ) : (
              <div className="w-full h-[60px] md:h-[72px] lg:h-[84px] bg-fg text-bg overflow-hidden relative group">
                {siteContent['services_banner_image'] ? (
                  <div className="absolute inset-0 z-0">
                    <img src={siteContent['services_banner_image']} className="w-full h-full object-cover opacity-50 transition-opacity duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-fg/80 via-transparent to-fg/80" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[#FF4D00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center px-5">
                  <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                    {siteContent['services_banner_text']}
                  </p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      )}
      
      {/* Background Soft Shape - as seen in mockup */}
      <div className="absolute top-0 left-[-20%] w-[80%] h-[100vh] bg-[#f8f8f8] rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      {/* Header */}
      <section className="pt-10 md:pt-14 lg:pt-20 pb-8 md:pb-10 lg:pb-14 px-6 md:px-[8%] mx-auto">
        <div className="flex flex-col gap-8 md:gap-10 lg:gap-12">
          {/* Label with red dot */}
          <Reveal type="fade">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-[#FF4D00] rounded-sm" />
              <span className="text-[9px] font-bold capitalize tracking-[0.1em] text-fg/60">Building with Passion</span>
            </div>
          </Reveal>
          {/* Main Heading */}
          <Reveal type="text" className="text-2xl md:text-[3.8vw] font-display font-medium tracking-tighter leading-[1.1]">
            Visual work built with story, strategy, craft, and art direction - made for brands, campaigns, films, products, music, and AI-led storytelling.
          </Reveal>

          {/* Call to action button matching mockup */}
          <Reveal type="fade" delay={0.2}>
            <Button onClick={openBookingModal}>Book A Call</Button>
          </Reveal>
        </div>
      </section>

      {/* Services List Table Design */}
      <section className="px-6 md:px-[8%] mx-auto">
        <div className="flex flex-col">
          {SERVICES.map((service, idx) => {
            const imageKey = IMAGE_KEYS[service.title] || 'service_image_default';
            const imageUrl = siteContent[imageKey] || DEFAULT_IMAGES[service.title] || "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop";
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 md:grid-cols-12 py-8 md:py-10 lg:py-14 border-t border-border group"
              >
                {/* Category Name & Image Column */}
                <div className="md:col-span-4 mb-6 md:mb-0 space-y-4 md:space-y-6">
                  <h3 className="text-xl md:text-2xl font-display font-medium tracking-tight capitalize">
                    {service.title}
                  </h3>
                  
                  {/* Small relevant image with reveal animation */}
                  <motion.div 
                    initial={{ clipPath: "inset(100% 0 0 0)" }}
                    whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[180px] md:max-w-[220px] aspect-[4/3] rounded-lg overflow-hidden bg-[#f4f4f4] grayscale hover:grayscale-0 transition-all duration-700"
                  >
                    <motion.img 
                      src={imageUrl} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>

                {/* Service Items List */}
                <div className="md:col-span-8 pr-0 md:pr-12 md:pt-1">
                  <p className="text-xs md:text-sm font-sans text-fg/60 leading-relaxed mb-6 max-w-2xl">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10">
                    {service.items.map((item, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 + (i * 0.05) }}
                      >
                        <span className="text-[#FF4D00] mt-[8px] shrink-0 text-[6px]">●</span>
                        <span className="text-xs md:text-sm font-sans font-medium text-fg/80 leading-[1.5]">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
          <div className="border-t border-border w-full" />
        </div>
      </section>

      {/* Footer text/CTA area */}
      <section className="mt-24 px-6 md:px-[8%] mx-auto text-center flex flex-col items-center">
        <Reveal type="fade" className="mb-6">
          <span className="text-[9px] font-bold text-fg/40 capitalize tracking-[0.3em]">Let's collaborate</span>
        </Reveal>
        <Reveal type="text" className="text-2xl md:text-[3.5vw] font-display font-medium tracking-tighter leading-[1.1] mb-10">
          Ready to elevate your identity and digital presence?
        </Reveal>
        <Reveal type="fade" delay={0.4}>
          <Button onClick={openBookingModal}>Book A Call</Button>
        </Reveal>
      </section>
    </div>
  );
}


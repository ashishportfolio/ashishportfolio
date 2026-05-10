import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Reveal from '../components/Reveal';
import { useBooking } from '../context/BookingContext';

const serviceData = [
  {
    category: "Brand & Identity",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
    items: [
      "Logo Design (primary, variations, usage)",
      "Brand Identity Systems (color, typography, visual language)",
      "Brand Guidelines & Style Books",
      "Rebranding / Brand Refresh",
      "Packaging Design (labels, boxes, product visuals)",
      "Typography & Wordmark Design"
    ]
  },
  {
    category: "Art Direction & Campaigns",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    items: [
      "Key Visual Design (KVs, launch creatives)",
      "Campaign Ads (print, digital, OOH)",
      "Creative Direction (campaign concepts, storytelling)",
      "Photography / Shoot Art Direction",
      "Poster Design",
      "Social Media & Performance Creatives"
    ]
  },
  {
    category: "AI Creative Production",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    items: [
      "AI Filmmaking (ads, short-form, narrative)",
      "AI Storytelling & Concept Visualization",
      "AI Key Visuals (GENESIS Framework)",
      "AI Brand World-Building",
      "AI + Live Action Hybrid Production",
      "Concept Art & Pre-visualization"
    ]
  }
];

export default function Services() {
  const { openBookingModal } = useBooking();
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: sData } = await supabase.from('site_content').select('*');
        if (sData) {
          const contentMap: Record<string, string> = {};
          sData.forEach((item: any) => contentMap[item.key] = item.value);
          setSiteContent(contentMap);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg font-display uppercase tracking-tighter text-xl">
        Loading...
      </div>
    );
  }

  const dynamicServiceData = [
    {
      category: "Brand & Identity",
      image: siteContent['service_image_brand'] || "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
      items: [
        "Logo Design (primary, variations, usage)",
        "Brand Identity Systems (color, typography, visual language)",
        "Brand Guidelines & Style Books",
        "Rebranding / Brand Refresh",
        "Packaging Design (labels, boxes, product visuals)",
        "Typography & Wordmark Design"
      ]
    },
    {
      category: "Art Direction & Campaigns",
      image: siteContent['service_image_art'] || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
      items: [
        "Key Visual Design (KVs, launch creatives)",
        "Campaign Ads (print, digital, OOH)",
        "Creative Direction (campaign concepts, storytelling)",
        "Photography / Shoot Art Direction",
        "Poster Design",
        "Social Media & Performance Creatives"
      ]
    },
    {
      category: "AI Creative Production",
      image: siteContent['service_image_ai'] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
      items: [
        "AI Filmmaking (ads, short-form, narrative)",
        "AI Storytelling & Concept Visualization",
        "AI Key Visuals (GENESIS Framework)",
        "AI Brand World-Building",
        "AI + Live Action Hybrid Production",
        "Concept Art & Pre-visualization"
      ]
    }
  ];

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
            Every project is an opportunity to push boundaries, tell a story, and create something truly memorable. Let's build the extraordinary together again.®
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
          {dynamicServiceData.map((service, idx) => (
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
                  {service.category}
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
                    src={service.image} 
                    alt={service.category}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              {/* Service Items List */}
              <div className="md:col-span-8 pr-0 md:pr-12 md:pt-1">
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
          ))}
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


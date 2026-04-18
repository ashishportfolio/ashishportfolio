import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SiteContent } from '../types';

export default function Contact() {
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchContactData() {
      const { data } = await supabase.from('site_content').select('*');
      if (data) {
        const contentMap: Record<string, string> = {};
        data.forEach((item: SiteContent) => contentMap[item.key] = item.value);
        setSiteContent(contentMap);
      }
    }
    fetchContactData();
  }, []);

  const renderTitle = () => {
    const title = siteContent['contact_title'] || "LET'S CONNECT";
    const words = title.split(' ');
    if (words.length > 1) {
      return (
        <>
          {words[0]} <br /> 
          <span className="font-serif italic font-normal">{words.slice(1).join(' ')}</span>
        </>
      );
    }
    return title;
  };

  return (
    <div className="pt-16 lg:pt-40 pb-10 lg:pb-20 px-6 md:px-12 bg-bg text-center lg:text-left">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-9xl font-display font-medium tracking-tighter uppercase"
            >
              {renderTitle()}
            </motion.h1>
            <div className="mt-8 lg:mt-20 space-y-12">
              <div className="space-y-4">
                <h2 className="text-[10px] font-sans tracking-[0.4em] text-muted uppercase">Get in Touch</h2>
                <div className="space-y-2">
                  <p className="text-xl md:text-2xl font-display font-medium">
                    {siteContent['contact_email'] || "hello@ashishguptaa.com"}
                  </p>
                  <p className="text-xl md:text-2xl font-display font-medium opacity-60 hover:opacity-100 transition-opacity">
                    <a href={`tel:${siteContent['contact_phone'] || "+918866138571"}`}>
                      {siteContent['contact_phone'] || "+91-88661 38571"}
                    </a>
                  </p>
                  {siteContent['contact_address'] && (
                    <p className="text-xs font-sans tracking-[0.1em] text-muted uppercase mt-4">
                      {siteContent['contact_address']}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-[10px] font-sans tracking-[0.4em] text-muted uppercase">Social</h2>
                <div className="flex flex-col gap-2 text-xl md:text-2xl font-display font-medium">
                  <a href="https://www.linkedin.com/in/ashishhgupta/" target="_blank" rel="noopener noreferrer" className="hover:font-serif hover:italic transition-all">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase">Name</label>
                <input type="text" className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors" placeholder="Jane Smith" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase">Email</label>
                <input type="email" className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors" placeholder="jane@framer.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase">Project Type</label>
              <select className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors appearance-none">
                <option className="bg-bg">Brand Identity</option>
                <option className="bg-bg">Art Direction</option>
                <option className="bg-bg">AI Production</option>
                <option className="bg-bg">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase">Message</label>
              <textarea className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-fg transition-colors min-h-[150px]" placeholder="Tell me about your project..." />
            </div>
            <button className="w-full py-6 bg-fg text-bg rounded-sm text-xs font-sans tracking-[0.4em] hover:opacity-90 transition-opacity uppercase font-bold">
              Send Inquiry
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

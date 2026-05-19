import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SiteContent } from '../types';
import { useSiteContext } from '../context/SiteContext';
import Button from '../components/Button';
import Reveal from '../components/Reveal';

export default function Contact() {
  const { siteContent } = useSiteContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Brand Identity',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        ]);

      if (error) throw error;

      // Send email notification
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contact',
            data: {
              name: formData.name,
              email: formData.email,
              subject: formData.subject,
              message: formData.message
            }
          })
        });
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Brand Identity', message: '' });
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      if (typeof window !== 'undefined') {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg text-fg font-sans selection:bg-fg selection:text-bg pb-12 md:pb-16 lg:pb-20 overflow-x-hidden relative">
      
      {/* TOP BANNER consistent with Services page */}
      {siteContent['contact_banner_active'] === 'true' && (siteContent['contact_banner_text'] || siteContent['contact_banner_image']) && (
        <div className="w-full relative z-50">
          <Reveal type="fade">
            {siteContent['contact_banner_link'] ? (
              <a 
                href={siteContent['contact_banner_link']}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-[60px] md:h-[72px] lg:h-[84px] bg-fg text-bg overflow-hidden relative group transition-transform hover:scale-[1.005]"
              >
                {siteContent['contact_banner_image'] ? (
                  <div className="absolute inset-0 z-0">
                    <img src={siteContent['contact_banner_image']} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-fg/80 via-transparent to-fg/80" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[#FF4D00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center px-5">
                  <motion.div 
                    animate={siteContent['contact_banner_text']?.length > 40 ? { x: [0, -500] } : {}}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="whitespace-nowrap flex gap-10"
                  >
                    <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                      {siteContent['contact_banner_text']}
                    </p>
                    {siteContent['contact_banner_text']?.length > 40 && (
                      <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                        {siteContent['contact_banner_text']}
                      </p>
                    )}
                  </motion.div>
                </div>
              </a>
            ) : (
              <div className="w-full h-[60px] md:h-[72px] lg:h-[84px] bg-fg text-bg overflow-hidden relative group">
                {siteContent['contact_banner_image'] ? (
                  <div className="absolute inset-0 z-0">
                    <img src={siteContent['contact_banner_image']} className="w-full h-full object-cover opacity-50 transition-opacity duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-fg/80 via-transparent to-fg/80" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[#FF4D00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center px-5">
                  <p className="text-[10px] md:text-[11px] font-bold capitalize tracking-[0.2em]">
                    {siteContent['contact_banner_text']}
                  </p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-20 md:pt-24 lg:pt-32 px-6 md:px-[8%]">
        <div className="w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20">
            <div className="text-left">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl md:text-[3.5vw] font-display font-medium tracking-tighter leading-[1.1] mb-10"
              >
                Let’s give your next idea a story and a clear art direction.
              </motion.h1>

              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                 className="space-y-6 text-xs md:text-sm text-balance text-muted leading-relaxed max-w-lg mb-12"
              >
                <p>
                  For brand identity design, key visual design, campaign art direction, AI art direction, AI
                  filmmaking, product visuals, movie posters, music key art, music videos, or complete visual
                  systems — share the brief.
                </p>
                <p>
                  Built for brands, founders, agencies, creators, artists, and filmmakers looking for visuals that do
                  more than look good.
                </p>
                <div className="space-y-1 font-medium text-fg">
                  <p>Visuals that carry a story.</p>
                  <p>Create connection.</p>
                  <p>Stay remembered.</p>
                </div>
              </motion.div>

              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3">
                  <h2 className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Get in Touch</h2>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center gap-3 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    >
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00] group-hover:text-white transition-all duration-500">
                        <Mail size={12} />
                      </div>
                      <p className="text-lg md:text-xl font-display font-medium group-hover:tracking-tight transition-all duration-500">
                        {siteContent['contact_email'] || "hello@ashishguptaa.com"}
                      </p>
                    </motion.div>

                    <motion.div 
                      className="flex items-center gap-3 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00] group-hover:text-white transition-all duration-500">
                        <Phone size={12} />
                      </div>
                      <p className="text-lg md:text-xl font-display font-medium opacity-60 group-hover:opacity-100 transition-all duration-500">
                        <a href={`tel:${siteContent['contact_phone'] || "+918866138571"}`}>
                          {siteContent['contact_phone'] || "+91-88661 38571"}
                        </a>
                      </p>
                    </motion.div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Social</h2>
                  <div className="flex flex-col gap-2">
                    <motion.div 
                      className="flex items-center gap-3 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    >
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00] group-hover:text-white transition-all duration-500">
                        <Linkedin size={12} />
                      </div>
                      <a href="https://www.linkedin.com/in/ashishhgupta/" target="_blank" rel="noopener noreferrer" className="text-lg md:text-xl font-display font-medium hover:font-serif hover:italic transition-all">LinkedIn</a>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSubmit}
              className="space-y-6 md:space-y-8 lg:space-y-10 text-left"
            >
              {submitted ? (
                <div className="py-20 text-center lg:text-left">
                  <Reveal type="glitch" className="text-2xl font-display font-medium mb-4">Message Sent.</Reveal>
                  <p className="text-sm text-muted">Thank you for reaching out. I'll get back to you shortly.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-[10px] font-bold uppercase tracking-widest border-b border-fg pb-1"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-2">
                      <label className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-fg transition-colors text-xs" 
                        placeholder="Jane Smith" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-fg transition-colors text-xs" 
                        placeholder="jane@framer.com" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Project Type</label>
                    <select 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-fg transition-colors appearance-none text-xs"
                    >
                      <option value="Brand Identity" className="bg-bg">Brand Identity</option>
                      <option value="Art Direction" className="bg-bg">Art Direction</option>
                      <option value="AI Production" className="bg-bg">AI Production</option>
                      <option value="Other" className="bg-bg">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Message</label>
                    <textarea 
                      required
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-fg transition-colors min-h-[120px] text-xs" 
                      placeholder="Tell me about your project..." 
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </>
              )}
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}

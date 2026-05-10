import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SiteContent } from '../types';
import Button from '../components/Button';

export default function Contact() {
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Brand Identity',
    message: ''
  });

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
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Brand Identity', message: '' });
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTitle = () => {
    const title = siteContent['contact_title'] || "Let's Connect";
    return title;
  };

  return (
    <div className="pt-20 md:pt-24 lg:pt-32 pb-10 md:pb-12 lg:pb-16 px-6 md:px-[8%] bg-bg text-left lg:text-left">
      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20">
          <div className="text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-[5.5vw] font-display font-medium tracking-tighter leading-[1.1] capitalize"
            >
              {renderTitle()}
            </motion.h1>
            <div className="mt-8 lg:mt-12 space-y-6 md:space-y-8 lg:space-y-10">
              <div className="space-y-3">
                <h2 className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Get in Touch</h2>
                <div className="space-y-2">
                  <p className="text-lg md:text-xl font-display font-medium">
                    {siteContent['contact_email'] || "hello@ashishguptaa.com"}
                  </p>
                  <p className="text-lg md:text-xl font-display font-medium opacity-60 hover:opacity-100 transition-opacity">
                    <a href={`tel:${siteContent['contact_phone'] || "+918866138571"}`}>
                      {siteContent['contact_phone'] || "+91-88661 38571"}
                    </a>
                  </p>
                  {siteContent['contact_address'] && (
                    <p className="text-[10px] font-sans tracking-[0.05em] text-muted capitalize mt-3">
                      {siteContent['contact_address']}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-[9px] font-sans tracking-[0.15em] text-muted capitalize">Social</h2>
                <div className="flex flex-col gap-2 text-lg md:text-xl font-display font-medium">
                  <a href="https://www.linkedin.com/in/ashishhgupta/" target="_blank" rel="noopener noreferrer" className="hover:font-serif hover:italic transition-all">LinkedIn</a>
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
                <h3 className="text-2xl font-display font-medium mb-4">Message Sent.</h3>
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
  );
}

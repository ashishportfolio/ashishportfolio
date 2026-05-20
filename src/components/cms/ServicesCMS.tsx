import React from 'react';

interface ServicesCMSProps {
  siteContent: Record<string, string>;
  setSiteContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveSiteContent: (keys: string[]) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, type: 'project' | 'hero' | 'archive' | 'about' | 'client') => Promise<void>;
}

export default function ServicesCMS({
  siteContent,
  setSiteContent,
  saveSiteContent,
  handleFileUpload
}: ServicesCMSProps) {
  const section0Keys = ['services_banner_active', 'services_banner_text', 'services_banner_image', 'services_banner_link'];
  const section1Keys = ['services_label', 'services_heading'];
  
  const SERVICES_LIST_DEFAULTS = [
    {
      idx: 0,
      imageKey: 'service_image_brand',
      defaultTitle: 'Brand Identity Design',
      defaultDesc: 'Logo design, identity systems, typography, colour palettes, brand guidelines, and complete visual languages built for clarity, recognition, and long-term recall.',
      defaultItems: 'Logo Design, Identity Systems, Typography, Colour Palettes, Brand Guidelines, Visual Languages'
    },
    {
      idx: 1,
      imageKey: 'service_image_art',
      defaultTitle: 'Campaign Art Direction',
      defaultDesc: 'Key visual design, moodboards, visual worlds, shoot direction, layouts, social-first campaign systems, and brand communication shaped with a clear point of view.',
      defaultItems: 'Key Visual Design, Moodboards, Visual Worlds, Shoot Direction, Layouts, Campaign Systems'
    },
    {
      idx: 2,
      imageKey: 'service_image_storytelling',
      defaultTitle: 'Storytelling-led Key Visual Design',
      defaultDesc: 'Hero campaign visuals, launch visuals, product-led compositions, and main campaign assets built around one strong idea - designed to carry story, emotion, and instant visual impact.',
      defaultItems: 'Hero Campaign Visuals, Launch Visuals, Product-led Compositions, Campaign Assets, Visual Impact'
    },
    {
      idx: 3,
      imageKey: 'service_image_ai',
      defaultTitle: 'AI Art Direction',
      defaultDesc: 'AI-generated campaign visuals, cinematic imagery, AI product shoots, prompt direction, visual world-building, and future-facing brand imagery directed with taste, story, and intent.',
      defaultItems: 'AI Campaign Visuals, Cinematic Imagery, AI Product Shoots, Prompt Direction, World-building, Brand Imagery'
    },
    {
      idx: 4,
      imageKey: 'service_image_ai_film',
      defaultTitle: 'AI Filmmaking',
      defaultDesc: 'AI brand films, music videos, concept videos, pitch films, short-form cinematic storytelling, and video post-production built around strong ideas, emotion, and visual flow.',
      defaultItems: 'AI Brand Films, Music Videos, Concept Videos, Pitch Films, Short-form Storytelling, Post-production'
    },
    {
      idx: 5,
      imageKey: 'service_image_movie',
      defaultTitle: 'Movie Poster & Music Key Art Design',
      defaultDesc: 'Cinematic movie posters, music album art, music key art, title treatments, character posters, and promotional visuals designed to make the story, mood, and emotion instantly memorable.',
      defaultItems: 'Movie Posters, Music Album Art, Music Key Art, Title Treatments, Character Posters, Promotional Visuals'
    },
    {
      idx: 6,
      imageKey: 'service_image_product',
      defaultTitle: 'Product Photography & Visualization',
      defaultDesc: 'AI product photography, ecommerce imagery, lifestyle compositions, premium product visuals, and product storytelling that makes the brand feel more desirable.',
      defaultItems: 'AI Product Photography, E-commerce Imagery, Lifestyle Compositions, Premium Product Visuals, Product Storytelling'
    }
  ];

  // Dynamically build list keys
  const section2Keys: string[] = [];
  SERVICES_LIST_DEFAULTS.forEach(s => {
    section2Keys.push(`service_${s.idx}_title`, `service_${s.idx}_description`, `service_${s.idx}_items`, s.imageKey);
  });

  const section3Keys = ['services_footer_label', 'services_footer_heading'];
  const allKeys = [...section0Keys, ...section1Keys, ...section2Keys, ...section3Keys];

  return (
    <div className="max-w-3xl space-y-12 animate-fade-in pb-16 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#FF4D00]">Services Page Manager</h2>
          <p className="text-[10px] text-muted uppercase mt-1">Configure promotional banners, introductory quotes, list visuals, and CTAs in order</p>
        </div>
        <button 
          type="button"
          onClick={() => saveSiteContent(allKeys)}
          className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Publish All Services Changes
        </button>
      </div>

      {/* SECTION 0: PROMO BANNER INTEGRATION */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 00: Promo Header Banner</h3>
          </div>
          <button 
            type="button"
            onClick={() => saveSiteContent(section0Keys)}
            className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
          >
            Save Banner Only
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="services_banner_active"
              checked={siteContent['services_banner_active'] === 'true'} 
              onChange={e => setSiteContent({ ...siteContent, services_banner_active: e.target.checked ? 'true' : 'false' })} 
              className="w-4 h-4 rounded border-border/50 text-[#FF4D00] focus:ring-0 bg-transparent cursor-pointer"
            />
            <label htmlFor="services_banner_active" className="text-[9px] uppercase tracking-widest text-fg font-bold cursor-pointer select-none">Activate Top Banner on Services Page</label>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Banner Display Text</label>
            <input 
              type="text" 
              value={siteContent['services_banner_text'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, services_banner_text: e.target.value })} 
              className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg" 
              placeholder="e.g. FREE 15 MIN STRATEGY SESSION — BOOK NOW"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Banner Background Image (Optional - Overlay visual)</label>
            {siteContent['services_banner_image'] && (
              <div className="w-full h-12 overflow-hidden rounded-sm border border-border/40 relative">
                <img src={siteContent['services_banner_image']} className="w-full h-full object-cover grayscale opacity-60" referrerPolicy="no-referrer" alt="banner preview" />
              </div>
            )}
            <div className="space-y-2">
              <input 
                type="text" 
                value={siteContent['services_banner_image'] || ""} 
                onChange={e => setSiteContent({ ...siteContent, services_banner_image: e.target.value })} 
                className="w-full bg-transparent border-b border-border/50 py-2 text-xs focus:outline-none focus:border-fg text-fg font-mono" 
                placeholder="Direct Image URL"
              />
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-wider text-muted block font-bold">Or Upload Image:</span>
                <input type="file" onChange={e => handleFileUpload(e, 'services_banner_image', 'about')} className="text-[9px] text-muted w-full" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Banner Redirection Link (URL)</label>
            <input 
              type="text" 
              value={siteContent['services_banner_link'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, services_banner_link: e.target.value })} 
              className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg font-mono" 
              placeholder="e.g. https://cal.com/username/strategy-session"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: HERO INTRODUCTION COPY */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 01: Hero Intro Copy</h3>
          </div>
          <button 
            type="button"
            onClick={() => saveSiteContent(section1Keys)}
            className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
          >
            Save Intro Section
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Services Sub-title Label (Top-left small tag)</label>
            <input 
              type="text" 
              value={siteContent['services_label'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, services_label: e.target.value })} 
              className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg" 
              placeholder="Building with Passion"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold block">Main Belief Quote (The large text)</label>
            <textarea 
              value={siteContent['services_heading'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, services_heading: e.target.value })} 
              className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-[#FF4D00] text-xs text-fg leading-relaxed rounded-sm" 
              rows={4}
              placeholder="Visual work built with story, strategy, craft, and art direction..."
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: SERVICES CATEGORIES & DETAIL PIECES */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 02: Capabilities list items {"&"} previews</h3>
          </div>
          <button 
            type="button"
            onClick={() => saveSiteContent(section2Keys)}
            className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
          >
            Save All Categories
          </button>
        </div>

        <p className="text-[10px] text-muted uppercase tracking-wider leading-relaxed">
          Customize individual titles, long-form descriptions, tags comma-separated listings, and graphic showcases representing your services portfolio.
        </p>

        <div className="space-y-12 divide-y divide-border/40">
          {SERVICES_LIST_DEFAULTS.map((srv, index) => {
            const titleField = `service_${srv.idx}_title`;
            const descField = `service_${srv.idx}_description`;
            const itemsField = `service_${srv.idx}_items`;
            
            return (
              <div key={srv.idx} className={`space-y-5 ${index > 0 ? 'pt-8' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#FF4D00]">0{srv.idx + 1}.</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-fg">
                    {siteContent[titleField] || srv.defaultTitle}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Metadata Fields */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold block">Service Title Header</label>
                      <input 
                        type="text" 
                        value={siteContent[titleField] || ""} 
                        onChange={e => setSiteContent({ ...siteContent, [titleField]: e.target.value })} 
                        className="w-full bg-transparent border-b border-border/50 py-1 focus:outline-none focus:border-fg text-xs text-fg" 
                        placeholder={srv.defaultTitle}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] uppercase tracking-widest text-[#FF4D00] font-bold block">Detailed Service Description Paragraph</label>
                      <textarea 
                        value={siteContent[descField] || ""} 
                        onChange={e => setSiteContent({ ...siteContent, [descField]: e.target.value })} 
                        className="w-full bg-transparent border border-border/40 p-2.5 focus:outline-none focus:border-[#FF4D00] text-xs text-fg leading-relaxed rounded-sm" 
                        rows={3}
                        placeholder={srv.defaultDesc}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold block">Capability List Highlights (Comma-separated values)</label>
                      <textarea 
                        value={siteContent[itemsField] || ""} 
                        onChange={e => setSiteContent({ ...siteContent, [itemsField]: e.target.value })} 
                        className="w-full bg-transparent border border-border/40 p-2.5 focus:outline-none focus:border-fg text-xs text-fg leading-relaxed font-mono rounded-sm" 
                        rows={2}
                        placeholder={srv.defaultItems}
                      />
                      <span className="text-[8px] text-muted capitalize block">Separate each bullet with a comma. e.g. Design, Web, Identity</span>
                    </div>
                  </div>

                  {/* Right Column: Visual Preview Asset */}
                  <div className="md:col-span-5 flex flex-col justify-between bg-fg/[0.01] border border-border/30 p-4 rounded-sm">
                    <div className="space-y-1.5">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold block">Visual Preview Grid Asset</label>
                      {(siteContent[srv.imageKey] || srv.defaultTitle) && (
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-sm border border-border/40 bg-muted/5 relative">
                          <img 
                            src={siteContent[srv.imageKey] || "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop"} 
                            className="w-full h-full object-cover grayscale" 
                            referrerPolicy="no-referrer" 
                            alt={srv.defaultTitle} 
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 mt-3 font-sans">
                      <input 
                        type="text" 
                        value={siteContent[srv.imageKey] || ""} 
                        onChange={e => setSiteContent({ ...siteContent, [srv.imageKey]: e.target.value })} 
                        className="w-full bg-transparent border-b border-border/50 py-1 text-xs focus:outline-none text-fg font-mono" 
                        placeholder="Image URL" 
                      />
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-muted block font-bold">Or Upload File:</span>
                        <input type="file" onChange={e => handleFileUpload(e, srv.imageKey, 'about')} className="text-[9px] text-muted w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: CALL TO ACTION FOOTER */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 03: Call to Action Footer</h3>
          </div>
          <button 
            type="button"
            onClick={() => saveSiteContent(section3Keys)}
            className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
          >
            Save Footer Copy
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">CTA Small Top Title</label>
            <input 
              type="text" 
              value={siteContent['services_footer_label'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, services_footer_label: e.target.value })} 
              className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg" 
              placeholder="Let's collaborate"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold block">CTA Large Heading Quote</label>
            <textarea 
              value={siteContent['services_footer_heading'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, services_footer_heading: e.target.value })} 
              className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-[#FF4D00] text-xs text-fg leading-relaxed rounded-sm" 
              rows={2}
              placeholder="Ready to elevate your identity and digital presence?"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          type="button"
          onClick={() => saveSiteContent(allKeys)}
          className="w-full py-4 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-lg font-bold uppercase tracking-[0.2em] transition-all text-center"
        >
          Publish All Services Page Changes
        </button>
      </div>
    </div>
  );
}

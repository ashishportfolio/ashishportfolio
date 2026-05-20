import React from 'react';
import { AboutContent } from '../../types';

interface AboutCMSProps {
  aboutData: AboutContent | null;
  setAboutData: React.Dispatch<React.SetStateAction<AboutContent | null>>;
  saveContent: (table: string, data: any) => Promise<void>;
  siteContent: Record<string, string>;
  setSiteContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveSiteContent: (keys: string[]) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, type: 'project' | 'hero' | 'archive' | 'about' | 'client') => Promise<void>;
}

export default function AboutCMS({
  aboutData,
  setAboutData,
  saveContent,
  siteContent,
  setSiteContent,
  saveSiteContent,
  handleFileUpload
 }: AboutCMSProps) {
  const section1Keys = ['about_title', 'about_hero_heading', 'about_hero_sub_copy'];
  const section2Keys = ['about_para_1', 'about_para_2', 'about_para_3', 'about_para_4', 'about_para_5'];
  const section3Keys = ['about_cta_label', 'about_cta_heading'];
  const allKeys = [...section1Keys, ...section2Keys, ...section3Keys];

  return (
    <div className="max-w-3xl space-y-12 animate-fade-in pb-16 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#FF4D00]">About Page Manager</h2>
          <p className="text-[10px] text-muted uppercase mt-1">Configure layout, stories, and portrait assets in order</p>
        </div>
        <button 
          type="button"
          onClick={() => saveSiteContent(allKeys)}
          className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Publish All Text Changes
        </button>
      </div>

      {/* SECTION 1: HERO COPY (TOP OF ABOUT PAGE) */}
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
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">About Sub-title / Role Tag (Top-left small capsule)</label>
            <input 
              type="text" 
              value={siteContent['about_title'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_title: e.target.value })} 
              className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs transition-colors text-fg" 
              placeholder="Art Director / Digital Designer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold block">Main Name Headline (Large bold title)</label>
            <input 
              type="text" 
              value={siteContent['about_hero_heading'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_hero_heading: e.target.value })} 
              className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs transition-colors text-fg font-medium" 
              placeholder="Ashish Guptaa"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Main Sub-copy Headline (Role details)</label>
            <input 
              type="text" 
              value={siteContent['about_hero_sub_copy'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_hero_sub_copy: e.target.value })} 
              className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs transition-colors text-fg" 
              placeholder="Ex-Ogilvy Art Director | Brand Designer | AI Visual Storyteller"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: PORTRAIT & NARRATIVE STORY BLOCKS (MIDDLE OF THE PAGE) */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 02: Narrative Story {"&"} Portraits</h3>
          </div>
          <button 
            type="button"
            onClick={() => saveSiteContent(section2Keys)}
            className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
          >
            Save Narrative Copy Only
          </button>
        </div>

        {/* Media grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border/20 pb-8">
          {/* Main Portrait */}
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold block">About Main Portrait image</label>
            <div className="relative aspect-[3/4] bg-muted/10 max-w-sm rounded-sm overflow-hidden border border-border/40">
              {aboutData?.image ? (
                <img src={aboutData.image} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" alt="about portrait preview" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted uppercase tracking-widest">No Image</div>
              )}
            </div>
            <div className="space-y-3 font-sans">
              <input 
                type="text" 
                value={aboutData?.image || ""} 
                onChange={e => setAboutData(aboutData ? { ...aboutData, image: e.target.value } : { id: crypto.randomUUID(), image: e.target.value })} 
                className="w-full bg-transparent border-b border-border/50 py-2 text-xs focus:outline-none text-fg font-mono" 
                placeholder="Image URL" 
              />
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-wider text-muted block font-bold">Or Upload Portrait File:</span>
                <input type="file" onChange={e => handleFileUpload(e, 'image', 'about')} className="text-[9px] text-muted w-full" />
              </div>
            </div>
          </div>

          {/* Connect Image / Additional portrait */}
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block select-none">Connect Portrait image (Legacy)</label>
            <div className="relative aspect-[3/4] bg-muted/10 max-w-sm rounded-sm overflow-hidden border border-border/40">
              {aboutData?.connect_image ? (
                <img src={aboutData.connect_image} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" alt="connect portrait preview" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted uppercase tracking-widest">No Image</div>
              )}
            </div>
            <div className="space-y-3 font-sans">
              <input 
                type="text" 
                value={aboutData?.connect_image || ""} 
                onChange={e => setAboutData(aboutData ? { ...aboutData, connect_image: e.target.value } : { id: crypto.randomUUID(), image: "", connect_image: e.target.value })} 
                className="w-full bg-transparent border-b border-border/50 py-2 text-xs focus:outline-none text-fg font-mono" 
                placeholder="Image URL" 
              />
              <div className="space-y-1 font-sans">
                <span className="text-[8px] uppercase tracking-wider text-muted block font-bold">Or Upload File:</span>
                <input type="file" onChange={e => handleFileUpload(e, 'connect_image', 'about')} className="text-[9px] text-muted w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <button 
            type="button" 
            onClick={() => saveContent('about_content', aboutData)}
            className="px-5 py-2 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Update Portraits
          </button>
        </div>

        {/* Narrative Paragraph Story Blocks */}
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold block">Paragraph 1 (Introductory Summary)</label>
            <textarea 
              value={siteContent['about_para_1'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_para_1: e.target.value })} 
              className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-fg text-xs rounded-sm text-fg leading-relaxed" 
              rows={3}
              placeholder="e.g. Ashish Guptaa is an Ex-Ogilvy Art Director, Brand Identity Designer..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Paragraph 2 (Art Direction & Media Services)</label>
            <textarea 
              value={siteContent['about_para_2'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_para_2: e.target.value })} 
              className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-fg text-xs rounded-sm text-fg leading-relaxed" 
              rows={3}
              placeholder="e.g. His work spans brand identity design, logo design..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Paragraph 3 (Key Customers / Client Work)</label>
            <textarea 
              value={siteContent['about_para_3'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_para_3: e.target.value })} 
              className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-fg text-xs rounded-sm text-fg leading-relaxed" 
              rows={3}
              placeholder="e.g. He has shaped work for brands like Coke, Cadbury..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Paragraph 4 (Creative Values)</label>
            <textarea 
              value={siteContent['about_para_4'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_para_4: e.target.value })} 
              className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-fg text-xs rounded-sm text-fg leading-relaxed" 
              rows={3}
              placeholder="e.g. From brand identities and logo systems to campaign visuals..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold block">Paragraph 5 (Closing Conviction Statement)</label>
            <textarea 
              value={siteContent['about_para_5'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_para_5: e.target.value })} 
              className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-[#FF4D00] text-xs rounded-sm text-fg leading-relaxed" 
              rows={3}
              placeholder="e.g. For every thought, brief, brand, film, product..."
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: FOOTER CTA (BOTTOM OF THE PAGE) */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 03: Footer Call To Action</h3>
          </div>
          <button 
            type="button"
            onClick={() => saveSiteContent(section3Keys)}
            className="px-4 py-1.5 border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00]/5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors"
          >
            Save CTA Copy
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold">CTA Small Label Title</label>
            <input 
              type="text" 
              value={siteContent['about_cta_label'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_cta_label: e.target.value })} 
              className="w-full bg-transparent border-b border-border/50 py-2 focus:outline-none focus:border-fg text-xs text-fg" 
              placeholder="Let's build something collective"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold">CTA Major Heading Description (Use \n for line breaks)</label>
            <textarea 
              value={siteContent['about_cta_heading'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, about_cta_heading: e.target.value })} 
              className="w-full bg-transparent border border-border/40 p-3 focus:outline-none focus:border-[#FF4D00] text-xs rounded-sm text-fg leading-relaxed" 
              rows={2}
              placeholder="Have a perspective? Let's make it real."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="button"
          onClick={() => saveSiteContent(allKeys)}
          className="w-full py-4 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-lg font-bold uppercase tracking-[0.2em] transition-all text-center"
        >
          Publish All About Page Changes
        </button>
      </div>
    </div>
  );
}

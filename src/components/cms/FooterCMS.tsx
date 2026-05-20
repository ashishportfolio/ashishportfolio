import React from 'react';

interface FooterCMSProps {
  siteContent: Record<string, string>;
  setSiteContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveSiteContent: (keys: string[]) => Promise<void>;
}

export default function FooterCMS({ siteContent, setSiteContent, saveSiteContent }: FooterCMSProps) {
  const footerKeys = [
    'footer_logo_text',
    'contact_email',
    'contact_phone',
    'footer_linkedin_url',
    'footer_instagram_url',
    'footer_behance_url',
    'footer_twitter_url'
  ];

  return (
    <div className="max-w-4xl space-y-12 pb-16 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#FF4D00]">Global Footer Manager</h2>
          <p className="text-[10px] text-muted uppercase mt-1">Configure global footer branding, links and contacts</p>
        </div>
        <button 
          type="button"
          onClick={() => saveSiteContent(footerKeys)}
          className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Save Footer Changes
        </button>
      </div>

      {/* SECTION 1: BRANDING */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 01: Footer Branding</h3>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Left Branding String</label>
          <input 
            type="text"
            value={siteContent['footer_logo_text'] || ""}
            onChange={e => setSiteContent({ ...siteContent, footer_logo_text: e.target.value })}
            className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors"
            placeholder="Ashish Guptaa — Art Director"
          />
          <span className="text-[8px] uppercase tracking-wider text-muted font-bold block">This is displayed on the bottom-left of the main footer.</span>
        </div>
      </div>

      {/* SECTION 2: CONVENIENT CONTACT CHANNELS */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 02: Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Contact Email</label>
            <input 
              type="email"
              value={siteContent['contact_email'] || ""}
              onChange={e => setSiteContent({ ...siteContent, contact_email: e.target.value })}
              className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors"
              placeholder="hello@ashishguptaa.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Contact Phone Number</label>
            <input 
              type="text"
              value={siteContent['contact_phone'] || ""}
              onChange={e => setSiteContent({ ...siteContent, contact_phone: e.target.value })}
              className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors"
              placeholder="+91-88661 38571"
            />
          </div>
        </div>
        <span className="text-[8px] uppercase tracking-wider text-muted font-bold block">Note: Modifying these fields also updates your main contact page and headers automatically.</span>
      </div>

      {/* SECTION 3: SOCIAL & PORTFOLIO LINKS */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 03: Social Media & Platform Links</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">LinkedIn Profile URL</label>
            <input 
              type="text"
              value={siteContent['footer_linkedin_url'] || ""}
              onChange={e => setSiteContent({ ...siteContent, footer_linkedin_url: e.target.value })}
              className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors font-mono"
              placeholder="https://www.linkedin.com/in/ashishhgupta/"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Instagram Profile URL (Optional)</label>
            <input 
              type="text"
              value={siteContent['footer_instagram_url'] || ""}
              onChange={e => setSiteContent({ ...siteContent, footer_instagram_url: e.target.value })}
              className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors font-mono"
              placeholder="https://www.instagram.com/username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Behance Profile URL (Optional)</label>
            <input 
              type="text"
              value={siteContent['footer_behance_url'] || ""}
              onChange={e => setSiteContent({ ...siteContent, footer_behance_url: e.target.value })}
              className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors font-mono"
              placeholder="https://www.behance.net/username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Twitter / X Profile URL (Optional)</label>
            <input 
              type="text"
              value={siteContent['footer_twitter_url'] || ""}
              onChange={e => setSiteContent({ ...siteContent, footer_twitter_url: e.target.value })}
              className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors font-mono"
              placeholder="https://twitter.com/username"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

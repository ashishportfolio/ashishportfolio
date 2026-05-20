import React from 'react';

interface HomeCMSProps {
  siteContent: Record<string, string>;
  setSiteContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveSiteContent: (keys: string[]) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, type: 'project' | 'hero' | 'archive' | 'about' | 'client') => Promise<void>;
}

export default function HomeCMS({ siteContent, setSiteContent, saveSiteContent, handleFileUpload }: HomeCMSProps) {
  const homeKeys = [
    'hero_heading', 'hero_sub_copy', 'hero_paragraph', 'hero_center_image',
    'home_profile_headline', 'home_col1_title', 'home_col1_desc', 'home_col2_title', 'home_col2_desc',
    'home_services_heading', 'services_intro',
    'home_service_0_title', 'home_service_0_category',
    'home_service_1_title', 'home_service_1_category',
    'home_service_2_title', 'home_service_2_category',
    'home_service_3_title', 'home_service_3_category',
    'service_image_0', 'service_image_1', 'service_image_2', 'service_image_3',
    'home_portfolio_title', 'home_portfolio_desc',
    'home_stats_title',
    'home_stat_1_val', 'home_stat_1_suffix', 'home_stat_1_title', 'home_stat_1_desc',
    'home_stat_2_val', 'home_stat_2_suffix', 'home_stat_2_title', 'home_stat_2_desc',
    'home_stat_3_val', 'home_stat_3_suffix', 'home_stat_3_title', 'home_stat_3_desc',
    'home_cta_heading', 'home_cta_desc', 'home_cta_bg'
  ];

  return (
    <div className="max-w-4xl space-y-12 pb-16 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#FF4D00]">Home Page Content Manager</h2>
          <p className="text-[10px] text-muted uppercase mt-1">Configure words and media dynamically</p>
        </div>
        <button 
          type="button"
          onClick={() => saveSiteContent(homeKeys)}
          className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Save All Home Changes
        </button>
      </div>

      {/* SECTION 1: HERO */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 01: Hero Content</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Hero Portrait (Center Image) */}
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Main Hero Portrait (Center Image)</label>
            <div className="relative aspect-[3/4] bg-muted/5 max-w-xs rounded-sm overflow-hidden border border-border/40">
              {siteContent['hero_center_image'] ? (
                <img src={siteContent['hero_center_image']} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" alt="hero preview" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[9px] text-muted uppercase tracking-widest">No Image</div>
              )}
            </div>
            <div className="space-y-3 font-sans">
              <input 
                type="text" 
                value={siteContent['hero_center_image'] || ""} 
                onChange={e => setSiteContent({ ...siteContent, hero_center_image: e.target.value })} 
                className="w-full bg-transparent border-b border-border/50 py-2 text-xs focus:outline-none placeholder:text-muted/30 text-fg font-mono" 
                placeholder="Image Source URL" 
              />
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-wider text-muted block font-bold">Or Upload File:</span>
                <input 
                  type="file" 
                  onChange={e => handleFileUpload(e, 'hero_center_image', 'about')} 
                  className="text-[9px] text-muted w-full" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Hero Title / Main Name</label>
              <input 
                type="text"
                value={siteContent['hero_heading'] || ""}
                onChange={e => setSiteContent({ ...siteContent, hero_heading: e.target.value })}
                className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors"
                placeholder="Ashish Guptaa"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Hero Sub-headline / Copy</label>
              <input 
                type="text"
                value={siteContent['hero_sub_copy'] || ""}
                onChange={e => setSiteContent({ ...siteContent, hero_sub_copy: e.target.value })}
                className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors"
                placeholder="Ex-Ogilvy Art Director | Brand Designer | AI Visual Storyteller"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Hero Paragraph / Right Column Copy</label>
              <textarea 
                value={siteContent['hero_paragraph'] || ""}
                onChange={e => setSiteContent({ ...siteContent, hero_paragraph: e.target.value })}
                className="w-full bg-transparent border border-border/50 p-3 text-xs leading-relaxed text-fg focus:outline-none focus:border-fg transition-colors"
                rows={5}
                placeholder="For brands, founders, agencies..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTRO AND DUAL COLUMNS */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 02: Intro Brief {"&"} Dual Columns</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Main Section Headline (Left-Red Tag to Right Text Block)</label>
            <textarea 
              value={siteContent['home_profile_headline'] || ""}
              onChange={e => setSiteContent({ ...siteContent, home_profile_headline: e.target.value })}
              className="w-full bg-transparent border border-border/50 p-3 text-xs leading-relaxed text-fg focus:outline-none focus:border-fg transition-colors"
              rows={3}
              placeholder="An Ex-Ogilvy Art Director and AI Visual Storyteller based in India..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/20">
            {/* Column 1 */}
            <div className="space-y-4">
              <span className="text-[9px] text-[#FF4D00] font-bold uppercase tracking-widest block border-b border-border/20 pb-1">Sub-Column Left</span>
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-muted font-bold block">Sub-Title</label>
                <input 
                  type="text"
                  value={siteContent['home_col1_title'] || ""}
                  onChange={e => setSiteContent({ ...siteContent, home_col1_title: e.target.value })}
                  className="w-full bg-transparent border-b border-border/50 py-2 text-xs text-fg focus:outline-none"
                  placeholder="Bringing Ideas to Life"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-muted font-bold block">Paragraph Context</label>
                <textarea 
                  value={siteContent['home_col1_desc'] || ""}
                  onChange={e => setSiteContent({ ...siteContent, home_col1_desc: e.target.value })}
                  className="w-full bg-transparent border border-border/50 p-3 text-xs leading-relaxed text-fg focus:outline-none"
                  rows={4}
                  placeholder="Every vision begins as a story..."
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <span className="text-[9px] text-[#FF4D00] font-bold uppercase tracking-widest block border-b border-border/20 pb-1">Sub-Column Right</span>
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-muted font-bold block">Sub-Title</label>
                <input 
                  type="text"
                  value={siteContent['home_col2_title'] || ""}
                  onChange={e => setSiteContent({ ...siteContent, home_col2_title: e.target.value })}
                  className="w-full bg-transparent border-b border-border/50 py-2 text-xs text-fg focus:outline-none"
                  placeholder="Collaborate with Me"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-muted font-bold block">Paragraph Context</label>
                <textarea 
                  value={siteContent['home_col2_desc'] || ""}
                  onChange={e => setSiteContent({ ...siteContent, home_col2_desc: e.target.value })}
                  className="w-full bg-transparent border border-border/50 p-3 text-xs leading-relaxed text-fg focus:outline-none"
                  rows={4}
                  placeholder="I partner with brands and agencies..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SERVICES */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 03: Pro Services Content</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Services Section Header Title</label>
            <input 
              type="text"
              value={siteContent['home_services_heading'] || ""}
              onChange={e => setSiteContent({ ...siteContent, home_services_heading: e.target.value })}
              className="w-full bg-transparent border-b border-border/50 py-2 text-xs text-fg focus:outline-none"
              placeholder="Pro Services"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Services Section Subtitle / Intro</label>
            <textarea 
              value={siteContent['services_intro'] || ""} 
              onChange={e => setSiteContent({ ...siteContent, services_intro: e.target.value })} 
              className="w-full bg-transparent border border-border/50 p-3 text-xs focus:outline-none text-fg leading-relaxed" 
              rows={2} 
              placeholder="Visual work built with story..." 
            />
          </div>
        </div>

        {/* 4 Cards */}
        <div className="space-y-6 pt-4 border-t border-border/20">
          <span className="text-[9px] text-[#FF4D00] font-bold uppercase tracking-widest block">Home Service Highlights (4 slots)</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[0, 1, 2, 3].map(i => {
              const defaultTitles = [
                'Brand Identity Design',
                'Campaign Art Direction',
                'Storytelling Key Visuals',
                'AI Art Direction'
              ];
              const defaultCategories = [
                'Identity Systems', 
                'Shoot Direction', 
                'Hero Visuals', 
                'AI Visuals'
              ];

              return (
                <div key={i} className="p-4 bg-fg/[0.01] border border-border/40 rounded-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <span className="text-[9px] font-bold text-fg uppercase">Service Card 0{i + 1}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold">Card Title</label>
                      <input 
                        type="text" 
                        value={siteContent[`home_service_${i}_title`] || ""} 
                        onChange={e => setSiteContent({ ...siteContent, [`home_service_${i}_title`]: e.target.value })} 
                        className="w-full bg-transparent border-b border-border/50 py-1 text-xs focus:outline-none text-fg" 
                        placeholder={defaultTitles[i]} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold">Card Sub-Category</label>
                      <input 
                        type="text" 
                        value={siteContent[`home_service_${i}_category`] || ""} 
                        onChange={e => setSiteContent({ ...siteContent, [`home_service_${i}_category`]: e.target.value })} 
                        className="w-full bg-transparent border-b border-border/50 py-1 text-xs focus:outline-none text-fg" 
                        placeholder={defaultCategories[i]} 
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[8px] uppercase tracking-widest text-muted font-bold block">Card Image Asset</label>
                      <div className="aspect-[16/10] bg-muted/5 rounded-sm overflow-hidden border border-border relative">
                        {siteContent[`service_image_${i}`] ? (
                          <img src={siteContent[`service_image_${i}`]} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={`service ${i}`} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[9px] text-muted">No Image</div>
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={siteContent[`service_image_${i}`] || ""} 
                        onChange={e => setSiteContent({ ...siteContent, [`service_image_${i}`]: e.target.value })} 
                        className="w-full bg-transparent border-b border-border py-2 text-[9px] focus:outline-none text-fg font-mono" 
                        placeholder="Image Direct URL" 
                      />
                      <input 
                        type="file" 
                        onChange={e => handleFileUpload(e, `service_image_${i}`, 'about')} 
                        className="text-[8px] text-muted text-left" 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: FEATURED PORTFOLIO */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 04: Featured Portfolio Intro</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Portfolio Subsection Headline</label>
            <input 
              type="text"
              value={siteContent['home_portfolio_title'] || ""}
              onChange={e => setSiteContent({ ...siteContent, home_portfolio_title: e.target.value })}
              className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none"
              placeholder="Featured Portfolio"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Portfolio Subsection Paragraph Context</label>
            <textarea 
              value={siteContent['home_portfolio_desc'] || ""}
              onChange={e => setSiteContent({ ...siteContent, home_portfolio_desc: e.target.value })}
              className="w-full bg-transparent border border-border/50 p-3 text-xs leading-relaxed text-fg focus:outline-none"
              rows={3}
              placeholder="Explore a collection of high-quality designs..."
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: STATS & FACTS */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 05: Stats {"&"} Facts</h3>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Stats Headline Statement</label>
          <textarea 
            value={siteContent['home_stats_title'] || ""}
            onChange={e => setSiteContent({ ...siteContent, home_stats_title: e.target.value })}
            className="w-full bg-transparent border border-border/50 p-3 text-xs leading-relaxed text-fg focus:outline-none focus:border-fg transition-colors"
            rows={2}
            placeholder="I bridge the gap between cinematic storytelling and functional design..."
          />
        </div>

        {/* 3 Stats editor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/20">
          {[1, 2, 3].map(id => {
            const defaultVals = ['', '7', '60', '200'];
            const defaultSuffixes = ['', '+', '+', '%'];
            const defaultTitles = ['', 'Years Experience', 'Projects Done', 'Satisfied Clients'];
            const defaultDescs = [
              '',
              'In the creative industry field.',
              'Around worldwide in last seven years.',
              'With a great experience and results.'
            ];

            return (
              <div key={id} className="p-4 bg-fg/[0.01] border border-border/30 rounded-sm space-y-3">
                <span className="text-[8px] font-bold uppercase text-muted tracking-wider">Stat Column 0{id}</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[7.5px] uppercase text-muted tracking-widest font-bold">Value Number</label>
                    <input 
                      type="number"
                      value={siteContent[`home_stat_${id}_val`] || ""}
                      onChange={e => setSiteContent({ ...siteContent, [`home_stat_${id}_val`]: e.target.value })}
                      className="w-full bg-transparent border-b border-border/50 py-1 text-xs text-fg focus:outline-none"
                      placeholder={defaultVals[id]}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7.5px] uppercase text-muted tracking-widest font-bold">Suffix</label>
                    <input 
                      type="text"
                      value={siteContent[`home_stat_${id}_suffix`] || ""}
                      onChange={e => setSiteContent({ ...siteContent, [`home_stat_${id}_suffix`]: e.target.value })}
                      className="w-full bg-transparent border-b border-border/50 py-1 text-xs text-fg focus:outline-none"
                      placeholder={defaultSuffixes[id]}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[7.5px] uppercase text-muted tracking-widest font-bold">Title Header</label>
                  <input 
                    type="text"
                    value={siteContent[`home_stat_${id}_title`] || ""}
                    onChange={e => setSiteContent({ ...siteContent, [`home_stat_${id}_title`]: e.target.value })}
                    className="w-full bg-transparent border-b border-border/50 py-1 text-xs text-fg focus:outline-none"
                    placeholder={defaultTitles[id]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[7.5px] uppercase text-muted tracking-widest font-bold">Tiny Context Text</label>
                  <textarea 
                    value={siteContent[`home_stat_${id}_desc`] || ""}
                    onChange={e => setSiteContent({ ...siteContent, [`home_stat_${id}_desc`]: e.target.value })}
                    className="w-full bg-transparent border border-border/50 p-2 text-[11px] leading-relaxed text-fg focus:outline-none"
                    rows={2}
                    placeholder={defaultDescs[id]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: GET IN TOUCH */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 06: Get In Touch CTA</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-muted font-bold">CTA Title Heading</label>
              <input 
                type="text"
                value={siteContent['home_cta_heading'] || ""}
                onChange={e => setSiteContent({ ...siteContent, home_cta_heading: e.target.value })}
                className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none"
                placeholder="Get In Touch"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-muted font-bold">CTA Context Paragraph</label>
              <textarea 
                value={siteContent['home_cta_desc'] || ""}
                onChange={e => setSiteContent({ ...siteContent, home_cta_desc: e.target.value })}
                className="w-full bg-transparent border border-border/50 p-3 text-xs leading-relaxed text-fg focus:outline-none"
                rows={4}
                placeholder="Have a vision you want to bring to life?..."
              />
            </div>
          </div>

          {/* CTA Background Image upload / input */}
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold">CTA Overlay Background Image</label>
            <div className="relative aspect-video bg-muted/5 max-w-sm rounded-sm overflow-hidden border border-border">
              {siteContent['home_cta_bg'] ? (
                <img src={siteContent['home_cta_bg']} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="CTA bg preview" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[9px] text-muted">No custom image (using fallback)</div>
              )}
            </div>
            <div className="space-y-2">
              <input 
                type="text" 
                value={siteContent['home_cta_bg'] || ""} 
                onChange={e => setSiteContent({ ...siteContent, home_cta_bg: e.target.value })} 
                className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none placeholder:text-muted/30 text-fg font-mono" 
                placeholder="Background URL" 
              />
              <input 
                type="file" 
                onChange={e => handleFileUpload(e, 'home_cta_bg', 'about')} 
                className="text-[9px] text-muted block w-full" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="button"
          onClick={() => saveSiteContent(homeKeys)}
          className="w-full py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] transition-all hover:bg-fg/90 text-center"
        >
          Publish All Home Page Changes
        </button>
      </div>
    </div>
  );
}

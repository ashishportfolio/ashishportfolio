import React, { useState, useEffect } from 'react';

interface BrandCMSProps {
  siteContent: Record<string, string>;
  setSiteContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveSiteContent: (keys: string[]) => Promise<void>;
}

// Curated elite display fonts
const DISPLAY_FONTS_PRESETS = [
  'Syne',
  'Space Grotesk',
  'Outfit',
  'Playfair Display',
  'Clash Display',
  'Cabinet Grotesk',
  'Cinzel',
  'Cormorant Garamond',
  'Bricolage Grotesque',
  'Unbounded'
];

// Curated elite body/sans fonts
const SANS_FONTS_PRESETS = [
  'Oxygen',
  'Inter',
  'Plus Jakarta Sans',
  'Geist',
  'Satoshi',
  'DM Sans',
  'Manrope',
  'Urbanist',
  'Work Sans',
  'Albert Sans'
];

// Curated brand accent color presets
const COLOR_PRESETS = [
  { name: 'Heritage Vermilion (Current)', value: '#FF4D00', hover: '#E64200' },
  { name: 'Volt Acid Green', value: '#D4FF00', hover: '#BEDF00' },
  { name: 'Cobalt International Blue', value: '#004BFF', hover: '#003ECC' },
  { name: 'Obsidian Velvet Black', value: '#111111', hover: '#000000' },
  { name: 'Sacred Clay Pink', value: '#E29787', hover: '#CE8677' },
  { name: 'Cyber Crimson Red', value: '#E50914', hover: '#CE0812' },
  { name: 'Chamber Aura Purple', value: '#8A2BE2', hover: '#731FC5' }
];

export default function BrandCMS({ siteContent, setSiteContent, saveSiteContent }: BrandCMSProps) {
  const [customDisplay, setCustomDisplay] = useState('');
  const [customSans, setCustomSans] = useState('');

  const activeDisplay = siteContent['theme_font_display'] || 'Syne';
  const activeSans = siteContent['theme_font_sans'] || 'Oxygen';
  const activeColor = siteContent['theme_accent_color'] || '#FF4D00';
  const activeColorHover = siteContent['theme_accent_color_hover'] || '#E64200';

  // Helper to adjust color brightness to estimate hover shade if not specified
  const estimateHoverColor = (hex: string) => {
    // Basic hex darkener
    let color = hex.replace('#', '');
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    r = Math.max(0, Math.floor(r * 0.9));
    g = Math.max(0, Math.floor(g * 0.9));
    b = Math.max(0, Math.floor(b * 0.9));

    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  const handleColorChange = (value: string) => {
    setSiteContent(prev => ({
      ...prev,
      theme_accent_color: value,
      theme_accent_color_hover: estimateHoverColor(value)
    }));
  };

  const applyPreset = (preset: { value: string; hover: string }) => {
    setSiteContent(prev => ({
      ...prev,
      theme_accent_color: preset.value,
      theme_accent_color_hover: preset.hover
    }));
  };

  const brandKeys = [
    'theme_font_sans',
    'theme_font_display',
    'theme_accent_color',
    'theme_accent_color_hover'
  ];

  return (
    <div className="max-w-4xl space-y-12 pb-16 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#FF4D00]">Brand Typography & Colors</h2>
          <p className="text-[10px] text-muted uppercase mt-1">Configure global display fonts, body typography, and brand accent colors</p>
        </div>
        <button 
          type="button"
          onClick={() => saveSiteContent(brandKeys)}
          className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Save Brand Styles
        </button>
      </div>

      {/* SECTION 1: ACCENT COLOR */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 01: Brand Accent Color Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Picker */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-md border border-border/40 shadow-inner"
                style={{ backgroundColor: activeColor }}
              />
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Primary Theme Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={activeColor}
                    onChange={e => handleColorChange(e.target.value)}
                    className="w-8 h-8 rounded-md bg-transparent border-0 cursor-pointer overflow-hidden p-0"
                  />
                  <input 
                    type="text" 
                    value={activeColor}
                    onChange={e => handleColorChange(e.target.value)}
                    className="w-24 bg-transparent border-b border-border py-1 text-xs text-fg font-mono uppercase focus:outline-none"
                    placeholder="#FF4D00"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-md border border-border/40 shadow-inner"
                style={{ backgroundColor: activeColorHover }}
              />
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Secondary Theme Hover Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={activeColorHover}
                    onChange={e => setSiteContent({ ...siteContent, theme_accent_color_hover: e.target.value })}
                    className="w-8 h-8 rounded-md bg-transparent border-0 cursor-pointer overflow-hidden p-0"
                  />
                  <input 
                    type="text" 
                    value={activeColorHover}
                    onChange={e => setSiteContent({ ...siteContent, theme_accent_color_hover: e.target.value })}
                    className="w-24 bg-transparent border-b border-border py-1 text-xs text-fg font-mono uppercase focus:outline-none"
                    placeholder="#E64200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preset Colors */}
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Curated Presets</label>
            <div className="grid grid-cols-1 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center gap-3 p-2.5 rounded border text-left transition-all ${activeColor.toUpperCase() === preset.value.toUpperCase() ? 'border-fg bg-fg/5 text-fg' : 'border-border/30 hover:border-border text-muted hover:text-fg bg-transparent'}`}
                >
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: preset.value }} />
                  <span className="text-[9px] uppercase tracking-wider font-bold">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FONTS CONFIG */}
      <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-border/40 pb-3">
          <div className="w-2.5 h-2.5 bg-[#FF4D00] rounded-sm" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-fg">Section 02: Typography Settings (Google Fonts)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* DISPLAY/HEADING FONT */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-fg block">01. Display Heading Font</label>
              <p className="text-[9px] text-muted uppercase">Controls headers, big title quotes, and case study hero visuals</p>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-wider text-muted font-bold block">Preset Display Fonts</label>
              <select
                value={DISPLAY_FONTS_PRESETS.includes(activeDisplay) ? activeDisplay : 'custom'}
                onChange={e => {
                  if (e.target.value !== 'custom') {
                    setSiteContent({ ...siteContent, theme_font_display: e.target.value });
                    setCustomDisplay('');
                  }
                }}
                className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg"
              >
                {DISPLAY_FONTS_PRESETS.map(font => (
                  <option key={font} value={font} className="bg-bg text-fg">{font}</option>
                ))}
                <option value="custom" className="bg-bg text-fg">Custom Google Font...</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-wider text-muted font-bold block">Or Type Custom Google Font Name</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={customDisplay}
                  onChange={e => {
                    setCustomDisplay(e.target.value);
                    setSiteContent({ ...siteContent, theme_font_display: e.target.value });
                  }}
                  className="flex-1 bg-transparent border-b border-border/50 py-2 text-xs text-fg focus:outline-none"
                  placeholder="e.g. Playfair Display, Space Grotesk"
                />
              </div>
            </div>

            <div className="p-4 bg-fg/[0.01]/10 rounded border border-border/20 space-y-2">
              <span className="text-[7px] uppercase tracking-wider text-muted font-bold">Display Font Preview</span>
              <div 
                className="text-lg font-medium leading-[1.2] truncate"
                style={{ fontFamily: `"${activeDisplay}", sans-serif` }}
              >
                Defining Future Visual Landscapes
              </div>
            </div>
          </div>

          {/* SANS/BODY BODY FONT */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-fg block">02. Sans-Serif Body Typography</label>
              <p className="text-[9px] text-muted uppercase">Controls paragraph details, list items, controls and global labels</p>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-wider text-muted font-bold block">Preset Body Fonts</label>
              <select
                value={SANS_FONTS_PRESETS.includes(activeSans) ? activeSans : 'custom'}
                onChange={e => {
                  if (e.target.value !== 'custom') {
                    setSiteContent({ ...siteContent, theme_font_sans: e.target.value });
                    setCustomSans('');
                  }
                }}
                className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg"
              >
                {SANS_FONTS_PRESETS.map(font => (
                  <option key={font} value={font} className="bg-bg text-fg">{font}</option>
                ))}
                <option value="custom" className="bg-bg text-fg">Custom Google Font...</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-wider text-muted font-bold block">Or Type Custom Google Font Name</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={customSans}
                  onChange={e => {
                    setCustomSans(e.target.value);
                    setSiteContent({ ...siteContent, theme_font_sans: e.target.value });
                  }}
                  className="flex-1 bg-transparent border-b border-border/50 py-2 text-xs text-fg focus:outline-none"
                  placeholder="e.g. Inter, Roboto, Satoshi"
                />
              </div>
            </div>

            <div className="p-4 bg-fg/[0.01]/10 rounded border border-border/20 space-y-2">
              <span className="text-[7px] uppercase tracking-wider text-muted font-bold">Body Font Preview</span>
              <div 
                className="text-xs leading-relaxed line-clamp-2 text-muted"
                style={{ fontFamily: `"${activeSans}", sans-serif` }}
              >
                I partner with brands and agencies to define their future visual landscapes. Whether it's a global campaign, a brand identity system, or an AI-filmmaking experimental project.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

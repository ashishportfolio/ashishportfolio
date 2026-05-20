/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Mail, Phone, Linkedin, Instagram, Globe } from 'lucide-react';
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import Feather from './components/Feather';
import CustomCursor from './components/CustomCursor';
import Home from './pages/Home';
import Work from './pages/Work';
import CaseStudy from './pages/CaseStudy';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import CMS from './pages/CMS';
import { BookingProvider } from './context/BookingContext';
import { SiteProvider, useSiteContext } from './context/SiteContext';
import BookingModal from './components/BookingModal';

function AppContent() {
  const { siteContent } = useSiteContext();

  const sansFont = siteContent['theme_font_sans'] || 'Oxygen';
  const displayFont = siteContent['theme_font_display'] || 'Syne';
  const accentColor = siteContent['theme_accent_color'] || '#FF4D00';
  const accentColorHover = siteContent['theme_accent_color_hover'] || '#E64200';

  // Build the dynamic loading URL for the customized Google Fonts
  const fontNames = Array.from(new Set([sansFont, displayFont]));
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontNames.map(f => f ? `family=${f.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800` : '').filter(Boolean).join('&')}&display=swap`;
  
  return (
    <SmoothScroll>
      {/* Inject custom styles and Google Fonts links on high-level load */}
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <style>{`
        :root {
          --theme-font-sans-family: "${sansFont}", ui-sans-serif, system-ui, sans-serif !important;
          --theme-font-display-family: "${displayFont}", sans-serif !important;
          --theme-primary: ${accentColor} !important;
          --theme-primary-hover: ${accentColorHover} !important;
        }
      `}</style>
      <div className="relative min-h-screen">
      <CustomCursor />
      <BookingModal />
      <Feather />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cms" element={<CMS />} />
        </Routes>
      </main>
      
      <footer className="w-full max-w-7xl mx-auto px-6 md:px-[7.2%] py-10 lg:py-14 border-t border-border bg-bg relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">
          <div className="flex flex-col gap-3 text-center lg:text-left">
            <span className="text-xl font-display font-medium tracking-tighter capitalize">
              {siteContent['footer_logo_text'] || "Ashish Guptaa — Art Director"}
            </span>
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16 lg:gap-24 text-center sm:text-left">
            <div className="flex flex-col gap-2 items-center sm:items-start lg:items-end lg:text-right">
              <span className="text-[11px] font-bold font-sans tracking-[0.1em] text-muted uppercase">Navigation</span>
              <div className="flex flex-col gap-1.5 text-[11px] font-sans tracking-[0.05em] capitalize whitespace-nowrap items-center sm:items-start lg:items-end">
                <Link to="/" className="hover:opacity-60 transition-opacity">Home</Link>
                <Link to="/about" className="hover:opacity-60 transition-opacity">About</Link>
                <Link to="/services" className="hover:opacity-60 transition-opacity">Services</Link>
                <Link to="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center sm:items-start lg:items-end lg:text-right">
              <span className="text-[11px] font-bold font-sans tracking-[0.1em] text-muted uppercase">Contact</span>
              <div className="flex flex-col gap-1.5 text-[11px] font-sans tracking-[0.05em] lowercase break-all items-center sm:items-start lg:items-end">
                <a href={`mailto:${siteContent['contact_email'] || 'hello@ashishguptaa.com'}`} className="hover:opacity-60 transition-opacity flex items-center gap-2 justify-center sm:justify-start lg:justify-end lg:flex-row-reverse">
                  <Mail size={10} className="text-muted" />
                  <span>{siteContent['contact_email'] || 'hello@ashishguptaa.com'}</span>
                </a>
                <a href={`tel:${siteContent['contact_phone'] || '+918866138571'}`} className="hover:opacity-60 transition-opacity flex items-center gap-2 justify-center sm:justify-start lg:justify-end lg:flex-row-reverse">
                  <Phone size={10} className="text-muted" />
                  <span>{siteContent['contact_phone'] || '+91-88661 38571'}</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center sm:items-start lg:items-end lg:text-right">
              <span className="text-[11px] font-bold font-sans tracking-[0.1em] text-muted uppercase">Social</span>
              <div className="flex flex-col gap-1.5 text-[11px] font-sans tracking-[0.05em] capitalize items-center sm:items-start lg:items-end">
                <a href={siteContent['footer_linkedin_url'] || "https://www.linkedin.com/in/ashishhgupta/"} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity flex items-center gap-2 justify-center sm:justify-start lg:justify-end lg:flex-row-reverse">
                  <Linkedin size={10} className="text-muted" />
                  <span>LinkedIn</span>
                </a>
                {siteContent['footer_instagram_url'] && (
                  <a href={siteContent['footer_instagram_url']} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity flex items-center gap-2 justify-center sm:justify-start lg:justify-end lg:flex-row-reverse">
                    <Instagram size={10} className="text-muted" />
                    <span>Instagram</span>
                  </a>
                )}
                {siteContent['footer_behance_url'] && (
                  <a href={siteContent['footer_behance_url']} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity flex items-center gap-2 justify-center sm:justify-start lg:justify-end lg:flex-row-reverse">
                    <Globe size={10} className="text-muted" />
                    <span>Behance</span>
                  </a>
                )}
                {siteContent['footer_twitter_url'] && (
                  <a href={siteContent['footer_twitter_url']} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity flex items-center gap-2 justify-center sm:justify-start lg:justify-end lg:flex-row-reverse">
                    <Globe size={10} className="text-muted" />
                    <span>Twitter / X</span>
                  </a>
                )}
                <Link to="/cms" className="mt-2 hover:opacity-60 transition-opacity opacity-30">Admin CMS</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </SmoothScroll>
  );
}

export default function App() {
  return (
    <Router>
      <SiteProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </SiteProvider>
    </Router>
  );
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Mail, Phone, Linkedin } from 'lucide-react';
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
  
  return (
    <SmoothScroll>
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
      
      <footer className="w-full max-w-7xl mx-auto px-6 md:px-[8%] py-10 lg:py-14 border-t border-border bg-bg relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">
          <div className="flex flex-col gap-3 text-center lg:text-left">
            <span className="text-xl font-display font-medium tracking-tighter capitalize">Ashish Guptaa — Art Director</span>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16 lg:gap-24 text-center sm:text-left">
            <div className="flex flex-col gap-3 lg:items-end lg:text-right">
              <span className="text-[9px] font-sans tracking-[0.1em] text-muted capitalize">Navigation</span>
              <div className="flex flex-col gap-2 text-[11px] font-sans tracking-[0.05em] capitalize whitespace-nowrap lg:items-end">
                <Link to="/" className="hover:opacity-60 transition-opacity">Home</Link>
                <Link to="/about" className="hover:opacity-60 transition-opacity">About</Link>
                <Link to="/services" className="hover:opacity-60 transition-opacity">Services</Link>
                <Link to="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end lg:text-right">
              <span className="text-[9px] font-sans tracking-[0.1em] text-muted capitalize">Contact</span>
              <div className="flex flex-col gap-2 text-[11px] font-sans tracking-[0.05em] lowercase break-all lg:items-end">
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

            <div className="flex flex-col gap-3 lg:items-end lg:text-right">
              <span className="text-[9px] font-sans tracking-[0.1em] text-muted capitalize">Social</span>
              <div className="flex flex-col gap-2 text-[11px] font-sans tracking-[0.05em] capitalize lg:items-end">
                <a href="https://www.linkedin.com/in/ashishhgupta/" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity flex items-center gap-2 justify-center sm:justify-start lg:justify-end lg:flex-row-reverse">
                  <Linkedin size={10} className="text-muted" />
                  <span>LinkedIn</span>
                </a>
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


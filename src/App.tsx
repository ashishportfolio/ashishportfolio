/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
import BookingModal from './components/BookingModal';

export default function App() {
  return (
    <Router>
      <BookingProvider>
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
          
          <footer className="px-6 md:px-[8%] py-10 lg:py-14 border-t border-border flex flex-col md:flex-row justify-between items-center lg:items-start gap-12 bg-bg relative z-10 text-center lg:text-left">
            <div className="flex flex-col gap-3">
              <span className="text-xl font-display font-medium tracking-tighter capitalize">Ashish Gupta</span>
              <span className="text-[9px] font-sans tracking-[0.1em] text-muted capitalize">Crafted With Precision — Based in India</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
             <div className="flex flex-col gap-3">
                <span className="text-[9px] font-sans tracking-[0.1em] text-muted capitalize">Navigation</span>
                <div className="flex flex-col gap-2 text-[11px] font-sans tracking-[0.05em] capitalize whitespace-nowrap">
                  <Link to="/" className="hover:opacity-60 transition-opacity">Home</Link>
                  <Link to="/about" className="hover:opacity-60 transition-opacity">About</Link>
                  <Link to="/services" className="hover:opacity-60 transition-opacity">Services</Link>
                  <Link to="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[9px] font-sans tracking-[0.1em] text-muted capitalize">Social</span>
                <div className="flex flex-col gap-2 text-[11px] font-sans tracking-[0.05em] capitalize">
                  <a href="https://www.linkedin.com/in/ashishhgupta/" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">LinkedIn</a>
                  <Link to="/cms" className="mt-2 hover:opacity-60 transition-opacity opacity-30">Admin CMS</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </SmoothScroll>
    </BookingProvider>
  </Router>
);
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import Feather from './components/Feather';
import Home from './pages/Home';
import Work from './pages/Work';
import CaseStudy from './pages/CaseStudy';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import CMS from './pages/CMS';

export default function App() {
  return (
    <Router>
      <SmoothScroll>
        <div className="relative min-h-screen">
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
          
          <footer className="px-5 md:px-11 py-8 lg:py-20 border-t border-border flex flex-col md:flex-row justify-between items-center lg:items-start gap-12 bg-bg relative z-10 text-center lg:text-left">
            <div className="flex flex-col gap-4">
              <span className="text-2xl font-display font-medium tracking-tighter uppercase">AshishGuptaa</span>
              <span className="text-[10px] font-sans tracking-[0.2em] text-muted uppercase">Crafted With Precision — Based in India</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
             <div className="flex flex-col gap-4">
                <span className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase">Navigation</span>
                <div className="flex flex-col gap-2 text-[10px] font-sans tracking-[0.2em] uppercase whitespace-nowrap">
                  <Link to="/" className="hover:opacity-60 transition-opacity">Home</Link>
                  <Link to="/about" className="hover:opacity-60 transition-opacity">About</Link>
                  <Link to="/services" className="hover:opacity-60 transition-opacity">Services</Link>
                  <Link to="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase">Social</span>
                <div className="flex flex-col gap-2 text-[10px] font-sans tracking-[0.2em] uppercase">
                  <a href="https://www.linkedin.com/in/ashishhgupta/" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">LinkedIn</a>
                  <Link to="/cms" className="mt-4 hover:opacity-60 transition-opacity opacity-30">Admin CMS</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </SmoothScroll>
    </Router>
  );
}


import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Menu, X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { name: 'PROJECTS', path: '/work' },
  { name: 'ABOUT', path: '/about' },
  { name: 'SERVICES', path: '/services' },
  { name: 'CONTACT', path: '/contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Disable scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 md:px-11 md:py-6 flex justify-between items-center bg-bg/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
        <Link to="/" className="flex items-center gap-2 relative z-[60]">
          <span className="text-xl md:text-2xl font-display font-medium tracking-tighter text-fg">
            AshishGuptaa
          </span>
        </Link>

        {/* Global Nav - Desktop Only */}
        <div className="hidden lg:flex items-center gap-12">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="group relative overflow-hidden"
            >
              <span className={cn(
                "text-sm font-sans font-medium tracking-tight transition-colors duration-300",
                location.pathname === link.path ? "text-fg" : "text-muted hover:text-fg"
              )}>
                {link.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Hamburger Toggle - Mobile/Tablet Only */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden relative z-[60] p-2 -mr-2 outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <X size={24} className="text-fg" />
          ) : (
            <Menu size={24} className="text-fg" />
          )}
        </button>

        {/* Overlay Menu - Mobile/Tablet Only */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="fixed inset-0 h-screen w-screen bg-bg z-[55] flex items-center justify-center lg:hidden"
            >
              <div className="flex flex-col items-center gap-6 md:gap-10">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                  >
                    <Link
                      to={link.path}
                      className="text-4xl md:text-7xl font-display font-medium text-fg tracking-tighter uppercase transition-opacity hover:opacity-50"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 text-[10px] text-muted font-sans tracking-[0.4em] uppercase"
              >
                Mumbai / India
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

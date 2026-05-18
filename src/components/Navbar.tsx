import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/work' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* Desktop Navigation - Hidden on Mobile/Tablet */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] hidden lg:flex items-center bg-[#1a1a1a]/80 backdrop-blur-md px-2 py-2 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            const isContact = link.name === 'Contact';

            if (isContact) {
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="ml-1"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white px-5 py-2 rounded-lg"
                  >
                    <span className="text-black text-[12px] font-sans font-bold tracking-[0.05em] capitalize">
                      {link.name}
                    </span>
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.path}
                className="px-3.5 py-2 group"
              >
                <span className={cn(
                  "text-[12px] font-sans font-medium tracking-[0.05em] transition-colors duration-300 capitalize",
                  isActive ? "text-white" : "text-white/50 group-hover:text-white"
                )}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Hamburger Trigger */}
      <div className="lg:hidden fixed top-6 right-6 z-[110]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white border border-white/10 shadow-xl active:scale-95 transition-transform"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[105] bg-bg flex flex-col items-center justify-center p-[8%] lg:hidden"
          >
            <div className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={cn(
                      "text-4xl font-display font-medium tracking-tighter capitalize transition-colors",
                      location.pathname === link.path ? "text-fg" : "text-muted hover:text-fg"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom info in menu */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.4 }}
               transition={{ delay: 0.6 }}
               className="absolute bottom-12 flex flex-col items-center gap-4 text-[10px] uppercase font-bold tracking-[0.2em]"
            >
              <span>Ashish Guptaa — Art Director</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

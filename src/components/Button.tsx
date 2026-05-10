import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MotionLink = motion(Link);

interface ButtonProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const Button = ({ children, to, href, onClick, className = '', type = 'button', disabled = false }: ButtonProps) => {
  const content = (
    <>
      <div className="relative z-20 flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[#FF4D00] flex items-center justify-center text-white shrink-0 transition-transform duration-[1500ms] ease-in-out group-hover:rotate-45">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>
        <span className="text-[10px] md:text-[11px] font-sans font-bold tracking-[0.1em] uppercase transition-colors duration-[1500ms] group-hover:text-white text-black">
          {children}
        </span>
      </div>
      
      {/* Expanding Background Circle */}
      <motion.div 
        className="absolute left-1.5 top-1.5 w-8 h-8 rounded-full bg-[#FF4D00] z-10"
        initial={false}
        variants={{
          initial: { 
            scale: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          },
          hover: { 
            scale: disabled ? 1 : 25,
            transition: { duration: 2.5, ease: [0.22, 1, 0.36, 1] }
          }
        }}
      />
    </>
  );

  const baseClasses = cn(
    "group relative overflow-hidden bg-[#f4f4f4] p-1.5 pr-8 rounded-full inline-flex items-center min-w-[160px] transition-all",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  const motionProps = {
    initial: "initial",
    whileHover: disabled ? "initial" : "hover",
    animate: "initial"
  };

  if (to && !disabled) {
    return (
      <MotionLink to={to} className={baseClasses} {...motionProps}>
        {content}
      </MotionLink>
    );
  }

  if (href && !disabled) {
    return (
      <motion.a href={href} className={baseClasses} {...motionProps}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={baseClasses} 
      {...motionProps}
    >
      {content}
    </motion.button>
  );
};

export default Button;

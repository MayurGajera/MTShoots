'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="hidden md:block fixed bottom-6 right-6 z-40 w-12 h-12 pointer-events-auto"
        >
          {/* Tooltip positioned absolutely above - never shifts the button */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="hidden md:block absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#181615] rounded-full shadow-lg border border-white/10 whitespace-nowrap pointer-events-none z-50"
              >
                Back to Top
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={scrollToTop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Scroll to top of page"
            className="group relative w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#E7E1DA] hover:border-[#C85A32] shadow-2xl hover:shadow-[#C85A32]/30 transition-colors duration-200 flex items-center justify-center cursor-pointer active:scale-95 ring-1 ring-black/5"
          >
            <div className="absolute inset-0 rounded-full bg-[#C85A32]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Mouse Icon - Perfectly Centered in circle */}
            <div className="w-5 h-7 rounded-full border-2 border-[#181615] group-hover:border-[#C85A32] flex items-start justify-center pt-1.5 transition-colors duration-200">
              <motion.div
                animate={{ y: [0, 4, 0], opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="w-1 h-1.5 rounded-full bg-[#C85A32] group-hover:bg-[#B24E2A]"
              />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

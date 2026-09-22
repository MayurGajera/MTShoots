'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-[88px] right-4 sm:bottom-[88px] sm:right-5 md:bottom-8 md:right-8 z-30 flex flex-col items-center pointer-events-auto"
        >
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: -4 }}
                exit={{ opacity: 0, y: 6 }}
                className="hidden md:inline-block mb-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#181615] rounded-full shadow-lg border border-white/10 whitespace-nowrap pointer-events-none"
              >
                Back to Top
              </motion.span>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={scrollToTop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Scroll to top of page"
            className="group relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/95 backdrop-blur-md border-2 border-[#E7E1DA] hover:border-[#C85A32] shadow-xl hover:shadow-[#C85A32]/25 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-[#C85A32]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative w-4 h-5 md:w-5 md:h-7 rounded-full border-2 border-[#181615] group-hover:border-[#C85A32] flex items-start justify-center p-0.5 transition-colors duration-200">
              <motion.div
                animate={{ y: [0, 5, 0], opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                className="w-1 h-1.5 rounded-full bg-[#C85A32] group-hover:bg-[#B24E2A]"
              />
            </div>
            <motion.div
              animate={{ y: [-1, 2, -1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="mt-0.5 text-[#8a726a] group-hover:text-[#C85A32] transition-colors"
            >
              <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
            </motion.div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
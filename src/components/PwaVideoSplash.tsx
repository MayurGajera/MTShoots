'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface PwaVideoSplashProps {
  onComplete: () => void;
  videoSrc?: string;
  durationSeconds?: number;
}

export const PwaVideoSplash: React.FC<PwaVideoSplashProps> = ({
  onComplete,
  videoSrc = '/promo.mp4',
  durationSeconds = 6.5
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt playback immediately
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }

    // Run for 6-7 seconds then transition to landing page
    const timer = setTimeout(() => {
      handleFinish();
    }, durationSeconds * 1000);

    return () => clearTimeout(timer);
  }, [durationSeconds]);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      setIsMuted(next);
    }
  };

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] bg-[#0d0c0b] flex flex-col items-center justify-center overflow-hidden select-none p-4"
        >
          {/* Subtle warm ambient glow behind centered video */}
          <div className="absolute w-72 h-72 rounded-full bg-[#C85A32]/15 blur-3xl pointer-events-none" />

          {/* Centered Video Card - smaller, properly framed in middle, no UI cut off */}
          <div className="relative z-10 w-full max-w-[330px] sm:max-w-[380px] aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/10 bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted={isMuted}
              playsInline
              preload="auto"
              onEnded={handleFinish}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Top controls: Mute toggle & Skip button */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-black/80 transition-all cursor-pointer shadow-lg"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <span>Skip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom branding overlay */}
          <div className="absolute bottom-8 inset-x-0 text-center z-20 pointer-events-none px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-pulse" />
              <span>MTShoots Verified Photography Network</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

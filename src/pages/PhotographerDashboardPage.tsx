import React from 'react';
import { useNavigate } from '@/lib/navigation';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const PhotographerDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E7E1DA] shadow-xl max-w-lg w-full text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#fbf2ee] border border-[#dec0b7] text-[#C85A32] flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF4ED] text-[#2D593E] text-xs font-bold uppercase tracking-wider border border-[#C6E1CD]">
              MTShoots Verified Network
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181615]">
              Coming Soon
            </h1>
            <p className="text-sm text-[#8a726a] leading-relaxed max-w-md mx-auto">
              Your photographer dashboard is currently being built. Full access will be available soon.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E7E1DA]">
            <Button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto min-w-[200px] bg-[#181615] hover:bg-[#C85A32] text-white font-bold text-xs py-3.5 px-8 rounded-full shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Camera, User, Eye, EyeOff, ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MTShootsLogo } from '../components/MTShootsLogo';
import { ButtonSpinner } from '../components/ApertureLoader';

type AuthMode = 'login' | 'signup';
type UserRole = 'customer' | 'photographer';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');

  // Pre-select role or mode from URL params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const modeParam = searchParams.get('mode');
    if (roleParam === 'photographer') {
      setRole('photographer');
      setMode('signup');
    }
    if (modeParam === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    // Simulate auth latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      localStorage.setItem('mtshoots_user', JSON.stringify({
        email,
        fullName: fullName || email.split('@')[0],
        role,
        city: city || 'Mumbai',
        createdAt: new Date().toISOString()
      }));
    } catch {}

    setIsLoading(false);
    setSuccess(true);

    setTimeout(() => {
      navigate('/photographers');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden select-none">
      {/* ============================================================ */}
      {/* DYNAMIC LIVE WALLPAPER BACKGROUND WITH BLURRISH VISIBILITY   */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep photographic atmosphere layer */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2000&q=85')`,
          }}
        />

        {/* Ambient Dark & Terracotta Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#181615]/90 via-[#181615]/75 to-[#C85A32]/40 mix-blend-multiply" />

        {/* Animated Floating Bokeh Orbs */}
        <motion.div
          animate={{
            x: [0, 50, -40, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.25, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#C85A32]/35 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -30, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] rounded-full bg-[#D9A05B]/25 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, 40, -50, 0],
            scale: [1, 1.2, 1, 1],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-[#4A7C59]/25 blur-3xl"
        />

        {/* Frosted Lens Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-md bg-[#181615]/30" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="focus-ring rounded-lg">
          <MTShootsLogo size="md" showTagline />
        </Link>
        <Link
          to="/"
          className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </header>

      {/* Main Glassmorphic Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 text-[#181615]"
        >
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF4ED] text-[#4A7C59] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#181615]">
                {mode === 'login' ? 'Welcome Back!' : 'Account Created!'}
              </h2>
              <p className="text-xs sm:text-sm text-[#57423b]">
                {role === 'photographer'
                  ? 'Redirecting you to the photographer roster...'
                  : 'Redirecting you to explore verified photographers...'}
              </p>
            </div>
          ) : (
            <div>
              {/* Role Switcher Pill */}
              <div className="p-1 rounded-2xl bg-[#F4EFEB] border border-[#E7E1DA] flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'customer'
                      ? 'bg-white text-[#181615] shadow-sm'
                      : 'text-[#8a726a] hover:text-[#181615]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Book Shoots</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('photographer')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'photographer'
                      ? 'bg-white text-[#181615] shadow-sm'
                      : 'text-[#8a726a] hover:text-[#181615]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Join as Photographer</span>
                </button>
              </div>

              {/* Title & Tabs */}
              <div className="text-center mb-6">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181615]">
                  {role === 'photographer'
                    ? (mode === 'signup' ? 'Create Artist Account' : 'Photographer Sign In')
                    : (mode === 'signup' ? 'Join MTShoots' : 'Welcome to MTShoots')}
                </h1>
                <p className="text-xs text-[#8a726a] mt-1">
                  {role === 'photographer'
                    ? 'Showcase your portfolio to top commercial & event clients'
                    : 'Access India’s verified photography and cinema network'}
                </p>

                <div className="flex justify-center gap-6 mt-4 border-b border-[#E7E1DA]">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`pb-2.5 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 -mb-px ${
                      mode === 'login'
                        ? 'border-[#C85A32] text-[#C85A32]'
                        : 'border-transparent text-[#8a726a] hover:text-[#181615]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className={`pb-2.5 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 -mb-px ${
                      mode === 'signup'
                        ? 'border-[#C85A32] text-[#C85A32]'
                        : 'border-transparent text-[#8a726a] hover:text-[#181615]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-[#fbf2ee] border border-[#dec0b7] text-xs text-[#C85A32] font-semibold flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57423b] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726a]" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Malhotra"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57423b] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726a]" />
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                {mode === 'signup' && role === 'photographer' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57423b] mb-1">
                      Primary Base City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai, Delhi NCR, Bengaluru"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57423b]">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => alert('Password reset link sent to registered email.')}
                        className="text-[11px] text-[#C85A32] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726a]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57423b] mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726a]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <p className="text-[11px] text-[#8a726a] leading-tight pt-1">
                    By signing up, you agree to MTShoots{' '}
                    <Link to="/terms" className="text-[#C85A32] underline">Terms of Service</Link>
                    ,{' '}
                    <Link to="/privacy" className="text-[#C85A32] underline">Privacy Policy</Link>
                    , and{' '}
                    <Link to="/cancellation" className="text-[#C85A32] underline">Cancellation Slabs</Link>.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold text-xs shadow-md hover:shadow-[#C85A32]/30 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] mt-2"
                >
                  {isLoading ? (
                    <ButtonSpinner />
                  ) : (
                    <span>{mode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
                  )}
                </button>
              </form>

              {/* Verified Artist Security Badge */}
              <div className="mt-5 pt-4 border-t border-[#E7E1DA] flex items-center justify-center gap-2 text-[11px] text-[#4A7C59]">
                <ShieldCheck className="w-4 h-4" />
                <span>256-bit Encrypted SSL • Direct Indian Bank Escrow</span>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-[11px] text-white/70">
        © 2026 MTShoots India. All rights reserved. •
        <Link to="/terms" className="hover:underline ml-1.5 text-white/90">Terms</Link> •
        <Link to="/privacy" className="hover:underline ml-1.5 text-white/90">Privacy</Link> •
        <Link to="/cancellation" className="hover:underline ml-1.5 text-white/90">Cancellation</Link>
      </footer>
    </div>
  );
};

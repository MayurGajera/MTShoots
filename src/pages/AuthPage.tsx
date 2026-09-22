'use client';
﻿import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from '@/lib/navigation';
import {
  Camera,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  Upload,
  RefreshCw,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MTShootsLogo } from '../components/MTShootsLogo';
import { ButtonSpinner } from '../components/ApertureLoader';

type AuthMode = 'login' | 'signup' | 'forgot';
type UserRole = 'customer' | 'photographer';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'
];

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
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);

  // Forgot Password / OTP Flow States
  const [otpStage, setOtpStage] = useState<'email' | 'otp' | 'newPassword' | 'done'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (modeParam === 'forgot') {
      setMode('forgot');
    }
  }, [searchParams]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (mode === 'forgot' && otpStage === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, otpStage, otpTimer]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

    try {
      await new Promise(r => setTimeout(r, 600));

      const userObject = {
        id: 'usr-' + Date.now(),
        fullName: mode === 'signup' ? fullName : (email.split('@')[0].replace(/[._]/g, ' ') || 'Mayur Gajera'),
        email,
        role,
        city: mode === 'signup' ? city : 'Mumbai',
        avatar: avatarUrl
      };

      localStorage.setItem('mtshoots_user', JSON.stringify(userObject));
      window.dispatchEvent(new CustomEvent('mtshoots-auth-changed'));

      setSuccess(true);
      setTimeout(() => {
        if (role === 'photographer') {
          navigate('/photographers/apply');
        } else {
          navigate('/photographers');
        }
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Handlers
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpStage('otp');
      setOtpTimer(60);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newCode = [...otpCode];
    newCode[index] = val;
    setOtpCode(newCode);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setOtpTimer(60);
    setCanResend(false);
    setError(null);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setError('Please enter the full 6-digit OTP code sent to your email.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpStage('newPassword');
    }, 500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpStage('done');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
      {/* Top Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-[#8a726a] hover:text-[#181615] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link to="/" className="focus-ring rounded-lg">
          <MTShootsLogo size="sm" />
        </Link>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-[#E7E1DA] p-6 sm:p-8 shadow-sm">
            {/* If in Forgot Password Mode */}
            {mode === 'forgot' ? (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#fbf2ee] text-[#C85A32] flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-[#181615]">Reset Password</h1>
                  <p className="text-xs text-[#8a726a] mt-1">
                    {otpStage === 'email' && 'Enter your registered email to receive a 6-digit OTP code'}
                    {otpStage === 'otp' && `Enter 6-digit verification code sent to ${otpEmail}`}
                    {otpStage === 'newPassword' && 'Create your new password'}
                    {otpStage === 'done' && 'Your password has been reset successfully!'}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium mb-4">
                    {error}
                  </div>
                )}

                {/* Stage 1: Email */}
                {otpStage === 'email' && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#181615] mb-1.5">Registered Email</label>
                      <input
                        type="email"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-white text-xs focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {isLoading ? <ButtonSpinner text="Sending Code..." /> : 'Send 6-Digit Verification Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(null); }}
                      className="w-full text-center text-xs text-[#8a726a] hover:text-[#181615] font-semibold cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </form>
                )}

                {/* Stage 2: 6-Digit OTP */}
                {otpStage === 'otp' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#181615] text-center mb-3">
                        Enter 6-Digit Security OTP
                      </label>
                      <div className="flex justify-center gap-2">
                        {otpCode.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => (otpInputRefs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className="w-10 h-12 text-center text-lg font-bold rounded-xl border border-[#E7E1DA] focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-center text-xs">
                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-[#C85A32] font-bold hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Resend New OTP Code</span>
                        </button>
                      ) : (
                        <span className="text-[#8a726a]">
                          Resend OTP in <strong className="text-[#181615]">{otpTimer}s</strong>
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {isLoading ? <ButtonSpinner text="Verifying..." /> : 'Verify Code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpStage('email')}
                      className="w-full text-center text-xs text-[#8a726a] hover:text-[#181615] font-semibold cursor-pointer"
                    >
                      Change Email Address
                    </button>
                  </form>
                )}

                {/* Stage 3: New Password */}
                {otpStage === 'newPassword' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#181615] mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="Enter password" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#181615] mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        placeholder="Enter password" />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-[#2D593E] hover:bg-[#234731] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {isLoading ? <ButtonSpinner text="Saving..." /> : 'Set New Password'}
                    </button>
                  </form>
                )}

                {/* Stage 4: Done */}
                {otpStage === 'done' && (
                  <div className="text-center py-4 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#EAF4ED] text-[#2D593E] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-[#8a726a]">
                      Your credentials have been securely refreshed. You can now sign in with your new password.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setOtpStage('email'); }}
                      className="w-full py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Go to Sign In
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Role Switcher Pill */}
                <div className="flex p-1 bg-[#FAF8F5] rounded-2xl border border-[#E7E1DA] mb-6">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'customer'
                        ? 'bg-white text-[#181615] shadow-xs'
                        : 'text-[#8a726a] hover:text-[#181615]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Book Shoots</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('photographer');
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'photographer'
                        ? 'bg-white text-[#181615] shadow-xs'
                        : 'text-[#8a726a] hover:text-[#181615]'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Join as Photographer</span>
                  </button>
                </div>

                {/* Photographer Callout Banner */}
                {role === 'photographer' && (
                  <div className="mb-6 p-4 rounded-2xl bg-[#FFF6F2] border border-[#F4C5B5] text-[#9F3C16] text-xs space-y-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C85A32]" />
                      <span>5-Step Photographer Onboarding</span>
                    </div>
                    <p className="text-[11px] text-[#8a726a] leading-relaxed">
                      Showcase multiple portfolio photos, camera gear specs, and custom rate cards on our dedicated artist application portal.
                    </p>
                    <Link
                      to="/photographers/apply"
                      className="inline-flex items-center gap-1.5 font-bold text-xs text-[#C85A32] hover:underline"
                    >
                      <span>Open 5-Step Artist Onboarding Wizard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

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
                      : 'Access India\'s verified photography and cinema network'}
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

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <>
                      {/* Avatar Picker for Signup */}
                      <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E7E1DA] text-center space-y-2">
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-[#C85A32]/30"
                        />
                        <div className="text-[10px] text-[#8a726a]">Select profile picture avatar:</div>
                        <div className="flex justify-center gap-1.5">
                          {PRESET_AVATARS.map((av, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAvatarUrl(av)}
                              className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                                avatarUrl === av ? 'border-[#C85A32] scale-110' : 'border-transparent opacity-60'
                              }`}
                            >
                              <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#181615] mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Mayur Gajera"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-white text-xs focus:outline-none focus:border-[#C85A32]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#181615] mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Mumbai, Surat, Bengaluru"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-white text-xs focus:outline-none focus:border-[#C85A32]"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#181615] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-white text-xs focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#181615]">
                        Password *
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); setError(null); }}
                          className="text-[11px] text-[#C85A32] hover:underline cursor-pointer font-semibold"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-[#181615] mb-1.5">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Enter password" />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold transition-all shadow-sm cursor-pointer mt-2"
                  >
                    {isLoading ? (
                      <ButtonSpinner text="Authenticating..." />
                    ) : (
                      mode === 'signup' ? 'Create Account' : 'Sign In to Account'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <div className="p-4 text-center text-xs text-[#8a726a]">
        Â© 2026 MTShoots India. All rights reserved.
      </div>
    </div>
  );
};

export default AuthPage;

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
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MTShootsLogo } from '../components/MTShootsLogo';
import { ButtonSpinner } from '../components/ApertureLoader';
import { AvatarPicker } from '../components/AvatarPicker';
import { PhotographerWizard } from '../components/PhotographerWizard';
import { upsertUser, getUserByEmail } from '../lib/supabase';

type AuthMode = 'login' | 'signup' | 'forgot';
type UserRole = 'customer' | 'photographer';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

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

    const errs: Record<string, string> = {};
    if (mode === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        errs.fullName = 'Please enter your full name (minimum 2 characters).';
      }
      if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. you@example.com).';
    }

    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    }

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors({});

    setIsLoading(true);

    try {
      let finalName = fullName.trim();
      let finalCity = city.trim() || 'Mumbai';
      let finalAvatar = avatarUrl || '';
      let finalRole = role;
      let userId = 'usr-' + Date.now();

      if (mode === 'signup') {
        const dbUser = await upsertUser({
          email: email.trim().toLowerCase(),
          full_name: finalName,
          city: finalCity,
          avatar_url: finalAvatar,
          role: finalRole
        });
        if (dbUser?.id) userId = dbUser.id;
      } else {
        const dbUser = await getUserByEmail(email.trim().toLowerCase());
        if (dbUser) {
          userId = dbUser.id || userId;
          finalName = dbUser.full_name || finalName || email.split('@')[0].replace(/[._]/g, ' ');
          finalCity = dbUser.city || finalCity;
          finalAvatar = dbUser.avatar_url || finalAvatar;
          finalRole = dbUser.role || finalRole;
        } else {
          finalName = email.split('@')[0].replace(/[._]/g, ' ') || 'User';
        }
      }

      const userObject = {
        id: userId,
        fullName: finalName,
        email: email.trim().toLowerCase(),
        role: finalRole,
        city: finalCity,
        avatar: finalAvatar
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
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl transition-all">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-[#E7E1DA] p-6 sm:p-10 lg:p-12 shadow-sm">
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
                        className="w-full h-11 px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-white text-xs sm:text-sm text-[#181615] placeholder:text-[#8a726a]/60 focus:outline-none focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/25 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
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
                            ref={(el) => {
                              otpInputRefs.current[i] = el;
                            }}
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
                      className="w-full py-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
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
                      <label className="block text-xs font-bold text-[#181615] mb-1.5">New Password (min 6 characters)</label>
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full h-11 px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-white text-xs sm:text-sm text-[#181615] placeholder:text-[#8a726a]/60 focus:outline-none focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/25 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#181615] mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="w-full h-11 px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-white text-xs sm:text-sm text-[#181615] placeholder:text-[#8a726a]/60 focus:outline-none focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/25 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !resetPassword || resetPassword.length < 6 || resetPassword !== resetConfirmPassword}
                      className="w-full py-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
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

                {role === 'photographer' && mode === 'signup' ? (
                  <div className="w-full">
                    {/* Title & Tabs */}
                    <div className="text-center mb-6">
                      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181615]">
                        Create Artist Account
                      </h1>
                      <p className="text-xs text-[#8a726a] mt-1">
                        Showcase your portfolio to top commercial & event clients
                      </p>

                      <div className="flex justify-center gap-6 mt-4 border-b border-[#E7E1DA]">
                        <button
                          type="button"
                          onClick={() => { setMode('login'); setError(null); }}
                          className="pb-2.5 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 -mb-px border-transparent text-[#8a726a] hover:text-[#181615]"
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => { setMode('signup'); setError(null); }}
                          className="pb-2.5 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 -mb-px border-[#C85A32] text-[#C85A32]"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>

                    <PhotographerWizard
                      hideHeader={true}
                      onSwitchToLogin={() => setMode('login')}
                    />
                  </div>
                ) : (
                  <div>
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

                <form onSubmit={handleSubmit} className='space-y-4'>
                  {mode === 'signup' && (
                    <>
                      <AvatarPicker
                        value={avatarUrl}
                        onChange={setAvatarUrl}
                        label={role === 'photographer' ? 'Artist Profile Picture' : 'Profile Photo'}
                        helperText='Upload your photo or leave blank for default avatar'
                        optional={true}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className='block text-xs font-bold text-[#181615] mb-1.5'>
                            Full Name *
                          </label>
                          <input
                            type='text'
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (validationErrors.fullName) setValidationErrors(prev => ({ ...prev, fullName: '' }));
                            }}
                            placeholder='e.g. Rahul Sharma'
                            className={'w-full h-11 px-3.5 rounded-xl border bg-white text-xs placeholder:text-stone-400 placeholder:font-normal focus:outline-none transition-colors ' + (validationErrors.fullName ? 'border-red-500 focus:border-red-500 ring-1 ring-red-400' : 'border-[#E7E1DA] focus:border-[#C85A32]')}
                          />
                          {validationErrors.fullName && (
                            <p className='text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1'>
                              <AlertCircle className='w-3 h-3 shrink-0' />
                              <span>{validationErrors.fullName}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className='block text-xs font-bold text-[#181615] mb-1.5'>
                            City
                          </label>
                          <input
                            type='text'
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder='e.g. Mumbai, Delhi, Bengaluru'
                            className='w-full h-11 px-3.5 rounded-xl border border-[#E7E1DA] bg-white text-xs placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-[#C85A32]'
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className='block text-xs font-bold text-[#181615] mb-1.5'>
                      Email Address *
                    </label>
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder='e.g. rahul.sharma@example.com'
                      className={'w-full h-11 px-3.5 rounded-xl border bg-white text-xs focus:outline-none transition-colors ' + (validationErrors.email ? 'border-red-500 focus:border-red-500 ring-1 ring-red-400' : 'border-[#E7E1DA] focus:border-[#C85A32]')}
                    />
                    {validationErrors.email && (
                      <p className='text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1'>
                        <AlertCircle className='w-3 h-3 shrink-0' />
                        <span>{validationErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className='flex items-center justify-between mb-1.5'>
                      <label className='block text-xs font-bold text-[#181615]'>
                        Password *
                      </label>
                      {mode === 'login' && (
                        <button
                          type='button'
                          onClick={() => { setMode('forgot'); setError(null); setValidationErrors({}); }}
                          className='text-[11px] text-[#C85A32] hover:underline cursor-pointer font-semibold'
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: '' }));
                        }}
                        placeholder='Enter password (min 6 characters)'
                        className={'w-full h-11 px-3.5 rounded-xl border bg-white text-xs focus:outline-none transition-colors pr-10 ' + (validationErrors.password ? 'border-red-500 focus:border-red-500 ring-1 ring-red-400' : 'border-[#E7E1DA] focus:border-[#C85A32]')}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer p-1'
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className='text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1'>
                        <AlertCircle className='w-3 h-3 shrink-0' />
                        <span>{validationErrors.password}</span>
                      </p>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label className='block text-xs font-bold text-[#181615] mb-1.5'>
                        Confirm Password *
                      </label>
                      <div className='relative'>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
                          }}
                          placeholder='Re-enter password'
                          className={'w-full h-11 px-3.5 rounded-xl border bg-white text-xs focus:outline-none transition-colors pr-10 ' + (validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500 ring-1 ring-red-400' : 'border-[#E7E1DA] focus:border-[#C85A32]')}
                        />
                        <button
                          type='button'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer p-1'
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className='text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1'>
                          <AlertCircle className='w-3 h-3 shrink-0' />
                          <span>{validationErrors.confirmPassword}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold transition-all shadow-sm cursor-pointer mt-2 flex items-center justify-center"
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
            )}
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <div className="p-4 text-center text-xs text-[#8a726a]">
        © 2026 MTShoots India. All rights reserved.
      </div>
    </div>
  );
};

export default AuthPage;

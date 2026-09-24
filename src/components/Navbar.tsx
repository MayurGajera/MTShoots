'use client';
﻿import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Camera,
  Menu,
  X,
  Heart,
  MapPin,
  ChevronDown,
  Smartphone,
  Download,
  User,
  Settings,
  KeyRound,
  LogOut,
  Upload,
  Check,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Laptop,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link, useLocation, useNavigate } from '@/lib/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MTShootsLogo } from './MTShootsLogo';
import { AvatarPicker } from './AvatarPicker';
import { getUserByEmail, upsertUser, savePhotographerToSupabase, getUserAddresses, addUserAddress, deleteUserAddress, getUserDevices, deactivateDevice, DbUserAddress, DbUserDevice } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

interface NavbarProps {
  currentTab?: 'roster' | 'callsheets' | 'shortlist';
  setCurrentTab?: (tab: 'roster' | 'callsheets' | 'shortlist') => void;
  bookingCount?: number;
  shortlistCount?: number;
  isLoading?: boolean;
  onOpenNewBooking?: () => void;
  onOpenLocationPicker?: () => void;
}

interface UserProfile {
  id?: string;
  fullName: string;
  email: string;
  role?: string;
  avatar?: string;
  city?: string;
  phone?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookingCount: propBookingCount,
  shortlistCount: propShortlistCount,
  isLoading: propIsLoading,
  onOpenNewBooking,
  onOpenLocationPicker
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const appContext = useApp();

  const isBookingsLoading = propIsLoading !== undefined ? propIsLoading : appContext?.isBookingsLoading;
  const bookingCount = propBookingCount !== undefined ? propBookingCount : (appContext?.bookings?.length || 0);
  const shortlistCount = propShortlistCount !== undefined ? propShortlistCount : (appContext?.shortlistIds?.length || 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modals for settings and change password
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'addresses' | 'devices'>('profile');
  const [userAddresses, setUserAddresses] = useState<DbUserAddress[]>([]);
  const [userDevices, setUserDevices] = useState<DbUserDevice[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const loadUserAccountData = async (targetEmail: string) => {
    try {
      let dbUser = await getUserByEmail(targetEmail);
      if (!dbUser && user) {
        dbUser = await upsertUser({
          email: targetEmail,
          full_name: user.fullName || 'User',
          city: user.city,
          avatar_url: user.avatar
        });
      }
      if (dbUser?.id) {
        const [addrs, devs] = await Promise.all([
          getUserAddresses(dbUser.id),
          getUserDevices(dbUser.id)
        ]);
        setUserAddresses(addrs);
        setUserDevices(devs);
      }
    } catch {}
  };
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Settings form states
  const [settingsName, setSettingsName] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsCity, setSettingsCity] = useState('');
  const [settingsAvatar, setSettingsAvatar] = useState('');

  // Photographer specific settings states
  const [settingsBrandName, setSettingsBrandName] = useState('');
  const [settingsGenre, setSettingsGenre] = useState('Wedding');
  const [settingsBio, setSettingsBio] = useState('');
  const [settingsStartingRate, setSettingsStartingRate] = useState<number>(40000);
  const [settingsCameraBodies, setSettingsCameraBodies] = useState('');
  const [settingsLenses, setSettingsLenses] = useState('');
  const [initialSettings, setInitialSettings] = useState<{
    name: string;
    phone: string;
    city: string;
    avatar: string;
    brandName: string;
    genre: string;
    bio: string;
    startingRate: number;
    cameraBodies: string;
    lenses: string;
  } | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem('mtshoots_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentCity, setCurrentCity] = useState<string>(() => {
    try {
      if (typeof window === 'undefined') return 'All India';
      return localStorage.getItem('mtshoots_city') || 'All India';
    } catch {
      return 'All India';
    }
  });

  // Calculate if Settings form has actual changes
  const isSettingsDirty = useMemo(() => {
    if (!initialSettings) return false;
    if (settingsName.trim() !== initialSettings.name) return true;
    if (settingsPhone.trim() !== initialSettings.phone) return true;
    if (settingsCity.trim() !== initialSettings.city) return true;
    if (settingsAvatar !== initialSettings.avatar) return true;
    if (user?.role === 'photographer') {
      if (settingsBrandName.trim() !== initialSettings.brandName) return true;
      if (settingsGenre !== initialSettings.genre) return true;
      if (settingsBio.trim() !== initialSettings.bio) return true;
      if (Number(settingsStartingRate) !== initialSettings.startingRate) return true;
      if (settingsCameraBodies.trim() !== initialSettings.cameraBodies) return true;
      if (settingsLenses.trim() !== initialSettings.lenses) return true;
    }
    return false;
  }, [
    initialSettings,
    settingsName,
    settingsPhone,
    settingsCity,
    settingsAvatar,
    settingsBrandName,
    settingsGenre,
    settingsBio,
    settingsStartingRate,
    settingsCameraBodies,
    settingsLenses,
    user?.role
  ]);

  const isPasswordValid = Boolean(
    currentPassword.trim() &&
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword
  );

  // Lock background body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = isSettingsOpen || isPasswordModalOpen;
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isSettingsOpen, isPasswordModalOpen]);

  // Sync user state with storage
  useEffect(() => {
    const handleStorage = () => {
      try {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem('mtshoots_user');
        setUser(stored ? JSON.parse(stored) : null);
        const city = localStorage.getItem('mtshoots_city');
        if (city) setCurrentCity(city);
      } catch {}
    };

    const handleCityChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const city = customEvent.detail || localStorage.getItem('mtshoots_city') || 'All India';
      setCurrentCity(city);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('mtshoots-auth-changed', handleStorage);
    window.addEventListener('mtshoots-city-changed', handleCityChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mtshoots-auth-changed', handleStorage);
      window.removeEventListener('mtshoots-city-changed', handleCityChange);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenSettings = () => {
    if (user) {
      const init = {
        name: user.fullName || '',
        phone: user.phone || '',
        city: user.city || currentCity,
        avatar: user.avatar || '',
        brandName: '',
        genre: 'Wedding',
        bio: '',
        startingRate: 40000,
        cameraBodies: '',
        lenses: ''
      };
      setSettingsName(init.name);
      setSettingsPhone(init.phone);
      setSettingsCity(init.city);
      setSettingsAvatar(init.avatar);

      if (user.role === 'photographer') {
        try {
          const storedProfile = localStorage.getItem('mtshoots_photographer_profile');
          if (storedProfile) {
            const p = JSON.parse(storedProfile);
            init.brandName = p.brandName || p.name || user.fullName || '';
            init.genre = p.primaryDiscipline || p.discipline || p.genre || 'Wedding';
            init.bio = p.bio || '';
            init.startingRate = Number(p.startingDayRate || p.startingRate || 40000);
            init.cameraBodies = Array.isArray(p.equipment?.cameraBodies) ? p.equipment.cameraBodies.join(', ') : (p.gear || '');
            init.lenses = Array.isArray(p.equipment?.lenses) ? p.equipment.lenses.join(', ') : '';

            setSettingsBrandName(init.brandName);
            setSettingsGenre(init.genre);
            setSettingsBio(init.bio);
            setSettingsStartingRate(init.startingRate);
            setSettingsCameraBodies(init.cameraBodies);
            setSettingsLenses(init.lenses);
          }
        } catch {}
      }
      setInitialSettings(init);
      if (user.email) {
        loadUserAccountData(user.email);
      }
    }
    setSettingsTab('profile');
    setShowAddAddress(false);
    setIsSettingsOpen(true);
    setUserDropdownOpen(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !newAddrCity.trim()) return;
    setIsSavingAddress(true);
    try {
      let dbUser = await getUserByEmail(user.email);
      if (!dbUser) {
        dbUser = await upsertUser({
          email: user.email,
          full_name: user.fullName || 'User',
          city: user.city,
          avatar_url: user.avatar
        });
      }
      if (dbUser?.id) {
        await addUserAddress({
          user_id: dbUser.id,
          label: newAddrLabel,
          street: newAddrStreet,
          city: newAddrCity,
          state: newAddrState,
          pincode: newAddrPincode,
          landmark: null,
          is_default: newAddrIsDefault,
        });
        const updatedAddrs = await getUserAddresses(dbUser.id);
        setUserAddresses(updatedAddrs);
        setShowAddAddress(false);
        setNewAddrStreet('');
        setNewAddrCity('');
        setNewAddrState('');
        setNewAddrPincode('');
        triggerToast('Address saved to profile!');
      }
    } catch {} finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    await deleteUserAddress(addrId);
    setUserAddresses(prev => prev.filter(a => a.id !== addrId));
    triggerToast('Address removed');
  };

  const handleRevokeDevice = async (devId: string) => {
    await deactivateDevice(devId);
    setUserDevices(prev => prev.filter(d => d.id !== devId));
    triggerToast('Device access revoked');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmedName = settingsName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      triggerToast('Full name must be at least 2 characters');
      return;
    }
    const updated: UserProfile = {
      ...user,
      fullName: trimmedName,
      phone: settingsPhone.trim(),
      city: settingsCity.trim() || currentCity,
      avatar: settingsAvatar || ''
    };
    setUser(updated);
    localStorage.setItem('mtshoots_user', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mtshoots-auth-changed'));

    try {
      await upsertUser({
        email: user.email,
        full_name: trimmedName,
        phone: settingsPhone.trim(),
        city: settingsCity.trim() || currentCity,
        avatar_url: settingsAvatar || '',
        role: user.role === 'photographer' ? 'photographer' : 'customer'
      });
    } catch (err) {
      console.warn('Could not sync user profile update to Supabase:', err);
    }

    if (user.role === 'photographer') {
      try {
        let existingProfile: any = {};
        const storedProfile = localStorage.getItem('mtshoots_photographer_profile');
        if (storedProfile) {
          existingProfile = JSON.parse(storedProfile);
        }
        const updatedPhotographer = {
          ...existingProfile,
          name: trimmedName,
          brandName: settingsBrandName.trim() || trimmedName,
          phone: settingsPhone.trim(),
          city: settingsCity.trim() || currentCity,
          avatar: settingsAvatar || '',
          primaryDiscipline: settingsGenre,
          startingDayRate: Number(settingsStartingRate) || 40000,
          bio: settingsBio.trim(),
          gear: settingsCameraBodies.trim(),
          equipment: {
            cameraBodies: settingsCameraBodies.split(',').map(s => s.trim()).filter(Boolean),
            lenses: settingsLenses.split(',').map(s => s.trim()).filter(Boolean)
          }
        };
        localStorage.setItem('mtshoots_photographer_profile', JSON.stringify(updatedPhotographer));
        window.dispatchEvent(new CustomEvent('photographers-updated'));
        try {
          await savePhotographerToSupabase(updatedPhotographer);
        } catch {}
      } catch (err) {
        console.warn('Could not sync photographer profile update:', err);
      }
    }

    setIsSettingsOpen(false);
    triggerToast('Account profile updated in database successfully!');
  };

  const handleOpenPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
    setIsPasswordModalOpen(true);
    setUserDropdownOpen(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }
    setPasswordError(null);
    setPasswordSuccess(true);
    triggerToast('Password changed successfully!');
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPasswordSuccess(false);
    }, 1200);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('mtshoots_user');
      localStorage.removeItem('capturely_shortlist');
      setUser(null);
      window.dispatchEvent(new CustomEvent('mtshoots-auth-changed'));
    } catch {}
    setUserDropdownOpen(false);
    navigate('/');
    triggerToast('Signed out of MTShoots');
  };

  const handleOpenCityModal = () => {
    if (onOpenLocationPicker) {
      onOpenLocationPicker();
    } else {
      window.dispatchEvent(new CustomEvent('open-location-picker'));
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinkClass = (path: string) =>
    `px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 cursor-pointer ${
      isActive(path)
        ? 'bg-[#181615] text-white shadow-xs'
        : 'text-[#57423b] hover:text-[#181615] hover:bg-[#F4EFEB]'
    }`;

  const hasUserAvatar = Boolean(user?.avatar && user.avatar.trim());

  return (
  <>
    <header className="fixed left-0 right-0 top-0 z-30 w-full border-b border-[#E7E1DA] bg-[#FAF8F5]/90 backdrop-blur-xl shadow-[0_1px_0_rgba(24,22,21,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          {/* Left: Brand Logo */}
          <Link to="/" className="focus-ring rounded-lg shrink-0">
            <MTShootsLogo size="md" showTagline />
          </Link>

          {/* Right: Actions Cluster */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 lg:space-x-3">
            {/* City Badge Button */}
            <button
              onClick={handleOpenCityModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-[#F4EFEB] text-[#57423b] border border-[#E7E1DA] hover:border-[#C85A32]/40 transition-all cursor-pointer shadow-2xs"
              title="Change location"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
              <span className="truncate max-w-[85px] text-xs">{currentCity}</span>
              <ChevronDown className="w-3 h-3 text-[#8a726a] shrink-0" />
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/photographers" className={navLinkClass('/photographers')}>
                <Camera className="w-3.5 h-3.5 shrink-0" />
                <span>Photographers</span>
              </Link>

              {user && (
                <>
                  <Link to="/bookings" className={navLinkClass('/bookings')}>
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Bookings</span>
                    {isBookingsLoading ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#C85A32]/20 animate-pulse shrink-0" />
                    ) : bookingCount > 0 ? (
                      <span
                        className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full transition-colors leading-none ${
                          isActive('/bookings')
                            ? 'bg-[#C85A32] text-white'
                            : 'bg-[#C85A32]/15 text-[#C85A32]'
                        }`}
                      >
                        {bookingCount}
                      </span>
                    ) : null}
                  </Link>

                  <Link to="/saved" className={navLinkClass('/saved')}>
                    <Heart className="w-3.5 h-3.5 shrink-0" />
                    <span>Saved</span>
                    {shortlistCount > 0 && (
                      <span
                        className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full transition-colors leading-none ${
                          isActive('/saved')
                            ? 'bg-[#2D593E] text-white'
                            : 'bg-[#EAF4ED] text-[#2D593E]'
                        }`}
                      >
                        {shortlistCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </nav>

            {/* Auth / Profile Hub */}
            {user ? (
              <div
                ref={dropdownRef}
                className="relative hidden md:block"
                onMouseEnter={() => setUserDropdownOpen(true)}
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                {/* Profile Photo Avatar Trigger */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-[#E7E1DA] hover:border-[#C85A32]/50 bg-white hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-xs"
                >
                  <div className="relative">
                    {hasUserAvatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-[#C85A32]/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E7E1DA] flex items-center justify-center text-[#C85A32] ring-2 ring-[#C85A32]/20">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#2D593E] ring-1 ring-white" />
                  </div>
                  <span className="text-xs font-bold text-[#181615] truncate max-w-[90px]">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8a726a]" />
                </button>

                {/* Hover / Click Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E7E1DA] p-2 z-50 overflow-hidden"
                    >
                      {/* User Header */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl mb-1 border border-[#E7E1DA]/60">
                        <div className="flex items-center gap-2.5">
                          {hasUserAvatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-white border border-[#E7E1DA] flex items-center justify-center text-[#C85A32] shadow-xs">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <div className="text-xs font-bold text-[#181615] truncate">{user.fullName}</div>
                            <div className="text-[11px] text-[#8a726a] truncate">{user.email}</div>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#2D593E] font-semibold bg-[#EAF4ED] px-2.5 py-1 rounded-lg">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#2D593E] shrink-0" />
                            <span>Verified Client</span>
                          </span>
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[#2D593E]/80">
                            {user.city || currentCity}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="space-y-0.5 pt-1">
                        <button
                          onClick={handleOpenSettings}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#57423b] hover:text-[#181615] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#C85A32]" />
                          <span>Account Settings</span>
                        </button>

                        <button
                          onClick={handleOpenPasswordModal}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#57423b] hover:text-[#181615] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#C85A32]" />
                          <span>Change Password</span>
                        </button>

                        <Link
                          to="/bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#57423b] hover:text-[#181615] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#8a726a]" />
                          <span>My Bookings</span>
                        </Link>

                        <div className="my-1 border-t border-[#E7E1DA]" />

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-600" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <Link
                  to="/photographers/apply"
                  className="text-xs font-semibold text-[#57423b] px-3.5 h-8 rounded-full border border-[#E7E1DA] hover:border-[#dec0b7] hover:bg-[#F4EFEB] transition-all cursor-pointer flex items-center justify-center shrink-0 whitespace-nowrap"
                >
                  Join as Photographer
                </Link>
                <Link
                  to="/auth"
                  className="text-xs font-bold text-white bg-[#181615] px-4 h-8 rounded-full hover:bg-[#C85A32] transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 whitespace-nowrap"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F4EFEB] transition-colors cursor-pointer text-[#181615]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#E7E1DA] py-3 px-1 space-y-2 overflow-hidden"
            >
              {user && (
                <div className="p-3 bg-[#FAF8F5] rounded-2xl mb-2 flex items-center justify-between border border-[#E7E1DA]/80">
                  <div className="flex items-center gap-3 min-w-0">
                    {hasUserAvatar ? (
                      <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white border border-[#E7E1DA] flex items-center justify-center text-[#C85A32] shrink-0 shadow-xs">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#181615] truncate leading-tight">{user.fullName}</div>
                      <div className="text-xs text-[#8a726a] truncate mt-0.5">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenSettings}
                    className="text-xs text-[#C85A32] hover:text-[#b04a25] font-semibold px-2.5 py-1 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Left-aligned navigation items with consistent icons and spacing */}
              <div className="flex flex-col gap-1 py-1">
                <Link
                  to="/photographers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#181615] hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E7E1DA]/80 flex items-center justify-center shrink-0 text-[#C85A32]">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left">Photographers Directory</span>
                </Link>

                {user && (
                  <>
                    <Link
                      to="/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#181615] hover:bg-[#FAF8F5] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E7E1DA]/80 flex items-center justify-center shrink-0 text-[#C85A32]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-left">Bookings</span>
                      {isBookingsLoading ? (
                        <span className="ml-auto w-4 h-4 rounded-full bg-[#C85A32]/20 animate-pulse shrink-0" />
                      ) : bookingCount > 0 ? (
                        <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#C85A32]/15 text-xs font-bold text-[#C85A32] border border-[#C85A32]/20">
                          {bookingCount}
                        </span>
                      ) : null}
                    </Link>

                    <Link
                      to="/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#181615] hover:bg-[#FAF8F5] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E7E1DA]/80 flex items-center justify-center shrink-0 text-[#C85A32]">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-left">Saved Photographers</span>
                      {shortlistCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#2D593E]/15 text-xs font-bold text-[#2D593E] border border-[#2D593E]/20">
                          {shortlistCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <Link
                  to="/photographers/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#C85A32] hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E7E1DA]/80 flex items-center justify-center shrink-0 text-[#C85A32]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left">Join as Photographer</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-[#E7E1DA]">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-600">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-left">Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#181615] text-white font-bold text-sm shadow-md hover:bg-black transition-all active:scale-[0.98]"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In to Account</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </header>

    {/* Account Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[min(90vh,calc(100dvh-2rem))] flex flex-col shadow-2xl border border-[#E7E1DA] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-[#E7E1DA] shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#C85A32]" />
                <h3 className="font-serif text-lg font-bold text-[#181615]">Account Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-full text-[#8a726a] hover:text-[#181615] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs Header */}
            <div className="p-3 sm:px-5 border-b border-[#E7E1DA]/60 shrink-0 bg-[#FAF8F5]">
              <div className="flex items-center gap-1.5 p-1 bg-[#F4EFEB] rounded-xl">
                <button
                  type="button"
                  onClick={() => setSettingsTab('profile')}
                  className={'flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ' + (settingsTab === 'profile' ? 'bg-white text-[#181615] shadow-xs' : 'text-[#8a726a] hover:text-[#181615]')}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('addresses')}
                  className={'flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ' + (settingsTab === 'addresses' ? 'bg-white text-[#181615] shadow-xs' : 'text-[#8a726a] hover:text-[#181615]')}
                >
                  Addresses
                  <span className="px-1.5 py-0.2 bg-[#C85A32]/10 text-[#C85A32] rounded-full text-[10px]">{userAddresses.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('devices')}
                  className={'flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ' + (settingsTab === 'devices' ? 'bg-white text-[#181615] shadow-xs' : 'text-[#8a726a] hover:text-[#181615]')}
                >
                  Devices
                  <span className="px-1.5 py-0.2 bg-[#C85A32]/10 text-[#C85A32] rounded-full text-[10px]">{userDevices.length}</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Profile */}
            {settingsTab === 'profile' && (
              <form onSubmit={handleSaveSettings} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                  {/* Avatar & Photo Picker */}
                  <AvatarPicker
                    value={settingsAvatar}
                    onChange={setSettingsAvatar}
                    label='Profile Photo (Optional)'
                    helperText='Upload your custom photo or leave empty for default profile icon'
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#181615] mb-1">Full Legal Name</label>
                      <Input
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                      />
                    </div>

                    {user?.role === 'photographer' && (
                      <div>
                        <label className="block text-xs font-bold text-[#181615] mb-1">Brand / Studio Name</label>
                        <Input
                          value={settingsBrandName}
                          onChange={(e) => setSettingsBrandName(e.target.value)}
                          placeholder="e.g. Lumina Studio Arts"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-[#181615] mb-1">Phone Number</label>
                      <Input
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#181615] mb-1">Base City</label>
                      <Input
                        value={settingsCity}
                        onChange={(e) => setSettingsCity(e.target.value)}
                        placeholder="e.g. Mumbai, Maharashtra"
                      />
                    </div>
                  </div>

                  {user?.role === 'photographer' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#181615] mb-1">Primary Discipline</label>
                          <select
                            value={settingsGenre}
                            onChange={(e) => setSettingsGenre(e.target.value)}
                            className="w-full h-10 rounded-xl border border-[#E7E1DA] bg-white px-3 py-1 text-xs text-[#181615] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/25 focus:border-[#C85A32]"
                          >
                            <option value="Wedding">Wedding Photography</option>
                            <option value="Pre-Wedding">Pre-Wedding & Couple Portraits</option>
                            <option value="Fashion">Fashion & Lookbook Editorial</option>
                            <option value="Commercial">Commercial & Advertising</option>
                            <option value="Product">Product & E-Commerce</option>
                            <option value="Architecture">Architecture & Interior</option>
                            <option value="Portrait">Corporate & Portraiture</option>
                            <option value="Food">Food & Beverage</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#181615] mb-1">Starting Day Rate (₹ INR)</label>
                          <Input
                            type="number"
                            min="5000"
                            step="1000"
                            value={settingsStartingRate}
                            onChange={(e) => setSettingsStartingRate(Number(e.target.value))}
                            placeholder="e.g. 40000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#181615] mb-1">Professional Bio</label>
                        <textarea
                          value={settingsBio}
                          onChange={(e) => setSettingsBio(e.target.value)}
                          rows={3}
                          placeholder="Describe your photography journey, creative vision, and client experience..."
                          className="w-full rounded-xl border border-[#E7E1DA] bg-white p-3 text-xs text-[#181615] focus:outline-none focus:ring-2 focus:ring-[#C85A32]/25 focus:border-[#C85A32] leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#181615] mb-1">Camera Bodies & Gear</label>
                          <Input
                            value={settingsCameraBodies}
                            onChange={(e) => setSettingsCameraBodies(e.target.value)}
                            placeholder="e.g. Sony A7 IV, Canon EOS R5"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#181615] mb-1">Prime & Zoom Lenses</label>
                          <Input
                            value={settingsLenses}
                            onChange={(e) => setSettingsLenses(e.target.value)}
                            placeholder="e.g. 24-70mm f/2.8, 85mm f/1.4"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-2 p-3 sm:p-4 sm:px-5 border-t border-[#E7E1DA] bg-[#FAF8F5]/80 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isSettingsDirty || !settingsName.trim()}
                    className="bg-[#C85A32] hover:bg-[#b04a25] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs cursor-pointer shadow-sm px-4"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {/* Tab 2: Addresses (Multi-Address) */}
            {settingsTab === 'addresses' && (
              <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 min-h-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#181615]">Saved Shoot & Billing Addresses</div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="text-[11px] h-7 px-2.5 flex items-center gap-1 text-[#C85A32] border-[#C85A32]/30 hover:bg-[#C85A32]/5"
                  >
                    <Plus className="w-3 h-3" />
                    {showAddAddress ? 'Cancel' : 'Add Address'}
                  </Button>
                </div>

                {/* Add Address Form */}
                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E7E1DA] space-y-2.5 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-[#181615]">Add New Address</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8a726a] mb-0.5">Label</label>
                        <select
                          value={newAddrLabel}
                          onChange={(e) => setNewAddrLabel(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-[#E7E1DA] bg-white focus:outline-none focus:border-[#C85A32]"
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Studio">Studio</option>
                          <option value="Shoot Location">Shoot Location</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8a726a] mb-0.5">City *</label>
                        <Input
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="text-xs h-8"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#8a726a] mb-0.5">Street / Building</label>
                      <Input
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                        placeholder="Flat, building, street, area"
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8a726a] mb-0.5">State</label>
                        <Input
                          value={newAddrState}
                          onChange={(e) => setNewAddrState(e.target.value)}
                          placeholder="e.g. Maharashtra"
                          className="text-xs h-8"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8a726a] mb-0.5">PIN Code</label>
                        <Input
                          value={newAddrPincode}
                          onChange={(e) => setNewAddrPincode(e.target.value)}
                          placeholder="400050"
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={newAddrIsDefault}
                        onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                        className="rounded accent-[#C85A32]"
                      />
                      <span className="text-xs text-[#57423b]">Set as default address</span>
                    </label>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="submit"
                        disabled={isSavingAddress}
                        className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs h-8 px-4"
                      >
                        {isSavingAddress ? 'Saving...' : 'Save Address'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Addresses List */}
                <div className="space-y-2">
                  {userAddresses.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#8a726a] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E7E1DA]">
                      No addresses saved yet. Click "Add Address" to add your shoot or studio location.
                    </div>
                  ) : (
                    userAddresses.map((addr) => (
                      <div key={addr.id} className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E7E1DA] flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#181615]">{addr.label}</span>
                            {addr.is_default && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-md">Default</span>
                            )}
                          </div>
                          <div className="text-xs text-[#57423b]">
                            {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 rounded-lg text-[#8a726a] hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Devices (Multi-Device Access) */}
            {settingsTab === 'devices' && (
              <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 min-h-0">
                <div className="text-xs text-[#8a726a]">
                  These devices and sessions currently have active access to your MTShoots account.
                </div>

                <div className="space-y-2">
                  {userDevices.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#8a726a] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E7E1DA]">
                      No other devices logged in. This current session is active.
                    </div>
                  ) : (
                    userDevices.map((dev) => {
                      const isMobile = dev.device_type === 'ios' || dev.device_type === 'android';
                      const isDesktop = dev.device_type === 'desktop';
                      return (
                        <div key={dev.id} className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E7E1DA] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white border border-[#E7E1DA] flex items-center justify-center shrink-0 text-[#C85A32]">
                              {isMobile ? <Smartphone className="w-4 h-4" /> : isDesktop ? <Laptop className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#181615]">{dev.device_name}</span>
                                <span className="px-1.5 py-0.2 uppercase text-[9px] font-bold bg-[#E7E1DA] text-[#57423b] rounded">
                                  {dev.device_type || 'web'}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#8a726a] flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Active session</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRevokeDevice(dev.id)}
                            className="text-[11px] font-bold text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Revoke
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[min(90vh,calc(100dvh-2rem))] flex flex-col shadow-2xl border border-[#E7E1DA] overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-[#E7E1DA] shrink-0">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#C85A32]" />
                <h3 className="font-serif text-lg font-bold text-[#181615]">Change Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-full text-[#8a726a] hover:text-[#181615] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="text-center py-8 p-6 space-y-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-[#EAF4ED] text-[#2D593E] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-[#181615]">Password Successfully Updated!</div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                  {passwordError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#181615] mb-1">Current Password</label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181615] mb-1">New Password (min 6 characters)</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#181615] mb-1">Confirm New Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 p-3 sm:p-4 sm:px-5 border-t border-[#E7E1DA] bg-[#FAF8F5]/80 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isPasswordValid}
                    className="bg-[#C85A32] hover:bg-[#b04a25] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs cursor-pointer shadow-sm px-4"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181615] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      </>
  );
};
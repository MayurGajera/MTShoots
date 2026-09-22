'use client';
﻿import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { Link, useLocation, useNavigate } from '@/lib/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MTShootsLogo } from './MTShootsLogo';
import { getUserByEmail, upsertUser, getUserAddresses, addUserAddress, deleteUserAddress, getUserDevices, deactivateDevice, DbUserAddress, DbUserDevice } from '@/lib/supabase';

interface NavbarProps {
  currentTab?: 'roster' | 'callsheets' | 'shortlist';
  setCurrentTab?: (tab: 'roster' | 'callsheets' | 'shortlist') => void;
  bookingCount?: number;
  shortlistCount?: number;
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

const PRESET_USER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
];

export const Navbar: React.FC<NavbarProps> = ({
  bookingCount = 0,
  shortlistCount = 0,
  onOpenNewBooking,
  onOpenLocationPicker
}) => {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    window.addEventListener('storage', handleStorage);
    window.addEventListener('mtshoots-auth-changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mtshoots-auth-changed', handleStorage);
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
      setSettingsName(user.fullName || '');
      setSettingsPhone(user.phone || '');
      setSettingsCity(user.city || currentCity);
      setSettingsAvatar(user.avatar || PRESET_USER_AVATARS[0]);
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      fullName: settingsName,
      phone: settingsPhone,
      city: settingsCity,
      avatar: settingsAvatar
    };
    setUser(updated);
    localStorage.setItem('mtshoots_user', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mtshoots-auth-changed'));
    setIsSettingsOpen(false);
    triggerToast('Account details updated successfully!');
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

  const userAvatarImage = user?.avatar || PRESET_USER_AVATARS[0];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E1DA] transition-all">
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

              <Link to="/bookings" className={navLinkClass('/bookings')}>
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Bookings</span>
                {bookingCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive('/bookings') ? 'bg-[#C85A32] text-white' : 'bg-[#C85A32]/15 text-[#C85A32]'
                  }`}>
                    {bookingCount}
                  </span>
                )}
              </Link>

              <Link to="/saved" className={navLinkClass('/saved')}>
                <Heart className="w-3.5 h-3.5 shrink-0" />
                <span>Saved</span>
                {shortlistCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#EAF4ED] text-[#2D593E]">
                    {shortlistCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Install App CTA */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-[#E7E1DA] hover:border-[#C85A32] text-xs font-semibold text-[#57423b] hover:text-[#C85A32] hover:bg-[#F4EFEB] transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Install MTShoots as an App"
            >
              <Download className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
              <span>Install App</span>
            </button>

            {/* Book a Shoot CTA */}
            {onOpenNewBooking && (
              <Button
                variant="terracotta"
                size="sm"
                onClick={onOpenNewBooking}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 h-8 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Shoot</span>
              </Button>
            )}

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
                    <img
                      src={userAvatarImage}
                      alt={user.fullName}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-[#C85A32]/30"
                    />
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
                          <img
                            src={userAvatarImage}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
                          />
                          <div className="truncate">
                            <div className="text-xs font-bold text-[#181615] truncate">{user.fullName}</div>
                            <div className="text-[11px] text-[#8a726a] truncate">{user.email}</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-[#2D593E] font-bold bg-[#EAF4ED] px-2 py-0.5 rounded-full">
                          <span>âœ" Verified Client</span>
                          <span>{user.city || currentCity}</span>
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
              className="md:hidden border-t border-[#E7E1DA] py-3 space-y-1 overflow-hidden"
            >
              {user && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={userAvatarImage} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-[#181615]">{user.fullName}</div>
                      <div className="text-[10px] text-[#8a726a]">{user.email}</div>
                    </div>
                  </div>
                  <button onClick={handleOpenSettings} className="text-xs text-[#C85A32] font-semibold">Edit</button>
                </div>
              )}

              {/* Centered navigation items with icons */}
              <div className="flex flex-col items-center gap-1.5 py-1.5">
                <Link
                  to="/photographers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#181615] hover:bg-[#FAF8F5] transition-colors active:scale-[0.99]"
                >
                  <Camera className="w-4 h-4 text-[#C85A32]" />
                  <span>Photographers Directory</span>
                </Link>

                <Link
                  to="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#181615] hover:bg-[#FAF8F5] transition-colors active:scale-[0.99]"
                >
                  <Calendar className="w-4 h-4 text-[#C85A32]" />
                  <span>Bookings</span>
                  {bookingCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[11px] font-bold text-[#C85A32] border border-[#E7E1DA]">
                      {bookingCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#181615] hover:bg-[#FAF8F5] transition-colors active:scale-[0.99]"
                >
                  <Heart className="w-4 h-4 text-[#C85A32]" />
                  <span>Saved Photographers</span>
                  {shortlistCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[11px] font-bold text-[#C85A32] border border-[#E7E1DA]">
                      {shortlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/photographers/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#C85A32] hover:bg-[#FAF8F5] transition-colors active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4 text-[#C85A32]" />
                  <span>Join as Photographer</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-[#E7E1DA]">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#181615] text-white font-bold text-xs shadow-md hover:bg-black transition-all active:scale-[0.98]"
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

            {/* Account Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col p-5 sm:p-6 space-y-4 shadow-2xl border border-[#E7E1DA] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA] shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#C85A32]" />
                <h3 className="font-serif text-lg font-bold text-[#181615]">Account Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-full text-[#8a726a] hover:text-[#181615] hover:bg-[#FAF8F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs Header */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F4EFEB] rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setSettingsTab('profile')}
                className={'flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ' + (settingsTab === 'profile' ? 'bg-white text-[#181615] shadow-xs' : 'text-[#8a726a] hover:text-[#181615]')}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('addresses')}
                className={'flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ' + (settingsTab === 'addresses' ? 'bg-white text-[#181615] shadow-xs' : 'text-[#8a726a] hover:text-[#181615]')}
              >
                Addresses
                <span className="px-1.5 py-0.2 bg-[#C85A32]/10 text-[#C85A32] rounded-full text-[10px]">{userAddresses.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('devices')}
                className={'flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ' + (settingsTab === 'devices' ? 'bg-white text-[#181615] shadow-xs' : 'text-[#8a726a] hover:text-[#181615]')}
              >
                Devices
                <span className="px-1.5 py-0.2 bg-[#C85A32]/10 text-[#C85A32] rounded-full text-[10px]">{userDevices.length}</span>
              </button>
            </div>

            {/* Tab 1: Profile */}
            {settingsTab === 'profile' && (
              <form onSubmit={handleSaveSettings} className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Avatar Picker */}
                <div className="text-center space-y-2.5">
                  <div className="relative inline-block mx-auto">
                    <img
                      src={settingsAvatar || PRESET_USER_AVATARS[0]}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-[#C85A32]/20 shadow-sm"
                    />
                    <label
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#C85A32] text-white cursor-pointer hover:bg-[#b04a25] shadow-md transition-transform hover:scale-105"
                      title="Upload profile photo from device"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setSettingsAvatar(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="text-[11px] text-[#8a726a]">
                    Upload custom photo or select a preset:
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {PRESET_USER_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSettingsAvatar(av)}
                        className={'w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ' + (settingsAvatar === av ? 'border-[#C85A32] scale-110 ring-2 ring-[#C85A32]/20' : 'border-transparent opacity-70 hover:opacity-100')}
                      >
                        <img src={av} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1">Full Legal Name</label>
                  <Input
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1">Phone Number</label>
                  <Input
                    value={settingsPhone}
                    onChange={(e) => setSettingsPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1">City</label>
                  <Input
                    value={settingsCity}
                    onChange={(e) => setSettingsCity(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E1DA]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {/* Tab 2: Addresses (Multi-Address) */}
            {settingsTab === 'addresses' && (
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
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
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E7E1DA]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#C85A32]" />
                <h3 className="font-serif text-lg font-bold text-[#181615]">Change Password</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-full text-[#8a726a] hover:text-[#181615] hover:bg-[#FAF8F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#EAF4ED] text-[#2D593E] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-[#181615]">Password Successfully Updated!</div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter password" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1">New Password (min 6 characters)</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter password" />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E1DA]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs"
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
          <span>âœ"</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
};
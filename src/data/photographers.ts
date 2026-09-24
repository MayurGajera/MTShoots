import { Photographer, BookingAddOn, BookingRequest } from '../types';

export const AVAILABLE_ADDONS: BookingAddOn[] = [];
export const INITIAL_PHOTOGRAPHERS: Photographer[] = [];
export const INITIAL_BOOKINGS: BookingRequest[] = [];

// Helpers for registered dynamic photographers
export function getStoredRegisteredPhotographers(): Photographer[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('mtshoots_registered_photographers') : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredPhotographer(photographer: Photographer): void {
  try {
    if (typeof window === 'undefined') return;
    const existing = getStoredRegisteredPhotographers();
    const updated = [photographer, ...existing.filter(p => p.id !== photographer.id)];
    localStorage.setItem('mtshoots_registered_photographers', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('photographers-updated'));

    // Asynchronously synchronize with Supabase PostgreSQL database
    import('../lib/supabase').then(mod => {
      if (mod.savePhotographerToSupabase) {
        mod.savePhotographerToSupabase(photographer).catch(e => {
          console.warn('Background Supabase photographer sync:', e);
        });
      }
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save photographer to storage:', err);
  }
}

export function getAllPhotographers(): Photographer[] {
  const registered = getStoredRegisteredPhotographers();
  return registered;
}

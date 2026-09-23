import { useEffect } from 'react';

let lockCount = 0;
let originalBodyStyle: {
  overflow: string;
  position: string;
  top: string;
  width: string;
} | null = null;
let lockedScrollY = 0;

/**
 * Lock body scroll when a modal/sheet is open.
 * Preserves current scroll position so the page doesn't jump.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const body = document.body;
    const scrollY = window.scrollY;
    lockCount += 1;

    if (lockCount === 1) {
      originalBodyStyle = {
        overflow: body.style.overflow,
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
      };
      lockedScrollY = scrollY;

      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount > 0) return;

      if (originalBodyStyle) {
        body.style.overflow = originalBodyStyle.overflow;
        body.style.position = originalBodyStyle.position;
        body.style.top = originalBodyStyle.top;
        body.style.width = originalBodyStyle.width;
      }

      originalBodyStyle = null;
      window.scrollTo({ top: lockedScrollY, behavior: 'instant' as ScrollBehavior });
    };
  }, [locked]);
}

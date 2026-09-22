'use client';

import React, { Suspense } from 'react';
import { AuthPage } from '@/pages/AuthPage';
import { ApertureLoader } from '@/components/ApertureLoader';

export default function AuthRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <ApertureLoader size="md" label="Loading account..." />
        </div>
      }
    >
      <AuthPage />
    </Suspense>
  );
}

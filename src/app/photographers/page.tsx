'use client';

import React, { Suspense } from 'react';
import { PhotographersPage } from '@/pages/PhotographersPage';
import { ApertureLoader } from '@/components/ApertureLoader';

export default function PhotographersRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <ApertureLoader size="lg" label="Loading photographers..." />
        </div>
      }
    >
      <PhotographersPage />
    </Suspense>
  );
}

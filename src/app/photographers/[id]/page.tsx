import React, { Suspense } from 'react';
import { PhotographerProfilePage } from '@/pages/PhotographerProfilePage';
import { ApertureLoader } from '@/components/ApertureLoader';

export default function PhotographerProfileRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <ApertureLoader size="md" label="Loading photographer portfolio..." />
        </div>
      }
    >
      <PhotographerProfilePage />
    </Suspense>
  );
}

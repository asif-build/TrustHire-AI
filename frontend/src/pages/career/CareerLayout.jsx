import React from 'react';
import { Outlet } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';

/**
 * CareerLayout
 * Uses the exact same single floating pill navbar as the rest of the application
 * (CompanyDirectoryPage, JobSearchPage, etc.) with zero extra stacked panels.
 */
export default function CareerLayout() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1D1D1F] font-sans flex flex-col antialiased">
      {/* Single floating navbar panel matching Screenshot 1 */}
      <TrustHireNavbar />

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import MarqueeStrip from '../components/landing/MarqueeStrip';
import HeroNavigation from '../components/landing/HeroNavigation';
import OrganicBackground3D from '../components/landing/OrganicBackground3D';
import HeroTypography from '../components/landing/HeroTypography';
import RecruitmentStickers from '../components/landing/RecruitmentStickers';
import TaglineAndCTA from '../components/landing/TaglineAndCTA';
import InteractiveModals from '../components/landing/InteractiveModals';
import AboutSection from '../components/landing/AboutSection';
import TrustHireGallery from '../components/landing/TrustHireGallery';
import ProcessSection from '../components/landing/ProcessSection';
import MatchingShowcase from '../components/landing/MatchingShowcase';
import CandidateSection from '../components/landing/CandidateSection';
import RecruiterSection from '../components/landing/RecruiterSection';
import TrustSection from '../components/landing/TrustSection';
import FinalCTASection from '../components/landing/FinalCTASection';
import FooterSection from '../components/landing/FooterSection';

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState(null);

  const handleOpenModal = (modalType) => {
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F1DF] text-[#050505] selection:bg-[#F0442D] selection:text-white font-jakarta flex flex-col relative overflow-x-hidden">
      
      {/* 1. Narrow Pale Bright Yellow Announcement Strip */}
      <MarqueeStrip />

      {/* 2. Main Hero Section: Warm Cream Outer Background with Centered Rounded Hero */}
      <section className="flex flex-col p-2 sm:p-3 md:p-3.5 w-full max-w-[1580px] mx-auto justify-center">
        
        {/* Hero Container in Warm Cream #F8F2E3 matching Pulse reference screenshot */}
        <div className="relative w-full min-h-[calc(100svh-48px)] rounded-[30px] sm:rounded-[38px] md:rounded-[44px] bg-[#F8F2E3] border border-black/15 shadow-[0_12px_36px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden">
          
          {/* Header Bar: Custom (T) Brand Mark + Circular Menu Button */}
          <HeroNavigation onOpenModal={handleOpenModal} />

          {/* Center Stage: Volumetric 3D Organic Form + TRUSTHIRE Typography + Pop Stickers + Tagline & CTAs */}
          <div className="relative flex-1 flex flex-col items-center justify-center my-auto w-full px-4 sm:px-8 py-6 sm:py-8">
            
            {/* 3D Sculptural Form winding through the cream background */}
            <OrganicBackground3D />

            {/* Deliberately Positioned Pop Recruitment Stickers */}
            <RecruitmentStickers />

            {/* Massive Black Condensed TRUSTHIRE Typography */}
            <HeroTypography />

            {/* One-Line Tagline & Dual White Pill CTA Buttons */}
            <TaglineAndCTA />
          </div>

          {/* Balanced Bottom Breathing Area matching reference canvas */}
          <div className="h-6 sm:h-8 pointer-events-none" />
        </div>
      </section>

      {/* 01 — INTRODUCING TRUSTHIRE */}
      <AboutSection />

      {/* CINEMATIC PARALLAX GALLERY — BEYOND THE RESUME */}
      <TrustHireGallery />

      {/* 02 — THE PROCESS */}
      <ProcessSection />

      {/* 03 — INTELLIGENT MATCHING (Interactive Showcase) */}
      <MatchingShowcase />

      {/* 04 — FOR CANDIDATES */}
      <CandidateSection />

      {/* 05 — FOR RECRUITERS */}
      <RecruiterSection />

      {/* 06 — TRUST AND TRANSPARENCY (Responsible AI Principles) */}
      <TrustSection />

      {/* 07 — FINAL CALL TO ACTION */}
      <FinalCTASection />

      {/* 08 — FOOTER */}
      <FooterSection onOpenModal={handleOpenModal} />

      {/* Interactive Informational Modals for Feature Exploration */}
      <InteractiveModals activeModal={activeModal} onClose={handleCloseModal} />

    </div>
  );
}

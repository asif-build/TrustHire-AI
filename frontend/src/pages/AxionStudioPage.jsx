import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import AxionShaderBackground from '../components/landing/AxionShaderBackground';
import TrustHireGallery from '../components/landing/TrustHireGallery';
import CareerJourneyTimeline from '../components/landing/CareerJourneyTimeline';
import TrustHireFAQ from '../components/landing/TrustHireFAQ';
import TrustHireLogo from '../components/ui/TrustHireLogo';
import TrustHireFooter from '../components/common/TrustHireFooter';

export default function AxionStudioPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-gray-900 font-sans selection:bg-[#F0442D] selection:text-white relative overflow-x-hidden">
      
      {/* ============================================================== */}
      {/* SECTION 1: HERO (Full viewport height)                         */}
      {/* ============================================================== */}
      <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
        
        {/* Full-screen animated shader overlay */}
        <AxionShaderBackground />

        {/* NAVIGATION: Clean pill-shaped white navbar */}
        <header className="relative z-20 w-full max-w-[1440px] mx-auto p-2 sm:p-3">
          <nav className="bg-white rounded-full p-[6px] flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/5">
            
            {/* LEFT: Floral Emblem + Bodoni Moda TrustHire Wordmark + Nav Links */}
            <div className="flex items-center gap-4 sm:gap-6">
              <a
                href="/"
                aria-label="TrustHire home"
                className="flex items-center justify-center pl-2 sm:pl-3 pr-1 py-1 hover:opacity-85 transition-opacity"
              >
                <TrustHireLogo
                  symbolOnly={false}
                  variant="dark"
                  symbolSize="h-8 sm:h-9"
                  textSize="text-lg sm:text-xl font-normal"
                />
              </a>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-6">
                <a
                  href="/companies"
                  className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-200 font-medium"
                >
                  Companies
                </a>
                <a
                  href="/jobs"
                  className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-200 font-medium"
                >
                  Jobs
                </a>
                <a
                  href="/career-roadmap"
                  className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-200 font-medium"
                >
                  Roadmap
                </a>
                <a
                  href="/career"
                  className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-200 font-medium"
                >
                  Workspace
                </a>
              </div>
            </div>

            {/* RIGHT: Clean Sign In & Get Started CTA */}
            <div className="hidden md:flex items-center gap-4 sm:gap-5">
              <a
                href="/login"
                className="text-[13px] text-gray-700 hover:text-black transition-colors font-medium px-2"
              >
                Sign in
              </a>

              {/* Get Started button with HOVER TEXT ROLL animation */}
              <a
                href="/career"
                className="group relative inline-flex items-center bg-gray-900 text-white text-[13px] font-medium rounded-full pl-5 pr-2 py-2 hover:bg-black transition-colors shadow-sm"
              >
                {/* Roll container */}
                <div className="overflow-hidden h-[20px] mr-3">
                  <div className="flex flex-col transition-transform duration-500 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                    <span className="h-[20px] flex items-center">Get started</span>
                    <span className="h-[20px] flex items-center">Get started</span>
                  </div>
                </div>

                {/* Arrow icon in white circle that rotates -45deg on hover */}
                <div className="w-6 h-6 rounded-full bg-white text-gray-900 flex items-center justify-center transition-transform duration-500 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
                  <ArrowRight size={13} strokeWidth={2.4} />
                </div>
              </a>
            </div>

            {/* MOBILE: Menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </nav>
        </header>

        {/* HERO CONTENT: Bottom aligned with flex spacer */}
        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 lg:pb-20 flex-1 flex flex-col justify-end">
          
          {/* Small label in editorial serif */}
          <div className="mb-5 sm:mb-8">
            <span className="font-bodoni text-[13px] sm:text-[14px] text-[#121613] tracking-widest font-semibold uppercase">
              TrustHire
            </span>
          </div>

          {/* Headline styled with crystal clear, readable .hero-heading */}
          <h1 className="hero-heading text-[clamp(2.25rem,6.2vw,4.5rem)] text-[#121613] max-w-5xl font-normal leading-[1.08] tracking-[-0.02em]">
            Skills beyond degrees.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Discover opportunities and talent
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            verified by genuine ability.
          </h1>

          {/* CTA row: Clean primary button and employer link */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            
            {/* Primary Orange button with text roll animation & rotating arrow */}
            <a
              href="/career"
              className="group relative inline-flex items-center bg-[#F0442D] hover:bg-[#d63823] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 transition-colors duration-300 shadow-[0_6px_20px_rgba(240,68,45,0.25)]"
            >
              <div className="overflow-hidden h-[20px] mr-3">
                <div className="flex flex-col transition-transform duration-500 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                  <span className="h-[20px] flex items-center">Explore opportunities</span>
                  <span className="h-[20px] flex items-center">Explore opportunities</span>
                </div>
              </div>

              {/* White circle with orange ArrowRight that rotates -45deg on hover */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#F0442D] flex items-center justify-center transition-transform duration-500 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45 shadow-sm">
                <ArrowRight size={15} strokeWidth={2.4} />
              </div>
            </a>

            {/* Clean secondary link for employers */}
            <a
              href="/recruiter"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2 py-2"
            >
              For Employers & Hiring Teams →
            </a>

          </div>

        </div>

        {/* MOBILE MENU OVERLAY */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            />

            <div className="relative z-10 bg-white rounded-2xl mx-3 mb-3 p-6 sm:p-8 shadow-2xl transition-transform duration-300">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <a href="/" aria-label="TrustHire home" className="flex items-center">
                  <TrustHireLogo symbolOnly={true} variant="dark" className="h-10 w-auto max-w-none" />
                </a>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4 py-8">
                <a
                  href="/companies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[26px] sm:text-[30px] font-medium text-gray-900 hover:text-[#F0442D] transition-colors"
                >
                  Companies
                </a>
                <a
                  href="/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[26px] sm:text-[30px] font-medium text-gray-900 hover:text-[#F0442D] transition-colors"
                >
                  Explore Jobs
                </a>
                <a
                  href="/career-roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[26px] sm:text-[30px] font-medium text-gray-900 hover:text-[#F0442D] transition-colors"
                >
                  Career Roadmap
                </a>
                <a
                  href="/career"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[26px] sm:text-[30px] font-medium text-gray-900 hover:text-[#F0442D] transition-colors"
                >
                  Candidate Workspace
                </a>
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[26px] sm:text-[30px] font-medium text-gray-900 hover:text-[#F0442D] transition-colors"
                >
                  Sign In
                </a>
              </div>

              <a
                href="/career"
                className="w-full bg-[#F0442D] text-white text-[15px] font-medium py-3.5 px-6 rounded-full flex items-center justify-between shadow-md"
              >
                <span>Get Started</span>
                <div className="w-7 h-7 rounded-full bg-white text-[#F0442D] flex items-center justify-center">
                  <ArrowRight size={14} strokeWidth={2.5} />
                </div>
              </a>
            </div>
          </div>
        )}

      </section>

      {/* ============================================================== */}
      {/* SECTION 2: PARALLAX GALLERY — BEYOND THE RESUME                */}
      {/* Butter-smooth hardware-accelerated parallax motion             */}
      {/* ============================================================== */}
      <div id="gallery" className="relative z-20">
        <TrustHireGallery />
      </div>

      {/* ============================================================== */}
      {/* SECTION 3: EDITORIAL CAREER JOURNEY TIMELINE                   */}
      {/* 5-Step Connected Timeline with Sunset Sliding Motion           */}
      {/* ============================================================== */}
      <CareerJourneyTimeline />

      {/* ============================================================== */}
      {/* SECTION 4: FREQUENTLY ASKED QUESTIONS (Sunset Editorial Style) */}
      {/* ============================================================== */}
      <TrustHireFAQ />

      {/* Global Sunset-Style Editorial Footer */}
      <TrustHireFooter />

    </div>
  );
}

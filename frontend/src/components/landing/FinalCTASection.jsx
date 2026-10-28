import React from 'react';
import { Link } from 'react-router-dom';

export default function FinalCTASection() {
  return (
    <section className="w-full bg-[#F7F1DF] text-[#050505] py-24 sm:py-32 px-4 sm:px-8 border-t border-black/10 relative overflow-hidden">
      
      {/* Decorative Warm Cream Container */}
      <div className="max-w-[1400px] mx-auto relative z-10 bg-[#F8F2E3] rounded-[36px] sm:rounded-[48px] p-8 sm:p-16 lg:p-20 border border-black/15 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-xs font-mono tracking-wider uppercase mb-8">
          <span className="w-2 h-2 rounded-full bg-[#F0442D]" />
          07 — FINAL CALL TO ACTION
        </div>

        {/* Massive Condensed Headline */}
        <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-[#050505] font-anton leading-[0.95] max-w-4xl mb-6">
          Your next opportunity starts here.
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-black/70 max-w-2xl font-normal leading-relaxed mb-10">
          Whether you are evaluating your engineering potential or building a world-class team with verified skills, TrustHire makes the match clear.
        </p>

        {/* Large White Pill Buttons matching Pulse reference */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            to="/signup?role=candidate"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-white text-[#050505] text-base sm:text-lg font-bold border border-black/20 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-[#FAF6EC] hover:border-black/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Explore Opportunities
          </Link>

          <Link
            to="/signup?role=recruiter"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[#050505] text-white text-base sm:text-lg font-bold border border-transparent shadow-[0_6px_20px_rgba(0,0,0,0.14)] hover:bg-black/85 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>Hire Smarter</span>
            <span className="text-xl">↗</span>
          </Link>
        </div>

        {/* Small Trust Note */}
        <div className="mt-10 flex items-center gap-3 text-xs font-mono text-black/50">
          <span>Free for candidates</span>
          <span>•</span>
          <span>Skill-first recruiter trials</span>
          <span>•</span>
          <span>No credit card required</span>
        </div>

      </div>
    </section>
  );
}

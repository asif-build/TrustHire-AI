import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function TaglineAndCTA() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleCandidateClick = () => {
    if (user) {
      navigate('/candidate');
    } else {
      navigate('/signup?role=candidate');
    }
  };

  const handleRecruiterClick = () => {
    if (user) {
      navigate('/recruiter');
    } else {
      navigate('/signup?role=recruiter');
    }
  };

  return (
    <div className="relative z-20 flex flex-col items-center text-center mt-5 sm:mt-7 md:mt-8 w-full max-w-4xl mx-auto px-4 select-none">
      {/* Tagline — Guaranteed one-line on desktop, matching reference rhythm */}
      <motion.h2 
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="font-jakarta text-[clamp(1.4rem,2.8vw,2.75rem)] font-medium sm:font-semibold tracking-[-0.025em] text-[#050505] leading-[1.15] mb-5 sm:mb-7 whitespace-nowrap"
      >
        Your talent. Your next opportunity.
      </motion.h2>

      {/* Two Large Pill CTA Buttons matching the reference proportions */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full sm:w-auto"
      >
        {/* Primary CTA Button: Explore Opportunities */}
        <button
          onClick={handleCandidateClick}
          className="group relative w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-8 sm:px-11 py-3.5 sm:py-4 rounded-full border border-[#050505] bg-[#FFFFFF] text-[#050505] font-jakarta font-bold text-xs sm:text-[13px] tracking-[0.08em] uppercase shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:bg-[#050505] hover:text-[#FFFFFF] transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
        >
          <span>{user && role === 'candidate' ? 'ACCESS CONSOLE' : 'Explore Opportunities'}</span>
        </button>

        {/* Secondary CTA Button: Hire Smarter ↗ */}
        <button
          onClick={handleRecruiterClick}
          className="group relative w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-8 sm:px-11 py-3.5 sm:py-4 rounded-full border border-[#050505] bg-[#FFFFFF] text-[#050505] font-jakarta font-bold text-xs sm:text-[13px] tracking-[0.08em] uppercase shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:bg-[#050505] hover:text-[#FFFFFF] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>{user && role === 'recruiter' ? 'RECRUITER SUITE' : 'Hire Smarter'}</span>
          <span className="font-normal text-sm transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
            ↗
          </span>
        </button>
      </motion.div>
    </div>
  );
}

import React from 'react';

/**
 * AuthBackground
 * Minimalist, Apple-inspired warm ivory background for TrustHire authentication.
 * Replaces heavy diagonal ribbons with a calm, refined ambient surface
 * featuring delicate warm lighting that keeps the form as the primary visual focus.
 */
export default function AuthBackground({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-[#121613] font-sans relative flex flex-col justify-between selection:bg-[#F0442D]/20 selection:text-[#121613]">
      
      {/* Subtle Ambient Lighting (Static CSS Gradients, Zero Canvas, Zero Overbearing Ribbons) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        
        {/* Soft top-right warm terracotta & amber glow */}
        <div 
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full blur-[140px] opacity-40 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(240, 68, 45, 0.12) 0%, rgba(251, 146, 60, 0.05) 50%, transparent 75%)'
          }}
        />

        {/* Soft bottom-left subtle peach glow */}
        <div 
          className="absolute -bottom-36 -left-36 w-[480px] h-[480px] rounded-full blur-[130px] opacity-35 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(254, 114, 159, 0.10) 0%, rgba(240, 68, 45, 0.04) 50%, transparent 70%)'
          }}
        />

        {/* Fine subtle top border sheen */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#EAEAE5] to-transparent" />
      </div>

      {/* Main Content Column */}
      <div className="relative z-10 flex-1 flex flex-col w-full">
        {children}
      </div>

    </div>
  );
}

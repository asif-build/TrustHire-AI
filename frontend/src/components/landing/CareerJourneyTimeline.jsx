import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * CareerJourneyTimeline
 * Faithful implementation of Sunset's (hellosunset.com) editorial career journey section:
 * - Tobias editorial serif display headline and step titles
 * - Sticky left column with candid landscape photograph
 * - 5-step vertical connected timeline with smooth sliding terracotta line & markers
 * - Clean layout with zero redundant links under steps
 * - Scroll-aware sliding transitions + click interactions
 * - Prominent rounded terracotta CTA button
 */
export default function CareerJourneyTimeline() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const stepRefs = useRef([]);

  const steps = [
    {
      number: "01",
      title: "Discover opportunities",
      description: "Explore real company profiles, current job openings, and roles that align with your interests, experience, and career goals."
    },
    {
      number: "02",
      title: "Understand your fit",
      description: "Compare your existing skills and project evidence with the requirements of a specific role. See what aligns and what still needs attention."
    },
    {
      number: "03",
      title: "Build your roadmap",
      description: "Get a personalised plan with relevant learning resources, practical projects, and milestones based on your target position."
    },
    {
      number: "04",
      title: "Prepare with purpose",
      description: "Strengthen your portfolio, practise role-specific interview questions, and build evidence for the skills employers request."
    },
    {
      number: "05",
      title: "Apply and track progress",
      description: "Find the right opportunities, follow your preparation progress, and organise your applications in one place."
    }
  ];

  // Smooth scroll tracking matching Sunset's sliding behavior
  useEffect(() => {
    const handleScroll = () => {
      if (!stepRefs.current || stepRefs.current.length === 0) return;

      const triggerY = window.innerHeight * 0.42;
      let targetIndex = 0;
      let closestDistance = Infinity;

      stepRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Distance from element's top to the trigger line
        const distance = Math.abs(rect.top - triggerY);
        
        // Element is currently near or past the active trigger zone
        if (rect.top <= triggerY + 80) {
          targetIndex = index;
        }
      });

      setActiveStep(targetIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate sliding line percentage
  const lineProgressPercent = steps.length > 1 
    ? (activeStep / (steps.length - 1)) * 100 
    : 0;

  const ctaDestination = user ? "/career-roadmap" : "/signup?redirect=/career-roadmap";

  return (
    <section 
      ref={containerRef}
      className="relative z-20 py-24 sm:py-32 lg:py-36 bg-[#F7F4ED] text-[#24211E] selection:bg-[#A84E33]/20 selection:text-[#24211E]"
      aria-label="TrustHire Career Journey"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Two-Column Layout: Sticky Left Column + Scrolling Sliding Timeline on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Sticky Headline & Editorial Photograph       */}
          {/* Matches Sunset's pinned left column structure            */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 flex flex-col self-start">
            
            {/* Tobias Editorial Serif Headline */}
            <h2 className="font-editorial-serif text-[clamp(2.35rem,4.8vw,3.85rem)] font-normal leading-[1.12] tracking-[-0.025em] text-[#24211E] max-w-xl">
              Your next career move,
              <br className="hidden sm:inline" />
              {' '}built around your potential.
            </h2>

            {/* Supporting Context Paragraph */}
            <p className="mt-5 sm:mt-6 text-sm sm:text-base text-[#625E58] font-normal leading-relaxed max-w-lg">
              From discovering the right companies to preparing for a specific role, TrustHire turns your ambitions into a clear, personalised career roadmap.
            </p>

            {/* Large Photographic Image with Rounded Corners */}
            <div className="mt-10 sm:mt-12 relative group">
              <div className="overflow-hidden rounded-[26px] sm:rounded-[34px] border border-[#E8DFD3] shadow-[0_16px_50px_rgba(36,33,30,0.06)] bg-[#EDE6DC] aspect-[4/3] sm:aspect-[1.2/1]">
                <img
                  src="/images/trusthire-career-journey.webp"
                  alt="Candidate thoughtfully reviewing career opportunities"
                  loading="lazy"
                  width={1200}
                  height={1000}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
              </div>

              {/* Ambient warmth */}
              <div 
                className="absolute -inset-4 -z-10 rounded-[38px] opacity-40 blur-xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(168,78,51,0.08) 0%, transparent 70%)'
                }}
              />
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: 5-Step Connected Timeline & Sliding Line   */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex flex-col pt-2 lg:pt-3">
            
            {/* Timeline Wrapper with Continuous Connecting Track */}
            <div className="relative pl-1">
              
              {/* Background Neutral Line Track */}
              <div 
                className="absolute left-[19px] sm:left-[21px] top-5 bottom-12 w-[1.5px] bg-[#E3DACD]"
                aria-hidden="true"
              />

              {/* Active Sliding Terracotta Line matching Sunset */}
              <div 
                className="absolute left-[19px] sm:left-[21px] top-5 w-[1.5px] bg-[#A84E33] transition-all duration-500 ease-out pointer-events-none"
                style={{
                  height: `calc(${lineProgressPercent}% * 0.88)`
                }}
                aria-hidden="true"
              />

              {/* Step Items */}
              <div className="space-y-6 sm:space-y-8">
                {steps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const isPassed = activeStep > idx;

                  return (
                    <div
                      key={step.number}
                      ref={(el) => (stepRefs.current[idx] = el)}
                      onClick={() => setActiveStep(idx)}
                      className="group relative flex items-start cursor-pointer transition-all duration-300"
                    >
                      {/* Step Number Marker */}
                      <div className="relative z-10 shrink-0">
                        <div
                          className={`w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-xl flex items-center justify-center font-semibold text-xs sm:text-[13px] tracking-tight transition-all duration-500 ease-out ${
                            isActive
                              ? 'bg-[#A84E33] text-white shadow-md shadow-[#A84E33]/25 ring-4 ring-[#A84E33]/15 scale-105'
                              : isPassed
                              ? 'bg-[#F2ECE1] border border-[#A84E33]/50 text-[#A84E33]'
                              : 'bg-[#F7F4ED] border border-[#D8CEBF] text-[#8C8377] group-hover:border-[#A84E33]/60 group-hover:text-[#24211E]'
                          }`}
                        >
                          {step.number}
                        </div>
                      </div>

                      {/* Step Content: Title & Description Only (Clean, zero redundant links) */}
                      <div className="pl-5 sm:pl-7 pb-4 sm:pb-6 flex-1">
                        
                        {/* Step Title in Tobias Serif */}
                        <h3 
                          className={`font-editorial-serif text-lg sm:text-[21px] font-medium tracking-tight mb-2 transition-all duration-400 ease-out ${
                            isActive 
                              ? 'text-[#24211E] translate-x-1' 
                              : 'text-[#8C8377] opacity-60 group-hover:opacity-90 group-hover:text-[#24211E]'
                          }`}
                        >
                          {step.title}
                        </h3>

                        {/* Step Description in Geist Sans */}
                        <p 
                          className={`text-xs sm:text-[14px] leading-relaxed transition-all duration-400 ease-out max-w-lg ${
                            isActive 
                              ? 'text-[#5A554E] opacity-100' 
                              : 'text-[#9E958A] opacity-40 group-hover:opacity-75'
                          }`}
                        >
                          {step.description}
                        </p>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Prominent Rounded CTA Button at bottom of timeline */}
            <div className="mt-8 pt-2">
              <a
                href={ctaDestination}
                className="group w-full bg-[#A84E33] hover:bg-[#964229] active:scale-[0.99] text-white rounded-[20px] sm:rounded-[24px] px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between shadow-[0_12px_32px_rgba(168,78,51,0.24)] hover:shadow-[0_16px_40px_rgba(168,78,51,0.32)] transition-all duration-300"
              >
                {/* CTA Label in Tobias Editorial Serif */}
                <span className="font-editorial-serif text-lg sm:text-2xl font-normal tracking-tight text-white">
                  Build your career roadmap
                </span>

                {/* Right Arrow Box with Subtle Border & Hover Motion */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-white/30 group-hover:border-white/60 group-hover:bg-white/10 flex items-center justify-center shrink-0 transition-all duration-300">
                  <ArrowRight 
                    size={17} 
                    strokeWidth={2.4} 
                    className="text-white transition-transform duration-300 group-hover:translate-x-1" 
                  />
                </div>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

import React from 'react';

const MARQUEE_ITEMS = [
  'TRUSTHIRE IS OPEN',
  'SKILLS BEYOND DEGREES',
  'FIND YOUR NEXT OPPORTUNITY',
  'AI-POWERED CAREER INTELLIGENCE',
];

export default function MarqueeStrip() {
  const content = (
    <div className="flex items-center gap-10 whitespace-nowrap select-none font-jakarta font-extrabold text-[11px] sm:text-xs tracking-[0.12em] uppercase text-[#050505]">
      {MARQUEE_ITEMS.map((item, idx) => (
        <React.Fragment key={idx}>
          <span>{item}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#050505]/70 inline-block" aria-hidden="true" />
        </React.Fragment>
      ))}
      {MARQUEE_ITEMS.map((item, idx) => (
        <React.Fragment key={`rep-${idx}`}>
          <span>{item}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#050505]/70 inline-block" aria-hidden="true" />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div 
      className="w-full h-8 sm:h-9 bg-[#FFF176] border-b border-[#050505]/15 overflow-hidden sticky top-0 z-50 text-[#050505] flex items-center"
      role="region"
      aria-label="Announcement ticker"
    >
      <div className="animate-marquee flex items-center">
        {content}
        <div aria-hidden="true" className="flex items-center">
          {content}
        </div>
      </div>
    </div>
  );
}

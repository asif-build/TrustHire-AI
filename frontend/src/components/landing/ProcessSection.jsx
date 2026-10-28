import React, { useState } from 'react';

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'Build Your Profile',
      tagline: 'Upload resume or enter competencies',
      detail:
        'Upload your current resume or directly enter your technical proficiencies, education, and portfolio links. TrustHire automatically translates raw text into structured capability clusters.',
      badge: 'Step 1: Input',
      visual: {
        heading: 'Resume & Portfolio Parsing',
        items: [
          { label: 'PDF / DOCX Resume', status: 'Parsed (3 pages, 14 roles)', color: 'bg-emerald-100 text-emerald-800' },
          { label: 'GitHub Profile', status: '48 Repositories Analyzed', color: 'bg-blue-100 text-blue-800' },
          { label: 'Demonstrated Skills', status: '26 Verified Skills Extracted', color: 'bg-amber-100 text-amber-800' },
        ],
      },
    },
    {
      step: '02',
      title: 'Discover Opportunities',
      tagline: 'Match against high-relevance roles',
      detail:
        'Explore tailored job openings and internships aligned with your actual demonstrated competencies, salary aspirations, and growth directions rather than arbitrary keyword filters.',
      badge: 'Step 2: Exploration',
      visual: {
        heading: 'Curated Opportunity Feed',
        items: [
          { label: 'Staff Frontend Engineer @ Stripe', status: '94% Demonstrated Fit', color: 'bg-emerald-100 text-emerald-800' },
          { label: 'AI Product Engineer @ Anthropic', status: '89% Demonstrated Fit', color: 'bg-emerald-100 text-emerald-800' },
          { label: 'Full-Stack Developer @ Linear', status: '85% Demonstrated Fit', color: 'bg-blue-100 text-blue-800' },
        ],
      },
    },
    {
      step: '03',
      title: 'Understand Your Match',
      tagline: 'Evidence-backed match breakdowns',
      detail:
        'Every match score is fully explained. See which requirements you clearly meet, which are partially evidenced, and where verification or learning can maximize your chances.',
      badge: 'Step 3: Verification',
      visual: {
        heading: 'Granular Match Evidence',
        items: [
          { label: 'Production React & TypeScript', status: 'Demonstrated in 3 commercial projects', color: 'bg-emerald-100 text-emerald-800' },
          { label: 'Vector DBs & Embeddings', status: 'Partial evidence (side project)', color: 'bg-amber-100 text-amber-800' },
          { label: 'Kubernetes Orchestration', status: 'Verification needed for screening', color: 'bg-rose-100 text-rose-800' },
        ],
      },
    },
    {
      step: '04',
      title: 'Prepare and Apply',
      tagline: 'Tailored narratives & interview prep',
      detail:
        'Generate focused cover letters, tailor resume emphasis for specific openings, run through realistic AI-powered technical mock interviews, and monitor application status in one place.',
      badge: 'Step 4: Action',
      visual: {
        heading: 'Application Readiness Kit',
        items: [
          { label: 'Role-Tailored Cover Letter', status: 'Generated & Editable', color: 'bg-emerald-100 text-emerald-800' },
          { label: 'AI Mock Technical Screen', status: 'Score: 4.8 / 5.0 (Ready)', color: 'bg-blue-100 text-blue-800' },
          { label: '1-Click Direct Application', status: 'Evidence Package Attached', color: 'bg-purple-100 text-purple-800' },
        ],
      },
    },
  ];

  return (
    <section className="w-full bg-[#F4F4F0] text-[#050505] py-20 sm:py-28 px-4 sm:px-8 border-t border-black/10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/10 text-[12px] font-mono tracking-wider uppercase mb-5">
            <span className="w-2 h-2 rounded-full bg-[#2458C6]" />
            02 — THE PROCESS
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#050505] leading-[1.08] font-jakarta mb-5">
            From potential to opportunity.
          </h2>
          <p className="text-base sm:text-lg text-black/70">
            A transparent four-step journey designed to replace arbitrary screening with clear evidence and actionable preparation.
          </p>
        </div>

        {/* 4 Connected Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((item, index) => {
            const isSelected = activeStep === index;
            return (
              <button
                type="button"
                key={item.step}
                onClick={() => setActiveStep(index)}
                className={`text-left p-6 sm:p-7 rounded-[26px] border transition-all duration-300 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-black/30 shadow-[0_8px_24px_rgba(0,0,0,0.08)] scale-[1.02]'
                    : 'bg-white/60 border-black/10 hover:bg-white/90 hover:border-black/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-bold text-[#F0442D]">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#F4F4F0] border border-black/10 uppercase tracking-wider text-black/70">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#050505] mb-2 font-jakarta">
                    {item.title}
                  </h3>

                  <p className="text-xs font-semibold text-black/50 mb-4 uppercase tracking-wide font-mono">
                    {item.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between text-xs font-mono font-medium text-black/60">
                  <span>{isSelected ? 'Active Step Preview' : 'Click to inspect'}</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Interactive Visual Preview Card */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-black/10 shadow-sm max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F8F2E3] border border-black/10 flex items-center justify-center font-mono font-bold text-base text-[#F0442D]">
                {steps[activeStep].step}
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#050505]">
                  {steps[activeStep].visual.heading}
                </h4>
                <p className="text-xs text-black/60 font-mono">
                  Interactive simulation of step {steps[activeStep].step} workflow
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-[#9EF5CD]/40 border border-black/10 text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Live Demonstration
            </div>
          </div>

          <div className="space-y-3.5">
            {steps[activeStep].visual.items.map((entry, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F8F2E3]/50 border border-black/10 hover:border-black/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#F0442D]" />
                  <span className="text-sm font-semibold text-[#050505]">{entry.label}</span>
                </div>
                <span className={`text-xs font-mono font-medium px-3 py-1 rounded-full self-start sm:self-auto ${entry.color}`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

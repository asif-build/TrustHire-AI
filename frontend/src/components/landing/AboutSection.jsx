import React from 'react';

export default function AboutSection() {
  const featureBlocks = [
    {
      num: 'A',
      title: 'Understand Talent',
      badge: 'Evidence Extraction',
      badgeColor: 'bg-[#9EF5CD] text-[#050505]',
      description:
        'Resumes are more than keyword lists. TrustHire parses past roles, projects, and open-source contributions into concrete demonstrated competencies and growth trajectories.',
      points: [
        'Multi-format resume parsing (PDF, DOCX, LinkedIn)',
        'GitHub & portfolio repository code inspection',
        'Distinguishes self-taught projects from commercial production experience',
      ],
      icon: (
        <svg className="w-6 h-6 stroke-[#050505]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      num: 'B',
      title: 'Match With Meaning',
      badge: 'Reasoned Alignment',
      badgeColor: 'bg-[#FFF176] text-[#050505]',
      description:
        'No opaque percentages or black-box rankings. TrustHire matches candidates to positions by comparing real job demands directly against verified candidate artifacts with clear rationale.',
      points: [
        'Transparent requirement-by-requirement score breakdown',
        'Cites specific resume bullet points as evidence for each matched skill',
        'Eliminates arbitrary pedigree and keyword-stuffing bias',
      ],
      icon: (
        <svg className="w-6 h-6 stroke-[#050505]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      num: 'C',
      title: "Build What's Missing",
      badge: 'Actionable Roadmaps',
      badgeColor: 'bg-[#F0442D] text-white',
      description:
        'A gap is an invitation to learn. When a candidate lacks a specific qualification, TrustHire provides targeted learning pathways, project ideas, and interview practice to bridge it.',
      points: [
        'Identifies high-leverage skill gaps holding back applications',
        'Curates specific open-source practice projects and reference docs',
        'Interactive AI mock interviews targeting candidate growth areas',
      ],
      icon: (
        <svg className="w-6 h-6 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white text-[#050505] py-20 sm:py-28 px-4 sm:px-8 border-t border-black/10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F0] border border-black/10 text-[12px] font-mono tracking-wider uppercase mb-5">
              <span className="w-2 h-2 rounded-full bg-[#F0442D]" />
              01 — INTRODUCING TRUSTHIRE
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#050505] leading-[1.08] font-jakarta">
              Hiring should recognise potential, <span className="underline decoration-[#F0442D] decoration-wavy decoration-2">not just keywords</span>.
            </h2>
          </div>
          <p className="text-base sm:text-lg text-black/70 max-w-md font-normal leading-relaxed">
            TrustHire helps candidates discover relevant opportunities, understand their strengths, and identify what they need to improve. It helps recruiters evaluate job-related skills with clearer evidence and explanations.
          </p>
        </div>

        {/* 3 Feature Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featureBlocks.map((block) => (
            <div
              key={block.num}
              className="group relative bg-[#F8F2E3]/40 hover:bg-[#F8F2E3] transition-colors duration-300 rounded-[28px] p-7 sm:p-9 border border-black/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-black/10 shadow-sm flex items-center justify-center">
                    {block.icon}
                  </div>
                  <span className={`text-[11px] font-mono font-medium px-3 py-1 rounded-full uppercase tracking-wider ${block.badgeColor}`}>
                    {block.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-xs font-mono font-bold text-black/40">PART {block.num}</span>
                  <h3 className="text-2xl font-bold tracking-tight text-[#050505]">
                    {block.title}
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-black/70 leading-relaxed mb-6">
                  {block.description}
                </p>
              </div>

              <div className="pt-6 border-t border-black/10">
                <ul className="space-y-2.5">
                  {block.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-black/80 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F0442D] mt-2 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

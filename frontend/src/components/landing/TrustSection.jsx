import React from 'react';

export default function TrustSection() {
  const principles = [
    {
      num: '01',
      title: 'Explainable Recommendations',
      description:
        'Every match score comes with a readable breakdown of matched, partially evidenced, and missing requirements. We do not provide opaque single-number rankings.',
    },
    {
      num: '02',
      title: 'Traceable Resume Evidence',
      description:
        'Every competency identified by TrustHire links directly back to specific bullet points, project repositories, or verified work history from the candidate.',
    },
    {
      num: '03',
      title: 'Verified vs. Suggested Boundaries',
      description:
        'We maintain strict visual and structural separation between factually verified achievements and prospective AI suggestions, eliminating confusion.',
    },
    {
      num: '04',
      title: 'Candidate Data Sovereignty',
      description:
        'Candidates own their data. You choose exactly which profile sections, code repositories, and contact details are visible to recruiters, and can revoke access anytime.',
    },
    {
      num: '05',
      title: 'Mandatory Human Oversight',
      description:
        'TrustHire acts strictly as a decision-support copilot. Consequential decisions — shortlisting, interviewing, and hiring — are always made by human recruiters.',
    },
    {
      num: '06',
      title: 'Explicit Model Limitations',
      description:
        'We openly state what our models cannot evaluate: culture fit, interpersonal chemistry, soft-skill nuances, and team dynamics require human conversation.',
    },
  ];

  return (
    <section className="w-full bg-white text-[#050505] py-20 sm:py-28 px-4 sm:px-8 border-t border-black/10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F0] border border-black/10 text-[12px] font-mono tracking-wider uppercase mb-5">
            <span className="w-2 h-2 rounded-full bg-[#F0442D]" />
            06 — TRUST AND TRANSPARENCY
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#050505] leading-[1.08] font-jakarta mb-5">
            Intelligence you can question.
          </h2>
          <p className="text-base sm:text-lg text-black/70 leading-relaxed">
            AI in career evaluation should be auditable, explainable, and accountable. Here are the core ethical commitments that govern every algorithmic feature on TrustHire.
          </p>
        </div>

        {/* 6 Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {principles.map((principle) => (
            <div
              key={principle.num}
              className="p-7 sm:p-8 rounded-[28px] bg-[#F8F2E3]/50 border border-black/10 hover:border-black/25 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-black/10 text-[#F0442D]">
                    {principle.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#050505]/30" />
                </div>

                <h3 className="text-xl font-bold text-[#050505] font-jakarta mb-3">
                  {principle.title}
                </h3>

                <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                  {principle.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/10 text-[11px] font-mono text-black/50">
                Ethical Hiring Standard
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

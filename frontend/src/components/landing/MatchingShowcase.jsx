import React, { useState } from 'react';

export default function MatchingShowcase() {
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);

  const sampleJob = {
    title: 'Senior Frontend & AI Platform Engineer',
    company: 'Apex Intelligence Labs',
    location: 'Remote / San Francisco',
    type: 'Full-time',
    fictionalNotice: 'Simulated illustrative benchmark — not a real individual evaluation',
  };

  const candidateProfile = {
    name: 'Maya Vance',
    title: 'Full-Stack Software Engineer (4 Years Experience)',
    education: 'B.S. in Computer Science',
    verifiedRepositories: 6,
    extractedCompetencies: 24,
  };

  const matchingBreakdown = [
    {
      skill: 'Modern React & TypeScript Architecture',
      tier: 'Demonstrated',
      tierBadge: 'bg-[#9EF5CD] text-[#050505] border-emerald-400',
      evidenceSource: 'Production SaaS Lead @ Horizon Analytics (2023–2025)',
      citation:
        'Architected real-time client dashboard in React 18, TypeScript, and TanStack Query serving 45,000 MAUs. Open-source maintainer of typed state-machine utility (3.2k stars).',
      confidenceNote: 'Direct code artifacts and production work history verify end-to-end fluency.',
      statusIndicator: 'Fully Evidenced',
    },
    {
      skill: 'Vector Embeddings & Semantic Search Integration',
      tier: 'Partially Demonstrated',
      tierBadge: 'bg-[#FFF176] text-[#050505] border-amber-400',
      evidenceSource: 'Personal Open-Source Project: "DocuLens-AI" (GitHub)',
      citation:
        'Implemented document chunking and vector indexing with Pinecone and OpenAI embeddings for documentation search. Handled ~10,000 vectors with caching layer.',
      confidenceNote: 'Prototype proves structural understanding; lacks verified high-throughput production scaling.',
      statusIndicator: 'Demonstrated at Prototype Scale',
    },
    {
      skill: 'High-Performance WebGL / Canvas 2D Graphics',
      tier: 'Demonstrated',
      tierBadge: 'bg-[#9EF5CD] text-[#050505] border-emerald-400',
      evidenceSource: 'Interactive Visualizations @ Horizon Analytics',
      citation:
        'Built interactive graph node renderers using HTML5 Canvas 2D and Three.js with 60fps performance and custom particle shaders on resource-constrained devices.',
      confidenceNote: 'Verified via live demo link and production benchmarks.',
      statusIndicator: 'Fully Evidenced',
    },
    {
      skill: 'Distributed Systems & Kubernetes Deployment',
      tier: 'Needs Verification',
      tierBadge: 'bg-[#2458C6] text-white border-blue-600',
      evidenceSource: 'Self-reported in resume summary, no public repository evidence',
      citation:
        'Mentioned deploying containerized microservices to AWS EKS in team context, but specific individual contributions and Terraform configs are not verifiable in submitted portfolio.',
      confidenceNote: 'Flagged for quick 15-minute live technical discussion rather than automated exclusion.',
      statusIndicator: 'Recommended Interview Topic',
    },
  ];

  const currentSkill = matchingBreakdown[selectedSkillIndex];

  return (
    <section className="w-full bg-white text-[#050505] py-20 sm:py-28 px-4 sm:px-8 border-t border-black/10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F0] border border-black/10 text-[12px] font-mono tracking-wider uppercase mb-5">
            <span className="w-2 h-2 rounded-full bg-[#9EF5CD] border border-black/20" />
            03 — INTELLIGENT MATCHING
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#050505] leading-[1.08] font-jakarta mb-5">
            Every match should have a reason.
          </h2>
          <p className="text-base sm:text-lg text-black/70 leading-relaxed">
            TrustHire breaks open the black box. Instead of an arbitrary percentage, recruiters and candidates inspect transparent, evidence-backed requirement evaluations with cited source artifacts.
          </p>
        </div>

        {/* Product Interface Card */}
        <div className="bg-[#F8F2E3] rounded-[32px] sm:rounded-[40px] border border-black/15 shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden">
          
          {/* Top Bar of the Product Interface */}
          <div className="bg-white/80 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F0442D]" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F0442D]">
                    Match Analysis Console
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 text-black/60">
                    Fictional Benchmark
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#050505] font-jakarta">
                  {sampleJob.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-black/5 text-black/70 border border-black/10">
                {sampleJob.company}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Evidence Match: 88%
              </span>
            </div>
          </div>

          {/* Console Grid Layout: Left Column (Candidate & Requirements) / Right Column (Deep Citation & Evidence) */}
          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 5 Cols: Candidate Info & Skill Selector List */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Candidate Profile Summary Card */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-black/10 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-black/50">
                      Evaluated Candidate
                    </span>
                    <h4 className="text-xl font-bold text-[#050505] font-jakarta">
                      {candidateProfile.name}
                    </h4>
                    <p className="text-xs text-black/70 mt-0.5">
                      {candidateProfile.title}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#9EF5CD] border border-black/10 flex items-center justify-center font-bold text-sm text-[#050505]">
                    MV
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/10 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-[#F4F4F0]">
                    <span className="text-black/50 block text-[10px]">VERIFIED REPOS</span>
                    <span className="font-bold text-[#050505]">{candidateProfile.verifiedRepositories} Codebases</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F4F4F0]">
                    <span className="text-black/50 block text-[10px]">EXTRACTED SKILLS</span>
                    <span className="font-bold text-[#050505]">{candidateProfile.extractedCompetencies} Signals</span>
                  </div>
                </div>
              </div>

              {/* Requirement Skills Tabs */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-black/60">
                    Job Requirements ({matchingBreakdown.length})
                  </span>
                  <span className="text-[11px] font-mono text-black/50">
                    Click to view evidence
                  </span>
                </div>

                <div className="space-y-2.5">
                  {matchingBreakdown.map((item, idx) => {
                    const isSelected = selectedSkillIndex === idx;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedSkillIndex(idx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-white border-black/30 shadow-sm scale-[1.01]'
                            : 'bg-white/60 border-black/10 hover:bg-white/90'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            item.tier === 'Demonstrated' ? 'bg-emerald-500' :
                            item.tier === 'Partially Demonstrated' ? 'bg-amber-400' : 'bg-blue-600'
                          }`} />
                          <span className="text-xs sm:text-sm font-bold text-[#050505] truncate">
                            {item.skill}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${item.tierBadge}`}>
                          {item.tier}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right 7 Cols: Detailed Evidence Citation Inspector */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-[28px] p-6 sm:p-8 border border-black/10 shadow-sm">
              <div>
                
                {/* Header of Citation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/10 mb-6">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-black/50 block">
                      Requirement Inspection
                    </span>
                    <h4 className="text-xl sm:text-2xl font-bold text-[#050505] font-jakarta mt-1">
                      {currentSkill.skill}
                    </h4>
                  </div>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${currentSkill.tierBadge}`}>
                    {currentSkill.statusIndicator}
                  </span>
                </div>

                {/* Evidence Source Citation */}
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-xs font-mono text-black/50 uppercase tracking-wider block mb-1">
                      Evidence Source
                    </span>
                    <div className="text-sm font-semibold text-[#050505] bg-[#F4F4F0] p-3 rounded-xl border border-black/10">
                      {currentSkill.evidenceSource}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-black/50 uppercase tracking-wider block mb-1">
                      Extracted Resume / Codebase Citation
                    </span>
                    <div className="text-xs sm:text-sm text-black/80 bg-[#F8F2E3]/60 p-4 rounded-xl border border-black/10 italic leading-relaxed">
                      "{currentSkill.citation}"
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-black/50 uppercase tracking-wider block mb-1">
                      Evaluation Rationale
                    </span>
                    <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                      {currentSkill.confidenceNote}
                    </p>
                  </div>
                </div>

              </div>

              {/* Notice & Human Oversight Principle */}
              <div className="pt-5 border-t border-black/10 bg-[#F4F4F0]/60 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-5 sm:p-6 rounded-b-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-black/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F0442D]" />
                  <span>Product-generated estimate. Does not replace human hiring judgment.</span>
                </div>
                <span className="font-mono text-[11px] font-medium text-black/70">
                  Responsible AI Standard §3.2
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

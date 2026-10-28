import React from 'react';
import { Link } from 'react-router-dom';

export default function RecruiterSection() {
  const recruiterFeatures = [
    {
      title: 'Skill-First Requisition Builder',
      description: 'Define core technical outcomes and verified competencies rather than laundry lists of arbitrary requirements.',
    },
    {
      title: 'Evidence-Backed Candidate Profiles',
      description: 'Inspect real GitHub code contributions, technical problem-solving history, and production project artifacts.',
    },
    {
      title: 'Multi-Candidate Alignment Matrix',
      description: 'Compare applicants side-by-side on identical job requirements with cited evidence points rather than biased gut feelings.',
    },
    {
      title: 'Structured Interview Management',
      description: 'Generate objective, role-specific question scorecards designed to evaluate real technical competencies.',
    },
    {
      title: 'Bias-Free Talent Discovery',
      description: 'Filter strictly on demonstrated capabilities. Blind mode conceals names, institutions, and demographic signals during initial review.',
    },
    {
      title: 'Hiring Velocity & Funnel Analytics',
      description: 'Track conversion, stage latency, and offer acceptance with clear audit logs explaining every AI-assisted ranking.',
    },
  ];

  return (
    <section className="w-full bg-[#F4F4F0] text-[#050505] py-20 sm:py-28 px-4 sm:px-8 border-t border-black/10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 sm:mb-20 gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/10 text-[12px] font-mono tracking-wider uppercase mb-5">
              <span className="w-2 h-2 rounded-full bg-[#2458C6]" />
              05 — FOR RECRUITERS
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#050505] leading-[1.08] font-jakarta mb-5">
              See the evidence behind every candidate.
            </h2>
            <p className="text-base sm:text-lg text-black/70 max-w-2xl leading-relaxed">
              Stop sifting through keyword-stuffed resumes. TrustHire empowers recruitment teams to evaluate real engineering depth with transparent evidence citations and zero black-box automated rejections.
            </p>
          </div>

          <Link
            to="/signup?role=recruiter"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#050505] text-white hover:bg-black/85 transition-all text-sm font-semibold tracking-wide self-start shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
          >
            <span>Start Hiring on TrustHire</span>
            <span className="font-mono">→</span>
          </Link>
        </div>

        {/* Dashboard Preview Interface */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/15 shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden mb-14">
          
          {/* Header Bar */}
          <div className="bg-[#F8F2E3] px-6 sm:px-8 py-5 border-b border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#050505] text-white font-mono text-xs flex items-center justify-center font-bold">
                TH
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-black/50 block">
                  Recruiter Operations Console
                </span>
                <span className="text-sm font-bold text-[#050505]">
                  Active Requisition: Lead Machine Learning Platform Engineer (Q4 Pipeline)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                12 Verified Candidates
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white border border-black/10 text-black/70">
                Blind Screening Active
              </span>
            </div>
          </div>

          {/* Interactive Candidate Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-[#F4F4F0]/60 text-[11px] font-mono uppercase tracking-wider text-black/60">
                  <th className="py-4 px-6">Candidate ID</th>
                  <th className="py-4 px-6">Core Competencies Evidenced</th>
                  <th className="py-4 px-6">Match Breakdown</th>
                  <th className="py-4 px-6">Verified Source Artifacts</th>
                  <th className="py-4 px-6 text-right">Human Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 text-xs sm:text-sm font-sans">
                <tr className="hover:bg-[#F8F2E3]/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#050505]">
                    TH-8902 (Candidate A)
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">PyTorch</span>
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">CUDA</span>
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">Ray / Distributed</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      92% Evidenced
                    </span>
                  </td>
                  <td className="py-4 px-6 text-black/70 font-mono text-xs">
                    4 Repositories • 1 Peer-Reviewed Paper
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button type="button" className="px-3.5 py-1.5 rounded-full bg-[#050505] text-white text-xs font-semibold hover:bg-black/80 transition-colors">
                      Review Evidence
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-[#F8F2E3]/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#050505]">
                    TH-8941 (Candidate B)
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">vLLM</span>
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">FastAPI</span>
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">Triton Inference</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      87% Evidenced
                    </span>
                  </td>
                  <td className="py-4 px-6 text-black/70 font-mono text-xs">
                    Production Microservice Benchmarks
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button type="button" className="px-3.5 py-1.5 rounded-full bg-[#050505] text-white text-xs font-semibold hover:bg-black/80 transition-colors">
                      Review Evidence
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-[#F8F2E3]/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#050505]">
                    TH-8987 (Candidate C)
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">TensorFlow</span>
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">ONNX</span>
                      <span className="px-2 py-0.5 rounded bg-black/5 text-black/80 font-mono text-[11px]">Docker</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-mono text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      79% Partial
                    </span>
                  </td>
                  <td className="py-4 px-6 text-black/70 font-mono text-xs">
                    Self-Reported • Screening Recommended
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button type="button" className="px-3.5 py-1.5 rounded-full bg-white border border-black/20 text-[#050505] text-xs font-semibold hover:bg-[#F4F4F0] transition-colors">
                      Schedule Screen
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ethics Guarantee Footer */}
          <div className="p-4 sm:p-5 bg-[#F8F2E3]/60 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-black/70 font-mono">
            <span>⚡ Human-in-the-Loop Protocol: AI suggests matches based on artifacts; recruiters make all hiring determinations.</span>
            <span className="text-[#F0442D] font-bold">Zero Automated Rejections</span>
          </div>

        </div>

        {/* 6 Recruiter Feature Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recruiterFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[24px] p-6 border border-black/10 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#2458C6]" />
                <h3 className="text-lg font-bold text-[#050505] font-jakarta">
                  {feat.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

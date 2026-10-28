import React from 'react';
import { Link } from 'react-router-dom';

export default function CandidateSection() {
  const candidateTools = [
    {
      title: 'Opportunity & Internship Discovery',
      status: 'Live',
      statusColor: 'bg-emerald-100 text-emerald-800',
      description:
        'Browse high-relevance roles filtered by genuine skill alignment rather than keyword density. Discover opportunities where your skills provide immediate leverage.',
      icon: (
        <svg className="w-5 h-5 stroke-[#050505]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      title: 'Deep Resume Intelligence',
      status: 'Live',
      statusColor: 'bg-emerald-100 text-emerald-800',
      description:
        'Audit your resume to uncover hidden strengths, benchmark against industry roles, and receive concrete suggestions to elevate technical clarity.',
      icon: (
        <svg className="w-5 h-5 stroke-[#050505]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Tailored Applications & Cover Letters',
      status: 'Live',
      statusColor: 'bg-emerald-100 text-emerald-800',
      description:
        'Generate compelling, role-tailored application narratives and cover letter drafts citing your exact past work, without generic AI clichés.',
      icon: (
        <svg className="w-5 h-5 stroke-[#050505]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      title: 'Skill-Gap Roadmap',
      status: 'Live',
      statusColor: 'bg-emerald-100 text-emerald-800',
      description:
        'See exactly which requirements stand between your current profile and target jobs, with curated open-source exercises and documentation links.',
      icon: (
        <svg className="w-5 h-5 stroke-[#050505]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'AI Mock Technical Interviewer',
      status: 'Live',
      statusColor: 'bg-emerald-100 text-emerald-800',
      description:
        'Rehearse targeted interview questions based on job requirements. Get instant feedback on structure, depth, and clarity.',
      icon: (
        <svg className="w-5 h-5 stroke-[#050505]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: 'Unified Application Tracker',
      status: 'Live',
      statusColor: 'bg-emerald-100 text-emerald-800',
      description:
        'Track every submission, interview date, and recruiter note in a streamlined kanban pipeline tailored for job seekers.',
      icon: (
        <svg className="w-5 h-5 stroke-[#050505]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-[#F7F1DF] text-[#050505] py-20 sm:py-28 px-4 sm:px-8 border-t border-black/10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 sm:mb-20 gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/10 text-[12px] font-mono tracking-wider uppercase mb-5">
              <span className="w-2 h-2 rounded-full bg-[#F0442D]" />
              04 — FOR CANDIDATES
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#050505] leading-[1.08] font-jakarta mb-5">
              Make your next move count.
            </h2>
            <p className="text-base sm:text-lg text-black/70 max-w-2xl">
              Equip yourself with transparent intelligence. Stand out by demonstrating actual engineering capabilities, building what's missing, and interviewing with confidence.
            </p>
          </div>

          <Link
            to="/signup?role=candidate"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#050505] text-white hover:bg-black/85 transition-all text-sm font-semibold tracking-wide self-start shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
          >
            <span>Start as a Candidate</span>
            <span className="font-mono">→</span>
          </Link>
        </div>

        {/* 6 Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidateTools.map((tool, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[26px] p-7 border border-black/10 shadow-sm flex flex-col justify-between hover:border-black/25 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F2E3] border border-black/10 flex items-center justify-center">
                    {tool.icon}
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border border-black/5 font-medium ${tool.statusColor}`}>
                    {tool.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#050505] font-jakarta mb-3">
                  {tool.title}
                </h3>

                <p className="text-xs sm:text-sm text-black/70 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between text-xs font-mono font-medium text-[#F0442D]">
                <span>Candidate Portal Feature</span>
                <span>✓</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, GraduationCap, Building2, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InteractiveModals({ activeModal, onClose }) {
  if (!activeModal) return null;

  const contentMap = {
    colleges: {
      badge: 'Campus Intelligence',
      icon: <GraduationCap className="text-[#ff4924]" size={28} />,
      title: 'Tier Calibration for Regional Engineering Colleges',
      subtitle: 'Overcoming pedigree bias by verifying practical competence over university rankings.',
      points: [
        'Recognizes self-study vectors and competitive exam prep (GATE, UPSC engineering).',
        'Direct project indexing: repositories, open-source commits, and hackathon prototypes.',
        'Algorithmic tier adjustment ensures Tier-2 and Tier-3 candidates are matched on verified grit.',
        'Partner college portals allow department chairs to benchmark graduate batch trajectories.',
      ],
      ctaText: 'Partner Your Institution',
      ctaLink: '/signup?role=candidate',
    },
    howItWorks: {
      badge: 'Explainable AI Engine',
      icon: <Cpu className="text-[#2bee4b]" size={28} />,
      title: 'How TrustHire Evaluates Real Competence',
      subtitle: 'A 5-stage verification methodology designed to eliminate bias and superficial formatting.',
      points: [
        '01. JD Extraction: Parses required latent competencies, tech stacks, and team velocity needs.',
        '02. Resume Parse: Algorithmic isolation of work timelines, project deliverables, and real code.',
        '03. Trajectory Pathing: Calculates learning slope, skill progression, and engineering persistence.',
        '04. Tier Calibration: Adjusts for non-traditional backgrounds, tier-2/3 institutions, and gap-year self-study.',
        '05. Bias Shield: Locks candidate identifiers (gender, name, college pedigree) for pure merit shortlisting.',
      ],
      ctaText: 'Try Platform Demo',
      ctaLink: '/login',
    },
    candidates: {
      badge: 'For Candidates',
      icon: <Sparkles className="text-[#ffe000]" size={28} />,
      title: 'Land High-Growth Roles On True Capability',
      subtitle: 'No pedigree gatekeeping. Your GitHub, live projects, and trajectory speak for you.',
      points: [
        'Anonymous shortlisting shields your profile from unconscious bias.',
        'Receive deep semantic breakdown explaining why a role matches your skill trajectory.',
        'Direct recruiter visibility without ATS keyword filtering discarding your resume.',
        'Track application status in real-time with comprehensive feedback vectors.',
      ],
      ctaText: 'Create Candidate Profile',
      ctaLink: '/signup?role=candidate',
    },
    recruiters: {
      badge: 'For Recruiters',
      icon: <Building2 className="text-[#2563eb]" size={28} />,
      title: 'Shortlist Elite Engineering Grit in Seconds',
      subtitle: 'Explainable match scores that show you exactly why a candidate will succeed.',
      points: [
        'Replace superficial keyword matches with deep technical trajectory analysis.',
        'Instant explainable match scores (0-100%) with itemized capability evidence.',
        'Discover hidden 10x engineering talent from diverse regional backgrounds.',
        'Reduce screening time by 70% while improving on-the-job hire success rates.',
      ],
      ctaText: 'Access Recruiter Console',
      ctaLink: '/signup?role=recruiter',
    },
  };

  const modalData = contentMap[activeModal];
  if (!modalData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-[#faf7f0] dark:bg-[#141815] rounded-[24px] border-2 border-[#111111] dark:border-[#333333] shadow-[0_24px_48px_rgba(0,0,0,0.25)] p-6 sm:p-8 z-10 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full border border-[#111111]/20 dark:border-white/20 flex items-center justify-center text-[#111111] dark:text-white hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* Badge & Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#202522] border border-[#111111]/15 dark:border-white/10 flex items-center justify-center shadow-sm">
              {modalData.icon}
            </div>
            <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-[#111111] text-white dark:bg-white dark:text-[#111111]">
              {modalData.badge}
            </span>
          </div>

          {/* Heading */}
          <h3 className="font-jakarta text-xl sm:text-2xl font-extrabold text-[#111111] dark:text-white tracking-tight mb-2">
            {modalData.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#516254] dark:text-[#a0b0a5] font-medium mb-6">
            {modalData.subtitle}
          </p>

          {/* Points */}
          <div className="space-y-3 mb-8">
            {modalData.points.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#111111] dark:text-[#eaeaea]">
                <CheckCircle2 size={16} className="text-[#2bee4b] shrink-0 mt-0.5" />
                <span className="leading-snug">{pt}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#111111]/10 dark:border-white/10">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-[#516254] hover:text-[#111111] dark:text-[#a0b0a5] dark:hover:text-white cursor-pointer transition-colors"
            >
              Close
            </button>
            <Link
              to={modalData.ctaLink}
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#111111] text-white dark:bg-white dark:text-[#111111] text-xs font-bold tracking-wide uppercase hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span>{modalData.ctaText}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

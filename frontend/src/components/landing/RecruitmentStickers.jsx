import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// 1. Rocket Illustration (Career Launch — inspired by top-left rocket in reference)
const RocketSticker = () => (
  <svg viewBox="0 0 110 110" className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Die-cut white sticker border */}
    <path
      d="M55 8 C72 26 84 50 82 72 L68 76 L55 68 L42 76 L28 72 C26 50 38 26 55 8 Z"
      stroke="#FFFFFF"
      strokeWidth="14"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Exhaust flame */}
    <path
      d="M44 76 Q55 104 55 104 Q55 104 66 76 Z"
      fill="#FACC15"
      stroke="#050505"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    <path
      d="M48 76 Q55 94 55 94 Q55 94 62 76 Z"
      fill="#F0442D"
      stroke="#050505"
      strokeWidth="2.5"
    />
    {/* Rocket body */}
    <path
      d="M55 10 C70 28 80 50 78 72 L32 72 C30 50 40 28 55 10 Z"
      fill="#FFFFFF"
      stroke="#050505"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* Red nose cone */}
    <path
      d="M55 10 C62 20 67 30 70 36 L40 36 C43 30 48 20 55 10 Z"
      fill="#F0442D"
      stroke="#050505"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Side fins */}
    <path
      d="M32 54 L18 68 C16 78 26 80 32 72 Z"
      fill="#F0442D"
      stroke="#050505"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    <path
      d="M78 54 L92 68 C94 78 84 80 78 72 Z"
      fill="#F0442D"
      stroke="#050505"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* Porthole window in mint */}
    <circle cx="55" cy="50" r="10" fill="#2bee4b" stroke="#050505" strokeWidth="3" />
    <circle cx="55" cy="50" r="6" fill="#F8F2E3" stroke="#050505" strokeWidth="1.8" />
  </svg>
);

// 2. Yellow Smiling AI Assistant (Intelligent Assistance — inspired by yellow smiley in reference)
const SmilingAICoin = () => (
  <svg viewBox="0 0 100 100" className="w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* White sticker die-cut */}
    <circle cx="50" cy="50" r="42" stroke="#FFFFFF" strokeWidth="12" />
    {/* Shadow base circle */}
    <circle cx="53" cy="53" r="38" fill="#D4AF37" stroke="#050505" strokeWidth="3.2" />
    {/* Yellow coin face */}
    <circle cx="50" cy="50" r="38" fill="#FACC15" stroke="#050505" strokeWidth="3.2" />
    {/* Winking pop face */}
    {/* Left eye: winking arc */}
    <path d="M34 44 Q40 38 46 44" stroke="#050505" strokeWidth="3.2" strokeLinecap="round" />
    {/* Right eye: open dot */}
    <circle cx="64" cy="42" r="3.5" fill="#050505" />
    {/* Happy playful smile */}
    <path d="M42 56 Q50 68 58 56" stroke="#050505" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    {/* Cute blush cheeks */}
    <ellipse cx="32" cy="54" rx="3.5" ry="2" fill="#F0442D" opacity="0.8" />
    <ellipse cx="68" cy="54" rx="3.5" ry="2" fill="#F0442D" opacity="0.8" />
  </svg>
);

// 3. Circular Mint Skill-Match Badge (Verified evidence — inspired by mint 'P' coin in reference)
const SkillMatchBadge = () => (
  <svg viewBox="0 0 100 100" className="w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* White sticker die-cut */}
    <circle cx="50" cy="50" r="42" stroke="#FFFFFF" strokeWidth="12" />
    {/* Mint Green Coin */}
    <circle cx="50" cy="50" r="39" fill="#2bee4b" stroke="#050505" strokeWidth="3.2" />
    {/* Inner ring */}
    <circle cx="50" cy="50" r="30" stroke="#050505" strokeWidth="2.2" strokeDasharray="4 3" fill="#0c1015" />
    {/* TrustHire Monogram T */}
    <path d="M38 36 H62 M50 36 V64" stroke="#2bee4b" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Radiating Sparkles */}
    <path d="M72 24 L74 29 L79 30 L74 31 L72 36 L70 31 L65 30 L70 29 Z" fill="#FFFFFF" stroke="#050505" strokeWidth="1.5" />
  </svg>
);

// 4. Briefcase / Credential Wallet (Employment — inspired by blue wallet in reference)
const BriefcaseSticker = () => (
  <svg viewBox="0 0 110 90" className="w-20 h-17 sm:w-24 sm:h-20 md:w-28 md:h-23" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* White sticker border */}
    <rect x="12" y="22" width="86" height="58" rx="14" stroke="#FFFFFF" strokeWidth="12" />
    {/* Handle backing & handle */}
    <path d="M40 22 V12 C40 8 46 5 55 5 C64 5 70 8 70 12 V22" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
    <path d="M40 22 V12 C40 8 46 5 55 5 C64 5 70 8 70 12 V22" stroke="#050505" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    {/* Credentials peeking out */}
    <rect x="24" y="14" width="34" height="18" rx="3" fill="#FFFFFF" stroke="#050505" strokeWidth="2.5" />
    <line x1="28" y1="20" x2="48" y2="20" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
    {/* Cobalt Blue Body */}
    <rect x="12" y="22" width="86" height="58" rx="12" fill="#2563EB" stroke="#050505" strokeWidth="3.2" />
    {/* Front leather flap */}
    <path d="M12 22 H98 V44 C98 44 72 54 55 54 C38 54 12 44 12 44 Z" fill="#1D4ED8" stroke="#050505" strokeWidth="3" />
    {/* Red snap buckle */}
    <rect x="48" y="46" width="14" height="15" rx="3.5" fill="#F0442D" stroke="#050505" strokeWidth="2.5" />
    <circle cx="55" cy="53.5" r="2" fill="#FFFFFF" />
  </svg>
);

// 5. Graduation Cap (Education beyond pedigree)
const GraduationCapSticker = () => (
  <svg viewBox="0 0 110 95" className="w-20 h-18 sm:w-24 sm:h-21 md:w-28 md:h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* White sticker border */}
    <path
      d="M55 12 L100 32 L55 52 L10 32 Z M26 44 V62 C26 72 84 72 84 62 V44"
      stroke="#FFFFFF"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cap skull base */}
    <path
      d="M26 46 V62 C26 72 84 72 84 62 V46"
      fill="#1E293B"
      stroke="#050505"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Diamond mortarboard */}
    <path
      d="M55 14 L98 34 L55 54 L12 34 Z"
      fill="#0F172A"
      stroke="#050505"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Gold Tassel */}
    <ellipse cx="55" cy="34" rx="4.5" ry="3" fill="#FACC15" stroke="#050505" strokeWidth="2" />
    <path d="M55 35 Q45 42 38 58" stroke="#FACC15" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="38" cy="62" r="4.5" fill="#FACC15" stroke="#050505" strokeWidth="2" />
  </svg>
);

export default function RecruitmentStickers() {
  const shouldReduceMotion = useReducedMotion();

  // Deliberate positioning inspired by the reference composition
  const stickers = [
    {
      id: 'rocket',
      name: 'Career Launch',
      component: <RocketSticker />,
      pos: 'top-[3%] left-[1%] sm:left-[4%] md:left-[8%]',
      baseRot: -18,
      floatY: [-5, 6, -5],
      delay: 0.25,
    },
    {
      id: 'ai-coin',
      name: 'AI Semantic Match',
      component: <SmilingAICoin />,
      // Positioned overlapping top of wordmark, exactly like yellow smiley in reference
      pos: 'top-[8%] right-[32%] sm:right-[36%] md:right-[39%]',
      baseRot: 10,
      floatY: [-6, 5, -6],
      delay: 0.38,
    },
    {
      id: 'skill-badge',
      name: 'Skill Verification',
      component: <SkillMatchBadge />,
      // Positioned lower-left, exactly like the mint 'P' coin in reference
      pos: 'bottom-[12%] left-[3%] sm:left-[7%] md:left-[11%]',
      baseRot: 12,
      floatY: [5, -6, 5],
      delay: 0.48,
    },
    {
      id: 'briefcase',
      name: 'Verified Roles',
      component: <BriefcaseSticker />,
      // Positioned lower-right, exactly like the blue wallet in reference
      pos: 'bottom-[15%] right-[2%] sm:right-[6%] md:right-[10%]',
      baseRot: -10,
      floatY: [-5, 6, -5],
      delay: 0.32,
    },
    {
      id: 'grad-cap',
      name: 'Education & Grit',
      component: <GraduationCapSticker />,
      pos: 'top-[4%] right-[3%] sm:right-[7%] md:right-[11%] hidden lg:block',
      baseRot: 14,
      floatY: [6, -5, 6],
      delay: 0.55,
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden="true">
      {stickers.map((stk) => (
        <motion.div
          key={stk.id}
          className={`absolute ${stk.pos} pointer-events-auto cursor-pointer drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)] group scale-80 sm:scale-90 md:scale-100 origin-center`}
          title={stk.name}
          initial={
            shouldReduceMotion
              ? { opacity: 1, scale: 1, rotate: stk.baseRot }
              : { opacity: 0, scale: 0.3, rotate: stk.baseRot - 25 }
          }
          animate={{
            opacity: 1,
            scale: 1,
            rotate: stk.baseRot,
          }}
          transition={{
            delay: shouldReduceMotion ? 0 : stk.delay,
            duration: 0.7,
            type: 'spring',
            stiffness: 240,
            damping: 18,
          }}
        >
          {/* Gentle, continuous floating movement */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: stk.floatY,
                    rotate: [stk.baseRot - 2, stk.baseRot + 2, stk.baseRot - 2],
                  }
            }
            transition={{
              repeat: Infinity,
              duration: 4.8,
              ease: 'easeInOut',
              delay: stk.delay,
            }}
            whileHover={{
              scale: 1.14,
              rotate: stk.baseRot + 5,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            {stk.component}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

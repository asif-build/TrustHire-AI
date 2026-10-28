import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const LETTERS = ['T', 'R', 'U', 'S', 'T', 'H', 'I', 'R', 'E'];

export default function HeroTypography({ className = '' }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div 
      className={`relative z-10 w-full flex items-center justify-center select-none ${className}`}
      role="heading"
      aria-level={1}
      aria-label="TrustHire"
    >
      <div 
        className="font-anton uppercase tracking-[-0.035em] text-[#050505] flex items-center justify-center whitespace-nowrap flex-nowrap leading-[0.84] text-[clamp(3.2rem,14.8vw,230px)] max-w-full"
        aria-hidden="true"
      >
        {LETTERS.map((char, idx) => (
          <span 
            key={idx} 
            className="overflow-hidden inline-block align-bottom py-1"
          >
            <motion.span
              className="inline-block origin-bottom will-change-transform text-[#050505]"
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { y: '115%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: shouldReduceMotion ? 0 : 0.08 + idx * 0.045,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {char}
            </motion.span>
          </span>
        ))}
      </div>
    </div>
  );
}

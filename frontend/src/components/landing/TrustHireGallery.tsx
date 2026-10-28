"use client";

import React, { useRef } from "react";
import { motion, MotionValue, useScroll, useTransform, useSpring } from "framer-motion";

const images = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
];

export default function TrustHireGallery() {
  const gallery = useRef<HTMLDivElement>(null);

  // High precision scroll tracking
  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  // Spring physics damper for buttery 120fps motion without layout thrashing
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 32,
    mass: 0.5,
    restDelta: 0.0001,
  });

  // Percentage-based GPU transforms — silky smooth across all viewports
  const y1 = useTransform(smoothProgress, [0, 1], ["0%", "-24%"]);
  const y2 = useTransform(smoothProgress, [0, 1], ["-18%", "22%"]);
  const y3 = useTransform(smoothProgress, [0, 1], ["0%", "-30%"]);
  const y4 = useTransform(smoothProgress, [0, 1], ["-15%", "18%"]);

  return (
    <section className="relative w-full bg-[#EFEFEF] text-gray-900 overflow-hidden pt-12 pb-20">
      {/* Editorial introduction */}
      <div className="mx-auto max-w-[1440px] px-6 pb-12 pt-16 sm:px-10 md:pb-16 md:pt-24">
        <div className="grid items-end gap-8 md:grid-cols-[1.5fr_0.7fr]">
          <div>
            <span className="mb-4 inline-block text-[11px] uppercase tracking-[0.24em] text-neutral-500 font-medium">
              Beyond the resume
            </span>

            <h2 className="max-w-4xl text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl md:text-7xl text-gray-900">
              Potential deserves
              <br />
              to be <span className="text-[#F0442D]">seen.</span>
            </h2>
          </div>

          <p className="max-w-sm pb-1 text-sm leading-7 text-neutral-600 md:justify-self-end md:text-base">
            Skills, projects, and ambition tell a bigger story.
            TrustHire connects people with opportunities that recognise genuine ability.
          </p>
        </div>
      </div>

      {/* Parallax gallery container with smooth GPU hardware acceleration */}
      <div
        ref={gallery}
        className="relative box-border flex h-[140vh] min-h-[750px] gap-3 sm:gap-6 overflow-hidden bg-white p-3 sm:p-6 rounded-3xl mx-3 sm:mx-6 lg:mx-8 shadow-sm border border-black/5 will-change-transform"
      >
        <Column images={[images[0], images[1], images[2]]} y={y1} initialTop="0%" />
        <Column images={[images[3], images[4], images[5]]} y={y2} initialTop="-12%" />
        <Column images={[images[6], images[7], images[8]]} y={y3} initialTop="0%" />
        <Column images={[images[9], images[10], images[11]]} y={y4} initialTop="-8%" />

        {/* Soft edge fades */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      {/* Minimal closing note */}
      <div className="flex items-center justify-between gap-4 px-6 py-8 sm:px-10 max-w-[1440px] mx-auto mt-6 border-t border-neutral-300/60">
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
          People · Skills · Possibility
        </span>

        <span className="text-xs text-neutral-500">
          A more human approach to hiring.
        </span>
      </div>
    </section>
  );
}

type ColumnProps = {
  images: string[];
  y: MotionValue<string>;
  initialTop?: string;
};

const Column = ({ images, y, initialTop = "0%" }: ColumnProps) => {
  return (
    <motion.div
      className="relative flex h-full w-1/4 min-w-[200px] sm:min-w-[240px] flex-col gap-3 sm:gap-6 will-change-transform"
      style={{ y, top: initialTop }}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl bg-[#f0ece1] shadow-xs group"
        >
          <img
            src={src}
            alt="Workplace and collaboration"
            className="pointer-events-none object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      ))}
    </motion.div>
  );
};

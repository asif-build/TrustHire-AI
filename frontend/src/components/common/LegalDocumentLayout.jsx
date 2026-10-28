import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import TrustHireLogo from '../ui/TrustHireLogo';
import TrustHireFooter from './TrustHireFooter';

/**
 * LegalDocumentLayout
 * Minimal, clean editorial document layout.
 * Removes versioning badges, status tags, and visual clutter.
 */
export default function LegalDocumentLayout({
  title,
  subtitle,
  sections = [],
  children
}) {
  const navigate = useNavigate();
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E231F] font-sans selection:bg-[#121613] selection:text-white flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#EAE5DA] px-6 sm:px-12 py-5 transition-colors">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <Link to="/" aria-label="TrustHire Home" className="flex items-center hover:opacity-80 transition-opacity">
            <TrustHireLogo variant="dark" symbolSize="h-7" textSize="text-xl font-normal" />
          </Link>

          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            aria-label="Back"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B716A] hover:text-[#121613] transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 sm:px-12 py-12 sm:py-20">
        
        {/* Clean Header */}
        <div className="max-w-[800px] mb-12 sm:mb-16">
          <h1 
            className="text-4xl sm:text-5xl font-serif font-normal text-[#121613] tracking-[-0.03em] leading-tight"
            style={{ fontFamily: "'Bodoni Moda', 'Tobias', Georgia, serif" }}
          >
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 text-base text-[#555B54] font-sans leading-relaxed">
              {subtitle}
            </p>
          )}

          <p className="mt-4 text-xs text-[#8A9088] font-sans">
            Last updated October 2026
          </p>
        </div>

        {/* Mobile Collapsible TOC */}
        <div className="lg:hidden max-w-[800px] mb-10">
          <div className="border border-[#E7E2D5] rounded-xl overflow-hidden bg-white/50">
            <button
              type="button"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs uppercase tracking-wider font-mono text-[#555B54]"
            >
              <span>On this page</span>
              {mobileTocOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {mobileTocOpen && (
              <nav className="px-4 pb-4 pt-1 border-t border-[#EAE5DA] space-y-2">
                {sections.map((sec, idx) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setMobileTocOpen(false)}
                    className={`block text-xs py-0.5 transition-colors ${
                      activeSection === sec.id
                        ? 'text-[#121613] font-medium'
                        : 'text-[#6E746D] hover:text-[#121613]'
                    }`}
                  >
                    {idx + 1}. {sec.title}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Desktop Left Sticky TOC */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#8A9088]">
                Contents
              </span>
              <nav className="space-y-1.5 border-l border-[#E2DDD0] pl-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {sections.map((sec, idx) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`block text-xs py-1 transition-all ${
                        isActive
                          ? 'text-[#121613] font-medium -ml-[17px] pl-4 border-l-2 border-[#121613]'
                          : 'text-[#6E746D] hover:text-[#121613]'
                      }`}
                    >
                      {idx + 1}. {sec.title}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Legal Text Body */}
          <article className="lg:col-span-8 max-w-[760px] space-y-12 sm:space-y-16 text-[#333833]">
            {children}
          </article>

        </div>

      </main>

      {/* Minimal Sunset-Style Editorial Footer */}
      <TrustHireFooter />

    </div>
  );
}

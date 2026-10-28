import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggleButton } from '../ui/theme-toggle';
import TrustHireLogo from '../ui/TrustHireLogo';

export default function HeroNavigation({ onOpenModal }) {
  const { user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccessApp = () => {
    setMenuOpen(false);
    if (user) {
      navigate(role === 'recruiter' ? '/recruiter' : '/career');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="relative z-40 w-full flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-6 pb-2">
      {/* Upper-Left: TrustHire Symbol Logo Only (No text written) */}
      <Link
        to="/"
        className="flex items-center justify-center hover:opacity-80 transition-opacity focus:outline-none"
        aria-label="TrustHire home"
      >
        <TrustHireLogo
          symbolOnly={true}
          variant="dark"
          className="h-10 sm:h-11 md:h-12 w-auto max-w-none"
        />
      </Link>

      {/* Upper-Right Controls: Theme toggle + Circular Menu Hamburger */}
      <div className="flex items-center gap-3">
        <div className="scale-90 opacity-80 hover:opacity-100 transition-opacity">
          <ThemeToggleButton variant="circle" start="top-right" />
        </div>

        {/* Circular Hamburger Button matching reference (~44px) */}
        <button
          ref={buttonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#050505] bg-[#FFFFFF] text-[#050505] flex items-center justify-center hover:bg-[#050505] hover:text-[#FFFFFF] transition-all cursor-pointer shadow-xs active:scale-95 ${
            menuOpen ? 'bg-[#050505] text-[#FFFFFF]' : ''
          }`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {/* Clean 3-bar hamburger icon */}
          <div className="flex flex-col gap-[3.5px] w-[18px] items-center">
            <span className="w-full h-[1.75px] bg-current rounded-full transition-all" />
            <span className="w-full h-[1.75px] bg-current rounded-full transition-all" />
            <span className="w-full h-[1.75px] bg-current rounded-full transition-all" />
          </div>
        </button>
      </div>

      {/* Exact Floating Navigation Card Popover from Reference */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-20 right-5 sm:right-8 z-50 w-[310px] sm:w-[360px] md:w-[390px] rounded-[26px] border border-black/25 bg-[#F8F2E3]/95 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] p-4 sm:p-5 flex flex-col gap-2.5 select-none"
            role="menu"
          >
            {/* 2-Column Pill Button Grid matching reference */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Row 1 */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenModal('candidates');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                FOR CANDIDATES
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/career');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-[#F0442D] text-white font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-black transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                CAREER HUB
              </button>

              {/* Row 2 */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenModal('recruiters');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                FOR RECRUITERS
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenModal('howItWorks');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                BENEFITS
              </button>

              {/* Row 3 */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenModal('colleges');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                FOR COLLEGES
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenModal('howItWorks');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                METHODOLOGY
              </button>

              {/* Row 4 */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenModal('howItWorks');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                BIAS SHIELD
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenModal('howItWorks');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                PLATFORM
              </button>

              {/* Row 5 */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenModal('colleges');
                }}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                HELP CENTRE
              </button>

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full py-2.5 sm:py-3 px-3 rounded-full border border-black/50 bg-white text-[#050505] font-jakarta font-bold text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] hover:bg-[#050505] hover:text-white transition-all text-center flex items-center justify-center shadow-2xs active:scale-95"
              >
                {user ? 'MY ACCOUNT' : 'SIGN IN'}
              </Link>
            </div>

            {/* Bottom Full-Width Solid Black Pill Button: ACCESS APP */}
            <button
              onClick={handleAccessApp}
              className="w-full mt-1 py-3.5 sm:py-4 rounded-full bg-[#050505] text-[#FFFFFF] font-jakarta font-extrabold text-xs sm:text-[13px] uppercase tracking-[0.1em] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm text-center"
            >
              ACCESS APP
            </button>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="text-[11px] text-center text-[#516254] hover:underline cursor-pointer pt-1"
              >
                Sign out of session
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

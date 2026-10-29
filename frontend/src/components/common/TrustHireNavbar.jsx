import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import TrustHireLogo from '../ui/TrustHireLogo';
import { ArrowRight, Menu, X, LogOut } from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function TrustHireNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainLinks = [
    { label: 'Companies', path: '/companies' },
    { label: 'Explore Jobs', path: '/jobs' },
    { label: 'Learn', path: '/learn' },
    { label: 'My Roadmap', path: '/career-roadmap' },
    { label: 'Skills', path: '/my-skills' },
    { label: 'Saved', path: '/saved-jobs' },
    { label: 'Tracker', path: '/application-tracker' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full p-2 sm:p-3 max-w-[1440px] mx-auto transition-all">
      <nav className="bg-white/95 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/5">
        
        {/* LEFT: Emblem Logo + Tobias TrustHire Wordmark + Nav Links */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <Link
            to="/"
            aria-label="TrustHire home"
            className="flex items-center justify-center pl-1 sm:pl-2 pr-1 py-1 hover:opacity-85 transition-opacity"
          >
            <TrustHireLogo
              symbolOnly={false}
              variant="dark"
              symbolSize="h-8 sm:h-9"
              textSize="text-lg sm:text-xl font-normal"
            />
          </Link>

          {/* Desktop Navigation Links with KokonutUI Matched Spring Pill */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#F0F0EE] border border-black/[0.04] relative">
            {mainLinks.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-150 select-none cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="global-navbar-active-pill"
                      className="absolute inset-0 bg-[#121613] rounded-full shadow-2xs pointer-events-none"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 38,
                        mass: 0.85,
                      }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT: User Controls & Theme */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3 shrink-0">
              {/* Profile Picture Only (Apple circular avatar button) */}
              <Link
                to="/career/profile"
                className="relative rounded-full ring-2 ring-black/[0.1] hover:ring-black/30 active:scale-95 transition-all focus:outline-none shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center overflow-hidden shadow-xs cursor-pointer"
                title="Your Profile"
                aria-label="Open your career profile"
              >
                <UserAvatar size="md" className="w-10 h-10 min-w-[40px] min-h-[40px] border-0" />
              </Link>

              {/* Sign Out Button (Apple UI/UX Showcase Style) */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.97] text-[#1d1d1f] hover:text-black text-xs font-medium border border-black/[0.08] shadow-2xs transition-all cursor-pointer shrink-0"
                title="Sign out of your account"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4 text-[#6e6e73]" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-[13px] font-medium text-gray-700 hover:text-black px-3 py-1.5 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-[#F0442D] hover:bg-[#d63823] text-white text-[13px] font-medium rounded-full pl-4 pr-3 py-1.5 transition-colors shadow-xs"
              >
                <span>Get started</span>
                <div className="w-5 h-5 rounded-full bg-white text-[#F0442D] flex items-center justify-center">
                  <ArrowRight size={11} strokeWidth={2.5} />
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE: Toggle button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 hover:bg-gray-200 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

      </nav>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 bg-white rounded-2xl p-5 shadow-xl border border-black/5 flex flex-col gap-3">
          {mainLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-black text-white' : 'text-gray-800 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <Link
                  to="/career/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 p-1 min-w-0"
                >
                  <UserAvatar size="md" className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-black/10 shadow-2xs shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f]">My Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 active:scale-95 text-[#1d1d1f] text-xs font-medium border border-black/[0.06] shadow-2xs transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#6e6e73]" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-medium text-gray-700 hover:text-black border border-gray-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-medium bg-[#F0442D] text-white rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

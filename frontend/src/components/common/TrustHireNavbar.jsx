import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TrustHireLogo from '../ui/TrustHireLogo';
import { ArrowRight, Menu, X, User } from 'lucide-react';

export default function TrustHireNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {mainLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:text-black hover:bg-gray-100/80'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* RIGHT: User Controls & Theme */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/career/profile"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-mono text-gray-800 transition-colors"
              >
                <User size={13} className="text-gray-600" />
                <span className="max-w-[160px] truncate">{user.email}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-xs font-mono text-rose-600 hover:underline px-2 cursor-pointer"
              >
                Sign Out
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
              <>
                <Link
                  to="/career/profile"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 px-3 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 rounded-xl text-xs font-mono"
                >
                  <User size={13} className="text-gray-600" />
                  <span className="truncate">{user.email}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2 text-center text-xs font-mono text-rose-600"
                >
                  Sign Out
                </button>
              </>
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

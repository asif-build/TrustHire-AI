"use client";

/**
 * @author: @kokonutui
 * @description: Avatar Picker - Interactive avatar selector with custom photo upload, presets, and shuffle
 * @version: 1.0.0
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Upload,
  Shuffle,
  Camera,
  Sparkles,
  User,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarOption {
  id: string;
  name: string;
  bgGradient: string;
  borderColor: string;
  svg: React.ReactNode;
}

// 8 Distinct, High-Quality SVG Presets (Apple/Minimal Tech Style)
export const DEFAULT_AVATARS: AvatarOption[] = [
  {
    id: "avatar-1",
    name: "Alex",
    bgGradient: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-500",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="url(#grad1)" />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="38" r="18" fill="#fed7aa" />
        <path d="M50 20c-11 0-19 7-19 18 0 2 .5 4 1 6 2-7 8-12 18-12s16 5 18 12c.5-2 1-4 1-6 0-11-8-18-19-18z" fill="#1e293b" />
        <circle cx="43" cy="38" r="2.5" fill="#1e293b" />
        <circle cx="57" cy="38" r="2.5" fill="#1e293b" />
        <path d="M46 45c2 2 6 2 8 0" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 88c0-15 12-28 28-28s28 13 28 28" fill="#f8fafc" />
        <path d="M36 60l14 14 14-14" fill="#3b82f6" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: "avatar-2",
    name: "Elena",
    bgGradient: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="url(#grad2)" />
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="40" r="17" fill="#fcd34d" />
        <path d="M30 42c0-12 9-22 20-22s20 10 20 22c0 8-3 16-6 22-2-12-6-16-14-16s-12 4-14 16c-3-6-6-14-6-22z" fill="#312e81" />
        <circle cx="44" cy="40" r="2.2" fill="#1e293b" />
        <circle cx="56" cy="40" r="2.2" fill="#1e293b" />
        <path d="M47 47c1.5 1.5 4.5 1.5 6 0" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 90c0-14 12-26 26-26s26 12 26 26" fill="#fdf2f8" />
      </svg>
    ),
  },
  {
    id: "avatar-3",
    name: "Jordan",
    bgGradient: "from-emerald-400 to-teal-600",
    borderColor: "border-emerald-500",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="url(#grad3)" />
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="38" r="17" fill="#fde047" />
        <path d="M32 30c2-8 10-12 18-12s16 4 18 12c-4-2-10-3-18-3s-14 1-18 3z" fill="#0f172a" />
        <rect x="36" y="34" width="11" height="8" rx="2" fill="none" stroke="#0f172a" strokeWidth="2" />
        <rect x="53" y="34" width="11" height="8" rx="2" fill="none" stroke="#0f172a" strokeWidth="2" />
        <line x1="47" y1="38" x2="53" y2="38" stroke="#0f172a" strokeWidth="2" />
        <path d="M46 47c2 1.5 6 1.5 8 0" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 88c0-15 12-28 28-28s28 13 28 28" fill="#134e4a" />
      </svg>
    ),
  },
  {
    id: "avatar-4",
    name: "Sam",
    bgGradient: "from-amber-400 to-orange-500",
    borderColor: "border-amber-500",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="url(#grad4)" />
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="38" r="18" fill="#fed7aa" />
        <path d="M33 28c4-6 10-9 17-9s13 3 17 9c-3 0-8-1-17-1s-14 1-17 1z" fill="#78350f" />
        <circle cx="43" cy="38" r="2.5" fill="#78350f" />
        <circle cx="57" cy="38" r="2.5" fill="#78350f" />
        <path d="M45 46c2.5 2 7.5 2 10 0" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 88c0-15 12-28 28-28s28 13 28 28" fill="#ffedd5" />
      </svg>
    ),
  },
  {
    id: "avatar-5",
    name: "Morgan",
    bgGradient: "from-rose-500 to-red-600",
    borderColor: "border-rose-500",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="url(#grad5)" />
        <defs>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="39" r="17" fill="#fbcfe8" />
        <path d="M31 34c2-9 11-15 19-15s17 6 19 15c-4-4-10-6-19-6s-15 2-19 6z" fill="#4c0519" />
        <circle cx="43" cy="39" r="2.2" fill="#4c0519" />
        <circle cx="57" cy="39" r="2.2" fill="#4c0519" />
        <path d="M46 46c2 1.5 6 1.5 8 0" stroke="#be123c" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 88c0-15 12-28 28-28s28 13 28 28" fill="#ffe4e6" />
      </svg>
    ),
  },
  {
    id: "avatar-6",
    name: "Kai",
    bgGradient: "from-cyan-400 to-blue-600",
    borderColor: "border-cyan-500",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="url(#grad6)" />
        <defs>
          <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="38" r="18" fill="#fef08a" />
        <path d="M30 35c3-11 12-16 20-16s17 5 20 16c-5-6-12-9-20-9s-15 3-20 9z" fill="#0369a1" />
        <circle cx="43" cy="38" r="2.5" fill="#0369a1" />
        <circle cx="57" cy="38" r="2.5" fill="#0369a1" />
        <path d="M46 46c2 1.5 6 1.5 8 0" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 88c0-15 12-28 28-28s28 13 28 28" fill="#e0f2fe" />
      </svg>
    ),
  },
  {
    id: "avatar-7",
    name: "Taylor",
    bgGradient: "from-violet-500 to-purple-800",
    borderColor: "border-violet-500",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="url(#grad7)" />
        <defs>
          <linearGradient id="grad7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="39" r="17" fill="#fed7aa" />
        <path d="M32 30c5-8 11-10 18-10s13 2 18 10c-5-2-11-2-18-2s-13 0-18 2z" fill="#2e1065" />
        <circle cx="44" cy="39" r="2.2" fill="#2e1065" />
        <circle cx="56" cy="39" r="2.2" fill="#2e1065" />
        <path d="M46 47c2 2 6 2 8 0" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 88c0-15 12-28 28-28s28 13 28 28" fill="#ede9fe" />
      </svg>
    ),
  },
  {
    id: "avatar-8",
    name: "River",
    bgGradient: "from-neutral-700 to-zinc-900",
    borderColor: "border-neutral-600",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="url(#grad8)" />
        <defs>
          <linearGradient id="grad8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="38" r="17" fill="#fde68a" />
        <path d="M34 26c4-5 10-7 16-7s12 2 16 7c-4 0-10-1-16-1s-12 1-16 1z" fill="#09090b" />
        <circle cx="44" cy="38" r="2.2" fill="#09090b" />
        <circle cx="56" cy="38" r="2.2" fill="#09090b" />
        <path d="M47 45c1.5 1 4.5 1 6 0" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 88c0-15 12-28 28-28s28 13 28 28" fill="#27272a" />
      </svg>
    ),
  },
];

export interface AvatarPickerProps {
  /** Initial or current avatar value (ID, base64 data URL, or image URL) */
  value?: string;
  /** Callback fired when an avatar is chosen or uploaded */
  onChange?: (avatar: {
    id: string;
    url?: string;
    type: "preset" | "custom";
    name?: string;
  }) => void;
  /** User's full name or handle for display */
  userName?: string;
  /** User's current professional title or role */
  userRole?: string;
  className?: string;
}

export function AvatarPicker({
  value,
  onChange,
  userName = "Alex Morgan",
  userRole = "Senior Engineer",
  className,
}: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected avatar from props, localStorage, or default
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (value) return value;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("trusthire_user_avatar_id");
      if (stored) return stored;
    }
    return DEFAULT_AVATARS[0].id;
  });

  const [customPhoto, setCustomPhoto] = useState<string | null>(() => {
    if (value && (value.startsWith("data:") || value.startsWith("http"))) {
      return value;
    }
    if (typeof window !== "undefined") {
      return localStorage.getItem("trusthire_user_custom_avatar") || null;
    }
    return null;
  });

  const [isShuffling, setIsShuffling] = useState(false);

  // Sync external value
  useEffect(() => {
    if (value) {
      if (value.startsWith("data:") || value.startsWith("http")) {
        setCustomPhoto(value);
        setSelectedId("custom");
      } else {
        setSelectedId(value);
      }
    }
  }, [value]);

  // Handle Preset Selection
  const handleSelectPreset = (avatar: AvatarOption) => {
    setSelectedId(avatar.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("trusthire_user_avatar_id", avatar.id);
    }
    onChange?.({
      id: avatar.id,
      type: "preset",
      name: avatar.name,
    });
  };

  // Handle Custom File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is larger than 5MB. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomPhoto(dataUrl);
      setSelectedId("custom");

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("trusthire_user_custom_avatar", dataUrl);
          localStorage.setItem("trusthire_user_avatar_id", "custom");
        } catch {
          // If quota exceeded, just keep in memory
        }
      }

      onChange?.({
        id: "custom",
        url: dataUrl,
        type: "custom",
        name: "Custom Picture",
      });
    };
    reader.readAsDataURL(file);
  };

  // Trigger file browser
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Shuffle Avatar
  const handleShuffle = () => {
    setIsShuffling(true);
    const available = DEFAULT_AVATARS.filter((a) => a.id !== selectedId);
    const randomIndex = Math.floor(Math.random() * available.length);
    const picked = available[randomIndex] || DEFAULT_AVATARS[0];

    setTimeout(() => {
      handleSelectPreset(picked);
      setIsShuffling(false);
    }, 200);
  };

  // Remove custom photo and revert to preset
  const handleRemoveCustom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPhoto(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("trusthire_user_custom_avatar");
    }
    handleSelectPreset(DEFAULT_AVATARS[0]);
  };

  const currentPreset = DEFAULT_AVATARS.find((a) => a.id === selectedId);

  return (
    <div
      className={cn(
        "bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-6",
        className
      )}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/[0.05]">
        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
            Profile Avatar & Photo
          </h2>
          <p className="text-xs text-[#86868b] mt-0.5">
            Choose an animated persona or upload your own professional headshot.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isShuffling}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] active:scale-95 text-[#1d1d1f] text-xs font-medium transition-all cursor-pointer border border-black/[0.04]"
            title="Randomize avatar"
          >
            <motion.span
              animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#515154]" />
            </motion.span>
            <span>Shuffle</span>
          </button>

          <button
            type="button"
            onClick={openFilePicker}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1d1d1f] hover:bg-black active:scale-95 text-white text-xs font-medium transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Main Preview Spotlight */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-5 rounded-2xl bg-[#fbfbfd] border border-black/[0.04]">
        {/* Large Avatar Badge */}
        <div className="relative group shrink-0">
          <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md border-3 border-white ring-2 ring-black/5 flex items-center justify-center bg-[#f5f5f7]">
            <AnimatePresence mode="wait">
              {selectedId === "custom" && customPhoto ? (
                <motion.img
                  key="custom-active"
                  src={customPhoto}
                  alt={userName}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full h-full object-cover"
                />
              ) : currentPreset ? (
                <motion.div
                  key={currentPreset.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="w-full h-full"
                >
                  {currentPreset.svg}
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                  <User className="w-10 h-10" />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Upload Hover Overlay */}
          <button
            type="button"
            onClick={openFilePicker}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium transition-opacity cursor-pointer backdrop-blur-2xs"
            title="Change photo"
          >
            <Camera className="w-5 h-5 mb-0.5" />
            <span>Change</span>
          </button>

          {/* Active Verified Tick */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Candidate Information Card */}
        <div className="text-center sm:text-left min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
              {userName}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0071e3]/10 text-[#0071e3]">
              <Sparkles className="w-3 h-3" />
              {selectedId === "custom" ? "Custom Headshot" : `Preset: ${currentPreset?.name || "Active"}`}
            </span>
          </div>
          <p className="text-xs text-[#86868b]">{userRole}</p>
          <p className="text-[11px] text-[#a1a1a6] pt-1">
            Visible on company job matches, applications, and your TrustHire profile.
          </p>
        </div>
      </div>

      {/* Grid of Avatars + Custom Photo Slot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#1d1d1f]">
            Choose an Avatar or Headshot
          </span>
          <span className="text-[11px] text-[#86868b]">
            8 illustrated styles available
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
          {/* Slot 1: Custom Photo Option */}
          <div className="relative group">
            <button
              type="button"
              onClick={customPhoto ? () => {
                setSelectedId("custom");
                onChange?.({
                  id: "custom",
                  url: customPhoto,
                  type: "custom",
                  name: "Custom Picture",
                });
              } : openFilePicker}
              className={cn(
                "w-full aspect-square rounded-2xl p-1 transition-all cursor-pointer flex flex-col items-center justify-center border relative overflow-hidden",
                selectedId === "custom"
                  ? "ring-2 ring-[#0071e3] border-transparent shadow-xs scale-105"
                  : "border-black/[0.08] hover:border-black/20 bg-[#f5f5f7]"
              )}
              title={customPhoto ? "Your Custom Photo" : "Upload your own photo"}
            >
              {customPhoto ? (
                <img
                  src={customPhoto}
                  alt="Custom"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#86868b] p-1 text-center">
                  <Camera className="w-5 h-5 mb-1 text-[#515154]" />
                  <span className="text-[9px] font-semibold text-[#1d1d1f] leading-none">
                    Upload
                  </span>
                </div>
              )}

              {/* Selection Checkmark */}
              {selectedId === "custom" && (
                <motion.div
                  layoutId="avatar-check"
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-xs"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </motion.div>
              )}
            </button>

            {/* Remove custom photo button */}
            {customPhoto && (
              <button
                type="button"
                onClick={handleRemoveCustom}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                title="Remove photo"
              >
                <X className="w-3 h-3 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Slots 2-9: Predefined Illustrated Avatars */}
          {DEFAULT_AVATARS.map((avatar) => {
            const isSelected = selectedId === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleSelectPreset(avatar)}
                className={cn(
                  "relative w-full aspect-square rounded-2xl p-1 transition-all cursor-pointer flex items-center justify-center border",
                  isSelected
                    ? "ring-2 ring-[#0071e3] border-transparent shadow-xs scale-105 bg-white"
                    : "border-black/[0.06] hover:border-black/20 bg-[#fbfbfd] hover:bg-white"
                )}
                title={avatar.name}
              >
                <div className="w-full h-full rounded-xl overflow-hidden">
                  {avatar.svg}
                </div>

                {/* Animated Selection Tick */}
                {isSelected && (
                  <motion.div
                    layoutId="avatar-check"
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AvatarPicker;

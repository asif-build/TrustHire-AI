import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Upload,
  Shuffle,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';
import {
  ILLUSTRATED_AVATARS,
  IllustratedAvatar,
  getAvatarById,
} from '../common/UserAvatar';

export interface AvatarSelectionValue {
  avatarType: 'illustrated' | 'uploaded';
  avatarId: string;
  customUrl?: string | null;
  name?: string;
}

export interface IllustratedAvatarGalleryProps {
  /** Initial or current avatar type ('illustrated' | 'uploaded') */
  avatarType?: 'illustrated' | 'uploaded';
  /** Current avatar ID ('avatar-01' .. 'avatar-09') */
  avatarId?: string;
  /** Custom photo data URL or HTTP URL */
  customUrl?: string | null;
  /** Callback fired immediately when avatar selection or upload changes */
  onChange?: (val: AvatarSelectionValue) => void;
  /** Async save callback if immediate persistence is desired */
  onSave?: (val: AvatarSelectionValue) => Promise<void>;
  /** Candidate name from profile */
  userName?: string;
  /** Professional headline from profile */
  userHeadline?: string;
  className?: string;
}

export function IllustratedAvatarGallery({
  avatarType = 'illustrated',
  avatarId = 'avatar-01',
  customUrl = null,
  onChange,
  onSave,
  userName = 'Candidate',
  userHeadline = 'Software Engineer',
  className = '',
}: IllustratedAvatarGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active working selection state
  const [activeType, setActiveType] = useState<'illustrated' | 'uploaded'>(avatarType);
  const [activeId, setActiveId] = useState<string>(() => {
    return avatarId && ILLUSTRATED_AVATARS.some((a) => a.id === avatarId)
      ? avatarId
      : 'avatar-01';
  });
  const [storedPhoto, setStoredPhoto] = useState<string | null>(customUrl || null);

  // UI state
  const [isShuffling, setIsShuffling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync external props if they change externally
  useEffect(() => {
    if (avatarType) setActiveType(avatarType);
    if (avatarId && ILLUSTRATED_AVATARS.some((a) => a.id === avatarId)) {
      setActiveId(avatarId);
    }
    if (customUrl) setStoredPhoto(customUrl);
  }, [avatarType, avatarId, customUrl]);

  const activeAvatar = getAvatarById(activeId);

  // Handle Illustrated Avatar Selection
  const handleSelectAvatar = async (avatar: IllustratedAvatar) => {
    const prevType = activeType;
    const prevId = activeId;

    setActiveType('illustrated');
    setActiveId(avatar.id);
    setStatusMessage(null);

    const payload: AvatarSelectionValue = {
      avatarType: 'illustrated',
      avatarId: avatar.id,
      customUrl: storedPhoto,
      name: avatar.name,
    };

    // Cache locally
    try {
      localStorage.setItem('trusthire_user_avatar_type', 'illustrated');
      localStorage.setItem('trusthire_user_avatar_id', avatar.id);
      window.dispatchEvent(new CustomEvent('trusthire:avatar-changed', { detail: payload }));
    } catch {
      // ignore
    }

    onChange?.(payload);

    if (onSave) {
      try {
        setIsSaving(true);
        await onSave(payload);
        setStatusMessage({ text: `Saved: ${avatar.name}`, type: 'success' });
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err) {
        // Revert on save failure
        setActiveType(prevType);
        setActiveId(prevId);
        setStatusMessage({ text: 'Unable to save avatar. Please try again.', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Handle Shuffle
  const handleShuffle = () => {
    setIsShuffling(true);
    const pool = ILLUSTRATED_AVATARS.filter((a) => a.id !== activeId || activeType === 'uploaded');
    const randomIndex = Math.floor(Math.random() * pool.length);
    const picked = pool[randomIndex] || ILLUSTRATED_AVATARS[0];

    setTimeout(() => {
      handleSelectAvatar(picked);
      setIsShuffling(false);
    }, 180);
  };

  // Handle Photo Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStatusMessage({
        text: 'Please choose a valid photo in JPEG, PNG, or WebP format.',
        type: 'error',
      });
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        text: 'Image exceeds 5MB. Please choose a smaller photo.',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const prevType = activeType;
      const prevPhoto = storedPhoto;

      setStoredPhoto(dataUrl);
      setActiveType('uploaded');
      setStatusMessage(null);

      const payload: AvatarSelectionValue = {
        avatarType: 'uploaded',
        avatarId: activeId,
        customUrl: dataUrl,
        name: 'Custom Headshot',
      };

      try {
        localStorage.setItem('trusthire_user_avatar_type', 'uploaded');
        localStorage.setItem('trusthire_user_custom_avatar', dataUrl);
        window.dispatchEvent(new CustomEvent('trusthire:avatar-changed', { detail: payload }));
      } catch {
        // ignore
      }

      onChange?.(payload);

      if (onSave) {
        try {
          setIsSaving(true);
          await onSave(payload);
          setStatusMessage({ text: 'Photo uploaded and saved.', type: 'success' });
          setTimeout(() => setStatusMessage(null), 3500);
        } catch {
          setActiveType(prevType);
          setStoredPhoto(prevPhoto);
          setStatusMessage({ text: 'Failed to upload photo. Please retry.', type: 'error' });
        } finally {
          setIsSaving(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Switch back to uploaded photo if one is stored
  const handleUseStoredPhoto = async () => {
    if (!storedPhoto) {
      fileInputRef.current?.click();
      return;
    }
    setActiveType('uploaded');
    const payload: AvatarSelectionValue = {
      avatarType: 'uploaded',
      avatarId: activeId,
      customUrl: storedPhoto,
      name: 'Custom Headshot',
    };
    try {
      localStorage.setItem('trusthire_user_avatar_type', 'uploaded');
      window.dispatchEvent(new CustomEvent('trusthire:avatar-changed', { detail: payload }));
    } catch {
      // ignore
    }
    onChange?.(payload);
    if (onSave) {
      try {
        setIsSaving(true);
        await onSave(payload);
        setStatusMessage({ text: 'Switched to your photo.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 3000);
      } catch {
        setStatusMessage({ text: 'Failed to save preference.', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <section
      aria-labelledby="avatar-gallery-heading"
      className={`bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 ${className}`}
    >
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
        id="avatar-photo-file-input"
        aria-label="Upload profile photo file"
      />

      {/* 1. Header with Required Title, Copy, and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <h2
            id="avatar-gallery-heading"
            className="text-base font-semibold text-[#1d1d1f] tracking-tight"
          >
            Your profile, your style
          </h2>
          <p className="text-xs text-[#86868b] mt-0.5">
            Choose an illustrated persona or upload your own professional photo.
          </p>
        </div>

        {/* Top Actions: Shuffle & Upload Photo */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isShuffling || isSaving}
            aria-label="Shuffle: select a random illustrated avatar"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f5f5f7] hover:bg-[#ebebee] active:scale-95 text-[#1d1d1f] text-xs font-medium transition-all cursor-pointer border border-black/[0.04] disabled:opacity-50"
            title="Randomize illustrated avatar"
          >
            <Shuffle
              className={`w-3.5 h-3.5 text-[#515154] ${isShuffling ? 'animate-spin' : ''}`}
            />
            <span>Shuffle</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            aria-label="Upload photo: choose an image file from your device"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1d1d1f] hover:bg-black active:scale-95 text-white text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Status Notice / Feedback Banner */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2. Selected-Avatar Preview Spotlight */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05]">
        {/* Large Avatar Badge */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-2 border-black/10 shadow-sm flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeType === 'uploaded' && storedPhoto ? (
                <motion.img
                  key="uploaded-photo"
                  src={storedPhoto}
                  alt={`${userName}'s uploaded photo`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <motion.img
                  key={activeAvatar.id}
                  src={activeAvatar.src}
                  alt={activeAvatar.alt}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Quick-Change Photo Overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium transition-opacity cursor-pointer backdrop-blur-2xs"
            title="Upload new headshot"
            aria-label="Upload new headshot image"
          >
            <Camera className="w-4 h-4 mb-0.5" />
            <span>Change</span>
          </button>

          {/* Selected State Indicator Pill */}
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#121613] text-white flex items-center justify-center border-2 border-white shadow-2xs"
            title="Selected active avatar"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* User Profile Details Preview */}
        <div className="text-center sm:text-left min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight">
              {userName}
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.04]">
              {isSaving ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : activeType === 'uploaded' ? (
                <>
                  <Camera className="w-2.5 h-2.5 text-[#515154]" />
                  <span>Custom Headshot</span>
                </>
              ) : (
                <>
                  <span>Persona #{activeAvatar.number}</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-[#515154] leading-relaxed">
            {userHeadline || 'Candidate'}
          </p>

          <p className="text-[11px] text-[#86868b] pt-0.5">
            {activeType === 'uploaded'
              ? 'Using your uploaded custom photo. Click any persona below to switch.'
              : `${activeAvatar.description}.`}
          </p>

          {/* If user previously uploaded a photo, provide quick 1-click restore */}
          {storedPhoto && activeType === 'illustrated' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleUseStoredPhoto}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1d1d1f] hover:underline cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#515154]" />
                <span>Switch back to my uploaded photo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. 3x3 Grid Avatar Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#1d1d1f]">
            Illustrated Personas (9 Collection)
          </span>
          <span className="text-[11px] text-[#86868b]">
            3×3 Reference Gallery
          </span>
        </div>

        {/* Grid: 3 cols on desktop, 3 on tablet, 2-3 on mobile */}
        <div
          role="radiogroup"
          aria-label="Choose an illustrated avatar persona"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {ILLUSTRATED_AVATARS.map((avatar) => {
            const isSelected = activeType === 'illustrated' && activeId === avatar.id;

            return (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={avatar.alt}
                onClick={() => handleSelectAvatar(avatar)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectAvatar(avatar);
                  }
                }}
                className={`group relative flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white transition-all cursor-pointer select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                  isSelected
                    ? 'ring-2 ring-[#121613] border-transparent shadow-sm bg-[#fbfbfd]'
                    : 'border border-black/[0.08] hover:border-black/25 hover:bg-[#fbfbfd]/70'
                }`}
              >
                {/* Square Avatar Illustration Container */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={avatar.src}
                    alt={avatar.alt}
                    loading="lazy"
                    className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-200 group-hover:scale-[1.03]"
                  />

                  {/* Selected check pill */}
                  {isSelected && (
                    <motion.div
                      layoutId="gallery-check-pill"
                      className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-[#121613] text-white flex items-center justify-center shadow-xs z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </motion.div>
                  )}
                </div>

                {/* Subtitle / Caption */}
                <div className="w-full mt-2 text-center">
                  <p className="text-[11px] font-semibold text-[#1d1d1f] truncate">
                    {avatar.name}
                  </p>
                  <p className="text-[10px] text-[#86868b] truncate">
                    Avatar {avatar.number}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default IllustratedAvatarGallery;

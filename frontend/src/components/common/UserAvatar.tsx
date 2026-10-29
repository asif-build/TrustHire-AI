import React, { useState, useEffect } from 'react';

export interface IllustratedAvatar {
  id: string;
  number: number;
  name: string;
  description: string;
  src: string;
  alt: string;
}

export const ILLUSTRATED_AVATARS: IllustratedAvatar[] = [
  {
    id: 'avatar-01',
    number: 1,
    name: 'Blonde Ponytail',
    description: 'Blonde character with a ponytail, white shirt, and thumbs-up gesture',
    src: '/avatars/avatar-01.png',
    alt: 'Illustrated avatar 1: Blonde character with a ponytail, white shirt, and thumbs-up gesture',
  },
  {
    id: 'avatar-02',
    number: 2,
    name: 'Glasses & Choker',
    description: 'Black-haired character with round glasses, a black jacket, and yellow accessories',
    src: '/avatars/avatar-02.png',
    alt: 'Illustrated avatar 2: Black-haired character with round glasses, a black jacket, and yellow accessories',
  },
  {
    id: 'avatar-03',
    number: 3,
    name: 'White Hoodie',
    description: 'Short black-haired character wearing a white hoodie',
    src: '/avatars/avatar-03.png',
    alt: 'Illustrated avatar 3: Short black-haired character wearing a white hoodie',
  },
  {
    id: 'avatar-04',
    number: 4,
    name: 'Black Shirt Thumbs-Up',
    description: 'Short-haired character wearing a black shirt and giving a thumbs-up',
    src: '/avatars/avatar-04.png',
    alt: 'Illustrated avatar 4: Short-haired character wearing a black shirt and giving a thumbs-up',
  },
  {
    id: 'avatar-05',
    number: 5,
    name: 'Yellow Cap',
    description: 'Blonde character wearing a backward yellow cap and yellow shirt',
    src: '/avatars/avatar-05.png',
    alt: 'Illustrated avatar 5: Blonde character wearing a backward yellow cap and yellow shirt',
  },
  {
    id: 'avatar-06',
    number: 6,
    name: 'Peace Gesture',
    description: 'Black-haired character wearing a black shirt and making a friendly hand gesture',
    src: '/avatars/avatar-06.png',
    alt: 'Illustrated avatar 6: Black-haired character wearing a black shirt and making a friendly hand gesture',
  },
  {
    id: 'avatar-07',
    number: 7,
    name: 'Blue Shirt',
    description: 'Black-haired character wearing a blue shirt',
    src: '/avatars/avatar-07.png',
    alt: 'Illustrated avatar 7: Black-haired character wearing a blue shirt',
  },
  {
    id: 'avatar-08',
    number: 8,
    name: 'Red Shirt',
    description: 'Light-haired character wearing a red shirt',
    src: '/avatars/avatar-08.png',
    alt: 'Illustrated avatar 8: Light-haired character wearing a red shirt',
  },
  {
    id: 'avatar-09',
    number: 9,
    name: 'Yellow Blazer',
    description: 'Dark-haired character wearing a yellow blazer over a white shirt',
    src: '/avatars/avatar-09.png',
    alt: 'Illustrated avatar 9: Dark-haired character wearing a yellow blazer over a white shirt',
  },
];

export function getAvatarById(id?: string | null): IllustratedAvatar {
  if (!id) return ILLUSTRATED_AVATARS[0];
  const found = ILLUSTRATED_AVATARS.find((a) => a.id === id);
  return found || ILLUSTRATED_AVATARS[0];
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
  '3xl': 'w-48 h-48 sm:w-56 sm:h-56',
  full: 'w-full h-full',
};

export interface UserAvatarProps {
  avatarType?: 'illustrated' | 'uploaded' | string;
  avatarId?: string | null;
  customUrl?: string | null;
  name?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export function UserAvatar({
  avatarType,
  avatarId,
  customUrl,
  name = 'Candidate',
  size = 'md',
  className = '',
  imgClassName = '',
  alt,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Local storage state fallbacks with reactive cross-component sync
  const [syncedState, setSyncedState] = useState(() => {
    if (typeof window === 'undefined') {
      return { type: 'illustrated', id: 'avatar-01', custom: null };
    }
    return {
      type: localStorage.getItem('trusthire_user_avatar_type') || 'illustrated',
      id: localStorage.getItem('trusthire_user_avatar_id') || 'avatar-01',
      custom: localStorage.getItem('trusthire_user_custom_avatar') || null,
    };
  });

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setSyncedState({
          type: detail.avatarType || 'illustrated',
          id: detail.avatarId || 'avatar-01',
          custom: detail.customUrl || null,
        });
      }
    };
    window.addEventListener('trusthire:avatar-changed', handleAvatarUpdate);
    return () => window.removeEventListener('trusthire:avatar-changed', handleAvatarUpdate);
  }, []);

  const effectiveType = avatarType !== undefined ? avatarType : syncedState.type;
  const effectiveId = avatarId !== undefined ? avatarId : syncedState.id;
  const effectiveCustom = customUrl !== undefined ? customUrl : syncedState.custom;

  const activePreset = getAvatarById(effectiveId);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const showCustom = effectiveType === 'uploaded' && effectiveCustom && !imgError;
  const imageSource = showCustom ? effectiveCustom : activePreset.src;
  const imageAlt = alt || (showCustom ? `${name}'s profile photo` : activePreset.alt);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-white border border-black/10 select-none ${sizeClass} ${className}`}
    >
      <img
        src={imageSource}
        alt={imageAlt}
        onError={() => setImgError(true)}
        loading="lazy"
        className={`w-full h-full object-cover object-center pointer-events-none ${imgClassName}`}
      />
    </div>
  );
}

export default UserAvatar;

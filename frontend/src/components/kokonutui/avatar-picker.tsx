import React from 'react';
import {
  IllustratedAvatarGallery,
  IllustratedAvatarGalleryProps,
  AvatarSelectionValue,
} from '../profile/IllustratedAvatarGallery';
import {
  ILLUSTRATED_AVATARS,
  IllustratedAvatar,
  getAvatarById,
} from '../common/UserAvatar';

export {
  IllustratedAvatarGallery,
  ILLUSTRATED_AVATARS,
  getAvatarById,
};
export type {
  IllustratedAvatarGalleryProps,
  AvatarSelectionValue,
  IllustratedAvatar,
};

// Backward-compatible alias for existing imports
export const DEFAULT_AVATARS = ILLUSTRATED_AVATARS;

export interface AvatarPickerProps {
  value?: string;
  avatarType?: 'illustrated' | 'uploaded';
  onChange?: (val: {
    id: string;
    url?: string | null;
    type: 'preset' | 'custom' | 'illustrated' | 'uploaded';
    name?: string;
  }) => void;
  onSave?: (val: AvatarSelectionValue) => Promise<void>;
  userName?: string;
  userRole?: string;
  className?: string;
}

export function AvatarPicker({
  value,
  avatarType,
  onChange,
  onSave,
  userName = 'Alex Morgan',
  userRole = 'Senior Software Engineer',
  className = '',
}: AvatarPickerProps) {
  const isCustomUrl = value && (value.startsWith('data:') || value.startsWith('http'));
  const resolvedType = avatarType || (isCustomUrl ? 'uploaded' : 'illustrated');
  const resolvedId = isCustomUrl ? 'avatar-01' : (value || 'avatar-01');
  const resolvedCustomUrl = isCustomUrl ? value : null;

  return (
    <IllustratedAvatarGallery
      avatarType={resolvedType}
      avatarId={resolvedId}
      customUrl={resolvedCustomUrl}
      userName={userName}
      userHeadline={userRole}
      onChange={(selected) => {
        onChange?.({
          id: selected.avatarId,
          url: selected.customUrl,
          type: selected.avatarType,
          name: selected.name,
        });
      }}
      onSave={onSave}
      className={className}
    />
  );
}

export default AvatarPicker;

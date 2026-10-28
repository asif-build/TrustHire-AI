import React from 'react';

export type TrustHireLogoProps = {
  variant?: 'dark' | 'white';
  className?: string;
  symbolOnly?: boolean;
  textSize?: string;
  symbolSize?: string;
};

/**
 * TrustHireLogo
 * Preserves the exact radial floral emblem while rendering "TrustHire" in Bodoni Moda
 * with letter-spacing: -0.045em and line-height: 0.98 as requested.
 */
export default function TrustHireLogo({
  variant = 'dark',
  className = '',
  symbolOnly = false,
  textSize = 'text-xl sm:text-[23px]',
  symbolSize = 'h-8 sm:h-9',
}: TrustHireLogoProps) {
  const symbolSrc = variant === 'white' 
    ? '/brand/trusthire-symbol-white.svg' 
    : '/brand/trusthire-symbol.svg';

  if (symbolOnly) {
    return (
      <img
        src={symbolSrc}
        alt="TrustHire Emblem"
        width={36}
        height={36}
        loading="eager"
        className={`object-contain transition-opacity duration-200 shrink-0 ${symbolSize} ${className}`}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      <img
        src={symbolSrc}
        alt="TrustHire Emblem"
        width={36}
        height={36}
        loading="eager"
        className={`object-contain shrink-0 ${symbolSize}`}
      />
      <span
        className={`font-bodoni font-normal tracking-[-0.02em] select-none ${textSize} ${
          variant === 'white' ? 'text-white' : 'text-[#121613]'
        }`}
        style={{
          fontFamily: "'Tobias', 'Bodoni Moda', Georgia, serif",
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          fontWeight: 450,
          fontVariationSettings: "'opsz' 16, 'wght' 450",
          fontOpticalSizing: 'none'
        }}
      >
        TrustHire
      </span>
    </div>
  );
}

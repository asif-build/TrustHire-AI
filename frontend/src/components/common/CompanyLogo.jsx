import React, { useState, useEffect } from 'react';
import { BRAND_COMPONENTS, resolveCompanyDomain } from '../../utils/companyLogos';

/**
 * CompanyLogo
 * Displays verified, genuine corporate logos with crisp dimensions and aspect-ratio preservation.
 * 
 * Order of resolution:
 * 1. Explicit verified logo_url if provided.
 * 2. High-resolution 128px corporate Favicon directly from the canonical corporate domain.
 * 3. Logo.dev authentic asset endpoint.
 * 4. Unavatar authentic corporate asset endpoint.
 * 5. Authentic vector mark (BRAND_COMPONENTS) if image CDNs fail.
 * 6. Refined, Apple-inspired typography monogram badge.
 */
export default function CompanyLogo({
  company,
  name,
  domain,
  logoUrl,
  className = '',
  size = 'w-11 h-11',
  imgSize = 'w-7 h-7'
}) {
  const companyName = name || company?.company_name || company?.canonical_name || 'Company';
  const canonicalDomain = resolveCompanyDomain(company, companyName, domain);
  const slug = (company?.slug || '').toLowerCase().trim();

  // Curated vector fallback if available
  const VectorLogo = (canonicalDomain && BRAND_COMPONENTS[canonicalDomain]) || (slug && BRAND_COMPONENTS[slug]);

  // Construct candidates list in priority order
  const candidates = [];
  
  const explicitUrl = logoUrl || company?.logo_url;
  if (explicitUrl && typeof explicitUrl === 'string' && explicitUrl.startsWith('http')) {
    candidates.push(explicitUrl);
  }

  if (canonicalDomain) {
    // 1. Google Favicon V2 128px high-res endpoint
    candidates.push(`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${canonicalDomain}&size=128`);
    // 2. Logo.dev fallback
    candidates.push(`https://img.logo.dev/${canonicalDomain}?token=pk_anonymous`);
    // 3. Unavatar fallback
    candidates.push(`https://unavatar.io/${canonicalDomain}?fallback=false`);
  }

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setHasError(false);
  }, [canonicalDomain, logoUrl, company?.logo_url, slug, name]);

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  // Generate clean 1-2 character neutral monogram
  const initials = companyName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('') || companyName.slice(0, 2).toUpperCase();

  const currentImageSrc = !hasError && candidates.length > 0 ? candidates[candidateIndex] : null;

  return (
    <div
      className={`shrink-0 ${size} rounded-2xl bg-white border border-[#EAEAE5] shadow-xs flex items-center justify-center p-2 overflow-hidden transition-all ${className}`}
    >
      {currentImageSrc ? (
        <img
          src={currentImageSrc}
          alt={`${companyName} official logo`}
          loading="eager"
          onError={handleError}
          className="w-full h-full object-contain transition-opacity duration-200"
        />
      ) : VectorLogo ? (
        <div className="w-full h-full flex items-center justify-center">
          <VectorLogo className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="w-full h-full rounded-xl bg-[#F4F4F0] flex items-center justify-center select-none">
          <span className="font-sans text-xs sm:text-sm font-semibold text-[#121613] tracking-tight">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

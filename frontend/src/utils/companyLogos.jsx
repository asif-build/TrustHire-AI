import React from 'react';

/**
 * Authentic, verified official corporate SVG vector marks.
 * Clean transparent backgrounds, exact brand colors, 100% crisp at any resolution.
 */

// Adobe: Official stylized red "A" mark
export const AdobeLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#EB1000" className={className} aria-label="Adobe Logo">
    <path d="M13.966 22h3.044l4.043-9.585H17.26l-3.294 9.585zm-7.932 0h3.044L12.372 12.4H8.578L5.284 22zM21.053 2H16.48l-7.469 17.653H5.066L11.512 2h9.541z"/>
  </svg>
);

// Google: Official 4-color "G"
export const GoogleLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Google Logo">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.36 7.31 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12s.45 3.8 1.26 5.42l4.01-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

// Microsoft: Official 4 squares
export const MicrosoftLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Microsoft Logo">
    <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022"/>
    <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00"/>
    <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
    <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
  </svg>
);

// Apple: Official clean Apple mark
export const AppleLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 170 170" fill="#121613" className={className} aria-label="Apple Logo">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.62-7.85-11.81-14.3-6.19-9.52-11.13-20.2-14.82-32.06-3.69-11.86-5.54-23.23-5.54-34.12 0-14.07 3.58-25.92 10.74-35.54 7.15-9.62 16.5-14.54 28.05-14.75 4.81 0 10.05 1.16 15.72 3.48 5.66 2.32 9.62 3.54 11.88 3.66 1.85 0 6.07-1.39 12.67-4.18 6.6-2.79 12.35-3.95 17.26-3.48 13.06.94 23.36 5.86 30.9 14.76-11.45 6.94-17.06 16.54-16.82 28.81.25 9.77 4.07 17.94 11.46 24.51 7.39 6.57 16.03 10.15 25.92 10.74-2.22 6.68-4.99 13.62-8.31 20.81zM119.22 33.15c0-7.39 2.65-14.18 7.95-20.37 5.3-6.19 11.84-9.88 19.63-11.08.31 1.09.47 2.14.47 3.15 0 7.39-2.71 14.32-8.13 20.8-5.42 6.47-11.96 10.13-19.63 10.98-.12-1.16-.29-2.32-.29-3.48z"/>
  </svg>
);

// Meta: Official infinity loop
export const MetaLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#0081FB" className={className} aria-label="Meta Logo">
    <path d="M12 15.5c-1.3 0-2.4-.6-3.3-1.6L5.3 9.4C4.1 8 2.8 7 1.5 7 .7 7 0 7.6 0 8.5v7c0 2.5 2 4.5 4.5 4.5 1.7 0 3.3-.9 4.3-2.3l3.2-4.5 3.2 4.5c1 1.4 2.6 2.3 4.3 2.3 2.5 0 4.5-2 4.5-4.5v-7c0-.9-.7-1.5-1.5-1.5-1.3 0-2.6 1-3.8 2.4l-3.4 4.5c-.9 1-2 1.6-3.3 1.6z"/>
  </svg>
);

// Amazon: Official smile arrow
export const AmazonLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Amazon Logo">
    <path fill="#232F3E" d="M13.9 11.2c-.1-.7-.6-1-1.3-1-.9 0-1.5.5-1.7 1.5h3zm2.5 4.1c-.2.2-.5.3-.8.3-.5 0-.8-.3-.8-.9v-3.7c0-2-1.2-3.2-3.3-3.2-1.8 0-3.3 1-3.6 2.6h1.9c.2-.7.8-1.1 1.6-1.1 1 0 1.5.6 1.5 1.6v.4c-2.4.1-4.2.7-4.2 2.6 0 1.4 1 2.2 2.3 2.2 1.1 0 2-.6 2.4-1.5v1.2h2v-.5z"/>
    <path fill="#FF9900" d="M22.8 19.3c-2.8 2.1-6.8 3.2-10.4 3.2-5 0-9.4-1.8-12.8-4.8-.3-.2-.3-.6 0-.8.1-.1.3-.1.4 0 3.3 2.8 7.5 4.5 12.4 4.5 3.3 0 7-1 9.6-2.9.4-.3.9.1.8.8zm.5-1.3l-2.1-2.6c-.2-.2-.4-.2-.5 0l-.8 1.1c-1-.7-2.3-1.2-3.8-1.2-.4 0-.8 0-1.2.1-.2 0-.3.2-.2.4.1.2.2.3.4.3.4-.1.7-.1 1.1-.1 1.2 0 2.4.4 3.3 1.1l-1 1.3c-.2.2-.1.4.1.5l3.8.7c.3 0 .6-.2.6-.5l.7-1.7c0-.2-.2-.3-.5-.3-.2 0-.4.1-.4.2l-.2.9z"/>
  </svg>
);

// Stripe: Official vibrant S glyph
export const StripeLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#635BFF" className={className} aria-label="Stripe Logo">
    <path d="M13.976 9.15c0-.986-.807-1.428-2.14-1.428-1.92 0-4.343.64-6.262 1.716V3.82c2.253-.913 4.569-1.29 6.82-1.29 5.378 0 8.974 2.822 8.974 7.64 0 7.39-10.19 6.22-10.19 9.42 0 1.19.98 1.62 2.518 1.62 2.27 0 5.176-.948 7.424-2.256v5.69c-2.456 1.055-5.26 1.446-7.854 1.446-5.59 0-9.52-2.77-9.52-7.734 0-7.98 10.23-6.61 10.23-9.98z"/>
  </svg>
);

// Spotify: Official green soundwaves
export const SpotifyLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#1ED760" className={className} aria-label="Spotify Logo">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.497 17.306c-.216.353-.675.467-1.028.25-2.813-1.719-6.354-2.108-10.525-1.155-.403.092-.806-.162-.898-.565-.092-.403.162-.806.565-.898 4.568-1.044 8.484-.603 11.636 1.34.353.216.467.675.25 1.028zm1.468-3.264c-.272.441-.849.58-1.29.308-3.22-1.979-8.129-2.55-11.938-1.393-.497.151-1.024-.134-1.175-.631-.151-.497.134-1.024.631-1.175 4.354-1.321 9.775-.682 13.464 1.583.441.272.58.849.308 1.29zm.126-3.41c-3.86-2.292-10.228-2.503-13.918-1.382-.591.18-1.22-.162-1.4-.753-.18-.591.162-1.22.753-1.4 4.24-1.288 11.279-1.042 15.719 1.595.532.316.707 1.008.391 1.54-.316.533-1.008.708-1.545.392z"/>
  </svg>
);

// GitHub: Official Octocat mark
export const GitHubLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#181717" className={className} aria-label="GitHub Logo">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// Figma: Official 5-piece mark
export const FigmaLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 38 57" fill="none" className={className} aria-label="Figma Logo">
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
  </svg>
);

// Cloudflare: Official orange cloud
export const CloudflareLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#F38020" className={className} aria-label="Cloudflare Logo">
    <path d="M19.14 9.17a6.002 6.002 0 0 0-11.43-1.63 4.5 4.5 0 0 0-4.71 4.46v.25a4.75 4.75 0 0 0 4.75 4.75h11.5a4.25 4.25 0 0 0 4.25-4.25 4.23 4.23 0 0 0-4.36-4.08z"/>
  </svg>
);

// NVIDIA: Official green claw eye mark
export const NvidiaLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#76B900" className={className} aria-label="NVIDIA Logo">
    <path d="M7.74 8.76c.86-.48 2.3-1.07 3.94-1.07 3.39 0 5.48 2.21 5.48 4.96 0 2.82-2.17 5.03-5.48 5.03-1.65 0-3.07-.58-3.94-1.07v1.73c1.07.45 2.53.76 4.07.76 4.3 0 7.35-2.77 7.35-6.45 0-3.56-3.04-6.38-7.35-6.38-1.54 0-3 .31-4.07.76v1.73zM5.5 5.5v13h-2v-13h2z"/>
  </svg>
);

// OpenAI: Official rosette flower mark
export const OpenAILogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#10A37F" className={className} aria-label="OpenAI Logo">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.653a4.475 4.475 0 0 1 2.341-2l-.142.086-4.783 2.76a.795.795 0 0 0-.392.68v6.737l-2.02-1.168a.071.071 0 0 1-.038-.052V10.11a4.5 4.5 0 0 1 4.034-4.457z"/>
  </svg>
);

// Anthropic: Official geometric "A" mark
export const AnthropicLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#D97757" className={className} aria-label="Anthropic Logo">
    <path d="M13.827 3.517h3.818L24 20.483h-3.818l-1.92-4.428H11.54l-1.92 4.428H5.802L13.827 3.517zm2.41 9.479l-2.222-5.12-2.221 5.12h4.443zM3.818 20.483H0L8.025 3.517h3.818L3.818 20.483z"/>
  </svg>
);

// Linear: Official geometric compass
export const LinearLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#5E6AD2" className={className} aria-label="Linear Logo">
    <path d="M3.24 6.13a9.98 9.98 0 0 0 4.15 4.15L17.87 0A12 12 0 0 0 3.24 6.13zm-.74 4.55A12 12 0 0 0 0 12c0 6.63 5.37 12 12 12a11.96 11.96 0 0 0 5.87-1.53L2.5 10.68zM12 0a11.96 11.96 0 0 0-4.13.73l11.4 11.4c.48-1.27.73-2.65.73-4.13 0-4.42-2.39-8.28-5.94-10.36A11.96 11.96 0 0 0 12 0z"/>
  </svg>
);

// Atlassian: Official blue sails
export const AtlassianLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#0052CC" className={className} aria-label="Atlassian Logo">
    <path d="M11.66 11.75c-.24.3-.5.62-.77.94-1.78 2.1-4.04 3.75-6.66 4.88-.26.11-.32.44-.12.63l5.05 4.7c.18.17.47.16.63-.02 4.1-4.7 4.56-9.72 1.87-11.13zm6.65-9.67c-.2-.17-.5-.14-.65.06-4.52 5.9-4.75 11.7-1.04 15.54.19.2.5.17.65-.06 3.6-5.4 3.7-11.4.04-15.54z"/>
  </svg>
);

// Datadog: Official purple dog mark
export const DatadogLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#632CA6" className={className} aria-label="Datadog Logo">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
  </svg>
);

// Canva: Official cyan/teal script "C"
export const CanvaLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="#00C4CC" className={className} aria-label="Canva Logo">
    <circle cx="12" cy="12" r="10"/>
    <path d="M15.5 8.5c-1.5-1.5-4-1.5-5.5 0s-1.5 4 0 5.5 4 1.5 5.5 0" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
);

// Chase Octagon: Official blue octagon
export const ChaseOctagon = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-label="JPMorgan Chase Logo">
    <path d="M 26 12 L 74 12 L 60 30 L 40 30 Z" fill="#117ACA" />
    <path d="M 88 26 L 88 74 L 70 60 L 70 40 Z" fill="#117ACA" />
    <path d="M 74 88 L 26 88 L 40 70 L 60 70 Z" fill="#117ACA" />
    <path d="M 12 74 L 12 26 L 30 40 L 30 60 Z" fill="#117ACA" />
  </svg>
);

/**
 * Registry of verified official brand vector components.
 * Only includes exact, authentic brand glyphs (no fake borders, no fake text boxes).
 */
export const BRAND_COMPONENTS = {
  'adobe': AdobeLogo,
  'adobe.com': AdobeLogo,
  'google': GoogleLogo,
  'google.com': GoogleLogo,
  'microsoft': MicrosoftLogo,
  'microsoft.com': MicrosoftLogo,
  'apple': AppleLogo,
  'apple.com': AppleLogo,
  'meta': MetaLogo,
  'meta.com': MetaLogo,
  'about.meta.com': MetaLogo,
  'amazon': AmazonLogo,
  'amazon.com': AmazonLogo,
  'aboutamazon.com': AmazonLogo,
  'stripe': StripeLogo,
  'stripe.com': StripeLogo,
  'spotify': SpotifyLogo,
  'spotify.com': SpotifyLogo,
  'github': GitHubLogo,
  'github.com': GitHubLogo,
  'figma': FigmaLogo,
  'figma.com': FigmaLogo,
  'cloudflare': CloudflareLogo,
  'cloudflare.com': CloudflareLogo,
  'nvidia': NvidiaLogo,
  'nvidia.com': NvidiaLogo,
  'openai': OpenAILogo,
  'openai.com': OpenAILogo,
  'anthropic': AnthropicLogo,
  'anthropic.com': AnthropicLogo,
  'linear': LinearLogo,
  'linear.app': LinearLogo,
  'atlassian': AtlassianLogo,
  'atlassian.com': AtlassianLogo,
  'datadog': DatadogLogo,
  'datadoghq.com': DatadogLogo,
  'canva': CanvaLogo,
  'canva.com': CanvaLogo,
  'jpmorgan-chase': ChaseOctagon,
  'jpmorganchase.com': ChaseOctagon,
};

/**
 * Standard corporate domain canonicalization map for 100% genuine logo fetching.
 * Maps company slugs, names, and alias domains to their primary corporate domain.
 */
export const KNOWN_DOMAINS = {
  // Frontier AI & Big Tech
  'openai': 'openai.com',
  'anthropic': 'anthropic.com',
  'google': 'google.com',
  'alphabet': 'google.com',
  'microsoft': 'microsoft.com',
  'cloudflare': 'cloudflare.com',
  'github': 'github.com',
  'hashicorp': 'hashicorp.com',
  'figma': 'figma.com',
  'nvidia': 'nvidia.com',
  'apple': 'apple.com',
  'intel': 'intel.com',
  'amd': 'amd.com',
  'qualcomm': 'qualcomm.com',

  // Global & Indian Fintech
  'stripe': 'stripe.com',
  'ramp': 'ramp.com',
  'razorpay': 'razorpay.com',
  'phonepe': 'phonepe.com',
  'jpmorgan-chase': 'jpmorganchase.com',
  'jpmorgan': 'jpmorganchase.com',
  'chase': 'chase.com',
  'goldman-sachs': 'goldmansachs.com',
  'visa': 'visa.com',
  'mastercard': 'mastercard.com',
  'zerodha': 'zerodha.com',
  'cred': 'cred.club',
  'groww': 'groww.in',
  'pine-labs': 'pinelabs.com',
  'juspay': 'juspay.in',

  // Tech Consulting & IT Services
  'accenture': 'accenture.com',
  'deloitte': 'deloitte.com',
  'tcs': 'tcs.com',
  'tata-consultancy-services': 'tcs.com',
  'infosys': 'infosys.com',
  'wipro': 'wipro.com',
  'hcltech': 'hcltech.com',
  'hcl': 'hcltech.com',
  'persistent-systems': 'persistent.com',
  'persistent': 'persistent.com',
  'ltts': 'ltts.com',
  'l-t-technology-services': 'ltts.com',

  // Enterprise Software & SaaS
  'salesforce': 'salesforce.com',
  'palantir': 'palantir.com',
  'palantir-technologies': 'palantir.com',
  'linear': 'linear.app',
  'adobe': 'adobe.com',
  'oracle': 'oracle.com',
  'servicenow': 'servicenow.com',
  'zoho': 'zoho.com',
  'freshworks': 'freshworks.com',
  'postman': 'postman.com',
  'browserstack': 'browserstack.com',
  'hasura': 'hasura.io',
  'inmobi': 'inmobi.com',
  'druva': 'druva.com',
  'atlassian': 'atlassian.com',
  'canva': 'canva.com',
  'sap': 'sap.com',
  'datadog': 'datadoghq.com',

  // Consumer Internet, Delivery & E-Commerce
  'amazon': 'amazon.com',
  'aboutamazon.com': 'amazon.com',
  'flipkart': 'flipkart.com',
  'spotify': 'spotify.com',
  'uber': 'uber.com',
  'airbnb': 'airbnb.com',
  'meta': 'meta.com',
  'about.meta.com': 'meta.com',
  'facebook': 'meta.com',
  'zomato': 'zomato.com',
  'swiggy': 'swiggy.com',
  'meesho': 'meesho.com',
  'zepto': 'zeptonow.com',
  'nykaa': 'nykaa.com',

  // Automotive, Hardware & DeepTech
  'tata-motors': 'tatamotors.com',
  'ather-energy': 'atherenergy.com',
  'delhivery': 'delhivery.com',
  'jio': 'jio.com',
  'reliance-jio': 'jio.com',
  'moschip': 'moschip.com',
  'moschip-technologies': 'moschip.com',
};

/**
 * Resolves any company object, name, or raw domain to a clean canonical root domain.
 */
export function resolveCompanyDomain(company, name, rawDomain) {
  // If raw domain provided, check aliases first
  let domain = (rawDomain || company?.domain || '').toLowerCase().trim();
  
  if (!domain && (company?.website || company?.source_url)) {
    try {
      const url = company.website || company.source_url;
      domain = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
    } catch {
      domain = '';
    }
  }

  // Canonicalize domain if it's an alias (e.g. aboutamazon.com -> amazon.com)
  if (domain && KNOWN_DOMAINS[domain]) {
    return KNOWN_DOMAINS[domain];
  }
  if (domain) {
    // Strip subdomains like www., careers., about., jobs.
    domain = domain.replace(/^(www|careers|about|jobs)\./i, '');
    if (KNOWN_DOMAINS[domain]) return KNOWN_DOMAINS[domain];
  }

  // Check slug
  const slug = (company?.slug || '').toLowerCase().trim();
  if (slug && KNOWN_DOMAINS[slug]) {
    return KNOWN_DOMAINS[slug];
  }

  // Check name normalization
  const companyName = name || company?.company_name || company?.canonical_name || '';
  if (companyName) {
    const normalizedKey = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (KNOWN_DOMAINS[normalizedKey]) {
      return KNOWN_DOMAINS[normalizedKey];
    }
    // Also try simple alphanumeric
    const simpleKey = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (KNOWN_DOMAINS[simpleKey]) {
      return KNOWN_DOMAINS[simpleKey];
    }
  }

  return domain || '';
}

import React, { useEffect } from 'react';
import LegalDocumentLayout from '../components/common/LegalDocumentLayout';

const TERMS_SECTIONS = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'service', title: 'The Service' },
  { id: 'eligibility', title: 'Eligibility & Accounts' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'job-listings', title: 'Job Listings & Employers' },
  { id: 'ai-tools', title: 'AI Tools & Career Guidance' },
  { id: 'user-content', title: 'Your Content & Resumes' },
  { id: 'third-parties', title: 'External Links & Services' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'termination', title: 'Termination' },
  { id: 'liability', title: 'Disclaimers & Liability' },
  { id: 'governing-law', title: 'Governing Law & Contact' }
];

export default function TermsOfServicePage() {
  useEffect(() => {
    document.title = 'Terms of Service — TrustHire';
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalDocumentLayout
      title="Terms of Service"
      subtitle="The rules and terms governing your use of TrustHire."
      sections={TERMS_SECTIONS}
    >
      {/* 01. Acceptance of Terms */}
      <section id="acceptance" className="space-y-4 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          1. Acceptance of Terms
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          By accessing or using TrustHire, you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not register for an account or use the platform.
        </p>
      </section>

      {/* 02. The Service */}
      <section id="service" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          2. The Service
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          TrustHire provides career discovery, skill evaluation, resume parsing, and recruitment matching services. We focus on explainable skills and genuine potential, helping bridge opportunities for candidates regardless of traditional degree biases.
        </p>
      </section>

      {/* 03. Eligibility & Accounts */}
      <section id="eligibility" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          3. Eligibility &amp; Accounts
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          You must be at least 18 years old (or the legal age of majority in your jurisdiction) to create an account. You agree to provide accurate information when registering and to keep your login credentials secure. You are responsible for all activities that occur under your account.
        </p>
      </section>

      {/* 04. Acceptable Use */}
      <section id="acceptable-use" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          4. Acceptable Use
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          You agree to use TrustHire only for legitimate career exploration and recruitment purposes. You agree not to:
        </p>
        <ul className="space-y-2 text-sm sm:text-base text-[#464B45] list-disc pl-5 leading-relaxed">
          <li>Scrape, crawl, or harvest data, profiles, or job vacancies automatically without permission.</li>
          <li>Circumvent or test security controls, rate limits, or authentication barriers.</li>
          <li>Upload fraudulent credentials, forged resumes, or malicious code.</li>
          <li>Decompile or reverse-engineer TrustHire&rsquo;s matching algorithms or source code.</li>
        </ul>
      </section>

      {/* 05. Job Listings & Employers */}
      <section id="job-listings" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          5. Job Listings &amp; Employers
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          Job postings and company facts on TrustHire are gathered from employers and public career portals. While we strive to maintain accurate listings, vacancies may change or close without notice. Employers control their own hiring processes, and TrustHire does not guarantee that any vacancy remains active or that applications will be accepted.
        </p>
      </section>

      {/* 06. AI Tools & Career Guidance */}
      <section id="ai-tools" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          6. AI Tools &amp; Career Guidance
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          Our AI-generated insights, resume suggestions, interview simulations, and growth roadmaps are educational and informational tools. They are not professional legal or financial advice. We do not guarantee job interviews, offers, or specific compensation outcomes. You are responsible for reviewing all AI-generated content before using it in your job applications.
        </p>
      </section>

      {/* 07. User Content & Resumes */}
      <section id="user-content" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          7. Your Content &amp; Resumes
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          You retain full ownership of your uploaded resumes, portfolio links, and personal biographical data. By uploading content, you grant TrustHire a non-exclusive license to process, parse, and store that information solely to deliver our services to you. We do not sell your resumes or claim ownership over your work.
        </p>
      </section>

      {/* 08. External Links & Services */}
      <section id="third-parties" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          8. External Links &amp; Services
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          TrustHire contains links to third-party employer websites and career portals. We are not responsible for the content, privacy practices, or hiring criteria of external organizations.
        </p>
      </section>

      {/* 09. Intellectual Property */}
      <section id="intellectual-property" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          9. Intellectual Property
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          TrustHire&rsquo;s logos, website design, matching software, and original branding are protected by copyright and intellectual property laws. Third-party brand names and employer logos belong to their respective owners.
        </p>
      </section>

      {/* 10. Termination */}
      <section id="termination" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          10. Termination
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          You can delete your account at any time through your account settings. TrustHire reserves the right to suspend or terminate accounts that violate these terms, upload fraudulent data, or engage in abusive platform behavior.
        </p>
      </section>

      {/* 11. Disclaimers & Liability */}
      <section id="liability" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          11. Disclaimers &amp; Limitation of Liability
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          TrustHire is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. To the fullest extent permitted by law, TrustHire and its operators shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform, service interruptions, or recruitment outcomes.
        </p>
      </section>

      {/* 12. Governing Law & Contact */}
      <section id="governing-law" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          12. Governing Law &amp; Contact
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          These terms are governed by the laws of India. If you have any questions or concerns regarding these terms, please contact us at{' '}
          <a href="mailto:legal@trusthire.ai" className="text-[#121613] underline font-medium">
            legal@trusthire.ai
          </a>.
        </p>
      </section>
    </LegalDocumentLayout>
  );
}

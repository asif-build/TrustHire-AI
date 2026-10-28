import React, { useEffect } from 'react';
import LegalDocumentLayout from '../components/common/LegalDocumentLayout';

const PRIVACY_SECTIONS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-collected', title: 'Information We Collect' },
  { id: 'how-we-use-information', title: 'How We Use Information' },
  { id: 'ai-processing', title: 'AI & Automated Processing' },
  { id: 'resume-privacy', title: 'Resume & Document Privacy' },
  { id: 'job-applications', title: 'Job Applications & Third Parties' },
  { id: 'cookies-storage', title: 'Cookies & Storage' },
  { id: 'service-providers', title: 'Service Providers' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'security', title: 'Security' },
  { id: 'user-rights', title: 'Your Rights' },
  { id: 'contact', title: 'Contact' }
];

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — TrustHire';
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      subtitle="How TrustHire collects, uses, and protects your information."
      sections={PRIVACY_SECTIONS}
    >
      {/* 01. Introduction */}
      <section id="introduction" className="space-y-4 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          1. Introduction
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          TrustHire operates an explainable career intelligence and hiring readiness platform. This policy explains what information we collect when you visit our website, create an account, or use our career tools, why we collect it, and how you can manage or delete your data.
        </p>
      </section>

      {/* 02. Information We Collect */}
      <section id="information-collected" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          2. Information We Collect
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          We collect only information required to provide our career discovery and matching services:
        </p>
        <ul className="space-y-2.5 text-sm sm:text-base text-[#464B45] list-disc pl-5 leading-relaxed">
          <li>
            <strong>Account details:</strong> When registering, we collect your name, email address, password hash, and chosen role (Candidate or Recruiter). If you sign in via Google OAuth, we receive your email and authentication UID from Google.
          </li>
          <li>
            <strong>Candidate profile:</strong> Information you choose to add to your profile, including your location, years of experience, current role, and links to your GitHub or LinkedIn profiles.
          </li>
          <li>
            <strong>Resumes and documents:</strong> Files you upload (PDF or DOCX). Text from your resume is extracted on our servers to help map your skills, projects, and career history.
          </li>
          <li>
            <strong>Career preferences &amp; saved items:</strong> Jobs you save, companies you bookmark, and application progress you track in your workspace.
          </li>
          <li>
            <strong>User queries &amp; interview prep:</strong> Prompts, questions, and interview answers you provide when using our mock preparation or resume tailoring features.
          </li>
        </ul>
      </section>

      {/* 03. How We Use Information */}
      <section id="how-we-use-information" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          3. How We Use Information
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          We use your information to:
        </p>
        <ul className="space-y-2 text-sm sm:text-base text-[#464B45] list-disc pl-5 leading-relaxed">
          <li>Authenticate your identity and secure your account.</li>
          <li>Match your experience and skills with relevant job opportunities.</li>
          <li>Extract structured skills from your uploaded resume to generate individualized career roadmaps.</li>
          <li>Generate contextual interview preparation scenarios and resume tailoring suggestions.</li>
          <li>Protect against automated scraping, unauthorized access, and malicious activity.</li>
        </ul>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          We do not sell your personal data or your resume to third-party data brokers or advertisers.
        </p>
      </section>

      {/* 04. AI & Automated Processing */}
      <section id="ai-processing" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          4. AI &amp; Automated Processing
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          TrustHire uses machine learning and natural language processing to evaluate skills, extract resume data, and generate interview questions:
        </p>
        <ul className="space-y-2.5 text-sm sm:text-base text-[#464B45] list-disc pl-5 leading-relaxed">
          <li>
            <strong>Processing:</strong> Prompts and resume excerpts are processed in real time via enterprise AI endpoints (Google Gemini) or local rule-based NLP algorithms. Under our API configurations, your data is not used by AI providers to train public models.
          </li>
          <li>
            <strong>Informational only:</strong> AI recommendations, mock interview scores, and match percentages are advisory tools designed to assist your preparation. They do not guarantee interviews, hiring decisions, or employment offers.
          </li>
          <li>
            <strong>Verification:</strong> AI systems can make mistakes. You should always review any AI-generated resume edits or recommendations before submitting them to employers.
          </li>
        </ul>
      </section>

      {/* 05. Resume & Document Privacy */}
      <section id="resume-privacy" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          5. Resume &amp; Document Privacy
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          Uploaded resumes are stored in a secured file directory linked to your user account. We parse resumes directly using local parsing libraries without sending your original file to third-party OCR vendors. You can update your resume or delete it from your profile at any time.
        </p>
      </section>

      {/* 06. Job Applications & Third Parties */}
      <section id="job-applications" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          6. Job Applications &amp; Third Parties
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          When applying for positions listed on TrustHire, you are typically directed to the employer&rsquo;s official career website or application portal. TrustHire does not automatically distribute your resume to third parties without your direct initiation. Any information you provide on an employer&rsquo;s website is subject to their independent privacy policy.
        </p>
      </section>

      {/* 07. Cookies & Storage */}
      <section id="cookies-storage" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          7. Cookies &amp; Local Storage
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          We do not use advertising or tracking cookies. We only use essential browser local storage to keep you signed in securely and retain your active preferences.
        </p>
      </section>

      {/* 08. Service Providers */}
      <section id="service-providers" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          8. Service Providers
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          We use select infrastructure providers to host and operate the platform:
        </p>
        <ul className="space-y-2 text-sm sm:text-base text-[#464B45] list-disc pl-5 leading-relaxed">
          <li><strong>Supabase Auth:</strong> User authentication and session verification.</li>
          <li><strong>Google Cloud:</strong> Enterprise API infrastructure for language modeling.</li>
          <li><strong>PostgreSQL:</strong> Secure database storage for profiles and application records.</li>
        </ul>
      </section>

      {/* 09. Data Retention */}
      <section id="data-retention" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          9. Data Retention
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          We retain your profile, resumes, and saved milestones as long as your account remains active. If you request account deletion, your personal information, profile records, and uploaded resumes are permanently removed from our active database.
        </p>
      </section>

      {/* 10. Security */}
      <section id="security" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          10. Security
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          We implement technical safeguards including encrypted connections (TLS/HTTPS), salted password hashing, input sanitization, and IP-based rate limiting to prevent unauthorized access and protect your data.
        </p>
      </section>

      {/* 11. Your Rights */}
      <section id="user-rights" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          11. Your Rights
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          You have the right to access the personal information stored in your account, update inaccurate details, download your data, or request complete account deletion. You can also revoke consent for AI-assisted features at any time.
        </p>
      </section>

      {/* 12. Contact */}
      <section id="contact" className="space-y-4 scroll-mt-28 pt-8 border-t border-[#EAE5DA]">
        <h2 className="text-xl sm:text-2xl font-serif text-[#121613]">
          12. Contact
        </h2>
        <p className="text-sm sm:text-base text-[#464B45] leading-relaxed">
          If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at{' '}
          <a href="mailto:legal@trusthire.ai" className="text-[#121613] underline font-medium">
            legal@trusthire.ai
          </a>.
        </p>
      </section>
    </LegalDocumentLayout>
  );
}

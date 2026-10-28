import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function TrustHireFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is TrustHire?",
      a: "TrustHire is an AI-powered career intelligence and skills-based hiring platform. We help candidates discover verified companies, explore real vacancies from live ATS feeds, identify skill gaps against published requirements, and follow individualized roadmaps toward their target roles."
    },
    {
      q: "How does the career roadmap engine work?",
      a: "Our roadmap engine evaluates your demonstrated skills against the verified requirements of a specific role. It produces an explainable readiness score and an actionable 6-phase preparation plan linking directly to official documentation (Python, React, AWS, Docker) and practical capstone projects."
    },
    {
      q: "Where does the company intelligence data come from?",
      a: "Every company record in TrustHire is backed by verifiable primary sources—including SEC Form 10-K filings, direct corporate disclosures, and live public job board feeds (Greenhouse, Lever, Ashby). We transparently display the data source and verification date on every profile."
    },
    {
      q: "Are the job postings real and verified?",
      a: "Yes. We do not display synthetic, scraped, or expired jobs. All active vacancies are ingested directly from official employer ATS APIs with verified external application links pointing straight to the employer's official careers portal."
    },
    {
      q: "How does TrustHire verify candidate skills?",
      a: "TrustHire evaluates skills using a 3-tier evidence matrix: Demonstrated (backed by verified repositories, live projects, or technical assessments), Partially Evidenced (referenced in career history), and Declared. We distinguish missing evidence from a confirmed skills gap."
    },
    {
      q: "Is TrustHire free for candidates?",
      a: "Yes. Exploring verified companies, searching live job postings, analyzing skill alignments, and generating your personalized career roadmap are completely free for candidates."
    }
  ];

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section 
      className="relative z-20 py-20 sm:py-28 lg:py-32 bg-[#F7F4ED] text-[#24211E] border-t border-[#EAE3D6]"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Two-Column Layout matching Sunset Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Section Title & Accordion Items             */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Editorial Serif Display Heading matching Sunset */}
            <h2 className="font-editorial-serif text-[clamp(2.35rem,4.5vw,3.75rem)] font-normal leading-[1.12] tracking-[-0.025em] text-[#24211E] mb-10 sm:mb-12">
              Frequently asked questions
            </h2>

            {/* Accordion List */}
            <div className="divide-y divide-[#E3DACD] border-t border-b border-[#E3DACD]">
              {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;

                return (
                  <div key={idx} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleFAQ(idx)}
                      className="w-full py-5 sm:py-6 flex items-center justify-between text-left gap-4 group focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      {/* Question Text */}
                      <span className="font-editorial-serif text-lg sm:text-[21px] font-normal text-[#24211E] group-hover:text-[#A84E33] transition-colors leading-snug">
                        {faq.q}
                      </span>

                      {/* Clean Minimal Plus Icon that smoothly rotates to an X */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#24211E] shrink-0 transition-transform duration-300">
                        <Plus 
                          size={19} 
                          strokeWidth={1.8} 
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-45 text-[#A84E33]' : 'group-hover:text-[#A84E33]'}`} 
                        />
                      </div>
                    </button>

                    {/* Accordion Answer Content */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'
                      }`}
                    >
                      <p className="text-sm sm:text-[15px] text-[#625E58] font-normal leading-relaxed pr-6 max-w-xl">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Editorial Candid Photograph               */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-2">
            <div className="overflow-hidden rounded-[28px] sm:rounded-[34px] border border-[#E8DFD3] shadow-[0_16px_50px_rgba(36,33,30,0.06)] bg-[#EDE6DC] aspect-[4/3] sm:aspect-[1/1] lg:aspect-[1/1.12]">
              <img
                src="/images/trusthire-faq.webp"
                alt="Candidate reviewing career documents in a warm setting"
                loading="lazy"
                width={1200}
                height={1350}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.025]"
              />
            </div>

            {/* Subtle ambient light gradient */}
            <div 
              className="absolute -inset-4 -z-10 rounded-[38px] opacity-40 blur-xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(168,78,51,0.08) 0%, transparent 70%)'
              }}
            />
          </div>

        </div>

      </div>
    </section>
  );
}

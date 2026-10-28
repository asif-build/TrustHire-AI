import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import CompanyLogo from '../../components/common/CompanyLogo';
import { companiesApi, careerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, ExternalLink, Bookmark, Sparkles, MapPin,
  Globe, Briefcase, ArrowRight, Check, AlertCircle, Clock,
  Building2, Layers, CheckCircle2, Award
} from 'lucide-react';

function formatTimeAgo(dateString) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const diff = Math.floor((new Date() - date) / 1000);
  if (isNaN(diff) || diff < 0) return 'recently';
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'offices', label: 'Offices' },
  { id: 'careers', label: 'Careers' },
  { id: 'skills', label: 'Skills & Roles' },
  { id: 'roadmap', label: 'Get Job-Ready' },
];

export default function CompanyProfilePage() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    loadCompanyData();
  }, [companySlug]);

  const loadCompanyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const compRes = await companiesApi.get(companySlug);
      setCompany(compRes.data);
      setSaved(compRes.data.is_saved || false);

      const jobsRes = await companiesApi.getJobs(companySlug);
      const jobList = jobsRes.data || [];
      setJobs(jobList);
      if (jobList.length > 0) {
        setSelectedRole(jobList[0].title);
      } else if (compRes.data.top_roles && compRes.data.top_roles.length > 0) {
        setSelectedRole(compRes.data.top_roles[0]);
      } else {
        setSelectedRole('Software Engineer');
      }
    } catch (err) {
      setError('Unable to load company intelligence profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await companiesApi.toggleSave(company.slug);
      setSaved(res.data.is_saved);
    } catch {
      // ignore
    }
  };

  const handleBuildRoadmap = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setGeneratingRoadmap(true);
    try {
      const res = await careerApi.generateRoadmap({
        company_name: company.company_name,
        target_role: selectedRole || 'Software Engineer',
        hours_per_week: 10
      });
      navigate(`/career-roadmap/${res.data.roadmap.id}`);
    } catch (err) {
      alert('Failed to generate roadmap. Please check your candidate profile.');
      setGeneratingRoadmap(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col antialiased">
        <TrustHireNavbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="inline-block w-6 h-6 border-2 border-[#121613] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col antialiased">
        <TrustHireNavbar />
        <div className="max-w-md mx-auto my-20 p-8 text-center">
          <p className="text-base font-medium text-[#121613]">Company Not Found</p>
          <p className="text-xs text-[#6E6E66] mt-1">{error || 'This company profile could not be located.'}</p>
          <Link
            to="/companies"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#121613] text-white text-xs font-medium rounded-xl hover:bg-black transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Companies</span>
          </Link>
        </div>
      </div>
    );
  }

  const updatedDate = company.last_verified_at || company.updated_at || company.created_at;
  const activeCount = company.total_active_jobs ?? jobs.length;
  const skillsList = company.skills_summary || [];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-sans antialiased flex flex-col selection:bg-[#E15A3E]/10 selection:text-[#E15A3E]">
      <TrustHireNavbar />

      {/* Breadcrumb / Back Link */}
      <div className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-xs text-[#6E6E66] hover:text-[#121613] transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={14} />
          <span>All companies</span>
        </Link>

        {/* Company Header Card */}
        <div className="bg-white rounded-3xl border border-[#EAEAE5] p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5 sm:gap-6">
              <CompanyLogo
                company={company}
                domain={company.domain}
                logoUrl={company.logo_url}
                size="w-20 h-20 sm:w-24 sm:h-24"
                imgSize="w-12 h-12 sm:w-16 sm:h-16"
              />

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.03em] text-[#121613] font-serif">
                    {company.company_name}
                  </h1>
                  {company.company_stage && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-[#F4F4F0] text-[#6E6E66] border border-[#EAEAE5]">
                      {company.company_stage}
                    </span>
                  )}
                </div>

                {company.canonical_name && company.canonical_name !== company.company_name && (
                  <p className="text-xs text-[#9A9A92] mt-0.5 font-mono">
                    {company.canonical_name}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6E6E66]">
                  {company.industry && <span>{company.industry}</span>}
                  {company.headquarters && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#9A9A92]" />
                        <span>HQ: {company.headquarters}</span>
                      </span>
                    </>
                  )}
                  {company.founding_location && (
                    <>
                      <span>·</span>
                      <span>Origin: {company.founding_location}</span>
                    </>
                  )}
                  {company.founded_year && (
                    <>
                      <span>·</span>
                      <span>Est. {company.founded_year}</span>
                    </>
                  )}
                </div>

                {/* External Links */}
                <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs font-medium">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#121613] hover:text-[#E15A3E] transition-colors"
                    >
                      <Globe size={13} className="text-[#9A9A92]" />
                      <span>Official Website</span>
                      <ExternalLink size={11} className="text-[#9A9A92]" />
                    </a>
                  )}

                  {company.careers_url && (
                    <a
                      href={company.careers_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#121613] hover:text-[#E15A3E] transition-colors"
                    >
                      <Briefcase size={13} className="text-[#9A9A92]" />
                      <span>Careers Portal</span>
                      <ExternalLink size={11} className="text-[#9A9A92]" />
                    </a>
                  )}

                  <span className="text-[#9A9A92] flex items-center gap-1 font-mono text-[11px]">
                    <Clock size={11} />
                    Verified {formatTimeAgo(updatedDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  saved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-[#E5E5E0] hover:border-[#121613] text-[#6E6E66] hover:text-[#121613]'
                }`}
                title={saved ? 'Remove from saved' : 'Save company'}
              >
                <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('roadmap')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#121613] hover:bg-black text-white text-xs font-medium rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles size={14} className="text-[#E15A3E]" />
                <span>Prepare for {company.company_name}</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="mt-8 pt-4 border-t border-[#EAEAE5] flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeSection === sec.id
                    ? 'bg-[#121613] text-white shadow-2xs'
                    : 'text-[#6E6E66] hover:text-[#121613] hover:bg-[#F4F4F0]'
                }`}
              >
                {sec.label}
                {sec.id === 'careers' && activeCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                    {activeCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main 8-Column Panel */}
          <div className="lg:col-span-8 space-y-6">

            {/* TAB: OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="bg-white rounded-3xl border border-[#EAEAE5] p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] pb-3 border-b border-[#EAEAE5] font-sans">
                    About {company.company_name}
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-[#121613] leading-relaxed font-sans">
                    {company.description || 'Public company intelligence record verified from official disclosures.'}
                  </p>
                </div>

                {/* Products & Platforms */}
                {company.products_and_services && company.products_and_services.length > 0 && (
                  <div className="pt-4 border-t border-[#EAEAE5]">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] mb-3 font-sans">
                      Products, Services & Core Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.products_and_services.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl text-xs bg-[#F4F4F0] text-[#121613] border border-[#EAEAE5]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operational Scope */}
                {company.countries_of_operation && company.countries_of_operation.length > 0 && (
                  <div className="pt-4 border-t border-[#EAEAE5]">
                    <h3 className="text-xs font-medium text-[#6E6E66] mb-3">
                      Operating Markets
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.countries_of_operation.map((cntry, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-white text-[#6E6E66] border border-[#EAEAE5]"
                        >
                          <Globe size={11} className="text-[#9A9A92]" />
                          <span>{cntry}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: OFFICES */}
            {activeSection === 'offices' && (
              <div className="bg-white rounded-3xl border border-[#EAEAE5] p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] pb-3 border-b border-[#EAEAE5] font-sans">
                    Global & Regional Office Network
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#6E6E66] font-sans">
                    Physical facilities and regional hubs verified from official disclosures and public filings.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(company.office_locations || company.locations || []).map((loc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-[#EAEAE5] bg-[#FBFBFA] flex items-start gap-3"
                    >
                      <MapPin size={16} className="text-[#E15A3E] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#121613]">{loc}</p>
                        <p className="text-[11px] text-[#9A9A92] mt-0.5">Verified Office Location</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CAREERS / VACANCIES */}
            {activeSection === 'careers' && (
              <div className="bg-white rounded-3xl border border-[#EAEAE5] p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAEAE5]">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] font-sans">
                      Published Live Opportunities
                    </h2>
                    <p className="text-xs text-[#6E6E66] mt-0.5 font-sans">
                      Direct, un-fabricated listings from verified ATS feeds and official career portals.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#121613]">
                    {jobs.length} active
                  </span>
                </div>

                {jobs.length === 0 ? (
                  <div className="py-12 text-center max-w-md mx-auto">
                    <p className="text-sm font-medium text-[#121613]">
                      No current openings found in direct feed
                    </p>
                    <p className="text-xs text-[#6E6E66] mt-1.5 leading-relaxed">
                      TrustHire only displays verified positions. You can explore openings directly on their official careers site or start building a preparation roadmap.
                    </p>
                    {company.careers_url && (
                      <a
                        href={company.careers_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#121613] hover:bg-black text-white text-xs font-medium rounded-xl transition-colors"
                      >
                        <span>Visit Official Careers Page</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-[#EAEAE5]">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-sm font-medium text-[#121613] group-hover:text-[#E15A3E] transition-colors"
                          >
                            {job.title}
                          </Link>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6E6E66]">
                            <span>{job.location || 'Remote'}</span>
                            {job.workplace_type && job.workplace_type !== 'unspecified' && (
                              <>
                                <span>·</span>
                                <span className="capitalize">{job.workplace_type}</span>
                              </>
                            )}
                            {job.experience_level && (
                              <>
                                <span>·</span>
                                <span>{job.experience_level}</span>
                              </>
                            )}
                          </div>

                          {job.required_skills && job.required_skills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {job.required_skills.slice(0, 5).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F4F4F0] text-[#6E6E66]"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="px-3 py-1.5 rounded-lg border border-[#E5E5E0] hover:border-[#121613] text-xs font-medium text-[#121613] transition-colors"
                          >
                            Details
                          </Link>

                          {job.application_url && (
                            <a
                              href={job.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#121613] hover:bg-black text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              <span>Apply</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SKILLS & ROLES EVIDENCE */}
            {activeSection === 'skills' && (
              <div className="bg-white rounded-3xl border border-[#EAEAE5] p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] pb-3 border-b border-[#EAEAE5] font-sans">
                    Extracted Skills Evidence
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#6E6E66] leading-relaxed font-sans">
                    These technologies and tools are extracted from actual published requirements across {company.company_name}’s vacancies.
                  </p>
                </div>

                {skillsList.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {skillsList.map((item, idx) => (
                        <Link
                          key={idx}
                          to={`/learn?q=${encodeURIComponent(item.skill)}`}
                          className="p-3.5 rounded-xl border border-[#EAEAE5] hover:border-[#121613] bg-[#FBFBFA] hover:bg-white flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <span className="text-xs font-semibold text-[#121613] group-hover:underline">{item.skill}</span>
                          <span className="text-[10px] font-mono text-[#9A9A92] bg-white px-2 py-0.5 rounded border border-[#EAEAE5]">
                            {item.mention_count} {item.mention_count === 1 ? 'role' : 'roles'}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#EAEAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                      <div>
                        <p className="text-xs font-semibold text-[#121613]">Looking to build job readiness for {company.company_name}?</p>
                        <p className="text-[11px] text-[#6E6E66]">Explore verified YouTube lessons, official documentation, and curated learning roadmaps.</p>
                      </div>
                      <Link
                        to="/learn"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#121613] hover:bg-black text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs"
                      >
                        <span>Open Learning Hub</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#6E6E66] py-8 text-center">
                    Skills extraction requires active vacancy feeds. Explore their official careers portal for direct postings.
                  </p>
                )}

                {/* Common Roles */}
                {company.top_roles && company.top_roles.length > 0 && (
                  <div className="pt-5 border-t border-[#EAEAE5]">
                    <h3 className="text-xs font-medium text-[#6E6E66] mb-3">
                      Frequently Recruited Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.top_roles.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl text-xs bg-[#F4F4F0] text-[#121613] border border-[#EAEAE5]"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: GET JOB-READY ROADMAP */}
            {activeSection === 'roadmap' && (
              <div className="bg-white rounded-3xl border border-[#EAEAE5] p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] pb-3 border-b border-[#EAEAE5] font-sans">
                    Get Job-Ready for {company.company_name}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#6E6E66] leading-relaxed font-sans">
                    Generate an individualised skills evaluation and weekly study roadmap tailored to this employer's tech stack and published requirements.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-[#121613] mb-1.5">
                      Select Target Position
                    </label>
                    <input
                      type="text"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      placeholder="e.g. Frontend Engineer, Systems Architect"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] focus:border-[#121613] rounded-xl text-xs text-[#121613] outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleBuildRoadmap}
                    disabled={generatingRoadmap}
                    className="w-full py-3 px-5 bg-[#121613] hover:bg-black disabled:opacity-60 text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {generatingRoadmap ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing Role Requirements...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-[#E15A3E]" />
                        <span>Generate Career Roadmap</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right 4-Column Panel: Data Provenance & Key Stats */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Facts Card */}
            <div className="bg-white rounded-3xl border border-[#EAEAE5] p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] pb-2 border-b border-[#EAEAE5] font-sans">
                Company Overview
              </h3>

              <div className="space-y-3 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E66]">Stage</span>
                  <span className="font-medium text-[#121613]">{company.company_stage || 'Growth'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E66]">Employees</span>
                  <span className="font-medium text-[#121613]">{company.company_size || 'Verified Enterprise'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E66]">Founded</span>
                  <span className="font-medium text-[#121613]">{company.founded_year || 'Verified'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E66]">Country of Origin</span>
                  <span className="font-medium text-[#121613]">{company.country || 'Global'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E66]">Primary HQ</span>
                  <span className="font-medium text-[#121613] text-right truncate max-w-[180px]">
                    {company.headquarters || 'Global Presence'}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Provenance Box */}
            <div className="bg-white rounded-3xl border border-[#EAEAE5] p-6 shadow-2xs space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] font-sans">
                Data Provenance
              </h3>
              <p className="text-xs text-[#6E6E66] leading-relaxed font-sans">
                {company.data_source || 'Sourced from official corporate disclosures, public regulatory registries, and legitimate ATS endpoints.'}
              </p>
              <div className="pt-3 border-t border-[#EAEAE5] flex items-center justify-between text-xs text-[#9A9A92] font-sans">
                <span>Status</span>
                <span className="text-emerald-700 font-medium">Traceable disclosure</span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
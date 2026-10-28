import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import CompanyLogo from '../../components/common/CompanyLogo';
import { careerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search, MapPin, ExternalLink, Bookmark,
  ChevronDown, X, ArrowRight, AlertCircle, Briefcase
} from 'lucide-react';

export default function JobSearchPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [q, setQ] = useState('');
  const [company, setCompany] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [experience, setExperience] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: 15 };
      if (q.trim()) params.q = q.trim();
      if (company.trim()) params.company = company.trim();
      if (workplace) params.workplace_type = workplace;
      if (experience) params.experience_level = experience;

      const res = await careerApi.listJobs(params);
      setJobs(res.data.jobs || []);
      setTotalCount(res.data.total_count || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      setError('Unable to load job postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(timer);
  }, [q, company, workplace, experience, page]);

  const handleToggleSaveJob = async (jobId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await careerApi.toggleSaveJob(jobId);
      setJobs(prev =>
        prev.map(j => j.id === jobId ? { ...j, is_saved: res.data.is_saved } : j)
      );
    } catch {
      // ignore
    }
  };

  const hasActiveFilters = Boolean(q.trim() || company.trim() || workplace || experience);

  const clearFilters = () => {
    setQ('');
    setCompany('');
    setWorkplace('');
    setExperience('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-jakarta antialiased flex flex-col selection:bg-[#E15A3E]/10 selection:text-[#E15A3E]">
      <TrustHireNavbar />

      {/* Minimal Header */}
      <header className="pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#121613] font-serif">
          Opportunities
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-[#6E6E66]">
          Search verified live roles directly from official ATS feeds.
        </p>

        {/* Search & Filters */}
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            <div className="md:col-span-8 relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none"
              />
              <input
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search job title, keywords, or skills"
                className="w-full pl-11 pr-10 py-3 bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] focus:border-[#121613] rounded-xl text-sm text-[#121613] placeholder-[#9A9A92] shadow-2xs outline-none transition-all"
              />
              {q && (
                <button
                  onClick={() => { setQ(''); setPage(1); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#9A9A92] hover:text-[#121613]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="md:col-span-4 relative">
              <input
                type="text"
                value={company}
                onChange={(e) => { setCompany(e.target.value); setPage(1); }}
                placeholder="Filter by company..."
                className="w-full px-4 py-3 bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] focus:border-[#121613] rounded-xl text-sm text-[#121613] placeholder-[#9A9A92] shadow-2xs outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="relative">
              <select
                value={workplace}
                onChange={(e) => { setWorkplace(e.target.value); setPage(1); }}
                className="appearance-none bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] text-[#121613] text-xs font-medium pl-3 pr-7 py-2 rounded-lg cursor-pointer outline-none transition-colors"
              >
                <option value="">All Workplace Types</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={experience}
                onChange={(e) => { setExperience(e.target.value); setPage(1); }}
                className="appearance-none bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] text-[#121613] text-xs font-medium pl-3 pr-7 py-2 rounded-lg cursor-pointer outline-none transition-colors"
              >
                <option value="">All Experience Levels</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Staff">Staff</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#6E6E66] hover:text-[#121613] px-2 py-1.5 transition-colors font-medium ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Counter */}
        <div className="mt-5 flex items-center justify-between text-xs text-[#82827A] pb-2 border-b border-[#EAEAE5]">
          <span>
            {loading ? 'Searching...' : `${totalCount} ${totalCount === 1 ? 'position' : 'positions'}`}
          </span>
          <span className="font-mono text-[11px] text-[#9A9A92]">
            Page {page} of {totalPages}
          </span>
        </div>
      </header>

      {/* Main Jobs List */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full pb-16">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#121613] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-[#6E6E66]">Querying verified vacancies...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <p className="text-sm text-[#121613] mb-3">{error}</p>
            <button
              onClick={fetchJobs}
              className="text-xs font-medium text-[#121613] underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="text-base font-medium text-[#121613]">No matching vacancies found</p>
            <p className="mt-1 text-xs text-[#6E6E66]">
              Try adjusting your search keywords or broadening filter criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[#121613] text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#EAEAE5] bg-white rounded-2xl border border-[#EAEAE5] shadow-2xs overflow-hidden">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-[#F9F9F8] transition-colors"
              >
                {/* Left: Logo, Title & Company Details */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <CompanyLogo
                    name={job.company_name}
                    size="w-10 h-10"
                    imgSize="max-h-6 max-w-6"
                    className="mt-0.5 sm:mt-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-sm font-medium text-[#121613] group-hover:text-[#E15A3E] transition-colors truncate"
                      >
                        {job.title}
                      </Link>
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#6E6E66]">
                      <span className="font-medium text-[#121613]">{job.company_name}</span>
                      <span>·</span>
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
                        {job.required_skills.slice(0, 4).map((sk, idx) => (
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
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => handleToggleSaveJob(job.id, e)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      job.is_saved
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-[#E5E5E0] hover:border-[#121613] text-[#9A9A92] hover:text-[#121613]'
                    }`}
                    title={job.is_saved ? 'Remove from saved' : 'Save position'}
                  >
                    <Bookmark size={14} fill={job.is_saved ? 'currentColor' : 'none'} />
                  </button>

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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-xs text-[#6E6E66]">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E5E5E0] hover:border-[#121613] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <span className="font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E5E5E0] hover:border-[#121613] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
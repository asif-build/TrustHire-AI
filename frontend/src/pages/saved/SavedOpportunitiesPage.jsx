import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import CompanyLogo from '../../components/common/CompanyLogo';
import { careerApi, companiesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Bookmark, Briefcase, Building2, MapPin, ExternalLink,
  Trash2, AlertCircle, ArrowUpRight, CheckCircle2
} from 'lucide-react';

export default function SavedOpportunitiesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'companies'
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedCompanies, setSavedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsRes, compsRes] = await Promise.all([
        careerApi.listSavedJobs().catch(() => ({ data: { saved_jobs: [] } })),
        careerApi.listSavedCompanies().catch(() => ({ data: { saved_companies: [] } }))
      ]);
      setSavedJobs(jobsRes.data.saved_jobs || []);
      setSavedCompanies(compsRes.data.saved_companies || []);
    } catch {
      setError('Unable to load saved opportunities.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await careerApi.toggleSaveJob(jobId);
      setSavedJobs(prev => prev.filter(item => item.job?.id !== jobId));
    } catch {
      alert('Unable to remove saved job.');
    }
  };

  const handleUnsaveCompany = async (slug) => {
    try {
      await companiesApi.toggleSave(slug);
      setSavedCompanies(prev => prev.filter(item => item.company?.slug !== slug));
    } catch {
      alert('Unable to remove saved company.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-jakarta flex flex-col antialiased">
      <TrustHireNavbar />

      {/* Header Bar */}
      <section className="bg-white border-b border-black/5 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F0] border border-black/5 text-xs font-mono text-gray-700 mb-3">
              <Bookmark size={13} className="text-rose-600" />
              <span>Personal Opportunity Watchlist</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
              Saved Opportunities
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
              Review and manage bookmarked vacancies and target employers you are actively tracking for application.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-2xl self-start sm:self-center">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-white text-gray-950 shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Saved Jobs ({savedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'companies'
                  ? 'bg-white text-gray-950 shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Saved Employers ({savedCompanies.length})
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Loading saved records...
            </p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <AlertCircle size={24} className="text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-rose-900">{error}</p>
          </div>
        ) : activeTab === 'jobs' ? (
          <div>
            {savedJobs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                <Briefcase size={36} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900">No saved job listings yet</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Browse verified live job opportunities and click the bookmark icon to save them here.
                </p>
                <Link
                  to="/jobs"
                  className="mt-4 inline-block px-5 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-black"
                >
                  Explore Jobs Directory
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((item) => {
                  const job = item.job;
                  if (!job) return null;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-black/5 hover:border-black/20 p-5 sm:p-6 transition-all hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <CompanyLogo
                          name={job.company_name}
                          domain={job.company_domain}
                          size="w-12 h-12"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-500 uppercase">
                              {job.company_name}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {job.source_name} feed
                            </span>
                          </div>

                          <Link
                            to={`/jobs/${job.id}`}
                            className="mt-1 block text-lg font-bold text-gray-950 hover:underline truncate"
                          >
                            {job.title}
                          </Link>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-gray-400" />
                              {job.location}
                            </span>
                            <span>•</span>
                            <span>{job.experience_level}</span>
                            <span>•</span>
                            <span className="capitalize">{job.workplace_type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleUnsaveJob(job.id)}
                          className="p-2 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 size={16} />
                        </button>

                        <Link
                          to={`/jobs/${job.id}`}
                          className="px-4 py-2 rounded-full border border-gray-200 hover:border-black text-xs font-semibold text-gray-800 transition-colors"
                        >
                          Inspect Details
                        </Link>

                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-950 hover:bg-black text-white text-xs font-bold transition-colors"
                        >
                          <span>Apply</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {savedCompanies.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900">No saved employers yet</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Bookmark companies from the Company Intelligence directory to watch their hiring activity.
                </p>
                <Link
                  to="/companies"
                  className="mt-4 inline-block px-5 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-black"
                >
                  Explore Company Directory
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCompanies.map((item) => {
                  const company = item.company;
                  if (!company) return null;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-black/5 hover:border-black/20 p-6 flex flex-col justify-between transition-all hover:shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <CompanyLogo
                              company={company}
                              domain={company.domain}
                              logoUrl={company.logo_url}
                              size="w-12 h-12"
                            />
                            <div className="min-w-0">
                              <h3 className="text-lg font-bold text-gray-950 truncate">
                                {company.company_name}
                              </h3>
                              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                                {company.industry}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleUnsaveCompany(company.slug)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors shrink-0"
                            title="Remove from watchlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <p className="mt-3 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {company.description}
                        </p>

                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="truncate">{company.headquarters || 'Global'}</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700">
                          {company.active_jobs_count > 0 ? `${company.active_jobs_count} Live Openings` : 'Careers Page Active'}
                        </span>

                        <Link
                          to={`/companies/${company.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 hover:underline"
                        >
                          <span>Profile</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

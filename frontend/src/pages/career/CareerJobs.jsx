import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerApi } from '../../services/api';
import CompanyLogo from '../../components/common/CompanyLogo';

export default function CareerJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  
  // Filter state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [experience, setExperience] = useState('');
  const [page, setPage] = useState(1);

  // Match / track action feedback
  const [actionLoading, setActionLoading] = useState({});
  const [actionMessage, setActionMessage] = useState('');

  const fetchJobs = () => {
    setLoading(true);
    const params = {
      q: search,
      location,
      workplace_type: workplace,
      experience_level: experience,
      page
    };
    careerApi.listJobs(params)
      .then(res => {
        setJobs(res.data.jobs || []);
        setTotalCount(res.data.total_count || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load jobs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [page, workplace, experience]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleSyncJobs = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await careerApi.syncJobs();
      setSyncMessage(res.data.detail || 'Synced real jobs successfully.');
      fetchJobs();
    } catch (err) {
      setSyncMessage('Failed to trigger job feed sync.');
    } finally {
      setSyncing(false);
    }
  };

  const handleEvaluateMatch = async (jobId) => {
    setActionLoading(prev => ({ ...prev, [jobId]: 'evaluating' }));
    try {
      await careerApi.evaluateMatch(jobId);
      navigate('/career/matches');
    } catch (err) {
      setActionMessage('Failed to evaluate match. Please ensure you have a profile or resume uploaded.');
    } finally {
      setActionLoading(prev => ({ ...prev, [jobId]: null }));
    }
  };

  const handleTrackJob = async (job) => {
    setActionLoading(prev => ({ ...prev, [job.id]: 'tracking' }));
    try {
      const res = await careerApi.createApplication({
        job_id: job.id,
        status: 'interested',
        notes: `Saved from ${job.source_name} feed.`
      });
      setActionMessage(`Added "${job.title}" to your Application Tracker!`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setActionMessage('Could not add to tracker.');
    } finally {
      setActionLoading(prev => ({ ...prev, [job.id]: null }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Feed Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight">
            Job Discovery
          </h1>
          <p className="text-xs sm:text-sm text-black/60 font-mono mt-1">
            Real active job listings from official Greenhouse & Lever developer APIs. Total: {totalCount}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSyncJobs}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-black/15 shadow-sm hover:bg-[#F4F4F0] transition-colors text-xs font-mono font-semibold text-black/80 self-start sm:self-auto"
        >
          <span className={`w-2 h-2 rounded-full ${syncing ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'}`} />
          {syncing ? 'Syncing Live Feeds...' : 'Sync Greenhouse / Lever'}
        </button>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
          {syncMessage}
        </div>
      )}

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono">
          {actionMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E5E0] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-mono text-black/50 uppercase tracking-wider mb-1">Keyword / Title / Company</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Frontend, React, Cloudflare..."
            className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none focus:border-black/40"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-black/50 uppercase tracking-wider mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. San Francisco, Remote..."
            className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none focus:border-black/40"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-black/50 uppercase tracking-wider mb-1">Workplace</label>
          <select
            value={workplace}
            onChange={(e) => {
              setWorkplace(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none focus:border-black/40"
          >
            <option value="">All Workplaces</option>
            <option value="remote">100% Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-Site</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#050505] text-white font-semibold text-sm hover:bg-black/85 transition-colors"
          >
            Search Jobs
          </button>
        </div>
      </form>

      {/* Jobs Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-black/20 border-t-[#050505] rounded-full animate-spin" />
            <span className="text-xs font-mono text-black/60">Searching catalog...</span>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E5E0]">
          <div className="w-12 h-12 rounded-full bg-[#F4F4F0] text-xl flex items-center justify-center mx-auto mb-4">
            🔎
          </div>
          <h3 className="text-lg font-bold text-[#050505]">No matching jobs found</h3>
          <p className="text-sm text-black/60 max-w-md mx-auto mt-1 mb-6">
            Try adjusting your search keywords, location filters, or click below to trigger a live sync from connected Greenhouse & Lever sources.
          </p>
          <button
            type="button"
            onClick={handleSyncJobs}
            className="px-5 py-2.5 rounded-full bg-[#050505] text-white text-xs font-mono font-semibold"
          >
            Sync Real Feeds
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E5E0] shadow-sm hover:border-black/25 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Company Logo, Name & Verified Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <CompanyLogo
                      name={job.company_name}
                      domain={job.company_domain}
                      size="w-10 h-10"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#050505] truncate">
                        {job.company_name}
                      </p>
                      <span className="text-[10px] font-mono text-black/50 uppercase">
                        {job.source_name} feed
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    Verified
                  </span>
                </div>

                {/* Job Title */}
                <h3 className="text-base font-bold text-[#050505] leading-snug line-clamp-2 mb-3">
                  {job.title}
                </h3>

                {/* Location & Workplace */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-black/70 mb-4 font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#F4F4F0] border border-black/5">
                    📍 {job.location || 'Remote'}
                  </span>
                  <span className={`px-2 py-0.5 rounded capitalize ${
                    job.workplace_type === 'remote' ? 'bg-emerald-50 text-emerald-800' :
                    job.workplace_type === 'hybrid' ? 'bg-amber-50 text-amber-800' : 'bg-[#F4F4F0]'
                  }`}>
                    {job.workplace_type}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F4F4F0]">
                    {job.experience_level}
                  </span>
                </div>

                {/* Required Skills Badges */}
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {job.required_skills.slice(0, 4).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F8F2E3] text-[#050505] border border-black/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-black/40">
                        +{job.required_skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5E5E0] flex items-center justify-between gap-2">
                <a
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-black/60 hover:text-black hover:underline"
                >
                  Source ↗
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTrackJob(job)}
                    disabled={actionLoading[job.id] === 'tracking'}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E5E0] hover:bg-[#F4F4F0] text-xs font-mono text-black/80 transition-colors"
                  >
                    Track
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEvaluateMatch(job.id)}
                    disabled={actionLoading[job.id] === 'evaluating'}
                    className="px-3.5 py-1.5 rounded-lg bg-[#050505] text-white hover:bg-black/85 text-xs font-semibold transition-colors"
                  >
                    {actionLoading[job.id] === 'evaluating' ? 'Matching...' : 'Evaluate Match'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalCount > 20 && (
        <div className="flex items-center justify-between py-4 text-xs font-mono">
          <span className="text-black/60">
            Showing page {page} of {Math.ceil(totalCount / 20)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-[#E5E5E0] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= totalCount}
              className="px-3 py-1.5 rounded-md border border-[#E5E5E0] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

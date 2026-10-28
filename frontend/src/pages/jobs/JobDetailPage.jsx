import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import CompanyLogo from '../../components/common/CompanyLogo';
import { careerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase, Building2, MapPin, ExternalLink, Bookmark,
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle, ArrowLeft
} from 'lucide-react';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await careerApi.getJob(jobId);
      setJob(res.data);
      setSaved(res.data.is_saved || false);
    } catch (err) {
      setError('Unable to locate this job posting.');
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
      const res = await careerApi.toggleSaveJob(job.id);
      setSaved(res.data.is_saved);
    } catch {
      // ignore
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setGeneratingRoadmap(true);
    try {
      const res = await careerApi.generateRoadmap({
        company_name: job.company_name,
        target_role: job.title,
        job_id: job.id,
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
          <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col antialiased">
        <TrustHireNavbar />
        <div className="max-w-md mx-auto my-20 p-8 bg-white border border-gray-200 rounded-3xl text-center shadow-xs">
          <AlertCircle size={36} className="text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Listing Not Available</h2>
          <p className="text-xs text-gray-500 mt-1">{error || 'This job vacancy could not be retrieved.'}</p>
          <Link to="/jobs" className="mt-4 inline-block px-4 py-2 bg-black text-white text-xs font-medium rounded-full">
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-jakarta flex flex-col antialiased">
      <TrustHireNavbar />

      {/* Header Bar */}
      <section className="bg-white border-b border-black/5 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to all opportunities</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <CompanyLogo
                name={job.company_name}
                domain={job.company_domain}
                size="w-16 h-16 sm:w-20 sm:h-20"
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-600">
                    {job.company_name}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {job.source_name} feed
                  </span>
                  {job.workplace_type && job.workplace_type !== 'unspecified' && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono capitalize bg-gray-100 text-gray-700">
                      {job.workplace_type}
                    </span>
                  )}
                </div>

                <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-950">
                  {job.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {job.location || 'Remote / Unspecified'}
                  </span>
                  <span>•</span>
                  <span>{job.experience_level} Level</span>
                  <span>•</span>
                  <span>{job.employment_type}</span>
                  <span>•</span>
                  <span className="font-mono text-gray-800 font-medium">
                    {job.salary_min ? `$${job.salary_min.toLocaleString()} – $${job.salary_max?.toLocaleString()} ${job.salary_currency}` : 'Salary: Not disclosed by source'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleToggleSave}
                className={`p-3 rounded-full border transition-colors ${
                  saved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-black'
                }`}
                title={saved ? 'Remove from saved' : 'Save opportunity'}
              >
                <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
              </button>

              <a
                href={job.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-950 hover:bg-black text-white text-xs font-bold transition-colors shadow-sm"
              >
                <span>Apply on Employer Board</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 8 COLS: Description, Skills */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Required Skills Card */}
            {job.required_skills && job.required_skills.length > 0 && (
              <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs">
                <h3 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">
                  Required & Stated Technical Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((s, idx) => (
                    <Link
                      key={idx}
                      to={`/learn?q=${encodeURIComponent(s)}`}
                      className="px-3 py-1 rounded-lg text-xs font-mono bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium hover:bg-emerald-100 transition-colors"
                      title={`Learn ${s} on TrustHire Learning Hub`}
                    >
                      {s}
                    </Link>
                  ))}
                  {job.preferred_skills && job.preferred_skills.map((s, idx) => (
                    <Link
                      key={`pref-${idx}`}
                      to={`/learn?q=${encodeURIComponent(s)}`}
                      className="px-3 py-1 rounded-lg text-xs font-mono bg-gray-100 text-gray-700 border border-black/5 hover:bg-gray-200 transition-colors"
                      title={`Learn ${s} on TrustHire Learning Hub`}
                    >
                      {s} (Preferred)
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actual Published Description */}
            <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-semibold text-gray-950 pb-3 border-b border-gray-100">
                Official Published Job Description
              </h2>
              <div className="mt-4 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Data Source & Provenance Disclosure */}
            <div className="bg-[#F4F4F0] rounded-2xl p-5 border border-black/5 text-xs text-gray-600 flex items-start gap-3">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-900">Traceable Verification Notice: </span>
                This vacancy was ingested directly from {job.company_name}’s public {job.source_name} feed (ID: {job.external_id}).
                TrustHire does not alter job requirements, inject synthetic data, or accept applications internally.
                Your application will be processed directly on the employer’s system.
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLS: Build Roadmap for this Job */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#050505] text-white rounded-3xl p-6 sm:p-7 shadow-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono mb-4">
                <Sparkles size={13} className="text-[#9EF5CD]" />
                <span>Targeted Role Roadmap</span>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-white">
                Generate Preparation Roadmap for this Job
              </h3>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                TrustHire will analyze this exact job description, compare its required skills with your candidate profile, and construct a 6-phase preparation plan.
              </p>

              <button
                onClick={handleGenerateRoadmap}
                disabled={generatingRoadmap}
                className="w-full mt-6 py-3 rounded-xl bg-[#F0442D] hover:bg-[#d63823] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {generatingRoadmap ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calibrating Roadmap...</span>
                  </>
                ) : (
                  <>
                    <span>Build Phased Roadmap</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

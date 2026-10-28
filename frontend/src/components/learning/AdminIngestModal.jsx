import React, { useState } from 'react';
import { X, Plus, Sparkles, CheckCircle2, AlertCircle, Link2, ExternalLink } from 'lucide-react';
import { learningApi } from '../../services/api';

export default function AdminIngestModal({ isOpen, onClose, onResourceAdded }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [pricing, setPricing] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid destination URL or YouTube link.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const skillsArray = skills.split(',').map(s => s.strip ? s.strip() : s.trim()).filter(Boolean);
      const res = await learningApi.adminIngest({
        url: url.trim(),
        title: title.trim(),
        provider: provider.trim(),
        description: description.trim(),
        skills: skillsArray,
        target_roles: [targetRole],
        difficulty,
        pricing,
      });

      setSuccessResult(res.data);
      if (onResourceAdded) onResourceAdded(res.data.resource);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to ingest resource. Check URL format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#EAEAE5] shadow-xl max-w-lg w-full p-6 sm:p-8 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 text-[#9A9A92] hover:text-[#121613] transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F4F4F0] text-[#121613] font-bold">
            Administrator Tool
          </span>
          <span className="text-xs text-[#9A9A92]">Link Verification & Parsing</span>
        </div>
        <h3 className="text-xl font-bold text-[#121613] font-serif">
          Ingest Verified Learning Resource
        </h3>
        <p className="text-xs text-[#6E6E66] mt-1 mb-5">
          Provide a genuine external course URL or YouTube video link. The server will extract metadata, validate accessibility, and add it to TrustHire's catalog.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successResult && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Resource successfully validated and added! Status: {successResult.verification?.status}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#121613] mb-1">
              Destination URL or YouTube Video Link *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://developer.mozilla.org/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAEAE5] focus:border-[#121613] text-xs font-mono outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#121613] mb-1">Title (Optional auto-detect)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern React Course"
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAEAE5] focus:border-[#121613] text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#121613] mb-1">Provider / Channel</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. FreeCodeCamp, MDN, AWS"
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAEAE5] focus:border-[#121613] text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#6E6E66] uppercase mb-1">Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EAEAE5] text-xs bg-white"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Machine Learning Engineer">ML Engineer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#6E6E66] uppercase mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EAEAE5] text-xs bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#6E6E66] uppercase mb-1">Pricing</label>
              <select
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EAEAE5] text-xs bg-white"
              >
                <option value="free">100% Free</option>
                <option value="free_with_paid_cert">Free (Optional Cert)</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#121613] mb-1">
              Skills Covered (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, FastAPI, Docker, SQL"
              className="w-full px-3.5 py-2 rounded-xl border border-[#EAEAE5] focus:border-[#121613] text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#121613] mb-1">Short Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of learning outcomes..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#EAEAE5] focus:border-[#121613] text-xs outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EAEAE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#EAEAE5] text-xs font-medium text-[#6E6E66] hover:text-[#121613]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#121613] text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Validating Link...' : 'Ingest Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

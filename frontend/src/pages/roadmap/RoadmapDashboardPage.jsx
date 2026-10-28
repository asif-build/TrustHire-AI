import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import { careerApi, companiesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, Compass, Building2, CheckCircle2, ArrowRight,
  Plus, Calendar, Trash2, Layers, AlertCircle, Clock
} from 'lucide-react';

export default function RoadmapDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal for new roadmap
  const [modalOpen, setModalOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer');
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);

  useEffect(() => {
    loadRoadmaps();
    // Preload verified company names for suggestions
    companiesApi.list({ page_size: 50 })
      .then(res => setCompanySuggestions(res.data.companies || []))
      .catch(() => {});
  }, []);

  const loadRoadmaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await careerApi.listRoadmaps();
      setRoadmaps(res.data.roadmaps || []);
    } catch (err) {
      setError('Unable to load career roadmaps.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    setSubmitting(true);
    try {
      const res = await careerApi.generateRoadmap({
        company_name: targetCompany.trim() || 'Industry Standard',
        target_role: targetRole.trim(),
        hours_per_week: hoursPerWeek,
      });
      setModalOpen(false);
      navigate(`/career-roadmap/${res.data.roadmap.id}`);
    } catch (err) {
      alert('Failed to generate roadmap. Please verify your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoadmap = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this roadmap?')) return;
    try {
      await careerApi.deleteRoadmap(id);
      setRoadmaps(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Unable to delete roadmap.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-jakarta flex flex-col antialiased">
      <TrustHireNavbar />

      {/* Header */}
      <section className="bg-white border-b border-black/5 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F0] border border-black/5 text-xs font-mono text-gray-700 mb-3">
              <Sparkles size={13} className="text-[#F0442D]" />
              <span>Individualised Career Roadmap Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
              My Career Roadmaps
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
              Personalized, 6-phase preparation roadmaps calibrated against real employer expectations.
              Compare your evidenced skills against live vacancy requirements and follow verifiable tasks to become a competitive candidate.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F0442D] hover:bg-[#d63823] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm self-start sm:self-center"
          >
            <Plus size={16} />
            <span>New Roadmap</span>
          </button>
        </div>
      </section>

      {/* Main Roadmap Cards Grid */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Loading active roadmaps...
            </p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <AlertCircle size={24} className="text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-rose-900">{error}</p>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <Compass size={44} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">No roadmaps created yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Generate a personalized roadmap targeting an employer or role to calculate your skill readiness score and generate your 6-phase plan.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 px-5 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-black transition-colors"
            >
              Generate Your First Roadmap
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((r) => (
              <div
                key={r.id}
                className="group bg-white rounded-3xl border border-black/5 hover:border-black/25 p-6 sm:p-7 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                        {r.company_name}
                      </span>
                      <h2 className="text-xl font-bold text-gray-950 mt-1 group-hover:text-black">
                        {r.target_role}
                      </h2>
                    </div>

                    <button
                      onClick={(e) => handleDeleteRoadmap(r.id, e)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                      title="Delete roadmap"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Readiness Score Badge */}
                  <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500">
                        Readiness Score
                      </span>
                      <div className="text-2xl font-black text-gray-950 font-mono">
                        {r.readiness_score}%
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-gray-500">Progress</span>
                      <div className="text-sm font-bold text-gray-900 font-mono">
                        {r.completed_tasks_count} / {r.total_tasks_count} tasks
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${r.progress_percentage}%` }}
                    />
                  </div>

                  {/* Readiness Summary */}
                  <p className="mt-4 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {r.readiness_summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400">
                    Updated {new Date(r.updated_at).toLocaleDateString()}
                  </span>

                  <Link
                    to={`/career-roadmap/${r.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-950 group-hover:text-[#F0442D] transition-colors"
                  >
                    <span>Open Roadmap</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE ROADMAP MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-950">
              Generate Individualised Roadmap
            </h2>
            <p className="mt-1 text-xs text-gray-600 leading-relaxed">
              TrustHire analyzes your profile evidence against verified company requirements to construct your tailored 6-phase roadmap.
            </p>

            <form onSubmit={handleCreateRoadmap} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1">
                  Target Company:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloudflare, Ramp, Figma, Microsoft, Google..."
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                {companySuggestions.length > 0 && !targetCompany && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {companySuggestions.slice(0, 6).map(c => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setTargetCompany(c.company_name)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        {c.company_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1">
                  Target Role:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full-Stack Engineer, Machine Learning Engineer..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-gray-700 mb-1">
                  <span className="uppercase tracking-wider">Weekly Preparation Time:</span>
                  <span className="font-bold">{hoursPerWeek} hours / week</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="40"
                  step="2"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-[#F0442D] hover:bg-[#d63823] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Generating Plan...' : 'Generate Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import CompanyLogo from '../../components/common/CompanyLogo';
import { careerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase, Plus, Calendar, ExternalLink, Trash2,
  Edit2, Clock, CheckCircle2, AlertCircle, X, History, ShieldCheck
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'interested', label: 'Interested', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { id: 'preparing', label: 'Preparing', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  { id: 'applied', label: 'Applied', color: 'bg-blue-50 text-blue-900 border-blue-200' },
  { id: 'assessment', label: 'Assessment', color: 'bg-purple-50 text-purple-900 border-purple-200' },
  { id: 'interview', label: 'Interviewing', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  { id: 'offer', label: 'Offer Received', color: 'bg-emerald-600 text-white border-emerald-600' },
  { id: 'rejected', label: 'Archived / Rejected', color: 'bg-gray-100 text-gray-500 border-gray-200' },
];

export default function ApplicationTrackerPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    location: '',
    application_url: '',
    status: 'interested',
    applied_date: '',
    notes: '',
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await careerApi.listApplications();
      setApplications(res.data.applications || []);
    } catch {
      setError('Unable to load tracked applications.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingApp(null);
    setFormData({
      company_name: '',
      job_title: '',
      location: '',
      application_url: '',
      status: 'interested',
      applied_date: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (app) => {
    setEditingApp(app);
    setFormData({
      company_name: app.company_name,
      job_title: app.job_title,
      location: app.location || '',
      application_url: app.application_url || '',
      status: app.status,
      applied_date: app.applied_date || '',
      notes: app.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();
    try {
      if (editingApp) {
        const res = await careerApi.updateApplication(editingApp.id, formData);
        setApplications(prev => prev.map(a => a.id === editingApp.id ? res.data : a));
      } else {
        const res = await careerApi.createApplication(formData);
        setApplications(prev => [res.data, ...prev]);
      }
      setModalOpen(false);
    } catch {
      alert('Unable to save application record.');
    }
  };

  const handleDeleteApplication = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Remove this application from tracker?')) return;
    try {
      await careerApi.deleteApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('Unable to delete application.');
    }
  };

  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      const res = await careerApi.updateApplication(appId, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === appId ? res.data : a));
    } catch {
      alert('Unable to update application status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-jakarta flex flex-col antialiased">
      <TrustHireNavbar />

      {/* Header Bar */}
      <section className="bg-white border-b border-black/5 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
              Application Tracker
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              Track your job pipeline across application stages, interviews, and offers.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121613] hover:bg-black text-white text-xs font-semibold transition-colors shadow-2xs self-start sm:self-center"
          >
            <Plus size={15} />
            <span>Track Application</span>
          </button>
        </div>
      </section>

      {/* Main Kanban Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Loading tracked applications...
            </p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <AlertCircle size={24} className="text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-rose-900">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map((col) => {
              const colApps = applications.filter(a => a.status === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-gray-100/70 rounded-2xl p-3 flex flex-col min-h-[450px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-white text-gray-800 text-[11px] font-mono font-bold flex items-center justify-center shadow-2xs">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards in Column */}
                  <div className="flex-1 space-y-3">
                    {colApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-xl border border-black/5 p-4 shadow-xs hover:border-black/20 transition-all text-xs space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CompanyLogo
                              name={app.company_name}
                              size="w-6 h-6"
                              className="rounded-lg p-0.5"
                            />
                            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider truncate">
                              {app.company_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 shrink-0">
                            <button
                              onClick={() => openEditModal(app)}
                              className="text-gray-400 hover:text-black"
                              title="Edit application"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteApplication(app.id, e)}
                              className="text-gray-400 hover:text-rose-600"
                              title="Delete application"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-950 text-sm leading-snug">
                          {app.job_title}
                        </h4>

                        {app.location && (
                          <div className="text-gray-500 text-[11px]">
                            {app.location}
                          </div>
                        )}

                        {app.applied_date && (
                          <div className="text-[11px] font-mono text-gray-600 flex items-center gap-1">
                            <Calendar size={11} className="text-gray-400" />
                            <span>Applied: {app.applied_date}</span>
                          </div>
                        )}

                        {app.notes && (
                          <p className="text-[11px] text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100">
                            {app.notes}
                          </p>
                        )}

                        {/* Move stage dropdown */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <select
                            value={app.status}
                            onChange={(e) => handleQuickStatusChange(app.id, e.target.value)}
                            className="text-[11px] font-mono bg-transparent text-gray-600 hover:text-black focus:outline-none cursor-pointer"
                          >
                            {STATUS_COLUMNS.map(c => (
                              <option key={c.id} value={c.id}>
                                Move: {c.label}
                              </option>
                            ))}
                          </select>

                          {app.application_url && (
                            <a
                              href={app.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-black"
                              title="Open original application link"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE / EDIT APPLICATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h2 className="text-xl font-bold text-gray-950">
                {editingApp ? 'Edit Tracked Application' : 'Track New Job Application'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1">
                    Company Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloudflare"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1">
                    Position Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Systems Engineer"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1">
                    Status Stage:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:outline-none"
                  >
                    {STATUS_COLUMNS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1">
                    Date Applied:
                  </label>
                  <input
                    type="date"
                    value={formData.applied_date}
                    onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1">
                  Application / Destination URL:
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.application_url}
                  onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1">
                  Candidate Notes & Next Steps:
                </label>
                <textarea
                  rows="3"
                  placeholder="Record referral contacts, recruiter feedback, technical questions asked..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
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
                  className="px-6 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

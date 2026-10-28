import React, { useState, useEffect } from 'react';
import { careerApi } from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'interested', label: 'Interested', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { value: 'preparing', label: 'Preparing Application', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'applied', label: 'Applied', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'assessment', label: 'Online Assessment', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'interview', label: 'Interviewing', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'offer', label: 'Offer Received', color: 'bg-green-100 text-green-900 border-green-400 font-bold' },
  { value: 'rejected', label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-700 border-gray-300' },
];

export default function CareerTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal state for adding custom application
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);

  // Selected for editing
  const [editingApp, setEditingApp] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editAppliedDate, setEditAppliedDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    careerApi.listApplications()
      .then(res => {
        setApplications(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load tracked applications:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!newCompany || !newTitle) return;
    setCreating(true);
    try {
      await careerApi.createApplication({
        company_name: newCompany,
        job_title: newTitle,
        location: newLocation,
        application_url: newUrl,
        notes: newNotes,
        status: 'interested'
      });
      setShowAddModal(false);
      setNewCompany('');
      setNewTitle('');
      setNewLocation('');
      setNewUrl('');
      setNewNotes('');
      fetchApplications();
    } catch (err) {
      console.error('Failed to add application:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (app) => {
    setEditingApp(app);
    setEditStatus(app.status);
    setEditNotes(app.notes || '');
    setEditSalary(app.salary_offered || '');
    setEditAppliedDate(app.applied_date || '');
  };

  const handleSaveEdit = async () => {
    if (!editingApp) return;
    setSavingEdit(true);
    try {
      await careerApi.updateApplication(editingApp.id, {
        status: editStatus,
        notes: editNotes,
        salary_offered: editSalary,
        applied_date: editAppliedDate || null
      });
      setEditingApp(null);
      fetchApplications();
    } catch (err) {
      console.error('Failed to update application:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteApp = async (id) => {
    if (!window.confirm('Remove this application from tracker?')) return;
    try {
      await careerApi.deleteApplication(id);
      fetchApplications();
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const filteredApps = filterStatus === 'all'
    ? applications
    : applications.filter(a => a.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/20 border-t-[#050505] rounded-full animate-spin" />
          <span className="text-xs font-mono text-black/60">Loading application pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-black/60 font-mono mt-1">
            Audit-logged pipeline tracking submissions, dates, notes, and offer statuses. Total: {applications.length}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-[#050505] text-white text-xs font-mono font-semibold hover:bg-black/85 transition-colors self-start sm:self-auto shadow-sm"
        >
          + Add Application
        </button>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-[#E5E5E0] overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors ${
            filterStatus === 'all' ? 'bg-[#050505] text-white' : 'text-black/60 hover:text-black'
          }`}
        >
          All ({applications.length})
        </button>
        {STATUS_OPTIONS.map(opt => {
          const count = applications.filter(a => a.status === opt.value).length;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors ${
                filterStatus === opt.value ? 'bg-[#050505] text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications Table / Cards */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E5E0]">
          <div className="w-12 h-12 rounded-full bg-[#F4F4F0] text-xl flex items-center justify-center mx-auto mb-4">
            📋
          </div>
          <h3 className="text-lg font-bold text-[#050505]">No applications in this category</h3>
          <p className="text-xs text-black/60 max-w-sm mx-auto mt-1 mb-6">
            Add a position from Job Discovery or click "+ Add Application" to track your progress.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-full bg-[#050505] text-white text-xs font-mono font-semibold"
          >
            + Add First Application
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5E5E0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E0] bg-[#F4F4F0]/60 text-[11px] font-mono uppercase tracking-wider text-black/60">
                  <th className="py-4 px-6">Company & Position</th>
                  <th className="py-4 px-6">Current Stage</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6">Notes / Salary</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0] text-xs sm:text-sm">
                {filteredApps.map((app) => {
                  const statusObj = STATUS_OPTIONS.find(s => s.value === app.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={app.id} className="hover:bg-[#F8F2E3]/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#050505]">{app.job_title}</div>
                        <div className="text-xs text-black/60 font-mono mt-0.5">
                          {app.company_name} {app.location && `• ${app.location}`}
                        </div>
                        {app.application_url && (
                          <a
                            href={app.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-[#F0442D] hover:underline mt-1 inline-block"
                          >
                            Open Job Source ↗
                          </a>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full font-mono text-xs border ${statusObj.color}`}>
                          {statusObj.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono text-xs text-black/70">
                        {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-4 px-6 text-xs text-black/70 max-w-xs truncate">
                        {app.salary_offered && (
                          <div className="font-mono font-bold text-emerald-800">
                            Offer: {app.salary_offered}
                          </div>
                        )}
                        <span className="truncate block">{app.notes || 'No notes added'}</span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(app)}
                          className="px-3 py-1 rounded-lg border border-[#E5E5E0] hover:bg-[#F4F4F0] text-xs font-mono font-semibold"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApp(app.id)}
                          className="px-2 py-1 text-xs font-mono text-rose-600 hover:text-rose-800"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-black/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
              <h3 className="text-lg font-bold text-[#050505]">Track New Application</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-black/40 hover:text-black font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  placeholder="e.g. Stripe, Linear, Vercel"
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="e.g. Remote / San Francisco"
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Application URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Initial Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Referral contact, key skills emphasized..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5E0] text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#050505] text-white text-xs font-mono font-semibold hover:bg-black/85"
                >
                  {creating ? 'Adding...' : 'Save to Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-black/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
              <div>
                <span className="text-[10px] font-mono uppercase text-black/50">Update Pipeline</span>
                <h3 className="text-lg font-bold text-[#050505]">
                  {editingApp.job_title} @ {editingApp.company_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="text-black/40 hover:text-black font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Status Stage</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Applied Date</label>
                <input
                  type="date"
                  value={editAppliedDate}
                  onChange={e => setEditAppliedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Salary Offered</label>
                <input
                  type="text"
                  value={editSalary}
                  onChange={e => setEditSalary(e.target.value)}
                  placeholder="e.g. $165,000 / yr"
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-black/60 uppercase mb-1">Notes & Follow-ups</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none"
                />
              </div>

              {/* Status Audit Log */}
              {editingApp.history?.length > 0 && (
                <div className="p-3 rounded-xl bg-[#F4F4F0] text-[11px] font-mono space-y-1">
                  <span className="text-black/50 block uppercase text-[9px]">Audit History:</span>
                  {editingApp.history.map((h, hIdx) => (
                    <div key={hIdx} className="text-black/70">
                      • {new Date(h.timestamp).toLocaleDateString()}: {h.action}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5E0] text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-[#050505] text-white text-xs font-mono font-semibold hover:bg-black/85"
                >
                  {savingEdit ? 'Saving...' : 'Update Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

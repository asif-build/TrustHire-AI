import React, { useState, useEffect } from 'react';
import { careerApi } from '../../services/api';

export default function CareerApplications() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  
  const [generatingResume, setGeneratingResume] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [jobsRes, docsRes] = await Promise.all([
        careerApi.listJobs({ page_size: 50 }),
        careerApi.listDocuments()
      ]);
      setJobs(jobsRes.data.jobs || []);
      const docs = docsRes.data || [];
      setDocuments(docs);
      if (jobsRes.data.jobs?.length > 0) {
        setSelectedJobId(jobsRes.data.jobs[0].id);
      }
      if (docs.length > 0) {
        setActiveDoc(docs[0]);
        setEditedContent(docs[0].content || '');
      }
    } catch (err) {
      console.error('Failed to load studio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleSelectDoc = (doc) => {
    setActiveDoc(doc);
    setEditedContent(doc.content || '');
    setMessage('');
  };

  const handleGenerateResume = async () => {
    if (!selectedJobId) return;
    setGeneratingResume(true);
    setMessage('');
    try {
      const res = await careerApi.generateResume(selectedJobId);
      setDocuments(prev => [res.data, ...prev]);
      setActiveDoc(res.data);
      setEditedContent(res.data.content);
      setMessage('Tailored resume created successfully with hallucination audit.');
    } catch (err) {
      setMessage('Failed to generate resume. Please verify your profile data.');
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!selectedJobId) return;
    setGeneratingLetter(true);
    setMessage('');
    try {
      const res = await careerApi.generateCoverLetter(selectedJobId);
      setDocuments(prev => [res.data, ...prev]);
      setActiveDoc(res.data);
      setEditedContent(res.data.content);
      setMessage('Tailored cover letter created successfully.');
    } catch (err) {
      setMessage('Failed to generate cover letter.');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!activeDoc) return;
    setSavingDoc(true);
    try {
      const res = await careerApi.updateDocument(activeDoc.id, {
        content: editedContent
      });
      setActiveDoc(res.data);
      setDocuments(docs => docs.map(d => d.id === res.data.id ? res.data : d));
      setMessage('Document saved successfully (Version incremented).');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save document changes.');
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDownload = () => {
    if (!activeDoc) return;
    const blob = new Blob([editedContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDoc.title.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/20 border-t-[#050505] rounded-full animate-spin" />
          <span className="text-xs font-mono text-black/60">Loading Application Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight">
          Application Studio
        </h1>
        <p className="text-xs sm:text-sm text-black/60 font-mono mt-1">
          Tailor resumes and cover letters for specific job requirements. Grounded strictly in verified artifacts.
        </p>
      </div>

      {/* Target Job Selector & Action Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <label className="block text-xs font-mono text-black/60 uppercase tracking-wider mb-2">
            Select Target Job Opening
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBFBFA] border border-[#E5E5E0] text-sm focus:outline-none focus:border-black/40"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} @ {j.company_name} ({j.location || 'Remote'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateResume}
            disabled={generatingResume}
            className="px-4 py-2.5 rounded-xl bg-[#050505] text-white text-xs font-mono font-semibold hover:bg-black/85 transition-colors disabled:opacity-50"
          >
            {generatingResume ? 'Crafting Resume...' : 'Tailor Resume'}
          </button>

          <button
            type="button"
            onClick={handleGenerateLetter}
            disabled={generatingLetter}
            className="px-4 py-2.5 rounded-xl border border-black/20 bg-white text-[#050505] text-xs font-mono font-semibold hover:bg-[#F4F4F0] transition-colors disabled:opacity-50"
          >
            {generatingLetter ? 'Writing Letter...' : 'Draft Cover Letter'}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
          {message}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 4 Cols: Document Versions List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-mono text-black/50 uppercase tracking-wider block px-1">
            Generated Documents ({documents.length})
          </span>

          {documents.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E0] text-center text-xs font-mono text-black/50">
              No tailored documents yet. Select a job above and click "Tailor Resume" or "Draft Cover Letter".
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <button
                    type="button"
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white border-black/30 shadow-sm scale-[1.01]'
                        : 'bg-white/70 border-[#E5E5E0] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 text-black/70 uppercase">
                        {doc.document_type === 'tailored_resume' ? 'Resume' : 'Cover Letter'}
                      </span>
                      <span className="text-[10px] font-mono text-black/40">
                        v{doc.version}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#050505] line-clamp-1">
                      {doc.title}
                    </h4>
                    <span className="text-[11px] font-mono text-black/50 block mt-1">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Editable Document Canvas & Audit Inspector */}
        {activeDoc && (
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E0] shadow-sm space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E0]">
              <div>
                <span className="text-xs font-mono text-black/50 uppercase">
                  {activeDoc.company_name || 'Tailored Document'} • Version {activeDoc.version}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#050505]">
                  {activeDoc.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-2 rounded-xl border border-black/20 hover:bg-[#F4F4F0] text-xs font-mono font-semibold"
                >
                  Download .md
                </button>
                <button
                  type="button"
                  onClick={handleSaveDocument}
                  disabled={savingDoc}
                  className="px-4 py-2 rounded-xl bg-[#050505] text-white hover:bg-black/85 text-xs font-semibold"
                >
                  {savingDoc ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Coverage Report & Hallucination Audit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Coverage Report Card */}
              {activeDoc.coverage_report?.coverage_percentage !== undefined && (
                <div className="p-4 rounded-2xl bg-[#F8F2E3]/50 border border-black/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase text-black/60">Requirement Coverage</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {activeDoc.coverage_report.coverage_percentage}% Covered
                    </span>
                  </div>
                  <p className="text-xs text-black/70 font-mono">
                    {activeDoc.coverage_report.matched_skills?.length || 0} of {activeDoc.coverage_report.total_requirements || 0} skills addressed directly from your background.
                  </p>
                </div>
              )}

              {/* Unsupported Claims Review */}
              <div className="p-4 rounded-2xl bg-[#F4F4F0] border border-black/10">
                <span className="text-xs font-mono font-bold uppercase text-black/60 block mb-2">
                  Hallucination Audit
                </span>
                <ul className="space-y-1 text-xs font-mono text-black/70">
                  {activeDoc.unsupported_claims_review?.map((audit, aIdx) => (
                    <li key={aIdx} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{audit.check} ({audit.status})</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Editable Content Area */}
            <div>
              <label className="block text-xs font-mono text-black/50 uppercase tracking-wider mb-2">
                Editable Document Content (Markdown)
              </label>
              <textarea
                rows={18}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#FBFBFA] border border-[#E5E5E0] font-mono text-xs sm:text-sm text-black/85 leading-relaxed focus:outline-none focus:border-black/40"
              />
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

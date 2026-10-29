import React, { useState, useEffect, useRef } from 'react';
import { careerApi } from '../../services/api';
import UploadDropzone from '../../components/ui/UploadDropzone';

export default function CareerResume() {
  const replaceInputRef = useRef(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsingStep, setParsingStep] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [selectedFileMeta, setSelectedFileMeta] = useState(null);

  // Review & Confirmation State
  const [reviewData, setReviewData] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');

  // Reanalyse & Replace State
  const [operatingId, setOperatingId] = useState(null);
  const [targetReplaceId, setTargetReplaceId] = useState(null);

  // Resume Improvement Assistant State (Phase 8)
  const [improving, setImproving] = useState(false);
  const [improvementReport, setImprovementReport] = useState(null);
  const [activeTab, setActiveTab] = useState('manager'); // 'manager' | 'improvement'

  const fetchResumes = () => {
    setLoading(true);
    careerApi.listResumes()
      .then(res => {
        setResumes(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load resumes:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleProcessFile = async (file, replaceDocId = null) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit. Please upload a smaller PDF or DOCX file.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setUploadError('Unsupported format. Only authentic PDF (.pdf) and Word (.docx) documents are permitted.');
      return;
    }

    setSelectedFileMeta({ name: file.name, size: file.size });
    setUploading(true);
    setUploadError('');
    setConfirmSuccess('');
    setUploadProgress(25);
    setParsingStep('Verifying file signature & magic bytes...');

    try {
      setTimeout(() => {
        setUploadProgress(60);
        setParsingStep('Parsing document text & extracting structured competencies...');
      }, 350);

      let res;
      if (replaceDocId) {
        res = await careerApi.replaceResume(replaceDocId, file);
      } else {
        res = await careerApi.uploadResume(file);
      }

      setUploadProgress(100);
      setParsingStep('Analysis complete!');

      if (res.data?.extracted_preview) {
        setReviewData({
          ...res.data.extracted_preview,
          skills: res.data.extracted_preview.skills || [],
          candidate_name: res.data.extracted_preview.candidate_name || '',
          headline: res.data.extracted_preview.headline || '',
          email: res.data.extracted_preview.email || '',
          phone: res.data.extracted_preview.phone || '',
          location: res.data.extracted_preview.location || '',
          education: res.data.extracted_preview.education || [],
          work_experience: res.data.extracted_preview.work_experience || [],
          projects: res.data.extracted_preview.projects || [],
          certifications: res.data.extracted_preview.certifications || [],
        });
      }

      fetchResumes();
      return res;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to parse resume document. Please ensure it is an unencrypted, valid file.';
      setUploadError(msg);
      setUploadProgress(0);
      setParsingStep('');
      throw err;
    } finally {
      setUploading(false);
      setTargetReplaceId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleReanalyse = async (id) => {
    setOperatingId(id);
    setUploadError('');
    try {
      const res = await careerApi.reanalyseResume(id);
      if (res.data?.extracted_preview) {
        setReviewData({
          ...res.data.extracted_preview,
          skills: res.data.extracted_preview.skills || [],
          education: res.data.extracted_preview.education || [],
          work_experience: res.data.extracted_preview.work_experience || [],
          projects: res.data.extracted_preview.projects || []
        });
      }
      fetchResumes();
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to reanalyse document.');
    } finally {
      setOperatingId(null);
    }
  };

  const handleTriggerReplace = (id) => {
    setTargetReplaceId(id);
    replaceInputRef.current?.click();
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume? The original file and associated analysis will be safely removed.')) {
      return;
    }
    setOperatingId(id);
    try {
      await careerApi.deleteResume(id);
      fetchResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    } finally {
      setOperatingId(null);
    }
  };

  const handleAddSkill = () => {
    const s = newSkillInput.trim();
    if (s && reviewData && !reviewData.skills.includes(s)) {
      setReviewData({
        ...reviewData,
        skills: [...reviewData.skills, s]
      });
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (!reviewData) return;
    setReviewData({
      ...reviewData,
      skills: reviewData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleConfirmExtraction = async () => {
    if (!reviewData) return;
    setConfirming(true);
    setUploadError('');
    try {
      await careerApi.confirmProfile({
        headline: reviewData.headline || (reviewData.candidate_name ? `${reviewData.candidate_name} — Candidate` : 'Software Engineering Professional'),
        skills: reviewData.skills,
        education: reviewData.education,
        work_experience: reviewData.work_experience,
        projects: reviewData.projects,
        certifications: reviewData.certifications
      });
      setConfirmSuccess('Extracted information confirmed! Your authoritative career profile, job recommendations, and roadmaps are now updated.');
      setReviewData(null);
      setSelectedFileMeta(null);
    } catch (err) {
      setUploadError('Failed to confirm and update career profile.');
    } finally {
      setConfirming(false);
    }
  };

  const handleRunImprovementAssistant = async () => {
    setImproving(true);
    try {
      const res = await careerApi.improveResume({ target_role: reviewData?.headline || 'Software Engineer' });
      setImprovementReport(res.data);
      setActiveTab('improvement');
    } catch (err) {
      console.error('Improvement assistant failed:', err);
    } finally {
      setImproving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Required Header (Phase 2) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight">
          Your career starts with understanding your potential.
        </h1>
        <p className="text-xs sm:text-sm text-black/60 font-sans mt-2 max-w-2xl leading-relaxed">
          Upload your resume to discover your strengths, find relevant opportunities, and build a personalised career roadmap.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-black/10 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('manager')}
          className={`px-4 py-2 font-mono text-xs font-semibold rounded-t-lg transition-colors ${
            activeTab === 'manager'
              ? 'border-b-2 border-[#050505] text-[#050505]'
              : 'text-black/50 hover:text-black/80'
          }`}
        >
          Resume Documents & Ingestion
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('improvement');
            if (!improvementReport) handleRunImprovementAssistant();
          }}
          className={`px-4 py-2 font-mono text-xs font-semibold rounded-t-lg transition-colors ${
            activeTab === 'improvement'
              ? 'border-b-2 border-[#050505] text-[#050505]'
              : 'text-black/50 hover:text-black/80'
          }`}
        >
          Resume Improvement Assistant
        </button>
      </div>

      {activeTab === 'manager' && (
        <>
          {/* Unified Apple-grade Physics Resume Upload Dropzone */}
          <div className="bg-white dark:bg-[#121613] rounded-3xl p-8 sm:p-12 border border-[#E5E5E0] dark:border-white/10 shadow-sm mb-6 flex flex-col items-center justify-center text-center">
            {/* Hidden file input for Replace action in documents table */}
            <input
              ref={replaceInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0], targetReplaceId)}
              className="hidden"
              id="replace-file-input"
            />

            <UploadDropzone
              onUpload={handleProcessFile}
              accept=".pdf,.docx"
              maxSizeMb={10}
            />

            {/* Error Notice */}
            {uploadError && (
              <div className="mt-5 p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-800 text-xs font-mono max-w-md w-full text-left">
                <strong>Upload Notice:</strong> {uploadError}
              </div>
            )}

            {/* Success Notice */}
            {confirmSuccess && (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-mono max-w-md w-full text-left">
                ✓ {confirmSuccess}
              </div>
            )}
          </div>

          {/* Review & Confirmation Screen (Phase 3 Requirement) */}
          {reviewData && (
            <div className="bg-[#F8F2E3] rounded-3xl p-6 sm:p-8 border border-black/15 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 text-[#F0442D] uppercase font-bold">
                    Review Before Saving
                  </span>
                  <h3 className="text-xl font-bold text-[#050505] mt-1">
                    Structured Resume Review & Confirmation
                  </h3>
                  <p className="text-xs text-black/70 mt-0.5">
                    Verify extracted competencies. Information confirmed here directly drives job matching and learning roadmaps.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmExtraction}
                  disabled={confirming}
                  className="px-6 py-2.5 rounded-full bg-[#050505] text-white text-xs font-mono font-semibold hover:bg-black/85 transition-colors self-start sm:self-auto shadow-sm"
                >
                  {confirming ? 'Saving Profile...' : 'Confirm & Save to Profile ✓'}
                </button>
              </div>

              {/* Basic Information Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-white p-3.5 rounded-xl border border-black/10">
                  <label className="text-black/50 block text-[10px] uppercase font-bold mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={reviewData.candidate_name || ''}
                    onChange={(e) => setReviewData({ ...reviewData, candidate_name: e.target.value })}
                    placeholder="Candidate name"
                    className="w-full text-xs font-semibold text-[#050505] bg-transparent outline-none"
                  />
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-black/10">
                  <label className="text-black/50 block text-[10px] uppercase font-bold mb-1">Headline / Role</label>
                  <input
                    type="text"
                    value={reviewData.headline || ''}
                    onChange={(e) => setReviewData({ ...reviewData, headline: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full text-xs font-semibold text-[#050505] bg-transparent outline-none"
                  />
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-black/10">
                  <label className="text-black/50 block text-[10px] uppercase font-bold mb-1">Contact Email</label>
                  <input
                    type="text"
                    value={reviewData.email || ''}
                    onChange={(e) => setReviewData({ ...reviewData, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full text-xs font-semibold text-[#050505] bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Uncertainty Warnings */}
              {reviewData.uncertainties?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <strong className="font-mono text-[11px] block mb-1">Uncertainty Notice:</strong>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {reviewData.uncertainties.map((u, idx) => (
                      <li key={idx}><strong>{u.field}</strong>: {u.reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Editor */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-black/60 font-bold uppercase">
                    Extracted Competencies ({reviewData.skills.length})
                  </span>
                  <span className="text-[10px] font-mono text-black/40">
                    Click (×) to remove or add below
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {reviewData.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F2E3] text-[#050505] text-xs font-mono font-medium border border-black/5"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-black/40 hover:text-rose-600 text-[10px] font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill inline */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Add an additional skill (e.g. Docker, Redis)..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-black/15 text-xs font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-1.5 rounded-lg bg-[#050505] text-white text-xs font-mono font-semibold"
                  >
                    Add +
                  </button>
                </div>
              </div>

              {/* Work Experience Preview */}
              {reviewData.work_experience?.length > 0 && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 space-y-3">
                  <span className="text-xs font-mono text-black/60 font-bold uppercase block">
                    Work Experience ({reviewData.work_experience.length})
                  </span>
                  <div className="space-y-3">
                    {reviewData.work_experience.map((exp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#FBFBFA] border border-black/5 text-xs">
                        <div className="flex items-center justify-between font-bold text-[#050505]">
                          <span>{exp.role_or_company || exp.role}</span>
                          <span className="text-[11px] font-mono text-black/50">{exp.dates}</span>
                        </div>
                        {exp.impact_evidence?.length > 0 && (
                          <div className="mt-1 text-[11px] text-emerald-800 font-mono">
                            ✓ {exp.impact_evidence.length} measurable impact bullet(s) detected.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Uploaded Documents List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#050505]">
                Uploaded Resume Documents ({resumes.length})
              </h3>
              <span className="text-xs font-mono text-black/50">
                Primary document is used for job matching
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs font-mono text-black/50">
                Loading documents...
              </div>
            ) : resumes.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-black/50">
                No resume files uploaded yet. Upload a PDF or DOCX above to begin.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E5E0]">
                {resumes.map((doc) => {
                  const isOperating = operatingId === doc.id;
                  return (
                    <div key={doc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-[#F4F4F0] flex items-center justify-center text-xs font-mono font-bold uppercase">
                          {doc.file_type}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#050505]">{doc.file_name}</h4>
                            {doc.is_primary && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black text-white uppercase font-bold">
                                Active Primary
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-black/50">
                            {Math.round(doc.file_size / 1024)} KB • Analyzed {new Date(doc.updated_at || doc.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                          doc.parsing_status === 'parsed' ? 'bg-emerald-50 text-emerald-800' :
                          doc.parsing_status === 'ocr_required' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {doc.parsing_status}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleReanalyse(doc.id)}
                          disabled={isOperating}
                          className="text-xs font-mono text-black/70 hover:text-black px-2.5 py-1 rounded-md border border-black/10 hover:bg-black/5"
                        >
                          {isOperating ? 'Processing...' : 'Reanalyse 🔄'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTriggerReplace(doc.id)}
                          disabled={isOperating}
                          className="text-xs font-mono text-black/70 hover:text-black px-2.5 py-1 rounded-md border border-black/10 hover:bg-black/5"
                        >
                          Replace 📁
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteResume(doc.id)}
                          disabled={isOperating}
                          className="text-xs font-mono text-rose-600 hover:text-rose-800 px-2.5 py-1 rounded-md hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Phase 8: Resume Improvement Assistant Tab */}
      {activeTab === 'improvement' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E0] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E0]">
              <div>
                <h3 className="text-xl font-bold text-[#050505]">
                  Resume Improvement Assistant
                </h3>
                <p className="text-xs text-black/60 font-mono mt-1">
                  Objective, evidence-backed recommendations for stronger bullet points without fabricated metrics.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunImprovementAssistant}
                disabled={improving}
                className="px-5 py-2.5 rounded-full bg-[#050505] text-white text-xs font-mono font-semibold hover:bg-black/85 transition-colors self-start sm:self-auto"
              >
                {improving ? 'Auditing Resume...' : 'Re-run Assistant ⚡'}
              </button>
            </div>

            {improving ? (
              <div className="py-12 text-center text-xs font-mono text-black/50">
                Evaluating document clarity, structure, and impact evidence...
              </div>
            ) : improvementReport ? (
              <div className="mt-6 space-y-6">
                {/* Clarity & Impact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F8F2E3] p-4 rounded-2xl border border-black/10">
                    <span className="text-[10px] font-mono text-black/50 uppercase block">Clarity Score</span>
                    <span className="text-2xl font-extrabold font-mono text-[#050505]">
                      {improvementReport.clarity_score}/100
                    </span>
                    <p className="text-[11px] text-black/70 mt-1">{improvementReport.clarity_feedback?.summary}</p>
                  </div>

                  <div className="bg-[#F8F2E3] p-4 rounded-2xl border border-black/10">
                    <span className="text-[10px] font-mono text-black/50 uppercase block">Structure Hierarchy</span>
                    <span className="text-2xl font-extrabold font-mono text-[#050505]">
                      {improvementReport.structure_feedback?.status}
                    </span>
                    <p className="text-[11px] text-black/70 mt-1">{improvementReport.structure_feedback?.summary}</p>
                  </div>

                  <div className="bg-[#F8F2E3] p-4 rounded-2xl border border-black/10">
                    <span className="text-[10px] font-mono text-black/50 uppercase block">Impact Evidence</span>
                    <span className="text-2xl font-extrabold font-mono text-[#050505]">
                      {improvementReport.impact_evidence_feedback?.status}
                    </span>
                    <p className="text-[11px] text-black/70 mt-1">{improvementReport.impact_evidence_feedback?.summary}</p>
                  </div>
                </div>

                {/* Bullet Suggestions */}
                <div>
                  <h4 className="text-sm font-bold text-[#050505] mb-3">
                    Action Verb & Impact Enhancements (Factual Claims Preserved)
                  </h4>
                  <div className="space-y-3">
                    {improvementReport.bullet_suggestions?.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-black/10 bg-[#FBFBFA] space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-rose-800 font-bold uppercase block">Original Phrasing:</span>
                          <p className="text-black/70 italic font-mono text-[11px]">{item.original}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">Suggested Authoritative Version:</span>
                          <p className="text-emerald-950 font-semibold">{item.suggested}</p>
                        </div>
                        <span className="text-[10px] font-mono text-black/50 block">
                          Rationale: {item.rationale}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Info Checklist */}
                {improvementReport.missing_information?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
                    <h5 className="font-bold text-amber-950 mb-2">Recommended Additions to Strengthen Profile</h5>
                    <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-[11px]">
                      {improvementReport.missing_information.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-mono text-black/50">
                Click "Re-run Assistant" to evaluate your active resume against industry engineering standards.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { careerApi } from '../../services/api';

export default function CareerInterviewPrep() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  
  const [generating, setGenerating] = useState(false);
  const [submittingQuestionId, setSubmittingQuestionId] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [jobsRes, sessRes] = await Promise.all([
        careerApi.listJobs({ page_size: 50 }),
        careerApi.listInterviewSessions()
      ]);
      setJobs(jobsRes.data.jobs || []);
      const sessList = sessRes.data || [];
      setSessions(sessList);
      if (jobsRes.data.jobs?.length > 0) {
        setSelectedJobId(jobsRes.data.jobs[0].id);
      }
      if (sessList.length > 0) {
        setActiveSession(sessList[0]);
        setUserAnswers(sessList[0].user_answers || {});
      }
    } catch (err) {
      console.error('Failed to load interview prep data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleSelectSession = (sess) => {
    setActiveSession(sess);
    setUserAnswers(sess.user_answers || {});
    setMessage('');
  };

  const handleGenerateSession = async () => {
    if (!selectedJobId) return;
    setGenerating(true);
    setMessage('');
    try {
      const res = await careerApi.generateInterviewPrep(selectedJobId);
      setSessions(prev => [res.data, ...prev]);
      setActiveSession(res.data);
      setUserAnswers({});
      setMessage('New 4-part interview preparation session generated.');
    } catch (err) {
      setMessage('Failed to generate interview questions.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (qId, text) => {
    setUserAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmitAnswer = async (qId) => {
    const text = userAnswers[qId];
    if (!text || !text.trim() || !activeSession) return;

    setSubmittingQuestionId(qId);
    try {
      const res = await careerApi.submitInterviewAnswer(activeSession.id, qId, text);
      setActiveSession(res.data.session);
      setSessions(sess => sess.map(s => s.id === res.data.session.id ? res.data.session : s));
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setSubmittingQuestionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/20 border-t-[#050505] rounded-full animate-spin" />
          <span className="text-xs font-mono text-black/60">Loading interview simulator...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight">
          Interview Preparation
        </h1>
        <p className="text-xs sm:text-sm text-black/60 font-mono mt-1">
          Role-grounded questions across technical, system design, project, and behavioral competencies.
        </p>
      </div>

      {/* Target Job Selector & New Session Action */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <label className="block text-xs font-mono text-black/60 uppercase tracking-wider mb-2">
            Select Position for Interview Rehearsal
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

        <button
          type="button"
          onClick={handleGenerateSession}
          disabled={generating}
          className="px-6 py-2.5 rounded-xl bg-[#050505] text-white text-xs font-mono font-semibold hover:bg-black/85 transition-colors disabled:opacity-50"
        >
          {generating ? 'Formulating Questions...' : 'Generate New Interview Session 🎙️'}
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
          {message}
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 4 Cols: Previous Sessions List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-mono text-black/50 uppercase tracking-wider block px-1">
            Interview Sessions ({sessions.length})
          </span>

          {sessions.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E5E0] text-center text-xs font-mono text-black/50">
              No interview sessions yet. Select a job above and click "Generate New Interview Session".
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const isSelected = activeSession?.id === sess.id;
                const answeredCount = Object.keys(sess.user_answers || {}).length;
                return (
                  <button
                    type="button"
                    key={sess.id}
                    onClick={() => handleSelectSession(sess)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white border-black/30 shadow-sm scale-[1.01]'
                        : 'bg-white/70 border-[#E5E5E0] hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-semibold text-black/60 truncate block">
                      {sess.company_name}
                    </span>
                    <h4 className="text-sm font-bold text-[#050505] line-clamp-1 mt-0.5">
                      {sess.role_title}
                    </h4>
                    <div className="text-[11px] font-mono text-black/50 mt-2 flex items-center justify-between">
                      <span>{answeredCount} / {sess.questions?.length || 4} Answered</span>
                      <span>{new Date(sess.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Grounded Questions & Practice Console */}
        {activeSession && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Session Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E0] shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-black/50 block">
                Target Interview Scenario
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mt-1">
                {activeSession.role_title} @ {activeSession.company_name}
              </h2>
              <p className="text-xs text-black/60 font-mono mt-1">
                Notice: Questions are preparation simulations grounded in your verified background and job requirements.
              </p>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {activeSession.questions?.map((q, idx) => {
                const existingFeedback = activeSession.feedback?.[q.id];
                const isSubmitting = submittingQuestionId === q.id;

                return (
                  <div
                    key={q.id || idx}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E0] shadow-sm space-y-5"
                  >
                    {/* Category & Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E0]">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#F8F2E3] text-[#F0442D] border border-black/5 self-start">
                        {q.category}
                      </span>
                      <span className="text-xs font-mono text-black/40">Question {idx + 1} of 4</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#050505] leading-snug">
                      {q.question}
                    </h3>

                    {/* Grounding Context & Recommended Structure */}
                    <div className="p-4 rounded-2xl bg-[#F4F4F0]/80 text-xs space-y-2">
                      <p className="text-black/70">
                        <strong>Why this is asked:</strong> {q.context}
                      </p>
                      <p className="text-black/70 font-mono">
                        <strong>Suggested Structure:</strong> {q.suggested_structure}
                      </p>
                    </div>

                    {/* Candidate Answer Textarea */}
                    <div>
                      <label className="block text-xs font-mono text-black/50 uppercase tracking-wider mb-2">
                        Your Practice Response
                      </label>
                      <textarea
                        rows={5}
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Type your practice response here (explain your reasoning, architectural trade-offs, or concrete examples)..."
                        className="w-full p-4 rounded-2xl bg-[#FBFBFA] border border-[#E5E5E0] text-xs sm:text-sm text-black/85 leading-relaxed focus:outline-none focus:border-black/40"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer(q.id)}
                        disabled={isSubmitting || !userAnswers[q.id]?.trim()}
                        className="px-5 py-2.5 rounded-full bg-[#050505] text-white text-xs font-mono font-semibold hover:bg-black/85 transition-colors disabled:opacity-40"
                      >
                        {isSubmitting ? 'Evaluating...' : 'Submit for Rubric Evaluation ✓'}
                      </button>
                    </div>

                    {/* AI Feedback Card */}
                    {existingFeedback && (
                      <div className="mt-4 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold uppercase text-emerald-900">
                            Evaluator Rubric Feedback
                          </span>
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                            Score: {existingFeedback.score} / 100
                          </span>
                        </div>

                        <div className="text-xs text-emerald-950 space-y-1.5">
                          <p><strong>Strengths:</strong> {existingFeedback.strengths}</p>
                          <p><strong>Recommended Revision:</strong> {existingFeedback.areas_for_improvement}</p>
                        </div>

                        {existingFeedback.rubric && (
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-[11px] font-mono">
                            <div className="bg-white/80 p-2 rounded-lg text-center">
                              <span className="text-black/50 block text-[9px]">CLARITY</span>
                              <span className="font-bold text-emerald-900">{existingFeedback.rubric.structure_clarity}</span>
                            </div>
                            <div className="bg-white/80 p-2 rounded-lg text-center">
                              <span className="text-black/50 block text-[9px]">DEPTH</span>
                              <span className="font-bold text-emerald-900">{existingFeedback.rubric.technical_depth}</span>
                            </div>
                            <div className="bg-white/80 p-2 rounded-lg text-center">
                              <span className="text-black/50 block text-[9px]">OUTCOME</span>
                              <span className="font-bold text-emerald-900">{existingFeedback.rubric.outcome_focus}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

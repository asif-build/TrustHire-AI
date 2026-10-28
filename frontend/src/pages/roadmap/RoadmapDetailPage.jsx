import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import { careerApi } from '../../services/api';
import {
  Sparkles, CheckCircle2, Circle, Clock, BookOpen, Code,
  ExternalLink, ArrowLeft, ShieldCheck, ChevronDown, ChevronUp,
  AlertCircle, Check, Send
} from 'lucide-react';

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded phases state
  const [expandedPhases, setExpandedPhases] = useState({});
  // Editing evidence state
  const [evidenceInputs, setEvidenceInputs] = useState({});
  const [savingTask, setSavingTask] = useState({});

  useEffect(() => {
    loadRoadmap();
  }, [roadmapId]);

  const loadRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await careerApi.getRoadmap(roadmapId);
      setRoadmap(res.data);
      // Expand first 2 phases by default
      const initialExpanded = {};
      if (res.data.phases && res.data.phases.length > 0) {
        initialExpanded[res.data.phases[0].id] = true;
        if (res.data.phases[1]) initialExpanded[res.data.phases[1].id] = true;
      }
      setExpandedPhases(initialExpanded);
    } catch (err) {
      setError('Unable to load roadmap details.');
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    setSavingTask(prev => ({ ...prev, [taskId]: true }));

    try {
      await careerApi.updateTaskProgress(taskId, { status: nextStatus });
      // Update local state smoothly
      setRoadmap(prev => {
        const updatedPhases = prev.phases.map(ph => ({
          ...ph,
          tasks: ph.tasks.map(t => t.id === taskId ? {
            ...t,
            status: nextStatus,
            completed_at: nextStatus === 'completed' ? new Date().toISOString() : null
          } : t)
        }));
        return { ...prev, phases: updatedPhases };
      });
    } catch {
      alert('Unable to update task progress.');
    } finally {
      setSavingTask(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleSaveEvidence = async (taskId) => {
    const text = evidenceInputs[taskId];
    if (text === undefined) return;

    setSavingTask(prev => ({ ...prev, [taskId]: true }));
    try {
      await careerApi.updateTaskProgress(taskId, { user_evidence: text });
      setRoadmap(prev => {
        const updatedPhases = prev.phases.map(ph => ({
          ...ph,
          tasks: ph.tasks.map(t => t.id === taskId ? { ...t, user_evidence: text } : t)
        }));
        return { ...prev, phases: updatedPhases };
      });
    } catch {
      alert('Unable to save evidence.');
    } finally {
      setSavingTask(prev => ({ ...prev, [taskId]: false }));
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

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col antialiased">
        <TrustHireNavbar />
        <div className="max-w-md mx-auto my-20 p-8 bg-white border border-gray-200 rounded-3xl text-center shadow-xs">
          <AlertCircle size={36} className="text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Roadmap Not Found</h2>
          <p className="text-xs text-gray-500 mt-1">{error || 'This career roadmap could not be retrieved.'}</p>
          <Link to="/career-roadmap" className="mt-4 inline-block px-4 py-2 bg-black text-white text-xs font-medium rounded-full">
            Back to Roadmaps
          </Link>
        </div>
      </div>
    );
  }

  // Calculate overall task stats
  let totalTasks = 0;
  let completedTasks = 0;
  roadmap.phases?.forEach(p => {
    p.tasks?.forEach(t => {
      totalTasks++;
      if (t.status === 'completed') completedTasks++;
    });
  });
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-jakarta flex flex-col antialiased">
      <TrustHireNavbar />

      {/* Header Bar */}
      <section className="bg-white border-b border-black/5 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <Link
            to="/career-roadmap"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to all roadmaps</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                  Target Employer: {roadmap.company_name}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active Preparation Plan
                </span>
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-950">
                {roadmap.target_role} Roadmap
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
                {roadmap.readiness_summary}
              </p>
            </div>

            {/* Score & Progress Pill */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                  Readiness Score
                </span>
                <div className="text-2xl font-black font-mono text-gray-950">
                  {roadmap.readiness_score}%
                </div>
              </div>

              <div className="h-10 w-[1px] bg-gray-200" />

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                  Plan Progress
                </span>
                <div className="text-sm font-bold font-mono text-emerald-700">
                  {completedTasks} / {totalTasks} Tasks ({progressPercent}%)
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Roadmap Phases Timeline */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Anti-Hallucination Methodology Notice */}
        <div className="mb-8 p-4 rounded-2xl bg-[#F4F4F0] border border-black/5 text-xs text-gray-600 flex items-start gap-3">
          <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-gray-900">Explainable Scoring Notice: </span>
            {roadmap.methodology_disclaimer}
          </div>
        </div>

        {/* Phases Accordion / Timeline */}
        <div className="space-y-6">
          {roadmap.phases?.map((phase, pIdx) => {
            const isExpanded = expandedPhases[phase.id];
            const pCompleted = phase.tasks?.filter(t => t.status === 'completed').length || 0;
            const pTotal = phase.tasks?.length || 0;

            return (
              <div
                key={phase.id}
                className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-xs transition-all duration-200"
              >
                {/* Phase Header */}
                <div
                  onClick={() => togglePhase(phase.id)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors select-none"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      pCompleted === pTotal && pTotal > 0
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-900 text-white'
                    }`}>
                      {pCompleted === pTotal && pTotal > 0 ? <Check size={16} /> : phase.phase_number}
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-950">
                        {phase.title}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {phase.description} • ~{phase.estimated_weeks} weeks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-medium text-gray-500">
                      {pCompleted} / {pTotal} completed
                    </span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Phase Tasks (when expanded) */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-gray-100 space-y-5">
                    {phase.tasks?.map((task) => {
                      const isDone = task.status === 'completed';

                      return (
                        <div
                          key={task.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isDone
                              ? 'bg-emerald-50/30 border-emerald-200/80'
                              : 'bg-white border-gray-200 hover:border-black/20'
                          }`}
                        >
                          {/* Task Title & Checkbox */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                disabled={savingTask[task.id]}
                                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-gray-300 hover:border-black bg-white'
                                }`}
                              >
                                {isDone && <Check size={13} strokeWidth={3} />}
                              </button>

                              <div>
                                <h3 className={`text-sm sm:text-base font-semibold text-gray-950 ${
                                  isDone ? 'line-through text-gray-500' : ''
                                }`}>
                                  {task.title}
                                </h3>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                    task.priority === 'high'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {task.priority} Priority
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-gray-500 font-mono text-[11px] flex items-center gap-1">
                                    <Clock size={11} />
                                    {task.estimated_effort}
                                  </span>
                                  {task.related_requirement && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-gray-500 text-[11px]">
                                        Requirement: <strong className="text-gray-800">{task.related_requirement}</strong>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isDone && task.completed_at && (
                              <span className="text-[11px] font-mono text-emerald-700 shrink-0">
                                Completed {new Date(task.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* Task Explanation & Why it matters */}
                          <div className="mt-3 text-xs sm:text-sm text-gray-600 space-y-1.5 pl-8">
                            <p>{task.explanation}</p>
                            <p className="text-gray-800 font-medium">
                              <strong>Why this matters: </strong> {task.why_it_matters}
                            </p>
                          </div>

                          {/* Completion Criteria */}
                          {task.completion_criteria && (
                            <div className="mt-3 pl-8 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <span className="font-semibold text-gray-900">Completion Criteria: </span>
                              {task.completion_criteria}
                            </div>
                          )}

                          {/* Verified Learning Resources */}
                          {task.learning_resources && task.learning_resources.length > 0 && (
                            <div className="mt-4 pl-8">
                              <span className="text-xs font-mono uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                                <BookOpen size={13} className="text-emerald-700" />
                                <span>Verified Learning Resources</span>
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {task.learning_resources.map((res) => (
                                  <a
                                    key={res.id}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-white border border-gray-200 hover:border-black flex items-center justify-between text-xs transition-colors group/res"
                                  >
                                    <div>
                                      <div className="font-semibold text-gray-900 group-hover/res:underline">
                                        {res.title}
                                      </div>
                                      <div className="text-[11px] text-gray-500 font-mono">
                                        {res.provider} • {res.difficulty_level}
                                      </div>
                                    </div>
                                    <ExternalLink size={13} className="text-gray-400 group-hover/res:text-black shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Project Recommendations */}
                          {task.project_recommendations && task.project_recommendations.length > 0 && (
                            <div className="mt-4 pl-8">
                              <span className="text-xs font-mono uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                                <Code size={13} className="text-[#F0442D]" />
                                <span>Role-Relevant Project Specification</span>
                              </span>
                              {task.project_recommendations.map((proj) => (
                                <div
                                  key={proj.id}
                                  className="p-4 rounded-xl bg-[#050505] text-white space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h4 className="font-bold text-sm text-white">
                                        {proj.title}
                                      </h4>
                                      <p className="text-xs text-white/70 mt-1">
                                        {proj.objective}
                                      </p>
                                    </div>
                                    {proj.verified_repo_url && (
                                      <a
                                        href={proj.verified_repo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono text-[#9EF5CD] hover:underline flex items-center gap-1 shrink-0"
                                      >
                                        <span>Reference Repo</span>
                                        <ExternalLink size={11} />
                                      </a>
                                    )}
                                  </div>

                                  {/* Milestones */}
                                  {proj.implementation_milestones && (
                                    <div className="pt-2 border-t border-white/10 text-xs">
                                      <span className="text-white/50 font-mono uppercase text-[10px]">
                                        Milestones:
                                      </span>
                                      <ul className="mt-1 space-y-1 list-disc list-inside text-white/80">
                                        {proj.implementation_milestones.map((m, mIdx) => (
                                          <li key={mIdx}>{m}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* User Evidence Submission */}
                          <div className="mt-4 pl-8 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <span className="text-xs font-mono text-gray-500 shrink-0">
                              Candidate Evidence:
                            </span>
                            <input
                              type="text"
                              placeholder={task.evidence_guide || "Link to your GitHub PR, deployed demo URL, or completion notes..."}
                              defaultValue={task.user_evidence || ''}
                              onChange={(e) => setEvidenceInputs({ ...evidenceInputs, [task.id]: e.target.value })}
                              className="flex-1 w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            <button
                              onClick={() => handleSaveEvidence(task.id)}
                              disabled={savingTask[task.id]}
                              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg shrink-0 flex items-center gap-1"
                            >
                              <Send size={11} />
                              <span>Save Note</span>
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

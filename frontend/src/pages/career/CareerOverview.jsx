import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { careerApi } from '../../services/api';
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  ExternalLink, 
  Code2, 
  Check, 
  AlertCircle, 
  X, 
  ChevronRight, 
  Target, 
  ShieldCheck, 
  Layers, 
  Send, 
  FolderKanban, 
  FileEdit, 
  Mic, 
  Cpu, 
  Loader2,
  Clock,
  Compass
} from 'lucide-react';

export default function CareerOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Assessment Modal State
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Project Submission Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    repository_url: '',
    live_demo_url: '',
    skills_demonstrated: '',
    deliverables_summary: '',
    task_id: ''
  });
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [projectSuccessMsg, setProjectSuccessMsg] = useState('');

  // Outbound apply click state
  const [applyingJobId, setApplyingJobId] = useState(null);

  const fetchOverview = () => {
    setLoading(true);
    careerApi.getOverview()
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load career overview.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleStartAssessment = (slug) => {
    setAssessmentResult(null);
    setAssessmentAnswers({});
    careerApi.getAssessment(slug)
      .then(res => {
        setActiveAssessment(res.data);
      })
      .catch(err => {
        alert(err.response?.data?.error || 'Could not load assessment.');
      });
  };

  const handleAnswerChange = (questionId, value) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitAssessment = (e) => {
    e.preventDefault();
    if (!activeAssessment) return;
    setAssessmentSubmitting(true);
    careerApi.submitAssessment(activeAssessment.slug, assessmentAnswers)
      .then(res => {
        setAssessmentResult(res.data);
        setAssessmentSubmitting(false);
        // Refresh overview data in background to update strengths/metrics
        fetchOverview();
      })
      .catch(err => {
        alert(err.response?.data?.error || 'Submission failed.');
        setAssessmentSubmitting(false);
      });
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    setProjectSubmitting(true);
    careerApi.submitProject(projectForm)
      .then(res => {
        setProjectSubmitting(false);
        setProjectSuccessMsg('Project verified successfully! Profile competence updated.');
        setTimeout(() => {
          setIsProjectModalOpen(false);
          setProjectSuccessMsg('');
          setProjectForm({
            title: '',
            repository_url: '',
            live_demo_url: '',
            skills_demonstrated: '',
            deliverables_summary: '',
            task_id: ''
          });
          fetchOverview();
        }, 1500);
      })
      .catch(err => {
        alert(err.response?.data?.error || 'Failed to submit project deliverable.');
        setProjectSubmitting(false);
      });
  };

  const handleApplyClick = (jobId, applicationUrl) => {
    setApplyingJobId(jobId);
    careerApi.applyJobClick(jobId, { status: 'applied' })
      .finally(() => {
        setApplyingJobId(null);
        window.open(applicationUrl, '_blank', 'noopener,noreferrer');
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-[#86868B]">
          <Loader2 size={24} className="animate-spin text-[#1D1D1F]" />
          <span className="text-xs font-medium">Calibrating career intelligence...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200/80 text-rose-800 text-sm">
        {error}
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const userDisplayName = data?.user?.full_name || data?.user?.email?.split('@')[0] || 'Candidate';
  const completionPercentage = data?.completion_percentage ?? 0;
  const target = data?.target || {};
  const strengths = data?.strengths || [];
  const priorities = data?.priorities || [];
  const learningPlan = data?.learning_plan || [];
  const practicalWork = data?.practical_work || [];
  const assessments = data?.assessments || {};
  const jobMatches = data?.job_matches || [];
  const nextStep = data?.next_step || {};

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Header & Target Objective Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-black/[0.05] text-[11px] font-medium text-[#1D1D1F]">
            <Target size={12} className="text-[#0071E3]" />
            <span>Target Role: <strong className="font-semibold">{target.primary_role || 'Software Engineer'}</strong></span>
            <span className="text-[#86868B]">&middot;</span>
            <span className="text-[#86868B]">{target.locations?.[0] || 'Any Location'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
            Welcome back, {userDisplayName}
          </h1>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            Your connected career intelligence loop: from current verified skills to your target position.
          </p>
        </div>

        {/* Profile Completeness Pill */}
        <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] min-w-[260px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#6E6E73] mb-2 font-medium">
            <span>Profile Authority</span>
            <span className="text-[#1D1D1F] font-semibold">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-black/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1D1D1F] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(completionPercentage, 5)}%` }}
            />
          </div>
          <Link
            to="/career/profile"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#0071E3] hover:underline mt-3"
          >
            <span>{data?.is_confirmed ? 'Manage Authoritative Profile' : 'Confirm Extracted Profile'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 2. SECTION 14: "YOUR NEXT STEP" SINGLE PROMINENT ACTION CARD */}
      {nextStep?.title && (
        <div className="bg-gradient-to-r from-[#1D1D1F] to-[#2C2C2E] text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A6]">
              <Sparkles size={13} className="text-[#0071E3]" />
              <span>Recommended Next Priority</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              {nextStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#D1D1D6] leading-relaxed">
              {nextStep.description}
            </p>
          </div>

          <div className="shrink-0">
            {nextStep.is_external ? (
              <button
                onClick={() => handleApplyClick(nextStep.job_id, nextStep.action_url)}
                disabled={applyingJobId === nextStep.job_id}
                className="px-5 py-2.5 rounded-full bg-white text-[#1D1D1F] text-xs font-semibold hover:bg-neutral-100 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{applyingJobId === nextStep.job_id ? 'Recording & Opening...' : nextStep.action_label}</span>
                <ExternalLink size={13} />
              </button>
            ) : nextStep.action_url?.includes('/career/assessments/') ? (
              <button
                onClick={() => handleStartAssessment(nextStep.action_url.split('/').pop())}
                className="px-5 py-2.5 rounded-full bg-white text-[#1D1D1F] text-xs font-semibold hover:bg-neutral-100 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>{nextStep.action_label}</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <Link
                to={nextStep.action_url || '/career/profile'}
                className="px-5 py-2.5 rounded-full bg-white text-[#1D1D1F] text-xs font-semibold hover:bg-neutral-100 transition-all shadow-sm inline-flex items-center gap-1.5"
              >
                <span>{nextStep.action_label}</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. CORE JOB-READINESS SECTIONS: STRENGTHS & PRIORITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Your Strengths Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">Your Strengths</h3>
                <p className="text-xs text-[#86868B]">Supported by verified assessments and resume evidence</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#1D1D1F]">
              {strengths.length} Evidenced
            </span>
          </div>

          {strengths.length === 0 ? (
            <p className="text-xs text-[#86868B] py-4">No verified skills recorded yet. Complete an assessment or confirm your profile.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {strengths.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.03] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1D1D1F]">{item.name}</span>
                    {item.tier === 'assessment_supported' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <Award size={10} /> Assessment Verified
                      </span>
                    ) : item.tier === 'project_supported' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                        <Code2 size={10} /> Project Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#6E6E73] bg-white px-2 py-0.5 rounded-full">
                        Profile Declared
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6E6E73] truncate">{item.evidence}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Priorities (Skill Gaps) Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">Your Priorities</h3>
                <p className="text-xs text-[#86868B]">Essential competencies required for {target.primary_role || 'target roles'}</p>
              </div>
            </div>
            <Link to="/career-roadmap" className="text-xs text-[#0071E3] font-medium hover:underline inline-flex items-center gap-0.5">
              <span>View Full Roadmap</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {priorities.map((gap, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.03] flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1D1D1F]">{gap.skill}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      High Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E6E73] truncate">{gap.rationale}</p>
                </div>
                <button
                  onClick={() => handleStartAssessment(gap.skill.toLowerCase().replace(/\s+/g, '-'))}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-white text-[#1D1D1F] border border-black/[0.08] text-[11px] font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Verify Skill
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. ASSESSMENTS SECTION: VERIFY COMPETENCE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Competence Assessments</h3>
            <p className="text-xs text-[#6E6E73]">Take verified quizzes and coding exercises to elevate your profile credibility.</p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#1D1D1F] bg-[#F5F5F7] px-3 py-1.5 rounded-full">
            <Award size={14} className="text-[#0071E3]" />
            <span>{assessments.passed_count || 0} of {assessments.available_count || 5} Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { title: 'Python Production', slug: 'python-production-engineering', skill: 'Python', time: '20 min' },
            { title: 'SQL & Relational Modeling', slug: 'sql-relational-modeling', skill: 'SQL', time: '25 min' },
            { title: 'React Architecture', slug: 'react-frontend-architecture', skill: 'React', time: '20 min' },
            { title: 'Docker Containers', slug: 'docker-containerization-essentials', skill: 'Docker', time: '20 min' },
            { title: 'System Design', slug: 'system-design-scalability', skill: 'System Design', time: '30 min' }
          ].map((item, idx) => {
            const completed = assessments.completed?.find(c => c.skill.toLowerCase() === item.skill.toLowerCase());
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">{item.skill}</span>
                    {completed?.passed ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Check size={10} /> {completed.score}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#86868B] flex items-center gap-1">
                        <Clock size={10} /> {item.time}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-[#1D1D1F] leading-snug">{item.title}</h4>
                </div>

                <button
                  onClick={() => handleStartAssessment(item.slug)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                    completed?.passed
                      ? 'bg-white text-[#1D1D1F] border border-black/[0.08] hover:bg-neutral-50'
                      : 'bg-[#1D1D1F] text-white hover:bg-black'
                  }`}
                >
                  {completed?.passed ? 'Retake Assessment' : 'Take Assessment'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. PRACTICAL WORK & PROJECT DELIVERABLES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Practical Work & Project Deliverables</h3>
            <p className="text-xs text-[#6E6E73]">Demonstrate hands-on software development competence through code repositories.</p>
          </div>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>+ Submit Project Deliverable</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practicalWork.length > 0 ? (
            practicalWork.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1D1D1F]">{proj.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    proj.task_status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {proj.task_status === 'completed' ? 'Verified Done' : 'In Progress'}
                  </span>
                </div>
                <p className="text-xs text-[#6E6E73] leading-relaxed">{proj.objective}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.skills_demonstrated?.map((sk, sIdx) => (
                    <span key={sIdx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-black/[0.05] text-[#1D1D1F]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-6 rounded-2xl bg-[#F5F5F7] text-center space-y-2">
              <Code2 size={24} className="mx-auto text-[#86868B]" />
              <p className="text-xs text-[#6E6E73]">No project deliverables submitted yet. Add your GitHub repository link to evidence practical competence.</p>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="text-xs text-[#0071E3] font-semibold hover:underline"
              >
                Submit your first project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. REAL JOB MATCHES WITH DIRECT APPLICATION LINKS (SECTION 12 & 13) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Curated Opportunities for You</h3>
            <p className="text-xs text-[#6E6E73]">Verified positions with explainable match scores and direct employer application links.</p>
          </div>
          <Link to="/career/jobs" className="text-xs text-[#0071E3] font-medium hover:underline inline-flex items-center gap-1">
            <span>Explore all {metrics.available_jobs || 138} jobs</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-3">
          {jobMatches.map((match, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-black/15 transition-all"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1D1D1F]">{match.job_title}</span>
                  <span className="text-xs text-[#86868B]">&middot;</span>
                  <span className="text-xs font-medium text-[#6E6E73]">{match.company_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#86868B]">
                  <span>{match.location || 'India / Remote'}</span>
                  <span>&middot;</span>
                  <span className="capitalize">{match.workplace_type}</span>
                </div>
                <p className="text-xs text-[#6E6E73] leading-relaxed pt-1">
                  {match.explanation}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full block">
                    {match.overall_score}% Match
                  </span>
                  <span className="text-[10px] text-[#86868B] mt-1 block">Explainable alignment</span>
                </div>

                <button
                  onClick={() => handleApplyClick(match.job_id, match.application_url)}
                  disabled={applyingJobId === match.job_id}
                  className="px-4 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>{applyingJobId === match.job_id ? 'Opening...' : 'View job & apply →'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ASSESSMENT TAKER */}
      {activeAssessment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-black/[0.08]">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071E3]">
                  {activeAssessment.skill_name} Competence Evaluation
                </span>
                <h3 className="text-lg font-semibold text-[#1D1D1F]">{activeAssessment.title}</h3>
              </div>
              <button
                onClick={() => setActiveAssessment(null)}
                className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {assessmentResult ? (
              <div className="space-y-5">
                <div className={`p-5 rounded-2xl border ${
                  assessmentResult.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2">
                    {assessmentResult.passed ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-amber-600" />}
                    <h4 className="font-semibold text-sm">
                      {assessmentResult.passed ? 'Assessment Passed — Competence Verified!' : 'Threshold Not Met'}
                    </h4>
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed">{assessmentResult.feedback?.summary}</p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">Evaluation Breakdown</h5>
                  {assessmentResult.feedback?.question_feedbacks?.map((fb, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F5F5F7] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1D1D1F]">Question {idx + 1}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          fb.status === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {fb.status === 'correct' ? 'Correct' : 'Needs Review'}
                        </span>
                      </div>
                      <p className="text-[#6E6E73]">{fb.explanation}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveAssessment(null)}
                  className="w-full py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black transition-colors"
                >
                  Close & Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAssessment} className="space-y-5">
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  {activeAssessment.description} Pass mark is {activeAssessment.passing_score}%.
                </p>

                <div className="space-y-4">
                  {activeAssessment.questions?.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#F5F5F7] space-y-3">
                      <span className="text-[11px] font-semibold text-[#86868B] block">Question {idx + 1}</span>
                      <p className="text-xs font-medium text-[#1D1D1F] leading-relaxed">{q.prompt}</p>

                      {q.type === 'multiple_choice' && q.options ? (
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                assessmentAnswers[q.id || idx] === optIdx
                                  ? 'bg-white border-[#0071E3] text-[#1D1D1F] shadow-sm'
                                  : 'bg-white/60 border-black/[0.05] text-[#6E6E73] hover:bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id || idx}`}
                                checked={assessmentAnswers[q.id || idx] === optIdx}
                                onChange={() => handleAnswerChange(q.id || idx, optIdx)}
                                className="mt-0.5"
                              />
                              <span className="leading-snug">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          rows={3}
                          value={assessmentAnswers[q.id || idx] || ''}
                          onChange={(e) => handleAnswerChange(q.id || idx, e.target.value)}
                          placeholder="Type your code snippet, query, or explanation here..."
                          className="w-full p-3 rounded-xl bg-white border border-black/[0.08] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveAssessment(null)}
                    className="px-4 py-2 rounded-full bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assessmentSubmitting}
                    className="px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {assessmentSubmitting ? 'Evaluating...' : 'Submit Answers for Verification'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT PROJECT DELIVERABLE */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-black/[0.08]">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <h3 className="text-base font-semibold text-[#1D1D1F]">Submit Practical Project Evidence</h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center hover:bg-neutral-200"
              >
                <X size={16} />
              </button>
            </div>

            {projectSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{projectSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleProjectSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                    placeholder="e.g. Distributed Task Queue & Microservices API"
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1D1D1F] block mb-1">GitHub / Code Repository URL</label>
                  <input
                    type="url"
                    required
                    value={projectForm.repository_url}
                    onChange={(e) => setProjectForm({...projectForm, repository_url: e.target.value})}
                    placeholder="https://github.com/your-username/project-repo"
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Live Demo / Documentation URL (Optional)</label>
                  <input
                    type="url"
                    value={projectForm.live_demo_url}
                    onChange={(e) => setProjectForm({...projectForm, live_demo_url: e.target.value})}
                    placeholder="https://project-demo.vercel.app"
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Demonstrated Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={projectForm.skills_demonstrated}
                    onChange={(e) => setProjectForm({...projectForm, skills_demonstrated: e.target.value})}
                    placeholder="e.g. Python, Docker, FastAPI, PostgreSQL"
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Deliverables & Technical Highlights</label>
                  <textarea
                    rows={3}
                    value={projectForm.deliverables_summary}
                    onChange={(e) => setProjectForm({...projectForm, deliverables_summary: e.target.value})}
                    placeholder="Explain key architecture decisions, testing coverage, and performance benchmarks..."
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={projectSubmitting}
                    className="px-5 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black disabled:opacity-50"
                  >
                    {projectSubmitting ? 'Verifying...' : 'Submit Deliverable'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

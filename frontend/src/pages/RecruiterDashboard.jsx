import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobsApi, matchingApi } from '../services/api';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
    Briefcase, Plus, Users, Award, ShieldAlert, CheckCircle, 
    ChevronRight, X, Lock, ExternalLink, RefreshCw, LogOut, Check
} from 'lucide-react';
import { MagneticDock } from '../components/ui/magnetic-dock';

export default function RecruiterDashboard() {
    const { logout, profile } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    // Filters
    const [minExp, setMinExp] = useState('');
    const [maxNotice, setMaxNotice] = useState('');
    const [minScore, setMinScore] = useState('');
    const [location, setLocation] = useState('');
    const [skillsQuery, setSkillsQuery] = useState('');
    
    // New Job Form Modal
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newJobDesc, setNewJobDesc] = useState('');
    const [submittingJob, setSubmittingJob] = useState(false);

    // Selected Candidate Details Drawer
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [candidateDetails, setCandidateDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await jobsApi.list();
            setJobs(res.data.jobs);
            if (res.data.jobs.length > 0 && !selectedJob) {
                setSelectedJob(res.data.jobs[0]);
            }
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    };

    useEffect(() => {
        if (selectedJob) {
            fetchMatches();
        }
    }, [selectedJob, minExp, maxNotice, minScore, location, skillsQuery]);

    const fetchMatches = async () => {
        setLoadingMatches(true);
        try {
            const filters = {
                min_experience: minExp,
                max_notice: maxNotice,
                min_score: minScore,
                location: location,
                skills: skillsQuery
            };
            const res = await matchingApi.matches(selectedJob.id, filters);
            setMatches(res.data.matches);
        } catch (err) {
            console.error("Failed to fetch matches:", err);
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        if (!newJobTitle || !newJobDesc) return;
        setSubmittingJob(true);
        try {
            await jobsApi.create({
                title: newJobTitle,
                description_text: newJobDesc
            });
            setNewJobTitle('');
            setNewJobDesc('');
            setShowNewJobModal(false);
            fetchJobs();
        } catch (err) {
            console.error("Failed to create job:", err);
        } finally {
            setSubmittingJob(false);
        }
    };

    const handleViewDetails = async (rankingId) => {
        setSelectedCandidateId(rankingId);
        setLoadingDetails(true);
        try {
            const res = await matchingApi.details(rankingId);
            setCandidateDetails(res.data);
        } catch (err) {
            console.error("Failed to fetch candidate details:", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleShortlist = async (rankingId) => {
        try {
            const res = await matchingApi.shortlist(rankingId);
            // Refresh details
            if (candidateDetails && selectedCandidateId === rankingId) {
                setCandidateDetails(prev => ({
                    ...prev,
                    personal_info: {
                        ...prev.personal_info,
                        ...res.data.candidate,
                        is_shortlisted: true
                    }
                }));
            }
            // Refresh matches list
            fetchMatches();
        } catch (err) {
            console.error("Failed to shortlist candidate:", err);
        }
    };

    // Calculate aggregated KPIs
    const totalCandidatesCount = matches.length;
    const topMatchesCount = matches.filter(m => m.overall_score >= 80).length;
    const avgTrustScore = matches.length > 0 
        ? Math.round(matches.reduce((acc, m) => acc + m.trust_score, 0) / matches.length) 
        : 0;
    const avgMatchScore = matches.length > 0 
        ? Math.round(matches.reduce((acc, m) => acc + m.overall_score, 0) / matches.length) 
        : 0;
    const shortlistedCount = matches.filter(m => m.is_shortlisted).length;

    // Helper: format radar data
    const getRadarData = (details) => {
        if (!details || !details.score_breakdown) return [];
        const sb = details.score_breakdown;
        return [
            { subject: 'Semantic', value: sb.semantic_score, fullMark: 100 },
            { subject: 'Skill Fit', value: sb.skill_score, fullMark: 100 },
            { subject: 'Experience', value: sb.experience_score, fullMark: 100 },
            { subject: 'Trajectory', value: sb.trajectory_score, fullMark: 100 },
            { subject: 'Verifiability', value: details.trust_score, fullMark: 100 },
        ];
    };

    // Helper: format experience timeline data
    const getTimelineData = (details) => {
        if (!details || !details.experience) return [];
        return details.experience.map((exp, idx) => ({
            name: exp.company,
            role: exp.role,
            yoe: idx + 1,
        })).reverse();
    };

    return (
        <div className="min-h-screen bg-[#fafffa] text-[#121613] pb-32 selection:bg-[#2bee4b] selection:text-[#121613] font-twk-lausanne animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <header className="border-b border-[#c8d2c8]/30 sticky top-0 z-40 bg-[#fafffa]/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <span className="font-bold text-base tracking-tight select-none">
                            <span className="text-[#121613]">Trust</span>
                            <span className="text-[#2bee4b] ml-[2px]">Hire</span>
                        </span>
                        <div className="h-6 w-px bg-[#c8d2c8]/30" />
                        <span className="text-[10px] text-[#516254] font-mono tracking-widest uppercase px-2 py-0.5 border border-[#c8d2c8]/50 rounded">RECRUITER PORTAL</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-semibold text-[#121613]">{profile?.full_name || 'Recruiter'}</div>
                            <div className="text-[10px] text-[#516254] uppercase tracking-wider font-light">{profile?.company_name || 'Corporate Account'}</div>
                        </div>
                        <button 
                            onClick={logout} 
                            className="p-2 rounded-lg bg-[#fafffa] border border-[#c8d2c8] text-[#516254] hover:text-[#121613] hover:border-[#121613] transition-colors cursor-pointer"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Jobs Navigation */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-[#516254] uppercase tracking-wider">Active Openings</h3>
                        <button 
                            onClick={() => setShowNewJobModal(true)}
                            className="p-2 rounded-[10px] bg-[#121613] hover:opacity-90 text-[#fafffa] transition-all cursor-pointer"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {jobs.map(job => (
                            <button
                                key={job.id}
                                onClick={() => { setSelectedJob(job); setSelectedCandidateId(null); setCandidateDetails(null); }}
                                className={`w-full text-left p-4 rounded-[14px] transition-all border cursor-pointer ${
                                    selectedJob?.id === job.id
                                        ? 'bg-[#fafffa] border-2 border-[#121613] shadow-md shadow-[#121613]/5'
                                        : 'bg-[#fafffa] border border-[#c8d2c8]/40 hover:border-[#121613]'
                                }`}
                            >
                                <div className="font-semibold text-[#121613] truncate text-sm">{job.title}</div>
                                <div className="text-[10px] text-[#516254] mt-1 font-light uppercase tracking-wider">Enterprise: {job.company_name}</div>
                                <div className="flex items-center justify-between mt-3 text-[10px] text-[#516254] font-mono">
                                    <span>{job.domain}</span>
                                    <span>Exp: {job.experience_required}+ yrs</span>
                                </div>
                            </button>
                        ))}
                        {jobs.length === 0 && (
                            <div className="text-xs text-[#516254] text-center py-10 border border-dashed border-[#c8d2c8] rounded-[14px] font-light">
                                No job descriptions analyzed yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: matches & Metrics Dashboard */}
                <div className="lg:col-span-3 space-y-8">
                    {selectedJob ? (
                        <>
                            {/* Dashboard KPI cards */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px]">
                                    <div className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Total Match</div>
                                    <div className="text-2xl font-bold text-[#121613] mt-2">{totalCandidatesCount}</div>
                                </div>
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px]">
                                    <div className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">High Match</div>
                                    <div className="text-2xl font-bold text-[#121613] mt-2">{topMatchesCount}</div>
                                </div>
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px]">
                                    <div className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Avg Match</div>
                                    <div className="text-2xl font-bold text-[#121613] mt-2">{avgMatchScore}%</div>
                                </div>
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px]">
                                    <div className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Avg Trust</div>
                                    <div className="text-2xl font-bold text-[#2bee4b] mt-2">{avgTrustScore}%</div>
                                </div>
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px] col-span-2 md:col-span-1">
                                    <div className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Shortlisted</div>
                                    <div className="text-2xl font-bold text-[#121613] mt-2">{shortlistedCount}</div>
                                </div>
                            </div>

                            {/* Filters Bar */}
                            <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px] grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-[#516254] uppercase tracking-wider font-medium">Min YOE</label>
                                    <input 
                                        type="number" 
                                        value={minExp} 
                                        onChange={(e) => setMinExp(e.target.value)}
                                        placeholder="e.g. 2" 
                                        className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3 py-1.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-[#516254] uppercase tracking-wider font-medium">Notice Max</label>
                                    <input 
                                        type="number" 
                                        value={maxNotice} 
                                        onChange={(e) => setMaxNotice(e.target.value)}
                                        placeholder="e.g. 30" 
                                        className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3 py-1.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-[#516254] uppercase tracking-wider font-medium">Location</label>
                                    <input 
                                        type="text" 
                                        value={location} 
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Bangalore" 
                                        className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3 py-1.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-[#516254] uppercase tracking-wider font-medium">Skills</label>
                                    <input 
                                        type="text" 
                                        value={skillsQuery} 
                                        onChange={(e) => setSkillsQuery(e.target.value)}
                                        placeholder="Python, React" 
                                        className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3 py-1.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-[#516254] uppercase tracking-wider font-medium">Min Score</label>
                                    <input 
                                        type="number" 
                                        value={minScore} 
                                        onChange={(e) => setMinScore(e.target.value)}
                                        placeholder="70" 
                                        className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3 py-1.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613]"
                                    />
                                </div>
                            </div>

                            {/* Candidate Table */}
                            <div className="bg-[#fafffa] border border-[#c8d2c8]/40 rounded-[14px] overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#c8d2c8]/30 flex items-center justify-between">
                                    <h4 className="font-semibold uppercase tracking-wider text-xs text-[#121613]">Candidate Rankings</h4>
                                    <button onClick={fetchMatches} className="p-1 rounded bg-[#fafffa] border border-[#c8d2c8] text-[#516254] hover:text-[#121613] cursor-pointer">
                                        <RefreshCw size={14} className={loadingMatches ? 'animate-spin' : ''} />
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#c8d2c8]/10 text-[10px] text-[#516254] uppercase tracking-widest border-b border-[#c8d2c8]/30">
                                                <th className="px-6 py-4 font-semibold">Candidate ID</th>
                                                <th className="px-6 py-4 font-semibold">Match Score</th>
                                                <th className="px-6 py-4 font-semibold">Semantic</th>
                                                <th className="px-6 py-4 font-semibold">Trajectory</th>
                                                <th className="px-6 py-4 font-semibold">Trust Index</th>
                                                <th className="px-6 py-4 font-semibold">Experience</th>
                                                <th className="px-6 py-4 font-semibold">Notice</th>
                                                <th className="px-6 py-4 font-semibold">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right">Analysis</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#c8d2c8]/20 text-xs font-light">
                                            {matches.map(m => (
                                                <tr key={m.id} className="hover:bg-[#c8d2c8]/5 transition-colors">
                                                    <td className="px-6 py-4 font-mono font-medium text-[#121613]">
                                                        {m.is_shortlisted ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[#121613]">{m.full_name}</span>
                                                                <span className="text-[10px] text-[#516254]">{m.email}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-[#516254]">
                                                                <Lock size={12} className="text-[#93b799]" />
                                                                <span>{m.anonymous_id}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-[5px] font-bold ${
                                                            m.overall_score >= 80 ? 'bg-[#2bee4b]/15 text-[#121613] border border-[#2bee4b]' :
                                                            m.overall_score >= 60 ? 'bg-[#93b799]/15 text-[#516254]' : 'bg-[#c8d2c8]/20 text-[#516254]'
                                                        }`}>
                                                            {m.overall_score}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[#516254]">{m.semantic_score}%</td>
                                                    <td className="px-6 py-4 text-[#516254]">{m.trajectory_score}%</td>
                                                    <td className="px-6 py-4 text-[#516254]">{m.trust_score}%</td>
                                                    <td className="px-6 py-4 text-[#516254]">{m.experience_years} yrs</td>
                                                    <td className="px-6 py-4 text-[#516254]">{m.notice_period} days</td>
                                                    <td className="px-6 py-4">
                                                        {m.is_shortlisted ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                                                <CheckCircle size={10} /> Shortlisted
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-[#516254] uppercase tracking-wider font-light">Applied</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleViewDetails(m.id)}
                                                            className="inline-flex items-center gap-1 text-xs text-[#121613] hover:text-[#2bee4b] font-bold uppercase tracking-wider cursor-pointer"
                                                        >
                                                            Analyze <ChevronRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {matches.length === 0 && (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-12 text-[#516254] italic">
                                                        No matching profiles found with these parameters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 border border-dashed border-[#c8d2c8] rounded-[14px] max-w-xl mx-auto bg-[#fafffa]">
                            <Briefcase size={40} className="mx-auto text-[#93b799] mb-4" />
                            <h3 className="font-editorial-new text-2xl text-[#121613] mb-3">No Active Job Description</h3>
                            <p className="text-[#516254] text-xs mb-6 max-w-xs mx-auto font-light leading-relaxed">
                                Paste your software engineering job details to index candidates with India-context calibration.
                            </p>
                            <button 
                                onClick={() => setShowNewJobModal(true)}
                                className="px-5 py-3 rounded-[10px] bg-[#2bee4b] text-[#121613] font-bold uppercase tracking-wider text-xs flex items-center gap-2 mx-auto cursor-pointer"
                            >
                                <Plus size={16} /> Create Job Posting
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Candidate Details sliding side drawer */}
            {selectedCandidateId && (
                <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-[fadeIn_0.2s_ease-out]">
                    <div className="absolute inset-0 bg-[#121613]/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCandidateId(null)} />
                    
                    <div className="w-full max-w-4xl bg-[#fafffa] border-l border-[#c8d2c8] h-full relative z-10 flex flex-col shadow-2xl overflow-y-auto">
                        <div className="p-6 border-b border-[#c8d2c8]/30 flex items-center justify-between sticky top-0 bg-[#fafffa]/90 backdrop-blur-md z-20">
                            <div>
                                <span className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Calibration Report</span>
                                <h2 className="font-editorial-new text-2xl text-[#121613] mt-1">
                                    {candidateDetails?.personal_info?.is_shortlisted 
                                        ? candidateDetails.personal_info.full_name 
                                        : candidateDetails?.personal_info?.anonymous_id || 'Analyzing profile trajectory...'}
                                </h2>
                            </div>
                            <button onClick={() => setSelectedCandidateId(null)} className="p-2 rounded-lg bg-[#fafffa] border border-[#c8d2c8] text-[#516254] hover:text-[#121613] cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="flex-1 flex items-center justify-center">
                                <RefreshCw size={24} className="animate-spin text-[#93b799]" />
                            </div>
                        ) : candidateDetails ? (
                            <div className="flex-1 p-6 space-y-8">
                                {/* Match Indicator Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Score overview */}
                                    <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px] flex flex-col justify-between aspect-square md:aspect-auto">
                                        <div className="text-center">
                                            <span className="text-[10px] text-[#516254] uppercase tracking-wider">Overall Match</span>
                                            <div className="text-5xl font-bold text-[#121613] mt-4">{candidateDetails.overall_score}%</div>
                                        </div>
                                        
                                        {!candidateDetails.personal_info.is_shortlisted ? (
                                            <button 
                                                onClick={() => handleShortlist(selectedCandidateId)}
                                                className="w-full py-3.5 rounded-[10px] bg-[#2bee4b] text-[#121613] text-xs font-bold uppercase tracking-wider shadow-[rgba(16,94,29,0.3)_1px_4px_12px_0px] flex items-center justify-center gap-2 mt-6 cursor-pointer"
                                            >
                                                <Users size={14} /> Shortlist Profile
                                            </button>
                                        ) : (
                                            <div className="p-3 bg-[#2bee4b]/10 border border-[#2bee4b] text-[#121613] rounded-[10px] text-xs font-bold uppercase tracking-wider text-center mt-6 flex items-center justify-center gap-1.5">
                                                <Check size={14} /> Name Unlocked
                                            </div>
                                        )}
                                    </div>

                                    {/* radar match chart */}
                                    <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px] flex flex-col items-center justify-center col-span-1 md:col-span-2">
                                        <h5 className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold self-start mb-4">Alignment Breakdown</h5>
                                        <div className="w-full h-48 radar-chart-container">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" radius="70%" data={getRadarData(candidateDetails)}>
                                                    <PolarGrid stroke="#c8d2c8" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#516254', fontSize: 10 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#516254', fontSize: 8 }} />
                                                    <Radar name="Candidate" dataKey="value" stroke="#121613" fill="#2bee4b" fillOpacity={0.2} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* India Context Audits Card */}
                                <div className="p-6 rounded-[14px] bg-[#fafffa] border-2 border-[#2bee4b] relative overflow-hidden">
                                    <h4 className="text-xs font-bold text-[#121613] uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Award size={16} className="text-[#2bee4b]" /> India-Context Calibration Audit
                                    </h4>
                                    <p className="text-xs text-[#121613]/90 leading-relaxed mb-4">
                                        {candidateDetails.india_context_adjustments.context_report}
                                    </p>
                                    
                                    {candidateDetails.india_context_adjustments.fairness_notes.length > 0 && (
                                        <div className="space-y-2">
                                            {candidateDetails.india_context_adjustments.fairness_notes.map((note, idx) => (
                                                <div key={idx} className="flex gap-2 text-xs text-[#516254] leading-relaxed">
                                                    <span className="text-[#2bee4b] font-bold">•</span>
                                                    <span>{note}</span>
                                                </div>
                                            ))}
                                            <div className="text-[10px] text-[#516254] font-mono mt-3">
                                                * India-Context Balance: +{candidateDetails.score_breakdown.india_context_boost}% grit normalization boost applied
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AI Recommendation Explanations */}
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px] space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-[#516254] uppercase tracking-wider mb-2">Explainable AI Shortlist Decision</h4>
                                        <p className="text-xs text-[#121613] leading-relaxed bg-[#c8d2c8]/10 p-3.5 rounded-[10px]">
                                            {candidateDetails.ranking_explanation}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h5 className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold mb-3">Recommendation Strengths</h5>
                                            <div className="space-y-2">
                                                {candidateDetails.reasons_for_recommendation.map((reason, idx) => (
                                                    <div key={idx} className="flex gap-2 text-xs text-green-700 items-start">
                                                        <CheckCircle size={14} className="mt-0.5 shrink-0 text-[#2bee4b]" />
                                                        <span className="text-[#516254]">{reason}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold mb-3">Identified Candidate Missing Skills</h5>
                                            <div className="space-y-2">
                                                {candidateDetails.missing_skills.length > 0 ? (
                                                    candidateDetails.missing_skills.map((skill, idx) => (
                                                        <div key={idx} className="flex gap-2 text-xs text-red-600 items-start">
                                                            <ShieldAlert size={14} className="mt-0.5 shrink-0 text-red-500" />
                                                            <span className="text-[#516254]">{skill} (Target gap)</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex gap-2 text-xs text-green-700 items-center">
                                                        <CheckCircle size={14} className="text-[#2bee4b]" />
                                                        <span className="text-[#516254]">Fully matches mandatory skills criteria.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Career Growth Trajectory Node Chart */}
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-bold text-[#516254] uppercase tracking-wider">Historical Experience Trajectory</h4>
                                        <span className="text-[10px] text-[#121613] font-bold font-mono bg-[#2bee4b]/20 px-2.5 py-0.5 rounded border border-[#2bee4b]">
                                            Prediction: {candidateDetails.trajectory_prediction}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#516254] mb-6 font-light">
                                        Calculated future growth indicator: <strong className="text-[#121613] font-bold">{candidateDetails.future_readiness}</strong>
                                    </p>
                                    
                                    {getTimelineData(candidateDetails).length > 0 && (
                                        <div className="w-full h-44">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={getTimelineData(candidateDetails)}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#c8d2c8" />
                                                    <XAxis dataKey="name" tick={{ fill: '#516254', fontSize: 9 }} />
                                                    <YAxis tick={{ fill: '#516254', fontSize: 9 }} label={{ value: 'Role Tier', angle: -90, position: 'insideLeft', fill: '#516254', fontSize: 9 }} />
                                                    <Tooltip contentStyle={{ background: '#fafffa', borderColor: '#c8d2c8', color: '#121613' }} labelStyle={{ color: '#121613', fontSize: 10 }} itemStyle={{ color: '#121613', fontSize: 10 }} />
                                                    <Line type="monotone" dataKey="yoe" stroke="#121613" strokeWidth={2} dot={{ fill: '#2bee4b', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Tenure Node" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Identity & Links */}
                                {candidateDetails.personal_info.is_shortlisted && (
                                    <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px]">
                                        <h4 className="text-xs font-bold text-[#516254] uppercase tracking-wider mb-4">Contact Credentials</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light">
                                            <div className="space-y-1">
                                                <span className="text-[#516254]">Work Email</span>
                                                <div className="text-[#121613] font-medium">{candidateDetails.personal_info.email}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[#516254]">External Mappings</span>
                                                <div className="flex gap-4 mt-1 font-semibold">
                                                    {candidateDetails.personal_info.github && (
                                                        <a href={candidateDetails.personal_info.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#121613] hover:text-[#2bee4b]">
                                                            GitHub <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                    {candidateDetails.personal_info.linkedin && (
                                                        <a href={candidateDetails.personal_info.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#121613] hover:text-[#2bee4b]">
                                                            LinkedIn <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Profile data details: Projects, Experience, Education */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-bold text-[#516254] uppercase tracking-wider border-b border-[#c8d2c8]/30 pb-2">Background Details</h4>
                                    
                                    {/* Experience List */}
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Professional Tenure</h5>
                                        {candidateDetails.experience.map((exp, idx) => (
                                            <div key={idx} className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px]">
                                                <div className="flex items-center justify-between text-xs mb-2 font-semibold">
                                                    <span className="text-[#121613]">{exp.role}</span>
                                                    <span className="text-[10px] text-[#516254] font-normal">{exp.duration}</span>
                                                </div>
                                                <div className="text-[10px] text-[#516254] font-mono mb-2">{exp.company}</div>
                                                <p className="text-xs text-[#516254] leading-relaxed font-light">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Projects List */}
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Technical Projects</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {candidateDetails.projects.map((proj, idx) => (
                                                <div key={idx} className="bg-[#fafffa] border border-[#c8d2c8]/40 p-4 rounded-[14px] flex flex-col justify-between">
                                                    <div>
                                                        <h6 className="font-bold text-[#121613] text-xs mb-2">{proj.name}</h6>
                                                        <p className="text-xs text-[#516254] leading-relaxed mb-4 font-light">{proj.description}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {proj.technologies.map((t, i) => (
                                                            <span key={i} className="text-[9px] bg-[#c8d2c8]/20 px-2 py-0.5 rounded text-[#516254] font-mono">{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Post New Job Modal */}
            {showNewJobModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="absolute inset-0 bg-[#121613]/40 backdrop-blur-sm" onClick={() => setShowNewJobModal(false)} />
                    <div className="w-full max-w-lg bg-[#fafffa] border border-[#c8d2c8] rounded-[14px] p-6 relative z-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-editorial-new text-2xl text-[#121613]">Post Job Profile</h3>
                            <button onClick={() => setShowNewJobModal(false)} className="p-1 rounded bg-[#fafffa] border border-[#c8d2c8] text-[#516254] hover:text-[#121613] cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Job Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newJobTitle}
                                    onChange={(e) => setNewJobTitle(e.target.value)}
                                    placeholder="e.g. Senior Frontend Engineer" 
                                    className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3.5 py-2.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Job Requirements / Description</label>
                                <textarea 
                                    rows={8}
                                    required
                                    value={newJobDesc}
                                    onChange={(e) => setNewJobDesc(e.target.value)}
                                    placeholder="Paste technical requirements, tech stack details, and experience levels..." 
                                    className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3.5 py-2.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613] font-sans font-light"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submittingJob}
                                className="w-full py-4 rounded-[10px] bg-[#2bee4b] text-[#121613] font-bold uppercase tracking-wider text-xs shadow-[rgba(16,94,29,0.3)_1px_4px_12px_0px] flex items-center justify-center gap-1.5 cursor-pointer mt-6"
                            >
                                {submittingJob ? 'Analyzing Profile...' : 'Analyze & Launch Opening'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Magnetic Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <MagneticDock 
                    items={[
                        { id: "dashboard", label: "Dashboard", icon: <Briefcase size={20} />, isActive: !selectedCandidateId, onClick: () => { setSelectedCandidateId(null); setCandidateDetails(null); } },
                        { id: "post-job", label: "Post New Job", icon: <Plus size={20} />, onClick: () => setShowNewJobModal(true) },
                        { id: "refresh", label: "Refresh Matches", icon: <RefreshCw size={20} />, onClick: fetchMatches },
                        { id: "signout", label: "Sign Out", icon: <LogOut size={20} className="text-red-500" />, onClick: logout },
                    ]}
                />
            </div>
        </div>
    );
}

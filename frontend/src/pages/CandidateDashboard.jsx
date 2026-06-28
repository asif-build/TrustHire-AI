import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { resumesApi, usersApi } from '../services/api';
import { 
    Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, LogOut, 
    BookOpen, Github, Linkedin, MapPin, Calendar, Briefcase, Award, User
} from 'lucide-react';
import { MagneticDock } from '../components/ui/magnetic-dock';
import { GithubCalendar } from '../components/ui/github-calendar';

export default function CandidateDashboard() {
    const { logout, profile, refreshProfile } = useAuth();
    const fileInputRef = useRef(null);
    const [resumeStatus, setResumeStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Profile Edits
    const [editing, setEditing] = useState(false);
    const [location, setLocation] = useState('');
    const [noticePeriod, setNoticePeriod] = useState(0);
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [fullName, setFullName] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        fetchResumeStatus();
    }, []);

    const fetchResumeStatus = async () => {
        setLoadingStatus(true);
        try {
            const res = await resumesApi.status();
            setResumeStatus(res.data);
            if (res.data.has_resume) {
                // Pre-fill profile fields
                setLocation(profile?.location || '');
                setNoticePeriod(profile?.notice_period || 0);
                setGithub(profile?.github_url || '');
                setLinkedin(profile?.linkedin_url || '');
                setFullName(profile?.full_name || '');
            }
        } catch (err) {
            console.error("Failed to fetch resume status:", err);
        } finally {
            setLoadingStatus(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size exceeds 5MB limit.");
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadSuccess(false);
        try {
            await resumesApi.upload(file);
            setUploadSuccess(true);
            await fetchResumeStatus();
            await refreshProfile();
        } catch (err) {
            setUploadError(err.response?.data?.error || "Failed to process resume. Please ensure it is a valid PDF.");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await usersApi.updateProfile({
                full_name: fullName,
                location,
                notice_period: parseInt(noticePeriod),
                github_url: github,
                linkedin_url: linkedin
            });
            setEditing(false);
            await refreshProfile();
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            setSavingProfile(false);
        }
    };

    // Helper: calculate profile completion
    const calculateCompletion = () => {
        let score = 20; // Base user registered
        if (resumeStatus?.has_resume) score += 30;
        if (profile?.github_url) score += 15;
        if (profile?.linkedin_url) score += 15;
        if (profile?.location) score += 10;
        if (profile?.notice_period !== undefined) score += 10;
        return score;
    };

    // Helper: generate mock growth suggestions based on skills
    const getLearningRecommendations = (skills) => {
        if (!skills) return [];
        const lowercaseSkills = skills.map(s => s.toLowerCase());
        const recs = [];
        
        if (!lowercaseSkills.includes('docker') && !lowercaseSkills.includes('kubernetes')) {
            recs.push({
                topic: "Cloud Native Deployment",
                desc: "Learn Docker containerization and Kubernetes orchestration to match standard cloud architect expectations.",
                duration: "2 weeks"
            });
        }
        if (!lowercaseSkills.includes('aws') && !lowercaseSkills.includes('gcp')) {
            recs.push({
                topic: "Cloud Infrastructure (AWS)",
                desc: "Upskill in cloud computing (EC2, S3, IAM) to support scalable backend deployments.",
                duration: "3 weeks"
            });
        }
        if (lowercaseSkills.includes('python') && !lowercaseSkills.includes('pytorch') && !lowercaseSkills.includes('tensorflow')) {
            recs.push({
                topic: "Applied Machine Learning",
                desc: "Transition your Python skills towards AI engineering by mastering PyTorch fundamentals.",
                duration: "4 weeks"
            });
        }
        
        recs.push({
            topic: "System Design Fundamentals",
            desc: "Study distributed caching, database indexing, and event-driven architecture.",
            duration: "Continuous"
        });
        
        return recs.slice(0, 3);
    };

    const completionScore = calculateCompletion();
    const skillsList = resumeStatus?.structured_analysis?.skills || [];
    const recommendations = getLearningRecommendations(skillsList);

    return (
        <div className="min-h-screen bg-[#fafffa] text-[#121613] pb-32 selection:bg-[#2bee4b] selection:text-[#121613] font-twk-lausanne animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <header className="border-b border-[#c8d2c8]/30 sticky top-0 z-40 bg-[#fafffa]/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-base tracking-tight select-none">
                            <span className="text-[#121613]">Trust</span>
                            <span className="text-[#2bee4b] ml-[2px]">Hire</span>
                        </span>
                        <span className="text-[10px] text-[#516254] font-mono tracking-widest uppercase ml-2 px-2 py-0.5 border border-[#c8d2c8]/50 rounded">CONSOLE</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-semibold text-[#121613]">{profile?.full_name || 'Candidate'}</div>
                            <div className="text-[10px] text-[#516254] uppercase tracking-wider font-light">Verified Engineer Profile</div>
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

            <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
                {/* Greeting & Quick Upload */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Greeting & Profile Status */}
                    <div className="lg:col-span-2 bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px] flex flex-col justify-between">
                        <div>
                            <h2 className="font-editorial-new text-[36px] font-light leading-[1.0] text-[#121613] tracking-tight">
                                Hello, {profile?.full_name || 'Engineer'}
                            </h2>
                            <p className="text-xs text-[#516254] mt-2 font-light">
                                Track matching vacancies, candidate evaluation metrics, and grit profile indicators.
                            </p>
                            
                            <div className="mt-8 flex flex-wrap gap-6 text-xs text-[#121613]/90 font-light">
                                <div className="flex items-center gap-2"><MapPin size={14} className="text-[#93b799]" /> {profile?.location || "Location not set"}</div>
                                <div className="flex items-center gap-2"><Calendar size={14} className="text-[#93b799]" /> Notice: {profile?.notice_period || 0} days</div>
                                <div className="flex items-center gap-2"><Briefcase size={14} className="text-[#93b799]" /> Experience: {profile?.experience_years || 0} years</div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[#c8d2c8]/30 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[10px] bg-[#fafffa] border border-[#121613] text-[#121613] font-bold text-sm flex items-center justify-center">
                                    {completionScore}%
                                </div>
                                <div className="text-xs">
                                    <div className="font-semibold text-[#121613]">Profile Completion Rating</div>
                                    <div className="text-[#516254] font-light text-[10px] mt-0.5">Integrate links to optimize verifiability.</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setEditing(!editing); setFullName(profile?.full_name || ''); }}
                                className="px-4 py-2 rounded-[10px] bg-[#fafffa] border border-[#c8d2c8] hover:border-[#121613] text-[#121613] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                                {editing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>

                    {/* Resume Upload Box */}
                    <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px] flex flex-col justify-center items-center text-center relative overflow-hidden">
                        {uploading ? (
                            <div className="space-y-4 py-6">
                                <RefreshCw size={28} className="animate-spin text-[#2bee4b] mx-auto" />
                                <div className="text-xs font-semibold text-[#121613]">Recalibrating Resume & Skills...</div>
                                <p className="text-[10px] text-[#516254] font-light">Generating explainable semantic profiles.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4 w-full">
                                <Upload size={28} className="text-[#93b799] mx-auto" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#121613]">Upload Resume</h3>
                                <p className="text-[10px] text-[#516254] font-light max-w-xs mx-auto">Upload PDF or Text credentials. Max limit: 5MB.</p>
                                
                                <div className="relative inline-block">
                                    <input 
                                        type="file" 
                                        accept=".pdf,.txt"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                    />
                                    <button className="px-5 py-2.5 rounded-[10px] bg-[#2bee4b] text-[#121613] text-xs font-bold uppercase tracking-wider transition-all shadow-[rgba(16,94,29,0.3)_1px_4px_10px_0px] cursor-pointer">
                                        Select File
                                    </button>
                                </div>
                                
                                {uploadError && (
                                    <div className="text-[10px] text-red-600 mt-2 font-medium flex items-center justify-center gap-1">
                                        <AlertTriangle size={12} /> {uploadError}
                                    </div>
                                )}
                                {uploadSuccess && (
                                    <div className="text-[10px] text-green-700 mt-2 font-medium flex items-center justify-center gap-1">
                                        <CheckCircle2 size={12} /> Resume synchronised successfully.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Profile Form */}
                {editing && (
                    <form onSubmit={handleSaveProfile} className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px] grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5 col-span-3 pb-2 border-b border-[#c8d2c8]/30">
                            <h3 className="font-editorial-new text-xl text-[#121613]">Modify Profile Details</h3>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3.5 py-2.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] font-light"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Location</label>
                            <input 
                                type="text" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Bangalore, India"
                                className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3.5 py-2.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] font-light"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Notice Period (Days)</label>
                            <input 
                                type="number" 
                                value={noticePeriod} 
                                onChange={(e) => setNoticePeriod(e.target.value)}
                                className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3.5 py-2.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] font-light"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">GitHub Username / URL</label>
                            <input 
                                type="text" 
                                value={github} 
                                onChange={(e) => setGithub(e.target.value)}
                                placeholder="github_username"
                                className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3.5 py-2.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] font-light"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">LinkedIn Username / URL</label>
                            <input 
                                type="text" 
                                value={linkedin} 
                                onChange={(e) => setLinkedin(e.target.value)}
                                placeholder="linkedin_username"
                                className="w-full bg-[#fafffa] border border-[#c8d2c8] rounded-[10px] px-3.5 py-2.5 text-xs text-[#121613] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] font-light"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="w-full py-3 rounded-[10px] bg-[#121613] text-[#fafffa] text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
                            >
                                {savingProfile ? 'Synchronising...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Dashboard Metrics details */}
                {loadingStatus ? (
                    <div className="flex justify-center py-20">
                        <RefreshCw size={24} className="animate-spin text-[#93b799]" />
                    </div>
                ) : resumeStatus?.has_resume ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_0.3s_ease-out]">
                        {/* Left Side: Score Overview & Skills */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Score Breakdown Cards (Linen surfaces, no borders/shadow) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-5 rounded-[14px] flex flex-col justify-between">
                                    <span className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Semantic Match Score</span>
                                    <div className="text-3xl font-bold text-[#121613] mt-3">82.0%</div>
                                </div>
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-5 rounded-[14px] flex flex-col justify-between">
                                    <span className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Grit Trajectory Vector</span>
                                    <div className="text-3xl font-bold text-[#121613] mt-3">78.5%</div>
                                </div>
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-5 rounded-[14px] flex flex-col justify-between">
                                    <span className="text-[10px] text-[#516254] uppercase tracking-wider font-semibold">Integrity Index</span>
                                    <div className="text-3xl font-bold text-[#2bee4b] mt-3">90.0%</div>
                                </div>
                            </div>

                            {/* Skills Map */}
                            <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px]">
                                <h3 className="font-semibold uppercase tracking-wider text-xs text-[#121613] mb-4">Parsed Core Tech Stack</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {skillsList.map((skill, idx) => (
                                        <span 
                                            key={idx} 
                                            className="text-xs bg-[#fafffa] text-[#516254] border border-[#c8d2c8] px-3.5 py-1.5 rounded-full font-light"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Job Matches / Applied */}
                            <div className="bg-[#fafffa] border border-[#c8d2c8]/40 rounded-[14px] overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#c8d2c8]/30">
                                    <h4 className="font-semibold uppercase tracking-wider text-xs text-[#121613]">Platform Matches</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-[#c8d2c8]/10 text-[10px] text-[#516254] uppercase tracking-widest border-b border-[#c8d2c8]/30">
                                                <th className="px-6 py-4 font-semibold">Job Title</th>
                                                <th className="px-6 py-4 font-semibold">Company</th>
                                                <th className="px-6 py-4 font-semibold">Index Score</th>
                                                <th className="px-6 py-4 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#c8d2c8]/20 text-xs font-light">
                                            {resumeStatus.rankings?.map((r, idx) => (
                                                <tr key={idx} className="hover:bg-[#c8d2c8]/5 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-[#121613]">{r.job_title}</td>
                                                    <td className="px-6 py-4 text-[#516254]">{r.company_name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-[5px] bg-[#2bee4b]/10 text-[#121613] font-bold">
                                                            {r.overall_score}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {r.status === 'shortlisted' ? (
                                                            <span className="px-2 py-0.5 rounded-[5px] border border-[#2bee4b] text-[#121613] font-semibold text-[10px] uppercase bg-[#2bee4b]/10">
                                                                Shortlisted
                                                            </span>
                                                        ) : (
                                                            <span className="text-[#516254] text-[10px] uppercase tracking-wider font-medium">In Funnel</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!resumeStatus.rankings || resumeStatus.rankings.length === 0) && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-10 text-[#516254] italic">
                                                        Generating trajectory alignments... Ensure links are complete.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Skill Gap & Trajectory Recommendations */}
                        <div className="space-y-8">
                            {/* Skill Gaps & recommendations */}
                            <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px] space-y-6">
                                <div>
                                    <h3 className="font-semibold uppercase tracking-wider text-xs text-[#121613] mb-1.5 flex items-center gap-2">
                                        <BookOpen size={14} className="text-[#93b799]" />
                                        Upskilling Trajectory
                                    </h3>
                                    <p className="text-[10px] text-[#516254] font-light">Recommended focus areas to address semantic role differences.</p>
                                </div>

                                <div className="space-y-4">
                                    {recommendations.map((rec, idx) => (
                                        <div key={idx} className="p-4 rounded-[10px] border border-[#c8d2c8]/40 bg-[#fafffa] space-y-2">
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="text-[#121613]">{rec.topic}</span>
                                                <span className="text-[9px] bg-[#121613] text-[#fafffa] px-2 py-0.5 rounded font-mono uppercase">{rec.duration}</span>
                                            </div>
                                            <p className="text-[10px] text-[#516254] leading-relaxed font-light">{rec.desc}</p>
                                        </div>
                                    ))}
                                    {recommendations.length === 0 && (
                                        <div className="text-xs text-[#516254] italic text-center py-4">
                                            Zero alignment gaps. Profile satisfies candidate targets.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Projects & Verification Status */}
                            <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px] space-y-4">
                                <h3 className="font-semibold uppercase tracking-wider text-xs text-[#121613]">Verifiability Check</h3>
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center justify-between p-3.5 rounded-[10px] border border-[#c8d2c8]/40 bg-[#fafffa]">
                                        <div className="flex items-center gap-2">
                                            <Github size={14} className={profile?.github_url ? 'text-[#2bee4b]' : 'text-[#c8d2c8]'} />
                                            <span className="font-light">GitHub Repository Map</span>
                                        </div>
                                        {profile?.github_url ? (
                                            <span className="text-[10px] font-bold text-[#121613] uppercase tracking-wider">Linked</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Unlinked</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3.5 rounded-[10px] border border-[#c8d2c8]/40 bg-[#fafffa]">
                                        <div className="flex items-center gap-2">
                                            <Linkedin size={14} className={profile?.linkedin_url ? 'text-[#2bee4b]' : 'text-[#c8d2c8]'} />
                                            <span className="font-light">LinkedIn Credentials</span>
                                        </div>
                                        {profile?.linkedin_url ? (
                                            <span className="text-[10px] font-bold text-[#121613] uppercase tracking-wider">Linked</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Unlinked</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3.5 rounded-[10px] border border-[#c8d2c8]/40 bg-[#fafffa]">
                                        <div className="flex items-center gap-2">
                                            <Award size={14} className="text-[#93b799]" />
                                            <span className="font-light">Verified Projects</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#121613]">
                                            {resumeStatus.structured_analysis?.projects?.length || 0} Parsed
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* GitHub Calendar Visualization */}
                            {profile?.github_url && (
                                <div className="bg-[#fafffa] border border-[#c8d2c8]/40 p-6 rounded-[14px] space-y-4 overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                                    <h3 className="font-semibold uppercase tracking-wider text-xs text-[#121613] pb-2 border-b border-[#c8d2c8]/30">GitHub Grit Graph</h3>
                                    <div className="overflow-x-auto py-1">
                                        <GithubCalendar username={profile.github_url} colorSchema="green" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#fafffa] border border-[#c8d2c8]/40 rounded-[14px] max-w-xl mx-auto">
                        <FileText size={40} className="mx-auto text-[#93b799] mb-4" />
                        <h3 className="font-editorial-new text-2xl text-[#121613] mb-3">No Active Resume Found</h3>
                        <p className="text-[#516254] text-xs mb-6 max-w-xs mx-auto font-light leading-relaxed">
                            Synchronize your profile by selecting your latest resume. This parses work history vectors, skill nodes, and matches engineering openings.
                        </p>
                    </div>
                )}
            </main>

            {/* Hidden Input for Dock Uploader */}
            <input 
                type="file" 
                ref={fileInputRef} 
                accept=".pdf,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
            />

            {/* Floating Magnetic Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <MagneticDock 
                    items={[
                        { id: "dashboard", label: "Dashboard", icon: <Briefcase size={20} />, isActive: !editing, onClick: () => setEditing(false) },
                        { id: "upload", label: "Upload Resume", icon: <Upload size={20} />, onClick: () => fileInputRef.current?.click() },
                        { id: "profile", label: "Edit Profile", icon: <User size={20} />, isActive: editing, onClick: () => { setEditing(true); setFullName(profile?.full_name || ''); } },
                        { id: "refresh", label: "Refresh Status", icon: <RefreshCw size={20} />, onClick: fetchResumeStatus },
                        { id: "signout", label: "Sign Out", icon: <LogOut size={20} className="text-red-500" />, onClick: logout },
                    ]}
                />
            </div>
        </div>
    );
}

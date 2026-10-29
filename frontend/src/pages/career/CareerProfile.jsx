import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { careerApi, companiesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CompanyLogo from '../../components/common/CompanyLogo';
import {
  FileText,
  Check,
  CheckCircle2,
  RefreshCw,
  Trash2,
  X,
  AlertCircle,
  Camera,
  Briefcase,
  MapPin,
  Building2,
  Star,
  Layers,
  Activity,
  Sliders,
  Sparkles,
  BookOpen,
  DollarSign,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Share2,
} from 'lucide-react';
import UploadDropzone from '../../components/ui/UploadDropzone';
import AppleActivityCard from '../../components/kokonutui/apple-activity-card';
import SaveButton from '../../components/kokonutui/save-button';
import HoldButton from '../../components/kokonutui/hold-button';
import UserAvatar, { ILLUSTRATED_AVATARS, getAvatarById } from '../../components/common/UserAvatar';
import IllustratedAvatarGallery from '../../components/profile/IllustratedAvatarGallery';

export default function CareerProfile() {
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [savedCompanies, setSavedCompanies] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedTab, setSavedTab] = useState('companies');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newSkill, setNewSkill] = useState('');

  // Active Tab navigation (GitHub Profile style)
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);

  // Avatar State
  const [avatarType, setAvatarType] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trusthire_user_avatar_type') || 'illustrated';
    }
    return 'illustrated';
  });
  const [activeAvatarId, setActiveAvatarId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trusthire_user_avatar_id');
      if (stored && stored.startsWith('avatar-0')) return stored;
    }
    return 'avatar-01';
  });

  const [customAvatarUrl, setCustomAvatarUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trusthire_user_custom_avatar') || null;
    }
    return null;
  });

  // Editable Profile State
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [workplace, setWorkplace] = useState('any');
  const [employmentType, setEmploymentType] = useState('full-time');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [prefLocations, setPrefLocations] = useState('');
  const [prefTitles, setPrefTitles] = useState('');
  const [salMin, setSalMin] = useState('');
  const [salMax, setSalMax] = useState('');

  // Career Activity Targets / Goals State (Apple Watch Activity Rings)
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('trusthire_career_goals');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      appliedTarget: 10,
      skillsTarget: null,
      savedTarget: 10
    };
  });
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [goalsForm, setGoalsForm] = useState({
    appliedTarget: 10,
    skillsTarget: 15,
    savedTarget: 10
  });

  // Resume Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const [operatingResumeId, setOperatingResumeId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, resumesRes, savedCompaniesRes, savedJobsRes, appsRes] = await Promise.all([
        careerApi.getProfile().catch(() => ({ data: {} })),
        careerApi.listResumes().catch(() => ({ data: [] })),
        careerApi.listSavedCompanies().catch(() => ({ data: [] })),
        careerApi.listSavedJobs().catch(() => ({ data: [] })),
        careerApi.listApplications().catch(() => ({ data: [] }))
      ]);

      const p = profileRes.data || {};
      setProfile(p);
      setHeadline(p.headline || '');
      setSummary(p.summary || '');
      setSkills(p.skills || []);
      setWorkplace(p.workplace_preference || 'any');
      setEmploymentType(p.employment_type_preference || 'full-time');
      setExperienceLevel(p.experience_level || 'mid');
      setPrefLocations((p.preferred_locations || []).join(', '));
      setPrefTitles((p.preferred_job_titles || []).join(', '));
      setSalMin(p.salary_preference_min ?? '');
      setSalMax(p.salary_preference_max ?? '');

      if (p.avatar_type) setAvatarType(p.avatar_type);
      if (p.avatar_id) setActiveAvatarId(p.avatar_id);
      if (p.custom_avatar_url) setCustomAvatarUrl(p.custom_avatar_url);

      if (p.avatar_type) setAvatarType(p.avatar_type);
      if (p.avatar_id) setActiveAvatarId(p.avatar_id);
      if (p.custom_avatar_url) setCustomAvatarUrl(p.custom_avatar_url);

      // Load user-defined activity ring goals if present in profile
      if (p.career_interests) {
        if (typeof p.career_interests === 'object' && !Array.isArray(p.career_interests) && p.career_interests.activity_goals) {
          setGoals(prev => ({ ...prev, ...p.career_interests.activity_goals }));
        } else if (Array.isArray(p.career_interests)) {
          const foundGoals = p.career_interests.find(item => item && (item.__type === 'activity_goals' || item.appliedTarget));
          if (foundGoals) {
            setGoals(prev => ({ ...prev, ...foundGoals }));
          }
        }
      }

      const rawResumes = resumesRes.data;
      const resumesList = Array.isArray(rawResumes) ? rawResumes : (rawResumes?.resumes || []);
      setResumes(resumesList);

      const rawCompanies = savedCompaniesRes.data;
      const companiesList = Array.isArray(rawCompanies) ? rawCompanies : (rawCompanies?.saved_companies || []);
      setSavedCompanies(companiesList);

      const rawJobs = savedJobsRes.data;
      const jobsList = Array.isArray(rawJobs) ? rawJobs : (rawJobs?.saved_jobs || []);
      setSavedJobs(jobsList);

      const rawApps = appsRes.data;
      const appsList = Array.isArray(rawApps) ? rawApps : (rawApps?.applications || []);
      setApplications(appsList);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Resume Upload Handler (Instant Auto-Populate)
  const handleFileUpload = async (file, replaceId = null) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please upload a smaller document.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setErrorMessage('Please upload a PDF or Word (.docx) document.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setUploadStep('Reading document...');
    setErrorMessage('');
    setMessage('');

    try {
      setTimeout(() => {
        setUploadProgress(65);
        setUploadStep('Extracting skills and experience...');
      }, 300);

      let res;
      if (replaceId) {
        res = await careerApi.replaceResume(replaceId, file);
      } else {
        res = await careerApi.uploadResume(file);
      }

      setUploadProgress(100);
      setUploadStep('Complete');
      
      // Auto-populate extracted data in state immediately
      if (res?.data?.profile) {
        const p = res.data.profile;
        if (p.skills) setSkills(p.skills);
        if (p.headline) setHeadline(p.headline);
        if (p.summary) setSummary(p.summary);
      }

      setMessage('Resume uploaded successfully! Your skills, experience, and job matches have been synced.');

      // Refresh list & profile
      await loadData();
      return res;
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to upload document. Please ensure it is a valid file.';
      setErrorMessage(msg);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStep('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Delete this resume from your profile?')) return;
    setOperatingResumeId(id);
    try {
      await careerApi.deleteResume(id);
      loadData();
    } catch (err) {
      setErrorMessage('Failed to delete resume.');
    } finally {
      setOperatingResumeId(null);
    }
  };

  const handleReanalyseResume = async (id) => {
    setOperatingResumeId(id);
    setErrorMessage('');
    try {
      await careerApi.reanalyseResume(id);
      setMessage('Resume re-scanned. Details updated.');
      loadData();
    } catch (err) {
      setErrorMessage('Failed to re-scan resume.');
    } finally {
      setOperatingResumeId(null);
    }
  };

  const handleToggleSaveCompany = async (slug) => {
    try {
      await companiesApi.toggleSave(slug);
      const res = await careerApi.listSavedCompanies();
      const raw = res.data;
      setSavedCompanies(Array.isArray(raw) ? raw : (raw?.saved_companies || []));
    } catch (err) {
      console.error('Failed to toggle save company:', err);
    }
  };

  const handleToggleSaveJob = async (jobId) => {
    try {
      await careerApi.toggleSaveJob(jobId);
      const res = await careerApi.listSavedJobs();
      const raw = res.data;
      setSavedJobs(Array.isArray(raw) ? raw : (raw?.saved_jobs || []));
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const clean = newSkill.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      for (const res of resumes) {
        try {
          await careerApi.deleteResume(res.id);
        } catch {
          // ignore individual error
        }
      }
      localStorage.removeItem('mock_session');
      localStorage.removeItem('token');
      localStorage.removeItem('trusthire_user_custom_avatar');
      localStorage.removeItem('trusthire_user_avatar_id');
      if (logout) {
        await logout();
      }
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to delete account:', err);
      setErrorMessage('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setMessage('');
    setErrorMessage('');
    try {
      const locArray = prefLocations.split(',').map(s => s.trim()).filter(Boolean);
      const titleArray = prefTitles.split(',').map(s => s.trim()).filter(Boolean);

      const res = await careerApi.updateProfile({
        headline,
        summary,
        skills,
        avatar_type: avatarType,
        avatar_id: activeAvatarId,
        custom_avatar_url: customAvatarUrl || '',
        avatar_type: avatarType,
        avatar_id: activeAvatarId,
        custom_avatar_url: customAvatarUrl || '',
        workplace_preference: workplace,
        employment_type_preference: employmentType,
        experience_level: experienceLevel,
        preferred_locations: locArray,
        preferred_job_titles: titleArray,
        salary_preference_min: salMin ? parseFloat(salMin) : null,
        salary_preference_max: salMax ? parseFloat(salMax) : null,
        is_confirmed: true
      });
      setProfile(res.data);
      setMessage('Profile saved successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to update profile. Please verify your inputs.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (selected) => {
    const nextType = selected.avatarType || (selected.type === 'custom' || selected.type === 'uploaded' ? 'uploaded' : 'illustrated');
    const nextId = selected.avatarId || selected.id || 'avatar-01';
    const nextUrl = selected.customUrl !== undefined ? selected.customUrl : (selected.url || customAvatarUrl);

    setAvatarType(nextType);
    setActiveAvatarId(nextId);
    if (nextUrl) setCustomAvatarUrl(nextUrl);

    try {
      localStorage.setItem('trusthire_user_avatar_type', nextType);
      localStorage.setItem('trusthire_user_avatar_id', nextId);
      if (nextUrl) localStorage.setItem('trusthire_user_custom_avatar', nextUrl);
    } catch {
      // ignore
    }

    try {
      await careerApi.updateProfile({
        avatar_type: nextType,
        avatar_id: nextId,
        custom_avatar_url: nextUrl || ''
      });
      setMessage(nextType === 'uploaded' ? 'Custom profile headshot updated.' : `Avatar persona updated to ${selected.name || 'new selection'}.`);
    } catch (err) {
      console.warn('Could not sync avatar change immediately:', err);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const primaryResume = resumes.find(r => r.is_primary) || resumes[0];
    const displayName = profile?.name || user?.user_metadata?.full_name || 'Alex Morgan';
  const displayUsername = user?.email ? user.email.split('@')[0] : 'candidate';

  // Real Authentic Candidate Career Activity Metrics (Apple Activity Rings)
  const appliedCount = Array.isArray(applications) ? applications.length : 0;
  const skillsCount = Array.isArray(skills) ? skills.length : 0;
  const savedCount = (Array.isArray(savedCompanies) ? savedCompanies.length : 0) + 
                     (Array.isArray(savedJobs) ? savedJobs.length : 0);

  // Targets: user-defined goals, or dynamically calibrated baseline according to user profile
  const appliedTarget = Number(goals?.appliedTarget) || 10;
  const skillsTarget = Number(goals?.skillsTarget) || (skillsCount > 0 ? Math.max(15, Math.ceil((skillsCount + 1) / 5) * 5) : 15);
  const savedTarget = Number(goals?.savedTarget) || 10;

  const handleOpenGoalsModal = () => {
    setGoalsForm({
      appliedTarget,
      skillsTarget,
      savedTarget
    });
    setIsGoalsModalOpen(true);
  };

  const handleSaveGoals = async (e) => {
    e?.preventDefault();
    const updated = {
      appliedTarget: Math.max(1, parseInt(goalsForm.appliedTarget, 10) || 10),
      skillsTarget: Math.max(1, parseInt(goalsForm.skillsTarget, 10) || 15),
      savedTarget: Math.max(1, parseInt(goalsForm.savedTarget, 10) || 10),
      __type: 'activity_goals'
    };
    setGoals(updated);
    try {
      localStorage.setItem('trusthire_career_goals', JSON.stringify(updated));
      const currentInterests = Array.isArray(profile?.career_interests) ? profile.career_interests : [];
      const filtered = currentInterests.filter(i => !(i && (i.__type === 'activity_goals' || i.appliedTarget)));
      filtered.push(updated);
      await careerApi.updateProfile({ career_interests: filtered });
      setMessage('Career activity targets updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.warn('Could not sync goals to backend, cached locally:', err);
    }
    setIsGoalsModalOpen(false);
  };

  const careerActivities = [
    {
      label: "APPLIED JOBS",
      color: "#FF2D55",
      colorEnd: "#FF6B8B",
      size: 200,
      current: appliedCount,
      target: appliedTarget,
      unit: "ROLES",
    },
    {
      label: "SKILLS",
      color: "#A3F900",
      colorEnd: "#C5FF4D",
      size: 160,
      current: skillsCount,
      target: skillsTarget,
      unit: "SKILLS",
    },
    {
      label: "SAVED",
      color: "#04C7DD",
      colorEnd: "#4DDFED",
      size: 120,
      current: savedCount,
      target: savedTarget,
      unit: "ROLES",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/15 border-t-[#0071e3] rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#86868b] tracking-wide">
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans antialiased pb-28">
      
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
        id="career-resume-input"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], primaryResume?.id)}
        className="hidden"
        id="career-replace-input"
      />

      {/* GITHUB-STYLE TOP SUB-NAV BAR (Apple UI Styled) */}
      <div className="border-b border-black/[0.08] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Tabs with Bezel Container & Matched Spring Animation */}
            <nav className="flex items-center gap-1 p-1 rounded-full bg-[#F0F0EE] border border-black/[0.04] overflow-x-auto no-scrollbar relative">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'resume', label: 'Resume', icon: FileText, badge: primaryResume ? 'Uploaded' : null },
                { id: 'saved', label: 'Saved', icon: Star, badge: (Array.isArray(savedCompanies) ? savedCompanies.length : 0) + (Array.isArray(savedJobs) ? savedJobs.length : 0) },
                { id: 'preferences', label: 'Preferences', icon: Sliders },
                { id: 'activity', label: 'Activity', icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer shrink-0 select-none ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="profile-subnav-active-pill"
                        className="absolute inset-0 bg-[#121613] rounded-full shadow-2xs pointer-events-none"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 38,
                          mass: 0.85,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 stroke-[2]" />
                      <span>{tab.label}</span>
                      {tab.badge !== null && tab.badge !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#86868b]'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1d1d1f] hover:bg-black active:scale-[0.98] text-white text-xs font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Alerts / Feedback Banner */}
        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-900 text-xs font-medium flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage('')}
              className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-900 text-xs font-medium flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-rose-700 hover:text-rose-950 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2-COLUMN GITHUB-STYLE PROFILE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: IDENTITY & AVATAR (GitHub Style)            */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4 xl:col-span-3.5 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white rounded-3xl p-6 border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
              
              {/* Large Profile Avatar with Floating Camera Badge */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto">
                <div className="w-full h-full rounded-full overflow-hidden border border-black/10 bg-white shadow-sm flex items-center justify-center">
                  <UserAvatar
                    avatarType={avatarType}
                    avatarId={activeAvatarId}
                    customUrl={customAvatarUrl}
                    name={displayName}
                    size="full"
                    className="w-full h-full border-0"
                    imgClassName="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Floating Camera Button (Aligned at bottom-right of bubble) */}
                <button
                  type="button"
                  onClick={() => setShowAvatarCustomizer(!showAvatarCustomizer)}
                  className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-white hover:bg-[#f5f5f7] active:scale-95 text-[#1d1d1f] shadow-md border border-black/10 transition-all flex items-center justify-center cursor-pointer"
                  title={showAvatarCustomizer ? "Close Avatar Gallery" : "Change Avatar or Photo"}
                  aria-label={showAvatarCustomizer ? "Close Avatar Gallery" : "Change Avatar or Photo"}
                >
                  <Camera className="w-5 h-5 text-[#1d1d1f] stroke-[2]" />
                </button>
              </div>

              {/* Name & Headline */}
              <div className="space-y-1 text-center sm:text-left pt-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                    {displayName}
                  </h1>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#86868b]">
                  <span>@{displayUsername}</span>
                </div>

                <p className="text-xs text-[#515154] leading-relaxed pt-2">
                  {headline || 'Senior Software Engineer'}
                </p>

                {/* Toggle Avatar Gallery Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAvatarCustomizer(!showAvatarCustomizer)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] active:scale-[0.99] text-[#1d1d1f] text-xs font-medium border border-black/[0.06] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-[#515154] stroke-[2]" />
                    <span>{showAvatarCustomizer ? 'Close Avatar Gallery' : 'Change Avatar Persona'}</span>
                  </button>
                </div>
              </div>

              {/* Edit Profile Quick Action Button */}
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] active:scale-[0.99] text-[#1d1d1f] text-xs font-semibold border border-black/[0.06] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                {saving ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>

              {/* Quick Metadata Info List (Apple SF Symbols aesthetic) */}
              <div className="pt-3 border-t border-black/[0.06] space-y-3 text-xs text-[#515154]">
                
                {prefTitles && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-[#86868b] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{prefTitles}</span>
                  </div>
                )}

                {prefLocations && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#86868b] shrink-0 mt-0.5" />
                    <span>{prefLocations}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#86868b] shrink-0" />
                  <span className="capitalize">
                    {workplace === 'any' ? 'Flexible Arrangement' : workplace === 'remote' ? '100% Remote' : workplace}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#86868b] shrink-0" />
                  <span className="truncate">
                    {primaryResume ? primaryResume.file_name : 'No resume uploaded'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-[#86868b] shrink-0" />
                  <span>
                    {(Array.isArray(savedCompanies) ? savedCompanies.length : 0)} Companies • {(Array.isArray(savedJobs) ? savedJobs.length : 0)} Jobs saved
                  </span>
                </div>

              </div>

              {/* Apple Activity Rings Mini Corner Showcase */}
              <div className="pt-4 border-t border-black/[0.06] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#FF2D55]" />
                    Career Activity Rings
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenGoalsModal}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] border border-black/[0.04] transition-colors cursor-pointer"
                    title="Configure career targets"
                  >
                    Goals • Set
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF2D55]" />
                      <span className="text-[#1d1d1f] font-semibold">APPLIED</span>
                      <span className="text-[#86868b]">{appliedCount} / {appliedTarget} ROLES</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#A3F900]" />
                      <span className="text-[#1d1d1f] font-semibold">SKILLS</span>
                      <span className="text-[#86868b]">{skillsCount} / {skillsTarget} SKILLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#04C7DD]" />
                      <span className="text-[#1d1d1f] font-semibold">SAVED</span>
                      <span className="text-[#86868b]">{savedCount} / {savedTarget} ROLES</span>
                    </div>
                  </div>

                  {/* Concentric Rings SVG Graphic */}
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="-rotate-90 w-14 h-14" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="24" fill="none" stroke="#e5e5ea" strokeWidth="4.5" />
                      <circle cx="30" cy="30" r="24" fill="none" stroke="#FF2D55" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="150.8" strokeDashoffset={Math.max(0, 150.8 * (1 - Math.min(appliedCount / appliedTarget, 1)))} />
                      <circle cx="30" cy="30" r="17.5" fill="none" stroke="#e5e5ea" strokeWidth="4.5" />
                      <circle cx="30" cy="30" r="17.5" fill="none" stroke="#A3F900" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="110" strokeDashoffset={Math.max(0, 110 * (1 - Math.min(skillsCount / skillsTarget, 1)))} />
                      <circle cx="30" cy="30" r="11" fill="none" stroke="#e5e5ea" strokeWidth="4.5" />
                      <circle cx="30" cy="30" r="11" fill="none" stroke="#04C7DD" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="69.1" strokeDashoffset={Math.max(0, 69.1 * (1 - Math.min(savedCount / savedTarget, 1)))} />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* AVATAR GALLERY & PHOTO SELECTOR */}
            {showAvatarCustomizer && (
              <IllustratedAvatarGallery
                avatarType={avatarType}
                avatarId={activeAvatarId}
                customUrl={customAvatarUrl}
                onChange={handleAvatarChange}
                onSave={async (val) => {
                  await careerApi.updateProfile({
                    avatar_type: val.avatarType,
                    avatar_id: val.avatarId,
                    custom_avatar_url: val.customUrl || ''
                  });
                }}
                userName={displayName}
                userHeadline={headline}
                className="border-black/[0.08] shadow-sm"
              />
            )}

          </aside>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: GITHUB-STYLE MAIN CONTENT BLOCKS            */}
          {/* ========================================================= */}
          <main className="lg:col-span-8 xl:col-span-8.5 space-y-6">
            
            {/* 1. PINNED: RESUME INTELLIGENCE CARD */}
            {(activeTab === 'overview' || activeTab === 'resume') && (
              <section className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] border border-black/[0.05] text-[#1d1d1f] flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText className="w-5 h-5 stroke-[2] text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                        Primary Resume & Credentials
                      </h2>
                      <p className="text-xs text-[#86868b]">
                        Uploaded resume and documents.
                      </p>
                    </div>
                  </div>

                  {primaryResume && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.06]">
                      <span>Uploaded</span>
                    </span>
                  )}
                </div>

                {primaryResume ? (
                  /* Active Resume File Card */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#1d1d1f] shadow-xs shrink-0">
                        <FileText className="w-5 h-5 text-[#0071e3]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#1d1d1f] truncate">
                            {primaryResume.file_name}
                          </h3>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white text-[#86868b] border border-black/[0.06]">
                            {primaryResume.file_type}
                          </span>
                        </div>
                        <p className="text-xs text-[#86868b] mt-0.5">
                          {Math.round(primaryResume.file_size / 1024)} KB • Updated {new Date(primaryResume.updated_at || primaryResume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Quick Resume Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReanalyseResume(primaryResume.id)}
                        disabled={operatingResumeId === primaryResume.id}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-medium border border-black/[0.06] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                        title="Re-scan skills"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${operatingResumeId === primaryResume.id ? 'animate-spin' : ''}`} />
                        <span>Re-scan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => replaceInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-medium border border-black/[0.06] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteResume(primaryResume.id)}
                        disabled={operatingResumeId === primaryResume.id}
                        className="p-1.5 rounded-full bg-white hover:bg-rose-50 text-[#86868b] hover:text-rose-600 border border-black/[0.06] transition-colors cursor-pointer"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Bencho Upload Dropzone (Clean Embedded) */
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#f5f5f7]/60 border border-black/[0.06]">
                    <UploadDropzone
                      onUpload={handleFileUpload}
                      accept=".pdf,.docx"
                      maxSizeMb={10}
                    />
                  </div>
                )}
              </section>
            )}

            {/* 2. PINNED: SKILLS & TECHNOLOGIES CARD */}
            {(activeTab === 'overview' || activeTab === 'preferences') && (
              <section className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] border border-black/[0.05] text-[#1d1d1f] flex items-center justify-center shrink-0 shadow-2xs">
                      <Layers className="w-5 h-5 stroke-[2] text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                        Skills & Technologies ({skills.length})
                      </h2>
                      <p className="text-xs text-[#86868b]">
                        Skills added to your profile.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add Skill Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Add skill (e.g. Python, React, Go, Docker)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#f5f5f7] border border-transparent hover:border-black/10 focus:border-[#0071e3]/40 focus:bg-white text-xs text-[#1d1d1f] placeholder-[#a1a1a6] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2.5 rounded-xl bg-[#1d1d1f] hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {/* Skill Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.length === 0 ? (
                    <p className="text-xs text-[#86868b] italic py-2">
                      No skills listed yet. Add skills above or upload your resume.
                    </p>
                  ) : (
                    skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-medium transition-colors border border-black/[0.04]"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-[#86868b] hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                          title="Remove skill"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* 3. PROFESSIONAL IDENTITY & SUMMARY */}
            {(activeTab === 'overview' || activeTab === 'preferences') && (
              <section className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] border border-black/[0.05] text-[#1d1d1f] flex items-center justify-center shrink-0 shadow-2xs">
                      <User className="w-5 h-5 stroke-[2] text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                        Identity & Biography
                      </h2>
                      <p className="text-xs text-[#86868b]">
                        Headline and brief summary.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Senior Backend Engineer • Distributed Systems"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f5f5f7] border border-transparent hover:border-black/10 focus:border-[#0071e3]/40 focus:bg-white text-xs text-[#1d1d1f] placeholder-[#a1a1a6] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                      Bio / Summary
                    </label>
                    <textarea
                      rows={3}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Brief overview of your experience, areas of expertise, and key accomplishments..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f5f5f7] border border-transparent hover:border-black/10 focus:border-[#0071e3]/40 focus:bg-white text-xs text-[#1d1d1f] placeholder-[#a1a1a6] outline-none transition-all leading-relaxed"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* 4. WORK PREFERENCES & ARRANGEMENT */}
            {(activeTab === 'overview' || activeTab === 'preferences') && (
              <section className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] border border-black/[0.05] text-[#1d1d1f] flex items-center justify-center shrink-0 shadow-2xs">
                      <Sliders className="w-5 h-5 stroke-[2] text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                        Work Preferences
                      </h2>
                      <p className="text-xs text-[#86868b]">
                        Target roles, locations, and workplace models.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workplace Arrangement (Apple Segmented Bar) */}
                <div>
                  <label className="block text-xs font-medium text-[#1d1d1f] mb-2">
                    Workplace Arrangement
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#f5f5f7] border border-black/[0.03]">
                    {[
                      { id: 'any', label: 'Flexible / Any' },
                      { id: 'remote', label: '100% Remote' },
                      { id: 'hybrid', label: 'Hybrid' },
                      { id: 'onsite', label: 'On-site' },
                    ].map(item => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setWorkplace(item.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          workplace === item.id
                            ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
                            : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Roles & Locations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                      Preferred Job Titles
                    </label>
                    <input
                      type="text"
                      value={prefTitles}
                      onChange={(e) => setPrefTitles(e.target.value)}
                      placeholder="e.g. Backend Engineer, Systems Architect"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f5f5f7] border border-transparent hover:border-black/10 focus:border-[#0071e3]/40 focus:bg-white text-xs text-[#1d1d1f] placeholder-[#a1a1a6] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                      Preferred Locations
                    </label>
                    <input
                      type="text"
                      value={prefLocations}
                      onChange={(e) => setPrefLocations(e.target.value)}
                      placeholder="e.g. Bangalore, Mumbai, Remote"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f5f5f7] border border-transparent hover:border-black/10 focus:border-[#0071e3]/40 focus:bg-white text-xs text-[#1d1d1f] placeholder-[#a1a1a6] outline-none transition-all"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* 5. SAVED OPPORTUNITIES (GitHub Repository Cards Style) */}
            {(activeTab === 'overview' || activeTab === 'saved') && (
              <section className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] border border-black/[0.05] text-[#1d1d1f] flex items-center justify-center shrink-0 shadow-2xs">
                      <Star className="w-5 h-5 stroke-[2] text-[#1d1d1f]" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                        Saved Opportunities ({(Array.isArray(savedCompanies) ? savedCompanies.length : 0) + (Array.isArray(savedJobs) ? savedJobs.length : 0)})
                      </h2>
                      <p className="text-xs text-[#86868b]">
                        Bookmarked companies and positions.
                      </p>
                    </div>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex items-center p-1 rounded-xl bg-[#f5f5f7] border border-black/[0.04] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSavedTab('companies')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        savedTab === 'companies'
                          ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                          : 'text-[#86868b] hover:text-[#1d1d1f]'
                      }`}
                    >
                      Companies ({Array.isArray(savedCompanies) ? savedCompanies.length : 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSavedTab('jobs')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        savedTab === 'jobs'
                          ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                          : 'text-[#86868b] hover:text-[#1d1d1f]'
                      }`}
                    >
                      Jobs ({Array.isArray(savedJobs) ? savedJobs.length : 0})
                    </button>
                  </div>
                </div>

                {savedTab === 'companies' ? (
                  savedCompanies.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#86868b] bg-[#fbfbfd] rounded-2xl border border-black/[0.03]">
                      <p className="font-semibold text-[#1d1d1f] mb-1">No saved companies yet</p>
                      <p>Explore the directory to bookmark companies you want to track.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {savedCompanies.map((item) => {
                        const c = item.company || item;
                        return (
                          <div
                            key={c.id || c.slug}
                            className="p-4 rounded-2xl bg-[#fbfbfd] hover:bg-white border border-black/[0.05] hover:border-black/15 flex items-center justify-between gap-3 transition-all shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <CompanyLogo company={c} size="w-10 h-10" imgSize="w-6 h-6" />
                              <div className="min-w-0">
                                <h3 className="text-xs font-semibold text-[#1d1d1f] truncate">
                                  {c.company_name}
                                </h3>
                                <p className="text-[11px] text-[#86868b] truncate mt-0.5">
                                  {c.industry || 'Tech'} • {c.headquarters || 'Global'}
                                </p>
                              </div>
                            </div>

                            <SaveButton
                              defaultSaved={true}
                              onRemove={() => handleToggleSaveCompany(c.slug)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  savedJobs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#86868b] bg-[#fbfbfd] rounded-2xl border border-black/[0.03]">
                      <p className="font-semibold text-[#1d1d1f] mb-1">No saved jobs yet</p>
                      <p>Browse open positions and save matches to review them here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedJobs.map((item) => {
                        const j = item.job || item;
                        return (
                          <div
                            key={j.id}
                            className="p-4 rounded-2xl bg-[#fbfbfd] hover:bg-white border border-black/[0.05] hover:border-black/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-2xs"
                          >
                            <div className="min-w-0">
                              <h3 className="text-xs font-semibold text-[#1d1d1f] truncate">
                                {j.title}
                              </h3>
                              <p className="text-[11px] text-[#86868b] mt-0.5">
                                {j.company_name} • {j.location || 'Remote'}
                              </p>
                            </div>

                            <SaveButton
                              defaultSaved={true}
                              onRemove={() => handleToggleSaveJob(j.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </section>
            )}

            {/* 6. APPLE ACTIVITY CARD: CAREER ACTIVITY RINGS */}
            {(activeTab === 'overview' || activeTab === 'activity') && (
              <section className="space-y-4">
                <AppleActivityCard
                  title="Career Activity Rings"
                  subtitle="Concentric activity rings tracking applied jobs, verified skills, and saved opportunities."
                  badge="Career Goals"
                  activities={careerActivities}
                  onEditGoals={handleOpenGoalsModal}
                />
              </section>
            )}

            {/* 7. ACCOUNT MANAGEMENT & DATA (Apple Minimal Danger Zone) */}
            <section className="pt-2">
              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Trash2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#1d1d1f] tracking-tight">
                      Delete Account
                    </h3>
                    <p className="text-[11px] text-[#86868b] mt-0.5">
                      Permanently remove your profile, uploaded resumes, and saved data.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 sm:self-center">
                  <HoldButton
                    variant="destructive"
                    holdDuration={2500}
                    onComplete={handleDeleteAccount}
                    completeText="Account Deleted"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Hold to Delete'}
                  </HoldButton>
                </div>
              </div>
            </section>

          </main>

        </div>

      </div>

      {/* Career Goals Configuration Modal (Apple-Styled) */}
      {isGoalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF2D55]/10 text-[#FF2D55] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Set Career Goals</h3>
                  <p className="text-[11px] text-[#86868b]">Personalize your concentric activity ring targets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoalsModalOpen(false)}
                className="p-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-medium text-[#1d1d1f]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55]" />
                    <span>Applied Roles Goal</span>
                  </span>
                  <span className="text-[11px] text-[#86868b]">Current: {appliedCount}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={goalsForm.appliedTarget}
                    onChange={(e) => setGoalsForm(prev => ({ ...prev, appliedTarget: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#fbfbfd] text-xs text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#FF2D55]/30 focus:border-[#FF2D55]"
                    placeholder="e.g. 10"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-[11px] text-[#86868b] pointer-events-none">ROLES</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-medium text-[#1d1d1f]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A3F900]" />
                    <span>Skills Competency Goal</span>
                  </span>
                  <span className="text-[11px] text-[#86868b]">Current: {skillsCount}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={goalsForm.skillsTarget}
                    onChange={(e) => setGoalsForm(prev => ({ ...prev, skillsTarget: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#fbfbfd] text-xs text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#A3F900]/40 focus:border-[#A3F900]"
                    placeholder="e.g. 25"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-[11px] text-[#86868b] pointer-events-none">SKILLS</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-medium text-[#1d1d1f]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#04C7DD]" />
                    <span>Saved Opportunities Goal</span>
                  </span>
                  <span className="text-[11px] text-[#86868b]">Current: {savedCount}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={goalsForm.savedTarget}
                    onChange={(e) => setGoalsForm(prev => ({ ...prev, savedTarget: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] bg-[#fbfbfd] text-xs text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#04C7DD]/30 focus:border-[#04C7DD]"
                    placeholder="e.g. 10"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-[11px] text-[#86868b] pointer-events-none">ROLES</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsGoalsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#1d1d1f] bg-black/[0.04] hover:bg-black/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors shadow-sm cursor-pointer"
                >
                  Save Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import EmbeddedYouTubePlayer from '../../components/learning/EmbeddedYouTubePlayer';
import ResourceCard from '../../components/learning/ResourceCard';
import AdminIngestModal from '../../components/learning/AdminIngestModal';
import { learningApi, careerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Play, CheckCircle2, Bookmark, Clock, ArrowRight,
  ExternalLink, Sparkles, Filter, ChevronRight, X, AlertCircle,
  Plus, BookOpen, Layers, Award, ShieldCheck, Compass, RotateCcw
} from 'lucide-react';

const TARGET_ROLES = [
  'All Roles',
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Cloud Engineer',
];

const DIFFICULTY_LEVELS = ['All Difficulties', 'Beginner', 'Intermediate', 'Advanced'];
const RESOURCE_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'video', label: 'YouTube Lessons' },
  { id: 'documentation', label: 'Official Documentation' },
  { id: 'course', label: 'Interactive Courses' },
];
const PRICING_OPTIONS = [
  { id: 'all', label: 'All Pricing' },
  { id: 'free', label: '100% Free' },
  { id: 'free_with_paid_cert', label: 'Free (Optional Cert)' },
  { id: 'paid', label: 'Paid Platforms' },
];

export default function LearningHubPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [hubData, setHubData] = useState({
    stats: {},
    continue_learning: [],
    completed_learning: [],
    my_roadmaps: [],
    learning_paths: [],
    recommended: [],
    youtube_lessons: [],
    courses_and_certifications: [],
  });

  // Active filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'All Roles');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');

  // Video Player state
  const [activeVideoResource, setActiveVideoResource] = useState(null);
  const [activeSavedPosition, setActiveSavedPosition] = useState(0);

  // Admin Modal
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Filtered resources for search results view
  const [filteredResources, setFilteredResources] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadHubData();
  }, [user]);

  const loadHubData = async () => {
    setLoading(true);
    try {
      const res = await learningApi.getHub();
      setHubData(res.data);
    } catch (err) {
      console.error('Failed to load learning hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Perform search / filter query
  useEffect(() => {
    const hasSearch = Boolean(
      search.trim() ||
      selectedRole !== 'All Roles' ||
      selectedDifficulty !== 'All Difficulties' ||
      selectedType !== 'all' ||
      selectedPricing !== 'all'
    );

    if (!hasSearch) {
      setIsSearching(false);
      setFilteredResources([]);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const params = {};
        if (search.trim()) params.q = search.trim();
        if (selectedRole !== 'All Roles') params.role = selectedRole;
        if (selectedDifficulty !== 'All Difficulties') params.difficulty = selectedDifficulty;
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedPricing !== 'all') params.pricing = selectedPricing;

        const res = await learningApi.listResources(params);
        setFilteredResources(res.data.results || res.data || []);
      } catch (err) {
        console.error('Failed to search resources:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedRole, selectedDifficulty, selectedType, selectedPricing]);

  const handleSelectVideo = (resource) => {
    const savedPos = resource.user_progress?.current_position_seconds || 0;
    setActiveSavedPosition(savedPos);
    setActiveVideoResource(resource);
  };

  const handleToggleSave = async (resourceId) => {
    if (!user) {
      alert('Please sign in to save learning resources to your profile.');
      return;
    }
    try {
      const res = await learningApi.toggleSave(resourceId);
      // Update local state in hubData
      loadHubData();
    } catch {
      // ignore
    }
  };

  const handleVideoCompleted = (resourceId) => {
    loadHubData();
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedRole('All Roles');
    setSelectedDifficulty('All Difficulties');
    setSelectedType('all');
    setSelectedPricing('all');
    setIsSearching(false);
  };

  const stats = hubData.stats || {};
  const continueList = hubData.continue_learning || [];
  const completedList = hubData.completed_learning || [];
  const roadmaps = hubData.my_roadmaps || [];
  const paths = hubData.learning_paths || [];
  const recommended = hubData.recommended || [];
  const ytLessons = hubData.youtube_lessons || [];
  const courses = hubData.courses_and_certifications || [];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-sans antialiased flex flex-col selection:bg-[#F0442D]/10 selection:text-[#F0442D]">
      <TrustHireNavbar />

      {/* Hero Header */}
      <header className="pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EAEAE5]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#F4F4F0] text-[#121613] font-bold">
                Career Readiness Platform
              </span>
              <span className="text-xs font-mono text-[#9A9A92]">•</span>
              <span className="text-xs font-mono text-[#6E6E66]">Verified Knowledge & Tracked Roadmaps</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.035em] text-[#121613] font-serif">
              Build skills. Become job-ready.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#6E6E66] max-w-2xl leading-relaxed">
              Learn the skills employers need, follow curated learning paths, and track your progress towards your career goals.
            </p>
          </div>

          {/* Quick Metrics Badge for Authenticated Candidate */}
          {user ? (
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#EAEAE5] shadow-2xs">
              <div className="text-left px-3 border-r border-[#EAEAE5]">
                <p className="text-[10px] font-mono text-[#9A9A92] uppercase">Completed</p>
                <p className="text-base font-bold text-[#121613] font-mono">
                  {stats.lessons_completed || 0} <span className="text-xs font-normal text-[#6E6E66]">lessons</span>
                </p>
              </div>
              <div className="text-left px-3 border-r border-[#EAEAE5]">
                <p className="text-[10px] font-mono text-[#9A9A92] uppercase">Active Hours</p>
                <p className="text-base font-bold text-[#121613] font-mono">
                  {stats.hours_learned || 0} <span className="text-xs font-normal text-[#6E6E66]">hrs</span>
                </p>
              </div>
              <div className="text-left px-3">
                <p className="text-[10px] font-mono text-[#9A9A92] uppercase">Saved</p>
                <p className="text-base font-bold text-[#121613] font-mono">
                  {stats.saved_resources_count || 0}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-full bg-[#121613] text-white text-xs font-semibold hover:bg-black transition-colors shadow-2xs"
              >
                Sign up to Track Progress
              </Link>
            </div>
          )}
        </div>

        {/* 3 Core Questions Pill Banner */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-[#EAEAE5] text-xs">
          <div className="flex items-start gap-2.5 p-2">
            <span className="w-5 h-5 rounded-full bg-[#F4F4F0] text-[#121613] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="font-semibold text-[#121613]">What do I need to learn?</p>
              <p className="text-[#6E6E66] text-[11px] mt-0.5">Role-based requirements extracted from active job postings.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2">
            <span className="w-5 h-5 rounded-full bg-[#F4F4F0] text-[#121613] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="font-semibold text-[#121613]">Where can I learn it?</p>
              <p className="text-[#6E6E66] text-[11px] mt-0.5">Genuine YouTube lessons, MDN, FreeCodeCamp, and official docs.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2">
            <span className="w-5 h-5 rounded-full bg-[#F4F4F0] text-[#121613] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="font-semibold text-[#121613]">How much have I completed?</p>
              <p className="text-[#6E6E66] text-[11px] mt-0.5">Observable playback tracking and verifiable task completion.</p>
            </div>
          </div>
        </div>

        {/* Search Bar & Role Pill Selector */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search verified learning resources, skills (e.g. Python, React, Docker, SQL), or providers..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] focus:border-[#121613] rounded-2xl text-sm text-[#121613] placeholder-[#9A9A92] shadow-2xs outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#9A9A92] hover:text-[#121613] cursor-pointer"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {TARGET_ROLES.map((role) => {
              const active = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#121613] text-white shadow-2xs'
                      : 'bg-white border border-[#EAEAE5] text-[#6E6E66] hover:text-[#121613] hover:border-[#CCCCCC]'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>

          {/* Multi-Filters: Difficulty, Type, Pricing */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EAEAE5] text-xs text-[#121613] outline-none cursor-pointer"
            >
              {DIFFICULTY_LEVELS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EAEAE5] text-xs text-[#121613] outline-none cursor-pointer"
            >
              {RESOURCE_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>

            <select
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EAEAE5] text-xs text-[#121613] outline-none cursor-pointer"
            >
              {PRICING_OPTIONS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>

            {isSearching && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-[#6E6E66] hover:text-[#121613] underline transition-colors cursor-pointer ml-auto"
              >
                Reset filters
              </button>
            )}

            {/* Admin Ingest Trigger */}
            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F4F0] text-[#121613] text-xs font-mono font-medium hover:bg-[#EAEAE5] transition-colors"
              title="Add a new verified course or YouTube video URL"
            >
              <Plus size={13} />
              <span>Add Resource</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        
        {/* ACTIVE VIDEO PLAYER DRAWER / MODAL */}
        {activeVideoResource && (
          <section className="bg-white rounded-3xl border border-[#121613]/10 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EAEAE5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-[#121613] uppercase tracking-wider">
                  Interactive YouTube Classroom
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoResource(null)}
                className="p-1.5 rounded-full hover:bg-[#F4F4F0] text-[#6E6E66] hover:text-[#121613] transition-colors"
                aria-label="Close player"
              >
                <X size={18} />
              </button>
            </div>

            <EmbeddedYouTubePlayer
              resource={activeVideoResource}
              savedPosition={activeSavedPosition}
              onProgressUpdate={(prog) => {
                // Update progress in memory
              }}
              onComplete={handleVideoCompleted}
              onNextLesson={() => {
                // Advance to next video in list
                const currentIndex = ytLessons.findIndex(r => r.id === activeVideoResource.id);
                if (currentIndex >= 0 && currentIndex + 1 < ytLessons.length) {
                  handleSelectVideo(ytLessons[currentIndex + 1]);
                }
              }}
            />
          </section>
        )}

        {/* SEARCH RESULTS VIEW (When query active) */}
        {isSearching ? (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#121613] font-serif">
                  Search & Filter Results
                </h2>
                <p className="text-xs text-[#6E6E66] mt-0.5">
                  Found {filteredResources.length} verified learning resources matching your criteria
                </p>
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EAEAE5]">
                <BookOpen size={36} className="text-[#CCCCCC] mx-auto mb-3" />
                <h3 className="text-base font-semibold text-[#121613]">No matching resources found</h3>
                <p className="text-xs text-[#6E6E66] max-w-md mx-auto mt-1 mb-5">
                  Try adjusting your search query, or clear some filter pills to broaden discovery across our verified database.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2 rounded-full bg-[#121613] text-white text-xs font-semibold hover:bg-black transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    onSelectVideo={handleSelectVideo}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* SECTION 1: CONTINUE LEARNING (Only when user has unfinished lessons) */}
            {continueList.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-normal text-[#121613] font-serif flex items-center gap-2">
                      <span>Continue Learning</span>
                    </h2>
                    <p className="text-xs text-[#6E6E66] mt-0.5">
                      Pick up right where you left off. Watch progress is automatically synchronized.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {continueList.map((item) => (
                    <ResourceCard
                      key={item.id}
                      resource={item.resource}
                      onSelectVideo={handleSelectVideo}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 2: MY LEARNING ROADMAP (Connected to Target Roles & Job Requirements) */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-normal text-[#121613] font-serif">
                    My Learning Roadmap
                  </h2>
                  <p className="text-xs text-[#6E6E66] mt-0.5">
                    Structured paths grounded in actual job requirements. Track your progress step by step.
                  </p>
                </div>
                <Link
                  to="/career-roadmap"
                  className="text-xs font-medium text-[#121613] hover:underline flex items-center gap-1"
                >
                  <span>All Career Roadmaps</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {roadmaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {roadmaps.map((rm) => (
                    <div
                      key={rm.id}
                      className="bg-white rounded-2xl border border-[#EAEAE5] hover:border-[#CCCCCC] p-5 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-[#9A9A92] mb-2">
                          <span className="font-semibold text-[#121613]">{rm.company_name}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Readiness: {Math.round(rm.readiness_score || 0)}%
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-[#121613]">
                          {rm.target_role}
                        </h3>
                        <p className="text-xs text-[#6E6E66] mt-1">
                          Completed {rm.completed_tasks} of {rm.total_tasks} verified milestone tasks.
                        </p>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-[#EAEAE5]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6E66] mb-1.5">
                          <span>Progress</span>
                          <span className="font-semibold text-[#121613]">{rm.progress_percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#EAEAE5] rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-[#121613] rounded-full transition-all duration-300"
                            style={{ width: `${rm.progress_percentage}%` }}
                          />
                        </div>
                        <Link
                          to={`/career-roadmap/${rm.id}`}
                          className="w-full py-2 px-3 rounded-xl bg-[#F4F4F0] hover:bg-[#EAEAE5] text-[#121613] text-xs font-semibold text-center block transition-colors"
                        >
                          Open Detailed Roadmap →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paths.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-[#EAEAE5] hover:border-[#CCCCCC] p-5 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-[#9A9A92] mb-2">
                          <span className="font-semibold uppercase text-[#121613]">{p.target_role}</span>
                          <span>{p.estimated_weeks} weeks</span>
                        </div>
                        <h3 className="text-base font-semibold text-[#121613]">
                          {p.title}
                        </h3>
                        <p className="text-xs text-[#6E6E66] mt-1 line-clamp-2">
                          {p.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-[#6E6E66]">
                          <span>{p.total_steps} curated lessons</span>
                          <span>•</span>
                          <span>{p.difficulty}</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-[#EAEAE5]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6E66] mb-1.5">
                          <span>Verified Progress</span>
                          <span className="font-semibold text-[#121613]">{p.progress_percentage || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#EAEAE5] rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                            style={{ width: `${p.progress_percentage || 0}%` }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (p.steps && p.steps[0]) {
                              handleSelectVideo(p.steps[0].resource);
                            }
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-[#121613] hover:bg-black text-white text-xs font-semibold transition-colors text-center cursor-pointer shadow-2xs"
                        >
                          Start Learning Path
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 3: RECOMMENDED FOR YOU */}
            {recommended.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-normal text-[#121613] font-serif">
                      Recommended for You
                    </h2>
                    <p className="text-xs text-[#6E6E66] mt-0.5">
                      Grounded in verified skills required by top engineering teams and active job listings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recommended.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onSelectVideo={handleSelectVideo}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 4: YOUTUBE LESSONS (Embedded Video Player Integration) */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-normal text-[#121613] font-serif">
                    YouTube Lessons
                  </h2>
                  <p className="text-xs text-[#6E6E66] mt-0.5">
                    Watch full-length educational lessons directly inside TrustHire with persistent watch tracking.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {ytLessons.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    onSelectVideo={handleSelectVideo}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 5: COURSES & OFFICIAL DOCUMENTATION */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-normal text-[#121613] font-serif">
                    Courses and Certifications
                  </h2>
                  <p className="text-xs text-[#6E6E66] mt-0.5">
                    Official documentation, interactive tracks, and accredited certification study materials.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    onSelectVideo={handleSelectVideo}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 6: COMPLETED LEARNING HISTORY (If any) */}
            {completedList.length > 0 && (
              <section className="bg-white rounded-3xl border border-[#EAEAE5] p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EAEAE5]">
                  <div>
                    <h2 className="text-xl font-bold text-[#121613] font-serif flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-emerald-600" />
                      <span>Completed Learning</span>
                    </h2>
                    <p className="text-xs text-[#6E6E66] mt-0.5">
                      Verifiable log of completed courses and finished video lessons.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#121613]">
                    {completedList.length} verified completed
                  </span>
                </div>

                <div className="divide-y divide-[#EAEAE5]">
                  {completedList.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#121613] truncate">
                            {item.resource?.title}
                          </p>
                          <p className="text-[11px] font-mono text-[#6E6E66] mt-0.5">
                            {item.resource?.provider} • Completed on {new Date(item.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.tracking_method === 'manual_self_report' ? 'Self-Reported' : 'Observed 90%+'}
                        </span>
                        <a
                          href={item.resource?.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-[#EAEAE5] text-[#6E6E66] hover:text-[#121613]"
                          title="Review lesson"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Admin Ingest Modal */}
      <AdminIngestModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onResourceAdded={(newRes) => {
          loadHubData();
        }}
      />
    </div>
  );
}

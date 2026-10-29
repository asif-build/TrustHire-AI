import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import CompanyLogo from '../../components/common/CompanyLogo';
import Search from '../../components/ui/Search';
import SaveButton from '../../components/kokonutui/save-button';
import SmoothTab from '../../components/kokonutui/smooth-tab';
import { companiesApi, careerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight, X, ChevronDown, Filter, Bookmark,
  MapPin, Globe, Building2, Briefcase, Check
} from 'lucide-react';

const TABS = [
  { id: 'all', title: 'Explore All', label: 'Explore All' },
  { id: 'recommended', title: 'Personalised for You', label: 'Personalised for You' },
  { id: 'india', title: 'India', label: 'India' },
  { id: 'global', title: 'Global', label: 'Global' },
  { id: 'startups', title: 'Startups', label: 'Startups' },
  { id: 'hiring', title: 'Hiring Now', label: 'Hiring Now' },
];

// KokonutUI Matched Spring Physics
const TAB_SPRING = { type: 'spring', stiffness: 420, damping: 38 };
const EASE_OUT = [0.23, 1, 0.32, 1];

const tabVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 36 : -36,
    opacity: 0,
    filter: 'blur(3px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      x: TAB_SPRING,
      opacity: { duration: 0.22, ease: EASE_OUT },
      filter: { duration: 0.22, ease: EASE_OUT },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -28 : 28,
    opacity: 0,
    filter: 'blur(3px)',
    transition: {
      x: TAB_SPRING,
      opacity: { duration: 0.15, ease: EASE_OUT },
      filter: { duration: 0.15, ease: EASE_OUT },
    },
  }),
};

function SkeletonCardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#EAEAE5] p-5 flex flex-col justify-between h-[230px] animate-pulse shadow-2xs"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#F0F0EE]" />
                <div className="space-y-2">
                  <div className="w-28 h-4 rounded bg-[#F0F0EE]" />
                  <div className="w-16 h-3 rounded bg-[#F0F0EE]" />
                </div>
              </div>
              <div className="w-16 h-7 rounded-full bg-[#F0F0EE]" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="w-full h-3 rounded bg-[#F0F0EE]" />
              <div className="w-4/5 h-3 rounded bg-[#F0F0EE]" />
            </div>
          </div>
          <div className="pt-3 border-t border-[#F2F2EE] flex items-center justify-between">
            <div className="w-20 h-3 rounded bg-[#F0F0EE]" />
            <div className="w-12 h-3 rounded bg-[#F0F0EE]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CompanyDirectoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [companies, setCompanies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [stages, setStages] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState(['Remote', 'Hybrid', 'Onsite']);
  const [experienceLevels, setExperienceLevels] = useState(['Junior', 'Mid', 'Senior', 'Lead', 'Staff']);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Active Discovery Tab from URL or default 'all'
  const activeTab = searchParams.get('tab') || 'all';

  // Direction tracking for matching spring tab animation
  const prevTabRef = useRef(activeTab);
  const [tabDirection, setTabDirection] = useState(1);
  const cacheRef = useRef({});

  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedExpLevel, setSelectedExpLevel] = useState('All');

  const getTabIndex = (tabId) => TABS.findIndex((t) => t.id === tabId);

  const setTab = (tabId) => {
    const currentIdx = getTabIndex(tabId);
    const prevIdx = getTabIndex(prevTabRef.current);
    const newDir = currentIdx >= prevIdx ? 1 : -1;
    setTabDirection(newDir);
    prevTabRef.current = tabId;

    const params = new URLSearchParams(searchParams);
    if (tabId === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }
    setSearchParams(params);
  };

  const fetchCompanies = async () => {
    const cacheKey = `${activeTab}_${search.trim()}_${selectedIndustry}_${selectedCountry}_${selectedStage}_${selectedJobType}_${selectedExpLevel}`;
    if (cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      setCompanies(cached.companies);
      setTotalCount(cached.count);
      setLoading(false);
    } else {
      setLoading(true);
    }

    setError(null);
    try {
      if (activeTab === 'recommended') {
        const recRes = await careerApi.getRecommendedCompanies();
        const recList = recRes.data || [];
        setCompanies(recList);
        setTotalCount(recList.length);
        cacheRef.current[cacheKey] = { companies: recList, count: recList.length };
        setLoading(false);
        return;
      }

      const params = {};
      if (activeTab !== 'all') params.tab = activeTab;
      if (search.trim()) params.search = search.trim();
      if (selectedIndustry !== 'All') params.industry = selectedIndustry;
      if (selectedCountry !== 'All') params.country = selectedCountry;
      if (selectedStage !== 'All') params.stage = selectedStage;
      if (selectedJobType !== 'All') params.job_type = selectedJobType;
      if (selectedExpLevel !== 'All') params.experience_level = selectedExpLevel;

      const res = await companiesApi.list(params);
      const data = res.data;
      const list = data.companies || [];
      const count = data.count ?? (list.length || 0);
      setCompanies(list);
      setTotalCount(count);
      cacheRef.current[cacheKey] = { companies: list, count };

      if (data.industries && industries.length === 0) {
        setIndustries(['All', ...data.industries]);
      }
      if (data.countries && countries.length === 0) {
        setCountries(['All', ...data.countries]);
      }
      if (data.stages && stages.length === 0) {
        setStages(['All', ...data.stages]);
      }
      if (data.locations && locations.length === 0) {
        setLocations(['All', ...data.locations]);
      }
      if (data.job_types) setJobTypes(data.job_types);
      if (data.experience_levels) setExperienceLevels(data.experience_levels);
    } catch (err) {
      setError('Unable to load company intelligence records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab, search, selectedIndustry, selectedCountry, selectedStage, selectedJobType, selectedExpLevel]);

  const handleToggleSave = async (slug, e) => {
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await companiesApi.toggleSave(slug);
      const isSaved = Boolean(res.data?.is_saved);
      setCompanies((prev) =>
        prev.map((c) => (c.slug === slug ? { ...c, is_saved: isSaved } : c))
      );
    } catch (err) {
      console.error('Failed to toggle save company:', err);
    }
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    selectedIndustry !== 'All' ||
    selectedCountry !== 'All' ||
    selectedStage !== 'All' ||
    selectedJobType !== 'All' ||
    selectedExpLevel !== 'All'
  );

  const clearAllFilters = () => {
    setSearch('');
    setSelectedIndustry('All');
    setSelectedCountry('All');
    setSelectedStage('All');
    setSelectedJobType('All');
    setSelectedExpLevel('All');
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-sans antialiased flex flex-col selection:bg-[#E15A3E]/10 selection:text-[#E15A3E]">
      <TrustHireNavbar />

      {/* Editorial Page Header */}
      <header className="pt-10 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.035em] text-[#121613] font-serif">
          Discover companies. Build your future.
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#6E6E66] max-w-3xl leading-relaxed">
          Explore the companies shaping India and the world. Understand what they do, discover career opportunities, and prepare for the skills they need.
        </p>

        {/* Bencho Seek Search Bar in Position */}
        <div className="mt-8 flex items-center justify-start">
          <Search
            value={search}
            onChange={(val) => setSearch(val)}
            onSearch={(val) => {
              setSearch(val);
              const params = new URLSearchParams(searchParams);
              if (val.trim()) {
                params.set('q', val.trim());
              } else {
                params.delete('q');
              }
              setSearchParams(params);
            }}
            placeholder="Search companies, industries, roles, or skills..."
            width={720}
            defaultOpen={true}
          />
        </div>

        {/* Main Discovery Tabs (KokonutUI SmoothTab) */}
        <div className="mt-6 flex items-center justify-between gap-4 border-b border-[#EAEAE5] pb-3 overflow-x-auto scrollbar-none">
          <div className="shrink-0">
            <SmoothTab
              items={TABS}
              value={activeTab}
              onChange={(tabId) => setTab(tabId)}
              className="w-auto max-w-none"
              tablistClassName="bg-[#F0F0EE] p-1 rounded-full border border-black/[0.04]"
              activeColor="bg-[#121613] text-white"
              activeTextColor="text-white"
              label="Company Discovery Categories"
            />
          </div>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E0] text-xs font-medium text-[#121613] shrink-0 cursor-pointer"
          >
            <Filter size={13} />
            <span>Filters</span>
          </button>
        </div>

        {/* Desktop Filter Row */}
        <div className={`mt-4 ${mobileFiltersOpen ? 'block' : 'hidden md:flex'} flex-wrap items-center gap-2 pt-1`}>
          {/* Industry Filter */}
          {industries.length > 0 && (
            <div className="relative">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="appearance-none bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] text-[#121613] text-xs font-medium pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none transition-colors"
              >
                <option value="All">All Industries</option>
                {industries.filter((i) => i !== 'All').map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none" />
            </div>
          )}

          {/* Country / Region Filter */}
          {countries.length > 0 && (
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] text-[#121613] text-xs font-medium pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none transition-colors"
              >
                <option value="All">All Countries</option>
                {countries.filter((c) => c !== 'All').map((cntry) => (
                  <option key={cntry} value={cntry}>
                    {cntry}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none" />
            </div>
          )}

          {/* Stage Filter */}
          {stages.length > 0 && (
            <div className="relative">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="appearance-none bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] text-[#121613] text-xs font-medium pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none transition-colors"
              >
                <option value="All">All Stages</option>
                {stages.filter((s) => s !== 'All').map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none" />
            </div>
          )}

          {/* Workplace Type Filter */}
          <div className="relative">
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="appearance-none bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] text-[#121613] text-xs font-medium pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none transition-colors"
            >
              <option value="All">All Workplace Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none" />
          </div>

          {/* Experience Level Filter */}
          <div className="relative">
            <select
              value={selectedExpLevel}
              onChange={(e) => setSelectedExpLevel(e.target.value)}
              className="appearance-none bg-white border border-[#E5E5E0] hover:border-[#CCCCCC] text-[#121613] text-xs font-medium pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none transition-colors"
            >
              <option value="All">All Levels</option>
              {experienceLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A92] pointer-events-none" />
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-[#6E6E66] hover:text-[#121613] px-2 py-1.5 transition-colors font-medium ml-auto cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Results Summary Bar */}
        <div className="mt-5 flex items-center justify-between text-xs text-[#82827A] pb-2">
          <span className="font-medium text-[#121613]">
            {loading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'company' : 'companies'}`}
          </span>
        </div>
      </header>

      {/* Main Content: YC-Inspired Informative Company Cards with KokonutUI Spring Motion */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20 overflow-hidden">
        <AnimatePresence mode="wait" custom={tabDirection}>
          <motion.div
            key={activeTab}
            custom={tabDirection}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {loading && companies.length === 0 ? (
              <SkeletonCardGrid />
            ) : error ? (
              <div className="py-20 text-center max-w-sm mx-auto">
                <p className="text-sm text-[#121613] mb-3">{error}</p>
                <button
                  onClick={fetchCompanies}
                  className="text-xs font-medium text-[#121613] underline hover:no-underline cursor-pointer"
                >
                  Try again
                </button>
              </div>
            ) : companies.length === 0 ? (
              <div className="py-24 text-center max-w-md mx-auto">
                <p className="text-base font-medium text-[#121613]">No companies found</p>
                <p className="mt-1 text-xs text-[#6E6E66]">
                  {activeTab === 'recommended'
                    ? 'Add skills or target job titles to your profile to receive personalized company recommendations.'
                    : 'No verified company records matched your current discovery filters.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 bg-[#121613] text-white text-xs font-medium rounded-xl hover:bg-black transition-colors cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((company) => {
              const activeCount = company.active_jobs_count || 0;
              const foundingInfo = company.founding_location
                ? `Founded: ${company.founding_location}${company.founded_year ? ` (${company.founded_year})` : ''}`
                : company.founded_year
                ? `Founded: ${company.founded_year}`
                : null;
              const hqInfo = company.headquarters ? `HQ: ${company.headquarters}` : null;
              const officesInfo = company.display_offices ? `Offices: ${company.display_offices}` : null;

              return (
                <div
                  key={company.id}
                  onClick={() => navigate(`/companies/${company.slug}`)}
                  className="group bg-white rounded-2xl border border-[#EAEAE5] hover:border-[#CCCCCC] p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xs cursor-pointer"
                >
                  <div>
                    {/* Card Top: Logo, Name, Industry, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <CompanyLogo
                          company={company}
                          domain={company.domain}
                          logoUrl={company.logo_url}
                          size="w-12 h-12"
                          imgSize="w-8 h-8"
                        />
                        <div className="min-w-0">
                          <h2 className="text-base font-semibold text-[#121613] group-hover:text-black truncate leading-tight font-sans">
                            {company.company_name}
                          </h2>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-medium text-[#6E6E66]">
                              {company.industry}
                            </span>
                            {company.company_stage && (
                              <>
                                <span className="text-[#CCCCCC]">·</span>
                                <span className="text-[10px] font-mono uppercase text-[#9A9A92]">
                                  {company.company_stage}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <SaveButton
                          defaultSaved={Boolean(company.is_saved)}
                          onSave={() => handleToggleSave(company.slug)}
                          onRemove={() => handleToggleSave(company.slug)}
                        />
                      </div>
                    </div>

                    {/* What the company does: Factual 20-40 word description */}
                    <p className="mt-3.5 text-xs text-[#52524E] leading-relaxed line-clamp-3">
                      {company.description || 'Public company intelligence record verified from official filings and regulatory disclosures.'}
                    </p>

                    {/* Personalised Recommendation Reason */}
                    {company.recommendation_reason && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#F5F5F7] text-[11px] text-[#6E6E73] border border-black/[0.04] leading-relaxed">
                        <span className="font-medium text-[#1D1D1F] mr-1">Recommended:</span>
                        {company.recommendation_reason}
                      </div>
                    )}

                    {/* Differentiated Origin & Headquarters */}
                    <div className="mt-4 pt-3.5 border-t border-[#F2F2EE] space-y-1.5 text-[11px] text-[#6E6E66]">
                      {foundingInfo && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[#9A9A92] font-medium shrink-0">Origin:</span>
                          <span className="truncate">{foundingInfo.replace('Founded: ', '')}</span>
                        </div>
                      )}

                      {hqInfo && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[#9A9A92] font-medium shrink-0">HQ:</span>
                          <span className="truncate">{hqInfo.replace('HQ: ', '')}</span>
                        </div>
                      )}

                      {officesInfo && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[#9A9A92] font-medium shrink-0">Offices:</span>
                          <span className="truncate">{officesInfo.replace('Offices: ', '')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Verified Open Roles & Explore Action */}
                  <div className="mt-5 pt-3.5 border-t border-[#EAEAE5] flex items-center justify-between">
                    <div>
                      {activeCount > 0 ? (
                        <span className="text-xs font-medium text-[#121613] group-hover:text-black transition-colors">
                          {activeCount} {activeCount === 1 ? 'open role' : 'open roles'}
                        </span>
                      ) : (
                        <span className="text-xs text-[#9A9A92]">
                          No current openings
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-medium text-[#121613] group-hover:text-[#E15A3E] group-hover:translate-x-0.5 transition-all">
                      <span>Explore</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
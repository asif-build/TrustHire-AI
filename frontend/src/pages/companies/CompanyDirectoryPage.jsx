import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import CompanyLogo from '../../components/common/CompanyLogo';
import Search from '../../components/ui/Search';
import SaveButton from '../../components/kokonutui/save-button';
import { companiesApi, careerApi } from '../../services/api';
import {
  ArrowRight, X, ChevronDown, Filter, Bookmark,
  MapPin, Globe, Sparkles, Building2, Briefcase, Check
} from 'lucide-react';

const TABS = [
  { id: 'all', label: 'Explore All' },
  { id: 'recommended', label: 'Personalised For You ✨' },
  { id: 'india', label: 'India' },
  { id: 'global', label: 'Global' },
  { id: 'startups', label: 'Startups' },
  { id: 'hiring', label: 'Hiring Now' },
];

export default function CompanyDirectoryPage() {
  const navigate = useNavigate();
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

  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedExpLevel, setSelectedExpLevel] = useState('All');

  const setTab = (tabId) => {
    const params = new URLSearchParams(searchParams);
    if (tabId === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }
    setSearchParams(params);
  };

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'recommended') {
        const recRes = await careerApi.getRecommendedCompanies();
        const recList = recRes.data || [];
        setCompanies(recList);
        setTotalCount(recList.length);
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
      setCompanies(data.companies || []);
      setTotalCount(data.count ?? (data.companies?.length || 0));

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
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await companiesApi.toggleSave(slug);
      setCompanies((prev) =>
        prev.map((c) => (c.slug === slug ? { ...c, is_saved: res.data.is_saved } : c))
      );
    } catch {
      // ignore
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

        {/* Main Discovery Tabs (Y Combinator Directory Style) */}
        <div className="mt-6 flex items-center justify-between border-b border-[#EAEAE5] gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2 pb-px shrink-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#121613] font-semibold'
                      : 'text-[#6E6E66] hover:text-[#121613]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#121613] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E0] text-xs font-medium text-[#121613] mb-2 shrink-0 cursor-pointer"
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
            {loading ? 'Discovering companies...' : `Showing ${totalCount} ${totalCount === 1 ? 'company' : 'companies'}`}
          </span>
          <span className="font-mono text-[11px] text-[#9A9A92]">
            Authentic Corporate Registries & Live ATS Feeds
          </span>
        </div>
      </header>

      {/* Main Content: YC-Inspired Informative Company Cards */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#121613] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-[#6E6E66]">Loading company intelligence...</p>
          </div>
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
              No verified company records matched your current discovery filters.
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
                          onSave={() => handleToggleSave(company.slug, { stopPropagation: () => {} })}
                          onRemove={() => handleToggleSave(company.slug, { stopPropagation: () => {} })}
                        />
                      </div>
                    </div>

                    {/* What the company does: Factual 20-40 word description */}
                    <p className="mt-3.5 text-xs text-[#52524E] leading-relaxed line-clamp-3">
                      {company.description || 'Public company intelligence record verified from official filings and regulatory disclosures.'}
                    </p>

                    {/* Personalised Recommendation Reason (Phase 6) */}
                    {company.recommendation_reason && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#F8F2E3] text-[11px] text-[#4d422f] border border-black/5 leading-relaxed">
                        <span className="font-bold text-[#E15A3E] mr-1">Why Recommended:</span>
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
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121613] group-hover:text-[#E15A3E] transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{activeCount} {activeCount === 1 ? 'open role' : 'open roles'}</span>
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
      </main>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { careerApi } from '../../services/api';

export default function CareerMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerApi.listMatches()
      .then(res => {
        const list = res.data || [];
        setMatches(list);
        if (list.length > 0) {
          setSelectedMatch(list[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load matches:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/20 border-t-[#050505] rounded-full animate-spin" />
          <span className="text-xs font-mono text-black/60">Loading match breakdowns...</span>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E5E0] max-w-2xl mx-auto my-10">
        <div className="w-12 h-12 rounded-full bg-[#F4F4F0] text-xl flex items-center justify-center mx-auto mb-4">
          🎯
        </div>
        <h3 className="text-xl font-bold text-[#050505]">No Evaluated Matches Yet</h3>
        <p className="text-sm text-black/70 mt-2 mb-6 leading-relaxed">
          Explore the live job catalog and click "Evaluate Match" on any position to generate a transparent, evidence-backed requirement breakdown.
        </p>
        <Link
          to="/career/jobs"
          className="inline-flex px-6 py-3 rounded-full bg-[#050505] text-white font-semibold text-sm hover:bg-black/85 transition-colors"
        >
          Explore Live Jobs →
        </Link>
      </div>
    );
  }

  const job = selectedMatch?.job || {};

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight">
          Explainable Job Matches
        </h1>
        <p className="text-xs sm:text-sm text-black/60 font-mono mt-1">
          Requirement-by-requirement evidence breakdown. Evaluated against your verified resume and declared profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 4 Cols: Match Cards Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-mono text-black/50 uppercase tracking-wider block px-1">
            Evaluated Matches ({matches.length})
          </span>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {matches.map((item) => {
              const isSelected = selectedMatch?.id === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedMatch(item)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-white border-black/30 shadow-sm scale-[1.01]'
                      : 'bg-white/70 border-[#E5E5E0] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-black/60 truncate">
                      {item.job?.company_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-emerald-100 text-emerald-800">
                      {item.overall_score}%
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#050505] line-clamp-1">
                    {item.job?.title}
                  </h4>
                  <div className="text-[11px] font-mono text-black/50 mt-2 flex items-center justify-between">
                    <span>{item.matched_requirements?.length || 0} Evidenced</span>
                    <span>{item.missing_requirements?.length || 0} Gaps</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Deep Evidence Breakdown */}
        {selectedMatch && (
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E0] shadow-sm space-y-6">
            
            {/* Top Bar of Selected Match */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E0]">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-black/50 block">
                  {job.company_name} • {job.location || 'Remote'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#050505] mt-1">
                  {job.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#F8F2E3] text-center min-w-[100px]">
                  <span className="text-[10px] font-mono text-black/50 block">EVIDENCE FIT</span>
                  <span className="text-2xl font-extrabold font-mono text-[#050505]">
                    {selectedMatch.overall_score}%
                  </span>
                </div>
              </div>
            </div>

            {/* Narrative Explanation */}
            <div className="bg-[#F8F2E3]/40 p-4 sm:p-5 rounded-2xl border border-black/10 text-xs sm:text-sm text-black/80 leading-relaxed">
              <strong>Assessment Rationale:</strong> {selectedMatch.explanation}
            </div>

            {/* Skills Status Breakdown Tabs */}
            <div className="space-y-4">
              
              {/* 1. Demonstrated Requirements with Cited Snippets */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Evidenced in Past Work ({selectedMatch.matched_requirements?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedMatch.matched_requirements?.map((req, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-emerald-950">{req.skill}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {req.importance}
                        </span>
                      </div>
                      <p className="text-emerald-900/80 italic font-mono text-[11px] mt-1">
                        {req.citation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Self-Declared in Profile */}
              {selectedMatch.partially_matched_requirements?.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Self-Declared on Profile ({selectedMatch.partially_matched_requirements.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedMatch.partially_matched_requirements.map((req, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-amber-950">{req.skill}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Declared
                          </span>
                        </div>
                        <p className="text-amber-900/80 text-[11px]">
                          {req.citation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Skill Gaps */}
              {selectedMatch.missing_requirements?.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Growth Gaps & Missing Evidence ({selectedMatch.missing_requirements.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedMatch.missing_requirements.map((req, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-200/70 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-rose-950">{req.skill}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                            {req.importance}
                          </span>
                        </div>
                        <p className="text-rose-900/70 text-[11px]">
                          {req.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Actions for this Match */}
            <div className="pt-6 border-t border-[#E5E5E0] flex flex-wrap items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-black/50">
                Methodology: {selectedMatch.methodology_version}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/career/interview-prep')}
                  className="px-4 py-2 rounded-xl border border-black/20 hover:bg-[#F4F4F0] text-xs font-mono font-semibold"
                >
                  Prepare Interview 🎙️
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/career/applications')}
                  className="px-4 py-2 rounded-xl bg-[#050505] text-white hover:bg-black/85 text-xs font-semibold"
                >
                  Tailor Application ✍️
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

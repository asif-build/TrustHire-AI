import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TrustHireNavbar from '../../components/common/TrustHireNavbar';
import { careerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2, AlertCircle, Sparkles, Layers, ArrowRight,
  TrendingUp, Award, BookOpen, UserCheck
} from 'lucide-react';

export default function MySkillsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await careerApi.getMySkills();
      setData(res.data);
    } catch (err) {
      setError('Unable to load skills matrix.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121613] font-jakarta flex flex-col antialiased">
      <TrustHireNavbar />

      {/* Header Bar */}
      <section className="bg-white border-b border-black/5 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
              Skills & Competencies
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              Review your demonstrated skills, profile entries, and target role requirements.
            </p>
          </div>

          <Link
            to="/career/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121613] hover:bg-black text-white text-xs font-semibold transition-colors self-start sm:self-center"
          >
            <span>Edit Profile Skills</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Main Skills Matrix */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Evaluating skill evidence matrix...
            </p>
          </div>
        ) : error || !data ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <AlertCircle size={24} className="text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-rose-900">{error || 'Failed to load skill matrix.'}</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Active Target Banner */}
            {data.active_roadmap_role && (
              <div className="bg-[#121613] text-white rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Active Target
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {data.active_roadmap_role} @ {data.active_roadmap_company}
                  </h3>
                  <p className="text-xs text-white/70 mt-1">
                    Target role requirements for this position.
                  </p>
                </div>

                <Link
                  to="/career-roadmap"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-gray-900 text-xs font-semibold hover:bg-gray-100 transition-colors shrink-0"
                >
                  <span>View Roadmap</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* 3 Evidence Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Demonstrated Skills */}
              <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-xs font-mono font-semibold text-[#121613] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-[#121613]" />
                      <span>Demonstrated</span>
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {data.demonstrated_skills?.length || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-4 leading-relaxed">
                    Skills corroborated by projects and past experience.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {data.demonstrated_skills && data.demonstrated_skills.length > 0 ? (
                      data.demonstrated_skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#F4F4F0] text-[#121613] border border-black/5"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No demonstrated skills recorded yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Partially Evidenced */}
              <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-xs font-mono font-semibold text-[#121613] uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-[#121613]" />
                      <span>Partially Evidenced</span>
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {data.partially_evidenced_skills?.length || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-4 leading-relaxed">
                    Skills evidenced in either a project or past experience.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {data.partially_evidenced_skills && data.partially_evidenced_skills.length > 0 ? (
                      data.partially_evidenced_skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#F4F4F0] text-[#121613] border border-black/5"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No partial skills recorded.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Declared in Profile */}
              <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-xs font-mono font-semibold text-[#121613] uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck size={14} className="text-[#121613]" />
                      <span>Profile Declared</span>
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {data.declared_only_skills?.length || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-4 leading-relaxed">
                    Skills listed in your candidate profile.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {data.declared_only_skills && data.declared_only_skills.length > 0 ? (
                      data.declared_only_skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#F4F4F0] text-[#121613] border border-black/5"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">All profile skills have evidence!</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Target Gaps from Active Roadmap */}
            {data.target_gaps && data.target_gaps.length > 0 && (
              <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-950">
                    Target Role Skill Requirements
                  </h3>
                  <span className="text-xs font-mono text-gray-500">
                    {data.target_gaps.length} Skills
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 mb-4 leading-relaxed">
                  Competencies required by {data.active_roadmap_company || 'your target employer'} that can be developed.
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {data.target_gaps.map((gap, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#F4F4F0] text-[#121613] border border-black/5"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

import React from 'react';
import {
  Play, ExternalLink, Bookmark, CheckCircle2, Clock,
  BookOpen, Sparkles, ShieldCheck, Award
} from 'lucide-react';
import { learningApi } from '../../services/api';

/**
 * ResourceCard
 * Displays a verified learning resource in a refined Apple SF-inspired card.
 */
export default function ResourceCard({
  resource,
  onSelectVideo,
  onToggleSave,
  className = ''
}) {
  const isVideo = resource.resource_type === 'video' || resource.resource_type === 'playlist';
  const progress = resource.user_progress;
  const isCompleted = progress?.completion_status === 'completed';
  const percent = progress?.completion_percentage || 0;

  const handleOpenExternal = (e) => {
    // Log outbound click verification
    learningApi.logClick(resource.id).catch(() => {});
  };

  const getPricingBadge = () => {
    switch (resource.pricing_classification) {
      case 'free':
        return { label: 'Free', color: 'bg-[#F4F4F0] text-[#52524E] border-black/5' };
      case 'free_with_paid_cert':
        return { label: 'Free Course', color: 'bg-[#F4F4F0] text-[#52524E] border-black/5' };
      case 'paid':
        return { label: 'Paid', color: 'bg-[#F4F4F0] text-[#52524E] border-black/5' };
      default:
        return { label: 'Free Access', color: 'bg-[#F4F4F0] text-[#52524E] border-black/5' };
    }
  };

  const pricing = getPricingBadge();

  return (
    <div
      className={`group bg-white rounded-2xl border border-[#EAEAE5] hover:border-[#CCCCCC] p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xs ${className}`}
    >
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-[#F4F4F0] text-[#121613] border border-black/5">
              {resource.provider}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${pricing.color}`}>
              {pricing.label}
            </span>
            {resource.is_official_documentation && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F4F0] text-[#52524E] border border-black/5">
                Official Docs
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleSave && onToggleSave(resource.id)}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
              resource.is_saved
                ? 'bg-[#121613] border-[#121613] text-white'
                : 'bg-white border-[#EAEAE5] hover:border-[#121613] text-[#9A9A92] hover:text-[#121613]'
            }`}
            title={resource.is_saved ? 'Remove from saved' : 'Save resource'}
            aria-label="Save learning resource"
          >
            <Bookmark size={13} fill={resource.is_saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Thumbnail (if video or provided) */}
        {resource.thumbnail_url && (
          <div
            onClick={() => isVideo && onSelectVideo && onSelectVideo(resource)}
            className={`relative w-full aspect-video rounded-xl overflow-hidden bg-[#F4F4F0] mb-3.5 border border-[#EAEAE5] ${
              isVideo ? 'cursor-pointer' : ''
            }`}
          >
            <img
              src={resource.thumbnail_url}
              alt={resource.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {isVideo && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/95 text-[#121613] flex items-center justify-center shadow-md">
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            )}
            {resource.estimated_duration && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px]">
                {resource.estimated_duration}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h4 className="text-base font-semibold text-[#121613] group-hover:text-black leading-snug font-sans">
          {resource.title}
        </h4>

        {/* Description */}
        <p className="mt-1.5 text-xs text-[#6E6E66] line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Skills Tag Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {resource.skills_covered?.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FBFBFA] border border-[#EAEAE5] text-[#6E6E66]"
            >
              {skill}
            </span>
          ))}
          {resource.difficulty && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded text-[#9A9A92]">
              • {resource.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Progress and CTA */}
      <div className="mt-5 pt-3.5 border-t border-[#EAEAE5]">
        {/* Watch Progress if present */}
        {progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6E66] mb-1">
              <span className="flex items-center gap-1">
                {isCompleted ? (
                  <span className="text-[#121613] font-medium">Completed</span>
                ) : (
                  <span>In Progress</span>
                )}
              </span>
              <span>{Math.round(percent)}%</span>
            </div>
            <div className="w-full h-1 bg-[#EAEAE5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#121613]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {isVideo ? (
            <button
              type="button"
              onClick={() => onSelectVideo && onSelectVideo(resource)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#121613] hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Play size={13} fill="currentColor" />
              <span>{progress?.current_position_seconds > 0 ? 'Resume Lesson' : 'Watch Lesson'}</span>
            </button>
          ) : (
            <a
              href={resource.external_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenExternal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#121613] hover:bg-black text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>Open Resource</span>
              <ExternalLink size={12} />
            </a>
          )}

          {/* Official Destination Link */}
          <a
            href={resource.external_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenExternal}
            className="text-[11px] font-mono text-[#6E6E66] hover:text-[#121613] flex items-center gap-1 transition-colors"
            title="Open genuine destination website"
          >
            <span>Destination</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import {
  Play, Pause, RotateCcw, CheckCircle2, ExternalLink,
  Volume2, AlertCircle, Clock, ShieldCheck, Sparkles, ChevronRight
} from 'lucide-react';
import { learningApi } from '../../services/api';

/**
 * EmbeddedYouTubePlayer
 * Official YouTube IFrame Player API implementation.
 * Documentation: https://developers.google.com/youtube/iframe_api_reference
 * 
 * Features:
 * - Dynamic script loader with API ready detection.
 * - Responsive 16:9 container.
 * - Resumes from saved_position where available.
 * - Throttled watch progress synchronization (every 5s, on pause, on end).
 * - Automatic 90% duration completion rule.
 * - Embedding-restriction detection & fallback to official YouTube destination.
 * - Manual "Mark as Complete" toggle.
 */
export default function EmbeddedYouTubePlayer({
  resource,
  savedPosition = 0,
  onProgressUpdate,
  onComplete,
  onNextLesson,
  className = ''
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const lastSyncedPositionRef = useRef(savedPosition);

  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(savedPosition);
  const [duration, setDuration] = useState(resource?.duration_seconds || 0);
  const [isCompleted, setIsCompleted] = useState(
    resource?.user_progress?.completion_status === 'completed'
  );
  const [restrictedEmbed, setRestrictedEmbed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [savingProgress, setSavingProgress] = useState(false);

  const videoId = resource?.youtube_video_id;

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Sync progress payload to backend
  const syncProgress = async (position, totalDuration, status = 'in_progress', method = 'youtube_player_observed') => {
    if (!resource?.id) return;
    
    // Throttle: don't sync if moved less than 3 seconds unless completed
    if (status !== 'completed' && Math.abs(position - lastSyncedPositionRef.current) < 3) {
      return;
    }

    try {
      setSavingProgress(true);
      const res = await learningApi.updateProgress({
        resource_id: resource.id,
        position_seconds: position,
        duration_seconds: totalDuration,
        status: status,
        tracking_method: method
      });

      lastSyncedPositionRef.current = position;
      if (res.data?.is_completed) {
        setIsCompleted(true);
        if (onComplete) onComplete(resource.id);
      }
      if (onProgressUpdate) {
        onProgressUpdate(res.data?.progress);
      }
    } catch (err) {
      // Graceful offline/network failure handling without interrupting playback
    } finally {
      setSavingProgress(false);
    }
  };

  // Load YouTube IFrame API script
  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current) return;

      // Clean up existing player if any
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }

      const playerId = `yt-player-${resource.id}`;
      containerRef.current.innerHTML = `<div id="${playerId}" class="w-full h-full"></div>`;

      try {
        playerRef.current = new window.YT.Player(playerId, {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
            start: Math.floor(savedPosition) || 0,
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              setPlayerReady(true);
              const dur = event.target.getDuration();
              if (dur > 0) setDuration(dur);
              if (savedPosition > 0) {
                event.target.seekTo(savedPosition, true);
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              const state = event.data;
              // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0, BUFFERING=3
              if (state === 1) {
                setIsPlaying(true);
                startProgressTimer();
              } else {
                setIsPlaying(false);
                stopProgressTimer();

                const pos = event.target.getCurrentTime() || 0;
                const dur = event.target.getDuration() || duration;
                setCurrentTime(pos);

                if (state === 0) {
                  // Ended
                  syncProgress(dur, dur, 'completed');
                } else if (state === 2) {
                  // Paused
                  syncProgress(pos, dur, 'in_progress');
                }
              }
            },
            onError: (event) => {
              if (!isMounted) return;
              // Error codes: 101/150 = owner disallowed embedding, 100/2 = video not found or invalid
              if (event.data === 101 || event.data === 150) {
                setRestrictedEmbed(true);
                setErrorMessage('The content creator has restricted embedding outside YouTube.');
              } else {
                setErrorMessage('This video is currently unavailable or restricted.');
              }
            }
          }
        });
      } catch (err) {
        setErrorMessage('Unable to initialize video player.');
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isMounted = false;
      stopProgressTimer();
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [videoId, resource?.id]);

  const startProgressTimer = () => {
    stopProgressTimer();
    syncIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const pos = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration() || duration;
        setCurrentTime(pos);

        // Check 90% threshold for transparent completion
        if (dur > 20 && pos >= (0.90 * dur) && !isCompleted) {
          syncProgress(pos, dur, 'completed');
        } else {
          // Throttled periodic save
          syncProgress(pos, dur, 'in_progress');
        }
      }
    }, 4000);
  };

  const stopProgressTimer = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  const handleManualComplete = () => {
    const newStatus = isCompleted ? 'in_progress' : 'completed';
    setIsCompleted(!isCompleted);
    syncProgress(
      currentTime,
      duration,
      newStatus,
      'manual_self_report'
    );
  };

  const progressPercentage = duration > 0 ? Math.min(Math.round((currentTime / duration) * 100), 100) : 0;

  return (
    <div className={`bg-white rounded-3xl border border-[#EAEAE5] shadow-xs overflow-hidden ${className}`}>
      {/* 16:9 Aspect Ratio Video Box */}
      <div className="relative w-full aspect-video bg-[#050505]">
        {restrictedEmbed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#121613] text-white">
            <AlertCircle size={36} className="text-[#F0442D] mb-3" />
            <h4 className="text-base font-medium">Embedding Restricted by Channel</h4>
            <p className="text-xs text-white/70 max-w-md mt-1 mb-5">
              {errorMessage || 'This educational lesson cannot be embedded directly. You can watch it directly on YouTube while keeping your progress saved on TrustHire.'}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={resource.external_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => syncProgress(currentTime, duration, 'in_progress', 'link_visited')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors shadow-xs"
              >
                <span>Watch on YouTube</span>
                <ExternalLink size={13} />
              </a>
              <button
                type="button"
                onClick={handleManualComplete}
                className="px-4 py-2.5 rounded-full border border-white/20 text-white text-xs hover:bg-white/10 transition-colors"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full" />
        )}
      </div>

      {/* Control Bar & Progress Indicator */}
      <div className="p-5 sm:p-6 bg-[#FBFBFA] border-t border-[#EAEAE5]">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#6E6E66] mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[#121613]">
              <Clock size={13} className="text-[#9A9A92]" />
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </span>
            <span className="font-semibold text-[#121613]">
              {progressPercentage}% watched {isCompleted && '• Completed'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#EAEAE5] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isCompleted ? 'bg-emerald-600' : 'bg-[#121613]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Video Info & Interactive Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-white border border-[#EAEAE5] text-[#121613] font-semibold">
                {resource.provider}
              </span>
              {resource.skills_covered?.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F4F4F0] text-[#6E6E66]"
                >
                  {skill}
                </span>
              ))}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[#121613] line-clamp-1 font-sans">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-xs text-[#6E6E66] line-clamp-2 mt-1 leading-relaxed">
                {resource.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleManualComplete}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-[#121613] border-[#EAEAE5] hover:border-[#121613]'
              }`}
            >
              <CheckCircle2 size={14} className={isCompleted ? 'text-emerald-600' : 'text-[#9A9A92]'} />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>

            <a
              href={resource.external_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => learningApi.logClick(resource.id)}
              className="p-2 rounded-xl border border-[#EAEAE5] bg-white text-[#6E6E66] hover:text-[#121613] hover:border-[#121613] transition-colors"
              title="Open source on YouTube"
            >
              <ExternalLink size={15} />
            </a>

            {onNextLesson && (
              <button
                type="button"
                onClick={onNextLesson}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#121613] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer shadow-xs"
              >
                <span>Next Lesson</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

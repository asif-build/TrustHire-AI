import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Sparkles, RotateCw, Calendar, Flame, Eye, Layers } from 'lucide-react';

export interface ActivityDay {
  date: string;
  count: number; // login count / visits on this day
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityTerrainProps {
  data?: ActivityDay[];
  weeks?: number;
  className?: string;
  title?: string;
  subtitle?: string;
}

// Generate realistic login activity leading up to current date (e.g. Oct 2026)
function generateLoginHistory(totalWeeks = 20): ActivityDay[] {
  const days: ActivityDay[] = [];
  const today = new Date(2026, 9, 28); // Oct 28, 2026
  const totalDays = totalWeeks * 7;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Realistic login distribution: active on most weekdays, some weekends
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const rand = Math.random();

    let count = 0;
    if (i < 7) {
      // Very active in recent week
      count = Math.floor(Math.random() * 4) + 1;
    } else if (isWeekend) {
      count = rand > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0;
    } else {
      count = rand > 0.25 ? Math.floor(Math.random() * 4) + 1 : 0;
    }

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 4) level = 4;
    else if (count === 3) level = 3;
    else if (count === 2) level = 2;
    else if (count === 1) level = 1;

    days.push({ date: dateStr, count, level });
  }

  return days;
}

export default function ActivityTerrain({
  data,
  weeks = 20,
  className = '',
  title = 'Account Login & Attendance Terrain',
  subtitle = '3D visualization of your daily logins, session frequency, and account consistency.',
}: ActivityTerrainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [hoveredDay, setHoveredDay] = useState<{
    day: ActivityDay;
    x: number;
    y: number;
  } | null>(null);

  // 3D rotation angles
  const [rotX, setRotX] = useState(55); // Tilt angle in degrees
  const [rotZ, setRotZ] = useState(-35); // Rotation angle in degrees
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 55, rotZ: -35 });

  const activities = useMemo(() => data || generateLoginHistory(weeks), [data, weeks]);

  // Compute stats
  const stats = useMemo(() => {
    let totalLogins = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < activities.length; i++) {
      const day = activities[i];
      totalLogins += day.count;
      if (day.count > 0) {
        activeDays++;
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Current streak from the end
    for (let i = activities.length - 1; i >= 0; i--) {
      if (activities[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    const consistencyRate = Math.round((activeDays / activities.length) * 100);

    return {
      totalLogins,
      activeDays,
      currentStreak,
      longestStreak,
      consistencyRate,
    };
  }, [activities]);

  // Interactive mouse drag rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (viewMode !== '3d') return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotZ,
    };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || viewMode !== '3d') return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Constrain pitch (rotX) between 30 and 75 degrees, allow yaw (rotZ) to rotate
    const nextRotX = Math.min(75, Math.max(30, dragStart.current.rotX + dy * 0.35));
    const nextRotZ = dragStart.current.rotZ + dx * 0.45;

    setRotX(nextRotX);
    setRotZ(nextRotZ);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const resetRotation = () => {
    setRotX(55);
    setRotZ(-35);
  };

  // Render 3D Terrain on Canvas
  useEffect(() => {
    if (viewMode !== '3d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Matrix projection parameters
    const cols = weeks;
    const rows = 7;
    const spacing = Math.min(22, (width * 0.75) / cols);
    const originX = width / 2;
    const originY = height / 2 + 15;

    const radX = (rotX * Math.PI) / 180;
    const radZ = (rotZ * Math.PI) / 180;

    // Transform 3D grid point to 2D screen coordinate
    const project = (c: number, r: number, zVal: number) => {
      // Center grid around (0, 0)
      const x0 = (c - cols / 2) * spacing;
      const y0 = (r - rows / 2) * spacing;

      // Rotate around Z axis (yaw)
      const x1 = x0 * Math.cos(radZ) - y0 * Math.sin(radZ);
      const y1 = x0 * Math.sin(radZ) + y0 * Math.cos(radZ);

      // Rotate around X axis (pitch)
      const y2 = y1 * Math.cos(radX) - zVal * Math.sin(radX);
      const x2 = x1;

      return {
        x: originX + x2,
        y: originY + y2,
      };
    };

    // Color palette based on activity level
    const colors = {
      0: { top: '#f0f0ed', side: '#e2e2de', front: '#d6d6d2' },
      1: { top: '#bbf7d0', side: '#86efac', front: '#4ade80' },
      2: { top: '#4ade80', side: '#22c55e', front: '#16a34a' },
      3: { top: '#22c55e', side: '#16a34a', front: '#15803d' },
      4: { top: '#15803d', side: '#166534', front: '#14532d' },
    };

    // Sort isometric columns from back to front for proper painter's algorithm
    const columnItems: Array<{
      col: number;
      row: number;
      day: ActivityDay;
      dist: number;
    }> = [];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const idx = c * rows + r;
        const day = activities[idx] || { date: '', count: 0, level: 0 };
        // Distance calculation along projection view vector
        const dist = (c - cols / 2) * Math.sin(radZ) + (r - rows / 2) * Math.cos(radZ);
        columnItems.push({ col: c, row: r, day, dist });
      }
    }

    columnItems.sort((a, b) => a.dist - b.dist);

    // Draw baseline terrain grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;

    for (let c = 0; c < cols; c++) {
      const p1 = project(c, 0, 0);
      const p2 = project(c, rows - 1, 0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    for (let r = 0; r < rows; r++) {
      const p1 = project(0, r, 0);
      const p2 = project(cols - 1, r, 0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Draw 3D columns / peaks
    const colW = spacing * 0.72;
    const colH = spacing * 0.72;

    for (const item of columnItems) {
      const { col: c, row: r, day } = item;
      const heightMultiplier = day.level === 0 ? 3 : day.level * 11 + 6;
      const palette = colors[day.level];

      const b0 = project(c, r, 0);
      const t0 = project(c, r, heightMultiplier);

      // Top face polygon
      const tTop = project(c, r - 0.45, heightMultiplier);
      const tRight = project(c + 0.45, r, heightMultiplier);
      const tBottom = project(c, r + 0.45, heightMultiplier);
      const tLeft = project(c - 0.45, r, heightMultiplier);

      // Base bottom points
      const bBottom = project(c, r + 0.45, 0);
      const bRight = project(c + 0.45, r, 0);
      const bLeft = project(c - 0.45, r, 0);

      // Front-Right Face
      ctx.fillStyle = palette.front;
      ctx.beginPath();
      ctx.moveTo(tRight.x, tRight.y);
      ctx.lineTo(tBottom.x, tBottom.y);
      ctx.lineTo(bBottom.x, bBottom.y);
      ctx.lineTo(bRight.x, bRight.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.stroke();

      // Front-Left Face
      ctx.fillStyle = palette.side;
      ctx.beginPath();
      ctx.moveTo(tBottom.x, tBottom.y);
      ctx.lineTo(tLeft.x, tLeft.y);
      ctx.lineTo(bLeft.x, bLeft.y);
      ctx.lineTo(bBottom.x, bBottom.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.stroke();

      // Top Cap
      ctx.fillStyle = palette.top;
      ctx.beginPath();
      ctx.moveTo(tTop.x, tTop.y);
      ctx.lineTo(tRight.x, tRight.y);
      ctx.lineTo(tBottom.x, tBottom.y);
      ctx.lineTo(tLeft.x, tLeft.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = day.level > 0 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.08)';
      ctx.stroke();

      // Highlight peak on high login days
      if (day.level >= 3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(t0.x, t0.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [activities, weeks, rotX, rotZ, viewMode]);

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-[#121613] rounded-3xl p-6 sm:p-8 border border-[#E5E5E0] dark:border-white/10 shadow-sm transition-all ${className}`}
    >
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Sparkles size={16} />
            </span>
            <h3 className="font-semibold text-base sm:text-lg text-[#121613] dark:text-[#fafffa] tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-black/50 dark:text-white/50 mt-1 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center p-1 rounded-xl bg-[#F5F5F7] dark:bg-[#1c211e] border border-black/[0.06] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-[#121613] text-[#121613] dark:text-white shadow-xs font-semibold'
                  : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>3D Terrain</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '2d'
                  ? 'bg-white dark:bg-[#121613] text-[#121613] dark:text-white shadow-xs font-semibold'
                  : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>2D Heatmap</span>
            </button>
          </div>

          {viewMode === '3d' && (
            <button
              type="button"
              onClick={resetRotation}
              className="p-2 rounded-xl bg-[#F5F5F7] dark:bg-[#1c211e] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-black/[0.06] dark:border-white/[0.06] transition-all cursor-pointer"
              title="Reset 3D angle"
              aria-label="Reset 3D angle"
            >
              <RotateCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-[#FBFBFA] dark:bg-[#161a18] border border-black/[0.05] dark:border-white/[0.05]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
            Total Logins
          </span>
          <div className="text-2xl font-bold text-[#121613] dark:text-[#fafffa] mt-1">
            {stats.totalLogins}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Verified Sessions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FBFBFA] dark:bg-[#161a18] border border-black/[0.05] dark:border-white/[0.05]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
            Active Days
          </span>
          <div className="text-2xl font-bold text-[#121613] dark:text-[#fafffa] mt-1">
            {stats.activeDays}
          </div>
          <span className="text-[10px] text-black/50 dark:text-white/50 font-medium">
            Over {weeks} Weeks
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FBFBFA] dark:bg-[#161a18] border border-black/[0.05] dark:border-white/[0.05]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50 flex items-center gap-1">
            <Flame size={11} className="text-amber-500" />
            Current Streak
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {stats.currentStreak} Days
          </div>
          <span className="text-[10px] text-black/50 dark:text-white/50 font-medium">
            Keep it going
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FBFBFA] dark:bg-[#161a18] border border-black/[0.05] dark:border-white/[0.05]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
            Login Consistency
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.consistencyRate}%
          </div>
          <span className="text-[10px] text-black/50 dark:text-white/50 font-medium">
            Max: {stats.longestStreak} days
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative rounded-2xl bg-[#FBFBFA] dark:bg-[#0c0f0d] border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
        {viewMode === '3d' ? (
          <div
            className="w-full h-[320px] sm:h-[360px] cursor-grab active:cursor-grabbing select-none relative flex items-center justify-center"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Instruction Badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md text-[10px] font-mono text-black/60 dark:text-white/60 border border-black/10 dark:border-white/10 pointer-events-none">
              Drag to rotate terrain · Pitch: {Math.round(rotX)}°
            </div>
          </div>
        ) : (
          /* 2D Heatmap Grid */
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                {activities.map((day, idx) => {
                  const levelColors = [
                    'bg-[#E5E5E0] dark:bg-[#232a25]',
                    'bg-[#86efac] dark:bg-[#166534]',
                    'bg-[#4ade80] dark:bg-[#15803d]',
                    'bg-[#22c55e] dark:bg-[#16a34a]',
                    'bg-[#15803d] dark:bg-[#22c55e]',
                  ];
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                        levelColors[day.level]
                      }`}
                      title={`${day.date}: ${day.count} logins`}
                      onMouseEnter={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          day,
                          x: r.left + r.width / 2,
                          y: r.top - 8,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Hover Tooltip in 2D Mode */}
        {hoveredDay && (
          <div
            className="fixed z-50 pointer-events-none px-2.5 py-1 rounded-lg bg-[#121613] text-[#fafffa] text-[11px] font-mono shadow-lg -translate-x-1/2 -translate-y-full"
            style={{ left: hoveredDay.x, top: hoveredDay.y }}
          >
            <div>{hoveredDay.day.date}</div>
            <div className="text-emerald-400 font-bold">
              {hoveredDay.day.count} {hoveredDay.day.count === 1 ? 'login' : 'logins'}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-black/50 dark:text-white/50">
        <span className="text-[11px] font-mono">
          Topographical elevation reflects login frequency & platform check-ins.
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-[#E5E5E0] dark:bg-[#232a25]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#86efac] dark:bg-[#166534]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#4ade80] dark:bg-[#15803d]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#22c55e] dark:bg-[#16a34a]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#15803d] dark:bg-[#22c55e]" />
          <span className="text-[10px]">Frequent</span>
        </div>
      </div>
    </div>
  );
}

export { ActivityTerrain };

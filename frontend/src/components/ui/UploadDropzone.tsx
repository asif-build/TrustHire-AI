import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Check, Upload as UpIcon } from "lucide-react";

/* ══ Upload dropzone ══════════════════════════════════════
   A drop box for authentic resume ingestion. Drag a real file
   from your desktop or select a document: it inhales, the file
   accelerates toward the middle with suction physics, shrinks,
   the box gulps, and hugs the upload row with rolling numbers
   and completion tick.

   ── THE BOX INHALES, AND SWALLOWS ───────────────────────
   A plain filled box, no edge. A file carried over it is
   answered before it is let go: the box grows with a small
   bounce and the arrow lifts toward the hand. Let go and the
   file is SUCKED in — it accelerates toward the box's middle,
   shrinking and drawing out long as it goes — and the box gives
   a little gulp before the upload appears in it. Let go
   anywhere else and the file springs home.

   ── REJECTION & PHYSICS ─────────────────────────────────
   The limit is 10 MB and only PDF or Word documents are
   accepted. An invalid file shakes the box with a spring,
   announces the reason in red, and refuses ingestion.
*/

/* ── inlined from lab/spring ──────────────────────── */
/* ── one spring, for everything that settles ───────────────
   The maths was already on this bench twice, copied by hand:
   Humidity's wheel and Brightness's column both accumulate
   velocity toward a target, damp it, and snap when both the
   delta and the velocity fall under 0.02. Two copies is a
   coincidence; five would be a policy, so it comes out here
   before the elastic blocks are written against it.

   Frames, not milliseconds. `dt` is expressed in sixtieths of
   a second and the damping is RAISED to it rather than
   multiplied by it, so a dropped frame decays the same amount
   of energy as the two frames it replaced. Multiplying is the
   version that makes a spring behave differently on a busy
   page, which is the hardest kind of bug to see.
*/

const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const SNARK = [
  "Still over limit. It didn't shrink.",
  "Pushing harder won't help",
  "Have you tried compressing it?",
  "The box is full of excuses now",
  "No.",
];

export interface FileItem {
  id: string;
  name: string;
  ext: string;
  size: number;
  tint: string;
  nativeFile?: File;
}

const fmt = (b: number) =>
  b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`;

const getFileInfo = (file: File): FileItem => {
  const parts = file.name.split(".");
  const rawExt = (parts.length > 1 ? parts.pop() || "" : "").toLowerCase();
  let tint = "#079455";
  let displayExt = rawExt.toUpperCase() || "DOC";

  if (rawExt === "pdf") {
    tint = "#E53E3E";
    displayExt = "PDF";
  } else if (rawExt === "docx" || rawExt === "doc") {
    tint = "#2B6CB0";
    displayExt = "DOCX";
  } else if (rawExt === "txt") {
    tint = "#4A5568";
    displayExt = "TXT";
  }

  return {
    id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: file.name,
    ext: displayExt,
    size: file.size,
    tint,
    nativeFile: file,
  };
};

/* ── the file icon ─────────────────────────────────────────
   After Untitled UI's: a rounded page on a 40 grid with a thin
   grey outline and a folded corner, and the extension on a
   coloured label that sticks out past the page's left edge —
   the colour carries the kind before the word is read. */
function Page({ f, size = 40 }: { f: FileItem; size?: number }) {
  return (
    <svg
      className="upl-page"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="upl-page-line"
        d="M7.75 4A3.25 3.25 0 0 1 11 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 35 39.25H11A3.25 3.25 0 0 1 7.75 36z"
      />
      <path className="upl-page-line" d="M27 .5V8a4 4 0 0 0 4 4h7.5" />
      <rect width="29" height="16" x="1" y="18" rx="8" fill={f.tint} />
      <text
        x="15.5"
        y="29.1"
        textAnchor="middle"
        fontSize="9"
        className="upl-page-ext"
      >
        {f.ext}
      </text>
    </svg>
  );
}

function Roll({ value }: { value: number }) {
  const s = String(Math.round(value));
  return (
    <span className="upl-roll" aria-label={`${s}%`}>
      {s.split("").map((d, i) => (
        <span key={s.length - i} className="upl-roll-col">
          <span
            className="upl-roll-strip"
            style={{ transform: `translateY(${-Number(d)}em)` }}
          >
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
      %
    </span>
  );
}

type Phase =
  | { kind: "idle" }
  | { kind: "up"; f: FileItem; p: number }
  | { kind: "done"; f: FileItem };

export interface UploadDropzoneProps {
  onUpload?: (file: File) => Promise<any> | void;
  accept?: string;
  maxSizeMb?: number;
  speed?: number;
  bounce?: number;
  corner?: number;
  className?: string;
}

export function UploadDropzone({
  onUpload,
  accept = ".pdf,.docx",
  maxSizeMb = 10,
  speed = 50,
  bounce = 40,
  corner = 20,
  className = "",
}: UploadDropzoneProps) {
  const still = stillness();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectBtnRef = useRef<HTMLButtonElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const now = useRef<HTMLSpanElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [over, setOver] = useState(false);
  const [refuse, setRefuse] = useState<string | null>(null);
  const [gulp, setGulp] = useState(false);
  const [ghost, setGhost] = useState<{
    file: File;
    f: FileItem;
    startX: number;
    startY: number;
  } | null>(null);

  const tries = useRef(0);
  const cool = useRef(0);
  const shake = useAnimationControls();
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const dragCounter = useRef(0);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
      clearTimeout(cool.current);
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  /* ── refusal physics ───────────────────────────────────────
     The first refusal is polite. Try an oversized file again
     and the box starts to answer back with snark. */
  const refuseIt = (customMsg?: string) => {
    const n = tries.current++;
    const msg =
      customMsg ||
      (n === 0
        ? `Too big — up to ${maxSizeMb} MB`
        : SNARK[Math.min(n - 1, SNARK.length - 1)]);
    setRefuse(msg);
    shake.start({ x: [0, -7, 6, -4, 2, 0], transition: { duration: 0.42 } });
    later(() => setRefuse(null), 2500);

    clearTimeout(cool.current);
    cool.current = window.setTimeout(() => {
      tries.current = 0;
    }, 8000);
  };

  /* ── real upload wire with rolling progress ──────────────── */
  const startUpload = async (file: File, f: FileItem) => {
    setPhase({ kind: "up", f, p: 0.08 });

    let p = 0.08;
    let prev = performance.now();
    let isComplete = false;
    let hasError = false;

    // Roll smooth numbers naturally towards ~92% while backend works
    const tick = (t: number) => {
      if (isComplete || hasError) return;
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      if (p < 0.92) {
        p = Math.min(0.92, p + (dt / 1.8) * (0.5 + Math.random() * 0.7));
        setPhase({ kind: "up", f, p });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    try {
      if (onUpload) {
        await onUpload(file);
      } else {
        await new Promise((r) => setTimeout(r, 1200));
      }

      isComplete = true;
      cancelAnimationFrame(raf.current);
      setPhase({ kind: "up", f, p: 1 });

      // Settle at 100% then pop completion tick
      later(() => {
        setPhase({ kind: "done", f });
        later(() => {
          setPhase({ kind: "idle" });
        }, 1600);
      }, 260);
    } catch (err: any) {
      hasError = true;
      cancelAnimationFrame(raf.current);
      setPhase({ kind: "idle" });
      refuseIt(
        err?.response?.data?.error ||
          err?.message ||
          "Upload failed. Please check the file."
      );
    }
  };

  /* ── the suction effect for real files ────────────────────
     Accelerates toward the box's middle on cubic-bezier(0.55, 0, 0.85, 0.3),
     shrinks and draws out along the pull, box gives a little gulp,
     and swallows the file into the upload row. */
  useEffect(() => {
    if (!ghost || !ghostRef.current || !zone.current) return;
    const el = ghostRef.current;
    const z = zone.current;
    const rect = z.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    const dx = targetX - ghost.startX;
    const dy = targetY - ghost.startY;
    const ux = Math.abs(dx);
    const uy = Math.abs(dy);
    const squeeze =
      Math.hypot(ux, uy) < 24
        ? "scale(0.16)"
        : uy >= ux
        ? "scale(0.14, 0.34)"
        : "scale(0.34, 0.14)";

    // Force layout reflow before triggering transition
    void el.getBoundingClientRect();

    requestAnimationFrame(() => {
      el.style.transition =
        "transform 380ms cubic-bezier(0.55, 0, 0.85, 0.3), opacity 300ms ease-in 80ms";
      el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) ${squeeze}`;
      el.style.opacity = "0";
    });

    const tGulp = window.setTimeout(() => {
      setGulp(true);
      setTimeout(() => setGulp(false), 460);
    }, 200);

    const tDone = window.setTimeout(() => {
      startUpload(ghost.file, ghost.f);
      setGhost(null);
    }, 230);

    return () => {
      clearTimeout(tGulp);
      clearTimeout(tDone);
    };
  }, [ghost]);

  /* ── validate and initiate file suction ────────────────── */
  const ingestFile = (file: File, originX?: number, originY?: number) => {
    if (phase.kind !== "idle") return;

    // Check size limit
    if (file.size > maxSizeMb * 1024 * 1024) {
      refuseIt(`Too big — up to ${maxSizeMb} MB`);
      return;
    }

    // Check allowed format
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowed = accept
      .split(",")
      .map((s) => s.trim().replace(/^\./, "").toLowerCase());
    if (allowed.length > 0 && !allowed.includes(ext)) {
      refuseIt("Please upload a PDF or Word document");
      return;
    }

    const f = getFileInfo(file);

    if (still) {
      startUpload(file, f);
      return;
    }

    // Determine starting coordinates for suction
    let sx = originX;
    let sy = originY;

    if (sx === undefined || sy === undefined) {
      const btn = selectBtnRef.current;
      const z = zone.current;
      if (btn) {
        const bRect = btn.getBoundingClientRect();
        sx = bRect.left + bRect.width / 2;
        sy = bRect.top + bRect.height / 2;
      } else if (z) {
        const zRect = z.getBoundingClientRect();
        sx = zRect.left + zRect.width / 2;
        sy = zRect.bottom - 20;
      } else {
        sx = window.innerWidth / 2;
        sy = window.innerHeight / 2;
      }
    }

    setGhost({ file, f, startX: sx, startY: sy });
  };

  /* ── native drag & drop handlers ────────────────────────── */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (phase.kind === "idle") {
      setOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phase.kind === "idle" && !over) {
      setOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setOver(false);

    if (phase.kind !== "idle") return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      ingestFile(file, e.clientX, e.clientY);
    }
  };

  /* ── the box hugs the upload row ──────────────────────────
     While a file is in it the box closes in round the upload row
     — measured, because the row is as wide as its name — and
     grows a little when the tick arrives; back to idle it opens
     out to the full drop box again. Width and height, never a
     scale, so its corner stays the corner. */
  useLayoutEffect(() => {
    const z = zone.current;
    const n = now.current;
    if (!z) return;
    if (phase.kind === "idle" || !n) {
      z.style.width = "";
      z.style.height = "";
      return;
    }
    z.style.width = `${Math.max(280, n.offsetWidth + 36)}px`;
    z.style.height = `${n.offsetHeight + 28}px`;
  }, [phase.kind]);

  const r = Math.max(0, corner);
  const up = phase.kind !== "idle";
  const f = phase.kind !== "idle" ? phase.f : null;

  return (
    <div
      className={`upl ${className}`}
      style={
        {
          "--upl-r": `${r}px`,
          "--upl-spring": `cubic-bezier(0.3, ${
            1 + (bounce / 100) * 0.9
          }, 0.4, 1)`,
        } as React.CSSProperties
      }
    >
      {/* Hidden file input for native OS file selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        tabIndex={-1}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            ingestFile(file);
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />

      {/* Floating suction element */}
      {ghost && (
        <div
          ref={ghostRef}
          style={{
            position: "fixed",
            left: ghost.startX,
            top: ghost.startY,
            zIndex: 99999,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Page f={ghost.f} size={42} />
          <span className="text-[10px] font-semibold tracking-tight px-2 py-0.5 rounded-full bg-white/95 dark:bg-black/95 text-[#121613] dark:text-[#fafffa] shadow-md border border-black/10">
            {ghost.f.name}
          </span>
        </div>
      )}

      {/* Bencho dropzone container with spring shake animation */}
      <motion.div animate={shake} className="upl-zone-wrap">
        <div
          ref={zone}
          className="upl-zone cursor-pointer"
          data-over={over || undefined}
          data-refuse={refuse ? true : undefined}
          data-busy={up || undefined}
          data-gulp={gulp || undefined}
          aria-live="polite"
          onClick={() => {
            if (phase.kind === "idle") {
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!f ? (
            <>
              <span className="upl-icon">
                <UpIcon size={20} strokeWidth={2} />
              </span>
              <span className="upl-say">
                <b>
                  {refuse ?? (over ? "Drop resume here" : "Drag resume here")}
                </b>
                <span>PDF or Word (.docx) up to {maxSizeMb} MB</span>
              </span>
              <button
                ref={selectBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2 px-5 py-2 rounded-full bg-[#121613] hover:bg-black/85 text-white dark:bg-white dark:text-[#121613] text-xs font-semibold tracking-wide shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                Select Document
              </button>
            </>
          ) : (
            <span className="upl-now" key={f.id} ref={now}>
              <Page f={f} size={36} />
              <span className="upl-text">
                <span className="upl-name">{f.name}</span>
                <span className="upl-meta">
                  {fmt(f.size)} ·{" "}
                  {phase.kind === "done" ? (
                    "Uploaded"
                  ) : (
                    <Roll
                      value={phase.kind === "up" ? phase.p * 100 : 0}
                    />
                  )}
                </span>
                <span className="upl-track">
                  <span
                    className="upl-bar"
                    style={{
                      transform: `scaleX(${
                        phase.kind === "up" ? phase.p : 1
                      })`,
                    }}
                  />
                </span>
              </span>
              <span className="upl-end">
                {phase.kind === "done" && (
                  <span className="upl-tick">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                )}
              </span>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default UploadDropzone;

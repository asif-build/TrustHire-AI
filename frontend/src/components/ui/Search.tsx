import React, { useEffect, useRef, useState } from "react";

/* ══ Seek ═════════════════════════════════════════════════
   A search icon that becomes a search field.

   ONE OBJECT, NOT TWO. Everything here follows from that. The
   obvious build is an icon that fades out and an input that
   fades in, and it is obvious because it is easy — but two
   things swapping is never mistaken for one thing changing,
   however well the crossfade is tuned. So there is a single
   box whose WIDTH is the state, and the icon and the field
   are both inside it the whole time.

   Which turns the interesting problems into geometry rather
   than choreography:

   · The lens never moves relative to the box. It sits at a
     fixed inset from the left edge, and at the closed width
     that inset happens to centre it — (44 - 18) / 2 is 13,
     and 13 is also the padding the open field wants. So one
     number is both "centred in a circle" and "aligned in a
     field", and the lens travelling leftward across the page
     is not an animation anybody wrote. It is the box growing
     around a mark that stayed put.

   · The box grows from its middle, so the composition stays
     centred at every frame. Growing from the left would pin
     the lens and throw the field off-centre; growing from the
     right would slide the lens across the page. Neither is
     the object transforming, and both are what you get by
     accident.

   · Height never changes and the corner is fully round at
     every width, so the SHAPE is one rule rather than a tween
     with two ends. At 44 it is a circle and at 320 a pill,
     and those are the same statement. The radius used to
     interpolate 22 → 13, which was a second thing that had
     to agree with the first; a stadium corner needs no
     agreement at all.

   The press is a real beat. A click compresses the object for
   a moment before it expands, because a thing that yields
   before it moves reads as having been pushed, and a thing
   that only moves reads as having been triggered. */

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

   The loop parks itself the moment the value has settled. */

const springOf = (tune: number) => ({
  /* stiffness: how hard it is pulled toward the target */
  k: 0.08 + (tune / 100) * 0.16,
  /* decay, per frame: how much of the velocity survives */
  d: 0.62 + (tune / 100) * 0.2,
});

function useSpring(target: number, tune = 50, instant = false) {
  const [at, setAt] = useState(target);
  const cur = useRef(target);
  const vel = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (instant) {
      cur.current = target;
      vel.current = 0;
      setAt(target);
      return;
    }
    const { k, d } = springOf(tune);
    let prev = 0;
    const tick = (t: number) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      vel.current += (target - cur.current) * k * dt;
      vel.current *= Math.pow(d, dt);
      cur.current += vel.current * dt;
      if (Math.abs(target - cur.current) < 0.02 && Math.abs(vel.current) < 0.02) {
        cur.current = target;
        vel.current = 0;
        setAt(target);
        raf.current = 0;
        return;
      }
      setAt(cur.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [target, tune, instant]);

  return at;
}

const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const SHUT = 60;
const LENS = 26;
const INSET = (SHUT - LENS) / 2;
const CORNER = 30;

const WIDE = 360;
const SNUG = 280;

export interface SearchProps {
  give?: number;
  spring?: number;
  width?: number;
  corner?: number;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (query: string) => void;
  defaultOpen?: boolean;
  className?: string;
}

export function Seek({
  give = 50,
  spring = 50,
  width,
  corner = CORNER,
  placeholder = "Search",
  value: controlledValue,
  onChange,
  onSearch,
  defaultOpen = false,
  className = "",
}: SearchProps = {}) {
  const [snug, setSnug] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches
  );

  useEffect(() => {
    const room = window.matchMedia("(max-width: 760px)");
    const read = () => setSnug(room.matches);
    room.addEventListener("change", read);
    return () => room.removeEventListener("change", read);
  }, []);

  const [localValue, setLocalValue] = useState(controlledValue ?? "");
  const query = controlledValue !== undefined ? controlledValue : localValue;

  const maxWidthAvail = typeof window !== "undefined" ? Math.max(280, window.innerWidth - 48) : 680;
  const targetSpan = width ?? (snug ? SNUG : WIDE);
  const span = Math.min(targetSpan, maxWidthAvail);

  const frame = useRef<HTMLDivElement | null>(null);
  const field = useRef<HTMLInputElement | null>(null);
  const beat = useRef(0);
  const rest = useRef(0);

  const [open, setOpen] = useState(defaultOpen || Boolean(query));
  const [press, setPress] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lean, setLean] = useState({ x: 0, y: 0 });
  const still = stillness();

  // Keep open state synced if query arrives from outside
  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
      if (controlledValue) setOpen(true);
    }
  }, [controlledValue]);

  useEffect(() => () => {
    window.clearTimeout(beat.current);
    window.clearTimeout(rest.current);
  }, []);

  const target = open ? Math.max(SHUT, span) : SHUT;
  const w = useSpring(target, clamp(spring, 0, 100), still);
  const p = clamp((w - SHUT) / Math.max(1, Math.max(SHUT, span) - SHUT), 0, 1);

  /* ── the magnet ────────────────────────────────────────── */
  useEffect(() => {
    const el = frame.current;
    if (!el || open || still) return;
    let raf = 0;
    let at = { x: 0, y: 0 };
    const publish = () => { raf = 0; setLean(at); };
    const read = (e: PointerEvent) => {
      const skin = el.querySelector<HTMLElement>(".sek-skin") || el;
      const b = skin.getBoundingClientRect();
      const k = b.width / (skin.offsetWidth || b.width) || 1;
      const dx = (e.clientX - (b.left + b.width / 2)) / k;
      const dy = (e.clientY - (b.top + b.height / 2)) / k;
      const d = Math.hypot(dx, dy);
      const R = 110;
      if (d > R) {
        if (at.x || at.y) { at = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(publish); }
        return;
      }
      const pull = (1 - d / R) ** 1.4 * (2 + (give / 100) * 5);
      at = { x: (dx / (d || 1)) * pull, y: (dy / (d || 1)) * pull };
      if (!raf) raf = requestAnimationFrame(publish);
    };
    const gone = () => { at = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(publish); };
    document.addEventListener("pointermove", read, { passive: true });
    document.addEventListener("pointerleave", gone);
    return () => {
      document.removeEventListener("pointermove", read);
      document.removeEventListener("pointerleave", gone);
      cancelAnimationFrame(raf);
    };
  }, [open, give, still]);

  const start = () => {
    if (open) return;
    setPress(true);
    window.clearTimeout(beat.current);
    beat.current = window.setTimeout(() => {
      setPress(false);
      setOpen(true);
      field.current?.focus();
    }, still ? 0 : 90);
  };

  const away = () => {
    if (query.trim()) return;
    setOpen(false);
  };

  const tapped = () => {
    setBusy(true);
    window.clearTimeout(rest.current);
    rest.current = window.setTimeout(() => setBusy(false), 340);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (controlledValue === undefined) {
      setLocalValue(val);
    }
    onChange?.(val);
    tapped();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (controlledValue === undefined) setLocalValue("");
    onChange?.("");
    onSearch?.("");
    field.current?.focus();
  };

  return (
    <div
      className={`sek ${className}`}
      ref={frame}
      data-open={open}
      data-press={press}
      data-busy={busy}
      data-flat={still || undefined}
      style={{
        "--sek-r": `${clamp(corner, 0, CORNER)}px`,
        "--w": `${w.toFixed(2)}px`,
        "--p": p.toFixed(3),
        "--say": clamp((p - 0.45) / 0.55, 0, 1).toFixed(3),
        "--lx": `${lean.x.toFixed(2)}px`,
        "--ly": `${lean.y.toFixed(2)}px`,
        "--inset": `${INSET}px`,
        "--lens": `${LENS}px`,
        "--shut": `${SHUT}px`,
        "--frame": `${Math.max(SHUT, span) + 16}px`,
        "--frameh": `${SHUT + 16}px`,
      } as React.CSSProperties}
    >
      <div className="sek-skin">
        <svg className="sek-lens" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="7.6" cy="7.6" r="5.4" />
          <path d="M11.6 11.6 L15.4 15.4" />
        </svg>

        <input
          ref={field}
          className="sek-field"
          type="text"
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          tabIndex={open ? 0 : -1}
          onChange={handleInputChange}
          onBlur={away}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch?.(query);
            }
            if (e.key === "Escape") {
              e.preventDefault();
              if (controlledValue === undefined) setLocalValue("");
              onChange?.("");
              setOpen(false);
              field.current?.blur();
            }
          }}
        />

        {/* Clear button when text exists */}
        {open && query && (
          <button
            type="button"
            className="sek-clear"
            aria-label="Clear search"
            onClick={handleClear}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}

        {!open && (
          <button className="sek-hit" aria-label="Search" onClick={start} />
        )}
      </div>
    </div>
  );
}

export { Seek as Search };
export default Seek;

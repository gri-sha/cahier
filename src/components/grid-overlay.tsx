"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Dev-only layout inspector. It paints the cahier grid — the tokens defined in
// globals.css (--line, --margin-x, --measure) — over whatever page you're on,
// so you can see whether elements actually land on it. Purely opt-in: renders
// nothing until toggled, so it never touches a real visitor.
//
// Toggle: ⇧+⌘G (mac) / Ctrl+Shift+G — cycles off → grid → grid + outline.
// Or load any page with ?grid (=grid) or ?grid=outline. Choice is remembered
// in localStorage.
//
// The three reference frames it draws, matching the two horizontal systems the
// pages actually use:
//   • horizontal ruling every --line (2rem) — the vertical rhythm, on all pages
//   • the notebook margin rule at --margin-x — the left-anchored pages
//     (landing, legal)
//   • the centered --measure column — the centered pages (published CV, editor)

type Mode = 0 | 1 | 2;
const KEY = "cahier:grid";

// Module-level store so the mode survives across renders and is read through
// useSyncExternalStore — the server snapshot is always 0, so SSR and the first
// client render agree (no hydration mismatch) and only browser state can turn
// the overlay on.
let mode: Mode | null = null;
const listeners = new Set<() => void>();

function readInitial(): Mode {
  const q = new URLSearchParams(window.location.search).get("grid");
  if (q === "" || q === "1" || q === "on" || q === "grid") return 1;
  if (q === "2" || q === "outline") return 2;
  const saved = window.localStorage.getItem(KEY);
  return saved === "1" ? 1 : saved === "2" ? 2 : 0;
}

function getSnapshot(): Mode {
  if (mode === null) mode = readInitial();
  return mode;
}

function getServerSnapshot(): Mode {
  return 0;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function cycleMode() {
  mode = (((mode ?? 0) + 1) % 3) as Mode;
  window.localStorage.setItem(KEY, String(mode));
  listeners.forEach((l) => l());
}

export function GridOverlay() {
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [height, setHeight] = useState(0);

  // ⇧+⌘G / Ctrl+Shift+G cycles the mode.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "g" || e.key === "G")) {
        e.preventDefault();
        cycleMode();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The ruling must scroll with the page (a fixed grid only lines up at scroll
  // offsets that are whole --lines), so the overlay is absolutely positioned
  // and stretched to the full document height. The ResizeObserver's own initial
  // callback seeds the height, so no state is set synchronously on mount.
  useEffect(() => {
    if (active === 0) return;
    const measure = () => setHeight(document.documentElement.scrollHeight);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active]);

  // Outline mode tags <html> so a global rule can outline every element.
  // outline (not border) is used so nothing shifts on the grid.
  useEffect(() => {
    const el = document.documentElement;
    if (active === 2) el.setAttribute("data-grid-outline", "");
    else el.removeAttribute("data-grid-outline");
    return () => el.removeAttribute("data-grid-outline");
  }, [active]);

  if (active === 0) return null;

  return (
    <>
      {active === 2 && (
        <style>{`
          [data-grid-outline] * {
            outline: 1px solid color-mix(in srgb, var(--fg) 20%, transparent);
          }
        `}</style>
      )}

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: height || "100%",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      >
        {/* horizontal ruling every --line */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(to bottom," +
              "transparent 0, transparent calc(var(--line) - 1px)," +
              "rgba(90,130,255,0.28) calc(var(--line) - 1px), rgba(90,130,255,0.28) var(--line))",
          }}
        />
        {/* the notebook margin rule (left-anchored pages) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "var(--margin-x)",
            width: 1,
            background: "rgba(255,70,70,0.6)",
          }}
        />
        {/* the centered reading measure (centered pages) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: "var(--measure)",
            transform: "translateX(-50%)",
            background: "rgba(50,170,90,0.06)",
            borderLeft: "1px solid rgba(50,170,90,0.5)",
            borderRight: "1px solid rgba(50,170,90,0.5)",
          }}
        />
      </div>

      {/* status chip: what's on and how to cycle it off */}
      <div
        aria-hidden
        className="minor"
        style={{
          position: "fixed",
          left: 8,
          bottom: 8,
          zIndex: 9999,
          pointerEvents: "none",
          padding: "0.15rem 0.45rem",
          fontSize: "11px",
          lineHeight: 1.4,
          color: "color-mix(in srgb, var(--fg) 60%, transparent)",
          background: "var(--bg)",
          border: "1px solid color-mix(in srgb, var(--fg) 15%, transparent)",
        }}
      >
        grid{active === 2 ? " + outline" : ""} · ⇧⌘/Ctrl+Shift+G
      </div>
    </>
  );
}

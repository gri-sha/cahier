// Global theme config. Every color, font and text size on the site derives
// from here. A theme owns three colors (bg, fg — intermediate shades come
// from fg alpha — and accent, the theme's special color, currently only used
// for desktop text selection), three font roles and a fixed type scale:
// the styles in `typeRoles` are the only text stylings that exist on the
// site, applied through custom CSS classes in globals.css (never Tailwind
// utilities). Font variables are declared in src/app/fonts.ts and must stay
// in sync with the var() names used here.

export type ThemeName = "paper" | "ink" | "modernblue-light";

// The complete set of text styles, one CSS var pair (--type-*, --type-*-lh) per role.
// Website chrome uses heading/base/minor, exposed as the .heading, .base and .minor classes in globals.css;
// rendered markdown uses h1–h6, base and code through the .doc rules.
// Nothing else exists — Tailwind's text-*/font-* utilities are disabled.
const typeRoles = [
  "hero", // landing splash (size modifier on .heading)
  "heading", // website page titles
  "base", // website text, md body — real bold/italic/bold-italic cuts
  "minor", // website small mono chrome
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "code", // md code + the raw markdown editor — real cuts in all four modes
] as const;
type TypeRole = (typeof typeRoles)[number];
type TypeStyle = { size: string; lineHeight: number | string };

type Theme = {
  name: ThemeName;
  // shown in the editor's theme menu, grouped under `kind`
  label: string;
  kind: "light" | "dark";
  colors: {
    bg: string;
    fg: string;
    // must read against bg as a fill, with bg-colored text on top
    accent: string;
  };
  fonts: {
    heading: string;
    text: string;
    mono: string;
  };
  headingWeight: number;
  headingTracking: string;
  // font-size of the top-left logotype — tuned per face so each reads at the
  // same optical weight next to the mono chrome (Shadows is a lighter hand, so
  // it wants a larger size than Inter).
  wordmarkSize: string;
  // vertical-align that seats the wordmark on the adjacent mono chrome's
  // optical center — tuned per heading face (Shadows rides high, Inter doesn't).
  wordmarkShift: string;
  type: Record<TypeRole, TypeStyle>;
};

// paper and ink are inversions of one another: all typography is shared,
// only the colors differ.
const fonts = {
  heading: "var(--font-shadows)",
  text: "var(--font-roboto)",
  mono: "var(--font-roboto-mono)",
};

// modern-blue's trio (declared in src/app/fonts.ts): Inter headings, Krub
// body, IBM Plex Mono code.
const modernFonts = {
  heading: "var(--font-inter)",
  text: "var(--font-krub)",
  mono: "var(--font-ibm-plex-mono)",
};

const type: Record<TypeRole, TypeStyle> = {
  // website
  hero: { size: "clamp(4.25rem, 14vw, 10.5rem)", lineHeight: 1 },
  heading: { size: "3.25rem", lineHeight: 1.1 },
  base: { size: "1rem", lineHeight: 1.65 },
  minor: { size: "0.875rem", lineHeight: 1.6 },
  // md
  h1: { size: "3.25rem", lineHeight: 1.1 },
  h2: { size: "2.75rem", lineHeight: 1.12 },
  h3: { size: "2.25rem", lineHeight: 1.15 },
  h4: { size: "1.75rem", lineHeight: 1.2 },
  h5: { size: "1.25rem", lineHeight: 1.3 },
  h6: { size: "1rem", lineHeight: 1.4 },
  code: { size: "0.875rem", lineHeight: 1.6 },
};

export const themes: Record<ThemeName, Theme> = {
  paper: {
    name: "paper",
    label: "default",
    kind: "light",
    // accent: highlighter orange
    colors: { bg: "#ffffff", fg: "#000000", accent: "#e8590c" },
    fonts,
    // Shadows Into Light has a single 400 cut
    headingWeight: 400,
    headingTracking: "0em",
    wordmarkSize: "1.75rem",
    wordmarkShift: "-4px",
    type,
  },
  ink: {
    name: "ink",
    label: "default",
    kind: "dark",
    // accent: the same orange lifted to sit on black
    colors: { bg: "#000000", fg: "#ffffff", accent: "#ff922b" },
    fonts,
    headingWeight: 400,
    headingTracking: "0em",
    wordmarkSize: "1.75rem",
    wordmarkShift: "-4px",
    type,
  },
  // modern blue: neutral background, blue ink. Inter's a geometric sans, so
  // headings take a heavier cut and a touch of negative tracking to read as a
  // display face rather than body text.
  "modernblue-light": {
    name: "modernblue-light",
    label: "modern blue",
    kind: "light",
    // blue-700 ink on white; blue-600 selection fill reads with white text
    colors: { bg: "#ffffff", fg: "#1d4ed8", accent: "#2563eb" },
    fonts: modernFonts,
    headingWeight: 700,
    headingTracking: "-0.02em",
    wordmarkSize: "1.5rem",
    // Inter sits on its baseline, so a small drop centers it on the mono
    wordmarkShift: "-1px",
    type,
  },
};

export const themeNames = Object.keys(themes) as ThemeName[];
export const defaultTheme: ThemeName = "paper";

export function isThemeName(value: string): value is ThemeName {
  return value in themes;
}

function vars(t: Theme): string {
  return [
    `--bg:${t.colors.bg}`,
    `--fg:${t.colors.fg}`,
    `--accent:${t.colors.accent}`,
    `--th-heading:${t.fonts.heading}`,
    `--th-text:${t.fonts.text}`,
    `--th-mono:${t.fonts.mono}`,
    `--th-heading-weight:${t.headingWeight}`,
    `--th-heading-tracking:${t.headingTracking}`,
    `--th-wordmark-size:${t.wordmarkSize}`,
    `--th-wordmark-shift:${t.wordmarkShift}`,
    ...typeRoles.map((r) => `--type-${r}:${t.type[r].size};--type-${r}-lh:${t.type[r].lineHeight}`),
    `color-scheme:${t.kind}`,
  ].join(";");
}

// Rendered into a <style> tag in the root layout. The default is always paper
// (light) — the system color scheme is deliberately ignored; only an explicit
// data-theme (set on html or a wrapper div once a user picks one) pins another.
export function themeCss(): string {
  const light = themes.paper;
  return [
    `:root{${vars(light)}}`,
    ...themeNames.map((n) => `[data-theme="${n}"]{${vars(themes[n])}}`),
  ].join("\n");
}

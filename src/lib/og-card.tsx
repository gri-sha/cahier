// Shared 1200x630 share-card renderer for the opengraph-image routes.
// Rebuilds the landing aesthetic (notebook margin line, themed heading, mono
// url chrome) in satori-compatible JSX, colored and typeset by a theme from
// src/lib/themes.ts. Fonts must be raw TTF data — next/font can't be used
// here — so every family the themes reference is vendored in
// src/assets/fonts, keyed below by the CSS var it's declared under in
// src/app/fonts.ts.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { themes, type ThemeName } from "@/lib/themes";

export const ogSize = { width: 1200, height: 630 };

type FontCut = { name: string; file: string; weight: 400 | 700 };

// One card-ready cut per family — the weight that family renders at on a
// card (Inter headings are bold in the modern-blue theme, everything else is 400).
const familyCuts: Record<string, FontCut> = {
  "var(--font-shadows)": {
    name: "Shadows Into Light",
    file: "ShadowsIntoLight-Regular.ttf",
    weight: 400,
  },
  "var(--font-roboto)": { name: "Roboto", file: "Roboto-Regular.ttf", weight: 400 },
  "var(--font-roboto-mono)": { name: "Roboto Mono", file: "RobotoMono-Regular.ttf", weight: 400 },
  "var(--font-inter)": { name: "Inter", file: "Inter-Bold.ttf", weight: 700 },
  "var(--font-krub)": { name: "Krub", file: "Krub-Regular.ttf", weight: 400 },
  "var(--font-ibm-plex-mono)": {
    name: "IBM Plex Mono",
    file: "IBMPlexMono-Regular.ttf",
    weight: 400,
  },
};

// heading/text/mono theme roles are single var() references, so they index
// familyCuts directly.
function cutFor(role: string): FontCut {
  const cut = familyCuts[role];
  if (!cut) throw new Error(`no vendored card font for ${role}`);
  return cut;
}

const fileCache = new Map<string, Promise<Buffer>>();
function fontData(file: string): Promise<Buffer> {
  let data = fileCache.get(file);
  if (!data) {
    data = readFile(join(process.cwd(), "src/assets/fonts", file));
    fileCache.set(file, data);
  }
  return data;
}

// The text face rides along as a fallback for glyphs the heading face lacks.
async function loadFonts(theme: ThemeName) {
  const { heading, text, mono } = themes[theme].fonts;
  const cuts = new Map([heading, text, mono].map((role) => cutFor(role)).map((c) => [c.file, c]));
  return Promise.all(
    [...cuts.values()].map(async (cut) => ({
      name: cut.name,
      data: await fontData(cut.file),
      weight: cut.weight,
      style: "normal" as const,
    })),
  );
}

// alpha suffixes for the 6-digit theme hex colors
const A20 = "33";
const A55 = "8C";

export async function ogCard({
  theme,
  title,
  path,
}: {
  theme: ThemeName;
  title: string;
  // url path shown under the title, without leading slash ("" for the landing)
  path: string;
}) {
  const t = themes[theme];
  const { bg, fg } = t.colors;
  const titleSize = title.length > 22 ? 104 : 148;
  // satori wants letter-spacing in px; themes declare it in em of the heading
  const titleTracking = parseFloat(t.headingTracking) * titleSize;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: bg,
        color: fg,
      }}
    >
      <div style={{ width: 150, borderRight: `2px solid ${fg}${A20}`, display: "flex" }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px 0 56px",
        }}
      >
        <div
          style={{
            fontFamily: `"${cutFor(t.fonts.heading).name}"`,
            fontWeight: t.headingWeight,
            letterSpacing: titleTracking,
            fontSize: titleSize,
            lineHeight: 1.05,
            display: "block",
            lineClamp: 2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: `"${cutFor(t.fonts.mono).name}"`,
            fontSize: 34,
            marginTop: 28,
            display: "flex",
          }}
        >
          <span style={{ color: `${fg}${A55}` }}>cahier.fyi/</span>
          <span>{path || "you"}</span>
        </div>
      </div>
    </div>,
    { ...ogSize, fonts: await loadFonts(theme) },
  );
}

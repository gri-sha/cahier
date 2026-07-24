// Font families used by the themes in src/lib/themes.ts. Every family is
// exposed as a CSS variable and all of them are attached to <html> (see
// fontVariables), so a theme just points its --th-* roles at whichever vars
// it wants and the switch is pure CSS.
//
// The default themes (paper/ink) use Shadows Into Light (headings) / Roboto
// (text) / Roboto Mono (mono). The modern-blue theme uses Inter (headings) /
// Krub (text) / IBM Plex Mono (mono). Roboto, Krub and both monos are loaded
// with true italics and a bold cut, so normal/italic/bold/bold-italic all
// render from real cuts; Shadows Into Light exists only as a single 400 upright
// cut — its headings don't italicize.

import {
  Shadows_Into_Light,
  Roboto,
  Roboto_Mono,
  Inter,
  Krub,
  IBM_Plex_Mono,
} from "next/font/google";

const shadowsIntoLight = Shadows_Into_Light({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-shadows",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-roboto-mono",
  display: "swap",
});

// modern-blue trio. preload:false — these only render when a modern-blue
// theme is active, so we don't want to preload them on the default pages;
// display:swap fills in from the fallback until the file arrives.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const krub = Krub({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-krub",
  display: "swap",
  preload: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  shadowsIntoLight.variable,
  roboto.variable,
  robotoMono.variable,
  inter.variable,
  krub.variable,
  ibmPlexMono.variable,
].join(" ");

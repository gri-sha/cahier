"use client";

import { useEffect } from "react";
import type { ThemeName } from "@/lib/themes";

// Mirrors the page's theme onto <html> after hydration so the whole
// viewport (scrollbars, overscroll) matches. First paint is already correct:
// pages wrap themselves in div[data-theme]. Pages with no explicit theme pass
// null to clear any leftover theme and fall back to the default (paper).

export function ThemeSync({ theme }: { theme: ThemeName | null }) {
  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
  }, [theme]);
  return null;
}

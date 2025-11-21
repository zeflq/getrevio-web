// ThemeSelector.tsx
"use client";

import * as React from "react";
import { useLandingTheme } from "./themeProvider";

export function ThemeSelector() {
  const { currentThemeId, options, setTheme } = useLandingTheme();

  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-sm font-medium">Theme</span>
      <select
        value={currentThemeId}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded-md border px-2 py-1 text-sm"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </label>
  );
}

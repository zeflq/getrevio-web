"use client";

import * as React from "react";

export type LandingBelongsToExternal = {
  type: "place" | "campaign";
  id: string;
  label?: string | null;
};

export type LandingRenderContextValue = {
  landingId: string;
  merchantId: string;
  belongsTo?: LandingBelongsToExternal | null;
  previewMode: "draft" | "live";
};

const LandingRenderContext = React.createContext<LandingRenderContextValue | null>(
  null,
);

export function LandingRenderProvider({
  value,
  children,
}: {
  value: LandingRenderContextValue;
  children: React.ReactNode;
}) {
  return (
    <LandingRenderContext.Provider value={value}>
      {children}
    </LandingRenderContext.Provider>
  );
}

export function useLandingRenderContext() {
  const ctx = React.useContext(LandingRenderContext);
  if (!ctx) {
    throw new Error(
      "useLandingRenderContext must be used inside <LandingRenderProvider>",
    );
  }
  return ctx;
}

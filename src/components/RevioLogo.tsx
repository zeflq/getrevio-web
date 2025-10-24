import * as React from "react";

export function RevioGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Revio" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4v16M8 4h6a4 4 0 0 1 0 8H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 12L18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

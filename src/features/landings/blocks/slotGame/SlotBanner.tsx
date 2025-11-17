"use client";

import * as React from "react";
import {
  Crown,
  Gem,
  Cherry,
  Clover,
  Star,
  Dice5,
  Gift,
  Sparkles,
} from "lucide-react";

interface SlotBannerProps {
  name: string;      // restaurant / hotel name
  label?: string;    // e.g. "BIG WIN", "JACKPOT"
  showSpinButton?: boolean;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "★";

  const words = trimmed.split(/\s+/);
  const initials = words.slice(0, 2).map((w) => w[0]).join("");
  return (initials || trimmed.slice(0, 2)).toUpperCase();
}

export function SlotBanner({
  name,
  label = "BIG WIN",
  showSpinButton = false,
}: SlotBannerProps) {
  const initials = getInitials(name);

  // use slot icon token, not accent
  const iconClass =
    "h-6 w-6 text-[var(--landing-slot-icon)] stroke-[2.1] drop-shadow-[0_0_2px_var(--landing-slot-icon)]";

  const cells: Array<"icon" | "name"> = [
    "icon",
    "icon",
    "icon",
    "icon",
    "name",
    "icon",
    "icon",
    "icon",
    "icon",
  ];

  const iconComponents = [
    <Crown key="c" className={iconClass} />,
    <Gem key="g" className={iconClass} />,
    <Cherry key="ch" className={iconClass} />,
    <Clover key="cl" className={iconClass} />,
    <Star key="s" className={iconClass} />,
    <Dice5 key="d" className={iconClass} />,
    <Gift key="gi" className={iconClass} />,
    <Sparkles key="sp" className={iconClass} />,
  ];

  let iconIndex = 0;

  return (
    <div className="w-full flex justify-center">
      <div
        className="
          relative w-full max-w-[220px]
          rounded-3xl border
          px-3 py-3
          overflow-hidden
          bg-[var(--landing-slot-bg)]
          border-[var(--landing-slot-tile-border)]
          shadow-[0_6px_18px_rgba(0,0,0,0.06)]
        "
        style={{
          boxShadow: `
            0 6px 18px rgba(0,0,0,0.06),
            0 0 12px var(--landing-slot-glow-accent)
          `,
        }}
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-0 blur-3xl bg-[var(--landing-slot-glow-primary)]/25" />

        {/* top label */}
        <div className="relative mb-2 flex items-center justify-center gap-2">
          <span className="h-px w-5 bg-[var(--landing-border)] opacity-60" />
          <span
            className="
              text-[10px] font-extrabold tracking-[0.25em] uppercase
              text-[var(--landing-muted-text)]
            "
          >
            {label}
          </span>
          <span className="h-px w-5 bg-[var(--landing-border)] opacity-60" />
        </div>

        {/* slot grid */}
        <div
          className="
            relative
            grid grid-cols-3 grid-rows-3 gap-2
            rounded-2xl
            bg-[var(--landing-slot-bg)]
            p-1.5
          "
        >
          {cells.map((type, i) => {
            if (type === "name") {
              return (
                <div
                  key={`name-${i}`}
                  className="
                    aspect-square
                    flex items-center justify-center
                    rounded-xl border
                    bg-[var(--landing-slot-center-bg)]
                    border-[var(--landing-slot-tile-border)]
                    shadow-[0_0_10px_var(--landing-slot-glow-primary),inset_0_0_6px_rgba(0,0,0,0.08)]
                  "
                >
                  <span
                    className="
                      text-2xl font-extrabold
                      text-[var(--landing-slot-center-text)]
                    "
                  >
                    {initials}
                  </span>
                </div>
              );
            }

            const icon = iconComponents[iconIndex % iconComponents.length];
            iconIndex++;

            return (
              <div
                key={`icon-${i}`}
                className="
                  aspect-square
                  flex items-center justify-center
                  rounded-xl border
                  bg-[var(--landing-slot-tile-bg)]
                  border-[var(--landing-slot-tile-border)]
                  shadow-[inset_0_0_4px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]
                "
              >
                {icon}
              </div>
            );
          })}
        </div>

        {/* bottom bar like "SPIN" */}
        {showSpinButton && (
          <div className="relative mt-2 flex items-center justify-center">
            <div
              className="
                inline-flex items-center justify-center
                rounded-xl px-4 py-1
                text-[10px] font-extrabold uppercase tracking-[0.25em]
                bg-[var(--landing-secondary)]
                text-[var(--landing-text)]
              "
            >
              spin
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

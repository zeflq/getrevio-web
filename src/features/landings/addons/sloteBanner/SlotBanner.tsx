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
  name: string; // restaurant / hotel name
  label?: string; // e.g. "BIG WIN", "JACKPOT"
  onSpinEnd?: () => void;
}

/**
 * Public API: parent can control the slot machine via ref.
 */
export interface SlotBannerHandle {
  startSpin: () => void;
  stopWithWin: () => void;
  stopWithLose: () => void;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "★";

  const words = trimmed.split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (initials || trimmed.slice(0, 2)).toUpperCase();
}

/**
 * All possible symbol keys, including "name" which is the winning symbol.
 */
type SymbolKey =
  | "crown"
  | "gem"
  | "cherry"
  | "clover"
  | "star"
  | "dice"
  | "gift"
  | "sparkles"
  | "name";

const ROWS = 3;
const COLS = 3;
const REEL_SPIN_INTERVAL_MS = 120; // ms between symbol shifts
const REEL_STOP_INTERVAL_MS = 1000; // delay between reel 1/2/3 stopping

// Winner symbol is "name" (row of N N N)
const WIN_SYMBOL_KEY: SymbolKey = "name";

// Order of symbols on each vertical reel
const REEL_STRIP: SymbolKey[] = [
  "sparkles",
  "dice",
  "crown",
  "star",
  "name",
  "cherry",
  "gift",
  "clover",
];

const NON_WIN_SYMBOL_KEYS = REEL_STRIP.filter((k) => k !== WIN_SYMBOL_KEY);

/**
 * Mapping symbol → icon component (for all except "name").
 */
const ICON_COMPONENTS: Record<
  Exclude<SymbolKey, "name">,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  crown: Crown,
  gem: Gem,
  cherry: Cherry,
  clover: Clover,
  star: Star,
  dice: Dice5,
  gift: Gift,
  sparkles: Sparkles,
};

/**
 * 🔒 FIXED INITIAL MATRIX
 * This never changes on mount, reload, StrictMode, SSR, etc.
 * Name is in the middle, only once in the grid.
 */
const INITIAL_MATRIX: SymbolKey[][] = [
  ["sparkles", "dice", "crown"],
  ["star", "name", "star"],
  ["gift", "cherry", "clover"],
];

export const SlotBanner = React.forwardRef<SlotBannerHandle, SlotBannerProps>(
  function SlotBannerInner(
    { name, label = "BIG WIN", onSpinEnd }: SlotBannerProps,
    ref,
  ) {
    const initials = getInitials(name);

    const iconClass =
      "h-6 w-6 text-[var(--landing-slot-icon)] stroke-[2.1] drop-shadow-[0_0_2px_var(--landing-slot-icon)]";

    // 3x3 grid of symbol keys – FIXED INIT
    const [grid, setGrid] = React.useState<SymbolKey[][]>(INITIAL_MATRIX);

    const spinningRef = React.useRef(false);

    // random starting reel position per column (only used once we spin)
    const reelPositionsRef = React.useRef<number[]>(
      Array.from({ length: COLS }, () =>
        Math.floor(Math.random() * REEL_STRIP.length),
      ),
    );

    const reelIntervalsRef = React.useRef<Array<number | null>>(
      Array(COLS).fill(null),
    );

    // Cleanup intervals on unmount
    React.useEffect(() => {
      return () => {
        stopAllReels();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- helpers ----------

    function randomFrom<T>(arr: T[]): T {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function stopAllReels() {
      reelIntervalsRef.current.forEach((id, col) => {
        if (id != null) {
          window.clearInterval(id);
          reelIntervalsRef.current[col] = null;
        }
      });
      spinningRef.current = false;
    }

    // Update one column according to its reel position
    function applyReelColumn(col: number) {
      const topIndex = reelPositionsRef.current[col];

      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        for (let row = 0; row < ROWS; row++) {
          const stripIndex =
            (topIndex + row + REEL_STRIP.length) % REEL_STRIP.length;
          next[row][col] = REEL_STRIP[stripIndex];
        }
        return next;
      });
    }

    function startSpin() {
      if (spinningRef.current) return;
      spinningRef.current = true;

      for (let col = 0; col < COLS; col++) {
        const id = window.setInterval(() => {
          reelPositionsRef.current[col] =
            (reelPositionsRef.current[col] + 1) % REEL_STRIP.length;
          applyReelColumn(col);
        }, REEL_SPIN_INTERVAL_MS);

        reelIntervalsRef.current[col] = id;
      }
    }

    function stopReel(col: number) {
      const id = reelIntervalsRef.current[col];
      if (id != null) {
        window.clearInterval(id);
        reelIntervalsRef.current[col] = null;
      }
    }

    function buildWinGrid(): SymbolKey[][] {
      // Top & bottom rows: random non-"name"
      // Middle row: name name name
      const matrix: SymbolKey[][] = Array.from({ length: ROWS }, () =>
        Array(COLS).fill(WIN_SYMBOL_KEY),
      );

      for (let col = 0; col < COLS; col++) {
        matrix[0][col] = randomFrom(NON_WIN_SYMBOL_KEYS);
        matrix[1][col] = WIN_SYMBOL_KEY;
        matrix[2][col] = randomFrom(NON_WIN_SYMBOL_KEYS);
      }

      return matrix;
    }

    function buildLoseGrid(): SymbolKey[][] {
      const matrix: SymbolKey[][] = Array.from({ length: ROWS }, () =>
        Array<SymbolKey>(COLS).fill("star"), // temporary default
      );

      // Fill column by column so we can enforce: max one "name" per reel
      for (let c = 0; c < COLS; c++) {
        let nameUsedInCol = false;

        for (let r = 0; r < ROWS; r++) {
          // If we've already used "name" in this reel, restrict to NON_WIN symbols
          const pool = nameUsedInCol ? NON_WIN_SYMBOL_KEYS : REEL_STRIP;
          const sym = randomFrom(pool);

          if (sym === WIN_SYMBOL_KEY) {
            nameUsedInCol = true;
          }

          matrix[r][c] = sym;
        }
      }

      // Ensure the middle row is NOT [name, name, name]
      const mid = matrix[1];
      if (
        mid[0] === WIN_SYMBOL_KEY &&
        mid[1] === WIN_SYMBOL_KEY &&
        mid[2] === WIN_SYMBOL_KEY
      ) {
        mid[0] = randomFrom(NON_WIN_SYMBOL_KEYS);
      }

      return matrix;
    }

    function applyColumnFromMatrix(col: number, matrix: SymbolKey[][]) {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        for (let r = 0; r < ROWS; r++) {
          next[r][col] = matrix[r][col];
        }
        return next;
      });
    }

    function stopReelsSequential(finalMatrix: SymbolKey[][]) {
      spinningRef.current = false;

      for (let col = 0; col < COLS; col++) {
        window.setTimeout(() => {
          stopReel(col);
          applyColumnFromMatrix(col, finalMatrix);
          if (col === COLS - 1) {
            onSpinEnd?.();
          }
        }, col * REEL_STOP_INTERVAL_MS);
      }
    }

    function stopWithWin() {
      const matrix = buildWinGrid();
      stopReelsSequential(matrix);
    }

    function stopWithLose() {
      const matrix = buildLoseGrid();
      stopReelsSequential(matrix);
    }

    // expose methods to parent
    React.useImperativeHandle(
      ref,
      () => ({
        startSpin,
        stopWithWin,
        stopWithLose,
      }),
      [],
    );

    // ---------- render ----------

    return (
      <div className="w-full flex justify-center">
        <div
          className="
            relative w-full max-w-[220px]
            rounded-3xl border
            px-3 py-3
            overflow-hidden
            bg-(--landing-slot-bg)
            border-(--landing-slot-tile-border)
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
          <div className="pointer-events-none absolute inset-0 blur-3xl bg-(--landing-slot-glow-primary)/25" />

          {/* label */}
          <div className="relative mb-2 flex items-center justify-center gap-2">
            <span className="h-px w-5 bg-(--landing-border) opacity-60" />
            <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-(--landing-muted-text)">
              {label}
            </span>
            <span className="h-px w-5 bg-(--landing-border) opacity-60" />
          </div>

          {/* grid */}
          <div
            className="
              relative
              grid grid-cols-3 grid-rows-3 gap-2
              rounded-2xl
              bg-(--landing-slot-bg)
              p-1.5
            "
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                if (cell === "name") {
                  // render name symbol (initials) – acts as WIN symbol
                  return (
                    <div
                      key={`cell-${r}-${c}`}
                      className="
                        aspect-square
                        flex items-center justify-center
                        rounded-xl border
                        bg-(--landing-slot-center-bg)
                        border-(--landing-slot-tile-border)
                        shadow-[0_0_10px_var(--landing-slot-glow-primary),inset_0_0_6px_rgba(0,0,0,0.08)]
                      "
                    >
                      <span className="text-2xl font-extrabold text-(--landing-slot-center-text)">
                        {initials}
                      </span>
                    </div>
                  );
                }

                const Icon = ICON_COMPONENTS[cell];

                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className="
                      aspect-square
                      flex items-center justify-center
                      rounded-xl border
                      bg-(--landing-slot-tile-bg)
                      border-(--landing-slot-tile-border)
                      shadow-[inset_0_0_4px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]
                    "
                  >
                    <Icon className={iconClass} />
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    );
  },
);
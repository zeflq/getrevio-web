"use client";
import type { GameData } from "./schema";

export function GameRenderer({ data }: { data: GameData }) {
  return <p className="text-sm text-muted-foreground">{data.ctaLabel || "Game block"}</p>;
}

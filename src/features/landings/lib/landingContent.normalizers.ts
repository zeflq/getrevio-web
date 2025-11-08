import type {
  LandingBlockInput,
  LandingBlockOutput,
  LandingContentInput,
  LandingContentOutput,
} from "../model/landingSchema";
import { createBlockByKind, createDefaultLandingContent } from "./landingContent.presets";

const trim = (value?: string | null) => (value ?? "").trim();

const normalizeSimpleHeroBlock = (
  block?: Partial<Extract<LandingBlockInput, { kind: "simpleHero" }>>
): Extract<LandingBlockOutput, { kind: "simpleHero" }> => ({
  kind: "simpleHero",
  title: trim(block?.title) || "New landing",
  subtitle: trim(block?.subtitle) || undefined,
});

const normalizeHeroWithCtaBlock = (
  block?: Partial<Extract<LandingBlockInput, { kind: "heroWithCta" }>>
): LandingBlockOutput => {
  const title = trim(block?.title) || "Hero title";
  const subtitle = trim(block?.subtitle) || undefined;

  const ctas = (block?.ctas ?? [])
    .slice(0, 2)
    .map((cta, index) => ({
      label: trim(cta?.label),
      url: trim(cta?.url),
      style: cta?.style ?? (index === 0 ? "primary" : "secondary"),
    }))
    .filter((cta) => cta.label && cta.url)
    .map((cta, index) => ({
      label: cta.label!,
      url: cta.url!,
      style: cta.style ?? (index === 0 ? "primary" : "secondary"),
    }));

  if (ctas.length === 0) {
    return normalizeSimpleHeroBlock({ title, subtitle });
  }

  return {
    kind: "heroWithCta",
    title,
    subtitle,
    ctas,
  };
};

const normalizeLegalTextBlock = (
  block?: Partial<Extract<LandingBlockInput, { kind: "legalText" }>>
): Extract<LandingBlockOutput, { kind: "legalText" }> => ({
  kind: "legalText",
  text:
    trim(block?.text) ||
    "By continuing, you agree to our terms of service and privacy policy.",
});

const normalizeGameBlock = (
  block?: Partial<Extract<LandingBlockInput, { kind: "game" }>>
): Extract<LandingBlockOutput, { kind: "game" }> => ({
  kind: "game",
  ctaLabel: trim(block?.ctaLabel) || undefined,
});

const normalizeBlock = (block?: LandingBlockInput | null): LandingBlockOutput => {
  switch (block?.kind) {
    case "heroWithCta":
      return normalizeHeroWithCtaBlock(block);
    case "legalText":
      return normalizeLegalTextBlock(block);
    case "game":
      return normalizeGameBlock(block);
    case "simpleHero":
      return normalizeSimpleHeroBlock(block);
    default:
      return createBlockByKind("simpleHero");
  }
};

export const ensureLandingContentShape = (
  content?: Partial<LandingContentInput> | null
): LandingContentOutput => {
  const base = createDefaultLandingContent();
  if (!content || !Array.isArray(content.blocks) || content.blocks.length === 0) {
    return base;
  }

  const normalizedBlocks = content.blocks
    .map((block) => normalizeBlock(block))
    .filter(Boolean) as LandingBlockOutput[];

  return {
    layout: content.layout ?? base.layout,
    blocks: normalizedBlocks.length > 0 ? normalizedBlocks : base.blocks,
  };
};

export const deriveContentWarnings = (
  content?: LandingContentOutput | null
): string[] => {
  if (!content) return [];
  const warnings: string[] = [];
  const gameBlocks = content.blocks.filter((block) => block.kind === "game").length;
  if (gameBlocks > 1) {
    warnings.push("Multiple game blocks may confuse users.");
  }
  return warnings;
};

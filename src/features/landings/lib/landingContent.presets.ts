import type {
  LandingBlockOutput,
  LandingContentOutput,
} from "../model/landingSchema";

export type SimpleHeroBlock = Extract<LandingBlockOutput, { kind: "simpleHero" }>;
export type HeroWithCtaBlock = Extract<LandingBlockOutput, { kind: "heroWithCta" }>;
export type LegalTextBlock = Extract<LandingBlockOutput, { kind: "legalText" }>;
export type GameBlock = Extract<LandingBlockOutput, { kind: "game" }>;

const trim = (value?: string | null) => (value ?? "").trim();

export const createSimpleHeroBlock = (overrides: Partial<SimpleHeroBlock> = {}): SimpleHeroBlock => ({
  kind: "simpleHero",
  title: trim(overrides.title) || "New landing",
  subtitle: trim(overrides.subtitle) || undefined,
});

export const createHeroWithCtaBlock = (
  overrides: Partial<HeroWithCtaBlock> = {}
): HeroWithCtaBlock => ({
  kind: "heroWithCta",
  title: trim(overrides.title) || "Hero title",
  subtitle: trim(overrides.subtitle) || undefined,
  ctas:
    overrides.ctas && overrides.ctas.length > 0
      ? overrides.ctas.map((cta, index) => ({
          label: trim(cta?.label) || (index === 0 ? "Primary CTA" : "Secondary CTA"),
          url: trim(cta?.url) || "https://example.com",
          style: cta?.style ?? (index === 0 ? "primary" : "secondary"),
        }))
      : [
          { label: "Primary CTA", url: "https://example.com", style: "primary" },
          { label: "Secondary CTA", url: "https://example.com/more", style: "secondary" },
        ],
});

export const createLegalTextBlock = (
  overrides: Partial<LegalTextBlock> = {}
): LegalTextBlock => ({
  kind: "legalText",
  text:
    trim(overrides.text) ||
    "By continuing, you agree to our terms of service and privacy policy.",
});

export const createGameBlock = (overrides: Partial<GameBlock> = {}): GameBlock => ({
  kind: "game",
  ctaLabel: trim(overrides.ctaLabel) || undefined,
});

export const createBlockByKind = (
  kind: LandingBlockOutput["kind"],
  overrides: Partial<LandingBlockOutput> = {}
): LandingBlockOutput => {
  switch (kind) {
    case "heroWithCta":
      return createHeroWithCtaBlock(overrides as Partial<HeroWithCtaBlock>);
    case "legalText":
      return createLegalTextBlock(overrides as Partial<LegalTextBlock>);
    case "game":
      return createGameBlock(overrides as Partial<GameBlock>);
    case "simpleHero":
    default:
      return createSimpleHeroBlock(overrides as Partial<SimpleHeroBlock>);
  }
};

export const createDefaultLandingContent = (): LandingContentOutput => ({
  layout: "full",
  blocks: [createSimpleHeroBlock()],
});

export const createDefaultBlocksForContext = (args?: {
  context?: "campaign" | "place";
}): LandingBlockOutput[] => {
  const blocks: LandingBlockOutput[] = [createSimpleHeroBlock()];

  if (args?.context === "campaign") {
    blocks.push(createGameBlock());
    blocks.push(createLegalTextBlock());
  }

  return blocks;
};

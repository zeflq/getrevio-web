"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useBlockChannel } from "@/features/landings/preview/BlockChannelContext";
import { TabPreview } from "../../ui/TabPreview";

type StepItem = {
  text: string;
  highlight?: string;
};

type SlideSteps = {
  kind: "steps";
  badge: string;
  title: string;
  subtitle?: string;
  icon?: string;
  steps: StepItem[];
  note?: string;
  buttonText: string;
};

type SlideInfo = {
  kind: "info";
  badge: string;
  title: string;
  highlight?: string;
  description?: string;
  icon?: string;
  buttonText: string;
  showTabIcon?: boolean;
};

type Slide = SlideSteps | SlideInfo;
type SocialVariant = "google" | "instagram";

export interface SocialActionDrawerRendererProps {
  variant: SocialVariant;
  url: string;
  i18nNamespace: string;
}

export function SocialActionDrawerRenderer({
  variant,
  url,
  i18nNamespace,
}: SocialActionDrawerRendererProps) {
  const { useListener } = useBlockChannel();
  const t = useTranslations(i18nNamespace);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const slides: Slide[] = React.useMemo(
    () => [
      {
        kind: "steps",
        badge: t("steps.badge"),
        title: t("steps.title"),
        subtitle: t("steps.subtitle"),
        icon: variant === "google" ? "⭐️" : "📸",
        steps: [
          {
            text: t("steps.items.0.text"),
            highlight: t("steps.items.0.highlight"),
          },
          {
            text: t("steps.items.1.text"),
            highlight: t("steps.items.1.highlight"),
          },
          {
            text: t("steps.items.2.text"),
            highlight: t("steps.items.2.highlight"),
          },
        ].filter((item) => item.text && item.text.trim().length > 0),
        note: t("steps.note"),
        buttonText: t("steps.buttonText"),
      },
      {
        kind: "info",
        badge: t("info.badge"),
        title: t("info.title"),
        highlight: t("info.highlight"),
        description: t("info.description"),
        icon: "📋",
        buttonText: t("info.buttonText"),
        showTabIcon: true,
      },
    ],
    [t, variant]
  );

  useListener("cta:primary-click", () => {
    setCurrentSlide(0);
    setOpen(true);
  });

  const closeDrawer = () => {
    setCurrentSlide(0);
    setOpen(false);
  };
  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  const handleButtonClick = () => {
    if (!isLastSlide) {
      setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      return;
    }
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    closeDrawer();
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && closeDrawer()}>
      <DrawerContent className="bg-[var(--landing-surface)] border-[var(--landing-border)]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{t("a11y.title")}</DrawerTitle>
            <DrawerDescription>{t("a11y.description")}</DrawerDescription>
          </DrawerHeader>

          <div className="p-5 pb-7 sm:p-6 sm:pb-8">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: "var(--landing-surface-soft)",
                  color: "var(--landing-muted-text)",
                }}
              >
                {slide.badge}
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--landing-muted-text)" }}>
                {t("stepIndicator", { current: currentSlide + 1, total: slides.length })}
              </span>
            </div>

            <div className="mb-5 flex justify-center sm:mb-6">
              <div
                className="flex h-32 w-32 items-center justify-center rounded-3xl sm:h-40 sm:w-40"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(250,204,21,0.16), transparent 50%), var(--landing-surface)",
                }}
              >
                {slide.kind === "info" && slide.showTabIcon ? (
                  <TabPreview />
                ) : (
                  <span className="text-4xl sm:text-5xl">{slide.icon ?? "⭐️"}</span>
                )}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {slide.kind === "steps" && (
                <>
                  <h2
                    className="text-center text-xl font-semibold sm:text-2xl"
                    style={{ color: "var(--landing-text)" }}
                  >
                    {slide.title}
                  </h2>
                  {slide.subtitle && slide.subtitle.trim().length > 0 && (
                    <p
                      className="text-center text-sm sm:text-base"
                      style={{ color: "var(--landing-muted-text)" }}
                    >
                      {slide.subtitle}
                    </p>
                  )}
                </>
              )}

              {slide.kind === "info" && (
                <>
                  <h2
                    className="text-center text-xl font-semibold sm:text-2xl"
                    style={{ color: "var(--landing-text)" }}
                  >
                    {slide.title}{" "}
                    {slide.highlight && (
                      <span style={{ color: "var(--landing-primary)" }}>{slide.highlight}</span>
                    )}
                  </h2>
                  {slide.description && (
                    <p
                      className="text-center text-sm sm:text-base"
                      style={{ color: "var(--landing-muted-text)" }}
                    >
                      {slide.description}
                    </p>
                  )}
                </>
              )}

              {slide.kind === "steps" && (
                <div
                  className="mt-2 space-y-3 rounded-2xl border px-3 py-3 sm:px-4 sm:py-4"
                  style={{ borderColor: "var(--landing-border)" }}
                >
                  {slide.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--landing-text)",
                          color: "var(--landing-background)",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <p className="text-sm sm:text-base" style={{ color: "var(--landing-text)" }}>
                        {step.text}
                        {step.highlight && (
                          <span className="font-semibold" style={{ color: "var(--landing-primary)" }}>
                            {step.highlight}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                  {slide.note && slide.note.trim().length > 0 && (
                    <p className="mt-1 text-xs sm:text-[13px]" style={{ color: "var(--landing-muted-text)" }}>
                      {slide.note}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              type="button"
              size="lg"
              onClick={handleButtonClick}
              className={cn(
                "mt-4 h-12 w-full px-6 py-5 text-base font-semibold sm:mt-8 sm:py-5 sm:text-lg",
                "flex items-center justify-center gap-2 rounded-full border-0 shadow-lg",
                "bg-[var(--landing-cta-bg)] text-[var(--landing-cta-text)] hover:bg-[var(--landing-cta-hover-bg)]"
              )}
            >
              {slide.buttonText}
              <span className="text-xl">→</span>
            </Button>

            <div className="mt-5 flex justify-center gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentSlide
                      ? "w-8 bg-[var(--landing-primary)] opacity-100"
                      : "w-2 bg-[var(--landing-muted-text)] opacity-40"
                  )}
                />
              ))}
            </div>

            <div
              className="mt-5 flex items-center justify-center gap-2 text-[11px] sm:text-xs"
              style={{ color: "var(--landing-muted-text)" }}
            >
              <span>{t("footer.rules")}</span>
              <span className="opacity-50">|</span>
              <span>{t("footer.poweredBy")}</span>
              <span className="font-semibold" style={{ color: "var(--landing-text)" }}>
                {t("footer.brand")}
              </span>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import * as React from "react";

const StepContext = React.createContext<{
  step: number;
  total: number;
  next: (delay?: number | string) => void;
  prev: () => void;
  goTo: (index: number) => void;
  isActive: (index: number) => boolean;
  isFirst: boolean;
  isLast: boolean;
  isTransitioning: boolean;
}>({
  step: 0,
  total: 0,
  next: () => {},
  prev: () => {},
  goTo: () => {},
  isActive: () => false,
  isFirst: true,
  isLast: true,
  isTransitioning: false,
});

export const StepProvider = ({
  children,
  total,
}: {
  children: React.ReactNode;
  total: number;
}) => {
  const [step, setStep] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  // cleanup timeout
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const parseDelay = (delay?: number | string): number => {
    if (delay == null) return 0;

    if (typeof delay === "number") {
      return Math.max(delay, 0);
    }

    const trimmed = delay.trim().toLowerCase();

    // "2s" -> seconds
    if (trimmed.endsWith("s")) {
      const num = Number(trimmed.slice(0, -1));
      return Number.isFinite(num) ? Math.max(num * 1000, 0) : 0;
    }

    // "200" or "200ms" -> ms
    if (trimmed.endsWith("ms")) {
      const num = Number(trimmed.slice(0, -2));
      return Number.isFinite(num) ? Math.max(num, 0) : 0;
    }

    const num = Number(trimmed);
    return Number.isFinite(num) ? Math.max(num, 0) : 0;
  };

  const next = React.useCallback(
    (delay?: number | string) => {
      if (step >= total - 1) return; // already on last

      const delayMs = parseDelay(delay);

      // no delay → instant, like before
      if (delayMs <= 0) {
        setStep((prev) => (prev < total - 1 ? prev + 1 : prev));
        return;
      }

      // avoid spam while transitioning
      if (isTransitioning) return;

      setIsTransitioning(true);

      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setStep((prev) => (prev < total - 1 ? prev + 1 : prev));
        setIsTransitioning(false);
      }, delayMs);
    },
    [step, total, isTransitioning]
  );

  const prev = React.useCallback(() => {
    if (isTransitioning) return; // optional: block prev during transition
    setStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, [isTransitioning]);

  const goTo = React.useCallback(
    (index: number) => {
      if (isTransitioning) return; // optional: block during transition
      const clamped = Math.min(Math.max(index, 0), total - 1);
      setStep(clamped);
    },
    [total, isTransitioning]
  );

  const isActive = (index: number) => step === index;

  const value = React.useMemo(
    () => ({
      step,
      total,
      next,
      prev,
      goTo,
      isActive,
      isFirst: step === 0,
      isLast: step === total - 1,
      isTransitioning,
    }),
    [step, total, next, prev, goTo, isTransitioning]
  );

  return <StepContext.Provider value={value}>{children}</StepContext.Provider>;
};

export const useStepController = () => React.useContext(StepContext);

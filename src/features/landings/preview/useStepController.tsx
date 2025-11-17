"use client";

import * as React from "react";

const StepContext = React.createContext<{
  step: number;
  total: number;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  isActive: (index: number) => boolean;
  isFirst: boolean;
  isLast: boolean;
}>({
  step: 0,
  total: 0,
  next: () => {},
  prev: () => {},
  goTo: () => {},
  isActive: () => false,
  isFirst: true,
  isLast: true,
});

export const StepProvider = ({
  children,
  total,
}: {
  children: React.ReactNode;
  total: number;
}) => {
  const [step, setStep] = React.useState(0);

  const next = () =>
    setStep((prev) => (prev < total - 1 ? prev + 1 : prev));

  const prev = () =>
    setStep((prev) => (prev > 0 ? prev - 1 : prev));

  const goTo = (index: number) =>
    setStep(Math.min(Math.max(index, 0), total - 1));

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
    }),
    [step, total]
  );

  return <StepContext.Provider value={value}>{children}</StepContext.Provider>;
};

export const useStepController = () => React.useContext(StepContext);

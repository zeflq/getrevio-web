import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type StepId = "organization" | "place";

type StepDescriptor = {
  id: StepId;
  title: string;
  description: string;
};

type Props = {
  steps: StepDescriptor[];
  activeStep: StepId;
  completedSteps: StepId[];
  onStepSelect?: (stepId: StepId) => void;
};

export function StepSidebar({ steps, activeStep, completedSteps, onStepSelect }: Props) {
  return (
    <nav>
      <div className="flex justify-center snap-x gap-2 overflow-x-auto px-4 py-3">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = step.id === activeStep;
          const isClickable = (isCompleted || step.id === activeStep) && onStepSelect;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepSelect?.(step.id)}
              className={cn(
                "flex min-w-[130px] snap-start items-center gap-3 rounded-full border px-4 py-2 text-sm transition",
                isActive && "border-primary bg-primary/10 text-primary",
                isCompleted && !isActive && "border-primary/60 text-primary",
                !isCompleted && !isActive && "border-border text-muted-foreground",
                isClickable ? "hover:bg-muted/70" : "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && !isCompleted && "border-primary text-primary",
                  !isCompleted && !isActive && "border-border text-muted-foreground"
                )}
                aria-hidden
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium leading-tight">{step.title}</span>
                <span className="hidden truncate text-xs text-muted-foreground sm:block">
                  {step.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

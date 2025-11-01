"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrganizationStepData } from "../model/organizationStepSchema";
import type { PlaceStepData } from "../model/placeStepSchema";
import { StepSidebar } from "./StepSidebar";
import { OrganizationStep } from "./steps/OrganizationStep";
import { PlaceStep } from "./steps/PlaceStep";

type StepId = "organization" | "place";

export type ShortlinkSummary = {
  id: string;
  code: string;
  targetPlaceId: string;
};

type StepDefinition = {
  id: StepId;
  title: string;
  description: string;
};

const steps: StepDefinition[] = [
  { id: "organization", title: "Organization", description: "Company basics" },
  { id: "place", title: "Place", description: "Add your first location" },
];

type Props = {
  initialOrganization?: OrganizationStepData;
  initialEmail?: string;
  initialPlace?: PlaceStepData | null;
  initialShortlink?: ShortlinkSummary | null;
};

function resolveInitialActiveStep(onboardingStep?: number): StepId {
  if (!onboardingStep || onboardingStep <= 0) {
    return "organization";
  }
  return "place";
}

function resolveInitialCompletedSteps(onboardingStep?: number, hasPlace?: boolean): StepId[] {
  const done: StepId[] = [];
  if (!onboardingStep || onboardingStep <= 0) {
    return done;
  }

  if (onboardingStep >= 1) {
    done.push("organization");
  }
  if (hasPlace || onboardingStep >= 3) {
    done.push("place");
  }

  return done;
}

export function OnboardingWizard({ initialOrganization, initialEmail, initialPlace, initialShortlink }: Props) {
  const shortUrlBase = (process.env.NEXT_PUBLIC_SHORT_URL_BASE ?? "").replace(/\/$/, "");
  const initialCompletion =
    Boolean(initialShortlink) ||
    Boolean(initialPlace?.id) ||
    ((initialOrganization?.onboardingStep ?? 0) >= 3);
  const [shortlink, setShortlink] = React.useState<ShortlinkSummary | null>(initialShortlink ?? null);
  const [activeStep, setActiveStep] = React.useState<StepId>(
    resolveInitialActiveStep(initialOrganization?.onboardingStep)
  );
  const [organization, setOrganization] = React.useState<OrganizationStepData | undefined>(
    initialOrganization
  );
  const [place, setPlace] = React.useState<PlaceStepData | null | undefined>(initialPlace ?? null);
  const [completedSteps, setCompletedSteps] = React.useState<StepId[]>(
    initialCompletion
      ? ["organization", "place"]
      : resolveInitialCompletedSteps(
          initialOrganization?.onboardingStep,
          Boolean(initialPlace?.id || initialShortlink)
        )
  );
  const [isComplete, setIsComplete] = React.useState<boolean>(initialCompletion);

  const handleOrganizationComplete = React.useCallback(
    (payload: { organization: OrganizationStepData }) => {
      setOrganization(payload.organization);
      setCompletedSteps((prev) =>
        prev.includes("organization") ? prev : [...prev, "organization"]
      );
      setActiveStep("place");
    },
    []
  );

  const handlePlaceComplete = React.useCallback(
    (payload: { place: PlaceStepData; organization: OrganizationStepData; shortlink: ShortlinkSummary | null }) => {
      setOrganization(payload.organization);
      setPlace(payload.place);
      setShortlink(payload.shortlink);
      setCompletedSteps((prev) => {
        const completed = new Set<StepId>(prev);
        completed.add("organization");
        completed.add("place");
        return steps
          .map((step) => step.id)
          .filter((id) => completed.has(id)) as StepId[];
      });
      setIsComplete(true);
    },
    []
  );

  const currentStep = steps.find((step) => step.id === activeStep) ?? steps[0];

  const renderCompletionCard = () => (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <h3 className="text-lg font-semibold">You&apos;re all set!</h3>
        {shortlink ? (
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-base">
              {shortUrlBase ? `${shortUrlBase}/${shortlink.code}` : shortlink.code}
            </div>
            <p className="text-muted-foreground">
              You can manage or customize this shortlink anytime from the Shortlinks section of the dashboard.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your organization and place are ready. You can now explore the dashboard.
          </p>
        )}
      </div>
  );

  if (isComplete) {
    return (
      <div className="flex flex-col gap-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">You&apos;re ready to go</h1>
          <p className="text-muted-foreground">
            Your onboarding is complete. Share your shortlink or head to the dashboard.
          </p>
        </header>
        {renderCompletionCard()}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Let&apos;s get you set up</h1>
        <p className="text-muted-foreground">
          Complete the steps below to finish your Reviw onboarding.
        </p>
      </header>

      <div className="-mx-2 sm:mx-0">
        <StepSidebar
          steps={steps}
          activeStep={activeStep}
          completedSteps={completedSteps}
          onStepSelect={(stepId) => {
            if (completedSteps.includes(stepId)) {
              setActiveStep(stepId);
            }
          }}
        />
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">
            {currentStep.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {currentStep.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeStep === "organization" ? (
            <OrganizationStep
              onComplete={handleOrganizationComplete}
              defaultValues={organization ?? (initialEmail ? { name: "", email: initialEmail } : undefined)}
              organizationId={organization?.id}
            />
          ) : activeStep === "place" ? (
            <PlaceStep
              organizationId={organization?.id}
              defaultValues={place ?? undefined}
              onComplete={handlePlaceComplete}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

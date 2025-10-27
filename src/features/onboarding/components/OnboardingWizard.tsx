"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepSidebar } from "./StepSidebar";
import { OrganizationStep } from "./steps/OrganizationStep";
import type { OrganizationStepData } from "../model/organizationStepSchema";

type StepId = "organization" | "theme" | "place" | "shortlink" | "review";

type StepDefinition = {
  id: StepId;
  title: string;
  description: string;
};

const steps: StepDefinition[] = [
  { id: "organization", title: "Organization", description: "Company basics" },
  { id: "theme", title: "Brand", description: "Look & feel" },
  { id: "place", title: "Place", description: "Add your first location" },
  { id: "shortlink", title: "Shortlink", description: "Prepare your default link" },
  { id: "review", title: "Review", description: "Wrap-up" },
];

type Props = {
  initialOrganization?: OrganizationStepData;
  initialEmail?: string;
};

export function OnboardingWizard({ initialOrganization, initialEmail }: Props) {
  const [activeStep, setActiveStep] = React.useState<StepId>("organization");
  const [organization, setOrganization] = React.useState<OrganizationStepData | undefined>(
    initialOrganization
  );
  const [completedSteps, setCompletedSteps] = React.useState<StepId[]>(
    initialOrganization ? ["organization"] : []
  );

  const handleOrganizationComplete = React.useCallback(
    (payload: { organization: OrganizationStepData }) => {
      setOrganization(payload.organization);
      setCompletedSteps((prev) =>
        prev.includes("organization") ? prev : [...prev, "organization"]
      );
      setActiveStep("theme");
    },
    []
  );

  const currentStep = steps.find((step) => step.id === activeStep) ?? steps[0];

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Let&apos;s get you set up</h1>
          <p className="text-muted-foreground">
            Complete the steps below to finish your Reviw onboarding.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
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

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                {currentStep.title}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {currentStep.description}
              </p>
            </CardHeader>
            <CardContent>
              {activeStep === "organization" ? (
                <OrganizationStep
                  onComplete={handleOrganizationComplete}
                  defaultValues={organization ?? (initialEmail ? { name: "", email: initialEmail } : undefined)}
                  organizationId={organization?.id}
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center text-center text-muted-foreground">
                  <div>
                    <p className="font-medium">This step isn&apos;t ready yet.</p>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll unlock it once the previous step is fully implemented.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

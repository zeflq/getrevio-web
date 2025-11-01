"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { OrganizationStepData } from "../model/organizationStepSchema";
import type { PlaceStepData } from "../model/placeStepSchema";
import type { ShortlinkSummary } from "./OnboardingWizard";
import { OnboardingWizard } from "./OnboardingWizard";

type Props = {
  initialOrganization?: OrganizationStepData;
  initialEmail?: string;
  initialPlace?: PlaceStepData | null;
  initialShortlink?: ShortlinkSummary | null;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function OnboardingWizardModal({
  initialOrganization,
  initialEmail,
  initialPlace,
  initialShortlink,
  open,
  onOpenChange,
}: Props) {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setIsOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl lg:max-w-4xl p-2">
        <div className="mx-auto w-full py-2">
          <OnboardingWizard
            initialOrganization={initialOrganization}
            initialEmail={initialEmail}
            initialPlace={initialPlace}
            initialShortlink={initialShortlink}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

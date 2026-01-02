import { EditSection } from "@/shared/ui/EditSection";
import { LandingFormFields } from "./LandingFormFields";
import type { LiteListe } from "@/types/lists";

type Props = {
  isSubmitting: boolean;
  tenantId: string | null;
  landing: any;
};

export function LandingSettingsTab({ isSubmitting, tenantId, landing }: Props) {
  return (
    <div className="space-y-4">
      <EditSection>
        <LandingFormFields
          isEdit
          disabled={isSubmitting}
          merchantId={tenantId ?? landing?.merchantId}
          merchantsLite={[] as LiteListe[]}
        />
      </EditSection>
    </div>
  );
}

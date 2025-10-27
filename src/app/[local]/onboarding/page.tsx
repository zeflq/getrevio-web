// app/[local]/onboarding/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";
import type { OrganizationStepData } from "@/features/onboarding/model/organizationStepSchema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const sessionResult = await getServerSession();
  if (!sessionResult) {
    redirect("/login");
  }

  const { session, user } = sessionResult;
  const headersList = await headers();

  const activeOrganizationId =
    session.activeOrganizationId ?? null;

  let organization: OrganizationStepData | undefined;
  if(activeOrganizationId) {
    const fullOrg = await auth.api.getFullOrganization({ 
      headers:headersList, query: { organizationId:activeOrganizationId } 
    });

    organization = fullOrg
      ? {
          id: fullOrg.id,
          name: fullOrg.name ?? "",
          email: fullOrg.email ?? undefined,
          onboardingStep:
            typeof (fullOrg as { onboardingStep?: number }).onboardingStep === "number"
              ? (fullOrg as { onboardingStep?: number }).onboardingStep
              : undefined,
        }
      : undefined;
  }



  return <OnboardingWizard initialOrganization={organization} initialEmail={user?.email ?? undefined}/>;
}

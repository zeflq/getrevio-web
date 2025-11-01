// app/(merchant)/m/layout.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { MerchantSidebar } from "@/components/merchant-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OnboardingWizardModal } from "@/features/onboarding/components/OnboardingWizardModal";
import type { OrganizationStepData } from "@/features/onboarding/model/organizationStepSchema";
import type { PlaceStepData } from "@/features/onboarding/model/placeStepSchema";
import { getTenantFirstPlaceServer } from "@/features/places/server/interface/queries";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const sessionResult = await getServerSession();
  if (!sessionResult?.user) redirect("/login"); // minimal guard; add merchant role checks if needed

  const { session, user } = sessionResult;
  const headersList = await headers();
  const activeOrganizationId = session?.activeOrganizationId ?? null;

  let organization: OrganizationStepData | undefined;
  if (activeOrganizationId) {
    const fullOrg = await auth.api.getFullOrganization({
      headers: headersList,
      query: { organizationId: activeOrganizationId },
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

  let place: PlaceStepData | null = null;
  if (organization?.id) {
    const firstPlace = await getTenantFirstPlaceServer(organization.id);
    place = firstPlace
      ? {
          id: firstPlace.id,
          localName: firstPlace.localName ?? "",
          address: firstPlace.address ?? undefined,
          googlePlaceId: firstPlace.googlePlaceId ?? undefined,
        }
      : null;
  }

  const onboardingStepValue = organization?.onboardingStep ?? 0;
  const initialCompletion = Boolean(place?.id) || onboardingStepValue >= 3;
  const shouldShowOnboarding = !initialCompletion;

  return (
    <SidebarProvider>
      <MerchantSidebar base="/m" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            {/* Breadcrumb here if you want */}
          </div>
          <LanguageSwitcher className="px-4" />
        </header>
        {children}
      </SidebarInset>
      <OnboardingWizardModal
        open={shouldShowOnboarding}
        initialOrganization={organization}
        initialEmail={user?.email ?? undefined}
        initialPlace={place}
      />
    </SidebarProvider>
  );
}

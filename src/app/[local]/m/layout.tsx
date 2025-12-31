// app/(merchant)/m/layout.tsx
import { redirect } from "next/navigation";

import { MerchantSidebar } from "@/components/merchant-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/auth/server";
import { OnboardingModal } from "@/features/onboarding/components/OnboardingModal";

export const dynamic = "force-dynamic";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const sessionResult = await getSession();
  if (!sessionResult?.user) redirect("/login");
  // Check if user needs onboarding (no active organization)
  const activeOrganizationId = sessionResult?.session?.activeOrganizationId;
  const shouldShowOnboarding = !activeOrganizationId;
  const organizationName = sessionResult.merchant?.name;
  const organizationPlan = sessionResult.merchant?.plan;

  return (
    <SidebarProvider>
      <MerchantSidebar
        base="/m"
        organizationName={organizationName}
        plan={organizationPlan}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            {/* Breadcrumb here if you want */}
          </div>
          <div className="flex items-center gap-2 px-4">
            <LanguageSwitcher />
            <Separator orientation="vertical" className="h-4" />
            <ThemeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>

      {/* Onboarding Modal - shows when user has no active organization */}
      <OnboardingModal
        open={shouldShowOnboarding}
        userEmail={sessionResult.user.email}
      />
    </SidebarProvider>
  );
}

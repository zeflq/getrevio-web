// app/(merchant)/m/layout.tsx
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MerchantSidebar } from "@/components/merchant-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login"); // minimal guard; add merchant role checks if needed

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
    </SidebarProvider>
  );
}

// app/(admin)/admin/layout.tsx
import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AdminBreadcrumb } from "@/features/admin/components/admin-breadcrumb";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { SUPER_ADMIN } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.globalRole !== SUPER_ADMIN) redirect("/");

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <AdminBreadcrumb />
          </div>
          <LanguageSwitcher className="px-4" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

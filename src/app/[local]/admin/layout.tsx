import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminBreadcrumb } from "@/features/admin/components/admin-breadcrumb";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
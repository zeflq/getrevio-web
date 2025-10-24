"use client"

import { CalendarDays, Command, LayoutDashboard, Link2, MapPin, Megaphone } from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { UserProfileInline } from "./user-profile-inline"
import { useSidebarUser } from "@/components/use-sidebar-user"
import { Link } from "@/i18n/navigation"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "@/i18n/navigation"
import { RevioGlyph } from "./RevioLogo"

export function MerchantSidebar({ base, ...props }: React.ComponentProps<typeof Sidebar> & { base: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useSidebarUser()

  const navMain = [
    { title: "Dashboard", url: `${base}`, icon: LayoutDashboard },
    { title: "Places", url: `${base}/places`, icon: MapPin },
    { title: "Campaigns", url: `${base}/campaigns`, icon: Megaphone },
    { title: "Shortlinks", url: `${base}/shortlinks`, icon: Link2 },
    { title: "Events", url: `${base}/events`, icon: CalendarDays },
  ].map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
  }))

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={base} className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <RevioGlyph className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="truncate font-normal">
                    <span className="font-bold">R</span>evio
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <UserProfileInline
          user={user}
          onLogout={() =>
            signOut({
              fetchOptions: {
                onSuccess: () => router.push("/login"),
              },
            })
          }
        />
      </SidebarFooter>
    </Sidebar>
  )
}

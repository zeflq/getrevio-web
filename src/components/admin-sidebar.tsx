"use client"

import {
  CalendarDays,
  Command,
  LayoutDashboard,
  Link2,
  MapPin,
  Megaphone,
  Settings2,
  Users,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserProfileInline } from "./user-profile-inline"
import { Link } from "@/i18n/navigation"
import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth-client"
import { useSidebarUser } from "@/components/use-sidebar-user"
import { RevioGlyph } from "./RevioLogo"

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter();
  const { user: currentUser } = useSidebarUser();
  const baseNav = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Merchants", url: "/admin/merchants", icon: Users },
    { title: "Places", url: "/admin/places", icon: MapPin },
    { title: "Campaigns", url: "/admin/campaigns", icon: Megaphone },
    { title: "Shortlinks", url: "/admin/shortlinks", icon: Link2 },
    { title: "Events", url: "/admin/events", icon: CalendarDays },
    { title: "Settings", url: "/admin/settings", icon: Settings2 },
  ] as const

  const navMain = baseNav.map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
  }))

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" className="flex items-center gap-0">
                <div className="bg-black text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <RevioGlyph className="size-4 bg-black" />
                </div>
                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="truncate font-normal">
                    <span className="font-bold">evio</span>
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
          user={currentUser}
          onLogout={()=>signOut(
            {
              fetchOptions: {
              onSuccess: () => {
                router.push("/login");
              },
            },
            }
          )}
          // If your component supports actions, you can pass a logout:
          // actions={[{ label: "Logout", onClick: () => signOut() }]}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

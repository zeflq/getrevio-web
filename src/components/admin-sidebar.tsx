"use client"

import * as React from "react"
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

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = {
    name: "Admin",
    email: "admin@getrevio.app",
    avatar: "/avatars/shadcn.jpg",
  }

  const navMain = [
    { title: "Dashboard", url: "/admin" , icon: LayoutDashboard, isActive: true },
    { title: "Merchants", url: "/admin/merchants", icon: Users },
    { title: "Places", url: "/admin/places", icon: MapPin },
    { title: "Campaigns", url: "/admin/campaigns", icon: Megaphone },
    { title: "Shortlinks", url: "/admin/shortlinks", icon: Link2 },
    { title: "Events", url: "/admin/events", icon: CalendarDays },
    { title: "Settings", url: "/admin/settings", icon: Settings2 },
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Admin</span>
                  <span className="truncate text-xs">Dashboard</span>
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
        <UserProfileInline user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
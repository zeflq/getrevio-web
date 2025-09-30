"use client"

import * as React from "react"
import { CalendarDays, Command, LayoutDashboard, Link2, MapPin, Megaphone } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { UserProfileInline } from "./user-profile-inline"

export function MerchantSidebar({ base, ...props }: React.ComponentProps<typeof Sidebar> & { base: string }) {
  const user = {
    name: "Merchant",
    email: "merchant@getrevio.app",
    avatar: "/avatars/shadcn.jpg",
  }

  const navMain = [
    { title: "Dashboard", url: `${base}`, icon: LayoutDashboard, isActive: true },
    { title: "Places", url: `${base}/places`, icon: MapPin },
    { title: "Campaigns", url: `${base}/campaigns`, icon: Megaphone },
    { title: "Shortlinks", url: `${base}/shortlinks`, icon: Link2 },
    { title: "Events", url: `${base}/events`, icon: CalendarDays },
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={base}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="truncate font-normal">
                    <span className="font-bold">R</span>evio
                  </span>
                </div>
              </a>
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
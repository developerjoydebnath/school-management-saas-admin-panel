"use client"

import { Logo } from "@/shared/components/custom/logo"
import { NavMain } from "@/shared/components/custom/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar
} from "@/shared/components/ui/sidebar"
import * as React from "react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 flex flex-row items-center justify-center px-4 bg-background">
        <Logo containerClassName="justify-center" small={state === "collapsed"} />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="bg-background p-4 border-t border-border flex items-center justify-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Super Admin
        </span>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

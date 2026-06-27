"use client";

import { Logo } from "@/shared/components/custom/logo";
import { NavMain } from "@/shared/components/custom/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	useSidebar,
} from "@/shared/components/ui/sidebar";
import * as React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader className="bg-popover flex h-14 flex-row items-center justify-center">
				<Logo containerClassName="justify-center" small={state === "collapsed"} />
			</SidebarHeader>
			<SidebarContent className="bg-popover">
				<NavMain />
			</SidebarContent>
			<SidebarFooter className="bg-popover border-border flex items-center justify-center border-t p-4">
				<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
					Super Admin
				</span>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

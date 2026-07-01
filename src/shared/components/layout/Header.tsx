"use client";

import { LanguageSwitcher } from "@/shared/components/custom/LanguageSwitcher";
import { NavUser } from "@/shared/components/custom/nav-user";
import { SessionSwitcher } from "@/shared/components/custom/SessionSwitcher";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import Link from "next/link";
import React from "react";

export default function Header() {
	const { breadcrumbs } = useBreadcrumbStore();

	const data = {
		user: {
			name: "Admin User",
			email: "admin@stackrover.io",
			avatar: "",
			role: "Super Admin",
		},
	};

	return (
		<header className="bg-popover sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b px-4">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<Separator orientation="vertical" className="my-auto mr-2 h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbs.map((crumb, index) => {
							const isLast = index === breadcrumbs.length - 1;
							return (
								<React.Fragment key={index}>
									<BreadcrumbItem className="hidden md:block">
										{isLast ? (
											<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
										) : crumb.href ? (
											<BreadcrumbLink asChild>
												<Link href={crumb.href}>{crumb.label}</Link>
											</BreadcrumbLink>
										) : (
											<span className="text-muted-foreground">
												{crumb.label}
											</span>
										)}
									</BreadcrumbItem>
									{!isLast && <BreadcrumbSeparator className="hidden md:block" />}
								</React.Fragment>
							);
						})}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
			<div className="flex items-center gap-2 sm:gap-4">
				<SessionSwitcher />
				<Separator orientation="vertical" className="my-auto h-4" />
				<LanguageSwitcher />
				<NavUser user={data.user} />
			</div>
		</header>
	);
}

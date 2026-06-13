"use client";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
	SidebarMenu as ShadcnSidebarMenu,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/shared/components/ui/sidebar";
import { SidebarMenu, SidebarMenuType } from "@/shared/configs/route.config";
import { useMenuStateStore } from "@/shared/stores/menu-state-store";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function NavMain() {
	const items = SidebarMenu;
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Menu</SidebarGroupLabel>
			<ShadcnSidebarMenu>
				{items.map((item) => (
					<RecursiveMenuItem key={item.id} item={item} level={0} />
				))}
			</ShadcnSidebarMenu>
		</SidebarGroup>
	);
}

function RecursiveMenuItem({ item, level }: { item: SidebarMenuType; level: number }) {
	const { unfoldedMenus, toggleMenu } = useMenuStateStore();
	const pathname = usePathname();
	const router = useRouter();
	const { setOpenMobile, isMobile, state, setOpen } = useSidebar();
	const t = useTranslations("Navigation");

	const hasChildren = item.children && item.children.length > 0;
	const isOpen = unfoldedMenus.includes(item.id);

	// Find if active mapping logic
	const isActive = item.matchPaths?.some((p) => pathname.startsWith(p)) || false;

	const handleNavigate = (e: React.MouseEvent) => {
		// Only intercept link pushes if it's a terminal node
		if (!hasChildren) {
			e.preventDefault();
			if (item.resetStore) {
				item.resetStore();
			}

			// Auto-close sidebar on mobile after clicking a deep link
			if (isMobile) {
				setOpenMobile(false);
			}

			router.push(item.path);
		}
	};

	// If node has children, render as collapsible
	if (hasChildren) {
		return (
			<Collapsible
				open={isOpen}
				onOpenChange={(open) => {
					if (state === "collapsed") {
						setOpen?.(true);
						toggleMenu(item.id, false);
					} else {
						toggleMenu(item.id, open);
					}
				}}
				className="group/collapsible"
			>
				<SidebarMenuItem>
					<CollapsibleTrigger
						render={
							<SidebarMenuButton
								tooltip={t(item.name)}
								isActive={isActive}
								className={`h-auto rounded-none border-l-4 px-4 py-2.5 ${isActive ? "border-primary bg-sidebar-accent" : "border-transparent"}`}
							>
								{item.icon && <item.icon className="size-3.5!" />}
								<span className="text-xs font-medium tracking-wide">
									{t(item.name)}
								</span>
								<ChevronRight
									className={`ml-auto transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
								/>
							</SidebarMenuButton>
						}
					/>
					<CollapsibleContent>
						<SidebarMenuSub className="mr-0 border-none pr-0">
							{item.children!.map((subItem) => (
								<RecursiveMenuItem
									key={subItem.id}
									item={subItem}
									level={level + 1}
								/>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		);
	}

	// If terminal node, render direct links.
	if (level === 0) {
		return (
			<SidebarMenuItem>
				<SidebarMenuButton
					tooltip={t(item.name)}
					isActive={isActive}
					onClick={handleNavigate}
					render={<Link href={item.path} onClick={(e) => e.preventDefault()} />}
					className={`h-auto rounded-none border-l-4 px-4 py-2.5 ${isActive ? "border-primary bg-sidebar-accent" : "border-transparent"}`}
				>
					{item.icon && <item.icon className="size-3.5!" />}
					<span className="text-xs font-medium tracking-wide">{t(item.name)}</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	// Sub level terminal node
	return (
		<SidebarMenuSubItem>
			<SidebarMenuSubButton
				isActive={isActive}
				onClick={handleNavigate}
				render={<Link href={item.path} onClick={(e) => e.preventDefault()} />}
				className={`h-auto rounded-none border-l-4 px-4 py-2.5 ${isActive ? "border-primary bg-sidebar-accent" : "border-transparent"}`}
			>
				{item.icon && <item.icon className="size-3.5! scale-90" />}
				<span className="text-xs tracking-wide">{t(item.name)}</span>
			</SidebarMenuSubButton>
		</SidebarMenuSubItem>
	);
}

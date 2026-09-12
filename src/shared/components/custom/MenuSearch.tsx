"use client";

import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/shared/components/ui/command";
import { Kbd, KbdGroup } from "@/shared/components/ui/kbd";
import { SidebarMenu, SidebarMenuType } from "@/shared/configs/route.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { hasAccess } from "@/shared/utils/permission";
import { CornerDownLeft, History, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type FlatMenuEntry = {
	id: string;
	name: string;
	path: string;
	icon: SidebarMenuType["icon"];
	permissions: string[];
	parentName?: string;
};

// Only leaf items are navigable — parent nodes in SidebarMenu are pure
// collapsible triggers (see nav-main.tsx: handleNavigate skips items that
// have children), so a parent's own `path` isn't a real destination.
function flattenMenu(items: SidebarMenuType[], parentName?: string): FlatMenuEntry[] {
	return items.flatMap((item) => {
		if (item.children && item.children.length > 0) {
			return flattenMenu(item.children, item.name);
		}
		return [
			{
				id: item.id,
				name: item.name,
				path: item.path,
				icon: item.icon,
				permissions: item.permissions,
				parentName,
			},
		];
	});
}

const FLAT_MENU = flattenMenu(SidebarMenu);
const RECENT_STORAGE_KEY = "menu-search-recent";
const MAX_RECENT = 5;

function readRecentIds(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const parsed = JSON.parse(window.localStorage.getItem(RECENT_STORAGE_KEY) || "[]");
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function writeRecentIds(ids: string[]) {
	try {
		window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(ids));
	} catch {
		// Ignore storage failures (private browsing, quota, etc.)
	}
}

export function MenuSearch() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [recentIds, setRecentIds] = useState<string[]>([]);
	const router = useRouter();
	const t = useTranslations("Navigation");
	const tSearch = useTranslations("MenuSearch");
	const { user } = useAuthStore((state) => state.auth);

	useEffect(() => {
		if (open) setRecentIds(readRecentIds());
		else setQuery("");
	}, [open]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const menuItems = useMemo(
		() => FLAT_MENU.filter((item) => hasAccess(user, item.permissions)),
		[user]
	);
	const menuById = useMemo(() => new Map(menuItems.map((item) => [item.id, item])), [menuItems]);

	const isIdle = query.trim().length === 0;
	const recentItems = isIdle
		? recentIds.map((id) => menuById.get(id)).filter((item): item is FlatMenuEntry => Boolean(item))
		: [];
	const recentIdSet = new Set(recentItems.map((item) => item.id));
	const listedMenuItems = isIdle
		? menuItems.filter((item) => !recentIdSet.has(item.id))
		: menuItems;

	const handleSelect = (item: FlatMenuEntry) => {
		const nextRecent = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, MAX_RECENT);
		setRecentIds(nextRecent);
		writeRecentIds(nextRecent);
		setOpen(false);
		router.push(item.path);
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="border-input/60 bg-input/30 text-muted-foreground hover:bg-input/50 hover:text-foreground hidden h-8 w-56 items-center gap-2 rounded-lg border px-2.5 text-xs transition-colors sm:flex"
			>
				<SearchIcon className="size-3.5 shrink-0" />
				<span className="flex-1 text-left">{tSearch("placeholder")}</span>
				<KbdGroup>
					<Kbd>⌘</Kbd>
					<Kbd>K</Kbd>
				</KbdGroup>
			</button>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-lg sm:hidden"
			>
				<SearchIcon className="size-4" />
				<span className="sr-only">{tSearch("placeholder")}</span>
			</button>

			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				title={tSearch("dialogTitle")}
				description={tSearch("dialogDescription")}
				className="sm:max-w-lg"
			>
				<Command>
					<CommandInput
						value={query}
						onValueChange={setQuery}
						placeholder={tSearch("inputPlaceholder")}
					/>
					<CommandList className="max-h-80 p-1">
						<CommandEmpty className="text-muted-foreground py-8 text-center text-sm">
							{tSearch("noResults")}
						</CommandEmpty>

						{recentItems.length > 0 && (
							<CommandGroup heading={tSearch("recent")}>
								{recentItems.map((item) => (
									<CommandItem
										key={`recent-${item.id}`}
										value={`recent ${t(item.name)} ${item.parentName ? t(item.parentName) : ""}`}
										onSelect={() => handleSelect(item)}
									>
										<div className="flex min-w-0 flex-1 items-center gap-2">
											<History className="text-muted-foreground" />
											<span className="truncate">{t(item.name)}</span>
										</div>
										{item.parentName && (
											<span className="text-muted-foreground text-xs">
												{t(item.parentName)}
											</span>
										)}
									</CommandItem>
								))}
							</CommandGroup>
						)}

						<CommandGroup heading={tSearch("menu")}>
							{listedMenuItems.map((item) => (
								<CommandItem
									key={item.id}
									value={`${t(item.name)} ${item.parentName ? t(item.parentName) : ""}`}
									onSelect={() => handleSelect(item)}
								>
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<item.icon className="text-muted-foreground" />
										<span className="truncate">{t(item.name)}</span>
									</div>
									{item.parentName && (
										<span className="text-muted-foreground text-xs">
											{t(item.parentName)}
										</span>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>

				<div className="text-muted-foreground flex items-center gap-4 border-t px-3 py-2 text-[11px]">
					<span className="flex items-center gap-1.5">
						<KbdGroup>
							<Kbd>↑</Kbd>
							<Kbd>↓</Kbd>
						</KbdGroup>
						{tSearch("toNavigate")}
					</span>
					<span className="flex items-center gap-1.5">
						<Kbd>
							<CornerDownLeft className="size-3" />
						</Kbd>
						{tSearch("toSelect")}
					</span>
					<span className="flex items-center gap-1.5">
						<Kbd>Esc</Kbd>
						{tSearch("toDismiss")}
					</span>
				</div>
			</CommandDialog>
		</>
	);
}

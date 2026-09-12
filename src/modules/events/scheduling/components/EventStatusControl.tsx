"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Badge } from "@/shared/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
	EventStatusEnum,
	eventStatusColors,
	eventStatusOptions,
	SchoolEvent,
} from "../dto/event.dto";
import { updateEventStatus } from "../hooks/use-event-mutations";

type Props = {
	event: SchoolEvent;
	/** Rendered flush in a table cell, or compact in the calendar rail. */
	size?: "default" | "sm";
	className?: string;
};

/**
 * Inline status change, so moving an event from Draft to Scheduled does not
 * mean opening the whole form.
 *
 * It hits a dedicated `PATCH /events/:id/status` rather than the full PUT: the
 * PUT rebuilds every field from its payload, so driving it from a dropdown
 * would need the entire event on hand and would blank anything not resent.
 *
 * Without edit permission this degrades to the plain badge it replaces, rather
 * than an control that only fails on click.
 */
export default function EventStatusControl({ event, size = "default", className }: Props) {
	const t = useTranslations("Events");
	const [isSaving, setIsSaving] = useState(false);
	const colors = eventStatusColors[event.status];

	const change = async (status: EventStatusEnum) => {
		if (status === event.status) return;
		setIsSaving(true);
		try {
			const response = await updateEventStatus(event.id, status);
			// The API reports whether the change actually triggered the
			// announcement, so the toast can say so instead of leaving the admin
			// wondering whether a few hundred emails just went out.
			toast.success(
				response?.data?.notifying
					? t("statusChangedAndNotified")
					: t("statusChangeSuccess")
			);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	const badge = (
		<Badge
			className={cn(
				"border-transparent font-normal",
				size === "sm" && "text-[10px]",
				colors?.bg,
				colors?.text,
				className
			)}
		>
			{t(`statusValue.${event.status}`)}
		</Badge>
	);

	return (
		<PermissionGuard
			permissions={[
				PERMISSIONS.EVENTS.ALL,
				PERMISSIONS.EVENTS.SCHEDULING.ALL,
				PERMISSIONS.EVENTS.SCHEDULING.EDIT,
			]}
			fallback={badge}
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild disabled={isSaving}>
					<button
						type="button"
						// The rail rows and table rows around this have their own click
						// targets; the status control must not trigger them.
						onClick={(e) => e.stopPropagation()}
						className={cn(
							"inline-flex cursor-pointer items-center gap-1 rounded-md transition-opacity hover:opacity-80 disabled:opacity-60",
							className
						)}
						aria-label={t("changeStatus")}
					>
						{badge}
						{isSaving ? (
							<Loader2 className="text-muted-foreground size-3 animate-spin" />
						) : (
							<ChevronDown className="text-muted-foreground size-3" />
						)}
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
					<DropdownMenuLabel className="text-xs">{t("changeStatus")}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{eventStatusOptions.map((option) => {
						const optionColors = eventStatusColors[option.value];
						const active = option.value === event.status;
						return (
							<DropdownMenuItem
								key={option.value}
								className="cursor-pointer gap-2"
								onSelect={() => void change(option.value)}
							>
								<span className={cn("size-2 rounded-full", optionColors?.bg)} />
								<span className="flex-1">{t(`statusValue.${option.value}`)}</span>
								{active && <Check className="size-3.5" />}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		</PermissionGuard>
	);
}

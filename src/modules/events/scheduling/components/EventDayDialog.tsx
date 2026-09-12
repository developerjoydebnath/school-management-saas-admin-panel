"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import { Clock, MapPin, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
	eventCategoryColors,
	eventStatusColors,
	EventStatusEnum,
	SchoolEvent,
} from "../dto/event.dto";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The clicked day, as YYYY-MM-DD. */
	date: string | null;
	/** Every event covering that day, in calendar order. */
	events: SchoolEvent[];
	onEditEvent: (event: SchoolEvent) => void;
	onAddEvent: (date: string) => void;
};

const formatRange = (start: string, end: string) => {
	const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
	const startLabel = formatter.format(new Date(start));
	if (start.slice(0, 10) === end.slice(0, 10)) return startLabel;
	return `${startLabel} - ${formatter.format(new Date(end))}`;
};

/**
 * One click per day, matching the academic calendar.
 *
 * The cell no longer has to decide whether the pointer landed on an event pill
 * or the empty space around it: the day opens this, which lists what is already
 * scheduled and offers to add another. It also makes the day's full list
 * reachable on touch, where the old hover-only "+2 more" popover was not.
 */
export default function EventDayDialog({
	open,
	onOpenChange,
	date,
	events,
	onEditEvent,
	onAddEvent,
}: Props) {
	const t = useTranslations("Events");
	const locale = useLocale();

	if (!date) return null;

	const heading = new Intl.DateTimeFormat(locale, {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00.000Z`));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle>{heading}</DialogTitle>
					<DialogDescription>
						{events.length
							? t("dayDialogCount", { count: events.length })
							: t("dayDialogEmptyDescription")}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
					{events.length ? (
						events.map((event) => {
							const colors = eventCategoryColors[event.category];
							const status = eventStatusColors[event.status];
							const cancelled = event.status === EventStatusEnum.CANCELLED;
							const time = [event.startTime, event.endTime].filter(Boolean).join(" - ");
							return (
								<button
									key={event.id}
									type="button"
									onClick={() => onEditEvent(event)}
									className="hover:bg-accent/40 flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors"
								>
									<span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", colors.dot)} />
									<span className="min-w-0 flex-1">
										<span className="flex items-center justify-between gap-2">
											<span
												className={cn(
													"truncate text-sm font-medium",
													cancelled && "line-through opacity-60"
												)}
											>
												{event.title}
											</span>
											<Badge
												className={cn(
													"shrink-0 border-transparent font-normal",
													status?.bg,
													status?.text
												)}
											>
												{t(`statusValue.${event.status}`)}
											</Badge>
										</span>
										{event.titleBn ? (
											<span className="text-muted-foreground mt-0.5 block truncate text-xs">
												{event.titleBn}
											</span>
										) : null}
										<span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
											<span>{formatRange(event.startDate, event.endDate)}</span>
											{time ? (
												<span className="flex items-center gap-1">
													<Clock className="size-3" />
													{time}
												</span>
											) : null}
											{event.venue ? (
												<span className="flex items-center gap-1">
													<MapPin className="size-3" />
													{event.venue}
												</span>
											) : null}
										</span>
									</span>
								</button>
							);
						})
					) : (
						<p className="text-muted-foreground py-6 text-center text-sm">
							{t("dayDialogNoEvents")}
						</p>
					)}
				</div>

				<DialogFooter className="shrink-0 flex-col items-stretch gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
					{/* No past-date restriction here, unlike holidays: recording an
					    event that already happened (with photos, awards and results)
					    is a normal thing for a school to do after the fact. */}
					<PermissionGuard
						permissions={[
							PERMISSIONS.EVENTS.ALL,
							PERMISSIONS.EVENTS.SCHEDULING.ALL,
							PERMISSIONS.EVENTS.SCHEDULING.CREATE,
						]}
					>
						<Button onClick={() => onAddEvent(date)}>
							<Plus className="size-4" />
							{t("dayDialogAddNew")}
						</Button>
					</PermissionGuard>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("dayDialogClose")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

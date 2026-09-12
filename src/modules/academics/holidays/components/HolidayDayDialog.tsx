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
import { CalendarOff, History, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Holiday, holidayCategoryColors } from "../dto/holiday.dto";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The clicked day, as YYYY-MM-DD. */
	date: string | null;
	/** Every holiday covering that day, in calendar order. */
	holidays: Holiday[];
	isWeeklyOff?: boolean;
	onEditHoliday: (holiday: Holiday) => void;
	onAddHoliday: (date: string) => void;
};

const formatRange = (start: string, end: string) => {
	const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
	const startLabel = formatter.format(new Date(start));
	if (start.slice(0, 10) === end.slice(0, 10)) return startLabel;
	return `${startLabel} - ${formatter.format(new Date(end))}`;
};

const todayKey = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
		now.getDate()
	).padStart(2, "0")}`;
};

/**
 * One click per day. The calendar cell no longer has to decide whether the
 * pointer landed on a holiday pill or the empty space around it — every day
 * opens this, which shows what is already on that date and offers to add
 * another. That also makes the day's full list reachable on touch, where the
 * old hover-only "+2 more" popover was effectively hidden.
 */
export default function HolidayDayDialog({
	open,
	onOpenChange,
	date,
	holidays,
	isWeeklyOff,
	onEditHoliday,
	onAddHoliday,
}: Props) {
	const t = useTranslations("Holidays");
	const locale = useLocale();

	if (!date) return null;

	const isPast = date < todayKey();
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
						{holidays.length
							? t("dayDialogCount", { count: holidays.length })
							: t("dayDialogEmptyDescription")}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
					{isWeeklyOff && (
						<div className="text-muted-foreground bg-muted/40 mb-3 flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs">
							<CalendarOff className="size-3.5 shrink-0" />
							{t("dayDialogWeeklyOff")}
						</div>
					)}

					{holidays.length ? (
						holidays.map((holiday) => {
							const colors = holidayCategoryColors[holiday.category];
							return (
								<button
									key={holiday.id}
									type="button"
									onClick={() => onEditHoliday(holiday)}
									className="hover:bg-accent/40 flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors"
								>
									<span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", colors.dot)} />
									<span className="min-w-0 flex-1">
										<span className="flex items-center justify-between gap-2">
											<span className="truncate text-sm font-medium">{holiday.title}</span>
											<Badge
												variant={holiday.isClosed ? "destructive" : "secondary"}
												className="shrink-0 font-normal"
											>
												{formatRange(holiday.startDate, holiday.endDate)}
											</Badge>
										</span>
										{holiday.titleBn ? (
											<span className="text-muted-foreground mt-0.5 block truncate text-xs">
												{holiday.titleBn}
											</span>
										) : null}
										<span className="text-muted-foreground mt-1 block text-xs">
											{t(holiday.category.toLowerCase())}
											{holiday.isClosed ? ` · ${t("legendClosed")}` : ""}
										</span>
									</span>
								</button>
							);
						})
					) : (
						<p className="text-muted-foreground py-6 text-center text-sm">
							{t("dayDialogNoHolidays")}
						</p>
					)}
				</div>

				<DialogFooter className="shrink-0 flex-col items-stretch gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
					{isPast ? (
						// Adding is withheld rather than offered-then-rejected: the API
						// refuses a back-dated holiday, so a button here could only fail.
						<span className="text-muted-foreground flex items-center gap-2 text-xs">
							<History className="size-3.5 shrink-0" />
							{t("dayDialogPastNotice")}
						</span>
					) : (
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.ALL,
								PERMISSIONS.ACADEMICS.HOLIDAYS.CREATE,
							]}
						>
							<Button onClick={() => onAddHoliday(date)}>
								<Plus className="size-4" />
								{t("dayDialogAddNew")}
							</Button>
						</PermissionGuard>
					)}
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("dayDialogClose")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

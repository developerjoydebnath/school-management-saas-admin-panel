"use client";

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
import { cn } from "@/shared/lib/utils";
import { CalendarOff, Clock, MapPin, PartyPopper, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DayConflicts, overlapsEventTime } from "../hooks/use-day-conflicts";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The exam date being questioned, YYYY-MM-DD. */
	date: string | null;
	conflicts: DayConflicts | null;
	/** The row's own sitting, so an event can be judged as a real time clash. */
	examStartTime?: string | null;
	examDurationMins?: number;
	subjectName?: string;
};

const formatRange = (start: string, end: string) => {
	const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
	const startLabel = formatter.format(new Date(start));
	if (start.slice(0, 10) === end.slice(0, 10)) return startLabel;
	return `${startLabel} - ${formatter.format(new Date(end))}`;
};

/**
 * What else is happening on the day a paper is being scheduled.
 *
 * Advisory, never blocking: Bangladeshi schools routinely sit exams during
 * vacations and around school events, so the job here is to make the clash
 * visible, not to refuse the date.
 */
export default function DayConflictDialog({
	open,
	onOpenChange,
	date,
	conflicts,
	examStartTime,
	examDurationMins,
	subjectName,
}: Props) {
	const t = useTranslations("ExamRoutine");
	const locale = useLocale();

	if (!date || !conflicts) return null;

	const heading = new Intl.DateTimeFormat(locale, {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00.000Z`));

	const closedHoliday = conflicts.holidays.some((holiday) => holiday.isClosed);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle className="flex items-center gap-2">
						<TriangleAlert className="size-4 shrink-0 text-amber-500" />
						{heading}
					</DialogTitle>
					<DialogDescription>
						{subjectName
							? t("conflictDialogDescriptionFor", { subject: subjectName })
							: t("conflictDialogDescription")}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
					{closedHoliday && (
						<div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs">
							<CalendarOff className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
							<span>{t("conflictClosedNotice")}</span>
						</div>
					)}

					{conflicts.holidays.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
								{t("conflictHolidays")}
							</h4>
							{conflicts.holidays.map((holiday) => (
								<div key={holiday.id} className="space-y-1 rounded-md border p-3">
									<div className="flex min-w-0 items-start justify-between gap-2">
										<span className="min-w-0 truncate text-sm font-medium">
											{holiday.title}
										</span>
										<Badge
											variant={holiday.isClosed ? "destructive" : "secondary"}
											className="shrink-0 font-normal"
										>
											{holiday.isClosed ? t("conflictClosed") : t("conflictOpen")}
										</Badge>
									</div>
									{holiday.titleBn ? (
										<p className="text-muted-foreground truncate text-xs">{holiday.titleBn}</p>
									) : null}
									<p className="text-muted-foreground text-xs">
										{formatRange(holiday.startDate, holiday.endDate)}
										{" · "}
										{holiday.category.replaceAll("_", " ").toLowerCase()}
									</p>
									{holiday.description ? (
										<p className="text-muted-foreground text-xs">{holiday.description}</p>
									) : null}
								</div>
							))}
						</div>
					)}

					{conflicts.events.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
								{t("conflictEvents")}
							</h4>
							{conflicts.events.map((event) => {
								const overlaps = overlapsEventTime(examStartTime, examDurationMins, event);
								const time = [event.startTime, event.endTime].filter(Boolean).join(" - ");
								return (
									<div
										key={event.id}
										className={cn(
											"space-y-1 rounded-md border p-3",
											// Only a genuine hour-overlap gets the amber treatment; a
											// prize-giving at 3pm does not threaten a 10am paper.
											overlaps === true && "border-amber-500/50 bg-amber-500/5"
										)}
									>
										<div className="flex min-w-0 items-start justify-between gap-2">
											<span className="flex min-w-0 items-center gap-2">
												<PartyPopper className="text-muted-foreground size-3.5 shrink-0" />
												<span className="min-w-0 truncate text-sm font-medium">
													{event.title}
												</span>
											</span>
											<Badge variant="secondary" className="shrink-0 font-normal">
												{formatRange(event.startDate, event.endDate)}
											</Badge>
										</div>
										<p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
											{time ? (
												<span className="flex items-center gap-1">
													<Clock className="size-3 shrink-0" />
													{time}
												</span>
											) : (
												<span>{t("conflictAllDay")}</span>
											)}
											{event.venue ? (
												<span className="flex min-w-0 items-center gap-1">
													<MapPin className="size-3 shrink-0" />
													<span className="truncate">{event.venue}</span>
												</span>
											) : null}
										</p>
										{/* Three states, not two: unknown is said out loud rather
										    than rendered as "no clash". */}
										{overlaps === true ? (
											<p className="text-xs font-medium text-amber-600">
												{t("conflictTimeOverlap")}
											</p>
										) : overlaps === false ? (
											<p className="text-muted-foreground text-xs">
												{t("conflictTimeClear")}
											</p>
										) : (
											<p className="text-muted-foreground text-xs">
												{t("conflictTimeUnknown")}
											</p>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				<DialogFooter className="shrink-0 flex-col items-stretch gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
					<span className="text-muted-foreground text-xs">{t("conflictAdvisory")}</span>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("conflictClose")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

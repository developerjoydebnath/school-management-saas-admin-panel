"use client";

import { cn } from "@/shared/lib/utils";
import { CalendarOff, PartyPopper, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { DayConflicts, overlapsEventTime } from "../hooks/use-day-conflicts";

type Props = {
	conflicts: DayConflicts | null;
	examStartTime?: string | null;
	examDurationMins?: number;
	onOpen: () => void;
};

/**
 * The inline "something else is on this day" hint under an exam date.
 *
 * Renders nothing when the day is clear, so a routine with no clashes looks
 * exactly as it did before. Severity is only raised to amber for a school
 * closure or a genuine hour-overlap with an event — a prize-giving at 3pm
 * beside a 10am paper is worth knowing about, not worth alarming over.
 */
export default function DayConflictBadge({
	conflicts,
	examStartTime,
	examDurationMins,
	onOpen,
}: Props) {
	const t = useTranslations("ExamRoutine");

	if (!conflicts) return null;
	const holidayCount = conflicts.holidays.length;
	const eventCount = conflicts.events.length;
	if (!holidayCount && !eventCount) return null;

	const isClosed = conflicts.holidays.some((holiday) => holiday.isClosed);
	const hasTimeClash = conflicts.events.some(
		(event) => overlapsEventTime(examStartTime, examDurationMins, event) === true
	);
	const severe = isClosed || hasTimeClash;

	const label = [
		holidayCount ? t("conflictHolidayCount", { count: holidayCount }) : null,
		eventCount ? t("conflictEventCount", { count: eventCount }) : null,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<button
			type="button"
			onClick={onOpen}
			title={t("conflictBadgeHint")}
			className={cn(
				"mt-1.5 flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-left text-[11px] leading-tight font-medium transition-colors",
				severe
					? "border-amber-500/50 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
					: "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
			)}
		>
			{severe ? (
				<TriangleAlert className="size-3 shrink-0" />
			) : holidayCount ? (
				<CalendarOff className="size-3 shrink-0" />
			) : (
				<PartyPopper className="size-3 shrink-0" />
			)}
			<span className="truncate">{label}</span>
		</button>
	);
}

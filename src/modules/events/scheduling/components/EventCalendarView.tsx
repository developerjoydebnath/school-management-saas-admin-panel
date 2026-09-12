"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
	eventCategoryColors,
	eventCategoryOptions,
	EventStatusEnum,
	SchoolEvent,
} from "../dto/event.dto";
import { useEvents } from "../hooks/use-events";
import EventStatusControl from "./EventStatusControl";

type Props = {
	sessionId?: string;
	/** A click anywhere in a day cell — the day dialog decides what happens next. */
	onSelectDay: (date: string, events: SchoolEvent[]) => void;
	/** Still direct from the Upcoming rail, which lists one event per row. */
	onEditEvent: (event: SchoolEvent) => void;
};

const MAX_VISIBLE_PER_DAY = 3;

const toDateKey = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const eachDateKey = (start: Date, end: Date) => {
	const keys: string[] = [];
	const cursor = new Date(start);
	while (cursor <= end) {
		keys.push(toDateKey(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}
	return keys;
};

const formatRange = (start: string, end: string) => {
	const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
	const startLabel = formatter.format(new Date(start));
	if (start === end) return startLabel;
	return `${startLabel} - ${formatter.format(new Date(end))}`;
};

export default function EventCalendarView({ sessionId, onSelectDay, onEditEvent }: Props) {
	const t = useTranslations("Events");
	const locale = useLocale();
	const [month, setMonth] = useState(() => new Date());

	// Pad a week on each side so the calendar grid's leading/trailing days
	// (from the adjacent months it always shows a sliver of) are covered too.
	const rangeStart = useMemo(() => {
		const date = new Date(month.getFullYear(), month.getMonth(), 1);
		date.setDate(date.getDate() - 7);
		return date;
	}, [month]);
	const rangeEnd = useMemo(() => {
		const date = new Date(month.getFullYear(), month.getMonth() + 1, 0);
		date.setDate(date.getDate() + 7);
		return date;
	}, [month]);

	const { data: events, isLoading } = useEvents({
		sessionId,
		dateFrom: toDateKey(rangeStart),
		dateTo: toDateKey(rangeEnd),
		limit: 200,
	});

	const byDate = useMemo(() => {
		const map = new Map<string, SchoolEvent[]>();
		events.forEach((event) => {
			eachDateKey(new Date(event.startDate), new Date(event.endDate)).forEach((key) => {
				const list = map.get(key) || [];
				list.push(event);
				map.set(key, list);
			});
		});
		return map;
	}, [events]);

	const upcoming = useMemo(() => {
		const todayKey = toDateKey(new Date());
		return events
			.filter((event) => event.endDate >= todayKey && event.status !== EventStatusEnum.CANCELLED)
			.sort((a, b) => a.startDate.localeCompare(b.startDate))
			.slice(0, 8);
	}, [events]);

	// Fixed 6-row (42 cell) grid starting from the Sunday on/before the 1st,
	// like Google/Outlook month views, so the layout never jumps between months.
	const gridDays = useMemo(() => {
		const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
		const start = new Date(firstOfMonth);
		start.setDate(start.getDate() - start.getDay());
		return Array.from({ length: 42 }, (_, i) => {
			const date = new Date(start);
			date.setDate(start.getDate() + i);
			return date;
		});
	}, [month]);

	const weekdayLabels = useMemo(() => {
		const base = new Date(Date.UTC(2023, 0, 1)); // a Sunday
		const formatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date(base);
			date.setUTCDate(base.getUTCDate() + i);
			return formatter.format(date);
		});
	}, [locale]);

	const monthLabel = useMemo(
		() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month),
		[locale, month]
	);

	const todayKey = toDateKey(new Date());
	const currentMonthIndex = month.getMonth();

	const goToMonth = (delta: number) => {
		setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
	};

	// One handler for the whole cell. Previously the cell created and each pill
	// edited, which made the outcome depend on hitting a 16px target; now the
	// day dialog offers both, so the pills are purely visual.
	const handleDayClick = (date: Date) => {
		const key = toDateKey(date);
		onSelectDay(key, byDate.get(key) || []);
	};

	return (
		<div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px] xl:items-start">
			<div className="min-w-0 space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="size-8"
							onClick={() => goToMonth(-1)}
							aria-label={t("previousMonth")}
						>
							<ChevronLeft className="size-4" />
						</Button>
						<h2 className="min-w-40 text-center text-base font-semibold sm:text-lg">
							{monthLabel}
						</h2>
						<Button
							variant="outline"
							size="icon"
							className="size-8"
							onClick={() => goToMonth(1)}
							aria-label={t("nextMonth")}
						>
							<ChevronRight className="size-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>
							{t("today")}
						</Button>
					</div>

					<div className="flex flex-wrap items-center gap-3 text-xs">
						{eventCategoryOptions.map((option) => (
							<span key={option.value} className="flex items-center gap-1.5">
								<span
									className={cn("size-2.5 rounded-full", eventCategoryColors[option.value].dot)}
								/>
								{t(option.value.toLowerCase())}
							</span>
						))}
					</div>
				</div>

				<div className="overflow-hidden rounded-lg border">
					<div className="bg-muted/40 grid grid-cols-7 border-b">
						{weekdayLabels.map((label, i) => (
							<div
								key={i}
								className="border-border not-last:border-r p-2 text-center text-xs font-medium text-muted-foreground"
							>
								{label}
							</div>
						))}
					</div>
					<div className="grid grid-cols-7">
						{gridDays.map((date) => {
							const key = toDateKey(date);
							const dayEvents = byDate.get(key) || [];
							const visible = dayEvents.slice(0, MAX_VISIBLE_PER_DAY);
							const overflow = dayEvents.length - visible.length;
							const isCurrentMonth = date.getMonth() === currentMonthIndex;
							const isToday = key === todayKey;

							return (
								<div
									key={key}
									role="button"
									tabIndex={0}
									onClick={() => handleDayClick(date)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") handleDayClick(date);
									}}
									className={cn(
										"group border-border relative flex min-h-26 cursor-pointer flex-col gap-1 border-r border-b p-1.5 text-left transition-colors last:border-r-0 hover:bg-accent/40 sm:min-h-32",
										!isCurrentMonth && "bg-muted/20"
									)}
								>
									<div className="flex items-center justify-between">
										<span
											className={cn(
												"flex size-6 items-center justify-center rounded-full text-xs font-medium",
												isToday
													? "bg-primary text-primary-foreground"
													: isCurrentMonth
														? "text-foreground"
														: "text-muted-foreground"
											)}
										>
											{date.getDate()}
										</span>
										<Plus className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
									</div>

									<div className="flex flex-1 flex-col gap-1 overflow-hidden">
										{visible.map((event) => {
											const colors = eventCategoryColors[event.category];
											const cancelled = event.status === EventStatusEnum.CANCELLED;
											return (
												<span
													key={event.id}
													title={event.title}
													className={cn(
														"truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight font-medium",
														colors.bg,
														colors.text,
														cancelled && "line-through opacity-60"
													)}
												>
													{event.title}
												</span>
											);
										})}

										{overflow > 0 && (
											<span className="text-muted-foreground px-1.5 text-left text-[11px] font-medium">
												{t("moreCount", { count: overflow })}
											</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<p className="text-muted-foreground text-xs">{t("calendarClickHint")}</p>
			</div>

			<div className="min-w-0 space-y-3">
				<h3 className="text-sm font-medium">{t("upcomingTitle")}</h3>
				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-14 w-full" />
						))}
					</div>
				) : !upcoming.length ? (
					<p className="text-muted-foreground text-sm">{t("noUpcoming")}</p>
				) : (
					<div className="space-y-2">
						{upcoming.map((event) => (
							<div
								key={event.id}
								className="hover:bg-accent/40 w-full space-y-1.5 rounded-md border p-2.5 transition-colors"
							>
								<div className="flex items-start justify-between gap-2">
									{/* Only the title opens the event now: the status dropdown
									    beside it is its own target, and a button cannot legally
									    nest inside another button. */}
									<button
										type="button"
										onClick={() => onEditEvent(event)}
										className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline"
									>
										{event.title}
									</button>
									<Badge variant="secondary" className="shrink-0 font-normal">
										{formatRange(event.startDate, event.endDate)}
									</Badge>
								</div>
								{event.venue ? (
									<p className="text-muted-foreground truncate text-xs">{event.venue}</p>
								) : null}
								<EventStatusControl event={event} size="sm" />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

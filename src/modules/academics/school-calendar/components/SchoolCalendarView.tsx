"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { PATHS } from "@/shared/configs/paths.config";
import { useSessionStore } from "@/shared/stores/session-store";
import { holidayCategoryColors } from "@/modules/academics/holidays/dto/holiday.dto";
import { useHolidays } from "@/modules/academics/holidays/hooks/use-holidays";
import { eventCategoryColors, EventCategoryEnum } from "@/modules/events/scheduling/dto/event.dto";
import { useEvents } from "@/modules/events/scheduling/hooks/use-events";
import { CalendarOff, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const MAX_VISIBLE_PER_DAY = 3;

type MergedItem =
	| { kind: "holiday"; id: string; title: string; startDate: string; endDate: string; colorKey: string; colors: typeof holidayCategoryColors[keyof typeof holidayCategoryColors] }
	| { kind: "event"; id: string; title: string; startDate: string; endDate: string; colorKey: string; colors: typeof eventCategoryColors[keyof typeof eventCategoryColors] };

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

/** Read-mostly overview merging Holidays and Events onto one grid — the
 * "multiple calendars, one glance" pattern (Google/Outlook layers). It never
 * creates or edits anything itself: a pill click hands off to that item's
 * own module (which owns the fields/validation/workflow specific to it). */
export default function SchoolCalendarView() {
	const t = useTranslations("SchoolCalendar");
	const locale = useLocale();
	const router = useRouter();
	const { selectedSessionId } = useSessionStore();
	const [month, setMonth] = useState(() => new Date());

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

	const dateQuery = {
		sessionId: selectedSessionId || undefined,
		dateFrom: toDateKey(rangeStart),
		dateTo: toDateKey(rangeEnd),
		limit: 200,
	};
	const { data: holidays, isLoading: holidaysLoading } = useHolidays(dateQuery);
	const { data: events, isLoading: eventsLoading } = useEvents(dateQuery);
	const isLoading = holidaysLoading || eventsLoading;

	const byDate = useMemo(() => {
		const map = new Map<string, MergedItem[]>();
		const push = (key: string, item: MergedItem) => {
			const list = map.get(key) || [];
			list.push(item);
			map.set(key, list);
		};
		holidays.forEach((holiday) => {
			eachDateKey(new Date(holiday.startDate), new Date(holiday.endDate)).forEach((key) =>
				push(key, {
					kind: "holiday",
					id: holiday.id,
					title: holiday.title,
					startDate: holiday.startDate,
					endDate: holiday.endDate,
					colorKey: holiday.category,
					colors: holidayCategoryColors[holiday.category],
				})
			);
		});
		events.forEach((event: any) => {
			eachDateKey(new Date(event.startDate), new Date(event.endDate)).forEach((key) =>
				push(key, {
					kind: "event",
					id: event.id,
					title: event.title,
					startDate: event.startDate,
					endDate: event.endDate,
					colorKey: event.category,
					colors: eventCategoryColors[event.category as EventCategoryEnum],
				})
			);
		});
		return map;
	}, [holidays, events]);

	const upcoming = useMemo(() => {
		const todayKey = toDateKey(new Date());
		const all: MergedItem[] = [];
		byDate.forEach((items) => all.push(...items));
		const seen = new Set<string>();
		return all
			.filter((item) => item.endDate >= todayKey)
			.filter((item) => {
				const key = `${item.kind}-${item.id}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			})
			.sort((a, b) => a.startDate.localeCompare(b.startDate))
			.slice(0, 8);
	}, [byDate]);

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
		const base = new Date(Date.UTC(2023, 0, 1));
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

	// Holidays are still edited in a dialog on their own page, so they need
	// the ?editId= hand-off. Events have a real edit page — navigate straight
	// to it, cross-domain into Events Management.
	const goToItem = (item: MergedItem) => {
		router.push(
			item.kind === "holiday"
				? `${PATHS.ACADEMICS.HOLIDAYS.ROOT}?editId=${item.id}`
				: PATHS.EVENTS.SCHEDULING.EDIT(item.id)
		);
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

					<div className="flex flex-wrap items-center gap-4 text-xs">
						<span className="flex items-center gap-1.5">
							<CalendarOff className="text-muted-foreground size-3.5" />
							{t("legendHoliday")}
						</span>
						<span className="flex items-center gap-1.5">
							<PartyPopper className="text-muted-foreground size-3.5" />
							{t("legendEvent")}
						</span>
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
							const dayItems = byDate.get(key) || [];
							const visible = dayItems.slice(0, MAX_VISIBLE_PER_DAY);
							const overflow = dayItems.length - visible.length;
							const isCurrentMonth = date.getMonth() === currentMonthIndex;
							const isToday = key === todayKey;

							return (
								<div
									key={key}
									className={cn(
										"border-border relative flex min-h-26 flex-col gap-1 border-r border-b p-1.5 text-left last:border-r-0 sm:min-h-32",
										!isCurrentMonth && "bg-muted/20"
									)}
								>
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

									<div className="flex flex-1 flex-col gap-1 overflow-hidden">
										{visible.map((item) => {
											const Icon = item.kind === "holiday" ? CalendarOff : PartyPopper;
											return (
												<button
													key={`${item.kind}-${item.id}`}
													type="button"
													title={item.title}
													onClick={() => goToItem(item)}
													className={cn(
														"flex cursor-pointer items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight font-medium",
														item.colors.bg,
														item.colors.text
													)}
												>
													<Icon className="size-2.5 shrink-0" />
													<span className="truncate">{item.title}</span>
												</button>
											);
										})}

										{overflow > 0 && (
											<Popover>
												<PopoverTrigger asChild>
													<button
														type="button"
														className="text-muted-foreground hover:text-foreground cursor-pointer px-1.5 text-left text-[11px] font-medium"
													>
														{t("moreCount", { count: overflow })}
													</button>
												</PopoverTrigger>
												<PopoverContent className="w-64 p-2">
													<div className="space-y-1">
														{dayItems.map((item) => {
															const Icon = item.kind === "holiday" ? CalendarOff : PartyPopper;
															return (
																<button
																	key={`${item.kind}-${item.id}`}
																	type="button"
																	onClick={() => goToItem(item)}
																	className="hover:bg-accent/50 flex w-full cursor-pointer items-center gap-2 rounded-md p-1.5 text-left text-xs"
																>
																	<Icon className="text-muted-foreground size-3 shrink-0" />
																	<span className="truncate">{item.title}</span>
																</button>
															);
														})}
													</div>
												</PopoverContent>
											</Popover>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<p className="text-muted-foreground text-xs">{t("clickHint")}</p>
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
						{upcoming.map((item) => {
							const Icon = item.kind === "holiday" ? CalendarOff : PartyPopper;
							return (
								<button
									key={`${item.kind}-${item.id}`}
									type="button"
									onClick={() => goToItem(item)}
									className="hover:bg-accent/40 w-full cursor-pointer rounded-md border p-2.5 text-left transition-colors"
								>
									<div className="flex items-start justify-between gap-2">
										<p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium">
											<Icon className="text-muted-foreground size-3.5 shrink-0" />
											<span className="truncate">{item.title}</span>
										</p>
										<Badge variant="secondary" className="shrink-0 font-normal">
											{formatRange(item.startDate, item.endDate)}
										</Badge>
									</div>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

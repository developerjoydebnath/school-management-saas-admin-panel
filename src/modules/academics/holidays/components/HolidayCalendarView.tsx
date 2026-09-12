"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useSWR } from "@/shared/hooks/use-swr";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Holiday, holidayCategoryColors, holidayCategoryOptions } from "../dto/holiday.dto";
import { useHolidays } from "../hooks/use-holidays";
import HolidayStatusControl from "./HolidayStatusControl";

type Props = {
	sessionId?: string;
	/** A click anywhere in a day cell — the day dialog decides what happens next. */
	onSelectDay: (date: string, holidays: Holiday[], isWeeklyOff: boolean) => void;
	/** Still direct from the Upcoming rail, which lists one holiday per row. */
	onEditHoliday: (holiday: Holiday) => void;
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

export default function HolidayCalendarView({ sessionId, onSelectDay, onEditHoliday }: Props) {
	const t = useTranslations("Holidays");
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

	const { data: holidays } = useHolidays({
		sessionId,
		dateFrom: toDateKey(rangeStart),
		dateTo: toDateKey(rangeEnd),
		limit: 200,
	});

	const { data: settingsRes } = useSWR("/holidays/settings");
	const weeklyOffDays = useMemo(
		() => new Set<number>(settingsRes?.data?.weeklyOffDays ?? [5]),
		[settingsRes]
	);

	const byDate = useMemo(() => {
		const map = new Map<string, Holiday[]>();
		holidays.forEach((holiday) => {
			eachDateKey(new Date(holiday.startDate), new Date(holiday.endDate)).forEach((key) => {
				const list = map.get(key) || [];
				list.push(holiday);
				map.set(key, list);
			});
		});
		return map;
	}, [holidays]);

	// A second, deliberately separate fetch. The grid only loads the month on
	// screen, so deriving "upcoming" from it would silently stop at the end of
	// that month — paging back to January would empty a list that is supposed
	// to answer "what is still ahead of us this session?".
	const { data: sessionUpcoming, isLoading: isLoadingUpcoming } = useHolidays({
		sessionId,
		dateFrom: toDateKey(new Date()),
		limit: 200,
	});

	const upcoming = useMemo(
		() =>
			[...sessionUpcoming].sort((a, b) => a.startDate.localeCompare(b.startDate)),
		[sessionUpcoming]
	);

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
		onSelectDay(key, byDate.get(key) || [], weeklyOffDays.has(date.getDay()));
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
						{holidayCategoryOptions.map((option) => (
							<span key={option.value} className="flex items-center gap-1.5">
								<span
									className={cn("size-2.5 rounded-full", holidayCategoryColors[option.value].dot)}
								/>
								{t(option.value.toLowerCase())}
							</span>
						))}
						<span className="flex items-center gap-1.5 border-l pl-3">
							<span className="border-destructive bg-destructive/20 size-2.5 rounded-full border-2" />
							{t("legendClosed")}
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
							const dayHolidays = byDate.get(key) || [];
							const visible = dayHolidays.slice(0, MAX_VISIBLE_PER_DAY);
							const overflow = dayHolidays.length - visible.length;
							const isCurrentMonth = date.getMonth() === currentMonthIndex;
							const isToday = key === todayKey;
							const isOffDay = weeklyOffDays.has(date.getDay());

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
										isOffDay && "bg-muted/30",
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
										{isOffDay && dayHolidays.length === 0 ? (
											<span className="text-muted-foreground text-[10px] font-medium">
												{t("weeklyOff")}
											</span>
										) : (
											<Plus className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
										)}
									</div>

									<div className="flex flex-1 flex-col gap-1 overflow-hidden">
										{visible.map((holiday) => {
											const colors = holidayCategoryColors[holiday.category];
											return (
												<span
													key={holiday.id}
													title={holiday.title}
													className={cn(
														"truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight font-medium",
														colors.bg,
														colors.text,
														holiday.isClosed && cn("border-l-2", colors.border)
													)}
												>
													{holiday.title}
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
				<div className="flex items-baseline justify-between gap-2">
					<h3 className="text-sm font-medium">{t("upcomingTitle")}</h3>
					{upcoming.length ? (
						<span className="text-muted-foreground text-xs">{upcoming.length}</span>
					) : null}
				</div>
				<p className="text-muted-foreground text-xs">{t("upcomingSessionHint")}</p>
				{isLoadingUpcoming ? (
					<div className="space-y-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-14 w-full" />
						))}
					</div>
				) : !upcoming.length ? (
					<p className="text-muted-foreground text-sm">{t("noUpcoming")}</p>
				) : (
					<div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
						{upcoming.map((holiday) => (
							<div
								key={holiday.id}
								className="hover:bg-accent/40 w-full space-y-1.5 rounded-md border p-2.5 transition-colors"
							>
								<div className="flex items-start justify-between gap-2">
									{/* Only the title opens the editor now: the closed/open
									    control beside it is its own target, and a button
									    cannot legally nest inside another button. */}
									<button
										type="button"
										onClick={() => onEditHoliday(holiday)}
										className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline"
									>
										{holiday.title}
									</button>
									<Badge variant="secondary" className="shrink-0 font-normal">
										{formatRange(holiday.startDate, holiday.endDate)}
									</Badge>
								</div>
								{holiday.titleBn ? (
									<p className="text-muted-foreground truncate text-xs">{holiday.titleBn}</p>
								) : null}
								<HolidayStatusControl holiday={holiday} size="sm" />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

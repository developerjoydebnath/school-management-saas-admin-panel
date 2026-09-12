"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
	EXAM_TYPE_FALLBACK,
	ExamPaper,
	examTypeColors,
	paperTimeRange,
} from "../dto/exam-calendar.dto";
import { useExamCalendar } from "../hooks/use-exam-calendar";
import ExamCalendarDayDialog from "./ExamCalendarDayDialog";
import ExamCalendarFilterBar, { ExamCalendarFilter } from "./ExamCalendarFilterBar";

type Props = {
	sessionId?: string;
};

const MAX_VISIBLE_PER_DAY = 3;

const toDateKey = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const formatRange = (start: string, end: string) => {
	const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
	const startLabel = formatter.format(new Date(start));
	if (start.slice(0, 10) === end.slice(0, 10)) return startLabel;
	return `${startLabel} - ${formatter.format(new Date(end))}`;
};

const initialFilter: ExamCalendarFilter = { examId: [], classId: [], type: [] };

/**
 * A read-only wall calendar of the exam routine.
 *
 * Cells carry PAPERS, not exams: an exam is a two-week span, and drawing that
 * as one band tells a teacher nothing, while "Physics · Class 9 · 10:00" on the
 * day it sits is the thing people actually look up.
 *
 * Nothing here mutates. A day opens a detail dialog, and the rail links nowhere
 * — scheduling lives in the Schedule and Routine modules, and a calendar that
 * silently edited the routine would be a surprising place to do it from.
 */
export default function ExamCalendarView({ sessionId }: Props) {
	const t = useTranslations("ExamCalendar");
	const locale = useLocale();
	const [month, setMonth] = useState(() => new Date());
	const [filter, setFilter] = useState<ExamCalendarFilter>(initialFilter);
	const [dayDialogOpen, setDayDialogOpen] = useState(false);
	const [day, setDay] = useState<{ date: string; papers: ExamPaper[] } | null>(null);

	// Pad a week either side so the grid's leading/trailing days — which always
	// show a sliver of the adjacent months — are covered by the same fetch.
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

	const { papers, exams, isLoading } = useExamCalendar({
		sessionId,
		dateFrom: toDateKey(rangeStart),
		dateTo: toDateKey(rangeEnd),
		examId: filter.examId[0],
		classId: filter.classId[0],
	});

	// Type is filtered client-side: the API narrows by exam and class, and
	// re-fetching for a colour filter the data already carries is wasteful.
	const visiblePapers = useMemo(
		() =>
			filter.type.length
				? papers.filter((paper) => filter.type.includes(paper.exam.type))
				: papers,
		[papers, filter.type]
	);

	const byDate = useMemo(() => {
		const map = new Map<string, ExamPaper[]>();
		visiblePapers.forEach((paper) => {
			const key = paper.examDate.slice(0, 10);
			map.set(key, [...(map.get(key) || []), paper]);
		});
		return map;
	}, [visiblePapers]);

	// The API returns every exam in range so the filter dropdown stays complete;
	// narrowing for display happens here instead.
	const visibleExams = useMemo(
		() =>
			exams.filter(
				(exam) =>
					(!filter.type.length || filter.type.includes(exam.type)) &&
					(!filter.examId.length || filter.examId.includes(exam.id))
			),
		[exams, filter.type, filter.examId]
	);

	// Fixed 6-row (42 cell) grid from the Sunday on/before the 1st, like every
	// other calendar in the app, so the layout never jumps between months.
	const gridDays = useMemo(() => {
		const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
		const start = new Date(firstOfMonth);
		start.setDate(start.getDate() - start.getDay());
		return Array.from({ length: 42 }, (_, index) => {
			const date = new Date(start);
			date.setDate(start.getDate() + index);
			return date;
		});
	}, [month]);

	const weekdayLabels = useMemo(() => {
		const base = new Date(Date.UTC(2023, 0, 1)); // a Sunday
		const formatter = new Intl.DateTimeFormat(locale, {
			weekday: "short",
			timeZone: "UTC",
		});
		return Array.from({ length: 7 }, (_, index) => {
			const date = new Date(base);
			date.setUTCDate(base.getUTCDate() + index);
			return formatter.format(date);
		});
	}, [locale]);

	const monthLabel = useMemo(
		() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month),
		[locale, month]
	);

	const todayKey = toDateKey(new Date());
	const currentMonthIndex = month.getMonth();
	const goToMonth = (delta: number) =>
		setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

	const openDay = (date: Date) => {
		const key = toDateKey(date);
		const dayPapers = byDate.get(key) || [];
		// An empty day has nothing to show, so it stays inert rather than opening
		// a dialog that says "nothing here" — this calendar cannot add one.
		if (!dayPapers.length) return;
		setDay({ date: key, papers: dayPapers });
		setDayDialogOpen(true);
	};

	const upcoming = useMemo(() => {
		const today = toDateKey(new Date());
		return visiblePapers
			.filter((paper) => paper.examDate.slice(0, 10) >= today)
			.sort((a, b) =>
				`${a.examDate}${a.startTime || ""}`.localeCompare(`${b.examDate}${b.startTime || ""}`)
			)
			.slice(0, 8);
	}, [visiblePapers]);

	return (
		<div className="space-y-4">
			<ExamCalendarFilterBar
				exams={exams}
				filter={filter}
				setFilter={setFilter}
				onReset={() => setFilter(initialFilter)}
			/>

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

						{/* Only the types actually on screen are in the legend — a fixed
						    ten-type key would be mostly noise in a month with one exam. */}
						<div className="flex flex-wrap items-center gap-3 text-xs">
							{Array.from(new Set(visibleExams.map((exam) => exam.type))).map((type) => (
								<span key={type} className="flex items-center gap-1.5">
									<span
										className={cn(
											"size-2.5 rounded-full",
											(examTypeColors[type] || EXAM_TYPE_FALLBACK).dot
										)}
									/>
									{t(`type.${type}`)}
								</span>
							))}
						</div>
					</div>

					<div className="overflow-hidden rounded-lg border">
						<div className="bg-muted/40 grid grid-cols-7 border-b">
							{weekdayLabels.map((label, index) => (
								<div
									key={index}
									className="border-border text-muted-foreground not-last:border-r p-2 text-center text-xs font-medium"
								>
									{label}
								</div>
							))}
						</div>
						<div className="grid grid-cols-7">
							{gridDays.map((date) => {
								const key = toDateKey(date);
								const dayPapers = byDate.get(key) || [];
								const visible = dayPapers.slice(0, MAX_VISIBLE_PER_DAY);
								const overflow = dayPapers.length - visible.length;
								const isCurrentMonth = date.getMonth() === currentMonthIndex;
								const isToday = key === todayKey;
								const hasPapers = dayPapers.length > 0;

								return (
									<div
										key={key}
										role={hasPapers ? "button" : undefined}
										tabIndex={hasPapers ? 0 : undefined}
										onClick={() => openDay(date)}
										onKeyDown={(event) => {
											if (event.key === "Enter" || event.key === " ") openDay(date);
										}}
										className={cn(
											"border-border relative flex min-h-26 flex-col gap-1 border-r border-b p-1.5 text-left transition-colors last:border-r-0 sm:min-h-32",
											hasPapers && "hover:bg-accent/40 cursor-pointer",
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
											{hasPapers && (
												<span className="text-muted-foreground text-[10px] font-medium">
													{t("paperCount", { count: dayPapers.length })}
												</span>
											)}
										</div>

										<div className="flex flex-1 flex-col gap-1 overflow-hidden">
											{visible.map((paper) => {
												const colors = examTypeColors[paper.exam.type] || EXAM_TYPE_FALLBACK;
												const cancelled = paper.status === "CANCELLED";
												return (
													<span
														key={paper.id}
														title={`${paper.subject.enName} · ${paper.class.enName} · ${paper.exam.name}`}
														className={cn(
															"truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight font-medium",
															colors.bg,
															colors.text,
															cancelled && "line-through opacity-60"
														)}
													>
														{paper.startTime ? `${paperTimeRange(paper.startTime)} ` : ""}
														{paper.subject.enName}
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

					<p className="text-muted-foreground text-xs">{t("calendarHint")}</p>
				</div>

				<div className="w-full min-w-0 max-w-full space-y-4">
					<div className="space-y-3">
						<h3 className="text-sm font-medium">{t("examsThisMonth")}</h3>
						{isLoading ? (
							<div className="space-y-2">
								{Array.from({ length: 2 }).map((_, index) => (
									<Skeleton key={index} className="h-16 w-full" />
								))}
							</div>
						) : !visibleExams.length ? (
							<p className="text-muted-foreground text-sm">{t("noExamsThisMonth")}</p>
						) : (
							<div className="w-full max-w-full space-y-2 overflow-auto">
								{visibleExams.map((exam) => {
									const colors = examTypeColors[exam.type] || EXAM_TYPE_FALLBACK;
									return (
										<div
											key={exam.id}
											className="w-full min-w-0 space-y-1.5 rounded-md border p-2.5"
										>
											<div className="flex min-w-0 items-start justify-between gap-2">
												<span className="flex min-w-0 flex-1 items-center gap-2">
													<span className={cn("size-2 shrink-0 rounded-full", colors.dot)} />
													{/* Same `min-w-0` as the Upcoming list: without it the
													    nowrap name sets the flex item's minimum to its full
													    width and the card pushes out of the rail. */}
													<span
														className="min-w-0 truncate text-sm font-medium"
														title={exam.name}
													>
														{exam.name}
													</span>
												</span>
												<Badge variant="secondary" className="shrink-0 font-normal">
													{formatRange(exam.startDate, exam.endDate)}
												</Badge>
											</div>
											<p
												className="text-muted-foreground truncate text-xs"
												title={exam.classes.map((item) => item.class.enName).join(", ")}
											>
												{exam.classes.map((item) => item.class.enName).join(", ") ||
													t("noClasses")}
											</p>
										</div>
									);
								})}
							</div>
						)}
					</div>

					<div className="space-y-3">
						<h3 className="text-sm font-medium">{t("upcomingPapers")}</h3>
						{isLoading ? (
							<div className="space-y-2">
								{Array.from({ length: 3 }).map((_, index) => (
									<Skeleton key={index} className="h-14 w-full" />
								))}
							</div>
						) : !upcoming.length ? (
							<p className="text-muted-foreground text-sm">{t("noUpcomingPapers")}</p>
						) : (
							// `overflow-auto`, not just `-y`: a card that genuinely cannot
							// shrink any further scrolls sideways inside the rail instead of
							// spilling over the calendar next to it.
							<div className="max-h-[26rem] w-full max-w-full space-y-2 overflow-auto overscroll-contain pr-1">
								{upcoming.map((paper) => {
									const colors = examTypeColors[paper.exam.type] || EXAM_TYPE_FALLBACK;
									const time = paperTimeRange(paper.startTime, paper.durationMins);
									return (
										<div
											key={paper.id}
											className="w-full min-w-0 space-y-1 rounded-md border p-2.5"
										>
											<div className="flex min-w-0 items-start justify-between gap-2">
												<span className="flex min-w-0 flex-1 items-center gap-2">
													<span className={cn("size-2 shrink-0 rounded-full", colors.dot)} />
													{/* `min-w-0` is load-bearing: `truncate` sets
													    white-space:nowrap, and a flex item's automatic
													    minimum is its max-content width — so without this
													    the name refuses to shrink and pushes the whole
													    card past the rail instead of ellipsing. */}
													<span
														className="min-w-0 truncate text-sm font-medium"
														title={paper.subject.enName}
													>
														{paper.subject.enName}
													</span>
												</span>
												<Badge variant="secondary" className="shrink-0 font-normal">
													{formatRange(paper.examDate, paper.examDate)}
												</Badge>
											</div>
											<p
												className="text-muted-foreground truncate text-xs"
												title={`${paper.class.enName} · ${paper.exam.name}`}
											>
												{paper.class.enName} · {paper.exam.name}
											</p>
											<p className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-3 text-xs">
												{time ? (
													<span className="flex items-center gap-1 whitespace-nowrap">
														<Clock className="size-3 shrink-0" />
														{time}
													</span>
												) : null}
												{paper.classRoom ? (
													<span className="flex min-w-0 items-center gap-1">
														<MapPin className="size-3 shrink-0" />
														<span className="truncate">
															{paper.classRoom.roomNo || paper.classRoom.name}
														</span>
													</span>
												) : null}
											</p>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>

			<ExamCalendarDayDialog
				open={dayDialogOpen}
				onOpenChange={setDayDialogOpen}
				date={day?.date || null}
				papers={day?.papers || []}
			/>
		</div>
	);
}

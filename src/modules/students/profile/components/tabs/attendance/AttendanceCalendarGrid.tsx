"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type AttendanceStatus = "P" | "A" | "L" | "D";
type DayRecord = { day: number; status: AttendanceStatus };

const generateCalendarData = (): Record<string, DayRecord[]> => {
	const months: Record<string, DayRecord[]> = {};
	const year = 2026;
	for (let m = 0; m < 12; m++) {
		const daysInMonth = new Date(year, m + 1, 0).getDate();
		const key = `${year}-${String(m + 1).padStart(2, "0")}`;
		const days: DayRecord[] = [];
		for (let d = 1; d <= daysInMonth; d++) {
			const date = new Date(year, m, d);
			const dayOfWeek = date.getDay();
			if (dayOfWeek === 5 || dayOfWeek === 6) continue;
			const rand = Math.random();
			let status: AttendanceStatus;
			if (rand < 0.82) status = "P";
			else if (rand < 0.9) status = "A";
			else if (rand < 0.95) status = "L";
			else status = "D";
			days.push({ day: d, status });
		}
		months[key] = days;
	}
	return months;
};

const calendarData = generateCalendarData();

const statusStyle: Record<AttendanceStatus, string> = {
	P: "bg-green-500/15 text-green-700 dark:text-green-400",
	A: "bg-red-500/15 text-red-700 dark:text-red-400",
	L: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	D: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
};

const statusLabel: Record<AttendanceStatus, string> = {
	P: "Present",
	A: "Absent",
	L: "Leave",
	D: "Late",
};

function SingleMonthGrid({ year, month }: { year: number; month: number }) {
	const key = `${year}-${String(month + 1).padStart(2, "0")}`;
	const days = calendarData[key] || [];
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstDayOfWeek = new Date(year, month, 1).getDay();

	const dayNames = ["S", "Su", "M", "T", "W", "Th", "F"];
	const monthLabel = new Date(year, month).toLocaleString("en", {
		month: "short",
		year: "numeric",
	});

	const grid: (DayRecord | null)[] = [];
	const adjustedFirstDay = (firstDayOfWeek + 1) % 7;
	for (let i = 0; i < adjustedFirstDay; i++) grid.push(null);
	for (let d = 1; d <= daysInMonth; d++) {
		const record = days.find((r) => r.day === d);
		const date = new Date(year, month, d);
		const dayOfWeek = date.getDay();
		if (dayOfWeek === 5 || dayOfWeek === 6) {
			grid.push({ day: d, status: "P" });
		} else {
			grid.push(record || { day: d, status: "P" });
		}
	}

	const isWeekend = (dayNum: number) => {
		const date = new Date(year, month, dayNum);
		return date.getDay() === 5 || date.getDay() === 6;
	};

	return (
		<div>
			<p className="mb-2 text-center text-sm font-semibold">{monthLabel}</p>
			<div className="grid grid-cols-7 gap-1">
				{dayNames.map((d) => (
					<div
						key={d}
						className="text-muted-foreground py-1 text-center text-[10px] font-bold tracking-wider uppercase"
					>
						{d}
					</div>
				))}
				{grid.map((cell, i) => {
					if (!cell) return <div key={`empty-${i}`} className="aspect-square" />;
					const weekend = isWeekend(cell.day);
					return (
						<div
							key={`day-${cell.day}`}
							className={cn(
								"flex aspect-square flex-col items-center justify-center gap-2 rounded-lg text-xs transition-all",
								weekend
									? "bg-muted/50 text-muted-foreground"
									: statusStyle[cell.status],
								!weekend && "hover:ring-primary/30 cursor-default hover:ring-2"
							)}
						>
							<span className="text-xs leading-none opacity-60">{cell.day}</span>
							<span className="text-xs leading-none font-bold">
								{weekend ? "—" : cell.status}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function AttendanceCalendarGrid() {
	const [anchorDate, setAnchorDate] = useState(new Date(2026, 4, 1));
	const months: { year: number; month: number }[] = [];
	for (let offset = 2; offset >= 0; offset--) {
		const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - offset, 1);
		months.push({ year: d.getFullYear(), month: d.getMonth() });
	}

	const handlePrev = () => setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 1, 1));
	const handleNext = () => setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1));

	const startLabel = new Date(months[0].year, months[0].month).toLocaleString("en", { month: "short", year: "numeric" });
	const endLabel = new Date(months[2].year, months[2].month).toLocaleString("en", { month: "short", year: "numeric" });

	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-semibold">Daily Attendance Calendar</CardTitle>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="min-w-[140px] text-center text-sm font-semibold">
							<span className="xl:hidden">
								{new Date(months[2].year, months[2].month).toLocaleString("en", { month: "long", year: "numeric" })}
							</span>
							<span className="hidden xl:inline">
								{startLabel} — {endLabel}
							</span>
						</span>
						<Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="mb-4 flex flex-wrap gap-4">
					{(Object.keys(statusLabel) as AttendanceStatus[]).map((s) => (
						<div key={s} className="flex items-center gap-1.5 text-xs">
							<span className={cn("flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold", statusStyle[s])}>{s}</span>
							<span className="text-muted-foreground">{statusLabel[s]}</span>
						</div>
					))}
					<div className="flex items-center gap-1.5 text-xs">
						<span className="bg-muted text-muted-foreground flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold">—</span>
						<span className="text-muted-foreground">Weekend / Holiday</span>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
					{months.map((m, idx) => (
						<div key={`${m.year}-${m.month}`} className={cn(idx === 0 && "hidden xl:block", idx === 1 && "hidden lg:block")}>
							<SingleMonthGrid year={m.year} month={m.month} />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

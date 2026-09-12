"use client";

import { Calendar, CalendarDayButton } from "@/shared/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { useMemo, useState } from "react";
import { useAttendanceCalendar } from "../../hooks/use-attendance";

interface AttendanceCalendarProps {
	classId: string;
	sectionId?: string;
	selectedDate: Date;
	setSelectedDate: (date: Date) => void;
	today: Date;
}

function toMonthStr(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDateKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AttendanceCalendar({
	classId,
	sectionId,
	selectedDate,
	setSelectedDate,
	today,
}: AttendanceCalendarProps) {
	const [visibleMonth, setVisibleMonth] = useState<Date>(selectedDate);

	const { days } = useAttendanceCalendar(classId, {
		month: toMonthStr(visibleMonth),
		sectionId,
	});
	const dayInfoByDate = useMemo(() => {
		const map = new Map<string, { rate: number | null; isHoliday: boolean }>();
		days.forEach((day) => map.set(day.date, { rate: day.rate, isHoliday: day.isHoliday }));
		return map;
	}, [days]);

	const isDisabled = (date: Date) => {
		const dateOnly = new Date(date);
		dateOnly.setHours(0, 0, 0, 0);
		if (dateOnly > today || date.getDay() === 5) return true;
		return dayInfoByDate.get(toDateKey(date))?.isHoliday ?? false;
	};

	return (
		<Card className="h-fit gap-0 pb-0 @4xl/attendance-sheet:w-[360px]">
			<CardHeader className="border-b pb-3">
				<CardTitle className="text-sm font-semibold">Select Date</CardTitle>
			</CardHeader>
			<CardContent className="flex justify-center">
				<Calendar
					captionLayout="dropdown"
					mode="single"
					selected={selectedDate}
					onSelect={(d) => {
						if (d) setSelectedDate(d);
					}}
					month={visibleMonth}
					onMonthChange={setVisibleMonth}
					disabled={isDisabled}
					// REMOVE date out of this month
					showOutsideDays={false}
					className="rounded-md [--cell-size:--spacing(9)] sm:[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
					components={{
						DayButton: ({ children, modifiers, day, ...props }) => {
							if (modifiers.outside) return <></>;
							const dateOnly = new Date(day.date);
							dateOnly.setHours(0, 0, 0, 0);
							const isFuture = dateOnly > today;
							const isWeekend = day.date.getDay() === 5;
							const info = dayInfoByDate.get(toDateKey(day.date));
							const isHoliday = info?.isHoliday ?? false;
							return (
								<CalendarDayButton
									day={day}
									modifiers={modifiers}
									{...props}
									className={cn(
										props.className,
										isHoliday && !isFuture && "bg-destructive/10"
									)}
								>
									{children}
									<span className="text-[10px]! sm:text-xs md:text-sm">
										{isFuture
											? "-"
											: isHoliday
												? "Off"
												: isWeekend
													? "-"
													: info?.rate != null
														? `${info.rate}%`
														: "—"}
									</span>
								</CalendarDayButton>
							);
						},
					}}
				/>
			</CardContent>
		</Card>
	);
}

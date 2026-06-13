"use client";

import { Calendar, CalendarDayButton } from "@/shared/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface AttendanceCalendarProps {
	selectedDate: Date;
	setSelectedDate: (date: Date) => void;
	today: Date;
}

export function AttendanceCalendar({
	selectedDate,
	setSelectedDate,
	today,
}: AttendanceCalendarProps) {
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
					disabled={(date) => {
						const dateOnly = new Date(date);
						dateOnly.setHours(0, 0, 0, 0);
						return dateOnly > today || date.getDay() === 5;
					}}
					// REMOVE date out of this month
					showOutsideDays={false}
					className="rounded-md [--cell-size:--spacing(9)] sm:[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
					components={{
						DayButton: ({ children, modifiers, day, ...props }) => {
							if (modifiers.outside) return <></>;
							const dateOnly = new Date(day.date);
							dateOnly.setHours(0, 0, 0, 0);
							const isDisabled = dateOnly > today || day.date.getDay() === 5;
							return (
								<CalendarDayButton day={day} modifiers={modifiers} {...props}>
									{children}
									<span className="text-[10px]! sm:text-xs md:text-sm">
										{isDisabled ? "-" : "87%"}
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

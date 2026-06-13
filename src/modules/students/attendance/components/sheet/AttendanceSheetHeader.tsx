"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, CalendarCheck, Lock } from "lucide-react";
import Link from "next/link";

interface AttendanceSheetHeaderProps {
	className: string;
	section: string | null;
	selectedDate: Date;
	isDateSubmitted: boolean;
	isToday: boolean;
	isSubmitted: boolean;
}

export function AttendanceSheetHeader({
	className,
	section,
	selectedDate,
	isDateSubmitted,
	isToday,
	isSubmitted,
}: AttendanceSheetHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3">
				<Link href="/students/attendance">
					<Button variant="outline" size="icon" className="h-9 w-9">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-base font-bold sm:text-lg md:text-xl">
						{className}
						{section && (
							<span className="text-muted-foreground ml-2">— Section {section}</span>
						)}
					</h1>
					<p className="text-muted-foreground text-xs sm:text-sm">
						Attendance Sheet •{" "}
						{selectedDate.toLocaleDateString("en-US", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{isDateSubmitted && (
					<Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-600">
						<Lock className="h-3 w-3" />
						Submitted
					</Badge>
				)}
				{isToday && !isSubmitted && !isDateSubmitted && (
					<Badge variant="outline" className="gap-1 border-blue-500 text-blue-600">
						<CalendarCheck className="h-3 w-3" />
						Today
					</Badge>
				)}
			</div>
		</div>
	);
}

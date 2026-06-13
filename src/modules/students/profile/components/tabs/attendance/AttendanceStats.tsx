"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

interface AttendanceStatsProps {
	totalPresent: number;
	totalAbsent: number;
	totalLate: number;
	totalLeave: number;
	attendancePercent: number;
}

export function AttendanceStats({
	totalPresent,
	totalAbsent,
	totalLate,
	totalLeave,
	attendancePercent,
}: AttendanceStatsProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
			<Card className="border-none bg-green-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-green-500/10 p-2 text-green-600">
						<CheckCircle2 className="h-4 w-4" />
					</div>
					<div>
						<p className="text-muted-foreground text-[10px]">Present</p>
						<p className="text-lg font-bold text-green-700">{totalPresent}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-red-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-red-500/10 p-2 text-red-600">
						<XCircle className="h-4 w-4" />
					</div>
					<div>
						<p className="text-muted-foreground text-[10px]">Absent</p>
						<p className="text-lg font-bold text-red-700">{totalAbsent}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-yellow-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-yellow-500/10 p-2 text-yellow-600">
						<Clock className="h-4 w-4" />
					</div>
					<div>
						<p className="text-muted-foreground text-[10px]">Late</p>
						<p className="text-lg font-bold text-yellow-700">{totalLate}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-blue-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
						<Calendar className="h-4 w-4" />
					</div>
					<div>
						<p className="text-muted-foreground text-[10px]">Leave</p>
						<p className="text-lg font-bold text-blue-700">{totalLeave}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-purple-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-purple-500/10 p-2 text-purple-600">
						<CheckCircle2 className="h-4 w-4" />
					</div>
					<div>
						<p className="text-muted-foreground text-[10px]">Rate</p>
						<p className="text-lg font-bold text-purple-700">
							{attendancePercent}%
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

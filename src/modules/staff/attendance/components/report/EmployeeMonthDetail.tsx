"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { MapPin, UserCog } from "lucide-react";
import { useState } from "react";
import { AttendanceStatus, EmployeeType } from "../../dto/staff-attendance.dto";
import { useEmployeeMonth } from "../../hooks/use-staff-attendance";
import { AttendanceStatusBadge } from "../shared/AttendanceStatusBadge";

const currentMonth = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const DOT: Record<AttendanceStatus, string> = {
	PRESENT: "bg-emerald-500",
	LATE: "bg-amber-500",
	HALF_DAY: "bg-violet-500",
	ON_LEAVE: "bg-sky-500",
	ABSENT: "bg-red-500",
	PENDING: "bg-muted-foreground/30",
};

const formatTime = (value?: string | null) =>
	value
		? new Date(value).toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
			})
		: "—";

export function EmployeeMonthDetail({
	employeeType,
	employeeId,
}: {
	employeeType: EmployeeType;
	employeeId: string;
}) {
	const [month, setMonth] = useState(currentMonth());
	const { detail, isLoading } = useEmployeeMonth(employeeType, employeeId, { month });

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-28 rounded-md" />
				<Skeleton className="h-96 rounded-md" />
			</div>
		);
	}

	if (!detail) {
		return (
			<Card className="shadow-none">
				<CardContent className="text-muted-foreground py-10 text-center text-sm">
					Employee not found.
				</CardContent>
			</Card>
		);
	}

	const marked = detail.days.filter((day) => day.attendance);

	return (
		<div className="@container/page space-y-6">
			<Card className="shadow-none">
				<CardContent className="flex flex-col gap-4 @2xl/page:flex-row @2xl/page:items-center @2xl/page:justify-between">
					<div className="min-w-0">
						<h2 className="truncate text-lg font-medium">
							{detail.employee.fullName}
						</h2>
						<p className="text-muted-foreground text-sm">
							{detail.employee.employeeCode} ·{" "}
							{detail.employee.designationName || "—"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline">{detail.workingDays} working days</Badge>
						<Input
							type="month"
							value={month}
							onChange={(event) => setMonth(event.target.value)}
							className="w-auto"
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-card/70 shadow-none">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Month at a glance</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-1.5">
						{detail.days.map((day) => (
							<div
								key={day.date}
								title={`${day.date}${day.status ? ` · ${day.status}` : ""}`}
								className={cn(
									"flex size-9 flex-col items-center justify-center rounded-md border text-[10px]",
									!day.isSchoolDay && "opacity-40"
								)}
							>
								<span className="font-medium">{day.date.slice(-2)}</span>
								<span
									className={cn(
										"mt-0.5 size-1.5 rounded-full",
										DOT[day.status || "PENDING"]
									)}
								/>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card className="bg-card/70 shadow-none">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Recorded days</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{!marked.length ? (
						<p className="text-muted-foreground py-6 text-center text-sm">
							Nothing recorded this month.
						</p>
					) : (
						marked.map((day) => (
							<div
								key={day.date}
								className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"
							>
								<div className="flex items-center gap-3">
									<span className="font-medium">{day.date}</span>
									<AttendanceStatusBadge status={day.status || "PENDING"} />
									{day.attendance?.mode === "self_checkin" && (
										<MapPin
											className={cn(
												"size-3.5",
												day.attendance.checkInInside === false
													? "text-amber-600"
													: "text-emerald-600"
											)}
										/>
									)}
									{day.attendance?.markedOnBehalf && (
										<UserCog className="text-muted-foreground size-3.5" />
									)}
								</div>
								<div className="text-muted-foreground flex items-center gap-4 text-xs">
									<span>In {formatTime(day.attendance?.checkInAt)}</span>
									<span>Out {formatTime(day.attendance?.checkOutAt)}</span>
									{day.attendance?.dutyReasonLabel && (
										<span>{day.attendance.dutyReasonLabel}</span>
									)}
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}

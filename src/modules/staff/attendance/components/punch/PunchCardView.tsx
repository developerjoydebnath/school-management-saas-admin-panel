"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";
import { CalendarOff, Clock, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useMyAttendanceHistory, useMyPunchCard } from "../../hooks/use-staff-attendance";
import { AttendanceStatusBadge } from "../shared/AttendanceStatusBadge";
import { GeofenceMap } from "../shared/GeofenceMap";
import { PunchDialog } from "./PunchDialog";

const formatTime = (value?: string | null) =>
	value ? format(new Date(value), "hh:mm a") : "—";

const formatDuration = (minutes?: number | null) => {
	if (!minutes) return "—";
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return hours ? `${hours}h ${rest}m` : `${rest}m`;
};

export function PunchCardView() {
	const { card, isLoading, mutate } = useMyPunchCard();
	const { history } = useMyAttendanceHistory({ days: 14 });
	const [dialog, setDialog] = useState<"in" | "out" | null>(null);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-44 rounded-md" />
				<Skeleton className="h-64 rounded-md" />
			</div>
		);
	}

	if (!card) {
		return (
			<Card className="shadow-none">
				<CardContent className="text-muted-foreground py-10 text-center text-sm">
					Your login is not linked to a staff or teacher record, so there is no
					attendance card to show.
				</CardContent>
			</Card>
		);
	}

	const { attendance, policy } = card;
	const registerOnly = policy.markingMode === "register";
	const closed = card.isHoliday || card.isWeeklyOff;

	return (
		<div className="@container/page space-y-6">
			<Card className="shadow-none">
				<CardContent className="flex flex-col gap-5 @2xl/page:flex-row @2xl/page:items-center @2xl/page:justify-between">
					<div className="min-w-0 space-y-1">
						<h2 className="truncate text-lg font-medium">
							{card.employee.fullName}
						</h2>
						<div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
							<span>{card.employee.employeeCode}</span>
							<span className="bg-muted-foreground/70 size-1.5 rounded-full" />
							<span>{card.employee.designationName || "—"}</span>
							<span className="bg-muted-foreground/70 size-1.5 rounded-full" />
							<span>
								Shift {policy.workdayStart}–{policy.workdayEnd}
							</span>
						</div>
						<div className="flex flex-wrap items-center gap-2 pt-1">
							<AttendanceStatusBadge status={attendance?.status || "PENDING"} />
							{attendance?.approvalStatus === "pending" && (
								<Badge
									variant="outline"
									className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
								>
									Awaiting approval
								</Badge>
							)}
							{attendance?.approvalStatus === "approved" && (
								<Badge
									variant="outline"
									className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
								>
									<ShieldCheck className="size-3" /> Verified
								</Badge>
							)}
							{policy.geofenceExempt && (
								<Badge variant="secondary">Boundary exempt</Badge>
							)}
						</div>
					</div>

					<div className="flex shrink-0 flex-col gap-2 @sm/page:flex-row">
						<Button
							onClick={() => setDialog("in")}
							disabled={!card.canCheckIn || registerOnly}
							className="gap-2"
						>
							<LogIn className="size-4" /> Check in
						</Button>
						<Button
							variant="outline"
							onClick={() => setDialog("out")}
							disabled={!card.canCheckOut || registerOnly}
							className="gap-2"
						>
							<LogOut className="size-4" /> Check out
						</Button>
					</div>
				</CardContent>
			</Card>

			{registerOnly && (
				<div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
					Your school marks attendance from the office register, so there is
					nothing to punch here. Ask the head teacher or office to mark you.
				</div>
			)}

			{closed && (
				<div className="flex items-start gap-3 rounded-lg border border-sky-500/40 bg-sky-500/10 p-4 text-sm text-sky-700 dark:text-sky-400">
					<CalendarOff className="mt-0.5 size-4 shrink-0" />
					<span>
						{card.isHoliday
							? "School is closed today."
							: "Today is a weekly off day."}{" "}
						If you are on official duty you can still check in — pick a reason
						and it will go for approval.
					</span>
				</div>
			)}

			<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-3">
				<Card className="bg-card/70 shadow-none @3xl/page:col-span-1">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Today</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						{[
							["Shift date", card.shiftDate],
							["Checked in", formatTime(attendance?.checkInAt)],
							["Checked out", formatTime(attendance?.checkOutAt)],
							["Worked", formatDuration(attendance?.workedMinutes)],
							[
								"Late by",
								attendance?.lateMinutes
									? formatDuration(attendance.lateMinutes)
									: "—",
							],
						].map(([label, value]) => (
							<div key={label} className="flex items-center justify-between gap-3">
								<span className="text-muted-foreground">{label}</span>
								<span className="font-medium">{value}</span>
							</div>
						))}
						{attendance?.dutyReasonLabel && (
							<div className="flex items-center justify-between gap-3">
								<span className="text-muted-foreground">Duty</span>
								<span className="font-medium">{attendance.dutyReasonLabel}</span>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="bg-card/70 shadow-none @3xl/page:col-span-2">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Campus boundary</CardTitle>
					</CardHeader>
					<CardContent>
						{policy.geofenceEnabled && policy.geofence ? (
							<GeofenceMap
								geofence={policy.geofence}
								bufferMeters={policy.accuracyBufferMeters}
								height="h-56"
							/>
						) : (
							<div className="text-muted-foreground flex h-56 items-center justify-center rounded-lg border border-dashed text-sm">
								No campus boundary is set for your school.
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card className="bg-card/70 shadow-none">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Recent days</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{!history.length ? (
						<p className="text-muted-foreground py-6 text-center text-sm">
							No attendance recorded yet.
						</p>
					) : (
						history.map((row) => (
							<div
								key={row?.id}
								className={cn(
									"flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"
								)}
							>
								<div className="flex items-center gap-3">
									<Clock className="text-muted-foreground size-4" />
									<span className="font-medium">{row?.shiftDate}</span>
									<AttendanceStatusBadge status={row?.status || "PENDING"} />
								</div>
								<div className="text-muted-foreground flex items-center gap-4 text-xs">
									<span>In {formatTime(row?.checkInAt)}</span>
									<span>Out {formatTime(row?.checkOutAt)}</span>
									<span>{formatDuration(row?.workedMinutes)}</span>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			{dialog && (
				<PunchDialog
					open={!!dialog}
					onOpenChange={(open) => !open && setDialog(null)}
					card={card}
					action={dialog}
					onDone={() => mutate()}
				/>
			)}
		</div>
	);
}

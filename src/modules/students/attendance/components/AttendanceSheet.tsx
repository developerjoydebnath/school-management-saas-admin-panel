"use client";

import { ChartConfig } from "@/shared/components/ui/chart";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StudentAttendanceStatus } from "../dto/attendance.dto";
import { submitAttendance } from "../hooks/use-attendance-mutations";
import { useAttendanceRoster, useAttendanceTrend } from "../hooks/use-attendance";
import { AttendanceCalendar } from "./sheet/AttendanceCalendar";
import { AttendanceSheetHeader } from "./sheet/AttendanceSheetHeader";
import { AttendanceSheetStats } from "./sheet/AttendanceSheetStats";
import { AttendanceTable } from "./sheet/AttendanceTable";
import { AttendanceTrendChart } from "./sheet/AttendanceTrendChart";

// --- Chart Config ---
const trendConfig = {
	rate: { label: "Attendance %", color: "hsl(142, 76%, 36%)" },
} satisfies ChartConfig;

/** Local calendar date (not UTC) — must match the backend's `todayDateStr()`
 * so "today"/"editable" agree between client and server regardless of the
 * server's timezone offset from the browser's. */
function toDateStr(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export default function AttendanceSheet() {
	const params = useParams();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const classId = params?.classId as string;
	const sectionId = searchParams?.get("sectionId") || undefined;

	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [pendingStatus, setPendingStatus] = useState<Record<string, StudentAttendanceStatus>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const selectedDateStr = toDateStr(selectedDate);
	const isFuture = selectedDate > today && selectedDateStr !== toDateStr(today);

	const { data: rosterData, isLoading, mutate: mutateRoster } = useAttendanceRoster(classId, {
		date: selectedDateStr,
		sectionId,
	});
	const { data: trendData } = useAttendanceTrend(classId, { days: 30, sectionId });

	const roster = useMemo(() => rosterData?.roster || [], [rosterData]);
	const canEdit = rosterData?.editable ?? false;
	const isDateSubmitted = rosterData?.isTaken ?? false;
	const isToday = rosterData?.isToday ?? false;
	const isHoliday = rosterData?.isHoliday ?? false;

	// Seed the in-flight edit buffer from the server roster whenever it changes
	// (new date picked, or the roster reloads after a submit). PENDING students
	// stay unset here — nobody is presumed present until the teacher actually
	// marks them.
	useEffect(() => {
		const initial: Record<string, StudentAttendanceStatus> = {};
		roster.forEach((entry) => {
			if (entry.status !== "PENDING") {
				initial[entry.student.id] = entry.status as StudentAttendanceStatus;
			}
		});
		setPendingStatus(initial);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rosterData?.date, rosterData?.section?.id, roster.length]);

	const toggleStatus = useCallback(
		(studentId: string, status: "present" | "absent" | "late") => {
			if (!canEdit) return;
			const mapped =
				status === "absent"
					? StudentAttendanceStatus.ABSENT
					: status === "late"
						? StudentAttendanceStatus.LATE
						: StudentAttendanceStatus.PRESENT;
			setPendingStatus((prev) => ({ ...prev, [studentId]: mapped }));
		},
		[canEdit]
	);

	const allMarked = roster.length > 0 && roster.every((entry) => pendingStatus[entry.student.id]);

	const handleSubmit = useCallback(async () => {
		if (!canEdit || !roster.length || !allMarked) return;
		setIsSubmitting(true);
		try {
			await submitAttendance(classId, {
				date: selectedDateStr,
				sectionId,
				records: roster.map((entry) => ({
					studentId: entry.student.id,
					status: pendingStatus[entry.student.id],
				})),
			});
			toast.success("Attendance submitted successfully");
			await mutateRoster();
		} finally {
			setIsSubmitting(false);
		}
	}, [canEdit, roster, allMarked, classId, selectedDateStr, sectionId, pendingStatus, mutateRoster]);

	const filteredStudents = roster.map((entry) => ({
		id: entry.student.id,
		fullName: entry.student.fullName,
		studentId: entry.student.studentId,
		roll: entry.student.roll,
	}));

	const attendanceData: Record<string, "present" | "absent" | "late" | "unmarked"> = {};
	roster.forEach((entry) => {
		const status = pendingStatus[entry.student.id];
		attendanceData[entry.student.id] = !status
			? "unmarked"
			: status === "ABSENT"
				? "absent"
				: status === "LATE"
					? "late"
					: "present";
	});

	// Summary stats reflect the in-flight edit buffer so counts update live
	// while marking, before submit.
	const stats = (() => {
		const total = filteredStudents.length;
		const values = Object.values(attendanceData);
		const present = values.filter((v) => v === "present").length;
		const absent = values.filter((v) => v === "absent").length;
		const late = values.filter((v) => v === "late").length;
		const rate = total > 0 ? Math.round((present / total) * 100) : 0;
		return { total, present, absent, late, rate };
	})();

	const trendChartData = trendData
		.filter((point) => point.rate !== null)
		.map((point) => ({
			date: new Date(`${point.date}T00:00:00Z`).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				timeZone: "UTC",
			}),
			rate: point.rate as number,
		}));

	const className = rosterData ? getLocalizedName(rosterData.class.name, locale) : classId;
	const sectionName = rosterData?.section?.name || null;

	return (
		<div className="@container/attendance-sheet space-y-6">
			{/* Header */}
			<AttendanceSheetHeader
				className={className}
				section={sectionName}
				selectedDate={selectedDate}
				isDateSubmitted={isDateSubmitted}
				isToday={isToday}
				isHoliday={isHoliday}
			/>

			{/* Stats + Calendar Row */}
			<div className="grid grid-cols-1 gap-6 @4xl/attendance-sheet:grid-cols-[1fr_1fr_360px]">
				{/* Stats Cards & Chart */}
				<div className="space-y-4 @4xl/attendance-sheet:col-span-2">
					<AttendanceSheetStats stats={stats} />
					<AttendanceTrendChart trendData={trendChartData} trendConfig={trendConfig} />
				</div>

				{/* Calendar */}
				<AttendanceCalendar
					classId={classId}
					sectionId={sectionId}
					selectedDate={selectedDate}
					setSelectedDate={setSelectedDate}
					today={today}
				/>
			</div>

			{/* Attendance Table */}
			<AttendanceTable
				isFuture={isFuture}
				isHoliday={isHoliday}
				isLoading={isLoading}
				filteredStudents={filteredStudents}
				attendanceData={attendanceData}
				toggleStatus={toggleStatus}
				canEdit={canEdit}
				stats={stats}
				allMarked={allMarked}
				isSubmitting={isSubmitting}
				isDateSubmitted={isDateSubmitted}
				handleSubmit={handleSubmit}
			/>
		</div>
	);
}

"use client";

import { ChartConfig } from "@/shared/components/ui/chart";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AttendanceCalendar } from "./sheet/AttendanceCalendar";
import { AttendanceSheetHeader } from "./sheet/AttendanceSheetHeader";
import { AttendanceSheetStats } from "./sheet/AttendanceSheetStats";
import { AttendanceTable } from "./sheet/AttendanceTable";
import { AttendanceTrendChart } from "./sheet/AttendanceTrendChart";

type AttendanceStatus = "present" | "absent" | "late";

// --- Chart Config ---
const trendConfig = {
	rate: { label: "Attendance %", color: "hsl(142, 76%, 36%)" },
} satisfies ChartConfig;

// --- Demo 30-day trend data ---
function generateTrendData() {
	const data = [];
	const now = new Date();
	for (let i = 29; i >= 0; i--) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		// Skip Fridays (school holiday in BD)
		if (d.getDay() === 5) continue;
		const rate = 82 + Math.round(Math.sin(i * 0.5) * 8 + Math.random() * 6);
		data.push({
			date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
			rate: Math.min(100, Math.max(70, rate)),
		});
	}
	return data;
}

export default function AttendanceSheet() {
	const params = useParams();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const classId = params?.classId as string;
	const section = searchParams?.get("section") || null;

	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [submittedDates, setSubmittedDates] = useState<Set<string>>(new Set());

	const { data: classes } = useSWR("/classes");
	const { data: students, isLoading } = useSWR("/students");

	const currentClass = useMemo(
		() => classes?.find((c: any) => c.id === classId),
		[classes, classId]
	);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const selectedDateStr = selectedDate.toISOString().split("T")[0];
	const isToday = selectedDateStr === today.toISOString().split("T")[0];
	const isPast = selectedDate < today && !isToday;
	const isFuture = selectedDate > today;

	// Check if this date was already submitted
	const isDateSubmitted = submittedDates.has(selectedDateStr) || (isPast && !isToday);
	const canEdit = isToday && !isSubmitted && !isDateSubmitted;

	// Filter students for this class and section
	const filteredStudents = useMemo(() => {
		if (!students) return [];
		return students
			.filter((s: any) => {
				const matchClass = s.class === classId || s.class === `class-${classId}`;
				const matchSection = section ? s.section === section : true;
				return matchClass && matchSection && s.status === "ACTIVE";
			})
			.sort((a: any, b: any) => {
				const rollA = parseInt(a.roll || "999");
				const rollB = parseInt(b.roll || "999");
				return rollA - rollB;
			});
	}, [students, classId, section]);

	// Initialize attendance when students load or date changes
	useMemo(() => {
		if (filteredStudents.length > 0 && !isDateSubmitted) {
			const initial: Record<string, AttendanceStatus> = {};
			filteredStudents.forEach((s: any) => {
				initial[s.id] = "present"; // Default to present
			});
			// eslint-disable-next-line react-hooks/set-state-in-render
			setAttendanceData(initial);
			// eslint-disable-next-line react-hooks/set-state-in-render
			setIsSubmitted(false);
		} else if (isDateSubmitted) {
			// For past/submitted dates, generate deterministic mock data
			const mock: Record<string, AttendanceStatus> = {};
			filteredStudents.forEach((s: any, i: number) => {
				const hash = (s.id?.charCodeAt(0) || 0) + i + selectedDate.getDate();
				if (hash % 10 === 0) mock[s.id] = "late";
				else if (hash % 7 === 0) mock[s.id] = "absent";
				else mock[s.id] = "present";
			});
			// eslint-disable-next-line react-hooks/set-state-in-render
			setAttendanceData(mock);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filteredStudents.length, selectedDateStr, isDateSubmitted]);

	const toggleStatus = useCallback(
		(studentId: string, status: AttendanceStatus) => {
			if (!canEdit) return;
			setAttendanceData((prev) => ({
				...prev,
				[studentId]: status,
			}));
		},
		[canEdit]
	);

	const handleSubmit = useCallback(() => {
		setIsSubmitted(true);
		setSubmittedDates((prev) => new Set([...prev, selectedDateStr]));
	}, [selectedDateStr]);

	// Summary stats
	const stats = useMemo(() => {
		const total = filteredStudents.length;
		const present = Object.values(attendanceData).filter((v) => v === "present").length;
		const absent = Object.values(attendanceData).filter((v) => v === "absent").length;
		const late = Object.values(attendanceData).filter((v) => v === "late").length;
		const rate = total > 0 ? Math.round((present / total) * 100) : 0;
		return { total, present, absent, late, rate };
	}, [filteredStudents, attendanceData]);

	const trendData = useMemo(() => generateTrendData(), []);

	const className = currentClass ? getLocalizedName(currentClass.name, locale) : classId;

	return (
		<div className="@container/attendance-sheet space-y-6">
			{/* Header */}
			<AttendanceSheetHeader
				className={className}
				section={section}
				selectedDate={selectedDate}
				isDateSubmitted={isDateSubmitted}
				isToday={isToday}
				isSubmitted={isSubmitted}
			/>

			{/* Stats + Calendar Row */}
			<div className="grid grid-cols-1 gap-6 @4xl/attendance-sheet:grid-cols-[1fr_1fr_360px]">
				{/* Stats Cards & Chart */}
				<div className="space-y-4 @4xl/attendance-sheet:col-span-2">
					<AttendanceSheetStats stats={stats} />
					<AttendanceTrendChart trendData={trendData} trendConfig={trendConfig} />
				</div>

				{/* Calendar */}
				<AttendanceCalendar
					selectedDate={selectedDate}
					setSelectedDate={setSelectedDate}
					today={today}
				/>
			</div>

			{/* Attendance Table */}
			<AttendanceTable
				isFuture={isFuture}
				isLoading={isLoading}
				filteredStudents={filteredStudents}
				attendanceData={attendanceData}
				toggleStatus={toggleStatus}
				canEdit={canEdit}
				stats={stats}
				isSubmitted={isSubmitted}
				isDateSubmitted={isDateSubmitted}
				handleSubmit={handleSubmit}
			/>
		</div>
	);
}

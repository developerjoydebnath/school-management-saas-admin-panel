"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { ChartConfig } from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { GraduationCap } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { AttendanceCharts } from "./overview/AttendanceCharts";
import { ClassGridView } from "./overview/ClassGridView";
import { ClassListView } from "./overview/ClassListView";
import { StatsCards } from "./overview/StatsCards";
import { ViewToggle } from "./overview/ViewToggle";

// --- Chart Configs ---
const overviewBarConfig = {
	present: { label: "Present", color: "hsl(142, 76%, 36%)" },
	absent: { label: "Absent", color: "hsl(0, 84%, 60%)" },
	late: { label: "Late", color: "hsl(38, 92%, 50%)" },
} satisfies ChartConfig;

const overviewPieConfig = {
	present: { label: "Present", color: "hsl(142, 76%, 36%)" },
	absent: { label: "Absent", color: "hsl(0, 84%, 60%)" },
	late: { label: "Late", color: "hsl(38, 92%, 50%)" },
} satisfies ChartConfig;

type ViewMode = "grid" | "list";

export default function AttendanceOverview() {
	const locale = useLocale();
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	const { data: classes, isLoading: isLoadingClasses } = useSWR("/classes");
	const { data: students, isLoading: isLoadingStudents } = useSWR("/students");

	const isLoading = isLoadingClasses || isLoadingStudents;

	// Mock today's attendance summary by class
	const classSummaries = useMemo(() => {
		if (!classes || !students) return [];

		return classes
			.filter((cls: any) => cls.status === "ACTIVE")
			.map((cls: any) => {
				const sections = cls.sections || [];
				const classStudents = students.filter(
					(s: any) =>
						(s.class === cls.id || s.class === `class-${cls.id}`) &&
						s.status === "ACTIVE"
				);

				const total = classStudents.length;
				// Generate deterministic demo data per class
				const seed = cls.id?.charCodeAt(0) || 5;
				const presentRate = 80 + (seed % 15);
				const present = Math.round((total * presentRate) / 100);
				const lateCount = Math.min(Math.round(total * 0.05), total - present);
				const absent = total - present - lateCount;

				const sectionData = sections.map((sec: any) => {
					const secName = typeof sec === "string" ? sec : sec.name || sec;
					const secStudents = classStudents.filter((s: any) => s.section === secName);
					const secTotal = secStudents.length;
					const secPresent = Math.round(
						(secTotal * (78 + ((secName.charCodeAt(0) * 7) % 18))) / 100
					);
					const secLate = Math.min(Math.round(secTotal * 0.04), secTotal - secPresent);
					return {
						name: secName,
						total: secTotal,
						present: secPresent,
						absent: secTotal - secPresent - secLate,
						late: secLate,
					};
				});

				return {
					id: cls.id,
					name: cls.name,
					total,
					present,
					absent,
					late: lateCount,
					presentRate,
					sections: sectionData,
					hasSections: sections.length > 0,
				};
			});
	}, [classes, students]);

	// Aggregated totals
	const totals = useMemo(() => {
		return classSummaries.reduce(
			(acc: any, cls: any) => ({
				totalStudents: acc.totalStudents + cls.total,
				present: acc.present + cls.present,
				absent: acc.absent + cls.absent,
				late: acc.late + cls.late,
			}),
			{ totalStudents: 0, present: 0, absent: 0, late: 0 }
		);
	}, [classSummaries]);

	const presentPercentage =
		totals.totalStudents > 0 ? Math.round((totals.present / totals.totalStudents) * 100) : 0;

	// Weekly attendance data (mock)
	const weeklyData = [
		{ day: "Sun", present: 418, absent: 32, late: 12 },
		{ day: "Mon", present: 435, absent: 18, late: 9 },
		{ day: "Tue", present: 425, absent: 25, late: 12 },
		{ day: "Wed", present: 440, absent: 12, late: 10 },
		{ day: "Thu", present: 430, absent: 20, late: 12 },
	];

	const pieData = [
		{
			name: "Present",
			value: totals.present,
			fill: "hsl(142, 76%, 36%)",
		},
		{ name: "Absent", value: totals.absent, fill: "hsl(0, 84%, 60%)" },
		{ name: "Late", value: totals.late, fill: "hsl(38, 92%, 50%)" },
	];

	return (
		<div className="space-y-6">
			{/* Top Stats */}
			<StatsCards
				isLoading={isLoading}
				totals={totals}
				presentPercentage={presentPercentage}
			/>

			{/* Charts Row */}
			<AttendanceCharts
				weeklyData={weeklyData}
				pieData={pieData}
				overviewBarConfig={overviewBarConfig}
				overviewPieConfig={overviewPieConfig}
			/>

			{/* Class/Section Cards */}
			<div className="space-y-4">
				{/* Header with View Toggle */}
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Select Class / Section</h2>
					<ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
				</div>

				{isLoading ? (
					<div
						className={
							viewMode === "grid"
								? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
								: "space-y-3"
						}
					>
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton
								key={i}
								className={
									viewMode === "grid" ? "h-[260px] rounded-xl" : "h-16 rounded-lg"
								}
							/>
						))}
					</div>
				) : classSummaries.length === 0 ? (
					<Card className="border-dashed py-16 text-center">
						<CardContent>
							<GraduationCap className="text-muted-foreground/40 mx-auto h-12 w-12" />
							<p className="text-muted-foreground mt-4">No active classes found.</p>
						</CardContent>
					</Card>
				) : viewMode === "grid" ? (
					<ClassGridView classSummaries={classSummaries} locale={locale} />
				) : (
					<ClassListView classSummaries={classSummaries} locale={locale} />
				)}
			</div>
		</div>
	);
}

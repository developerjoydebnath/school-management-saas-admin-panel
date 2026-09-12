"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { ChartConfig } from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { GraduationCap } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useAttendanceOverview, useAttendanceWeeklySummary } from "../hooks/use-attendance";
import { AttendanceCharts } from "./overview/AttendanceCharts";
import { ClassGridView } from "./overview/ClassGridView";
import { ClassListView } from "./overview/ClassListView";
import { StatsCards } from "./overview/StatsCards";
import { ViewToggle } from "./overview/ViewToggle";

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

	const { data: overview, isLoading } = useAttendanceOverview();
	const { data: weeklySummary, isLoading: isLoadingWeekly } = useAttendanceWeeklySummary(7);

	const weeklyData = weeklySummary.map((day) => ({
		date: day.date,
		present: day.present,
		absent: day.absent,
		late: day.late,
	}));

	const classSummaries = overview?.classes || [];
	const totals = overview?.totals || { totalStudents: 0, present: 0, absent: 0, late: 0 };

	const presentPercentage =
		totals.totalStudents > 0 ? Math.round((totals.present / totals.totalStudents) * 100) : 0;

	const pieData = [
		{ name: "Present", value: totals.present, fill: "hsl(142, 76%, 36%)" },
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
				isLoading={isLoading || isLoadingWeekly}
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

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { CalendarCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

interface AttendanceChartsProps {
	weeklyData: any[];
	pieData: any[];
	overviewBarConfig: ChartConfig;
	overviewPieConfig: ChartConfig;
}

export function AttendanceCharts({
	weeklyData,
	pieData,
	overviewBarConfig,
	overviewPieConfig,
}: AttendanceChartsProps) {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			{/* Weekly Attendance Bar */}
			<Card className="border-none shadow-sm lg:col-span-2">
				<CardHeader className="border-b pb-3">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<CalendarCheck className="text-muted-foreground h-4 w-4" />
						This Week&apos;s Attendance
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<ChartContainer config={overviewBarConfig} className="h-[200px] w-full">
						<BarChart
							data={weeklyData}
							margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="day"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis fontSize={12} tickLine={false} axisLine={false} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Bar
								dataKey="present"
								fill="var(--color-present)"
								radius={[4, 4, 0, 0]}
								stackId="a"
							/>
							<Bar
								dataKey="late"
								fill="var(--color-late)"
								radius={[0, 0, 0, 0]}
								stackId="a"
							/>
							<Bar
								dataKey="absent"
								fill="var(--color-absent)"
								radius={[4, 4, 0, 0]}
								stackId="a"
							/>
						</BarChart>
					</ChartContainer>
					<div className="mt-3 flex justify-center gap-5">
						{[
							{ key: "present", color: "bg-green-600", label: "Present" },
							{ key: "late", color: "bg-amber-500", label: "Late" },
							{ key: "absent", color: "bg-red-500", label: "Absent" },
						].map((item) => (
							<div key={item.key} className="flex items-center gap-1.5 text-xs">
								<div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
								<span className="text-muted-foreground">{item.label}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Today's Distribution Pie */}
			<Card className="border-none shadow-sm">
				<CardHeader className="border-b pb-3">
					<CardTitle className="text-base font-semibold">
						Today&apos;s Distribution
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<ChartContainer
						config={overviewPieConfig}
						className="mx-auto h-[160px] w-full max-w-[200px]"
					>
						<PieChart>
							<ChartTooltip content={<ChartTooltipContent hideLabel />} />
							<Pie
								data={pieData}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								innerRadius={40}
								outerRadius={70}
								paddingAngle={3}
							>
								{pieData.map((entry, i) => (
									<Cell key={i} fill={entry.fill} />
								))}
							</Pie>
						</PieChart>
					</ChartContainer>
					<div className="mt-3 space-y-2">
						{pieData.map((entry) => (
							<div
								key={entry.name}
								className="flex items-center justify-between text-xs"
							>
								<div className="flex items-center gap-2">
									<div
										className="h-2.5 w-2.5 rounded-full"
										style={{ backgroundColor: entry.fill }}
									/>
									<span className="text-muted-foreground">{entry.name}</span>
								</div>
								<span className="font-semibold">{entry.value}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

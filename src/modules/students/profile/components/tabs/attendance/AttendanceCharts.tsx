"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";

const monthlyAttendance = [
	{ month: "Jul", present: 22, absent: 2, late: 1, leave: 0, total: 25 },
	{ month: "Aug", present: 20, absent: 1, late: 2, leave: 2, total: 25 },
	{ month: "Sep", present: 23, absent: 0, late: 1, leave: 1, total: 25 },
	{ month: "Oct", present: 21, absent: 2, late: 1, leave: 1, total: 25 },
	{ month: "Nov", present: 24, absent: 0, late: 1, leave: 0, total: 25 },
	{ month: "Dec", present: 18, absent: 2, late: 3, leave: 2, total: 25 },
	{ month: "Jan", present: 22, absent: 1, late: 1, leave: 1, total: 25 },
	{ month: "Feb", present: 20, absent: 1, late: 2, leave: 2, total: 25 },
	{ month: "Mar", present: 23, absent: 1, late: 0, leave: 1, total: 25 },
	{ month: "Apr", present: 24, absent: 0, late: 1, leave: 0, total: 25 },
];

const attendancePercentTrend = monthlyAttendance.map((m) => ({
	month: m.month,
	percent: Math.round((m.present / m.total) * 100),
}));

const attendanceSummary = [
	{ name: "Present", value: 217, fill: "hsl(142, 76%, 36%)" },
	{ name: "Absent", value: 10, fill: "hsl(0, 84%, 60%)" },
	{ name: "Late", value: 13, fill: "hsl(45, 93%, 47%)" },
	{ name: "Leave", value: 10, fill: "hsl(200, 80%, 50%)" },
];

const barConfig = {
	present: { label: "Present", color: "hsl(142, 76%, 36%)" },
	absent: { label: "Absent", color: "hsl(0, 84%, 60%)" },
	late: { label: "Late", color: "hsl(45, 93%, 47%)" },
	leave: { label: "Leave", color: "hsl(200, 80%, 50%)" },
} satisfies ChartConfig;

const pieConfig = {
	Present: { label: "Present", color: "hsl(142, 76%, 36%)" },
	Absent: { label: "Absent", color: "hsl(0, 84%, 60%)" },
	Late: { label: "Late", color: "hsl(45, 93%, 47%)" },
	Leave: { label: "Leave", color: "hsl(200, 80%, 50%)" },
} satisfies ChartConfig;

const lineConfig = {
	percent: { label: "Attendance %", color: "hsl(262, 83%, 58%)" },
} satisfies ChartConfig;

export function AttendanceCharts() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Monthly Stacked Bar */}
				<Card className="border-none shadow-sm lg:col-span-2">
					<CardHeader className="border-b pb-3">
						<CardTitle className="text-base font-semibold">
							Monthly Attendance Breakdown
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<ChartContainer config={barConfig} className="h-[260px] w-full">
							<BarChart
								data={monthlyAttendance}
								margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="month"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis fontSize={12} tickLine={false} axisLine={false} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey="present" stackId="a" fill="var(--color-present)" />
								<Bar dataKey="leave" stackId="a" fill="var(--color-leave)" />
								<Bar dataKey="late" stackId="a" fill="var(--color-late)" />
								<Bar
									dataKey="absent"
									stackId="a"
									fill="var(--color-absent)"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Pie Chart */}
				<Card className="border-none shadow-sm">
					<CardHeader className="border-b pb-3">
						<CardTitle className="text-base font-semibold">Overall Breakdown</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<ChartContainer
							config={pieConfig}
							className="mx-auto h-[180px] w-full max-w-[220px]"
						>
							<PieChart>
								<ChartTooltip content={<ChartTooltipContent hideLabel />} />
								<Pie
									data={attendanceSummary}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={45}
									outerRadius={75}
									paddingAngle={4}
								>
									{attendanceSummary.map((entry, index) => (
										<Cell key={index} fill={entry.fill} />
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="mt-3 flex flex-wrap justify-center gap-3">
							{attendanceSummary.map((s) => (
								<div key={s.name} className="flex items-center gap-1.5 text-xs">
									<div
										className="h-2.5 w-2.5 rounded-full"
										style={{ backgroundColor: s.fill }}
									/>
									<span className="font-medium">{s.name}</span>
									<span className="text-muted-foreground">({s.value})</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Attendance % Trend */}
			<Card className="border-none shadow-sm">
				<CardHeader className="border-b pb-3">
					<CardTitle className="text-base font-semibold">
						Attendance Rate Trend (%)
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<ChartContainer config={lineConfig} className="h-[200px] w-full">
						<LineChart
							data={attendancePercentTrend}
							margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="month"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								domain={[70, 100]}
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<ChartTooltip content={<ChartTooltipContent />} />
							<Line
								type="monotone"
								dataKey="percent"
								stroke="var(--color-percent)"
								strokeWidth={2.5}
								dot={{ r: 4, fill: "hsl(262, 83%, 58%)" }}
							/>
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
}

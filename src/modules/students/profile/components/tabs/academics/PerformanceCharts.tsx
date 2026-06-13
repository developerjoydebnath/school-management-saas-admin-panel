"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	XAxis,
	YAxis,
} from "recharts";

// --- Demo Data ---
const examResults = [
	{ exam: "1st Term", average: 82, math: 91, english: 74 },
	{ exam: "2nd Term", average: 83, math: 88, english: 78 },
	{ exam: "Midterm", average: 83, math: 95, english: 80 },
	{ exam: "Final", average: 89, math: 92, english: 85 },
];

const academicHistory = [
	{ class: "Class 5", year: "2022", rank: 12, roll: 15 },
	{ class: "Class 6", year: "2023", rank: 8, roll: 12 },
	{ class: "Class 7", year: "2024", rank: 4, roll: 8 },
	{ class: "Class 8", year: "2025", rank: 2, roll: 4 },
];

const subjectPerformance = [
	{ subject: "Bangla", marks: 90 },
	{ subject: "English", marks: 85 },
	{ subject: "Mathematics", marks: 92 },
	{ subject: "Science", marks: 91 },
	{ subject: "Social Science", marks: 84 },
	{ subject: "Religion", marks: 92 },
	{ subject: "ICT", marks: 86 },
];

const radarData = [
	{ subject: "Bangla", score: 90, classAvg: 72 },
	{ subject: "English", score: 85, classAvg: 68 },
	{ subject: "Math", score: 92, classAvg: 65 },
	{ subject: "Science", score: 91, classAvg: 70 },
	{ subject: "Social", score: 84, classAvg: 74 },
	{ subject: "Religion", score: 92, classAvg: 78 },
	{ subject: "ICT", score: 86, classAvg: 71 },
];

const lineChartConfig = {
	average: { label: "Average", color: "hsl(200, 80%, 50%)" },
	math: { label: "Math", color: "hsl(142, 76%, 36%)" },
	english: { label: "English", color: "hsl(24, 95%, 53%)" },
} satisfies ChartConfig;

const historyConfig = {
	rank: { label: "Final Rank", color: "hsl(262, 83%, 58%)" },
	roll: { label: "Roll No", color: "hsl(200, 80%, 50%)" },
} satisfies ChartConfig;

const barChartConfig = {
	marks: { label: "Marks", color: "hsl(200, 80%, 50%)" },
} satisfies ChartConfig;

const radarConfig = {
	score: { label: "Student", color: "hsl(200, 80%, 50%)" },
	classAvg: { label: "Class Avg", color: "hsl(0, 0%, 70%)" },
} satisfies ChartConfig;

export function PerformanceCharts() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Performance Trend Line */}
				<Card className="border-none shadow-sm">
					<CardHeader className="border-b pb-3">
						<CardTitle className="text-base font-semibold">Current Session Performance</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<ChartContainer config={lineChartConfig} className="h-[260px] w-full">
							<LineChart data={examResults} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="exam" fontSize={12} tickLine={false} axisLine={false} />
								<YAxis domain={[60, 100]} fontSize={12} tickLine={false} axisLine={false} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Line type="monotone" dataKey="average" stroke="var(--color-average)" strokeWidth={2.5} dot={{ r: 4 }} />
								<Line type="monotone" dataKey="math" stroke="var(--color-math)" strokeWidth={1.5} strokeDasharray="5 5" />
								<Line type="monotone" dataKey="english" stroke="var(--color-english)" strokeWidth={1.5} strokeDasharray="5 5" />
							</LineChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Multi-Year Academic Journey */}
				<Card className="border-none shadow-sm">
					<CardHeader className="border-b pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base font-semibold">Academic Journey (Past Classes)</CardTitle>
							<Badge variant="outline" className="text-[10px] font-normal">Final Exam Stats</Badge>
						</div>
					</CardHeader>
					<CardContent className="pt-4">
						<ChartContainer config={historyConfig} className="h-[260px] w-full">
							<LineChart data={academicHistory} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="class"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value, index) => `${value} (${academicHistory[index].year})`}
								/>
								<YAxis reversed domain={[1, "dataMax + 5"]} fontSize={12} tickLine={false} axisLine={false} />
								<ChartTooltip
									content={
										<ChartTooltipContent
											labelFormatter={(value, payload) => {
												if (payload && payload.length > 0) {
													return `${value} (${payload[0].payload.year})`;
												}
												return value;
											}}
										/>
									}
								/>
								<Line
									type="stepAfter"
									dataKey="rank"
									stroke="var(--color-rank)"
									strokeWidth={3}
									dot={{ r: 6, fill: "var(--color-rank)", strokeWidth: 2, stroke: "#fff" }}
									activeDot={{ r: 8 }}
								/>
								<Line
									type="monotone"
									dataKey="roll"
									stroke="var(--color-roll)"
									strokeWidth={2}
									strokeDasharray="5 5"
									dot={{ r: 4, fill: "var(--color-roll)" }}
								/>
							</LineChart>
						</ChartContainer>
						<div className="mt-4 flex justify-center gap-6">
							<div className="flex items-center gap-2">
								<div className="h-0.5 w-6 bg-[hsl(262,83%,58%)]" />
								<span className="text-xs text-muted-foreground">Class Rank</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-0.5 w-6 border-t-2 border-dashed border-[hsl(200,80%,50%)]" />
								<span className="text-xs text-muted-foreground">Roll Number</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{/* Subject Marks Bar */}
				<Card className="border-none shadow-sm md:col-span-2">
					<CardHeader className="border-b pb-3">
						<CardTitle className="text-base font-semibold">Subject-wise Marks (Latest Exam)</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<ChartContainer config={barChartConfig} className="h-[250px] w-full">
							<BarChart data={subjectPerformance} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="subject" fontSize={10} tickLine={false} axisLine={false} angle={-15} textAnchor="end" height={45} />
								<YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey="marks" radius={[4, 4, 0, 0]} fill="var(--color-marks)" />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Radar Chart - Student vs Class */}
				<Card className="border-none shadow-sm">
					<CardHeader className="border-b pb-3">
						<CardTitle className="text-base font-semibold">Skill Distribution</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<ChartContainer config={radarConfig} className="mx-auto h-[200px] w-full max-w-[280px]">
							<RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
								<PolarGrid strokeDasharray="3 3" />
								<PolarAngleAxis dataKey="subject" fontSize={9} />
								<PolarRadiusAxis domain={[0, 100]} fontSize={8} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Radar dataKey="score" stroke="var(--color-score)" fill="var(--color-score)" fillOpacity={0.25} strokeWidth={2} />
								<Radar dataKey="classAvg" stroke="var(--color-classAvg)" fill="var(--color-classAvg)" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
							</RadarChart>
						</ChartContainer>
						<div className="mt-2 flex justify-center gap-4">
							<div className="flex items-center gap-1.5 text-[10px]">
								<div className="h-2 w-2 rounded-full bg-blue-500" />
								<span>Student</span>
							</div>
							<div className="flex items-center gap-1.5 text-[10px]">
								<div className="h-2 w-2 rounded-full bg-gray-400" />
								<span>Class Avg</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Progress } from "@/shared/components/ui/progress";
import { Line, LineChart, Pie, PieChart, XAxis, YAxis, Cell } from "recharts";

const rankProgress = [
	{ exam: "1st Term", rank: 8 },
	{ exam: "2nd Term", rank: 6 },
	{ exam: "Midterm", rank: 4 },
	{ exam: "Final", rank: 2 },
];

const gradeDistribution = [
	{ name: "A+", value: 4, fill: "hsl(142, 76%, 36%)" },
	{ name: "A", value: 3, fill: "hsl(200, 80%, 50%)" },
];

const historyConfig = {
	rank: { label: "Final Rank", color: "hsl(262, 83%, 58%)" },
} satisfies ChartConfig;

const pieConfig = {
	"A+": { label: "A+", color: "hsl(142, 76%, 36%)" },
	A: { label: "A", color: "hsl(200, 80%, 50%)" },
} satisfies ChartConfig;

export function RankGradeOverview() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
			{/* Rank Progress (Within Year) */}
			<Card className="border-none shadow-sm">
				<CardHeader className="border-b pb-3">
					<CardTitle className="text-base font-semibold">Rank Progress (This Year)</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<ChartContainer config={historyConfig} className="h-[120px] w-full">
						<LineChart data={rankProgress} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
							<XAxis dataKey="exam" fontSize={9} tickLine={false} axisLine={false} />
							<YAxis reversed domain={[1, 10]} fontSize={10} tickLine={false} axisLine={false} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Line type="monotone" dataKey="rank" stroke="var(--color-rank)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(262, 83%, 58%)" }} />
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{/* Grade Split */}
			<Card className="border-none shadow-sm md:col-span-2">
				<CardHeader className="border-b pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-semibold">Grade Distribution</CardTitle>
						<div className="flex gap-4">
							{gradeDistribution.map((g) => (
								<div key={g.name} className="flex items-center gap-1.5 text-xs">
									<div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.fill }} />
									<span>{g.name}: {g.value}</span>
								</div>
							))}
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex items-center justify-center pt-4">
					<ChartContainer config={pieConfig} className="h-[120px] w-[200px]">
						<PieChart>
							<ChartTooltip content={<ChartTooltipContent hideLabel />} />
							<Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5}>
								{gradeDistribution.map((e, i) => (
									<Cell key={i} fill={e.fill} />
								))}
							</Pie>
						</PieChart>
					</ChartContainer>
					<div className="ml-6 flex-1 space-y-2">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Distinction (A+)</span>
							<span className="font-semibold text-green-600">4 Subjects</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Excellent (A)</span>
							<span className="font-semibold text-blue-600">3 Subjects</span>
						</div>
						<Progress value={57} className="h-1.5" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

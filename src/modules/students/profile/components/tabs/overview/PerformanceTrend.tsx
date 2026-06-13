"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const performanceTrend = [
	{ month: "Jul", score: 78 },
	{ month: "Aug", score: 80 },
	{ month: "Sep", score: 82 },
	{ month: "Oct", score: 79 },
	{ month: "Nov", score: 85 },
	{ month: "Dec", score: 83 },
	{ month: "Jan", score: 87 },
	{ month: "Feb", score: 86 },
	{ month: "Mar", score: 89 },
	{ month: "Apr", score: 92 },
];

const areaConfig = {
	score: { label: "Score", color: "hsl(200, 80%, 50%)" },
} satisfies ChartConfig;

export function PerformanceTrend() {
	return (
		<Card className="gap-2">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Activity className="text-muted-foreground h-4 w-4" />
					Performance Trend
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-4">
				<ChartContainer config={areaConfig} className="h-[220px] w-full">
					<AreaChart
						data={performanceTrend}
						margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
					>
						<defs>
							<linearGradient id="gradientScore" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stopColor="hsl(200, 80%, 50%)"
									stopOpacity={0.3}
								/>
								<stop
									offset="100%"
									stopColor="hsl(200, 80%, 50%)"
									stopOpacity={0.02}
								/>
							</linearGradient>
						</defs>
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
						<Area
							type="monotone"
							dataKey="score"
							stroke="var(--color-score)"
							strokeWidth={2.5}
							fill="url(#gradientScore)"
							dot={{ r: 3, fill: "hsl(200, 80%, 50%)" }}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

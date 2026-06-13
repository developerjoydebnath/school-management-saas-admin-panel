"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface AttendanceTrendChartProps {
	trendData: any[];
	trendConfig: ChartConfig;
}

export function AttendanceTrendChart({ trendData, trendConfig }: AttendanceTrendChartProps) {
	return (
		<Card className="h-fit gap-0">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-sm font-semibold">
					<TrendingUp className="text-muted-foreground h-4 w-4" />
					30-Day Attendance Trend
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-4">
				<ChartContainer config={trendConfig} className="h-[296px] w-full">
					<AreaChart
						data={trendData}
						margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
					>
						<defs>
							<linearGradient id="attendGradient" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="hsl(142, 76%, 36%)"
									stopOpacity={0.3}
								/>
								<stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="date"
							fontSize={9}
							tickLine={false}
							axisLine={false}
							interval="preserveStartEnd"
						/>
						<YAxis domain={[65, 100]} fontSize={10} tickLine={false} axisLine={false} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<Area
							type="monotone"
							dataKey="rate"
							stroke="var(--color-rate)"
							fill="url(#attendGradient)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

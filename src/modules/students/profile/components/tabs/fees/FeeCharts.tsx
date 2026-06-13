"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { TrendingUp } from "lucide-react";
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

const monthlyPayments = [
	{ month: "Jul", paid: 3000, due: 0 },
	{ month: "Aug", paid: 3000, due: 0 },
	{ month: "Sep", paid: 3000, due: 0 },
	{ month: "Oct", paid: 2500, due: 500 },
	{ month: "Nov", paid: 3000, due: 0 },
	{ month: "Dec", paid: 1000, due: 2000 },
	{ month: "Jan", paid: 3000, due: 0 },
	{ month: "Feb", paid: 0, due: 3000 },
];

const feeBreakdown = [
	{ name: "Tuition Fee", value: 15000, fill: "hsl(200, 80%, 50%)" },
	{ name: "Exam Fee", value: 3000, fill: "hsl(142, 76%, 36%)" },
	{ name: "Lab Fee", value: 2000, fill: "hsl(262, 83%, 58%)" },
	{ name: "Library Fee", value: 1500, fill: "hsl(45, 93%, 47%)" },
	{ name: "Sports Fee", value: 1000, fill: "hsl(24, 95%, 53%)" },
	{ name: "Transport Fee", value: 1500, fill: "hsl(340, 82%, 52%)" },
];

const cumulativePayments = [
	{ month: "Jul", cumulative: 3000, target: 3000 },
	{ month: "Aug", cumulative: 6000, target: 6000 },
	{ month: "Sep", cumulative: 9000, target: 9000 },
	{ month: "Oct", cumulative: 11500, target: 12000 },
	{ month: "Nov", cumulative: 14500, target: 15000 },
	{ month: "Dec", cumulative: 15500, target: 18000 },
	{ month: "Jan", cumulative: 18500, target: 21000 },
	{ month: "Feb", cumulative: 18500, target: 24000 },
];

const barConfig = {
	paid: { label: "Paid", color: "hsl(142, 76%, 36%)" },
	due: { label: "Due", color: "hsl(0, 84%, 60%)" },
} satisfies ChartConfig;

const pieConfig = {
	"Tuition Fee": { label: "Tuition", color: "hsl(200, 80%, 50%)" },
	"Exam Fee": { label: "Exam", color: "hsl(142, 76%, 36%)" },
	"Lab Fee": { label: "Lab", color: "hsl(262, 83%, 58%)" },
	"Library Fee": { label: "Library", color: "hsl(45, 93%, 47%)" },
	"Sports Fee": { label: "Sports", color: "hsl(24, 95%, 53%)" },
	"Transport Fee": { label: "Transport", color: "hsl(340, 82%, 52%)" },
} satisfies ChartConfig;

const lineConfig = {
	cumulative: { label: "Actual Paid", color: "hsl(142, 76%, 36%)" },
	target: { label: "Expected", color: "hsl(0, 0%, 70%)" },
} satisfies ChartConfig;

export function FeeCharts() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Monthly Payments Bar */}
				<Card className="border-none shadow-sm lg:col-span-2">
					<CardHeader className="border-b pb-3">
						<CardTitle className="text-base font-semibold">Monthly Payment vs Due</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<ChartContainer config={barConfig} className="h-[260px] w-full">
							<BarChart data={monthlyPayments} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
								<YAxis fontSize={12} tickLine={false} axisLine={false} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey="paid" fill="var(--color-paid)" radius={[4, 4, 0, 0]} />
								<Bar dataKey="due" fill="var(--color-due)" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Pie */}
				<Card className="border-none shadow-sm">
					<CardHeader className="border-b pb-3">
						<CardTitle className="text-base font-semibold">Fee Structure</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<ChartContainer config={pieConfig} className="mx-auto h-[180px] w-full max-w-[220px]">
							<PieChart>
								<ChartTooltip content={<ChartTooltipContent hideLabel />} />
								<Pie data={feeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
									{feeBreakdown.map((e, i) => (
										<Cell key={i} fill={e.fill} />
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="mt-3 grid grid-cols-2 gap-1.5">
							{feeBreakdown.map((f) => (
								<div key={f.name} className="flex items-center gap-1.5 text-xs">
									<div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: f.fill }} />
									<span className="truncate">{f.name}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Cumulative Payments vs Target */}
			<Card className="border-none shadow-sm">
				<CardHeader className="border-b pb-3">
					<div className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
						<CardTitle className="text-base font-semibold">Cumulative Payments vs Expected</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<ChartContainer config={lineConfig} className="h-[220px] w-full">
						<LineChart data={cumulativePayments} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
							<YAxis fontSize={12} tickLine={false} axisLine={false} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Line type="monotone" dataKey="target" stroke="var(--color-target)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
							<Line type="monotone" dataKey="cumulative" stroke="var(--color-cumulative)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(142, 76%, 36%)" }} />
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
}

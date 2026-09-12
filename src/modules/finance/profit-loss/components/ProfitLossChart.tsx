"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTranslations } from "next-intl";
import {
	Area,
	AreaChart,
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
import { ProfitLossStatement } from "../models/profit-loss.model";
import { compactTaka, formatTaka } from "./profit-loss.utils";

/**
 * Income, expense and net all measure taka, so they share one axis. A second
 * y-axis would let the reader compare two different scales as if they were the
 * same picture — the classic way to make a chart lie.
 */
const chartConfig = {
	income: {
		label: "Income",
		// Stepped per theme rather than reused: the same green that reads well
		// on white is muddy on the dark ground, and Tailwind's palette variables
		// are tree-shaken out of the build when no class references them.
		theme: { light: "oklch(0.63 0.14 158)", dark: "oklch(0.76 0.15 158)" },
	},
	expense: {
		label: "Expense",
		theme: { light: "oklch(0.62 0.19 17)", dark: "oklch(0.72 0.18 17)" },
	},
	net: {
		label: "Net",
		theme: { light: "oklch(0.28 0 0)", dark: "oklch(0.92 0 0)" },
	},
	cumulativeNet: {
		label: "Running Net",
		theme: { light: "oklch(0.28 0 0)", dark: "oklch(0.92 0 0)" },
	},
} satisfies ChartConfig;

export default function ProfitLossChart({
	statement,
}: {
	statement: ProfitLossStatement;
}) {
	const t = useTranslations("ProfitLoss");
	const data = statement.monthly;
	const hasData = data.some((row) => row.income > 0 || row.expense > 0);

	const tooltip = (
		<ChartTooltip
			content={
				<ChartTooltipContent
					formatter={(value, name) => (
						<div className="flex w-full items-center justify-between gap-4">
							<span className="text-muted-foreground">
								{chartConfig[name as keyof typeof chartConfig]?.label ?? name}
							</span>
							<span className="font-medium tabular-nums">{formatTaka(value)}</span>
						</div>
					)}
				/>
			}
		/>
	);

	return (
		<Card className="bg-card/70 border-border/70 rounded-md">
			<CardHeader className="gap-3 pb-3 @2xl/page:flex-row @2xl/page:items-start @2xl/page:justify-between">
				<div>
					<CardTitle className="text-base">{t("chartTitle")}</CardTitle>
					<p className="text-muted-foreground text-xs">{t("chartDescription")}</p>
				</div>
			</CardHeader>
			<CardContent>
				{hasData ? (
					<Tabs defaultValue="monthly">
						<TabsList className="mb-4">
							<TabsTrigger value="monthly">{t("tabMonthly")}</TabsTrigger>
							<TabsTrigger value="cumulative">{t("tabCumulative")}</TabsTrigger>
						</TabsList>

						<TabsContent value="monthly">
							<ChartContainer config={chartConfig} className="h-[300px] w-full">
								<ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
									<CartesianGrid strokeDasharray="3 3" vertical={false} />
									<XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
									<YAxis
										tickLine={false}
										axisLine={false}
										fontSize={12}
										width={56}
										tickFormatter={compactTaka}
									/>
									{/* Zero is the line between surplus and deficit; without it a
									    dip below the axis is easy to miss. */}
									<ReferenceLine y={0} stroke="var(--border)" />
									{tooltip}
									<ChartLegend content={<ChartLegendContent />} />
									<Bar
										dataKey="income"
										fill="var(--color-income)"
										radius={[4, 4, 0, 0]}
										maxBarSize={28}
									/>
									<Bar
										dataKey="expense"
										fill="var(--color-expense)"
										radius={[4, 4, 0, 0]}
										maxBarSize={28}
									/>
									<Line
										type="monotone"
										dataKey="net"
										stroke="var(--color-net)"
										strokeWidth={2}
										dot={{ r: 2.5, fill: "var(--color-net)" }}
									/>
								</ComposedChart>
							</ChartContainer>
						</TabsContent>

						<TabsContent value="cumulative">
							<ChartContainer config={chartConfig} className="h-[300px] w-full">
								<AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
									<defs>
										<linearGradient id="profitLossCumulative" x1="0" y1="0" x2="0" y2="1">
											<stop
												offset="0%"
												stopColor="var(--color-cumulativeNet)"
												stopOpacity={0.3}
											/>
											<stop
												offset="100%"
												stopColor="var(--color-cumulativeNet)"
												stopOpacity={0.02}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" vertical={false} />
									<XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
									<YAxis
										tickLine={false}
										axisLine={false}
										fontSize={12}
										width={56}
										tickFormatter={compactTaka}
									/>
									<ReferenceLine y={0} stroke="var(--border)" />
									{tooltip}
									<Area
										type="monotone"
										dataKey="cumulativeNet"
										stroke="var(--color-cumulativeNet)"
										strokeWidth={2}
										fill="url(#profitLossCumulative)"
										dot={{ r: 2, fill: "var(--color-cumulativeNet)" }}
									/>
								</AreaChart>
							</ChartContainer>
						</TabsContent>
					</Tabs>
				) : (
					<div className="border-border/70 flex h-[300px] items-center justify-center rounded-md border border-dashed">
						<p className="text-muted-foreground text-sm">{t("noDataInPeriod")}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

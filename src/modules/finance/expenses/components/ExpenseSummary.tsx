"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { CalendarClock, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useExpenseSummary } from "../hooks/use-expense-summary";

const trendConfig = {
	total: { label: "Spend", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function formatMoney(value: unknown) {
	const amount = Number(value || 0);
	return Number.isFinite(amount)
		? amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
		: "0";
}

function SummarySkeleton() {
	return (
		<div className="space-y-4">
			<div className="grid gap-3 @2xl/page:grid-cols-2 @5xl/page:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-24 rounded-md" />
				))}
			</div>
			<Skeleton className="h-[280px] rounded-md" />
		</div>
	);
}

function StatCard({
	label,
	value,
	hint,
	icon: Icon,
	accent = "default",
}: {
	label: string;
	value: string;
	hint?: React.ReactNode;
	icon: typeof Wallet;
	accent?: "default" | "warning";
}) {
	return (
		<div
			className={`bg-card/70 border-border/70 flex min-h-24 items-start justify-between gap-3 rounded-md border p-4 ${
				accent === "warning" ? "border-amber-500/40 bg-amber-500/10" : ""
			}`}
		>
			<div className="space-y-1.5">
				<p className="text-muted-foreground text-sm">{label}</p>
				<p className="text-2xl font-semibold tabular-nums">{value}</p>
				{hint}
			</div>
			<Icon className="text-muted-foreground size-4 shrink-0" />
		</div>
	);
}

export default function ExpenseSummary({ month }: { month?: string }) {
	const t = useTranslations("Expenses");
	const { summary, isLoading } = useExpenseSummary(month);

	const totals = summary?.totals;
	const byCategory = useMemo(() => (summary?.byCategory || []).slice(0, 6), [summary]);
	const largest = byCategory[0]?.total || 0;

	if (isLoading) return <SummarySkeleton />;

	const change = totals?.changePercent;
	const isUp = typeof change === "number" && change > 0;
	const ChangeIcon = isUp ? TrendingUp : TrendingDown;

	return (
		<div className="space-y-4">
			<div className="grid gap-3 @2xl/page:grid-cols-2 @5xl/page:grid-cols-4">
				<StatCard
					label={t("thisMonth")}
					value={`BDT ${formatMoney(totals?.month)}`}
					icon={Wallet}
					hint={
						typeof change === "number" ? (
							<span
								className={`flex items-center gap-1 text-xs ${
									isUp ? "text-amber-600" : "text-emerald-600"
								}`}
							>
								<ChangeIcon className="size-3" />
								{Math.abs(change)}% {t("vsPreviousMonth")}
							</span>
						) : (
							<span className="text-muted-foreground text-xs">{t("noPreviousMonth")}</span>
						)
					}
				/>
				<StatCard
					label={t("previousMonth")}
					value={`BDT ${formatMoney(totals?.previousMonth)}`}
					icon={CalendarClock}
				/>
				<StatCard
					label={t("yearToDate")}
					value={`BDT ${formatMoney(totals?.yearToDate)}`}
					icon={TrendingUp}
				/>
				<StatCard
					label={t("pendingPayment")}
					value={`BDT ${formatMoney(totals?.pending)}`}
					icon={Receipt}
					accent={(totals?.pendingCount || 0) > 0 ? "warning" : "default"}
					hint={
						<span className="text-muted-foreground text-xs">
							{totals?.pendingCount || 0} {t("entriesAwaiting")}
						</span>
					}
				/>
			</div>

			<div className="grid gap-4 @4xl/page:grid-cols-5">
				<Card className="bg-card/70 border-border/70 rounded-md @4xl/page:col-span-3">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{t("trendTitle")}</CardTitle>
						<p className="text-muted-foreground text-xs">{t("trendDescription")}</p>
					</CardHeader>
					<CardContent>
						<ChartContainer config={trendConfig} className="h-[240px] w-full">
							<AreaChart
								data={summary?.trend || []}
								margin={{ top: 8, right: 12, left: -18, bottom: 4 }}
							>
								<defs>
									<linearGradient id="expenseTrendGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="var(--color-total)" stopOpacity={0.35} />
										<stop offset="100%" stopColor="var(--color-total)" stopOpacity={0.03} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
								<YAxis tickLine={false} axisLine={false} fontSize={12} width={64} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Area
									type="monotone"
									dataKey="total"
									stroke="var(--color-total)"
									strokeWidth={2}
									fill="url(#expenseTrendGradient)"
									dot={{ r: 1.5, fill: "var(--color-total)" }}
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card className="bg-card/70 border-border/70 rounded-md @4xl/page:col-span-2">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{t("topCategoriesTitle")}</CardTitle>
						<p className="text-muted-foreground text-xs">{t("topCategoriesDescription")}</p>
					</CardHeader>
					<CardContent>
						{byCategory.length ? (
							<ul className="space-y-3">
								{byCategory.map((row) => (
									<li key={row.categoryId} className="space-y-1.5">
										<div className="flex items-center justify-between gap-2">
											<div className="flex min-w-0 items-center gap-2">
												<span className="truncate text-sm font-medium">{row.name}</span>
												{row.recurrence === "RECURRING" && (
													<Badge variant="outline" className="shrink-0 text-[10px]">
														{t("recurring")}
													</Badge>
												)}
											</div>
											<span className="shrink-0 text-sm tabular-nums">
												BDT {formatMoney(row.total)}
											</span>
										</div>
										<div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
											<div
												className="bg-foreground/60 h-full rounded-full"
												style={{
													width: `${largest ? Math.max((row.total / largest) * 100, 2) : 0}%`,
												}}
											/>
										</div>
									</li>
								))}
							</ul>
						) : (
							<div className="border-border/70 flex h-[200px] items-center justify-center rounded-md border border-dashed">
								<p className="text-muted-foreground text-sm">{t("noExpensesThisMonth")}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

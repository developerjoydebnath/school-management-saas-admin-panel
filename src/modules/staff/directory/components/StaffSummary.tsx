"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { Award, UserCheck, UserMinus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const staffTrendConfig = {
	staff: { label: "Staff", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function formatNumber(value: unknown) {
	const amount = Number(value || 0);
	return Number.isFinite(amount) ? amount.toLocaleString() : "0";
}

function SummarySkeleton() {
	return (
		<div className="space-y-4">
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
	icon: Icon,
	accent = "default",
}: {
	label: string;
	value: number;
	icon: typeof Users;
	accent?: "default" | "success" | "warning";
}) {
	return (
		<div
			className={`bg-card/70 border-border/70 flex min-h-24 items-start justify-between rounded-md border p-4 ${accent === "success"
				? "border-emerald-500/40 bg-emerald-500/10"
				: accent === "warning"
					? "border-amber-500/40 bg-amber-500/10"
					: ""
				}`}
		>
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm">{label}</p>
				<p className="text-2xl font-semibold">{formatNumber(value)}</p>
			</div>
			<Icon className="text-muted-foreground size-4" />
		</div>
	);
}

export default function StaffSummary() {
	const t = useTranslations("StaffDirectory");

	const {
		data: summaryResponse,
		isLoading: isLoadingSummary,
		isValidating: isValidatingSummary,
	} = useSWR("/staff/directory/summary");
	const hasSummaryResponse = summaryResponse !== undefined;
	const summary = summaryResponse?.data;

	const isLoading = isLoadingSummary || isValidatingSummary || !hasSummaryResponse;

	const totals = summary?.totals || {
		totalStaff: 0,
		activeStaff: 0,
		onLeaveStaff: 0,
		mpoListedStaff: 0,
	};

	const designations = Array.isArray(summary?.designations) ? summary.designations : [];

	const chartData = useMemo(
		() =>
			designations.map((designation: any) => ({
				name: designation.name,
				staff: Number(designation.staffCount || 0),
			})),
		[designations]
	);

	return (
		<div className="space-y-6">
			{isLoading ? (
				<SummarySkeleton />
			) : (
				<div className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard label={t("totalStaff")} value={totals.totalStaff} icon={Users} />
						<StatCard
							label={t("activeStaff")}
							value={totals.activeStaff}
							icon={UserCheck}
							accent="success"
						/>
						<StatCard
							label={t("onLeaveStaff")}
							value={totals.onLeaveStaff}
							icon={UserMinus}
							accent={totals.onLeaveStaff > 0 ? "warning" : "default"}
						/>
						<StatCard label={t("mpoListedStaff")} value={totals.mpoListedStaff} icon={Award} />
					</div>

					<Card className="bg-card/70 border-border/70 rounded-md">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">{t("staffDistribution")}</CardTitle>
							<p className="text-muted-foreground text-xs">{t("staffDistributionDescription")}</p>
						</CardHeader>
						<CardContent>
							{totals.totalStaff > 0 ? (
								<ChartContainer config={staffTrendConfig} className="h-[240px] w-full">
									<AreaChart
										data={chartData}
										margin={{ top: 8, right: 12, left: -18, bottom: 4 }}
									>
										<defs>
											<linearGradient id="staffDirectoryTrendGradient" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="var(--color-staff)" stopOpacity={0.35} />
												<stop offset="100%" stopColor="var(--color-staff)" stopOpacity={0.03} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
										<YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Area
											type="monotone"
											dataKey="staff"
											stroke="var(--color-staff)"
											strokeWidth={1.5}
											fill="url(#staffDirectoryTrendGradient)"
											dot={{ r: 1.5, fill: "var(--color-staff)" }}
										/>
									</AreaChart>
								</ChartContainer>
							) : (
								<div className="border-border/70 flex h-[240px] items-center justify-center rounded-md border border-dashed">
									<p className="text-muted-foreground text-sm">{t("noStaffFound")}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

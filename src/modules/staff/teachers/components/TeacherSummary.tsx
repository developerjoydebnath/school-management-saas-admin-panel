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
import { useSWR } from "@/shared/hooks/use-swr";
import { Award, Building2, UserCheck, UserMinus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const teacherTrendConfig = {
	teachers: { label: "Teachers", color: "var(--muted-foreground)" },
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

export default function TeacherSummary() {
	const t = useTranslations("Teachers");

	const {
		data: summaryResponse,
		isLoading: isLoadingSummary,
		isValidating: isValidatingSummary,
	} = useSWR("/staff/teachers/summary");
	const hasSummaryResponse = summaryResponse !== undefined;
	const summary = summaryResponse?.data;

	const isLoading = isLoadingSummary || isValidatingSummary || !hasSummaryResponse;

	const totals = summary?.totals || {
		totalTeachers: 0,
		activeTeachers: 0,
		onLeaveTeachers: 0,
		mpoListedTeachers: 0,
	};

	const departments = Array.isArray(summary?.departments) ? summary.departments : [];

	const unassignedCount = useMemo(
		() =>
			departments.find((dept: any) => dept.id === "unassigned")?.teacherCount || 0,
		[departments]
	);

	const chartData = useMemo(
		() =>
			departments.map((dept: any) => ({
				name: dept.name,
				teachers: Number(dept.teacherCount || 0),
			})),
		[departments]
	);

	return (
		<div className="space-y-6">
			{isLoading ? (
				<SummarySkeleton />
			) : (
				<div className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard
							label={t("totalTeachers")}
							value={totals.totalTeachers}
							icon={Users}
						/>
						<StatCard
							label={t("activeTeachers")}
							value={totals.activeTeachers}
							icon={UserCheck}
							accent="success"
						/>
						<StatCard
							label={t("onLeaveTeachers")}
							value={totals.onLeaveTeachers}
							icon={UserMinus}
							accent={totals.onLeaveTeachers > 0 ? "warning" : "default"}
						/>
						<StatCard
							label={t("mpoListedTeachers")}
							value={totals.mpoListedTeachers}
							icon={Award}
						/>
					</div>

					<Card className="bg-card/70 border-border/70 rounded-md">
						<CardHeader className="pb-3">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<CardTitle className="text-base">
										{t("teacherDistribution")}
									</CardTitle>
									<p className="text-muted-foreground text-xs">
										{t("teacherDistributionDescription")}
									</p>
								</div>
								{unassignedCount > 0 && (
									<Badge variant="secondary" className="w-fit">
										{t("unassigned")}: {unassignedCount}
									</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{totals.totalTeachers > 0 ? (
								<ChartContainer
									config={teacherTrendConfig}
									className="h-[240px] w-full"
								>
									<AreaChart
										data={chartData}
										margin={{ top: 8, right: 12, left: -18, bottom: 4 }}
									>
										<defs>
											<linearGradient
												id="teacherDirectoryTrendGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="0%"
													stopColor="var(--color-teachers)"
													stopOpacity={0.35}
												/>
												<stop
													offset="100%"
													stopColor="var(--color-teachers)"
													stopOpacity={0.03}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis
											dataKey="name"
											tickLine={false}
											axisLine={false}
											fontSize={12}
										/>
										<YAxis
											tickLine={false}
											axisLine={false}
											fontSize={12}
											allowDecimals={false}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Area
											type="monotone"
											dataKey="teachers"
											stroke="var(--color-teachers)"
											strokeWidth={1.5}
											fill="url(#teacherDirectoryTrendGradient)"
											dot={{ r: 1.5, fill: "var(--color-teachers)" }}
										/>
									</AreaChart>
								</ChartContainer>
							) : (
								<div className="border-border/70 flex h-[240px] items-center justify-center rounded-md border border-dashed">
									<p className="text-muted-foreground text-sm">
										{t("noTeachersFound")}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

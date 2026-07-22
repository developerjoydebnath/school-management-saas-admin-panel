"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { ArrowRight, GraduationCap, LayoutGrid, List, School, UserCheck, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

type ViewMode = "grid" | "list";

const studentTrendConfig = {
	students: { label: "Students", color: "var(--muted-foreground)" },
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
			className={`bg-card/70 border-border/70 flex min-h-24 items-start justify-between rounded-md border p-4 ${
				accent === "success"
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

export default function ClassSummaryGrid() {
	const t = useTranslations("StudentsDirectory");
	const locale = useLocale();
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	const {
		data: classSummaryResponse,
		isLoading: isLoadingClasses,
		isValidating: isValidatingClasses,
	} = useSWR("/students/classes-summary");
	const hasClassSummaryResponse = classSummaryResponse !== undefined;
	const classSummaries = Array.isArray(classSummaryResponse?.data)
		? classSummaryResponse.data
		: [];

	const isLoading =
		isLoadingClasses || isValidatingClasses || !hasClassSummaryResponse;
	const summary = useMemo(() => {
		const classes = Array.isArray(classSummaries) ? classSummaries : [];
		const totalStudents = classes.reduce(
			(total: number, cls: any) => total + Number(cls?.totalStudents || 0),
			0
		);
		const classesWithStudents = classes.filter(
			(cls: any) => Number(cls?.totalStudents || 0) > 0
		).length;
		const sectionSetups = classes.reduce((total: number, cls: any) => {
			const sections = Array.isArray(cls?.sections) ? cls.sections : [];
			return total + sections.length;
		}, 0);
		const emptyClasses = classes.filter(
			(cls: any) => Number(cls?.totalStudents || 0) === 0
		).length;

		return {
			totalClasses: classes.length,
			totalStudents,
			classesWithStudents,
			sectionSetups,
			emptyClasses,
		};
	}, [classSummaries]);

	const chartData = useMemo(() => {
		const classes = Array.isArray(classSummaries) ? classSummaries : [];
		return classes.map((cls: any) => ({
			className: getLocalizedName(cls?.name, locale),
			students: Number(cls?.totalStudents || 0),
		}));
	}, [classSummaries, locale]);

	return (
		<div className="space-y-6">
			{isLoading ? (
				<SummarySkeleton />
			) : (
				<div className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard
							label={t("totalClasses")}
							value={summary.totalClasses}
							icon={School}
						/>
						<StatCard
							label={t("studentsInSession")}
							value={summary.totalStudents}
							icon={Users}
							accent="success"
						/>
						<StatCard
							label={t("classesWithStudents")}
							value={summary.classesWithStudents}
							icon={UserCheck}
						/>
						<StatCard
							label={t("sectionSetups")}
							value={summary.sectionSetups}
							icon={LayoutGrid}
							accent={summary.emptyClasses > 0 ? "warning" : "default"}
						/>
					</div>

					<Card className="bg-card/70 border-border/70 rounded-md">
						<CardHeader className="pb-3">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<CardTitle className="text-base">
										{t("studentDistribution")}
									</CardTitle>
									<p className="text-muted-foreground text-xs">
										{t("studentDistributionDescription")}
									</p>
								</div>
								<Badge variant="secondary" className="w-fit">
									{t("emptyClasses")}: {summary.emptyClasses}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							{summary.totalStudents > 0 ? (
								<ChartContainer
									config={studentTrendConfig}
									className="h-[240px] w-full"
								>
									<AreaChart
										data={chartData}
										margin={{ top: 8, right: 12, left: -18, bottom: 4 }}
									>
										<defs>
											<linearGradient
												id="studentDirectoryTrendGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="0%"
													stopColor="var(--color-students)"
													stopOpacity={0.35}
												/>
												<stop
													offset="100%"
													stopColor="var(--color-students)"
													stopOpacity={0.03}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis
											dataKey="className"
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
											dataKey="students"
											stroke="var(--color-students)"
											strokeWidth={1.5}
											fill="url(#studentDirectoryTrendGradient)"
											dot={{ r: 1.5, fill: "var(--color-students)" }}
										/>
									</AreaChart>
								</ChartContainer>
							) : (
								<div className="border-border/70 flex h-[240px] items-center justify-center rounded-md border border-dashed">
									<p className="text-muted-foreground text-sm">
										{t("noStudentsInSession")}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}

			{/* Header: View Toggle */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold">{t("classOverview")}</h2>
				<div className="flex items-center gap-3">
					<div className="bg-muted/30 flex h-10 items-center rounded-lg border p-0.5">
						<button
							type="button"
							onClick={() => setViewMode("grid")}
							className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
								viewMode === "grid"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<LayoutGrid className="h-3.5 w-3.5" />
							Grid
						</button>
						<button
							type="button"
							onClick={() => setViewMode("list")}
							className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
								viewMode === "list"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<List className="h-3.5 w-3.5" />
							List
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div
					className={
						viewMode === "grid"
							? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
							: "space-y-3"
					}
				>
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton
							key={i}
							className={
								viewMode === "grid" ? "h-[190px] rounded-xl" : "h-14 rounded-lg"
							}
						/>
					))}
				</div>
			) : classSummaries.length === 0 ? (
				<Card className="border-dashed py-16 text-center">
					<CardContent>
						<GraduationCap className="text-muted-foreground/40 mx-auto h-12 w-12" />
						<p className="text-muted-foreground mt-4">{t("noClasses")}</p>
					</CardContent>
				</Card>
			) : viewMode === "grid" ? (
				/* ========== GRID VIEW ========== */
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{classSummaries.map((cls: any) => (
						<div key={cls.id} className="h-full">
							<Card className="group flex h-full min-h-[190px] flex-col">
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardTitle className="text-base font-bold">
											{getLocalizedName(cls.name, locale)}
										</CardTitle>
										<div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors">
											<GraduationCap className="h-4.5 w-4.5" />
										</div>
									</div>
								</CardHeader>
								<CardContent className="flex flex-1 flex-col space-y-3 pt-0">
									<div className="flex items-center gap-2">
										<Users className="text-muted-foreground h-4 w-4" />
										<span className="text-muted-foreground text-sm">
											{t("totalStudents")}:
										</span>
										<span className="text-lg font-bold">
											{cls.totalStudents}
										</span>
									</div>

									{cls.sections.length > 0 && (
										<div className="space-y-2">
											<p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
												{t("sections")}
											</p>
											<div className="flex flex-wrap gap-2">
												{cls.sections.map((sec: any) => (
													<Badge
														key={sec.name}
														variant="secondary"
														className="h-5 gap-1 px-2 text-[11px]"
													>
														{sec.name}
														<span className="text-muted-foreground">
															({sec.count})
														</span>
													</Badge>
												))}
											</div>
										</div>
									)}

									<Link
										key={cls.id}
										href={`/students/directory/${cls.id}`}
										passHref
										className="mt-auto block pt-1"
									>
										<Button
											variant="ghost"
											size="sm"
											className="group-hover:bg-primary/10 group-hover:text-primary w-full gap-2 text-xs font-semibold transition-all"
										>
											{t("viewStudents")}
											<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
										</Button>
									</Link>
								</CardContent>
							</Card>
						</div>
					))}
				</div>
			) : (
				/* ========== LIST VIEW ========== */
				<Card className="border-none shadow-sm">
					<CardContent className="pt-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="font-semibold">Class</TableHead>
									<TableHead className="text-center font-semibold">
										{t("totalStudents")}
									</TableHead>
									<TableHead className="font-semibold">{t("sections")}</TableHead>
									<TableHead className="text-right font-semibold">
										Action
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{classSummaries.map((cls: any) => (
									<TableRow key={cls.id} className="group">
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
													<GraduationCap className="h-4 w-4" />
												</div>
												<span className="font-semibold">
													{getLocalizedName(cls.name, locale)}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-center font-mono text-lg font-bold">
											{cls.totalStudents}
										</TableCell>
										<TableCell>
											{cls.sections.length > 0 ? (
												<div className="flex flex-wrap gap-1.5">
													{cls.sections.map((sec: any) => (
														<Badge
															key={sec.name}
															variant="secondary"
															className="gap-1 text-xs"
														>
															{sec.name}
															<span className="text-muted-foreground">
																({sec.count})
															</span>
														</Badge>
													))}
												</div>
											) : (
												<span className="text-muted-foreground text-xs">
													—
												</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											<Link
												href={`/students/directory/${cls.id}`}
											>
												<Button
													variant="ghost"
													size="sm"
													className="hover:text-primary gap-1 text-xs font-semibold"
												>
													{t("viewStudents")}
													<ArrowRight className="h-3 w-3" />
												</Button>
											</Link>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
							className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${viewMode === "grid"
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
							className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${viewMode === "list"
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
								viewMode === "grid" ? "h-53 rounded-xl" : "h-14 rounded-lg"
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
					{classSummaries.map((cls: any) => {
						const isEmpty = Number(cls.totalStudents || 0) === 0;
						const sections = Array.isArray(cls.sections) ? cls.sections : [];
						const sectionShades = ["bg-primary", "bg-primary/70", "bg-primary/45", "bg-primary/25"];

						return (
							<Link
								key={cls.id}
								href={`/students/directory/${cls.id}`}
								className="group block h-full"
							>
								<Card
									size="sm"
									className={`h-full transition-colors duration-200 hover:bg-background/40 ${isEmpty ? "border-dashed" : ""
										}`}
								>
									<CardContent className="flex h-full flex-col gap-4">
										{/* Header */}
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-center gap-3">
												<div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
													<GraduationCap className="h-4.5 w-4.5" />
												</div>
												<div>
													<p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
														{t("class")}
													</p>
													<p className="text-base leading-tight font-bold">
														{getLocalizedName(cls.name, locale)}
													</p>
												</div>
											</div>
											{isEmpty && (
												<Badge variant="outline" className="text-muted-foreground shrink-0 text-[10px]">
													{t("emptyClasses")}
												</Badge>
											)}
										</div>

										{/* Stat */}
										<div className="flex items-baseline gap-2">
											<span className="text-3xl leading-none font-bold tabular-nums">
												{cls.totalStudents}
											</span>
											<span className="text-muted-foreground flex items-center gap-1 text-xs">
												<Users className="h-3.5 w-3.5" />
												{t("totalStudents")}
											</span>
										</div>

										{/* Section proportion bar */}
										{sections.length > 0 && !isEmpty && (
											<div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
												{sections.map((sec: any, index: number) => (
													<div
														key={sec.id || sec.name}
														title={`${sec.name}: ${sec.count}`}
														className={sectionShades[index % sectionShades.length]}
														style={{
															width: `${Math.max((Number(sec.count || 0) / Math.max(cls.totalStudents, 1)) * 100, 3)}%`,
														}}
													/>
												))}
											</div>
										)}

										{/* Section chips */}
										<div className="flex flex-1 flex-wrap content-start gap-1.5">
											{sections.length > 0 ? (
												sections.map((sec: any, index: number) => (
													<Badge
														key={sec.id || sec.name}
														variant="secondary"
														className="h-5 gap-1.5 px-2 text-[11px] font-normal"
													>
														<span
															className={`h-1.5 w-1.5 rounded-full ${sectionShades[index % sectionShades.length]}`}
														/>
														{sec.name}
														<span className="text-muted-foreground">({sec.count})</span>
													</Badge>
												))
											) : (
												<p className="text-muted-foreground text-xs">{t("noSections")}</p>
											)}
										</div>

										{/* Footer CTA */}
										<div className="text-muted-foreground group-hover:text-primary mt-auto flex items-center justify-between border-t pt-3 text-xs font-semibold transition-colors">
											{t("viewStudents")}
											<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})}
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

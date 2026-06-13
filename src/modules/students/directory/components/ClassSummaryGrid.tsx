"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
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
import { ArrowRight, GraduationCap, LayoutGrid, List, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";

type ViewMode = "grid" | "list";

export default function ClassSummaryGrid() {
	const t = useTranslations("StudentsDirectory");
	const locale = useLocale();
	const [selectedSession, setSelectedSession] = useState<string>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	const { data: classes, isLoading: isLoadingClasses } = useSWR("/classes");
	const { data: students, isLoading: isLoadingStudents } = useSWR("/students");
	const { data: sessions, isLoading: isLoadingSessions } = useSWR("/sessions");

	const isLoading = isLoadingClasses || isLoadingStudents || isLoadingSessions;

	const classSummaries = useMemo(() => {
		if (!classes || !students) return [];

		return classes.map((cls: any) => {
			const sections = cls.sections || [];
			const filteredStudents = students.filter((s: any) => {
				const matchesClass = s.class === cls.id || s.class === `class-${cls.id}`;
				const matchesSession = selectedSession === "all" || s.session === selectedSession;
				return matchesClass && matchesSession;
			});

			const sectionCounts = sections.map((sec: any) => ({
				name: typeof sec === "string" ? sec : sec.name || sec,
				count: filteredStudents.filter(
					(s: any) => s.section === (typeof sec === "string" ? sec : sec.name || sec)
				).length,
			}));

			return {
				id: cls.id,
				name: cls.name,
				totalStudents: filteredStudents.length,
				sections: sectionCounts,
			};
		});
	}, [classes, students, selectedSession]);

	return (
		<div className="space-y-6">
			{/* Header: Session Filter + View Toggle */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold">{t("classOverview")}</h2>
				<div className="flex items-center gap-3">
					{/* View Toggle */}
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

					{/* Session Selector */}
					<div className="w-full sm:w-[220px]">
						<Select
							value={selectedSession}
							onValueChange={(v) => setSelectedSession(v ?? "all")}
						>
							<SelectTrigger className="bg-background h-10! w-full">
								<SelectValue placeholder={t("selectSession")} />
							</SelectTrigger>
							<SelectContent className="p-1">
								<SelectItem value="all" className="p-2">
									{t("allSessions")}
								</SelectItem>
								{sessions?.map((session: any) => (
									<SelectItem key={session.id} value={session.id} className="p-2">
										{getLocalizedName(session.name, locale)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div
					className={
						viewMode === "grid"
							? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
							: "space-y-3"
					}
				>
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton
							key={i}
							className={
								viewMode === "grid" ? "h-[200px] rounded-xl" : "h-14 rounded-lg"
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
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{classSummaries.map((cls: any) => (
						<div key={cls.id}>
							<Card className="group h-full">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-base font-bold">
											{getLocalizedName(cls.name, locale)}
										</CardTitle>
										<div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors">
											<GraduationCap className="h-4.5 w-4.5" />
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
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
														className="gap-1 text-xs"
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
										href={`/students/directory/${cls.id}${selectedSession !== "all" ? `?session=${selectedSession}` : ""}`}
										passHref
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
												href={`/students/directory/${cls.id}${selectedSession !== "all" ? `?session=${selectedSession}` : ""}`}
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

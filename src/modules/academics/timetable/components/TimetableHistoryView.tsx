"use client";

import DateRangeFilter from "@/shared/components/form/DateRangeFilter";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { ClassModel, Section } from "@/shared/models/class.model";
import { Eye, Printer, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { downloadTimetablePdf } from "../hooks/use-timetable-mutations";
import { useTimetableHistory, useTimetableHistoryDetail } from "../hooks/use-timetables";
import { TimetableGrid } from "./TimetableGrid";

type TimetableHistoryViewProps = {
	defaultSessionId?: string | null;
	defaultClassId?: string | null;
	defaultSectionIds?: string[];
};

type HistoryFilter = {
	sessionId: string;
	classId: string;
	sectionId: string;
	savedFrom: string;
	savedTo: string;
};

const emptyFilter: HistoryFilter = {
	sessionId: "",
	classId: "",
	sectionId: "",
	savedFrom: "",
	savedTo: "",
};

export function TimetableHistoryView({
	defaultSessionId,
	defaultClassId,
	defaultSectionIds,
}: TimetableHistoryViewProps) {
	const t = useTranslations("Timetable");
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [isPrinting, setIsPrinting] = useState(false);
	const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
	const [filter, setFilter] = useState<HistoryFilter>({
		...emptyFilter,
		sessionId: defaultSessionId || "",
		classId: defaultClassId || "",
		sectionId: defaultSectionIds?.[0] || "",
	});

	const { data: classesRes } = useSWR("/classes/active-list");
	const { data: sessionsRes } = useSWR("/sessions/active-list");
	const classes = useMemo(() => classesRes?.data || classesRes || [], [classesRes]);
	const sessions = useMemo(() => sessionsRes?.data || sessionsRes || [], [sessionsRes]);
	const serializedClasses: ClassModel[] = useMemo(
		() => classes.map((cls: any) => new ClassModel(cls)),
		[classes]
	);
	const activeClass = serializedClasses.find((cls: ClassModel) => cls.id === filter.classId);
	const sections = activeClass?.sections || [];

	const historyResponse = useTimetableHistory({
		page,
		limit,
		...(filter.sessionId ? { sessionId: filter.sessionId } : {}),
		...(filter.classId ? { classId: filter.classId } : {}),
		...(filter.sectionId ? { sectionId: filter.sectionId } : {}),
		...(filter.savedFrom ? { savedFrom: filter.savedFrom } : {}),
		...(filter.savedTo ? { savedTo: filter.savedTo } : {}),
	});
	const detailResponse = useTimetableHistoryDetail(selectedHistoryId);

	const payload = historyResponse.data?.data || historyResponse.data || {};
	const items = payload.items || [];
	const meta = payload.meta;
	const detail = detailResponse.data?.data || detailResponse.data;

	const updateFilter = (value: Partial<HistoryFilter>) => {
		setPage(1);
		setSelectedHistoryId(null);
		setFilter((current) => ({ ...current, ...value }));
	};

	const handlePrintHistory = async () => {
		if (!detail?.sessionId || !detail?.classId) return;

		setIsPrinting(true);
		try {
			await downloadTimetablePdf({
				sessionId: detail.sessionId,
				classId: detail.classId,
				sectionIds: detail.sectionId ? [detail.sectionId] : undefined,
				locale,
				fileName: formatHistoryPdfFileName(detail),
			});
		} catch {
			// Global axios interceptor handles non-blob errors.
		} finally {
			setIsPrinting(false);
		}
	};

	const resetFilter = () => {
		setPage(1);
		setSelectedHistoryId(null);
		setFilter(emptyFilter);
	};

	return (
		<div className="grid grid-cols-1 gap-4 @5xl/page:grid-cols-[420px_1fr]">
			<section className="space-y-4">
				<div className="bg-card rounded-md border p-4 space-y-4">
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label className="text-xs text-muted-foreground">Session</Label>
							<Select
								value={filter.sessionId || undefined}
								onValueChange={(value) => updateFilter({ sessionId: value })}
							>
								<SelectTrigger className="w-full h-9!">
									<SelectValue placeholder="Select session" />
								</SelectTrigger>
								<SelectContent>
									{sessions.map((session: any) => (
										<SelectItem className="py-1.5" key={session.id} value={session.id}>
											{session.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label className="text-xs text-muted-foreground">Class</Label>
							<Select
								value={filter.classId || undefined}
								onValueChange={(value) =>
									updateFilter({ classId: value, sectionId: "" })
								}
							>
								<SelectTrigger className="w-full h-9!">
									<SelectValue placeholder="Select class" />
								</SelectTrigger>
								<SelectContent>
									{serializedClasses.map((cls: ClassModel) => (
										<SelectItem className="py-1.5" key={cls.id} value={cls.id}>
											{getEnglishName(cls.name)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2 col-span-full">
							<Label className="text-xs text-muted-foreground">Section</Label>
							<Select
								value={filter.sectionId || undefined}
								onValueChange={(value) => updateFilter({ sectionId: value })}
								disabled={!filter.classId}
							>
								<SelectTrigger className="w-full h-9!">
									<SelectValue
										placeholder={
											filter.classId ? "Select section" : "Select class first"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem className="py-1.5" value="class">Class routine</SelectItem>
									{sections.map((section: Section) => (
										<SelectItem className="py-1.5"
											key={section.id || section.name}
											value={section.id || section.name}
										>
											{getEnglishName(section.name)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="col-span-full">
							<DateRangeFilter
								title="Saved Date"
								from={filter.savedFrom}
								to={filter.savedTo}
								onChange={(value) =>
									updateFilter({
										savedFrom: value.from,
										savedTo: value.to,
									})
								}
							/>
						</div>

					</div>
					<Button type="button" className="w-full" variant="outline" onClick={resetFilter}>
						<RotateCcw className="h-4 w-4" />
						{t("resetFilter")}
					</Button>
				</div>

				<div className="bg-card rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("version")}</TableHead>
								<TableHead>{t("target")}</TableHead>
								<TableHead>{t("saved")}</TableHead>
								<TableHead className="text-right">{t("action")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{historyResponse.isLoading ? (
								<TableRow>
									<TableCell colSpan={4}>{t("loading")}</TableCell>
								</TableRow>
							) : items.length ? (
								items.map((item: any) => (
									<TableRow
										key={item.id}
										className={cn(selectedHistoryId === item.id && "bg-muted")}
									>
										<TableCell>
											<Badge variant="outline">v{item.version}</Badge>
										</TableCell>
										<TableCell>
											<div className="font-medium">
												{item.className || "-"}
											</div>
											<div className="text-muted-foreground text-xs">
												{item.sectionName || t("classRoutine")}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-xs">
												{formatDateTime(item.savedAt)}
											</div>
											<div className="text-muted-foreground text-xs">
												{item.sessionName || "-"}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<Button
												type="button"
												variant="outline"
												size="icon-sm"
												onClick={() => setSelectedHistoryId(item.id)}
											>
												<Eye className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={4}>{t("noHistoryFound")}</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{meta && (
						<div className="flex items-center justify-between border-t p-3 text-xs">
							<span>
								{t("page")} {meta.page} / {meta.totalPages} - {t("total")}{" "}
								{meta.total}
							</span>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={!meta.hasPreviousPage}
									onClick={() => setPage((current) => Math.max(1, current - 1))}
								>
									{t("prev")}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={!meta.hasNextPage}
									onClick={() => setPage((current) => current + 1)}
								>
									{t("next")}
								</Button>
							</div>
						</div>
					)}
				</div>
			</section>

			<section className="bg-card min-w-0 rounded-md border p-4">
				{!selectedHistoryId ? (
					<div className="text-muted-foreground flex min-h-90 items-center justify-center text-sm">
						{t("selectHistoryLog")}
					</div>
				) : detailResponse.isLoading ? (
					<div className="text-muted-foreground flex min-h-90 items-center justify-center text-sm">
						{t("loadingSnapshot")}
					</div>
				) : detail ? (
					<div className="space-y-4">
						<div className="flex justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={handlePrintHistory}
								disabled={isPrinting || !detail.sessionId || !detail.classId}
							>
								<Printer className="h-4 w-4" /> {t("print")}
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-3 text-sm @3xl/page:grid-cols-4">
							<Info label={t("session")} value={detail.sessionName || "-"} />
							<Info label={t("class")} value={detail.className || "-"} />
							<Info
								label={t("section")}
								value={detail.sectionName || t("classRoutine")}
							/>
							<Info label={t("saved")} value={formatDateTime(detail.savedAt)} />
						</div>

						<TimetableGrid
							readOnly
							days={detail.days || []}
							periods={detail.columns || []}
							assignments={detail.cells || {}}
						/>
					</div>
				) : (
					<div className="text-muted-foreground flex min-h-90 items-center justify-center text-sm">
						{t("snapshotNotFound")}
					</div>
				)}
			</section>
		</div>
	);
}

function Info({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-md border p-3">
			<div className="text-muted-foreground text-xs">{label}</div>
			<div className="mt-1 text-sm">{value}</div>
		</div>
	);
}

function getEnglishName(name: string | { en?: string; bn?: string }) {
	return typeof name === "string" ? name : name?.en || "";
}

function formatDateTime(value?: string) {
	if (!value) return "-";
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function formatHistoryPdfFileName(detail: {
	className?: string | null;
	sectionName?: string | null;
	sessionName?: string | null;
	savedAt?: string | null;
	version?: number | string | null;
}) {
	const date = detail.savedAt ? new Date(detail.savedAt) : new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	const className = sanitizeFileSegment(detail.className || "class");
	const sectionName = sanitizeFileSegment(detail.sectionName || "class routine");
	const sessionName = sanitizeFileSegment(detail.sessionName || "session");
	const version = sanitizeFileSegment(`v${detail.version || 1}`);

	return `class-routine-${className}-${sectionName}-${sessionName}-${year}-${month}-${day}-${hours}-${minutes}-${version}.pdf`;
}

function sanitizeFileSegment(value: string) {
	return value
		.trim()
		.replace(/[<>:"/\\|?*]+/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();
}

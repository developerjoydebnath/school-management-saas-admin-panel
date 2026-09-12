"use client";

import ExamSelect from "@/shared/components/form/ExamSelect";
import TeacherMultiSelection from "@/shared/components/form/TeacherMultiSelection";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/shared/components/ui/input-group";
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
import { PATHS } from "@/shared/configs/paths.config";
import { Download, Save, TriangleAlert, Wand2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	ExamRoutineSubjectPayload,
	ExamRoutineSubjectStatusEnum,
} from "../dto/exam-routine.dto";
import { DayConflicts, useDayConflicts } from "../hooks/use-day-conflicts";
import { useExamRoutine } from "../hooks/use-exam-routine";
import DayConflictBadge from "./DayConflictBadge";
import DayConflictDialog from "./DayConflictDialog";
import {
	downloadExamRoutinePdf,
	saveExamRoutine,
} from "../hooks/use-exam-routine-mutations";

type ExamRoutineViewProps = {
	initialExamId?: string;
};

const statusOptions = Object.values(ExamRoutineSubjectStatusEnum).map((value) => ({
	label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
	value,
}));

function formatDateInput(value?: string | null) {
	return value ? value.slice(0, 10) : "";
}

function formatDate(value?: string | null) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function isDateOutsidePeriod(
	dateValue?: string | null,
	startValue?: string | null,
	endValue?: string | null
) {
	if (!dateValue || !startValue || !endValue) return false;
	return dateValue < startValue || dateValue > endValue;
}

function getClassName(cls: any) {
	return cls?.class?.enName || cls?.enName || "-";
}

function mapSubjectRow(row: any): ExamRoutineSubjectPayload {
	const invigilatorIds =
		Array.isArray(row.invigilatorIds) && row.invigilatorIds.length
			? row.invigilatorIds
			: row.invigilatorId
				? [row.invigilatorId]
				: [];

	return {
		id: row.id,
		examDate: formatDateInput(row.examDate),
		startTime: row.startTime || "",
		durationMins: row.durationMins || 180,
		invigilatorId: invigilatorIds[0] || "",
		invigilatorIds,
		status: row.status || ExamRoutineSubjectStatusEnum.SCHEDULED,
	};
}

export default function ExamRoutineView({ initialExamId }: ExamRoutineViewProps) {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations("ExamRoutine");
	const [examId, setExamId] = useState(initialExamId || "");
	const [selectedClassId, setSelectedClassId] = useState("");
	const [rows, setRows] = useState<ExamRoutineSubjectPayload[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isPrinting, setIsPrinting] = useState(false);
	const [bulkStartTime, setBulkStartTime] = useState("10:00");
	const [bulkDuration, setBulkDuration] = useState(180);

	const { data, isLoading } = useExamRoutine(examId, selectedClassId);
	const examStartDate = formatDateInput(data?.exam?.startDate);
	const examEndDate = formatDateInput(data?.exam?.endDate);

	// Fetched once for the whole exam period, not per row: every row's date is
	// inside it, so a single call answers all of them.
	const { byDate: conflictsByDate } = useDayConflicts({
		dateFrom: examStartDate,
		dateTo: examEndDate,
		sessionId: data?.exam?.sessionId,
	});
	const conflictsFor = (date?: string | null) =>
		(date && conflictsByDate.get(date.slice(0, 10))) || null;

	const [conflictDay, setConflictDay] = useState<{
		date: string;
		conflicts: DayConflicts;
		startTime?: string | null;
		durationMins?: number;
		subjectName?: string;
	} | null>(null);

	const openConflicts = (
		date?: string | null,
		startTime?: string | null,
		durationMins?: number,
		subjectName?: string
	) => {
		const conflicts = conflictsFor(date);
		if (!date || !conflicts) return;
		setConflictDay({
			date: date.slice(0, 10),
			conflicts,
			startTime,
			durationMins,
			subjectName,
		});
	};

	useEffect(() => {
		setExamId(initialExamId || "");
	}, [initialExamId]);

	useEffect(() => {
		if (!data) return;
		if (!selectedClassId && data.selectedClassId) {
			setSelectedClassId(data.selectedClassId);
		}
		setRows((data.subjects || []).map(mapSubjectRow));
	}, [data, selectedClassId]);

	const selectedClass = useMemo(
		() => data?.classes?.find((item: any) => item.classId === selectedClassId),
		[data?.classes, selectedClassId]
	);

	const rowById = useMemo(
		() => new Map(rows.map((row) => [row.id, row])),
		[rows]
	);

	const conflictRowCount = useMemo(
		() =>
			rows.filter((row) => {
				const conflicts = row.examDate
					? conflictsByDate.get(row.examDate.slice(0, 10))
					: null;
				return !!conflicts && (conflicts.holidays.length > 0 || conflicts.events.length > 0);
			}).length,
		[rows, conflictsByDate]
	);

	const updateRow = (id: string, patch: Partial<ExamRoutineSubjectPayload>) => {
		setRows((current) =>
			current.map((row) => (row.id === id ? { ...row, ...patch } : row))
		);
	};

	const applyBulkValues = () => {
		setRows((current) =>
			current.map((row) => ({
				...row,
				startTime: bulkStartTime || row.startTime,
				durationMins: bulkDuration || row.durationMins,
			}))
		);
		toast.success(t("bulkApplySuccess"));
	};

	const handleExamChange = (value: string) => {
		setExamId(value);
		setSelectedClassId("");
		setRows([]);
		router.push(PATHS.EXAMINATIONS.ROUTINE.EXAM(value));
	};

	const handleSave = async () => {
		if (!examId || !selectedClassId) return;

		const hasOutOfRangeDate = rows.some((row) =>
			isDateOutsidePeriod(row.examDate, examStartDate, examEndDate)
		);
		if (hasOutOfRangeDate) {
			toast.error(
				`Exam date must be between ${formatDate(data?.exam?.startDate)} and ${formatDate(
					data?.exam?.endDate
				)}.`
			);
			return;
		}

		const hasMissingInvigilator = rows.some(
			(row) => !(row.invigilatorIds || []).filter(Boolean).length && !row.invigilatorId
		);
		if (hasMissingInvigilator) {
			toast.error("Select at least one invigilator for every subject row.");
			return;
		}

		setIsSaving(true);
		try {
			await saveExamRoutine({
				examId,
				classId: selectedClassId,
				subjects: rows.map((row) => {
					const invigilatorIds = (row.invigilatorIds || []).filter(Boolean);
					return {
						...row,
						examDate: row.examDate || null,
						startTime: row.startTime || null,
						invigilatorId: invigilatorIds[0] || row.invigilatorId || null,
						invigilatorIds,
						durationMins: Number(row.durationMins || 180),
					};
				}),
			});
			toast.success(t("saveSuccess"));
		} catch {
			// Global axios interceptor handles API errors.
		} finally {
			setIsSaving(false);
		}
	};

	const handlePrint = async () => {
		if (!examId || !selectedClassId) return;
		setIsPrinting(true);
		try {
			await downloadExamRoutinePdf({
				examId,
				classId: selectedClassId,
				locale,
				fileName: `${data?.exam?.name || "exam"}-${getClassName(selectedClass)}-routine.pdf`,
			});
		} finally {
			setIsPrinting(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader className="space-y-2">
					<h2 className="text-base font-semibold">{t("selectExamTitle")}</h2>
					<p className="text-muted-foreground text-sm">{t("selectExamDescription")}</p>
				</CardHeader>
				<CardContent>
					<div className="grid items-start gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<label className="text-muted-foreground block text-sm font-medium">
								Exam<span className="text-destructive">*</span>
							</label>
							<ExamSelect
								value={examId}
								onChange={handleExamChange}
								placeholder="Select exam"
							/>
						</div>
						{data?.exam ? (
							<>
								<div className="space-y-2">
									<p className="text-muted-foreground text-sm font-medium">Exam Period</p>
									<div className="flex h-10 items-center rounded-md border px-3 text-sm">
										{formatDate(data.exam.startDate)} - {formatDate(data.exam.endDate)}
									</div>
								</div>
								<div className="space-y-2">
									<p className="text-muted-foreground text-sm font-medium">Session</p>
									<div className="flex h-10 items-center rounded-md border px-3 text-sm">
										{data.exam.session?.name || "-"}
									</div>
								</div>
							</>
						) : null}
					</div>
				</CardContent>
			</Card>

			{examId && isLoading ? (
				<Skeleton className="h-96 w-full" />
			) : null}

			{examId && !isLoading && data ? (
				<>
					<Card className="shadow-none ring-0">
						<CardHeader className="space-y-2">
							<h2 className="text-base font-semibold">{t("classRoutineTitle")}</h2>
							<p className="text-muted-foreground text-sm">{t("classRoutineDescription")}</p>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{(data.classes || []).map((item: any) => (
									<Button
										key={item.classId}
										type="button"
										variant={selectedClassId === item.classId ? "default" : "outline"}
										size="sm"
										className="rounded-full"
										onClick={() => setSelectedClassId(item.classId)}
									>
										{getClassName(item)}
									</Button>
								))}
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-none ring-0">
						<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-1">
								<h2 className="text-base font-semibold">{t("routineTableTitle")}</h2>
								<p className="text-muted-foreground text-sm">{t("routineTableDescription")}</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handlePrint}
									disabled={!rows.length || isPrinting}
								>
									<Download className="h-4 w-4" />
									{t("downloadPdf")}
								</Button>
								<Button
									type="button"
									size="sm"
									onClick={handleSave}
									disabled={!rows.length || isSaving}
								>
									<Save className="h-4 w-4" />
									{isSaving ? t("saving") : t("saveRoutine")}
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							{/* One line at the top so a clash is visible without scanning
							    every row — the per-row badge below carries the detail. */}
							{conflictRowCount > 0 && (
								<div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs">
									<TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
									<span>
										{t("conflictSummary", { count: conflictRowCount })}{" "}
										<span className="text-muted-foreground">{t("conflictAdvisory")}</span>
									</span>
								</div>
							)}
							{rows.length ? (
								<div className="bg-muted/30 flex flex-col gap-3 rounded-md border p-3 @2xl/body:flex-row @2xl/body:items-end">
									<div className="min-w-0 flex-1">
										<p className="flex items-center gap-1.5 text-sm font-medium">
											<Wand2 className="text-muted-foreground h-3.5 w-3.5" />
											{t("quickFillTitle")}
										</p>
										<p className="text-muted-foreground mt-0.5 text-xs">
											{t("quickFillDescription")}
										</p>
									</div>
									<div className="flex items-end gap-2">
										<div className="space-y-1">
											<label className="text-muted-foreground block text-xs">
												{t("startTime")}
											</label>
											<Input
												type="time"
												value={bulkStartTime}
												onChange={(event) => setBulkStartTime(event.target.value)}
												className="h-9 w-32"
											/>
										</div>
										<div className="space-y-1">
											<label className="text-muted-foreground block text-xs">
												{t("duration")}
											</label>
											<InputGroup className="w-32">
												<InputGroupInput
													type="number"
													min={1}
													value={bulkDuration}
													onChange={(event) =>
														setBulkDuration(Number(event.target.value || 0))
													}
												/>
												<InputGroupAddon align="inline-end">
													<InputGroupText className="text-xs">
														{t("minutesShort")}
													</InputGroupText>
												</InputGroupAddon>
											</InputGroup>
										</div>
										<Button
											type="button"
											variant="secondary"
											size="sm"
											className="h-9"
											onClick={applyBulkValues}
											disabled={!bulkStartTime && !bulkDuration}
										>
											{t("applyToAll")}
										</Button>
									</div>
								</div>
							) : null}
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/40 hover:bg-muted/40">
											<TableHead className="min-w-52 text-xs">{t("subject")}</TableHead>
											<TableHead className="min-w-36 text-xs">{t("examDate")}</TableHead>
											<TableHead className="min-w-28 text-xs">{t("startTime")}</TableHead>
											<TableHead className="min-w-28 text-xs">{t("duration")}</TableHead>
											<TableHead className="min-w-56 text-xs">{t("invigilator")}</TableHead>
											<TableHead className="min-w-36 text-xs">{t("status")}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{(data.subjects || []).map((subject: any) => {
											const row = rowById.get(subject.id) || mapSubjectRow(subject);
											return (
												<TableRow key={subject.id} className="align-top">
													<TableCell className="py-2.5 align-top whitespace-normal">
														<div className="text-sm font-medium">
															{subject.subject?.enName || "-"}
														</div>
														<div className="text-muted-foreground text-xs">
															{subject.subject?.code || subject.subject?.boardCode || "-"} -{" "}
															{subject.totalMarks}/{subject.passMarks}
														</div>
													</TableCell>
													<TableCell className="py-2.5 align-top">
														<Input
															type="date"
															placeholder="Select date"
															value={row.examDate || ""}
															min={examStartDate || undefined}
															max={examEndDate || undefined}
															onChange={(event) =>
																updateRow(subject.id, { examDate: event.target.value })
															}
															className="h-9"
														/>
														{/* Advisory only — the date stays selectable. Schools
														    here do sit exams during vacations; the point is
														    that the clash is seen, not prevented. */}
														<DayConflictBadge
															conflicts={conflictsFor(row.examDate)}
															examStartTime={row.startTime}
															examDurationMins={Number(row.durationMins || 0)}
															onOpen={() =>
																openConflicts(
																	row.examDate,
																	row.startTime,
																	Number(row.durationMins || 0),
																	subject.subject?.enName
																)
															}
														/>
													</TableCell>
													<TableCell className="py-2.5 align-top">
														<Input
															type="time"
															placeholder="Start time"
															value={row.startTime || ""}
															onChange={(event) =>
																updateRow(subject.id, { startTime: event.target.value })
															}
															className="h-9"
														/>
													</TableCell>
													<TableCell className="py-2.5 align-top">
														<InputGroup>
															<InputGroupInput
																type="number"
																min={1}
																placeholder="Duration"
																value={row.durationMins}
																onChange={(event) =>
																	updateRow(subject.id, {
																		durationMins: Number(event.target.value || 0),
																	})
																}
															/>
															<InputGroupAddon align="inline-end">
																<InputGroupText className="text-xs">
																	{t("minutesShort")}
																</InputGroupText>
															</InputGroupAddon>
														</InputGroup>
													</TableCell>
													<TableCell className="py-2.5 align-top">
														<TeacherMultiSelection
															value={row.invigilatorIds || []}
															onChange={(value) =>
																updateRow(subject.id, {
																	invigilatorIds: value,
																	invigilatorId: value[0] || "",
																})
															}
															placeholder="Select invigilators"
														/>
													</TableCell>
													<TableCell className="py-2.5 align-top">
														<Select
															value={row.status}
															onValueChange={(value) =>
																updateRow(subject.id, {
																	status: value as ExamRoutineSubjectStatusEnum,
																})
															}
														>
															<SelectTrigger className="h-9! w-full rounded-md!">
																<SelectValue placeholder="Select status" />
															</SelectTrigger>
															<SelectContent className="p-1">
																{statusOptions.map((option) => (
																	<SelectItem
																		key={option.value}
																		value={option.value}
																		className="cursor-pointer py-2"
																	>
																		{option.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</TableCell>
												</TableRow>
											);
										})}
										{!data.subjects?.length ? (
											<TableRow>
												<TableCell colSpan={6} className="text-muted-foreground h-28 text-center">
													{t("noSubjects")}
												</TableCell>
											</TableRow>
										) : null}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</>
			) : null}

			{!examId ? (
				<Card className="border-dashed shadow-none ring-0">
					<CardContent className="text-muted-foreground flex min-h-48 items-center justify-center text-sm">
						{t("emptyState")}
					</CardContent>
				</Card>
			) : null}

			<DayConflictDialog
				open={!!conflictDay}
				onOpenChange={(open) => {
					if (!open) setConflictDay(null);
				}}
				date={conflictDay?.date || null}
				conflicts={conflictDay?.conflicts || null}
				examStartTime={conflictDay?.startTime}
				examDurationMins={conflictDay?.durationMins}
				subjectName={conflictDay?.subjectName}
			/>
		</div>
	);
}

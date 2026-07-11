"use client";

import ClassRoomSelect from "@/shared/components/form/ClassRoomSelect";
import ExamSelect from "@/shared/components/form/ExamSelect";
import TeacherSelection from "@/shared/components/form/TeacherSelection";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
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
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	ExamRoutineSubjectPayload,
	ExamRoutineSubjectStatusEnum,
} from "../dto/exam-routine.dto";
import {
	downloadExamRoutinePdf,
	saveExamRoutine,
} from "../hooks/use-exam-routine-mutations";
import { useExamRoutine } from "../hooks/use-exam-routine";
import { Download, Save } from "lucide-react";

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

function getClassName(cls: any) {
	return cls?.class?.enName || cls?.enName || "-";
}

function mapSubjectRow(row: any): ExamRoutineSubjectPayload {
	return {
		id: row.id,
		examDate: formatDateInput(row.examDate),
		startTime: row.startTime || "",
		durationMins: row.durationMins || 180,
		classRoomId: row.classRoomId || "",
		invigilatorId: row.invigilatorId || "",
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

	const { data, isLoading } = useExamRoutine(examId, selectedClassId);

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

	const updateRow = (id: string, patch: Partial<ExamRoutineSubjectPayload>) => {
		setRows((current) =>
			current.map((row) => (row.id === id ? { ...row, ...patch } : row))
		);
	};

	const handleExamChange = (value: string) => {
		setExamId(value);
		setSelectedClassId("");
		setRows([]);
		router.push(PATHS.EXAMINATIONS.ROUTINE.EXAM(value));
	};

	const handleSave = async () => {
		if (!examId || !selectedClassId) return;

		setIsSaving(true);
		try {
			await saveExamRoutine({
				examId,
				classId: selectedClassId,
				subjects: rows.map((row) => ({
					...row,
					examDate: row.examDate || null,
					startTime: row.startTime || null,
					classRoomId: row.classRoomId || null,
					invigilatorId: row.invigilatorId || null,
					durationMins: Number(row.durationMins || 180),
				})),
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
		<div className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader className="space-y-2">
					<h2 className="text-base font-semibold">{t("selectExamTitle")}</h2>
					<p className="text-muted-foreground text-sm">{t("selectExamDescription")}</p>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<label className="text-muted-foreground text-sm font-medium">
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
									<p className="rounded-md border px-3 py-2 text-sm">
										{formatDate(data.exam.startDate)} - {formatDate(data.exam.endDate)}
									</p>
								</div>
								<div className="space-y-2">
									<p className="text-muted-foreground text-sm font-medium">Session</p>
									<p className="rounded-md border px-3 py-2 text-sm">
										{data.exam.session?.name || "-"}
									</p>
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
							<div className="space-y-2">
								<h2 className="text-base font-semibold">{t("routineTableTitle")}</h2>
								<p className="text-muted-foreground text-sm">{t("routineTableDescription")}</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={handlePrint}
									disabled={!rows.length || isPrinting}
								>
									<Download className="h-4 w-4" />
									{t("downloadPdf")}
								</Button>
								<Button
									type="button"
									onClick={handleSave}
									disabled={!rows.length || isSaving}
								>
									<Save className="h-4 w-4" />
									{isSaving ? t("saving") : t("saveRoutine")}
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="min-w-52">{t("subject")}</TableHead>
											<TableHead className="min-w-40">{t("examDate")}</TableHead>
											<TableHead className="min-w-36">{t("startTime")}</TableHead>
											<TableHead className="min-w-32">{t("duration")}</TableHead>
											<TableHead className="min-w-56">{t("room")}</TableHead>
											<TableHead className="min-w-64">{t("invigilator")}</TableHead>
											<TableHead className="min-w-40">{t("status")}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{(data.subjects || []).map((subject: any) => {
											const row = rowById.get(subject.id) || mapSubjectRow(subject);
											return (
												<TableRow key={subject.id}>
													<TableCell className="whitespace-normal">
														<div className="font-medium">{subject.subject?.enName || "-"}</div>
														<div className="text-muted-foreground text-xs">
															{subject.subject?.code || subject.subject?.boardCode || "-"} ·{" "}
															{subject.totalMarks}/{subject.passMarks}
														</div>
													</TableCell>
													<TableCell>
														<Input
															type="date"
															placeholder="Select date"
															value={row.examDate || ""}
															onChange={(event) =>
																updateRow(subject.id, { examDate: event.target.value })
															}
															className="h-10"
														/>
													</TableCell>
													<TableCell>
														<Input
															type="time"
															placeholder="Start time"
															value={row.startTime || ""}
															onChange={(event) =>
																updateRow(subject.id, { startTime: event.target.value })
															}
															className="h-10"
														/>
													</TableCell>
													<TableCell>
														<Input
															type="number"
															min={1}
															placeholder="Duration"
															value={row.durationMins}
															onChange={(event) =>
																updateRow(subject.id, {
																	durationMins: Number(event.target.value || 0),
																})
															}
															className="h-10"
														/>
													</TableCell>
													<TableCell>
														<ClassRoomSelect
															value={row.classRoomId || ""}
															onChange={(value) =>
																updateRow(subject.id, { classRoomId: value })
															}
															placeholder="Select room"
														/>
													</TableCell>
													<TableCell>
														<TeacherSelection
															value={row.invigilatorId || ""}
															onChange={(value) =>
																updateRow(subject.id, { invigilatorId: value })
															}
															placeholder="Select invigilator"
														/>
													</TableCell>
													<TableCell>
														<Select
															value={row.status}
															onValueChange={(value) =>
																updateRow(subject.id, {
																	status: value as ExamRoutineSubjectStatusEnum,
																})
															}
														>
															<SelectTrigger className="h-10 w-full">
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
												<TableCell colSpan={7} className="text-muted-foreground h-28 text-center">
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
		</div>
	);
}

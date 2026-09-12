"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Homework,
	HomeworkSubmissionStatusEnum,
	submissionStatusOptions,
} from "../dto/homework.dto";
import { saveHomeworkSubmissions } from "../hooks/use-homework-mutations";
import { useHomeworkRoster } from "../hooks/use-homeworks";

type Draft = Record<
	string,
	{ status: HomeworkSubmissionStatusEnum; obtainedMarks: string; remarks: string }
>;

export default function HomeworkSubmissionsSheet({
	homework,
	open,
}: {
	homework: Homework | null;
	open: boolean;
}) {
	const t = useTranslations("Homework");
	const { roster, totalMarks, isLoading, mutate } = useHomeworkRoster(
		open && homework ? homework.id : undefined
	);
	const [draft, setDraft] = useState<Draft>({});
	const [isSaving, setIsSaving] = useState(false);

	// Seed the editable draft from whatever is already recorded.
	useEffect(() => {
		if (!roster.length) return;
		setDraft(
			Object.fromEntries(
				roster.map((row) => [
					row.student.id,
					{
						status: row.status,
						obtainedMarks: row.obtainedMarks != null ? String(row.obtainedMarks) : "",
						remarks: row.remarks || "",
					},
				])
			)
		);
	}, [roster]);

	const graded = totalMarks != null;

	const setRow = (studentId: string, patch: Partial<Draft[string]>) =>
		setDraft((current) => ({
			...current,
			[studentId]: { ...current[studentId], ...patch },
		}));

	const markAll = (status: HomeworkSubmissionStatusEnum) =>
		setDraft((current) =>
			Object.fromEntries(
				Object.entries(current).map(([id, row]) => [id, { ...row, status }])
			)
		);

	const handleSave = async () => {
		if (!homework) return;
		setIsSaving(true);
		try {
			await saveHomeworkSubmissions(
				homework.id,
				Object.entries(draft).map(([studentId, row]) => ({
					studentId,
					status: row.status,
					obtainedMarks: row.obtainedMarks === "" ? undefined : Number(row.obtainedMarks),
					remarks: row.remarks || undefined,
				}))
			);
			toast.success(t("submissionsSaved"));
			await mutate();
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[70vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("submissionsTitle")}
				</SheetTitle>
				<SheetDescription className="text-xs">
					{homework?.title}
					{homework?.section?.name ? ` · ${homework.section.name}` : ""}
					{graded ? ` · ${t("totalMarks")}: ${totalMarks}` : ""}
				</SheetDescription>
			</SheetHeader>

			<div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-muted-foreground text-xs">{t("markAll")}:</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => markAll(HomeworkSubmissionStatusEnum.SUBMITTED)}
					>
						{t("statusSubmitted")}
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => markAll(HomeworkSubmissionStatusEnum.MISSING)}
					>
						{t("statusMissing")}
					</Button>
				</div>
				<Button type="button" onClick={handleSave} disabled={isSaving || !roster.length}>
					<Save className="h-4 w-4" />
					{isSaving ? t("saving") : t("saveSubmissions")}
				</Button>
			</div>

			<ScrollArea className="h-[calc(100vh-190px)]">
				{isLoading ? (
					<div className="space-y-2 p-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				) : !roster.length ? (
					<p className="text-muted-foreground p-6 text-center text-sm">
						{t("noStudents")}
					</p>
				) : (
					<div className="p-3">
						<div className="bg-muted/40 text-muted-foreground grid grid-cols-[1fr_150px_90px_1fr] gap-3 rounded-t-md px-3 py-2 text-xs font-medium">
							<span>{t("student")}</span>
							<span>{t("status")}</span>
							<span className="text-right">{t("marks")}</span>
							<span>{t("remarks")}</span>
						</div>
						<div className="divide-y rounded-b-md border border-t-0">
							{roster.map((row) => {
								const entry = draft[row.student.id];
								if (!entry) return null;
								return (
									<div
										key={row.student.id}
										className="grid grid-cols-[1fr_150px_90px_1fr] items-center gap-3 px-3 py-2"
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">
												{row.student.fullNameEn}
											</p>
											<p className="text-muted-foreground text-xs">
												{row.student.rollNumber ? `Roll ${row.student.rollNumber} · ` : ""}
												{row.student.studentIdNo}
											</p>
										</div>
										<NativeSelect
											value={entry.status}
											onChange={(e) =>
												setRow(row.student.id, {
													status: e.target.value as HomeworkSubmissionStatusEnum,
												})
											}
										>
											{submissionStatusOptions.map((option) => (
												<NativeSelectOption key={option.value} value={option.value}>
													{option.label}
												</NativeSelectOption>
											))}
										</NativeSelect>
										<Input
											type="number"
											min={0}
											max={graded ? Number(totalMarks) : undefined}
											className="h-9 text-right"
											value={entry.obtainedMarks}
											disabled={!graded}
											placeholder={graded ? `0-${totalMarks}` : "N/A"}
											onChange={(e) =>
												setRow(row.student.id, { obtainedMarks: e.target.value })
											}
										/>
										<Input
											className="h-9"
											value={entry.remarks}
											placeholder={t("remarks")}
											onChange={(e) => setRow(row.student.id, { remarks: e.target.value })}
										/>
									</div>
								);
							})}
						</div>
						{!graded ? (
							<p className="text-muted-foreground mt-2 text-xs">
								<Badge variant="secondary" className="mr-1 font-normal">
									{t("ungraded")}
								</Badge>
								{t("ungradedHint")}
							</p>
						) : null}
					</div>
				)}
			</ScrollArea>
		</SheetContent>
	);
}

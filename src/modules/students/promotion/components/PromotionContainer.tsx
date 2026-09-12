"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { useSWR } from "@/shared/hooks/use-swr";
import { Save, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { emptyPromotionRow, PromotionRowState } from "../dto/student-promotion.dto";
import { usePromotionOptions } from "../hooks/use-promotion-options";
import { getNextRoll, processPromotion } from "../hooks/use-promotion-mutations";
import PromotionFilter from "./PromotionFilter";
import PromotionTable from "./PromotionTable";

type SourceFilter = { sessionId: string; classId: string; sectionId: string };

export default function PromotionContainer() {
	const t = useTranslations("StudentPromotion");

	const [sourceFilter, setSourceFilter] = useState<SourceFilter | null>(null);
	const [rows, setRows] = useState<Record<string, PromotionRowState>>({});

	const [toSessionId, setToSessionId] = useState("");
	const [bulkClassId, setBulkClassId] = useState("");
	const [bulkSectionId, setBulkSectionId] = useState("");
	const [applying, setApplying] = useState(false);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const { data: studentsRes, isLoading } = useSWR(
		sourceFilter ? "/students" : null,
		sourceFilter
			? {
					sessionId: sourceFilter.sessionId,
					classId: sourceFilter.classId,
					...(sourceFilter.sectionId ? { sectionId: sourceFilter.sectionId } : {}),
					limit: 300,
				}
			: undefined
	);
	const students: any[] = useMemo(() => studentsRes?.data?.items || [], [studentsRes]);

	const { sessionOptions, classOptions: bulkClassOptions, sectionOptions: bulkSectionOptions } =
		usePromotionOptions({ sessionId: toSessionId, classId: bulkClassId });

	const targetSessionOptions = useMemo(
		() => sessionOptions.filter((option) => option.value !== sourceFilter?.sessionId),
		[sessionOptions, sourceFilter]
	);

	useEffect(() => {
		if (students.length > 0 && Object.keys(rows).length === 0) {
			const initial: Record<string, PromotionRowState> = {};
			students.forEach((student) => {
				initial[student.id] = emptyPromotionRow();
			});
			setRows(initial);
		}
	}, [students, rows]);

	const handleFetchStudents = (sessionId: string, classId: string, sectionId: string) => {
		setSourceFilter({ sessionId, classId, sectionId });
		setRows({});
		setToSessionId("");
		setBulkClassId("");
		setBulkSectionId("");
	};

	const handleRowChange = (studentId: string, patch: Partial<PromotionRowState>) => {
		setRows((prev) => {
			const current = prev[studentId];
			let next: PromotionRowState = { ...current, ...patch };

			if (patch.action === "retain" && sourceFilter) {
				// Retaining means repeating the same class next session --
				// always reset to the source class, discarding any class the
				// student was previously (bulk-)assigned to as "promote".
				next = { ...next, toClassId: sourceFilter.classId, toSectionId: "", toRoll: "" };
			}
			if (patch.action === "leave") {
				next = { ...next, toClassId: "", toSectionId: "", toRoll: "" };
			}

			return { ...prev, [studentId]: next };
		});
	};

	const applyBulkSettings = async () => {
		if (!toSessionId || !bulkClassId) {
			toast.error(t("bulk.selectTargetFirst"));
			return;
		}
		setApplying(true);
		try {
			const base = await getNextRoll({
				sessionId: toSessionId,
				classId: bulkClassId,
				sectionId: bulkSectionId || undefined,
			});
			let next = parseInt(base, 10) || 1;
			setRows((prev) => {
				const updated = { ...prev };
				students.forEach((student) => {
					const current = updated[student.id];
					// Only rows still marked "promote" take the bulk target --
					// retained students stay in the source class, and leaving
					// students need no target at all.
					if (!current || current.action !== "promote") return;
					updated[student.id] = {
						...current,
						toClassId: bulkClassId,
						toSectionId: bulkSectionId,
						toRoll: String(next).padStart(3, "0"),
					};
					next += 1;
				});
				return updated;
			});
			toast.success(t("bulk.applySuccess"));
		} finally {
			setApplying(false);
		}
	};

	const summary = useMemo(() => {
		const counts = { promoted: 0, retained: 0, left: 0 };
		Object.values(rows).forEach((row) => {
			if (row.action === "promote") counts.promoted += 1;
			else if (row.action === "retain") counts.retained += 1;
			else if (row.action === "leave") counts.left += 1;
		});
		return counts;
	}, [rows]);

	const handleOpenConfirm = () => {
		if (!toSessionId) {
			toast.error(t("validation.targetSessionRequired"));
			return;
		}
		const missingTarget = students.some((student) => {
			const row = rows[student.id];
			return row?.action !== "leave" && !row?.toClassId;
		});
		if (missingTarget) {
			toast.error(t("validation.targetClassRequired"));
			return;
		}
		setConfirmOpen(true);
	};

	const handleConfirmSubmit = async () => {
		if (!sourceFilter) return;
		setSubmitting(true);
		try {
			const decisions = students.map((student) => {
				const row = rows[student.id];
				return {
					studentId: student.id,
					action: row.action,
					toClassId: row.action === "leave" ? undefined : row.toClassId,
					toSectionId: row.action === "leave" ? undefined : row.toSectionId || undefined,
					toRoll: row.action === "leave" ? undefined : row.toRoll || undefined,
					remarks: row.remarks || undefined,
				};
			});

			const result = await processPromotion({
				fromSessionId: sourceFilter.sessionId,
				fromClassId: sourceFilter.classId,
				fromSectionId: sourceFilter.sectionId || undefined,
				toSessionId,
				decisions,
			});

			toast.success(
				t("submitSuccess", {
					promoted: result.promoted,
					retained: result.retained,
					left: result.left,
				})
			);
			setSourceFilter(null);
			setRows({});
			setToSessionId("");
			setBulkClassId("");
			setBulkSectionId("");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<PromotionFilter onFetchStudents={handleFetchStudents} isLoading={isLoading} />

			{sourceFilter && students.length > 0 && (
				<Card className="border-primary/20 bg-primary/5 gap-0 shadow-none">
					<CardHeader className="pb-4">
						<div className="flex items-center gap-2">
							<Settings2 className="text-primary h-5 w-5" />
							<div>
								<CardTitle className="text-base">{t("bulk.title")}</CardTitle>
								<CardDescription className="text-xs">{t("bulk.description")}</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap items-end gap-3">
							<div className="min-w-45 flex-1 space-y-1">
								<label className="text-muted-foreground text-xs font-semibold uppercase">
									{t("bulk.targetSession")}
								</label>
								<Select
									value={toSessionId}
									onValueChange={(val) => {
										setToSessionId(val || "");
										setBulkClassId("");
										setBulkSectionId("");
									}}
								>
									<SelectTrigger className="bg-background h-10! w-full">
										<SelectValue placeholder={t("bulk.targetSession")} />
									</SelectTrigger>
									<SelectContent>
										{targetSessionOptions.map((option) => (
											<SelectItem className="py-2" key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="min-w-45 flex-1 space-y-1">
								<label className="text-muted-foreground text-xs font-semibold uppercase">
									{t("bulk.targetClass")}
								</label>
								<Select
									value={bulkClassId}
									onValueChange={(val) => {
										setBulkClassId(val || "");
										setBulkSectionId("");
									}}
									disabled={!toSessionId}
								>
									<SelectTrigger className="bg-background h-10! w-full">
										<SelectValue placeholder={t("bulk.targetClass")} />
									</SelectTrigger>
									<SelectContent>
										{bulkClassOptions.map((option) => (
											<SelectItem className="py-2" key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="min-w-45 flex-1 space-y-1">
								<label className="text-muted-foreground text-xs font-semibold uppercase">
									{t("bulk.targetSection")}
								</label>
								<Select
									value={bulkSectionId}
									onValueChange={(val) => setBulkSectionId(val || "")}
									disabled={!bulkClassId}
								>
									<SelectTrigger className="bg-background h-10! w-full">
										<SelectValue placeholder={t("bulk.targetSection")} />
									</SelectTrigger>
									<SelectContent>
										{bulkSectionOptions.map((option) => (
											<SelectItem className="py-2" key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Button
								onClick={applyBulkSettings}
								variant="outline"
								disabled={!toSessionId || !bulkClassId || applying}
								className="h-10 gap-2"
							>
								<Save className="h-4 w-4" />
								{applying ? "..." : t("bulk.apply")}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<PromotionTable
				students={students}
				rows={rows}
				toSessionId={toSessionId}
				onRowChange={handleRowChange}
			/>

			{sourceFilter && students.length > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
					<div className="flex gap-4 text-xs font-medium">
						<span className="text-green-600 dark:text-green-400">
							{summary.promoted} {t("table.promote")}
						</span>
						<span className="text-amber-600 dark:text-amber-400">
							{summary.retained} {t("table.retain")}
						</span>
						<span className="text-red-600 dark:text-red-400">
							{summary.left} {t("table.leave")}
						</span>
					</div>
					<Button onClick={handleOpenConfirm} size="lg" className="gap-2">
						<Save className="h-4 w-4" />
						{t("submit")}
					</Button>
				</div>
			)}

			<ConfirmationModal
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				onConfirm={handleConfirmSubmit}
				isLoading={submitting}
				title={t("confirm.title")}
				description={t("confirm.description")}
				confirmText={t("submit")}
				body={
					<div className="flex gap-4 text-sm">
						<span>
							<strong>{summary.promoted}</strong> {t("table.promote")}
						</span>
						<span>
							<strong>{summary.retained}</strong> {t("table.retain")}
						</span>
						<span>
							<strong>{summary.left}</strong> {t("table.leave")}
						</span>
					</div>
				}
			/>
		</div>
	);
}

"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import { useSessionStore } from "@/shared/stores/session-store";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	difficultyColors,
	QuestionStatusEnum,
	questionTypeColors,
	statusColors,
} from "../dto/question-bank.dto";
import {
	useQuestionBank,
	useQuestionBankSummary,
} from "../hooks/use-question-bank";
import {
	bulkUpdateQuestionStatus,
	deleteQuestion,
	duplicateQuestion,
} from "../hooks/use-question-bank-mutations";
import QuestionBankFilterBar, { QuestionBankFilter } from "./QuestionBankFilterBar";
import QuestionBankSummary from "./QuestionBankSummary";
import QuestionPreview from "./QuestionPreview";

const initialFilter: QuestionBankFilter = {
	search: "",
	classId: [],
	subjectId: [],
	chapter: [],
	type: [],
	difficulty: [],
	status: [],
};

/**
 * The bank browser.
 *
 * A card list rather than a DataTable: a question is a paragraph of rich text
 * with options beneath it, and squeezing that into a table row either truncates
 * the thing you came to read or makes rows wildly uneven. Cards show the
 * question as it will print, which is what a teacher is actually scanning for.
 */
export default function QuestionBankList() {
	const t = useTranslations("QuestionBank");
	const tc = useTranslations("Common");
	const { selectedSessionId } = useSessionStore();

	const [filter, setFilter] = useState<QuestionBankFilter>(initialFilter);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [selected, setSelected] = useState<string[]>([]);
	const [isBusy, setIsBusy] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);

	const { summary } = useQuestionBankSummary({
		classId: filter.classId[0],
		subjectId: filter.subjectId[0],
	});

	const { items, meta, isLoading } = useQuestionBank({
		page,
		limit,
		search: filter.search,
		classId: filter.classId[0],
		subjectId: filter.subjectId[0],
		chapter: filter.chapter[0],
		type: filter.type,
		difficulty: filter.difficulty,
		status: filter.status,
	});

	const allOnPageSelected = useMemo(
		() => items.length > 0 && items.every((item) => selected.includes(item.id)),
		[items, selected]
	);

	const toggleAllOnPage = (checked: boolean) => {
		const pageIds = items.map((item) => item.id);
		setSelected((current) =>
			checked
				? Array.from(new Set([...current, ...pageIds]))
				: current.filter((id) => !pageIds.includes(id))
		);
	};

	const runBulkStatus = async (status: QuestionStatusEnum) => {
		if (!selected.length) return;
		setIsBusy(true);
		try {
			const response = await bulkUpdateQuestionStatus(selected, status);
			toast.success(t("bulkSuccess", { count: response?.data?.updated ?? selected.length }));
			setSelected([]);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsBusy(false);
		}
	};

	const confirmDelete = async (id: string) => {
		setItemToDelete(id);
		setIsBusy(true);
		try {
			await deleteQuestion(id);
			toast.success(t("deleteSuccess"));
			setSelected((current) => current.filter((value) => value !== id));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsBusy(false);
			setItemToDelete(null);
		}
	};

	const handleDuplicate = async (id: string) => {
		setIsBusy(true);
		try {
			await duplicateQuestion(id);
			toast.success(t("duplicateSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsBusy(false);
		}
	};

	const resetFilters = () => {
		setFilter(initialFilter);
		setSelected([]);
		setPage(1);
		setLimit(10);
	};

	return (
		<div className="space-y-4">
			<QuestionBankSummary summary={summary} />

			<Card className="p-6 shadow-none ring-0">
				<CardHeader className="p-0">
					<QuestionBankFilterBar
						filter={filter}
						setFilter={(next) => {
							setFilter(next);
							setPage(1);
						}}
						chapters={summary?.chapters || []}
						sessionId={selectedSessionId || undefined}
					/>
				</CardHeader>

				<CardContent className="space-y-4 p-0">
					<TableFilter
						filter={filter}
						setFilter={(next) => {
							setFilter(next);
							setPage(1);
						}}
						resetFilters={resetFilters}
						hideExport
					/>

					{/* The bulk bar only exists while something is selected — a
					    permanently visible toolbar of disabled buttons is noise. */}
					{selected.length > 0 && (
						<div className="border-border/70 bg-muted/40 flex flex-wrap items-center gap-3 rounded-md border px-4 py-3">
							<span className="text-sm font-medium">
								{t("selectedCount", { count: selected.length })}
							</span>
							<PermissionGuard
								permissions={[
									PERMISSIONS.EXAMINATIONS.ALL,
									PERMISSIONS.EXAMINATIONS.QUESTION_BANK.ALL,
									PERMISSIONS.EXAMINATIONS.QUESTION_BANK.EDIT,
								]}
							>
								<span className="flex flex-wrap items-center gap-2">
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={isBusy}
										onClick={() => runBulkStatus(QuestionStatusEnum.PUBLISHED)}
									>
										{t("publishSelected")}
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={isBusy}
										onClick={() => runBulkStatus(QuestionStatusEnum.ARCHIVED)}
									>
										{t("archiveSelected")}
									</Button>
								</span>
							</PermissionGuard>
							<Button
								type="button"
								size="sm"
								variant="ghost"
								className="ml-auto"
								onClick={() => setSelected([])}
							>
								{t("clearSelection")}
							</Button>
						</div>
					)}

					{items.length > 0 && (
						<label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
							<Checkbox
								checked={allOnPageSelected}
								onCheckedChange={(checked) => toggleAllOnPage(checked === true)}
							/>
							{t("selectAllOnPage")}
						</label>
					)}

					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={index} className="h-40 w-full rounded-md" />
							))}
						</div>
					) : !items.length ? (
						<div className="border-border/70 flex min-h-48 items-center justify-center rounded-md border border-dashed">
							<p className="text-muted-foreground text-sm">{t("emptyState")}</p>
						</div>
					) : (
						<div className="space-y-3">
							{items.map((item, index) => {
								const typeColor = questionTypeColors[item.type];
								const difficultyColor = difficultyColors[item.difficulty];
								const statusColor = statusColors[item.status];
								const isSelected = selected.includes(item.id);
								return (
									<div
										key={item.id}
										className={cn(
											"rounded-lg border p-4 transition-colors",
											isSelected && "border-primary/50 bg-accent/20"
										)}
									>
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div className="flex min-w-0 flex-1 items-start gap-3">
												<Checkbox
													checked={isSelected}
													onCheckedChange={(checked) =>
														setSelected((current) =>
															checked === true
																? [...current, item.id]
																: current.filter((value) => value !== item.id)
														)
													}
													className="mt-1 shrink-0"
												/>
												<div className="min-w-0 flex-1 space-y-1">
													<div className="flex flex-wrap items-center gap-1.5">
														<Badge
															className={cn(
																"border-transparent text-[10px] font-normal",
																typeColor?.bg,
																typeColor?.text
															)}
														>
															{t(`typeValue.${item.type}`)}
														</Badge>
														<Badge
															className={cn(
																"border-transparent text-[10px] font-normal",
																difficultyColor?.bg,
																difficultyColor?.text
															)}
														>
															{t(`difficultyValue.${item.difficulty}`)}
														</Badge>
														<Badge
															className={cn(
																"border-transparent text-[10px] font-normal",
																statusColor?.bg,
																statusColor?.text
															)}
														>
															{t(`statusValue.${item.status}`)}
														</Badge>
														{item.usageCount > 0 && (
															<Badge variant="outline" className="text-[10px] font-normal">
																{t("usedCount", { count: item.usageCount })}
															</Badge>
														)}
													</div>
													<p className="text-muted-foreground truncate text-xs">
														{[
															item.class?.enName,
															item.subject?.enName,
															item.chapter,
															item.section,
															item.source,
														]
															.filter(Boolean)
															.join(" · ")}
													</p>
												</div>
											</div>

											<div className="flex shrink-0 items-center gap-2">
												<PermissionGuard
													permissions={[
														PERMISSIONS.EXAMINATIONS.ALL,
														PERMISSIONS.EXAMINATIONS.QUESTION_BANK.ALL,
														PERMISSIONS.EXAMINATIONS.QUESTION_BANK.CREATE,
													]}
												>
													<Button
														variant="outline"
														size="icon-sm"
														title={t("duplicate")}
														disabled={isBusy}
														onClick={() => handleDuplicate(item.id)}
													>
														<Copy className="size-4" />
													</Button>
												</PermissionGuard>
												<PermissionGuard
													permissions={[
														PERMISSIONS.EXAMINATIONS.ALL,
														PERMISSIONS.EXAMINATIONS.QUESTION_BANK.ALL,
														PERMISSIONS.EXAMINATIONS.QUESTION_BANK.EDIT,
													]}
												>
													<Button asChild variant="outline" size="icon-sm">
														<Link href={PATHS.EXAMINATIONS.QUESTION_BANK.EDIT(item.id)}>
															<Pencil className="size-4" />
														</Link>
													</Button>
												</PermissionGuard>
												<PermissionGuard
													permissions={[
														PERMISSIONS.EXAMINATIONS.ALL,
														PERMISSIONS.EXAMINATIONS.QUESTION_BANK.ALL,
														PERMISSIONS.EXAMINATIONS.QUESTION_BANK.DELETE,
													]}
												>
													<ConfirmationModal
														onConfirm={() => confirmDelete(item.id)}
														title={t("deleteTitle")}
														description={t("deleteDescription")}
														confirmText={tc("delete")}
														variant="destructive"
														isLoading={isBusy && itemToDelete === item.id}
													>
														<AlertDialogTrigger asChild>
															<Button variant="destructive" size="icon-sm">
																<Trash2 className="size-4" />
															</Button>
														</AlertDialogTrigger>
													</ConfirmationModal>
												</PermissionGuard>
											</div>
										</div>

										<div className="mt-3">
											<QuestionPreview
												values={item}
												index={(meta.page - 1) * meta.limit + index + 1}
												compact
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}

					{meta.totalPages > 1 && (
						<div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
							<span className="text-muted-foreground text-sm">
								{t("pageOf", { page: meta.page, total: meta.totalPages })}
							</span>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={!meta.hasPreviousPage}
									onClick={() => setPage((current) => Math.max(current - 1, 1))}
								>
									{t("previous")}
								</Button>
								<Button
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
				</CardContent>
			</Card>
		</div>
	);
}

"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { PATHS } from "@/shared/configs/paths.config";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { useSessionStore } from "@/shared/stores/session-store";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Homework, HomeworkStatusEnum } from "../dto/homework.dto";
import { deleteHomework } from "../hooks/use-homework-mutations";
import { useHomeworks } from "../hooks/use-homeworks";
import { HomeworkCreate } from "./HomeworkCreate";
import HomeworkDetailsSheet from "./HomeworkDetailsSheet";
import HomeworkFilterBar from "./HomeworkFilterBar";
import HomeworkSubmissionsSheet from "./HomeworkSubmissionsSheet";

export type HomeworkFilter = {
	search: string;
	status: string[];
	type: string[];
	classId: string[];
	sectionId: string[];
	subjectId: string[];
	teacherId: string[];
};

const initialFilters: HomeworkFilter = {
	search: "",
	status: [],
	type: [],
	classId: [],
	sectionId: [],
	subjectId: [],
	teacherId: [],
};

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "-";

const statusVariant = (status: HomeworkStatusEnum) =>
	status === HomeworkStatusEnum.PUBLISHED
		? "default"
		: status === HomeworkStatusEnum.ARCHIVED
			? "outline"
			: "secondary";

/**
 * `hasOpened` keeps the sheet's fetch from firing for every row on the page —
 * it only turns on once this row's sheet has actually been opened, and stays on
 * afterwards so reopening shows the cached record instead of a skeleton.
 */
function HomeworkDetailsAction({ id }: { id: string }) {
	const t = useTranslations("Homework");
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon-sm" title={t("detailsTitle")}>
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<HomeworkDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

export default function HomeworkList() {
	const t = useTranslations("Homework");
	const tc = useTranslations("Common");
	const { selectedSessionId } = useSessionStore();
	const { user } = useAuthStore((state) => state.auth);

	const [filter, setFilter] = useState<HomeworkFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [submissionsFor, setSubmissionsFor] = useState<Homework | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const { data, meta, isLoading } = useHomeworks({
		page,
		limit,
		sessionId: selectedSessionId || undefined,
		search: filter.search || undefined,
		status: filter.status.length ? filter.status.join(",") : undefined,
		type: filter.type.length ? filter.type.join(",") : undefined,
		classId: filter.classId.length ? filter.classId.join(",") : undefined,
		sectionId: filter.sectionId.length ? filter.sectionId.join(",") : undefined,
		subjectId: filter.subjectId.length ? filter.subjectId.join(",") : undefined,
		teacherId: filter.teacherId.length ? filter.teacherId.join(",") : undefined,
	});

	const confirmDelete = async (id: string) => {
		setDeletingId(id);
		try {
			await deleteHomework(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setDeletingId(null);
		}
	};

	const columns: ColumnDef<Homework>[] = [
		{
			id: "title",
			header: t("homeworkTitle"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="min-w-0">
						<p className="truncate font-medium">{item.title}</p>
						<p className="text-muted-foreground text-xs">
							{item.subject?.enName}
							{item.teacher?.fullName ? ` · ${item.teacher.fullName}` : ""}
						</p>
					</div>
				);
			},
		},
		{
			id: "target",
			header: t("classSection"),
			cell: ({ row }) => (
				<span className="text-sm">
					{row.original.class?.enName || "-"}
					{/* No section means the whole class. */}
					{row.original.section?.name ? ` / ${row.original.section.name}` : ` / ${t("allSections")}`}
				</span>
			),
		},
		{
			id: "type",
			header: t("type"),
			cell: ({ row }) => (
				<Badge variant="secondary" className="font-normal">
					{row.original.type.charAt(0) + row.original.type.slice(1).toLowerCase()}
				</Badge>
			),
		},
		{
			id: "dates",
			header: t("dueDate"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="space-y-0.5">
						<p className="text-sm tabular-nums">{formatDate(item.dueDate)}</p>
						{item.isOverdue ? (
							<Badge variant="destructive" className="h-4 px-1.5 text-[10px] font-normal">
								{t("overdue")}
							</Badge>
						) : (
							<p className="text-muted-foreground text-xs tabular-nums">
								{t("assigned")}: {formatDate(item.assignedDate)}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "submissions",
			header: t("submissions"),
			cell: ({ row }) => {
				const s = row.original.submissionSummary;
				// Nothing recorded yet reads better as a dash than as 0%.
				if (!s || s.total === 0) {
					return <span className="text-muted-foreground text-xs">—</span>;
				}
				const percent = Math.round((s.submitted / s.total) * 100);
				return (
					<div className="min-w-28 space-y-1">
						<div className="flex justify-between text-xs tabular-nums">
							<span>
								{s.submitted}/{s.total}
							</span>
							<span>{percent}%</span>
						</div>
						<Progress value={percent} className="h-1.5" />
					</div>
				);
			},
		},
		{
			id: "topPerformer",
			header: t("topPerformer"),
			cell: ({ row }) => {
				const top = row.original.topPerformer;
				if (!top || !top.students.length) {
					return <span className="text-muted-foreground text-xs">—</span>;
				}
				return (
					<div className="max-w-40">
						<p className="truncate text-sm" title={top.students.join(", ")}>
							{top.students.join(", ")}
						</p>
						<p className="text-muted-foreground text-xs tabular-nums">
							{top.marks} {t("marks")}
						</p>
					</div>
				);
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => (
				<Badge variant={statusVariant(row.original.status)} className="font-normal">
					{row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
				</Badge>
			),
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOMEWORK.ALL,
								PERMISSIONS.ACADEMICS.HOMEWORK.VIEW,
							]}
						>
							<HomeworkDetailsAction id={item.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOMEWORK.ALL,
								PERMISSIONS.ACADEMICS.HOMEWORK.EDIT,
							]}
						>
							<Button
								variant="outline"
								size="icon-sm"
								title={t("submissionsTitle")}
								onClick={() => setSubmissionsFor(item)}
							>
								<ClipboardCheck className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
							<Button asChild variant="outline" size="icon-sm" title={t("editHomework")}>
								<Link href={PATHS.ACADEMICS.HOMEWORK.EDIT(item.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.HOMEWORK.ALL,
								PERMISSIONS.ACADEMICS.HOMEWORK.DELETE,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(item.id)}
								title={t("deleteTitle")}
								description={t("deleteConfirm")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={deletingId === item.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="icon-sm" title={t("deleteTitle")}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</AlertDialogTrigger>
							</ConfirmationModal>
						</PermissionGuard>
					</div>
				);
			},
		},
	];

	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<HomeworkFilterBar filter={filter} setFilter={setFilter}>
					<HomeworkCreate />
				</HomeworkFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.HOMEWORK.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={data}
					isLoading={isLoading}
					pagination={
						meta
							? {
									page: meta.page,
									limit: meta.limit,
									total: meta.total,
									totalPages: meta.totalPages,
									onPageChange: setPage,
									onLimitChange: setLimit,
								}
							: undefined
					}
				/>
			</CardContent>

			<Sheet
				open={!!submissionsFor}
				onOpenChange={(open) => !open && setSubmissionsFor(null)}
			>
				<HomeworkSubmissionsSheet homework={submissionsFor} open={!!submissionsFor} />
			</Sheet>
		</Card>
	);
}

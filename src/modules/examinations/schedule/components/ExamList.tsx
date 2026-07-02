"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ExamStatusEnum } from "../dto/exam.dto";
import { deleteExam, updateExamStatus } from "../hooks/use-exam-mutations";
import { useExams } from "../hooks/use-exams";
import { ExamModel } from "../models/exam.model";
import { ExamCreate } from "./ExamCreate";
import { ExamDetailsSheet } from "./ExamDetailsSheet";
import ExamFilterBar from "./ExamFilterBar";

export type ExamFilter = {
	search: string;
	type: string[];
	status: string[];
};

const initialFilters: ExamFilter = { search: "", type: [], status: [] };

const format = (value?: string) =>
	value ? value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "-";

const examStatusOptions = Object.values(ExamStatusEnum).map((value) => ({
	label: format(value),
	value,
}));

function ExamDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const t = useTranslations("Exams");

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
			<ExamDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

function ExamStatusCell({ exam }: { exam: ExamModel }) {
	const [pendingStatus, setPendingStatus] = useState<ExamStatusEnum | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const t = useTranslations("Exams");
	const tc = useTranslations("Common");

	const handleConfirm = async () => {
		if (!pendingStatus || pendingStatus === exam.status) return;

		setIsUpdating(true);
		try {
			await updateExamStatus(exam.id, pendingStatus);
			toast.success(t("statusUpdateSuccess"));
			setPendingStatus(null);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<>
			<Select
				value={exam.status}
				disabled={isUpdating}
				onValueChange={(value) => {
					if (value === exam.status) return;
					setPendingStatus(value as ExamStatusEnum);
				}}
			>
				<SelectTrigger className="h-8 min-w-36">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{examStatusOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<ConfirmationModal
				open={!!pendingStatus}
				onOpenChange={(open) => {
					if (!open && !isUpdating) setPendingStatus(null);
				}}
				onConfirm={handleConfirm}
				title={t("statusChangeTitle")}
				description={
					pendingStatus
						? t("statusChangeDescription", { status: format(pendingStatus) })
						: undefined
				}
				confirmText={tc("changeStatus")}
				isLoading={isUpdating}
			/>
		</>
	);
}

export default function ExamList() {
	const [filter, setFilter] = useState<ExamFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [examToDelete, setExamToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const t = useTranslations("Exams");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { data: exams, meta, isLoading } = useExams({
		page,
		limit,
		search: filter.search,
		type: filter.type,
		status: filter.status,
	});

	const confirmDelete = async (id: string) => {
		setExamToDelete(id);
		setIsDeleting(true);
		try {
			await deleteExam(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setExamToDelete(null);
		}
	};

	const columns: ColumnDef<ExamModel>[] = [
		{
			id: "name",
			header: t("examName"),
			cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
		},
		{
			id: "type",
			header: t("type"),
			cell: ({ row }) => <span>{format(row.original.type)}</span>,
		},
		{
			id: "dateRange",
			header: t("dateRange"),
			cell: ({ row }) => (
				<span>
					{row.original.startDate?.slice(0, 10)} - {row.original.endDate?.slice(0, 10)}
				</span>
			),
		},
		{
			id: "classes",
			header: t("classes"),
			cell: ({ row }) => (
				<span>
					{row.original.classes
						.slice(0, 2)
						.map((item) => item.class?.enName)
						.filter(Boolean)
						.join(", ")}
					{row.original.classes.length > 2 ? ` +${row.original.classes.length - 2}` : ""}
				</span>
			),
		},
		{
			id: "subjects",
			header: t("subjects"),
			cell: ({ row }) => <span>{row.original.subjectsCount}</span>,
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const exam = row.original;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.EXAMINATIONS.SCHEDULE.EDIT,
							PERMISSIONS.EXAMINATIONS.SCHEDULE.ALL,
							PERMISSIONS.EXAMINATIONS.ALL,
						]}
						fallback={<span>{format(exam.status)}</span>}
					>
						<ExamStatusCell exam={exam} />
					</PermissionGuard>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const exam = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.EXAMINATIONS.SCHEDULE.VIEW,
								PERMISSIONS.EXAMINATIONS.SCHEDULE.ALL,
								PERMISSIONS.EXAMINATIONS.ALL,
							]}
						>
							<ExamDetailsAction id={exam.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.EXAMINATIONS.SCHEDULE.EDIT,
								PERMISSIONS.EXAMINATIONS.SCHEDULE.ALL,
								PERMISSIONS.EXAMINATIONS.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm" title={t("editTitle")}>
								<Link href={PATHS.EXAMINATIONS.SCHEDULE.EDIT(exam.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.EXAMINATIONS.SCHEDULE.DELETE,
								PERMISSIONS.EXAMINATIONS.SCHEDULE.ALL,
								PERMISSIONS.EXAMINATIONS.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(exam.id)}
								title={t("deleteTitle")}
								description={t("deleteDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && examToDelete === exam.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="icon-sm" title={t("deleteTitle")}>
										<Trash2 />
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
				<ExamFilterBar filter={filter} setFilter={setFilter}>
					<ExamCreate />
				</ExamFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.EXAMINATIONS.SCHEDULE.ALL,
							PERMISSIONS.EXAMINATIONS.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={exams || []}
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
		</Card>
	);
}

"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { Switch } from "@/shared/components/ui/switch";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Subject } from "@/shared/models/subject.model";
import { useAuthStore } from "@/shared/stores/authStore";
import { StatusEnum } from "@/shared/types/enums";
import { getLocalizedName } from "@/shared/utils/localization";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSubject, updateSubject } from "../hooks/use-subject-mutations";
import { useSubjects } from "../hooks/use-subjects";
import { SubjectCreate } from "./SubjectCreate";
import { SubjectDetailsSheet } from "./SubjectDetailsSheet";
import SubjectFilterBar from "./SubjectFilterBar";

export type SubjectFilter = {
	search: string;
	type: string[];
	group: string[];
	status: string[];
};

const initialFilters: SubjectFilter = { search: "", type: [], group: [], status: [] };

const formatLabel = (value: string) =>
	value
		.replaceAll("_", " ")
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());

function SubjectDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const t = useTranslations("Subjects");

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon-sm" title={t("subjectDetails")}>
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<SubjectDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

export default function SubjectList() {
	const [filter, setFilter] = useState<SubjectFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [subjectToChangeStatus, setSubjectToChangeStatus] = useState<Subject | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const t = useTranslations("Subjects");
	const tc = useTranslations("Common");
	const locale = useLocale();
	const { user } = useAuthStore((state) => state.auth);

	const { data: subjects, meta, isLoading } = useSubjects({
		page,
		limit,
		search: filter.search,
		type: filter.type,
		group: filter.group,
		status: filter.status,
	});

	const confirmDelete = async (id: string) => {
		setSubjectToDelete(id);
		setIsDeleting(true);
		try {
			await deleteSubject(id);
			toast.success("Subject deleted successfully");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setSubjectToDelete(null);
		}
	};

	const confirmStatusChange = async (subject: Subject, newStatus: boolean) => {
		setSubjectToChangeStatus(subject);
		setIsChangingStatus(true);
		try {
			const status = newStatus ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
			await updateSubject(subject.id, { status });
			toast.success(`Status updated to ${status}`);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsChangingStatus(false);
			setSubjectToChangeStatus(null);
		}
	};

	const columns: ColumnDef<Subject>[] = [
		{
			id: "name",
			header: t("subjectName"),
			cell: ({ row }) => <span className="font-medium">{getLocalizedName(row.original.name, locale)}</span>,
		},
		{
			id: "code",
			header: t("code"),
			cell: ({ row }) => <span className="font-medium">{row.original.code || "-"}</span>,
		},
		{
			id: "type",
			header: t("type"),
			cell: ({ row }) => <span>{formatLabel(row.original.type)}</span>,
		},
		{
			id: "group",
			header: t("group"),
			cell: ({ row }) => <span>{row.original.group ? formatLabel(row.original.group) : "-"}</span>,
		},
		{
			id: "classes",
			header: t("classes"),
			cell: ({ row }) => {
				const classes = row.original.classes;
				if (!classes.length) return <span className="text-muted-foreground">-</span>;

				return (
					<span className="text-sm">
						{classes
							.slice(0, 2)
							.map((item: any) => item.enName || "-")
							.join(", ")}
						{classes.length > 2 ? ` +${classes.length - 2}` : ""}
					</span>
				);
			},
		},
		{
			id: "marks",
			header: t("marks"),
			cell: ({ row }) => (
				<div className="flex flex-col text-sm">
					<span>
						{row.original.passMarks} / {row.original.fullMarks}
					</span>
					<span className="text-muted-foreground text-xs">
						{formatLabel(row.original.markDivision)}
					</span>
				</div>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const subject = row.original;
				const isActive = subject.status === StatusEnum.ACTIVE;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.ACADEMICS.SUBJECTS.EDIT,
							PERMISSIONS.ACADEMICS.SUBJECTS.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						]}
					>
						<ConfirmationModal
							onConfirm={() => confirmStatusChange(subject, !isActive)}
							title={t("statusChangeTitle")}
							description={isActive ? tc("changeToInactiveDesc") : tc("changeToActiveDesc")}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && subjectToChangeStatus?.id === subject.id}
						>
							<AlertDialogTrigger asChild>
								<div className="group flex w-fit cursor-pointer items-center gap-2">
									<Switch checked={isActive} className="pointer-events-none" />
									<span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
								</div>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</PermissionGuard>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const subject = row.original;
				return (
					<div className="flex flex-wrap items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.SUBJECTS.VIEW,
								PERMISSIONS.ACADEMICS.SUBJECTS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<SubjectDetailsAction id={subject.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.SUBJECTS.EDIT,
								PERMISSIONS.ACADEMICS.SUBJECTS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<Button asChild variant="outline" size="icon-sm">
								<Link href={PATHS.ACADEMICS.SUBJECTS.EDIT(subject.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.SUBJECTS.DELETE,
								PERMISSIONS.ACADEMICS.SUBJECTS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(subject.id)}
								title={t("deleteSubjectTitle")}
								description={t("deleteSubjectDesc")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && subjectToDelete === subject.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="icon-sm">
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
				<SubjectFilterBar filter={filter} setFilter={setFilter}>
					<SubjectCreate />
				</SubjectFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.SUBJECTS.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={subjects || []}
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

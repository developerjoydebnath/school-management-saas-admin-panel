"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { TOption } from "@/shared/components/form/FilterButton";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Switch } from "@/shared/components/ui/switch";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { Teacher } from "@/shared/models/teacher.model";
import { StatusEnum } from "@/shared/types/enums";
import { getLocalizedName } from "@/shared/utils/localization";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import TeacherFilterBar from "./TeacherFilterBar";
import TeacherForm from "./TeacherForm";

export type TeacherFilter = {
	search: string;
	base_role: TOption[];
	status: TOption[];
};

const initialFilters: TeacherFilter = { search: "", base_role: [], status: [] };

export default function TeacherList() {
	const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
	const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [teacherToChangeStatus, setTeacherToChangeStatus] = useState<Teacher | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const t = useTranslations("Teachers");
	const tc = useTranslations("Common");
	const locale = useLocale();
	const { data: subjectsData } = useSWR("/subjects");
	const [filter, setFilter] = useState<TeacherFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const {
		data: teachers,
		meta,
		isLoading,
		mutate,
	} = useTableData("/teachers", {
		// page,
		// limit,
		// ...filter,
	});

	const serializedTeachers = teachers?.map((teacher: any) => new Teacher(teacher));

	const confirmDelete = async (id: string) => {
		setTeacherToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/teachers/${id}`);
			toast.success("Teacher deleted successfully");
			mutate();
		} catch (err: any) {
			toast.error("Failed to delete teacher. Please try again.");
		} finally {
			setIsDeleting(false);
			setTeacherToDelete(null);
		}
	};

	const confirmStatusChange = async (teacher: Teacher, newStatus: boolean) => {
		setTeacherToChangeStatus(teacher);
		setIsChangingStatus(true);
		try {
			const status = newStatus ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
			await axios.patch(`/teachers/${teacher.id}`, { status });
			toast.success(`Status updated to ${status}`);
			mutate();
		} catch (err: any) {
			toast.error("Failed to update status.");
		} finally {
			setIsChangingStatus(false);
			setTeacherToChangeStatus(null);
		}
	};

	const columns: ColumnDef<Teacher>[] = [
		{
			id: "name",
			accessorKey: "name",
			header: t("teacherName"),
			cell: ({ row }) => (
				<span className="font-medium">{getLocalizedName(row.original.name, locale)}</span>
			),
		},
		{
			id: "email",
			accessorKey: "email",
			header: t("emailMobile"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="text-sm font-medium">{row.original.email}</span>
					<span className="text-muted-foreground text-xs">
						{row.original.mobileNumber}
					</span>
				</div>
			),
		},
		{
			id: "subjects",
			accessorKey: "subjects",
			header: t("subjects"),
			cell: ({ row }) => {
				const subjects = row.original.subjects;
				if (!subjects || subjects.length === 0)
					return <span className="text-muted-foreground">-</span>;
				return (
					<div className="flex max-w-[200px] flex-wrap items-center gap-1">
						{subjects.slice(0, 2).map((subjectId: string, idx: number) => {
							const subject = subjectsData?.find((s: any) => s.id === subjectId);
							return (
								<Badge
									key={idx}
									variant="secondary"
									className="h-5 rounded-sm px-1.5 py-0 text-[10px]"
								>
									{subject ? getLocalizedName(subject.name, locale) : subjectId}
								</Badge>
							);
						})}
						{subjects.length > 2 && (
							<Badge
								variant="secondary"
								className="h-5 rounded-sm px-1.5 py-0 text-[10px]"
							>
								+{subjects.length - 2}
							</Badge>
						)}
					</div>
				);
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const teacher = row.original;
				return (
					<div className="flex items-center gap-2">
						<ConfirmationModal
							onConfirm={() =>
								confirmStatusChange(teacher, teacher.status !== StatusEnum.ACTIVE)
							}
							title={t("statusChangeTitle")}
							description={
								teacher.status === StatusEnum.ACTIVE
									? tc("changeToInactiveDesc")
									: tc("changeToActiveDesc")
							}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && teacherToChangeStatus?.id === teacher.id}
						>
							<AlertDialogTrigger
								nativeButton={false}
								render={<Switch checked={teacher.status === StatusEnum.ACTIVE} />}
							/>
						</ConfirmationModal>
						<div
							className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
								teacher.status === StatusEnum.ACTIVE
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{teacher.status}
						</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const teacher = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.ALL,
								PERMISSIONS.STAFF.TEACHERS.ALL,
								PERMISSIONS.STAFF.TEACHERS.EDIT,
							]}
						>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={() => setEditingTeacher(teacher)}
							>
								<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.STAFF.ALL,
								PERMISSIONS.STAFF.TEACHERS.ALL,
								PERMISSIONS.STAFF.TEACHERS.DELETE,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(teacher.id)}
								title={t("deleteTeacherTitle")}
								description={t("deleteTeacherDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && teacherToDelete === teacher.id}
							>
								<AlertDialogTrigger
									render={
										<Button variant="destructive" size="icon-sm">
											<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
										</Button>
									}
								/>
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
		<Card className="p-4 shadow-none ring-0 sm:p-6">
			<CardHeader className="p-0">
				<TeacherFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable<Teacher>
					data={serializedTeachers || []}
					isLoading={isLoading}
					pagination={{
						page: meta.page,
						limit: meta.limit,
						total: meta.total,
						totalPages: meta.totalPages,
						onPageChange: setPage,
						onLimitChange: setLimit,
					}}
					columns={columns}
				/>
			</CardContent>

			<Dialog
				open={!!editingTeacher}
				onOpenChange={(open) => !open && setEditingTeacher(null)}
			>
				<DialogContent className="px-0">
					<DialogHeader className="px-6">
						<DialogTitle>
							{editingTeacher?.id ? t("editTeacherTitle") : t("addTeacherTitle")}
						</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh] px-4">
						{editingTeacher && (
							<TeacherForm
								initialData={editingTeacher}
								onSuccess={() => setEditingTeacher(null)}
							/>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
